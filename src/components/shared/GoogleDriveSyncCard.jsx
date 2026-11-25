import React, { useState, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import { 
  CloudIcon, 
  CloudOffIcon, 
  SyncIcon, 
  CheckCircleIcon, 
  LogOutIcon, 
  DownloadIcon, 
  UploadIcon,
  AlertCircleIcon,
  UserCircleIcon 
} from './Icons'

/**
 * Componente reutilizable para la tarjeta de sincronización Google Drive
 * Usa tokens CSS: --color-tertiary y --color-tertiary-contrast para el botón principal
 */
export const GoogleDriveSyncCard = ({ 
  variant = 'card', // 'card' | 'home' | 'settings'
  showTitle = true,
  showDescription = true,
  compact = false 
}) => {
  const { 
    user, 
    isConnected, 
    syncStatus, 
    lastSync, 
    error: authError, 
    connect, 
    disconnect, 
    syncNow 
  } = useAuth()
  
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false)
  const [restoreError, setRestoreError] = useState(null)

  // Formatear tiempo relativo
  const formatRelativeTime = useCallback((date) => {
    const now = new Date()
    const diff = now - new Date(date)
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'hace un momento'
    if (minutes < 60) return `hace ${minutes} min`
    if (hours < 24) return `hace ${hours} h`
    return `hace ${days} d`
  }, [])

  // Formatear hora HH:MM
  const formatTime = useCallback((date) => {
    return new Date(date).toLocaleTimeString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }, [])

  // Manejar conexión
  const handleConnect = async () => {
    try {
      await connect()
    } catch (err) {
      console.error('[GoogleDriveSyncCard] Error conectando:', err)
    }
  }

  // Manejar sincronización manual
  const handleSyncNow = async () => {
    try {
      await syncNow()
    } catch (err) {
      console.error('[GoogleDriveSyncCard] Error sincronizando:', err)
    }
  }

  // Manejar restauración desde Drive
  const handleRestoreFromDrive = async () => {
    setRestoreError(null)
    try {
      // Importar db dinámicamente para evitar dependencia circular
      const { db } = await import('../../services/db')
      const { syncFromDrive } = await import('../../services/googleDrive')
      await syncFromDrive(db)
      setShowRestoreConfirm(false)
    } catch (err) {
      console.error('[GoogleDriveSyncCard] Error restaurando:', err)
      setRestoreError(err.message)
    }
  }

  // Manejar desconexión
  const handleDisconnect = async () => {
    try {
      await disconnect()
      setShowRestoreConfirm(false)
    } catch (err) {
      console.error('[GoogleDriveSyncCard] Error desconectando:', err)
    }
  }

  // Renderizado para estado desconectado
  const renderDisconnected = () => (
    <div className="space-y-3">
      <div 
        className="p-4 rounded-lg" 
        style={{ 
          background: 'var(--color-card)', 
          border: 'var(--border-width) solid var(--color-card-border)' 
        }}
      >
        <div className="flex items-center gap-3 mb-3">
          <UserCircleIcon size={24} style={{ color: 'var(--color-tertiary)' }} />
          <div>
            <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>
              Modo Local Activo
            </div>
            <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              Tus datos se guardan solo en este navegador (IndexedDB)
            </div>
          </div>
        </div>
        {showDescription && (
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
            Conecta tu Google Drive para acceder a tus rutas, talleres, motos y temas desde cualquier dispositivo. 
            Solo MotoAtlas26 puede acceder a sus propios archivos (alcance 
            <code style={{ 
              fontSize: 'var(--font-size-xs)', 
              background: 'var(--color-card-hover)', 
              padding: '0.125rem 0.25rem', 
              borderRadius: 'var(--radius-sm)' 
            }}>
              drive.file
            </code>.)
          </p>
        )}
        <button
          onClick={handleConnect}
          disabled={syncStatus === 'syncing'}
          className="w-full py-2.5 font-bold rounded-lg text-sm flex items-center justify-center gap-2"
          style={{ 
            background: 'var(--color-tertiary)',
            color: 'var(--color-tertiary-contrast)',
            border: 'var(--border-width) solid var(--color-tertiary-border)'
          }}
        >
          <SyncIcon size={16} /> Conectar con Google Drive
        </button>
      </div>
    </div>
  )

  // Renderizado para estado conectado
  const renderConnected = () => (
    <div className="space-y-4">
      {/* User Info */}
      <div className="flex items-center gap-4 p-4 rounded-lg" 
        style={{ 
          background: 'var(--color-card)', 
          border: 'var(--border-width) solid var(--color-card-border)' 
        }}
      >
        {user?.picture && (
          <img 
            src={user.picture} 
            alt={user.name} 
            className="w-12 h-12 rounded-full border-2"
            style={{ borderColor: 'var(--color-tertiary-border)' }}
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
            {user?.name || user?.email}
          </div>
          <div className="text-sm truncate" style={{ color: 'var(--color-text-secondary)' }}>
            {user?.email}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
            background: syncStatus === 'synced' ? 'var(--color-success-bg)' :
                      syncStatus === 'syncing' ? 'var(--color-alert-bg)' :
                      syncStatus === 'error' ? 'var(--color-error-bg)' :
                      'var(--color-card-hover)',
            color: syncStatus === 'synced' ? 'var(--color-success-border)' :
                     syncStatus === 'syncing' ? 'var(--color-alert-border)' :
                     syncStatus === 'error' ? 'var(--color-error-border)' :
                     'var(--color-text-muted)',
            border: 'var(--border-width) solid',
            borderColor: syncStatus === 'synced' ? 'var(--color-success-border)' :
                         syncStatus === 'syncing' ? 'var(--color-alert-border)' :
                         syncStatus === 'error' ? 'var(--color-error-border)' :
                         'var(--color-card-border)'
          }}>
            {syncStatus === 'synced' && <CheckCircleIcon size={10} className="inline-block mr-1" />}
            {syncStatus === 'syncing' && <SyncIcon size={10} className="inline-block mr-1 spin" />}
            {syncStatus === 'error' && <AlertCircleIcon size={10} className="inline-block mr-1" />}
            {syncStatus === 'synced' ? 'Sincronizado' :
             syncStatus === 'syncing' ? 'Sincronizando...' :
             syncStatus === 'error' ? 'Error' : 'Pendiente'}
          </span>
        </div>
      </div>

      {/* Last Sync */}
      {lastSync && (
        <div className="text-sm flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
          <SyncIcon size={14} />
          <span>Sincronizado: {formatTime(lastSync)}</span>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={handleSyncNow}
          disabled={syncStatus === 'syncing'}
          className="flex-1 py-2.5 font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
          style={{ 
            background: 'var(--color-card)',
            color: 'var(--color-text-primary)',
            border: 'var(--border-width) solid var(--color-card-border)'
          }}
        >
          <SyncIcon size={16} /> {syncStatus === 'syncing' ? 'Sincronizando...' : 'Sincronizar ahora'}
        </button>
        
        <button
          onClick={() => setShowRestoreConfirm(true)}
          disabled={syncStatus === 'syncing'}
          className="flex-1 py-2.5 font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
          style={{ 
            background: 'var(--color-card)',
            color: 'var(--color-text-primary)',
            border: 'var(--border-width) solid var(--color-card-border)'
          }}
        >
          <DownloadIcon size={16} /> Restaurar desde Drive
        </button>
        
        <button
          onClick={handleDisconnect}
          disabled={syncStatus === 'syncing'}
          className="flex-1 py-2.5 font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
          style={{ 
            background: 'var(--color-error-bg)',
            color: 'var(--color-error-border)',
            border: 'var(--border-width) solid var(--color-error-border)'
          }}
        >
          <LogOutIcon size={16} /> Desconectar
        </button>
      </div>

      {/* Error display */}
      {(authError || restoreError) && (
        <div className="p-3 rounded-lg text-sm" style={{ 
          background: 'var(--color-error-bg)',
          border: 'var(--border-width) solid var(--color-error-border)',
          color: 'var(--color-error-border)'
        }}>
          {restoreError || authError}
        </div>
      )}

      {/* Confirmación inline para restaurar */}
      {showRestoreConfirm && (
        <div className="p-4 rounded-lg" style={{ 
          background: 'var(--color-alert-bg)',
          border: 'var(--border-width) solid var(--color-alert-border)'
        }}>
          <div className="text-sm mb-3" style={{ color: 'var(--color-text-primary)' }}>
            <strong>¿Restaurar desde Google Drive?</strong> Esto reemplazará todos los datos locales (rutas, talleres, motos, temas, preferencias) 
            con la versión guardada en la nube. Esta acción no se puede deshacer.
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleRestoreFromDrive}
              disabled={syncStatus === 'syncing'}
              className="flex-1 py-2 font-semibold rounded-lg text-sm flex items-center justify-center gap-2"
              style={{ 
                background: 'var(--color-alert-border)',
                color: 'var(--color-alert-contrast)',
                border: 'var(--border-width) solid var(--color-alert-border)'
              }}
            >
              <DownloadIcon size={14} /> Confirmar restauración
            </button>
            <button
              onClick={() => setShowRestoreConfirm(false)}
              className="flex-1 py-2 font-semibold rounded-lg text-sm flex items-center justify-center gap-2"
              style={{ 
                background: 'var(--color-card)',
                color: 'var(--color-text-primary)',
                border: 'var(--border-width) solid var(--color-card-border)'
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )

  // Estilos base del contenedor
  const containerStyles = {
    width: '100%',
    maxWidth: variant === 'home' ? '520px' : '100%',
    padding: compact ? '1rem' : '1.5rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: compact ? '0.5rem' : '0.75rem',
    background: 'var(--color-card)',
    border: 'var(--border-width) solid var(--color-card-border)',
    borderRadius: 'var(--radius-card)',
    boxSizing: 'border-box'
  }

  if (variant === 'home') {
    return (
      <div className="home-sync-card" style={containerStyles}>
        {showTitle && (
          <>
            <div className="home-sync-icon">
              {isConnected ? <CloudIcon size={36} /> : <CloudOffIcon size={36} />}
            </div>
            <h3 className="home-sync-title">Sincronización Google Drive</h3>
          </>
        )}
        {showDescription && !isConnected && (
          <p className="home-sync-desc">
            Conecta tu cuenta para sincronizar rutas, talleres, motos y temas entre dispositivos.
          </p>
        )}
        {isConnected ? renderConnected() : renderDisconnected()}
      </div>
    )
  }

  // Para variant 'card' o 'settings' - usar SettingCard wrapper
  return (
    <div style={{ width: '100%' }}>
      {isConnected ? renderConnected() : renderDisconnected()}
    </div>
  )
}

export default GoogleDriveSyncCard