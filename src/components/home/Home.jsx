import React, { useState, useEffect } from 'react'
import { useGPX } from '../../context/GPXContext'
import { useAuth } from '../../context/AuthContext'
import { MotoAtlas26Logo } from '../shared'
import { GoogleDriveSyncCard } from '../shared'
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
      <GoogleDriveSyncCard 
        variant="home"
        showTitle={true}
        showDescription={true}
      />

    </div>
  )
}