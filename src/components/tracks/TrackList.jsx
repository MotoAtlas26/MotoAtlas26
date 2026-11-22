import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGPX } from '../../context/GPXContext'
import { EmptyState, SectionHeader, StatRow, StatGrid } from '../shared'
import { formatDistance, formatTime, formatElevation, formatSpeed } from '../../utils/formatters'
import { TrashIcon } from '../shared/Icons'
import { useDatabase } from '../../hooks/useDatabase'

export const TrackList = () => {
  const { tracks, selectedTrack, setSelectedTrack, clearTracks, deleteTrack, dbReady } = useGPX()
  const { getTrackLazy } = useDatabase()
  const [loadingTrackId, setLoadingTrackId] = useState(null)

  const handleSelectTrack = async (track) => {
    if (track.points) {
      setSelectedTrack(track)
    } else {
      setLoadingTrackId(track.id)
      const fullTrack = await getTrackLazy(track.id)
      setSelectedTrack(fullTrack)
      setLoadingTrackId(null)
    }
  }

  return (
    <>
      <SectionHeader
        title="Lista de Tracks"
        actions={
          <div className="track-actions">
            <Link to="/fileUpload" className="btn-primary btn-small">
              + Subir GPX
            </Link>
            <Link to="/mapContainer" className="btn-outline btn-small">
              Ver Mapa
            </Link>
            <button
              onClick={clearTracks}
              className="btn-danger btn-small"
              disabled={tracks.length === 0}
            >
              Limpiar Todos
            </button>
          </div>
        }
      />

      {tracks.length === 0 ? (
        <EmptyState
          icon="📁"
          title="No hay tracks disponibles"
          description="Sube un archivo GPX para empezar"
          action={
            <Link to="/fileUpload" className="btn-primary">
              Subir GPX
            </Link>
          }
        />
      ) : (
        <div className="tracks-grid">
          {tracks.map((track, index) => (
            <div 
              key={track.id}
              className={`track-card ${selectedTrack && selectedTrack.id === track.id ? 'selected' : ''}`}
              onClick={() => handleSelectTrack(track)}
            >
              <div className="track-card-header">
                <h3 className="track-card-name">{track.name}</h3>
                <span className="track-index">#{index + 1}</span>
              </div>
              
              <div className="track-card-stats">
                <div className="track-card-stat">
                  <span className="track-card-stat-value">{track.points?.length ?? 0}</span>
                  <span>Puntos</span>
                </div>
                <div className="track-card-stat">
                  <span className="track-card-stat-value">{formatDistance(track.distance || 0)}</span>
                  <span>Distancia</span>
                </div>
                <div className="track-card-stat">
                  <span className="track-card-stat-value">{formatElevation(track.elevationGain || 0)}</span>
                  <span>Elevación</span>
                </div>
                <div className="track-card-stat">
                  <span className="track-card-stat-value">{formatTime(track.duration)}</span>
                  <span>Tiempo</span>
                </div>
              </div>

              {(track.points?.length ?? 0) > 0 && (
                <div className="track-card-preview">
                  <div className="preview-map">
                    <div className="preview-placeholder">
                      {track.points && track.points.length > 0
                        ? `${track.points[0].lat.toFixed(4)}, ${track.points[0].lng.toFixed(4)}`
                        : `Sin datos`}
                    </div>
                  </div>
                </div>
              )}

              <div className="track-footer">
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    handleSelectTrack(track)
                  }}
                  className="btn-primary btn-small"
                >
                  Ver en Mapa
                </button>
                <button 
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm(`¿Eliminar "${track.name}"?`)) {
                      deleteTrack(track.id)
                    }
                  }}
                  className="btn-danger btn-small"
                  title="Eliminar track"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedTrack && (
        <div className="selected-track-panel">
          <h3>Track Seleccionado: {selectedTrack.name}</h3>
          <div className="track-details">
            <StatGrid stats={[
              { label: 'Puntos', value: selectedTrack.points?.length ?? 0 },
              { label: 'Distancia', value: formatDistance(selectedTrack.distance || 0) },
              { label: 'Elevación ganada', value: formatElevation(selectedTrack.elevationGain || 0) },
              { label: 'Elevación perdida', value: formatElevation(selectedTrack.elevationLoss || 0) },
              { label: 'Elevación máxima', value: formatElevation(selectedTrack.maxElevation || 0) },
              { label: 'Elevación mínima', value: formatElevation(selectedTrack.minElevation || 0) },
              { label: 'Velocidad promedio', value: formatSpeed(selectedTrack.averageSpeed || 0) },
              { label: 'Velocidad máxima', value: formatSpeed(selectedTrack.maxSpeed || 0) },
            ]} columns={2} />
          </div>
        </div>
      )}
    </>
  )
}

export default TrackList