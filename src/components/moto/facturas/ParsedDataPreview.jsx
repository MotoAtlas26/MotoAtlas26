import React from 'react'

export const ParsedDataPreview = ({ parsedData }) => {
  if (!parsedData) return null

  return (
    <div className="parsed-preview">
      <h5>📋 Datos extraídos automáticamente — revisa antes de guardar</h5>
      <div className="parsed-row">
        <span>Fecha:</span>
        <span>{parsedData.date || 'No detectada'}</span>
      </div>
      <div className="parsed-row">
        <span>Nº Factura:</span>
        <span>{parsedData.invoiceNumber || 'No detectado'}</span>
      </div>
      <div className="parsed-row">
        <span>Kilometraje:</span>
        <span>{parsedData.odometerKm !== null ? parsedData.odometerKm + ' km' : 'No detectado'}</span>
      </div>
      <div className="parsed-row">
        <span>Taller:</span>
        <span>{parsedData.workshopMatch?.name || 'No detectado'}</span>
      </div>
      {parsedData.items && parsedData.items.length > 0 && (
        <div>
          <span>Líneas detectadas:</span>
          <span>{parsedData.items.length}</span>
        </div>
      )}
      <div className="parsed-row">
        <span>Total:</span>
        <span>{parsedData.totalAmount !== null ? parsedData.totalAmount + ' €' : 'No detectado'}</span>
      </div>
    </div>
  )
}

export default ParsedDataPreview