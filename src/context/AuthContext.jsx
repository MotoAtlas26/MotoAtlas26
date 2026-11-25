import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { db } from '../services/db'
import {
  signIn,
  signOut,
  getCurrentUser,
  loadSessionFromStorage,
  syncFromDrive,
  syncToDrive,
  getConnectionStatus,
  getLastSync,
  ensureValidToken,
  renewTokenSilently,
  forceReconnect,
  clearSessionFromStorage
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
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState(null)
  const [error, setError] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [needsReauth, setNeedsReauth] = useState(false)
  const [syncStatus, setSyncStatus] = useState('idle') // 'idle' | 'syncing' | 'synced' | 'error'

  // Timer para debounce de auto-sync
  const syncTimerRef = useRef(null)
  const initDoneRef = useRef(false)

  // Debounced sync function (top-level hook, stable reference)
  const debouncedSync = useCallback(() => {
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current)
    }

    syncTimerRef.current = setTimeout(async () => {
      // No sincronizar si la sesión necesita reautenticación
      if (needsReauth) {
        console.log('[AuthContext] Auto-sync omitido: sesión necesita reautenticación')
        return
      }
      
      try {
        const { getConnectionStatus, syncToDrive } = await import('../services/googleDrive')
        const status = getConnectionStatus()
        if (!status.hasToken) {
          console.log('[AuthContext] No hay token para auto-sync')
          return
        }
        
        setIsSyncing(true)
        await syncToDrive(db)
        setLastSync(new Date())
      } catch (err) {
        console.error('[AuthContext] Error en auto-sync:', err)
        // NO desconectar en error de auto-sync - mantener sesión
        // Si es 401, marcar para renovación
        if (err.message.includes('401') || err.message.includes('token') || err.message.includes('unauthorized')) {
          setNeedsReauth(true)
        }
      } finally {
        setIsSyncing(false)
      }
    }, 2500) // 2.5 segundos de debounce
  }, [db, needsReauth, setLastSync, setNeedsReauth])

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

  // Inicialización UNA SOLA VEZ al montar: restaurar sesión desde localStorage e inicializar Google Client
  useEffect(() => {
    if (initDoneRef.current) return
    initDoneRef.current = true

    const initAuth = async () => {
      // 1. Restaurar sesión desde localStorage (síncrono)
      const storedSession = loadSessionFromStorage()
      if (storedSession && storedSession.connected && storedSession.user) {
        setUser(storedSession.user)
        setIsConnected(true)
        
        // Cargar último sync desde localStorage
        const lastSyncDate = getLastSync()
        if (lastSyncDate) {
          setLastSync(lastSyncDate)
        }
        
        // Verificar si el token está caducado
        const now = Date.now()
        const expiresAt = storedSession.expiresAt || 0
        if (now >= expiresAt - 120000) {
          // Token caducado o a punto de caducar - marcar para renovación
          setNeedsReauth(true)
          console.log('[AuthContext] Sesión restaurada, token caducado - se renovará al usar')
        } else {
          console.log('[AuthContext] Sesión restaurada desde localStorage (token válido):', storedSession.user.email)
        }
      }

      // 2. Inicializar cliente Google si hay clientId
      const currentClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
      if (currentClientId) {
        try {
          const { initGoogleClient } = await import('../services/googleDrive')
          initGoogleClient(currentClientId)
          
          // Si teníamos sesión guardada y token válido, verificar que sigue funcionando
          if (storedSession && storedSession.connected && storedSession.user && !needsReauth) {
            const hasValidToken = await ensureValidToken()
            if (!hasValidToken) {
              setNeedsReauth(true)
              console.log('[AuthContext] Token no válido tras init, marcado para renovación')
            }
          }
        } catch (err) {
          console.warn('[AuthContext] Error inicializando Google Client:', err)
          // NO desconectar - mantener estado de localStorage
        }
      }
    }

    initAuth()
  }, []) // Solo al montar

  // Sincronización inicial al conectar (después de signIn exitoso)
  useEffect(() => {
    if (!isConnected || !clientId) return

    let cancelled = false

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
        
        if (cancelled) return

        // Si el archivo es nuevo/vacío y hay datos locales, subir primero
        if (!data || Object.keys(data).length === 0) {
          console.log('[AuthContext] Archivo nuevo/vacío en Drive. Subiendo datos locales...')
          await syncToDrive(db)
        } else {
          // Si el archivo existe, leer y restaurar
          console.log('[AuthContext] Archivo existe en Drive. Sincronizando desde Drive...')
          await syncFromDrive(db)
        }

        if (cancelled) return
        setSyncStatus('synced')
        setLastSync(new Date())
      } catch (err) {
        if (cancelled) return
        console.error('[AuthContext] Error en sincronización inicial:', err)
        // NO desconectar en error de sync inicial - mantener sesión
        // Si es 401, marcar para renovación
        if (err.message.includes('401') || err.message.includes('token') || err.message.includes('unauthorized')) {
          setNeedsTokenRenewal(true)
        }
        setError(err.message)
        setSyncStatus('error')
      }
    }

    performInitialSync()

    return () => {
      cancelled = true
    }
  }, [isConnected, clientId])

  // Auto-sync con debounce tras cambios en la DB (2.5 segundos)
  useEffect(() => {
    if (!isConnected || !clientId) return

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
  }, [isConnected, clientId, debouncedSync, needsReauth])

  // Funciones públicas
  const connect = async () => {
    if (!clientId) {
      throw new Error('VITE_GOOGLE_CLIENT_ID no configurado')
    }

    try {
      setError(null)
      setNeedsReauth(false)
      const user = await signIn(clientId)
      setUser(user)
      setIsConnected(true)
      setIsSyncing(false)
    } catch (err) {
      // NO desconectar ni limpiar localStorage en error de conexión
      // El usuario puede reintentar
      setError(err.message)
      throw err
    }
  }

  // Renovar token manualmente (cuando el usuario pulsa en el aviso de sesión caducada)
  const renewSession = async () => {
    if (!clientId) {
      throw new Error('VITE_GOOGLE_CLIENT_ID no configurado')
    }

    try {
      setError(null)
      const { renewTokenSilently, getCurrentUser, forceReconnect } = await import('../services/googleDrive')
      const renewed = await renewTokenSilently()
      if (renewed) {
        const user = await getCurrentUser()
        setUser(user)
        setNeedsReauth(false)
        setIsSyncing(false)
        return user
      } else {
        // No desconectar - mantener sesión guardada, solo marcar para renovación
        setNeedsReauth(true)
        throw new Error('No se pudo renovar la sesión silenciosamente. Pulsa "Reconectar sesión" para autorizar.')
      }
    } catch (err) {
      setError(err.message)
      setNeedsReauth(true)
      throw err
    }
  }

  // Reconexión forzada con interacción del usuario (prompt: 'consent')
  const reconnectWithConsent = async () => {
    if (!clientId) {
      throw new Error('VITE_GOOGLE_CLIENT_ID no configurado')
    }

    try {
      setError(null)
      const { forceReconnect, getCurrentUser } = await import('../services/googleDrive')
      const user = await forceReconnect(clientId)
      setUser(user)
      setIsConnected(true)
      setNeedsReauth(false)
      setIsSyncing(false)
      return user
    } catch (err) {
      setError(err.message)
      setNeedsReauth(true)
      throw err
    }
  }

  const disconnect = async () => {
    try {
      await signOut() // signOut limpia localStorage
      setUser(null)
      setIsConnected(false)
      setIsSyncing(false)
      setLastSync(null)
      setError(null)
      setNeedsReauth(false)
    } catch (err) {
      console.error('[AuthContext] Error al cerrar sesión:', err)
      // Aun en error, limpiar estado local
      setUser(null)
      setIsConnected(false)
      setIsSyncing(false)
      setLastSync(null)
      setNeedsReauth(false)
      setError(err.message)
    }
  }

  const uploadBackup = async () => {
    if (!isConnected) {
      throw new Error('No estás conectado a Google Drive')
    }
    if (needsReauth) {
      throw new Error('La sesión ha caducado. Renueva la sesión antes de sincronizar.')
    }

    try {
      setIsSyncing(true)
      setError(null)
      await syncToDrive(db)
      setLastSync(new Date())
    } catch (err) {
      console.error('[AuthContext] Error en sync manual:', err)
      // NO desconectar en error de sync - mantener sesión
      // Si es 401, marcar para renovación
      if (err.message.includes('401') || err.message.includes('token') || err.message.includes('unauthorized')) {
        setNeedsReauth(true)
      }
      setError(err.message)
      throw err
    } finally {
      setIsSyncing(false)
    }
  }

  const downloadBackup = async () => {
    if (!isConnected) {
      throw new Error('No estás conectado a Google Drive')
    }
    if (needsReauth) {
      throw new Error('La sesión ha caducado. Renueva la sesión antes de restaurar.')
    }

    try {
      setIsSyncing(true)
      setError(null)
      await syncFromDrive(db)
      setLastSync(new Date())
    } catch (err) {
      console.error('[AuthContext] Error en restore manual:', err)
      // NO desconectar en error de sync - mantener sesión
      // Si es 401, marcar para renovación
      if (err.message.includes('401') || err.message.includes('token') || err.message.includes('unauthorized')) {
        setNeedsReauth(true)
      }
      setError(err.message)
      throw err
    } finally {
      setIsSyncing(false)
    }
  }

  const clearError = () => {
    setError(null)
  }

  const value = {
    clientId,
    user,
    isConnected,
    isSyncing,
    lastSync,
    error,
    isInstalled,
    needsReauth,
    syncStatus,
    setSyncStatus,
    connect,
    disconnect,
    uploadBackup,
    downloadBackup,
    renewSession,
    reconnectWithConsent,
    clearError
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export { AuthContext }