import React, { useState, useEffect } from 'react'
import { useGPX } from '../../context/GPXContext'
import { useAuth } from '../../context/AuthContext'
import { MotoAtlas26Logo } from '../shared'
import { CloudIcon, CloudOffIcon, SyncIcon, CheckCircleIcon, LogOutIcon } from '../shared/Icons'
import { getMotoModel } from '../../constants/motoModels'

// Importación directa de assets (Vite los hashea y garantiza disponibilidad en dist/assets/)
import cfmoto800Img from '../../assets/motos/800MT-X.webp'
import ktm1290Img from '../../assets/motos/KTM-1290-S-Adv-S.webp'

// Mapa de fallback por ID de modelo - siempre apunta a asset empaquetado por Vite
const FALLBACK_IMAGES = {
  'cfmoto-800mt-x': cfmoto800Img,
  'ktm-1290-super-adventure-s': ktm1290Img
}

export const Home = () => {
  const { selectedMoto, dbReady } = useGPX()
  const { user, isConnected, syncStatus, lastSync, error: authError, connect, disconnect, syncNow } = useAuth()
  const [motoImage, setMotoImage] = useState(null)
  const [imageError, setImageError] = useState(false)

  // Formatear tiempo relativo
  const formatRelativeTime = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'hace un momento'
    if (diffMins < 60) return `hace ${diffMins} min`
    if (diffHours < 24) return `hace ${diffHours} h`
    if (diffDays < 7) return `hace ${diffDays} d`
    return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: '2-digit' })
  }

  // Cargar imagen de la moto seleccionada
  useEffect(() => {
    if (!selectedMoto) {
      setMotoImage(null)
      return
    }

    const model = getMotoModel(selectedMoto)
    if (model?.image) {
      setMotoImage(model.image)
      return
    }

    // Fallback a assets empaquetados
    const fallback = FALLBACK_IMAGES[selectedMoto]
    if (fallback) {
      setMotoImage(fallback)
    } else {
      setMotoImage(null)
    }
  }, [selectedMoto])

  // Manejar error de carga de imagen
  const handleImageError = () => {
    setImageError(true)
    const fallback = FALLBACK_IMAGES[selectedMoto]
    if (fallback && motoImage !== fallback) {
      setMotoImage(fallback)
    }
  }

  const currentMoto = selectedMoto ? getMotoModel(selectedMoto) : null
  const motoName = currentMoto?.name || 'CFMOTO 800MT-X'
  const motoBrand = currentMoto?.brand || 'CFMOTO'

  return (
    <div className="home-container">
      {/* ── Bloque Superior: Cabecera y Moto Protagonista ── */}
      <div className="home-hero">
        <MotoAtlas26Logo width={120} height={120} className="home-logo" />
        
        <div className="home-moto-wrapper">
          {motoImage && !imageError ? (
            <img
              src={motoImage}
              alt={motoName}
              className="home-moto-image"
              onError={handleImageError}
            />
          ) : (
            <div className="home-moto-placeholder" aria-hidden="true">
              <svg width="80" height="50" viewBox="0 0 80 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 35 Q10 25 20 25 L30 25 Q35 25 35 30 L35 35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
                <circle cx="20" cy="35" r="5" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4"/>
                <circle cx="35" cy="35" r="5" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4"/>
                <path d="M45 35 Q45 25 55 25 L65 25 Q70 25 70 30 L70 35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
                <circle cx="55" cy="35" r="5" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4"/>
                <circle cx="70" cy="35" r="5" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.4"/>
              </svg>
            </div>
          )}
          
          <div className="home-moto-info">
            <h2 className="home-moto-name">{motoName}</h2>
            <p className="home-moto-subtitle">Tu compañero de ruta para cada aventura</p>
          </div>
        </div>
      </div>

      {/* ── Bloque Inferior: Tarjeta de Sincronización Google Drive ── */}
      <div className="home-sync-card">
        {!isConnected ? (
          <>
            <CloudOffIcon size={36} className="home-sync-icon" />
            <h3 className="home-sync-title">Sincroniza tus datos en la nube</h3>
            <p className="home-sync-desc">
              Conecta tu Google Drive para acceder a tus rutas, talleres, motos y temas desde cualquier dispositivo.
            </p>
            <span className="home-sync-note">Alcance drive.file - Solo MotoAtlas26 accede a sus archivos</span>
            <button
              onClick={connect}
              disabled={syncStatus === 'syncing'}
              className="home-sync-btn home-sync-btn--primary"
            >
              <SyncIcon size={16} /> Conectar con Google Drive
            </button>
          </>
        ) : (
          <>
            <CloudIcon size={36} className="home-sync-icon" />
            <div className="home-sync-user">
              {user?.picture && (
                <img
                  src={user.picture}
                  alt={user.name || ''}
                  className="home-sync-avatar"
                />
              )}
              <div className="home-sync-user-info">
                <div className="home-sync-user-name">{user?.name || user?.email}</div>
                <div className="home-sync-user-email">{user?.email}</div>
              </div>
            </div>
            
            <div className="home-sync-status">
              <span className={`home-sync-badge ${syncStatus}`}>
                {syncStatus === 'synced' && <CheckCircleIcon size={10} className="home-sync-badge-icon" />}
                {syncStatus === 'syncing' && <SyncIcon size={10} className="home-sync-badge-icon spin" />}
                {syncStatus === 'synced' ? 'Sincronizado' :
                 syncStatus === 'syncing' ? 'Sincronizando...' :
                 syncStatus === 'error' ? 'Error' : 'Pendiente'}
              </span>
            </div>

            {lastSync && (
              <div className="home-sync-last">
                <SyncIcon size={12} />
                <span>Última sincronización: {formatRelativeTime(lastSync)}</span>
              </div>
            )}

            <div className="home-sync-actions">
              <button
                onClick={syncNow}
                disabled={syncStatus === 'syncing'}
                className="home-sync-btn home-sync-btn--primary"
              >
                <SyncIcon size={14} /> {syncStatus === 'syncing' ? 'Sincronizando...' : 'Sincronizar ahora'}
              </button>
              <button
                onClick={disconnect}
                className="home-sync-btn home-sync-btn--secondary"
              >
                <LogOutIcon size={14} /> Cerrar sesión
              </button>
            </div>

            {authError && (
              <div className="home-sync-error">{authError}</div>
            )}
          </>
        )}
      </div>

      
    </div>
  )
}