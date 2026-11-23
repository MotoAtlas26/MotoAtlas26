import React, { useState, useEffect } from 'react'

/**
 * Componente de instalación PWA "Instalar MotoAtlas2626"
 * - Captura el evento `beforeinstallprompt`
 * - Detecta si ya está instalada la app (display-mode: standalone)
 * - Muestra instrucciones personalizadas para iOS/Safari
 */
export const InstallAppButton = ({ variant = 'button', className = '', label = 'Instalar MotoAtlas2626' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [isStandalone, setIsStandalone] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [showIOSModal, setShowIOSModal] = useState(false)
  const [installed, setInstalled] = useState(false)

  useEffect(() => {
    // Detectar si la app ya corre en modo standalone / PWA instalada
    const isStandaloneMode = 
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone ||
      document.referrer.includes('android-app://')

    setIsStandalone(isStandaloneMode)

    // Detectar iOS / iPadOS / Safari
    const userAgent = window.navigator.userAgent.toLowerCase()
    const isAppleDevice = /iphone|ipad|ipod/.test(userAgent) || (navigator.maxTouchPoints && navigator.maxTouchPoints > 2 && /macintosh/.test(userAgent))
    setIsIOS(isAppleDevice)

    // Escuchar el evento de instalación nativo
    const handleBeforeInstallPrompt = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    }

    const handleAppInstalled = () => {
      setInstalled(true)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (isIOS) {
      setShowIOSModal(true)
      return
    }

    if (!deferredPrompt) {
      return
    }

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setInstalled(true)
    }
    setDeferredPrompt(null)
  }

  // Si ya está instalada como PWA standalone, no mostrar nada o un mensaje sutil
  if (isStandalone || installed) {
    if (variant === 'card') {
      return (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 ${className}`} style={{
          background: 'var(--color-success-bg)',
          border: 'var(--border-width) solid var(--color-success-border)',
          color: 'var(--color-success-border)'
        }}>
          <span className="text-xl">✅</span>
          <div>
            <div className="font-semibold">MotoAtlas26 instalada</div>
            <div className="text-xs" style={{ opacity: 0.8 }}>Estás ejecutando la aplicación nativa PWA</div>
          </div>
        </div>
      )
    }
    return null
  }

  // Si no hay prompt y no es iOS, no mostramos el botón (ej. en navegadores que no soportan PWA)
  if (!deferredPrompt && !isIOS) {
    if (variant === 'card') {
      return (
        <div className={`p-4 rounded-xl text-sm flex items-center gap-3 ${className}`} style={{
          background: 'var(--color-card)',
          border: 'var(--border-width) solid var(--color-card-border)',
          color: 'var(--color-text-muted)'
        }}>
          <span className="text-xl">📱</span>
          <div>
            <div className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>Aplicación Web Instalable</div>
            <div className="text-xs" style={{ opacity: 0.75 }}>MotoAtlas26 soporta instalación PWA en navegadores compatibles (Chrome, Edge, Safari).</div>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <>
      {variant === 'card' ? (
        <div className={`p-4 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${className}`} style={{
          background: 'var(--color-card)',
          border: 'var(--border-width) solid var(--color-tertiary-border)'
        }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-lg" style={{
              background: 'color-mix(in srgb, var(--color-tertiary) 20%, transparent)',
              border: 'var(--border-width) solid var(--color-tertiary-border)',
              color: 'var(--color-tertiary)'
            }}>
              📱
            </div>
            <div>
              <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Instalar MotoAtlas26</div>
              <div className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>Accede directamente desde tu pantalla de inicio sin conexión</div>
            </div>
          </div>
          <button
            onClick={handleInstallClick}
            className="w-full sm:w-auto px-4 py-2 font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
            style={{
              background: 'var(--color-tertiary)',
              color: 'var(--color-tertiary-contrast)',
              boxShadow: 'var(--shadow-md), color-mix(in srgb, var(--color-tertiary) 20%, transparent)'
            }}
          >
            <span>📥</span> {label}
          </button>
        </div>
      ) : (
        <button
          onClick={handleInstallClick}
          className={`px-4 py-2 font-semibold rounded-lg text-sm transition-colors flex items-center justify-center gap-2 ${className}`}
          style={{
            background: 'var(--color-tertiary)',
            color: 'var(--color-tertiary-contrast)',
            boxShadow: 'var(--shadow-md), color-mix(in srgb, var(--color-tertiary) 20%, transparent)'
          }}
        >
          <span>📥</span> {label}
        </button>
      )}

      {/* Modal de instrucciones para iOS */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(8px)'
        }}>
          <div className="rounded-2xl p-6 max-w-sm w-full shadow-2xl animate-fade-in" style={{
            background: 'var(--color-card)',
            border: 'var(--border-width) solid var(--color-card-border)',
            color: 'var(--color-text-primary)'
          }}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--color-tertiary)' }}>
                <span>🍏</span> Instalar en iOS / Safari
              </h3>
              <button
                onClick={() => setShowIOSModal(false)}
                className="text-xl font-bold" style={{
                  color: 'var(--color-text-muted)'
                }}
              >
                ✕
              </button>
            </div>
            <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
              Para instalar MotoAtlas26 en tu iPhone o iPad:
            </p>
            <ol className="text-sm space-y-3 pl-2 mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              <li className="flex items-start gap-2">
                <span className="font-bold" style={{ color: 'var(--color-tertiary)' }}>1.</span>
                <span>Toca el botón <strong>Compartir</strong> en la barra inferior del navegador Safari.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold" style={{ color: 'var(--color-tertiary)' }}>2.</span>
                <span>Desplázate hacia abajo y selecciona <strong>"Añadir a la pantalla de inicio"</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold" style={{ color: 'var(--color-tertiary)' }}>3.</span>
                <span>Toca <strong>Añadir</strong> en la esquina superior derecha.</span>
              </li>
            </ol>
            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 font-bold rounded-lg text-sm"
              style={{
                background: 'var(--color-tertiary)',
                color: 'var(--color-tertiary-contrast)'
              }}
            >
              Entendido - MotoAtlas26
            </button>
          </div>
        </div>
      )}
    </>
  )
}
