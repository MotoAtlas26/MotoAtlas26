import React from 'react'

export const FormFields = ({
  selectedMotoId,
  setSelectedMotoId,
  workshopId,
  setWorkshopId,
  date,
  setDate,
  odometerKm,
  setOdometerKm,
  invoiceNumber,
  setInvoiceNumber,
  notes,
  setNotes,
  motos,
  workshops,
  disabled = false
}) => {
  return (
    <div className="form-grid">
      <div className="form-group">
        <label>Moto</label>
        <select
          value={selectedMotoId || ''}
          onChange={(e) => setSelectedMotoId(e.target.value)}
          disabled={disabled}
          className="form-select"
        >
          <option value="">-- Selecciona una moto --</option>
          {motos.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label>Taller / Origen</label>
        <select
          value={workshopId || ''}
          onChange={(e) => setWorkshopId(e.target.value)}
          className="form-select"
        >
          <option value="">-- Selecciona un taller --</option>
          {workshops.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
          <option value="diy">DIY (Mantenimiento propio)</option>
        </select>
      </div>

      <div className="form-group">
        <label>Fecha</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="form-input"
        />
      </div>

      <div className="form-group">
        <label>Kilómetros actuales</label>
        <input
          type="number"
          value={odometerKm}
          onChange={(e) => setOdometerKm(parseFloat(e.target.value) || 0)}
          className="form-input"
          min="0"
          step="1"
          placeholder="Ej: 15240"
        />
      </div>

      <div className="form-group">
        <label>Nº Factura</label>
        <input
          type="text"
          value={invoiceNumber}
          onChange={(e) => setInvoiceNumber(e.target.value)}
          className="form-input"
          placeholder="Ej: F-2024-001"
        />
      </div>

      <div className="form-group">
        <label>Notas</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="form-textarea"
          rows={3}
          placeholder="Notas adicionales..."
        ></textarea>
      </div>
    </div>
  )
}

export default FormFields