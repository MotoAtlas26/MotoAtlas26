import React, { useState, useCallback, useEffect } from 'react'
import { db } from '../../../services/db'
import { SectionHeader } from '../../shared'
import invoiceParser from '../../../utils/invoiceParser'
import { UploadZone } from './UploadZone'
import { ParsedDataPreview } from './ParsedDataPreview'
import { FormFields } from './FormFields'
import { ItemsTable } from './ItemsTable'
import { ManualItemsSection } from './ManualItemsSection'
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
    const hasItems = parsedData?.items && parsedData.items.length > 0
    const hasManualItem = itemsManual && itemsManual.length > 0
    const totalCents = (parsedData?.totalAmount || 0) + (hasManualItem ? itemsManual.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0) : 0)
    if (!hasItems && !hasManualItem && totalCents <= 0) {
      alert('Añade al menos una línea de factura o un importe mayor a 0')
      return
    }

    const invoiceData = {
      motoId: selectedMotoId,
      workshopId: workshopId || null,
      date: date,
      odometerKm: odometerKm,
      invoiceNumber: invoiceNumber,
      totalAmount: parsedData?.totalAmount || 0,
      notes,
      items: parsedData?.items || (hasManualItem ? itemsManual : []),
      fileName: file?.name || '',
      fileMimeType: file?.type || 'application/pdf',
      fileDataUrl: file ? URL.createObjectURL(file) : null
    }

    await onSave(invoiceData)
    setOpen(false)
  }, [selectedMotoId, workshopId, date, odometerKm, invoiceNumber, parsedData, notes, file, onSave, itemsManual])

  const handleAddItem = useCallback(() => {
    const newItem = {
      id: crypto.randomUUID(),
      description: '',
      category: 'Otros',
      quantity: 1,
      unitPrice: 0
    }
    let items = parsedData?.items ? [...parsedData.items] : []
    items.push(newItem)
    setParsedData({ ...parsedData, items })
  }, [parsedData])

  const handleDeleteParsedItem = useCallback((id) => {
    const remaining = parsedData.items.filter(i => i.id !== id)
    setParsedData({ ...parsedData, items: remaining })
  }, [parsedData])

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

      {/* Manual items section when no parsed data or user wants to add own lines */}
      {(!parsedData || parsedData.items.length === 0) && itemsManual.length === 0 && (
        <ManualItemsSection itemsManual={itemsManual} setItemsManual={setItemsManual} />
      )}

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

      {/* Items Table */}
      <ItemsTable
        parsedData={parsedData}
        itemsManual={itemsManual}
        setItemsManual={setItemsManual}
        onAddItem={handleAddItem}
        onDeleteParsedItem={handleDeleteParsedItem}
      />

      {/* Summary */}
      <div className="summary-box">
        <div>Total:</div>
        <div>{(parsedData?.totalAmount || 0) + ' €'}</div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-outline"
          onClick={() => setOpen(false)}
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