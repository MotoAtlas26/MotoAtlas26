import React from 'react'
import ReactDOM from 'react-dom/client'
import { initTheme } from './utils/themeEngine'
import { AuthProvider } from './context/AuthContext'
import { GPXProvider } from './context/GPXContext'
import App from './App'
import './index.css'

// Apply theme BEFORE React renders to prevent flash
initTheme()

// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${import.meta.env.BASE_URL}sw.js`
    navigator.serviceWorker.register(swUrl)
      .then((registration) => {
        console.log('[SW] Service Worker registrado:', registration.scope)
      })
      .catch((error) => {
        console.error('[SW] Error al registrar Service Worker:', error)
      })
  })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <GPXProvider>
        <App />
      </GPXProvider>
    </AuthProvider>
  </React.StrictMode>
)