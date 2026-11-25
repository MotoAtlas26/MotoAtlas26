import React, { createContext, useContext, useState, useEffect, useRef } from 'react'
import { db } from '../services/db'
import {
  signIn,
  signOut,
  getCurrentUser,
  hasStoredSession,
  restoreSession,
  syncFromDrive,
  syncToDrive,
  getConnectionStatus,
  getLastSync
} from '../services/googleDrive'

const AuthContext = createContext()

/**
 * Hook personalizado para acceder al contexto de autenticación
 */
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}

/**
 * Provider de autenticación con Google Drive
 * - Maneja login/logout
 * - Sincronización inicial al conectar (si Drive está vacío, sube datos locales)
 * - Auto-sync con debounce tras cambios en la DB
 * - Persistencia de sesión en localStorage
 */
export const AuthProvider = ({ children }) => {
  const [clientId, setClientId] = useState(null)
  const [user, setUser] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [syncStatus, setSyncStatus] = useState('idle') // 'idle' | 'syncing' | 'synced' | 'error'
  const [lastSync, setLastSync] = useState(null)
  const [error, setError] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)

  // Timer para debounce de auto-sync
  const syncTimerRef = useRef(null)

  // Detectar si la app está instalada como PWA
  useEffect(() => {
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://')

    setIsInstalled(isStandaloneMode)
  }, [])

  // Cargar Client ID desde variable de entorno
  useEffect(() => {
    const clientIdFromEnv = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (clientIdFromEnv) {
      setClientId(clientIdFromEnv)
    } else {
      console.warn('[AuthContext] VITE_GOOGLE_CLIENT_ID no configurado. Google Drive no disponible.')
    }
  }, [])

  // Restaurar sesión guardada al montar
  useEffect(() => {
    const restoreStoredSession = async () => {
      if (!clientId) return
      
      try {
        const storedUser = await restoreSession()
        if (storedUser) {
          setUser(storedUser)
          setIsConnected(true)
          
          // Cargar último sync desde localStorage
          const lastSyncDate = getLastSync()
          if (lastSyncDate) {
            setLastSync(lastSyncDate)
          }
          
          console.log('[AuthContext] Sesión restaurada desde localStorage:', storedUser.email)
        }
      } catch (err) {
        console.warn('[AuthContext] No se pudo restaurar sesión:', err)
      }
    }

    restoreStoredSession()
  }, [clientId])

  // Sincronización inicial al conectar (después de signIn exitoso)
  useEffect(() => {
    if (!isConnected || !clientId) return

    const performInitialSync = async () => {
      try {
        setSyncStatus('syncing')
        setError(null)

        // Verificar estado de conexión
        const status = getConnectionStatus()
        if (!status.hasToken) {
          console.log('[AuthContext] No hay token de acceso, esperando signIn...')
          return
        }

        // Buscar carpeta y archivo
        const { ensureMotoAtlasFolder, findOrCreateDBFile, readDBFile } = await import('../services/googleDrive')
        const folder = await ensureMotoAtlasFolder()
        const file = await findOrCreateDBFile(folder.id)

        // Leer archivo para ver si tiene contenido
        const data = await readDBFile(file.id)
        
        // Si el archivo es nuevo/vacío y hay datos locales, subir primero
        if (!data || Object.keys(data).length === 0) {
          console.log('[AuthContext] Archivo nuevo/vacío en Drive. Subiendo datos locales...')
          await syncToDrive(db)
        } else {
          // Si el archivo existe, leer y restaurar
          console.log('[AuthContext] Archivo existe en Drive. Sincronizando desde Drive...')
          await syncFromDrive(db)
        }

        setSyncStatus('synced')
        setLastSync(new Date())
      } catch (err) {
        console.error('[AuthContext] Error en sincronización inicial:', err)
        setError(err.message)
        setSyncStatus('error')
      }
    }

    performInitialSync()
  }, [isConnected, clientId])

  // Auto-sync con debounce tras cambios en la DB (2.5 segundos)
  useEffect(() => {
    if (!isConnected || !clientId) return

    const debouncedSync = () => {
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current)
      }

      syncTimerRef.current = setTimeout(async () => {
        try {
          const status = getConnectionStatus()
          if (!status.hasToken) {
            console.log('[AuthContext] No hay token para auto-sync')
            return
          }
          
          setSyncStatus('syncing')
          await syncToDrive(db)
          setSyncStatus('synced')
          setLastSync(new Date())
        } catch (err) {
          console.error('[AuthContext] Error en auto-sync:', err)
          setSyncStatus('error')
        }
      }, 2500) // 2.5 segundos de debounce
    }

    // Suscribirse a eventos de cambio en la DB
    const handleDBChange = () => {
      debouncedSync()
    }

    // También escuchar cambios en preferencias visuales
    const handlePreferencesChange = () => {
      debouncedSync()
    }

    window.addEventListener('db:changed', handleDBChange)
    window.addEventListener('storage', handlePreferencesChange)

    return () => {
      window.removeEventListener('db:changed', handleDBChange)
      window.removeEventListener('storage', handlePreferencesChange)
      if (syncTimerRef.current) {
        clearTimeout(syncTimerRef.current)
      }
    }
  }, [isConnected, clientId])

  // Funciones públicas
  const connect = async () => {
    if (!clientId) {
      throw new Error('VITE_GOOGLE_CLIENT_ID no configurado')
    }

    try {
      setError(null)
      const user = await signIn(clientId)
      setUser(user)
      setIsConnected(true)
      setSyncStatus('idle')
    } catch (err) {
      setError(err.message)
      setIsConnected(false)
      setUser(null)
      throw err
    }
  }

  const disconnect = async () => {
    try {
      await signOut()
      setUser(null)
      setIsConnected(false)
      setSyncStatus('idle')
      setLastSync(null)
      setError(null)
    } catch (err) {
      console.error('[AuthContext] Error al cerrar sesión:', err)
      setError(err.message)
    }
  }

  const syncNow = async () => {
    if (!isConnected) {
      throw new Error('No estás conectado a Google Drive')
    }

    try {
      setSyncStatus('syncing')
      setError(null)
      await syncToDrive(db)
      setSyncStatus('synced')
      setLastSync(new Date())
    } catch (err) {
      console.error('[AuthContext] Error en sync manual:', err)
      setError(err.message)
      setSyncStatus('error')
      throw err
    }
  }

  const value = {
    clientId,
    user,
    isConnected,
    syncStatus,
    lastSync,
    error,
    isInstalled,
    connect,
    disconnect,
    syncNow
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}