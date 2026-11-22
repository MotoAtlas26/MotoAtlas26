import React, { useEffect, useState, useMemo } from 'react'
import { MapContainer, TileLayer, Polyline, Popup, Marker } from 'react-leaflet'
import L from 'leaflet'
import { useGPX } from '../../context/GPXContext'
import { simplifyTrack } from '../../utils/gpxHelpers'
import 'leaflet/dist/leaflet.css'

L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
})

export const GPXMapContainer = () => {
  const { selectedTrack, setSelectedTrack, tracks } = useGPX()
  const [center, setCenter] = useState([37.3828, -5.9731])
  const [zoom, setZoom] = useState(13)

  // Memoize simplified tracks for visual rendering (only for tracks with >2000 points)
  const simplifiedTracks = useMemo(() => {
    return tracks.map(track => {
      if (!track.points || track.points.length <= 2000) return track
      // Simplify using Douglas-Peucker with 10m tolerance for visual performance
      return { ...track, points: simplifyTrack(track.points, 10) }
    })
  }, [tracks])

  useEffect(() => {
    if (tracks.length > 0) {
      const latestTrack = tracks[tracks.length - 1]
      if (latestTrack?.points?.[0]) {
        const firstPoint = latestTrack.points[0]
        setCenter([firstPoint.lat, firstPoint.lng])
      }
    }
  }, [tracks])

  const getTotalDistance = () => {
    return simplifiedTracks.reduce((total, track) => total + (track.distance || 0), 0)
  }

  const getTotalElevation = () => {
    return simplifiedTracks.reduce((total, track) => total + (track.elevationGain || 0), 0)
  }

  return (
    <>
      <div className="map-stats">
        <div className="stat-card">
          <span className="stat-label">Tracks:</span>
          <span className="stat-value">{tracks.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Distancia total:</span>
          <span className="stat-value">{getTotalDistance().toFixed(0)} m</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Ganancia de elevación:</span>
          <span className="stat-value">{getTotalElevation().toFixed(0)} m</span>
        </div>
      </div>

      <div className="map-wrapper">
        <MapContainer
          center={center}
          zoom={zoom}
          preferCanvas={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {/* Visual polyline using simplified tracks for performance */}
          {simplifiedTracks.map((track, trackIndex) => track.points && track.points.length > 1 && (
            <Polyline
              key={trackIndex}
              positions={track.points.map(p => [p.lat, p.lng])}
              color="#3388ff"
              weight={3}
              opacity={0.8}
              smoothFactor={1}
            />
          ))}

          {tracks.map((track, trackIndex) => {
            if (!track.points || track.points.length === 0) return null

            return track.points.map((point, pointIndex) => (
              <Marker
                key={`track-${trackIndex}-point-${pointIndex}`}
                position={[point.lat, point.lng]}
                eventHandlers={{
                  click: () => setSelectedTrack(track),
                }}
              >
                <Popup>
                  <div>
                    <h3>{track.name}</h3>
                    <p>Punto {pointIndex + 1}</p>
                    {point.elevation && <p>Elevación: {point.elevation}m</p>}
                    {point.timestamp && <p>Tiempo: {point.timestamp.toLocaleString()}</p>}
                  </div>
                </Popup>
              </Marker>
            ))
          })}

          {selectedTrack && (
            <div className="selected-track-info">
              <h3>{selectedTrack.name}</h3>
              <p>Puntos: {selectedTrack.points.length}</p>
              <p>Distancia: {(selectedTrack.distance || 0).toFixed(0)} m</p>
              <p>Elevación: {(selectedTrack.elevationGain || 0).toFixed(0)} m</p>
            </div>
          )}
        </MapContainer>
      </div>
    </>
  )
}

export default GPXMapContainer