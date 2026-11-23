import React, { useState, useEffect } from 'react'
import { useGPX } from '../../context/GPXContext'
import { db } from '../../services/db'
import { useBlobUrl } from '../../hooks/useBlobUrl'
import { getMotoModel, getDefaultMotoModel } from '../../constants/motoModels'
import { useAuth } from '../../context/AuthContext'
import { InstallAppButton, MotoAtlas26Logo } from '../shared'
import { CloudIcon, CloudOffIcon, SyncIcon, CheckCircleIcon, UserCircleIcon, LogOutIcon } from '../shared/Icons'

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
  const { user, isConnected, syncStatus, lastSync, error: authError, connect, disconnect, syncNow, isInstalled } = useAuth()
  const [motoBlob, setMotoBlob] = useState(null)
  const moto = getMotoModel(selectedMoto)
  const defaultMoto = getDefaultMotoModel()
  const motoImageUrl = useBlobUrl(motoBlob)

  // Cargar imagen de la BD cuando cambia la moto seleccionada
  useEffect(() => {
    const loadMotoImage = async () => {
      if (!dbReady) return
      
      try {
        const imageRecord = await db.getMotoImage(selectedMoto)
        if (imageRecord && imageRecord.blob) {
          setMotoBlob(imageRecord.blob)
        } else {
          // Fallback a archivo estático si no está en BD
          setMotoBlob(null)
        }
      } catch (error) {
        console.error('Error cargando imagen de moto:', error)
        setMotoBlob(null)
      }
    }
    
    loadMotoImage()
  }, [selectedMoto, dbReady])

  // Imagen a mostrar: blob de BD si existe, sino la imagen importada del modelo (Vite hash garantizado)
  // Usamos FALLBACK_IMAGES[selectedMoto] como garantía absoluta (nunca undefined)
  const fallbackImg = FALLBACK_IMAGES[selectedMoto] || cfmoto800Img
  const displayImage = motoImageUrl || moto.fallbackImage || fallbackImg

  const formatRelativeTime = (date) => {
    const now = new Date()
    const diff = now - new Date(date)
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'hace un momento'
    if (minutes < 60) return `hace ${minutes} min`
    if (hours < 24) return `hace ${hours} h`
    return `hace ${days} d`
  }

  return (
    <div className="home-showcase">
      <div className="moto-hero">
        <img 
          src={displayImage} 
          alt={moto.name}
          onError={(e) => {
            // Fallback final: si falla todo (blob corrupto, URL inválida), usa asset CFMOTO importado
            e.currentTarget.src = cfmoto800Img
          }}
        />
      </div>
      <div className="home-content">
        <MotoAtlas26Logo size={48} className="mx-auto mb-4" />
        <h1 className="home-title">{moto.name}</h1>
        <p className="home-subtitle">Tu compañero de ruta para cada aventura</p>

        {/* Google Drive Status / Connect */}
        <div className="mt-8 w-full max-w-md mx-auto">
          {!isConnected ? (
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-center">
              <CloudOffIcon size={32} className="mx-auto text-slate-500 mb-3" />
              <h3 className="text-lg font-semibold text-slate-100 mb-2">Sincroniza tus datos en la nube</h3>
              <p className="text-sm text-slate-400 mb-4">
                Conecta tu Google Drive para acceder a tus rutas, talleres, motos y temas desde cualquier dispositivo.
                <br />
                <span className="text-xs bg-slate-700 px-2 py-0.5 rounded">Alcance drive.file - Solo MotoAtlas26 accede a sus archivos</span>
              </p>
              <button
                onClick={connect}
                disabled={syncStatus === 'syncing'}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-sm flex items-center justify-center gap-2 mx-auto transition-colors"
              >
                <SyncIcon size={16} /> Conectar con Google Drive
              </button>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-800/60 border border-slate-700/50">
              {/* User Header */}
              <div className="flex items-center gap-3 mb-4">
                {user?.picture && (
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="w-10 h-10 rounded-full border-2 border-amber-500/50"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-100 truncate">{user?.name || user?.email}</div>
                  <div className="text-xs text-slate-400 truncate">{user?.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    syncStatus === 'synced' ? 'bg-emerald-500/20 text-emerald-400' :
                    syncStatus === 'syncing' ? 'bg-amber-500/20 text-amber-400' :
                    syncStatus === 'error' ? 'bg-red-500/20 text-red-400' :
                    'bg-slate-600/50 text-slate-400'
                  }`}>
                    {syncStatus === 'synced' && <CheckCircleIcon size={10} className="inline-block mr-1" />}
                    {syncStatus === 'syncing' && <SyncIcon size={10} className="inline-block mr-1 spin" />}
                    {syncStatus === 'synced' ? 'Sincronizado' :
                     syncStatus === 'syncing' ? 'Sincronizando...' :
                     syncStatus === 'error' ? 'Error' : 'Pendiente'}
                  </span>
                </div>
              </div>

              {/* Last Sync */}
              {lastSync && (
                <div className="text-xs text-slate-400 flex items-center justify-center gap-1 mb-4">
                  <SyncIcon size={12} />
                  <span>Última sincronización: {formatRelativeTime(lastSync)}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={syncNow}
                  disabled={syncStatus === 'syncing'}
                  className="flex-1 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 text-slate-100 font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <SyncIcon size={14} /> {syncStatus === 'syncing' ? 'Sincronizando...' : 'Sincronizar ahora'}
                </button>
                <button
                  onClick={disconnect}
                  className="flex-1 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOutIcon size={14} /> Cerrar sesión
                </button>
              </div>

              {authError && (
                <div className="mt-3 p-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-xs text-center">
                  {authError}
                </div>
              )}
            </div>
          )}

          {/* PWA Install Button */}
          {!isInstalled && (
            <div className="mt-4">
              <InstallAppButton variant="card" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home