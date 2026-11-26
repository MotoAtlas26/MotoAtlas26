import { useContext, useEffect, useState } from 'react';
import { useAuth, syncNow, restoreFromDrive } from '../../context/AuthContext';
import { db } from '../../services/db';

export function GoogleDriveSyncCard({ showTitle = true, db: propDb }) {
  const auth = useAuth();
  const activeDb = propDb || db;
  const {
    isConnected,
    isSyncing,
    lastSync,
    connect,
    disconnect,
    reconnectWithConsent,
    syncStatus,
    setSyncStatus,
    uploadBackup,
    downloadBackup,
  } = auth;

  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [restoreConfirmMessage, setRestoreConfirmMessage] = useState('');

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
    if (!activeDb) {
      console.error('[GoogleDriveSyncCard] DB no disponible');
      return;
    }
    
    try {
      await syncNow({ db: activeDb, uploadBackup, setSyncStatus, connect });
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    } catch (err) {
      console.error('[GoogleDriveSyncCard] Error en sincronización:', err);
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 3000);
    }
  };

  const handleRestore = async () => {
    if (!activeDb) {
      console.error('[GoogleDriveSyncCard] DB no disponible');
      return;
    }
    setShowRestoreConfirm(true);
  };

  const handleRestoreConfirmAction = async () => {
    if (!activeDb) return;
    setShowRestoreConfirm(false);
    setRestoreConfirmMessage('');
    try {
      await restoreFromDrive({ db: activeDb, downloadBackup, setSyncStatus, connect });
      setRestoreConfirmMessage('Datos restaurados desde Google Drive');
    } catch (err) {
      setRestoreConfirmMessage('Error al restaurar: ' + err.message);
    }
  };

  const handleRestoreCancel = () => {
    setShowRestoreConfirm(false);
    setRestoreConfirmMessage('');
  };

  const formatLastSynced = (timestamp) => {
    if (!timestamp) return 'Nunca';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const cardStyle = { maxWidth: '420px', margin: '0 auto', textAlign: 'center' };
  const headerStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' };
  const iconStyle = { width: '36px', height: '36px', flexShrink: 0, color: 'var(--color-primary, #3b82f6)' };
  const titleStyle = { margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--color-text-primary, #1f2937)' };
  const badgeStyle = (variant) => {
    const base = { display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.35rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, flexShrink: 0 };
    const variants = {
      connected: { background: '#dcfce7', color: '#166534' },
      syncing: { background: '#dbeafe', color: '#1e40af' },
      expired: { background: '#fef3c7', color: '#92400e' },
      local: { background: '#e5e7eb', color: '#374151' },
    };
    return { ...base, ...variants[variant] };
  };

  return (
    <div style={cardStyle}>
      {showTitle && (
        <div style={headerStyle}>
          <div style={iconStyle}>☁️</div>
          <h2 style={titleStyle}>Google Drive</h2>
        </div>
      )}

      {!isConnected ? (
        <button onClick={handleConnect} className="btn-primary">Conectar Google Drive</button>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <span style={badgeStyle('connected')}>Conectado</span>
          </div>
          
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
            <button onClick={handleSyncNow} className="btn-secondary" disabled={isSyncing}>Sincronizar ahora</button>
            <button onClick={handleRestore} className="btn-secondary" disabled={isSyncing}>Restaurar</button>
            <button onClick={handleDisconnect} className="btn-ghost">Desconectar</button>
          </div>

          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--color-text-muted, #6b7280)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
              <span>Última sincronización:</span>
              <span>{formatLastSynced(lastSync)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Estado:</span>
              <span style={{ fontWeight: 600, color: isSyncing ? '#2563eb' : '#166534' }}>
                {isSyncing ? 'Sincronizando...' : 'Conectado'}
              </span>
            </div>
          </div>
        </>
      )}

      {showRestoreConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>¿Restaurar datos?</h3>
            <p>Esto sobrescribirá tus datos locales con la copia de Google Drive.</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button onClick={handleRestoreConfirmAction} className="btn-primary">Confirmar</button>
              <button onClick={handleRestoreCancel} className="btn-ghost">Cancelar</button>
            </div>
          </div>
        </div>
      )}
      {restoreConfirmMessage && <p style={{ marginTop: '1rem', fontSize: '0.85rem' }}>{restoreConfirmMessage}</p>}
    </div>
  );
}
