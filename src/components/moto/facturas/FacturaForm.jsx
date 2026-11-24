import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { db } from '../../../services/db'
import { SectionHeader } from '../../shared'
import invoiceParser from '../../../utils/invoiceParser'
import { UploadZone } from './UploadZone'
import { ParsedDataPreview } from './ParsedDataPreview'
import { FormFields } from './FormFields'
import { TrashIcon } from '../../shared/Icons'
const { parseInvoiceFile } = invoiceParser

export const FacturaForm = ({
  open,
  setOpen,
  motos,
  workshops,
  selectedMotoId: initialSelectedMotoId,
  onSave,
  initialData = {}
}) => {
  const [
    date,
    setDate
  ] = useState(initialData.date || '')
  const [
    invoiceNumber,
    setInvoiceNumber
  ] = useState(initialData.invoiceNumber || '')
  const [
    odometerKm,
    setOdometerKm
  ] = useState(initialData.odometerKm || 0)
  const [
    workshopId,
    setWorkshopId
  ] = useState(initialData.workshopId || null)
  const [
    notes,
    setNotes
  ] = useState(initialData.notes || '')
  const [
    file,
    setFile
  ] = useState(initialData.file || null)
  const [
    parsedData,
    setParsedData
  ] = useState(null)
  const [
    fileLoading,
    setFileLoading
  ] = useState(false)
  const [
    itemsManual,
    setItemsManual
  ] = useState([])
  // Local state for moto selection, initialized from prop
  const [selectedMotoId, setSelectedMotoId] = useState(initialSelectedMotoId || initialData.motoId || '')

  // Unified items array: combines parsed items + manual items
  const [items, setItems] = useState(() => {
    const parsed = parsedData?.items || []
    const manual = initialData.items || itemsManual || []
    // Normalize parsed items (handle concept/price from PDF parser)
    const normalizedParsed = parsed.map(item => ({
      id: item.id || crypto.randomUUID(),
      description: item.description || item.concept || '',
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || Number(item.price) || 0
    }))
    const normalizedManual = manual.map(item => ({
      id: item.id || crypto.randomUUID(),
      description: item.description || item.concept || '',
      quantity: Number(item.quantity) || 1,
      unitPrice: Number(item.unitPrice) || Number(item.price) || 0
    }))
    return [...normalizedParsed, ...normalizedManual]
  })

  // Computed total from all items
  const totalAmount = useMemo(() => {
    return items.reduce((acc, item) => {
      const qty = Number(item.quantity) || 0
      const price = Number(item.unitPrice) || 0
      return acc + qty * price
    }, 0)
  }, [items])

  // Add a new empty line
  const handleAddItem = useCallback(() => {
    setItems(prev => [...prev, {
      id: crypto.randomUUID(),
      description: '',
      quantity: 1,
      unitPrice: 0
    }])
  }, [])

  // Delete a line by id
  const handleDeleteItem = useCallback((id) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }, [])

  // Update a line field
  const handleUpdateItem = useCallback((id, field, value) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }, [])

  // Reset form when initialData changes (for edit mode)
  useEffect(() => {
    if (initialData) {
      setDate(initialData.date || '')
      setInvoiceNumber(initialData.invoiceNumber || '')
      setOdometerKm(initialData.odometerKm || 0)
      setWorkshopId(initialData.workshopId || null)
      setNotes(initialData.notes || '')
      setFile(initialData.file || null)
      setParsedData(initialData.parsedData || null)
      setItemsManual(initialData.itemsManual || [])
      setSelectedMotoId(initialData.motoId || '')
      // Reset items from initialData
      const parsed = initialData.parsedData?.items || []
      const manual = initialData.items || initialData.itemsManual || []
      const normalizedParsed = parsed.map(item => ({
        id: item.id || crypto.randomUUID(),
        description: item.description || item.concept || '',
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice) || Number(item.price) || 0
      }))
      const normalizedManual = manual.map(item => ({
        id: item.id || crypto.randomUUID(),
        description: item.description || item.concept || '',
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice) || Number(item.price) || 0
      }))
      setItems([...normalizedParsed, ...normalizedManual])
    }
  }, [initialData])

  // Parse PDF on file select
  const handleFileChange = useCallback(async (e) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    setFile(selectedFile)

    try {
      setParsedData(null)
      setFileLoading(true)
      // Get workshops from DB if not provided
      const workshopsList = workshops || await db.getAllWorkshops()
      const result = await parseInvoiceFile(selectedFile, workshopsList)
      setParsedData(result)
      setFileLoading(false)

      // Auto-fill form if data was extracted
      if (result.date) setDate(result.date)
      if (result.invoiceNumber) setInvoiceNumber(result.invoiceNumber)
      if (result.odometerKm !== null) setOdometerKm(result.odometerKm)
      if (result.workshopMatch) setWorkshopId(result.workshopId)
      if (result.totalAmount !== null) {
        // Set total amount as initial reference
      }
      if (result.items && result.items.length > 0) {
        // Show extracted items notice
      }
    } catch (error) {
      setFileLoading(false)
      console.error('Error parsing invoice PDF:', error)
    }
  }, [workshops])

  // Save invoice
  const handleSave = useCallback(async () => {
    // Validation: moto obligatoria, fecha obligatoria, al menos una línea o importe > 0
    if (!selectedMotoId) {
      alert('Selecciona una moto primero')
      return
    }
    if (!date) {
      alert('La fecha es obligatoria')
      return
    }
    if (items.length === 0 && totalAmount <= 0) {
      alert('Añade al menos una línea de factura o un importe mayor a 0')
      return
    }

    const invoiceData = {
      motoId: selectedMotoId,
      workshopId: workshopId || null,
      date: date,
      odometerKm: odometerKm,
      invoiceNumber: invoiceNumber,
      totalAmount: totalAmount,
      notes,
      items: items.map(item => ({
        id: item.id,
        description: item.description,
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice) || 0
      })),
      fileName: file?.name || '',
      fileMimeType: file?.type || 'application/pdf',
      fileDataUrl: file ? URL.createObjectURL(file) : null
    }

    await onSave(invoiceData)
    setOpen(false)
  }, [selectedMotoId, workshopId, date, odometerKm, invoiceNumber, notes, file, onSave, items, totalAmount])

  return (
    <div className="invoice-form">
      <SectionHeader
        title={initialData.id ? 'Editar Factura' : 'Subir y Registrar Factura'}
        subtitle="Sube un PDF o imagen para registrar la factura automáticamente"
      />

      {/* PDF Upload Zone */}
      <UploadZone file={file} fileLoading={fileLoading} onFileChange={handleFileChange} />

      {/* Parsed Data Preview */}
      <ParsedDataPreview parsedData={parsedData} />

      {/* Form Fields */}
      <FormFields
        selectedMotoId={selectedMotoId}
        setSelectedMotoId={setSelectedMotoId}
        workshopId={workshopId}
        setWorkshopId={setWorkshopId}
        date={date}
        setDate={setDate}
        odometerKm={odometerKm}
        setOdometerKm={setOdometerKm}
        invoiceNumber={invoiceNumber}
        setInvoiceNumber={setInvoiceNumber}
        notes={notes}
        setNotes={setNotes}
        motos={motos}
        workshops={workshops}
        disabled={open && !initialData.id}
      />

      {/* Líneas de factura - Tabla editable directa */}
      <div className="items-table">
        <h5>Líneas de factura</h5>
        <p className="small-text">
          {parsedData?.items?.length > 0
            ? `${parsedData.items.length} línea(s) detectada(s) del PDF`
            : 'Añade líneas de concepto + precio'}
        </p>

        {/* Cabecera de columnas */}
        <div className="items-header" style={{
          display: 'grid',
          gridTemplateColumns: '1fr 85px 115px 95px 40px',
          gap: '0.6rem',
          fontWeight: 600,
          fontSize: '0.8rem',
          color: 'var(--color-text-secondary)',
          padding: '0.4rem 0',
          borderBottom: '1px solid var(--color-border)'
        }}>
          <span>Descripción / Concepto</span>
          <span>Cant.</span>
          <span>Precio (€)</span>
          <span>Subtotal</span>
          <span></span>
        </div>

        {/* Filas de items */}
        <div className="items-list">
          {items.length === 0 ? (
            <div className="empty-items" style={{
              padding: '1rem',
              textAlign: 'center',
              color: 'var(--color-text-secondary)',
              fontSize: '0.9rem'
            }}>
              No hay líneas. Pulsa "+ Añadir línea" para empezar.
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="item-row"
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 85px 115px 95px 40px',
                  gap: '0.6rem',
                  alignItems: 'center',
                  padding: '0.5rem 0',
                  borderBottom: '1px solid var(--color-border)'
                }}
              >
                <input
                  type="text"
                  value={item.description}
                  onChange={(e) => handleUpdateItem(item.id, 'description', e.target.value)}
                  placeholder="Ej. Cambio aceite y filtro"
                  className="form-input"
                  style={{ fontSize: '0.9rem' }}
                />
                <input
                  type="number"
                  value={item.quantity}
                  onChange={(e) => handleUpdateItem(item.id, 'quantity', Math.max(1, parseInt(e.target.value) || 1))}
                  min="1"
                  step="1"
                  className="form-input"
                  style={{ fontSize: '0.9rem', textAlign: 'center' }}
                />
                <input
                  type="number"
                  value={item.unitPrice}
                  onChange={(e) => handleUpdateItem(item.id, 'unitPrice', Math.max(0, parseFloat(e.target.value) || 0))}
                  min="0"
                  step="0.01"
                  className="form-input"
                  style={{ fontSize: '0.9rem', textAlign: 'right' }}
                />
                <span style={{
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textAlign: 'right',
                  color: 'var(--color-text)'
                }}>
                  {((Number(item.quantity) || 0) * (Number(item.unitPrice) || 0)).toFixed(2)} €
                </span>
                <button
                  type="button"
                  className="btn btn-danger btn-sm"
                  style={{ padding: '0.25rem', minWidth: 'auto' }}
                  onClick={() => handleDeleteItem(item.id)}
                  title="Eliminar línea"
                >
                  <TrashIcon size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Botón añadir línea */}
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={handleAddItem}
          style={{ marginTop: '0.75rem' }}
        >
          + Añadir línea
        </button>
      </div>

      {/* Total en tiempo real */}
      <div className="summary-box" style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem',
        background: 'var(--color-bg-elevated)',
        borderRadius: 'var(--radius-md)',
        marginTop: '1rem',
        fontSize: '1.1rem',
        fontWeight: 600
      }}>
        <span>Total:</span>
        <span style={{ color: 'var(--color-primary)' }}>{totalAmount.toFixed(2)} €</span>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => onCancel?.()}
          disabled={open && !initialData.id}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSave}
          disabled={!invoiceNumber || !date}
        >
          {initialData.id ? 'Actualizar' : 'Guardar Factura'}
        </button>
      </div>
    </div>
  )
}

export default FacturaForm