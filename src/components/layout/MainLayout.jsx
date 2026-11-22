import React, { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { MotoAtlas26Logo } from '../shared'
import { ErrorBoundary } from '../../App'

export const MainLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const location = useLocation()

  // Cerrar sidebar al cambiar de ruta (en móvil)
  useEffect(() => {
    if (isSidebarOpen) {
      setIsSidebarOpen(false)
    }
  }, [location.pathname])

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)
  const closeSidebar = () => setIsSidebarOpen(false)

  return (
    <div className="master-layout">
      {/* Mobile Header - solo visible < 768px */}
      <header className="mobile-header" role="banner">
        <nav className="mobile-header-nav" aria-label="Navegación principal">
          <a href="/" className="mobile-logo" aria-label="MotoAtlas26 Home">
            <MotoAtlas26Logo size={32} horizontal={true} />
          </a>
          <button
            className="menu-toggle"
            onClick={toggleSidebar}
            aria-label={isSidebarOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={isSidebarOpen}
            aria-controls="sidebar-drawer"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </nav>
      </header>

      {/* Sidebar Overlay - visible cuando sidebar abierto en móvil */}
      {isSidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <Sidebar
        id="sidebar-drawer"
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
      />

      <main className="master-content">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </div>
  )
}

export default MainLayout