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
    reconnectWithConsent,
    syncStatus,
    setSyncStatus,
  } = useContext(AuthContext);

  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);

  // Listen for drive-synced event to refresh UI
  useEffect(() => {
    const handleSynced = () => {
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    };
    window.addEventListener('motoatlas:drive-synced', handleSynced);
    return () => window.removeEventListener('motoatlas:drive-synced', handleSynced);
  }, [setSyncStatus]);

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

  // Shared styles for centered layout
  const cardStyle = {
    maxWidth: '420px',
    margin: '0 auto',
    textAlign: 'center',
  };

  const headerStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1.5rem',
  };

  const iconStyle = {
    width: '36px',
    height: '36px',
    flexShrink: 0,
    color: 'var(--color-primary, #3b82f6)',
  };

  const titleStyle = {
    margin: 0,
    fontSize: '1.125rem',
    fontWeight: 600,
    color: 'var(--color-text, #1f2937)',
  };

  const badgeStyle = (variant) => {
    const base = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.35rem',
      padding: '0.35rem 0.75rem',
      borderRadius: '9999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      flexShrink: 0,
    };
    const variants = {
      connected: { background: '#dcfce7', color: '#166534' },
      syncing: { background: '#dbeafe', color: '#1e40af' },
      expired: { background: '#fef3c7', color: '#92400e' },
      local: { background: '#e5e7eb', color: '#374151' },
    };
    return { ...base, ...variants[variant] };
  };

  const userCardStyle = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '1rem',
    background: 'var(--color-surface, #f9fafb)',
    borderRadius: '12px',
    marginBottom: '1.25rem',
    border: '1px solid var(--color-border, #e5e7eb)',
  };

  const avatarStyle = {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover',
    flexShrink: 0,
  };

  const userNameStyle = {
    fontWeight: 600,
    fontSize: '0.9375rem',
    color: 'var(--color-text, #1f2937)',
  };

  const userEmailStyle = {
    fontSize: '0.8125rem',
    color: 'var(--color-text-muted, #6b7280)',
  };

  const syncInfoStyle = {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1.25rem',
    padding: '0.75rem 1rem',
    background: 'var(--color-surface, #f9fafb)',
    borderRadius: '10px',
    border: '1px solid var(--color-border, #e5e7eb)',
    textAlign: 'left',
  };

  const syncItemStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
  };

  const syncLabelStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.8125rem',
    color: 'var(--color-text-muted, #6b7280)',
    flexShrink: 0,
  };

  const syncValueStyle = {
    fontSize: '0.8125rem',
    fontWeight: 500,
    color: 'var(--color-text, #1f2937)',
    textAlign: 'right',
  };

  const statusTextStyle = (status) => {
    const colors = {
      syncing: '#1e40af',
      success: '#166534',
      error: '#991b1b',
      idle: '#374151',
    };
    return { color: colors[status] || colors.idle };
  };

  const buttonsStyle = {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.75rem',
    flexWrap: 'wrap',
    marginTop: '0.5rem',
  };

  const btnPrimaryStyle = {
    background: 'var(--color-primary, #3b82f6)',
    color: 'white',
    border: 'none',
    padding: '0.625rem 1.25rem',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'background 0.2s, opacity 0.2s',
  };

  const btnSecondaryStyle = {
    background: 'var(--color-surface, #f3f4f6)',
    color: 'var(--color-text, #1f2937)',
    border: '1px solid var(--color-border, #d1d5db)',
    padding: '0.625rem 1.25rem',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'background 0.2s, border-color 0.2s',
  };

  const btnOutlineStyle = {
    background: 'transparent',
    color: 'var(--color-primary, #3b82f6)',
    border: '1px solid var(--color-primary, #3b82f6)',
    padding: '0.625rem 1.25rem',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s',
  };

  const btnDangerStyle = {
    background: 'transparent',
    color: '#ef4444',
    border: '1px solid #ef4444',
    padding: '0.625rem 1.25rem',
    borderRadius: '8px',
    fontWeight: 600,
    fontSize: '0.875rem',
    cursor: 'pointer',
    transition: 'background 0.2s, color 0.2s',
  };

  const disabledStyle = {
    opacity: 0.6,
    cursor: 'not-allowed',
  };

  const errorStyle = {
    marginTop: '1rem',
    padding: '0.75rem',
    background: '#fef2f2',
    border: '1px solid #fecaca',
    borderRadius: '8px',
    color: '#991b1b',
    fontSize: '0.8125rem',
    textAlign: 'left',
  };

  const warningStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    padding: '1rem',
    background: '#fffbeb',
    border: '1px solid #fde68a',
    borderRadius: '10px',
    marginBottom: '1.25rem',
    textAlign: 'left',
  };

  const warningIconStyle = {
    width: '20px',
    height: '20px',
    flexShrink: 0,
    color: '#f59e0b',
    marginTop: '0.125rem',
  };

  const warningTextStyle = {
    margin: 0,
    fontSize: '0.8125rem',
    color: '#92400e',
    lineHeight: 1.5,
  };

  const modalOverlayStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.4)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '1rem',
    zIndex: 1000,
  };

  const modalStyle = {
    background: 'white',
    borderRadius: '12px',
    padding: '1.5rem',
    maxWidth: '360px',
    width: '100%',
    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
  };

  const modalTitleStyle = {
    margin: '0 0 0.5rem',
    fontSize: '1rem',
    fontWeight: 600,
    color: 'var(--color-text, #1f2937)',
  };

  const modalTextStyle = {
    margin: '0 0 1.25rem',
    fontSize: '0.875rem',
    color: 'var(--color-text-muted, #6b7280)',
    lineHeight: 1.5,
  };

  const modalActionsStyle = {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
  };

  // ============================================
  // CASO A — Desconectado (!isConnected)
  // ============================================
  if (!isConnected) {
    return (
      <div className="card google-drive-sync-card" style={cardStyle}>
        {showTitle && (
          <div style={headerStyle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={iconStyle}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
              <path d="M12 8v4l3 3" />
            </svg>
            <h3 style={titleStyle}>Sincroniza tus datos en la nube</h3>
            <span style={badgeStyle('local')}>Modo Local Activo</span>
          </div>
        )}
        <p style={{ margin: '0 0 1.5rem', color: 'var(--color-text-muted, #6b7280)', fontSize: '0.875rem', lineHeight: 1.5 }}>
          Tus datos se guardan solo en este dispositivo. Conecta Google Drive para sincronizar y respaldar automáticamente.
        </p>
        <button
          style={{
            ...btnPrimaryStyle,
            width: '100%',
            ...(syncStatus === 'syncing' ? disabledStyle : {}),
          }}
          onClick={handleConnect}
          disabled={syncStatus === 'syncing'}
        >
          {syncStatus === 'syncing' ? 'Conectando...' : 'Conectar con Google Drive'}
        </button>
        {error && <p style={errorStyle} role="alert">{error}</p>}
      </div>
    );
  }

  // ============================================
  // CASO B — Conectado con sesión caducada (isConnected && needsReauth)
  // ============================================
  if (isConnected && needsReauth) {
    return (
      <div className="card google-drive-sync-card" style={cardStyle}>
        {showTitle && (
          <div style={headerStyle}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={iconStyle}>
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
              <path d="M12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
              <path d="M12 8v4l3 3" />
            </svg>
            <h3 style={titleStyle}>Google Drive Conectado</h3>
            <span style={badgeStyle('expired')}>Sesión caducada</span>
          </div>
        )}
        <div style={userCardStyle}>
          {user?.picture && <img src={user.picture} alt={user.name} style={avatarStyle} />}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span style={userNameStyle}>{user?.name || 'Usuario desconocido'}</span>
              <span style={badgeStyle('expired')}>Sesión caducada</span>
            </div>
            <span style={userEmailStyle}>{user?.email || ''}</span>
          </div>
        </div>

        <div style={warningStyle}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={warningIconStyle}>
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <p style={warningTextStyle}>Tu sesión de Google Drive ha caducado. Pulsa "Reconectar sesión" para renovar el acceso.</p>
        </div>

        <div style={buttonsStyle}>
          <button
            style={{ ...btnPrimaryStyle, ...(syncStatus === 'syncing' ? disabledStyle : {}) }}
            onClick={handleRenewSession}
            disabled={syncStatus === 'syncing'}
          >
            {syncStatus === 'syncing' ? 'Renovando...' : 'Reconectar sesión'}
          </button>
          <button
            style={{ ...btnOutlineStyle, ...(syncStatus === 'syncing' ? disabledStyle : {}) }}
            onClick={handleDisconnect}
            disabled={syncStatus === 'syncing'}
          >
            Desconectar
          </button>
        </div>

        {error && <p style={errorStyle} role="alert">{error}</p>}
      </div>
    );
  }

  // ============================================
  // CASO C — Conectado y activo (isConnected && !needsReauth)
  // ============================================
  return (
    <div className="card google-drive-sync-card" style={cardStyle}>
      {showTitle && (
        <div style={headerStyle}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={iconStyle}>
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
            <path d="M12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" />
            <path d="M12 8v4l3 3" />
          </svg>
          <h3 style={titleStyle}>Google Drive Conectado</h3>
          <span style={badgeStyle(isSyncing ? 'syncing' : 'connected')}>
            {isSyncing ? 'Sincronizando...' : 'Conectado'}
          </span>
        </div>
      )}
      <div style={userCardStyle}>
        {user?.picture && <img src={user.picture} alt={user.name} style={avatarStyle} />}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
          <span style={userNameStyle}>{user?.name || 'Usuario desconocido'}</span>
          <span style={userEmailStyle}>{user?.email || ''}</span>
        </div>
      </div>

      <div style={syncInfoStyle}>
        <div style={syncItemStyle}>
          <span style={syncLabelStyle}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ flexShrink: 0 }}>
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
            Última sincronización
          </span>
          <span style={syncValueStyle}>{formatLastSynced(lastSync)}</span>
        </div>
        <div style={syncItemStyle}>
          <span style={syncLabelStyle}>Alcance</span>
          <span style={{ ...syncValueStyle, fontSize: '0.75rem', color: 'var(--color-text-muted, #6b7280)' }}>drive.file activo</span>
        </div>
        <div style={syncItemStyle}>
          <span style={syncLabelStyle}>Estado</span>
          <span style={{ ...syncValueStyle, ...statusTextStyle(syncStatus) }}>
            {syncStatus === 'syncing' && 'Sincronizando...'}
            {syncStatus === 'success' && 'Sincronizado'}
            {syncStatus === 'error' && 'Error de sincronización'}
            {syncStatus === 'idle' && 'Al día'}
          </span>
        </div>
      </div>

      <div style={buttonsStyle}>
        <button
          style={{ ...btnPrimaryStyle, ...((isSyncing || syncStatus === 'syncing') ? disabledStyle : {}) }}
          onClick={handleSyncNow}
          disabled={isSyncing || syncStatus === 'syncing'}
        >
          {isSyncing || syncStatus === 'syncing' ? 'Sincronizando...' : 'Sincronizar ahora'}
        </button>
        <button
          style={{ ...btnSecondaryStyle, ...((isSyncing || syncStatus === 'syncing') ? disabledStyle : {}) }}
          onClick={handleRestore}
          disabled={isSyncing || syncStatus === 'syncing'}
        >
          Restaurar
        </button>
        <button
          style={{ ...btnOutlineStyle, ...((isSyncing || syncStatus === 'syncing') ? disabledStyle : {}) }}
          onClick={handleDisconnect}
          disabled={isSyncing || syncStatus === 'syncing'}
        >
          Desconectar
        </button>
      </div>

      {error && <p style={errorStyle} role="alert">{error}</p>}

      {/* Restore confirmation modal */}
      {showRestoreConfirm && (
        <div style={modalOverlayStyle} onClick={() => setShowRestoreConfirm(false)} role="dialog" aria-modal="true" aria-labelledby="restore-modal-title">
          <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
            <h4 id="restore-modal-title" style={modalTitleStyle}>Confirmar restauración</h4>
            <p style={modalTextStyle}>Esto reemplazará todos los datos locales con la copia de Google Drive. ¿Continuar?</p>
            <div style={modalActionsStyle}>
              <button
                style={btnSecondaryStyle}
                onClick={() => setShowRestoreConfirm(false)}
              >
                Cancelar
              </button>
              <button
                style={{ ...btnDangerStyle, ...(syncStatus === 'syncing' ? disabledStyle : {}) }}
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
  );
}