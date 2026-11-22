import React, { useEffect, Component } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { GPXMapContainer as MapContainer } from './components/tracks/MapContainer'
import { FileUpload } from './components/upload/FileUpload'
import { TrackList } from './components/tracks/TrackList'
import { Home } from './components/home/Home'
import { Moto } from './components/moto/Moto'
import { Facturas } from './components/moto/Facturas'
import { Settings } from './components/settings/Settings'
import { MainLayout } from './components/layout/MainLayout'
import { GPXProvider, useGPX } from './context/GPXContext'

// Error Boundary para capturar errores de renderizado
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, errorInfo: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error capturado por ErrorBoundary:', error, errorInfo)
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'var(--color-error-border)',
          background: 'var(--color-error-bg)',
          border: '1px solid var(--color-error-border)',
          borderRadius: 'var(--radius-card)',
          margin: '1rem'
        }}>
          <h2>⚠️ Algo salió mal</h2>
          <pre style={{ textAlign: 'left', overflow: 'auto', maxHeight: '300px' }}>
            {this.state.error && this.state.error.toString()}
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </pre>
          <button 
            onClick={() => this.setState({ hasError: false, error: null, errorInfo: null })}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              background: 'var(--color-gold)',
              color: 'var(--color-canvas)',
              border: 'none',
              borderRadius: 'var(--radius-btn)',
              cursor: 'pointer'
            }}
          >
            Reintentar
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

const AppContent = () => {
  const { tracks, loadFromDB, clearTracks } = useGPX()

  useEffect(() => {
    loadFromDB()
  }, [loadFromDB])

  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<Navigate to="/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/moto" element={<Moto />} />
          <Route path="/moto/facturas" element={<Facturas />} />
          <Route path="/tracks" element={<TrackList />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/fileUpload" element={<FileUpload />} />
          <Route path="/mapContainer" element={<MapContainer />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  )
}

export const App = () => {
  return (
    <GPXProvider>
      <Router>
        <AppContent />
      </Router>
    </GPXProvider>
  )
}

export default App