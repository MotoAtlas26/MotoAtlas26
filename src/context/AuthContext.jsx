import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { db } from '../services/db'
import {
  loadSessionFromStorage,
  syncFromDrive,
  syncToDrive,
  getConnectionStatus,
  getLastSync,
  renewTokenSilently,
  clearSessionFromStorage
} from '../services/googleDrive'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}

export const syncNow = async (context) => {
  const { connect, uploadBackup, setSyncStatus, db } = context
  setSyncStatus('syncing')
  try {
    await uploadBackup(db)
    setSyncStatus('synced')
  } catch (err) {
    console.error('[AuthContext] syncNow error:', err)
    if (err.message.includes('401') || err.message.includes('token') || err.message.includes('unauthorized') || err.message.includes('No hay token de acceso')) {
      try {
        await connect()
        await uploadBackup(db)
        setSyncStatus('synced')
      } catch (renewErr) {
        setSyncStatus('error')
        console.error('[AuthContext] syncNow falló tras connect():', renewErr)
        throw renewErr
      }
    } else {
      setSyncStatus('error')
      console.error('[AuthContext] syncNow falló:', err)
      throw err
    }
  }
}

export const restoreFromDrive = async (context) => {
  const { connect, downloadBackup, setSyncStatus, db } = context
  setSyncStatus('syncing')
  try {
    await downloadBackup(db)
    setSyncStatus('synced')
    window.dispatchEvent(new Event('motoatlas:drive-synced'))
    window.dispatchEvent(new Event('db:changed'))
  } catch (err) {
    console.error('[AuthContext] restoreFromDrive error:', err)
    if (err.message.includes('401') || err.message.includes('token') || err.message.includes('unauthorized') || err.message.includes('No hay token de acceso')) {
      try {
        await connect()
        await downloadBackup(db)
        setSyncStatus('synced')
      } catch (renewErr) {
        setSyncStatus('error')
        console.error('[AuthContext] restoreFromDrive falló tras connect():', renewErr)
        throw renewErr
      }
    } else {
      setSyncStatus('error')
      console.error('[AuthContext] restoreFromDrive falló:', err)
      throw err
    }
  }
}

export const AuthProvider = ({ children }) => {
  const [clientId, setClientId] = useState(null)
  const [user, setUser] = useState(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSync, setLastSync] = useState(null)
  const [error, setError] = useState(null)
  const [isInstalled, setIsInstalled] = useState(false)
  const [needsReauth, setNeedsReauth] = useState(false)
  const [syncStatus, setSyncStatus] = useState('idle')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsSyncing(false)
    setSyncStatus('idle')
  }, [])

  const syncTimerRef = useRef(null)
  const initDoneRef = useRef(false)

  const debouncedSync = useCallback(() => {
    if (syncTimerRef.current) {
      clearTimeout(syncTimerRef.current)
    }

    syncTimerRef.current = setTimeout(async () => {
      if (needsReauth) return
      
      try {
        const { getConnectionStatus, syncToDrive } = await import('../services/googleDrive')
        const status = getConnectionStatus()
        if (!status.hasToken) return
        
        setIsSyncing(true)
        await syncToDrive(db)
        setLastSync(new Date())
      } catch (err) {
        console.error('[AuthContext] Error en auto-sync:', err)
        if (err.message.includes('401') || err.message.includes('token') || err.message.includes('unauthorized')) {
          setNeedsReauth(true)
        }
      } finally {
        setIsSyncing(false)
      }
    }, 2500)
  }, [db, needsReauth, setLastSync, setNeedsReauth])

  useEffect(() => {
    const isStandaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://')

    setIsInstalled(isStandaloneMode)
  }, [])

  useEffect(() => {
    const clientIdFromEnv = import.meta.env.VITE_GOOGLE_CLIENT_ID
    if (clientIdFromEnv) {
      setClientId(clientIdFromEnv)
    } else {
      console.warn('[AuthContext] VITE_GOOGLE_CLIENT_ID no configurado.')
    }
  }, [])

  useEffect(() => {
    if (initDoneRef.current) return
    initDoneRef.current = true

    const initAuth = async () => {
      const storedSession = loadSessionFromStorage()
      if (storedSession && storedSession.connected && storedSession.user) {
        setUser(storedSession.user)
        setIsConnected(true)
        
        const lastSyncDate = getLastSync()
        if (lastSyncDate) setLastSync(lastSyncDate)
        
        try {
          const { accessToken: driveAccessToken, getConnectionStatus } = await import('../services/googleDrive')
          const status = getConnectionStatus()
          if (status.hasToken && driveAccessToken) {
            // accessToken = driveAccessToken
          }
        } catch (err) {
          console.warn('[AuthContext] No se pudo sincronizar accessToken:', err)
        }
        
        const now = Date.now()
        const expiresAt = storedSession.expiresAt || 0
        if (now >= expiresAt - 120000) {
          setNeedsReauth(true)
        }
      }
    }
    initAuth()
  }, [])

  const connect = async () => {
    setIsLoading(true)
    try {
      const { initGoogleClient } = await import('../services/googleDrive')
      const client = initGoogleClient(clientId)
      client.requestAccessToken()
      setIsConnected(true)
      setNeedsReauth(false)
    } catch (err) {
      console.error('[AuthContext] Error conectando:', err)
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = async () => {
    clearSessionFromStorage()
    setIsConnected(false)
    setUser(null)
    setLastSync(null)
    setSyncStatus('idle')
  }

  const reconnectWithConsent = async () => {
    const { renewTokenSilently } = await import('../services/googleDrive')
    const success = await renewTokenSilently()
    if (success) {
      setNeedsReauth(false)
    } else {
      await connect()
    }
  }

  const uploadBackup = async (db) => {
    const { syncToDrive } = await import('../services/googleDrive')
    await syncToDrive(db)
    setLastSync(new Date())
  }

  const downloadBackup = async (db) => {
    const { syncFromDrive } = await import('../services/googleDrive')
    await syncFromDrive(db)
    setLastSync(new Date())
  }

  return (
    <AuthContext.Provider value={{
      isConnected,
      needsReauth,
      isSyncing,
      isLoading,
      user,
      lastSync,
      error,
      connect,
      disconnect,
      reconnectWithConsent,
      syncStatus,
      setSyncStatus,
      uploadBackup,
      downloadBackup,
      debouncedSync
    }}>
      {children}
    </AuthContext.Provider>
  )
}
