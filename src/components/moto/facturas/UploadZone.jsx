import React from 'react'
import { UploadIcon } from '../../shared/Icons'

export const UploadZone = ({ file, fileLoading, onFileChange }) => {
  return (
    <div className="upload-zone" onClick={e => e.target.querySelector('input')?.click()}>
      <UploadIcon size={48} className="zone-icon" />
      <h4>Arrastra y suelta tu factura aquí</h4>
      <p>Formatos: PDF (.pdf), Imágenes (.jpg, .png, .webp)</p>
      {fileLoading && <p className="small-text">Analizando factura…</p>}
      <input
        type="file"
        accept=".pdf,.jpg,.jpeg,.png,.webp"
        onChange={onFileChange}
        style={{ display: 'none' }}
      />
    </div>
  )
}

export default UploadZone