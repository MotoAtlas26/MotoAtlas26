import React, { useState, useRef } from 'react'
import { useGPX } from '../../context/GPXContext'
import { db } from '../../services/db'
import { UploadIcon, ImageIcon } from '../shared/Icons'

// Función para redimensionar y convertir imágenes a WebP
const resizeAndConvertImage = async (file) => {
  // Si no es una imagen, devolver original
  if (!file.type.startsWith('image/')) return file

  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = async () => {
      URL.revokeObjectURL(url)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      
      // Obtener dimensiones manteniendo aspect ratio
      let width = img.width
      let height = img.height
      const maxDim = 1400
      
      if (width > maxDim || height > maxDim) {
        const ratio = Math.min(width / maxDim, height / maxDim)
        width = Math.floor(width / ratio)
        height = Math.floor(height / ratio)
      }
      
      canvas.width = width
      canvas.height = height
      ctx.drawImage(img, 0, 0, width, height)
      
      // Convertir a WebP con calidad 0.82
      canvas.toBlob(async (blob) => {
        resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.webp'), { type: 'image/webp' }))
      }, 'image/webp', 0.82)
    }
    img.src = url
  })
}

const ACCEPTED_TYPES = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/webp': ['.webp'],
  'image/heic': ['.heic'],
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.apple.pages': ['.pages'],
}

export const ImageUpload = ({ trackId = null, motoId = null, type = 'invoice', onUploadComplete = null }) => {
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState([])
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)
  const { dbReady } = useGPX()

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
    const validFiles = files.filter(file => isAcceptedFile(file))
    
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles])
    }
  }

  const handleFileSelect = (e) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const validFiles = Array.from(files).filter(file => isAcceptedFile(file))
      setSelectedFiles(prev => [...prev, ...validFiles])
    }
  }

  const isAcceptedFile = (file) => {
    const acceptedMimes = Object.keys(ACCEPTED_TYPES)
    if (acceptedMimes.includes(file.type)) return true
    
    const extension = file.name.toLowerCase().split('.').pop()
    const allExtensions = Object.values(ACCEPTED_TYPES).flat()
    return allExtensions.includes('.' + extension)
  }

  const removeFile = (index) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return

    setUploading(true)
    setError(null)

    const processedFiles = await Promise.all(
      selectedFiles.map(async file => {
        if (file.type.startsWith('image/')) {
          return await resizeAndConvertImage(file)
        } else {
          return file
        }
      })
    )

    try {
      for (const file of processedFiles) {
        await db.saveImage({
          type,
          trackId,
          motoId,
          fileName: file.name,
          mimeType: file.type,
          size: file.size,
          blob: file,
          description: `${type} - ${file.name}`,
        })
      }
      
      setSelectedFiles([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      if (onUploadComplete) {
        onUploadComplete()
      }
    } catch (err) {
      setError(err.message || 'Error subiendo imágenes')
    } finally {
      setUploading(false)
    }
  }

  if (!dbReady) {
    return (
      <div className="image-upload-container">
        <div className="loading">Inicializando base de datos...</div>
      </div>
    )
  }

  return (
    <div className="image-upload-container">
      <h2>{type === 'invoice' ? '📄 Subir Facturas Escaneadas' : '📸 Subir Imágenes'}</h2>
      
      <div
        className={`upload-area ${isDragging ? 'dragging' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <div className="upload-icon">📄</div>
        <h3>Arrastra y suelta archivos aquí</h3>
        <p>o haz clic para seleccionar archivos</p>
        <p className="hint">Formatos: PDF, DOC, DOCX, Pages, JPG, PNG, WebP, HEIC</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.pages,image/jpeg,image/png,image/webp,image/heic"
          multiple
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
      </div>

      {selectedFiles.length > 0 && (
        <div className="selected-files">
          {selectedFiles.map((file, index) => (
            <div key={index} className="file-preview">
              <div className="file-thumbnail">
                <img 
                  src={URL.createObjectURL(file)} 
                  alt={file.name} 
                  onLoad={(e) => URL.revokeObjectURL(e.target.src)}
                />
              </div>
              <div className="file-info">
                <span className="file-name">{file.name}</span>
                <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); removeFile(index) }}
                className="remove-btn"
                title="Eliminar"
              >
                ✕
              </button>
            </div>
          ))}
          <div className="upload-actions">
            <button 
              onClick={handleUpload}
              disabled={uploading}
              className="primary"
            >
              {uploading ? 'Subiendo...' : `Subir ${selectedFiles.length} imagen${selectedFiles.length > 1 ? 'es' : ''}`}
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span>❌ {error}</span>
        </div>
      )}
    </div>
  )
}

export default ImageUpload