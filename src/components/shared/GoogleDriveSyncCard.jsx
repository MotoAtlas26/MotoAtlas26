import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useDatabase } from '../../hooks/useDatabase';

export function GoogleDriveSyncCard({ showTitle = true }) {
  const { db } = useDatabase();
  const {
    isConnected,
    needsReauth,
    isSyncing,
    user,
    lastSync,
    error,
    connect,
    disconnect,
    renewSession,
    uploadBackup,
    downloadBackup,
    clearError,
  } = useContext(AuthContext);
  const { reconnectWithConsent } = useContext(AuthContext);

  const [syncStatus, setSyncStatus] = useState('idle'); // 'idle' | 'syncing' | 'success' | 'error'
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  // Listen for drive-synced event to refresh UI
  useEffect(() => {
    const handleSynced = () => {
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    };
    window.addEventListener('motoatlas:drive-synced', handleSynced);
    return () => window.removeEventListener('motoatlas:drive-synced', handleSynced);
  }, []);

  const handleConnect = async () => {
    setSyncStatus('syncing');
    try {
      await connect();
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (err) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleRenewSession = async () => {
    setSyncStatus('syncing');
    try {
      // Usar reconnectWithConsent que fuerza interacción del usuario (prompt: 'consent')
      await reconnectWithConsent();
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (err) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    setSyncStatus('idle');
  };

  const handleSyncNow = async () => {
    if (!db) return;
    setSyncStatus('syncing');
    try {
      await uploadBackup(db);
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (err) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleRestore = async () => {
    if (!db) return;
    setShowRestoreConfirm(true);
  };

  const handleRestoreConfirm = async () => {
    if (!db) return;
    setSyncStatus('syncing');
    setShowRestoreConfirm(false);
    try {
      await downloadBackup(db);
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (err) {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const formatLastSynced = (timestamp) => {
    if (!timestamp) return 'Nunca';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ============================================
  // CASO A — Desconectado (!isConnected)
  // ============================================
  if (!isConnected) {
    return (
      <div className="card google-drive-sync-card">
        {showTitle && (
          <div className="card-header">
            <h3 className="card-title">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
                <path d="M12 8v4l3 3" />
              </svg>
              Sincronización Google Drive
            </h3>
          </div>
        )}
        <div className="card-body">
          <div className="sync-status disconnected">
            <span className="status-badge badge-local">Modo Local Activo</span>
            <p className="status-text">Tus datos se guardan solo en este dispositivo</p>
          </div>
          <button
            className="btn btn-primary btn-block"
            onClick={handleConnect}
            disabled={syncStatus === 'syncing'}
          >
            {syncStatus === 'syncing' ? 'Conectando...' : 'Conectar con Google Drive'}
          </button>
          {error && (
            <p className="error-message" role="alert">{error}</p>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // CASO B — Conectado con sesión caducada (isConnected && needsReauth)
  // ============================================
  if (isConnected && needsReauth) {
    return (
      <div className="card google-drive-sync-card">
        {showTitle && (
          <div className="card-header">
            <h3 className="card-title">
              <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                <path d="M12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
                <path d="M12 8v4l3 3" />
              </svg>
              Sincronización Google Drive
            </h3>
          </div>
        )}
        <div className="card-body">
          <div className="user-profile">
            {user?.picture && (
              <img src={user.picture} alt={user.name} className="user-avatar" />
            )}
            <div className="user-info">
              <div className="user-name-row" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span className="user-name">{user?.name || 'Usuario desconocido'}</span>
                <span className="status-badge badge-expired">Sesión caducada</span>
              </div>
              <span className="user-email">{user?.email || ''}</span>
            </div>
          </div>

          <div className="sync-warning">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginRight: '0.5rem' }}>
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <p>Tu sesión de Google Drive ha caducado. Pulsa "Reconectar sesión" para renovar el acceso.</p>
          </div>

          <div className="action-buttons">
            <button
              className="btn btn-primary"
              onClick={handleRenewSession}
              disabled={syncStatus === 'syncing'}
            >
              {syncStatus === 'syncing' ? 'Renovando...' : 'Reconectar sesión'}
            </button>
            <button
              className="btn btn-outline"
              onClick={handleDisconnect}
              disabled={syncStatus === 'syncing'}
            >
              Desconectar
            </button>
          </div>

          {error && (
            <p className="error-message" role="alert">{error}</p>
          )}
        </div>
      </div>
    );
  }

  // ============================================
  // CASO C — Conectado y activo (isConnected && !needsReauth)
  // ============================================
  return (
    <div className="card google-drive-sync-card">
      {showTitle && (
        <div className="card-header">
          <h3 className="card-title">
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
              <path d="M12 8v4l3 3" />
            </svg>
            Sincronización Google Drive
          </h3>
        </div>
      )}
      <div className="card-body">
        <div className="user-profile">
          {user?.picture && (
            <img src={user.picture} alt={user.name} className="user-avatar" />
          )}
          <div className="user-info">
            <div className="user-name-row">
              <span className="user-name">{user?.name || 'Usuario desconocido'}</span>
              <span className={`status-badge ${isSyncing ? 'badge-syncing' : 'badge-connected'}`}>
                {isSyncing ? 'Sincronizando...' : 'Conectado'}
              </span>
            </div>
            <span className="user-email">{user?.email || ''}</span>
          </div>
        </div>

        <div className="sync-info">
          <div className="sync-item">
            <span className="sync-label">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0, marginRight: '0.35rem' }}>
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              Última sincronización
            </span>
            <span className="sync-value">{formatLastSynced(lastSync)}</span>
          </div>
          <div className="sync-item">
            <span className="sync-label">Estado</span>
            <span className={`sync-value sync-status-text ${syncStatus}`}>
              {syncStatus === 'syncing' && 'Sincronizando...'}
              {syncStatus === 'success' && 'Sincronizado'}
              {syncStatus === 'error' && 'Error de sincronización'}
              {syncStatus === 'idle' && 'Al día'}
            </span>
          </div>
        </div>

        <div className="action-buttons">
          <button
            className="btn btn-primary"
            onClick={handleSyncNow}
            disabled={isSyncing || syncStatus === 'syncing'}
          >
            {isSyncing || syncStatus === 'syncing' ? 'Sincronizando...' : 'Sincronizar ahora'}
          </button>
          <button
            className="btn btn-outline"
            onClick={handleRestore}
            disabled={isSyncing || syncStatus === 'syncing'}
          >
            Restaurar desde Drive
          </button>
          <button
            className="btn btn-outline btn-danger"
            onClick={handleDisconnect}
            disabled={isSyncing || syncStatus === 'syncing'}
          >
            Desconectar
          </button>
        </div>

        {error && (
          <p className="error-message" role="alert">{error}</p>
        )}

        {/* Restore confirmation modal */}
        {showRestoreConfirm && (
          <div className="modal-overlay" onClick={() => setShowRestoreConfirm(false)}>
            <div className="modal confirm-modal" onClick={(e) => e.stopPropagation()}>
              <h4>Confirmar restauración</h4>
              <p>Esto reemplazará todos los datos locales con la copia de Google Drive. ¿Continuar?</p>
              <div className="modal-actions">
                <button
                  className="btn btn-outline"
                  onClick={() => setShowRestoreConfirm(false)}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleRestoreConfirm}
                  disabled={syncStatus === 'syncing'}
                >
                  Restaurar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}