import React, { useState, useRef } from 'react'
import { useGPX } from '../../context/GPXContext'

export const FileUpload = () => {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)
  const { uploadGPX, isLoading, error } = useGPX()

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    const gpxFiles = files.filter(file => file.name.endsWith('.gpx'))
    
    if (gpxFiles.length > 0) {
      setSelectedFile(gpxFiles[0])
    }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      setSelectedFile(files[0])
    }
  }

  const handleUpload = async () => {
    if (!selectedFile) return
    
    const result = await uploadGPX(selectedFile)
    if (result.success) {
      alert('¡GPX subido y procesado exitosamente!')
      setSelectedFile(null)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <>
      <h2>Subir Archivos GPX</h2>
      
      <div
        className={`upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-icon">📁</div>
        <h3>Arrastra y suelta un archivo GPX aquí</h3>
        <p>o haz clic para seleccionar un archivo</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".gpx"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {selectedFile && (
        <div className="selected-file">
          <div className="file-info">
            <span>📄 {selectedFile.name}</span>
            <span>({(selectedFile.size / 1024).toFixed(2)} KB)</span>
          </div>
          <button 
            onClick={handleUpload}
            disabled={isLoading}
            className="primary"
          >
            {isLoading ? 'Procesando...' : 'Subir y Procesar'}
          </button>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
        </div>
      )}

      {isLoading && (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Procesando GPX...</p>
        </div>
      )}
    </>
  )
}

export default FileUpload