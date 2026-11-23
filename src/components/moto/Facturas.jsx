import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ImageUpload } from '../upload/ImageUpload'
import { db } from '../../services/db'
import { useGPX } from '../../context/GPXContext'
import { EmptyState, Modal, SectionHeader, BlobImage } from '../shared'
import { formatFileSize, formatDate, getFileIcon } from '../../utils/formatters'
import { getMotoModel, getMotoModelsArray } from '../../constants/motoModels'
import { TrashIcon, UploadIcon } from '../shared/Icons'
import { useBlobUrl } from '../../hooks/useBlobUrl'
import invoiceParser from '../../utils/invoiceParser'
const { categorizeItem, extractTextFromPDF, parseInvoiceText, parseInvoiceFile, matchWorkshop } = invoiceParser

/**
 * Invoice Item Row Component
 */
const InvoiceItemRow = ({ item, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [desc, setDesc] = useState(item.description)
  const [qty, setQty] = useState(item.quantity)
  const [price, setPrice] = useState(item.unitPrice)

  const subtotal = qty * price

  if (!isEditing) {
    return (
      <div className="invoice-item-row" onClick={() => setIsEditing(true)}>
        <span className="item-desc">{item.description}</span>
        <span className="item-qty">{item.quantity} x</span>
        <span className="item-price">{item.unitPrice.toFixed(2)} €</span>
        <span className="item-subtotal">{subtotal.toFixed(2)} €</span>
      </div>
    )
  }

  return (
    <div className="invoice-item-row editing">
      <input
        type="text"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        className="form-input form-input-sm"
        placeholder="Descripción"
      />
      <input
        type="number"
        value={qty}
        onChange={(e) => setQty(parseFloat(e.target.value) || 0)}
        className="form-input form-input-sm"
        min="0"
        step="0.01"
        placeholder="Cant."
      />
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
        className="form-input form-input-sm"
        min="0"
        step="0.01"
        placeholder="€/u."
      />
      <span className="item-subtotal">{subtotal.toFixed(2)} €</span>
      <button
        type="button"
        className="btn-danger btn-danger-sm"
        onClick={() => {
          setIsEditing(false)
          onDelete(item.id)
        }}
      >
        Cancelar
      </button>
    </div>
  )
}

/**
 * Invoice Form Component
 */
const InvoiceForm = ({
  open,
  setOpen,
  motos,
  workshops,
  selectedMotoId,
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

  return (
    <div className="invoice-form">
      <SectionHeader
        title="Subir y Registrar Factura"
        subtitle="Sube un PDF o imagen para registrar la factura automáticamente"
      />

      {/* PDF Upload Zone */}
      <div className="upload-zone" onClick={e => e.target.querySelector('input').click()}>
        <UploadIcon size={48} className="zone-icon" />
        <h4>Arrastra y suelta tu factura aquí</h4>
        <p>Formatos: PDF (.pdf), Imágenes (.jpg, .png, .webp)</p>
        {fileLoading && <p className="small-text">Analizando factura…</p>}
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
      </div>

      {/* Parsed Data Preview */}
      {parsedData && (
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
      )}

      {/* Manual items section when no parsed data or user wants to add own lines */}
      {(!parsedData || parsedData.items.length === 0) && itemsManual.length === 0 && (
        <div className="manual-items-section">
          <h5>Líneas de factura</h5>
          <p className="small-text">Añade líneas de concepto y precio manualmente</p>
          <div className="items-list">
            {itemsManual.map((item) => (
              <InvoiceItemRow
                key={item.id}
                item={item}
                onDelete={(id) => setItemsManual(itemsManual.filter(i => i.id !== id))}
              />
            ))}
            <button
              type="button"
              className="btn-primary btn-small"
              onClick={() => {
                const newItem = {
                  id: crypto.randomUUID(),
                  description: '',
                  category: 'Otros',
                  quantity: 1,
                  unitPrice: 0
                }
                setItemsManual([...itemsManual, newItem])
              }}
            >
              + Añadir línea
            </button>
          </div>
        </div>
      )}

      {/* Form Fields */}
      <div className="form-grid">
        <div className="form-group">
          <label>Moto</label>
          <select
            value={selectedMotoId || ''}
            onChange={(e) => setSelectedMotoId(e.target.value)}
            disabled={open && !initialData.id}
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

      {/* Items Table */}
      <div className="items-table">
        <h5>Líneas de factura</h5>
        <p className="small-text">
          {parsedData?.items?.length > 0
            ? `${parsedData.items.length} línea(s) detectada(s) del PDF`
            : 'Añade líneas de concepto + precio'}
        </p>
        <div className="items-list">
          {parsedData?.items?.map((item) => (
            <InvoiceItemRow
              key={item.id}
              item={item}
              onDelete={(id) => {
                // Remove item from parsed data
                const remaining = parsedData.items.filter(i => i.id !== id)
                setParsedData({ ...parsedData, items: remaining })
              }}
            />
          ))}

          {(!parsedData?.items || parsedData.items.length === 0) && (
            <InvoiceItemRow
              item={{
                id: crypto.randomUUID(),
                description: '',
                category: 'Otros',
                quantity: 1,
                unitPrice: 0
              }}
              onDelete={() => {}}
            />
          )}
        </div>
        <button
          type="button"
          className="btn-primary btn-small"
          onClick={() => {
            // Add empty row
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
          }}
        >
          + Añadir línea
        </button>
      </div>

      {/* Summary */}
      <div className="summary-box">
        <div>Total:</div>
        <div>{(parsedData?.totalAmount || 0) + ' €'}</div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn-outline"
          onClick={setOpen}
          disabled={open && !initialData.id}
        >
          Cancelar
        </button>
        <button
          type="button"
          className="btn-primary"
          onClick={handleSave}
          disabled={!invoiceNumber || !date}
        >
          {open && initialData.id ? 'Actualizar' : 'Guardar Factura'}
        </button>
      </div>
    </div>
  )
}

/**
 * Invoice List Item Component
 */
const InvoiceListItem = ({
  invoice,
  selectedInvoiceId,
  onView,
  onEdit,
  onDelete,
  motos,
  workshops
}) => {
  const moto = motos.find((m) => m.id === invoice.motoId) || null
  const workshop = workshops.find((w) => w.id === invoice.workshopId) || null
  const workshopText = workshop ? workshop.name : 'Mantenimiento propio (DIY)'

  return (
    <div
      key={invoice.id}
      className={`invoice-item ${selectedInvoiceId === invoice.id ? 'active' : ''}`}
      onClick={() => onView(invoice)}
    >
      <span className="invoice-icon-sm">{getFileIcon(invoice.fileMimeType)}</span>
      <div className="invoice-item-info">
        <div className="invoice-item-name">
          {moto?.name || 'Moto desconocida'}
        </div>
        <div className="invoice-item-meta">
          <span>{formatDate(invoice.date)}</span>
          <span className="separator">•</span>
          <span>{invoice.invoiceNumber || '—'}</span>
          <span className="separator">•</span>
          <span>{workshopText}</span>
        </div>
      </div>
      <div className="invoice-item-actions">
        <button
          className="btn-view-sm"
          title="Ver"
          onClick={(e) => {
            e.stopPropagation()
          }}
          >
          Ver
        </button>
        <button
          className="btn-edit-sm"
          title="Editar"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(invoice)
          }}
        >
          Editar
        </button>
        <button
          className="btn-delete-sm"
          title="Eliminar"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(invoice.id)
          }}
        >
          <TrashIcon size={18} />
        </button>
      </div>
    </div>
  )
}

/* ============================================================
   FACTURAS COMPONENT
   ============================================================ */

export const Facturas = () => {
  const { selectedMoto } = useGPX()
  const [invoices, setInvoices] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [openInvoiceForm, setOpenInvoiceForm] = useState(false)
  const moto = getMotoModel(selectedMoto)

  // Load motos and workshops
  const loadMotos = useCallback(async () => {
    // Motos are already in Dexie from garage
    return await db.getAllMotorcycles()
  }, [])

  const loadWorkshops = useCallback(async () => {
    return await db.getAllWorkshops()
  }, [])

  useEffect(() => {
    // Load data when moto changes
    if (selectedMoto) {
      loadInvoices()
    }
  }, [selectedMoto])

  // Cargar facturas de la moto seleccionada
  const loadInvoices = useCallback(async () => {
    try {
      const invs = await db.getInvoicesByMoto(selectedMoto)
      setInvoices(invs)
    } catch (error) {
      console.error('Error cargando facturas:', error)
    }
  }, [selectedMoto])

  // Cargar datos iniciales
  useEffect(() => {
    if (selectedMoto) {
      loadInvoices().then(() => loadMotos().then(motos => loadWorkshops().then(workshops => {})))
    }
  }, [selectedMoto, loadInvoices, loadMotos, loadWorkshops])

  const handleDeleteInvoice = async (id) => {
    try {
      await db.deleteInvoice(id)
      loadInvoices()
      if (selectedInvoice?.id === id) {
        setSelectedInvoice(null)
      }
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Error eliminando factura:', error)
    }
  }

  const openInvoice = (invoice) => {
    setSelectedInvoice(invoice)
  }

  const openInvoiceFormModal = useCallback(async () => {
    try {
      const motos = await loadMotos()
      const workshops = await loadWorkshops()
      setOpenInvoiceForm(true)
      // We'll set the data when the modal opens
    } catch (error) {
      console.error('Error cargando datos del formulario:', error)
    }
  }, [loadMotos, loadWorkshops])

  const handleSaveInvoice = useCallback(async (invoiceData) => {
    try {
      await db.saveInvoice(invoiceData)
      loadInvoices()
      setOpenInvoiceForm(false)
    } catch (error) {
      console.error('Error guardando factura:', error)
    }
  }, [loadInvoices])

  const handleEditInvoice = useCallback(async (invoice) => {
    try {
      const motos = await loadMotos()
      const workshops = await loadWorkshops()
      setOpenInvoiceForm(true)
      // Pre-fill form with existing invoice data
      // The modal will handle this
    } catch (error) {
      console.error('Error preparando edición:', error)
    }
  }, [loadMotos, loadWorkshops])

  // ===== VISOR DE FACTURA =====
  const selectedInvoiceUrl = useBlobUrl(selectedInvoice?.blob || null)

  // ===== RETURN =====
  return (
    <>
      <SectionHeader
        title={`Facturas - ${moto.name}`}
        subtitle="Gestión de facturas y documentación"
        actions={
          <div className="header-actions">
            <Link to="/moto" className="btn-outline">
              📂 Volver al Dashboard
            </Link>
            <button
              className="btn-primary"
              onClick={openInvoiceFormModal}
            >
              Documentos Subir Factura
            </button>
          </div>
        }
      />

      <div className="facturas-layout">
        <aside className="facturas-list">
          <div className="list-header">
            <h3>Facturas ({invoices.length})</h3>
          </div>
          <div className="invoices-scroll">
            {invoices.length === 0 ? (
              <EmptyState
                icon="Documentos"
                title="No hay facturas"
                description="Sube tu primera factura desde el dashboard de la moto"
                action={
                  <Link to="/moto/facturas" className="btn-primary">
                    Subir Facturas
                  </Link>
                }
              />
            ) : (
              invoices.map((invoice) => (
                <InvoiceListItem
                  key={invoice.id}
                  invoice={invoice}
                  selectedInvoiceId={selectedInvoice?.id}
                  onView={(inv) => openInvoice(inv)}
                  onEdit={() => handleEditInvoice(invoice)}
                  onDelete={(id) => handleDeleteInvoice(id)}
                  motos={[]} // Will be loaded in useEffect
                  workshops={[]}
                />
              ))
            )}
          </div>
        </aside>

        <section className="facturas-viewer">
          {selectedInvoice ? (
            <div className="viewer-container">
              <div className="viewer-header">
                <h3>{selectedInvoice.fileName}</h3>
                <button
                  className="btn-close-viewer"
                  onClick={() => setSelectedInvoice(null)}
                  title="Close"
                >
                  Cancelar
                </button>
              </div>
              <div className="viewer-content">
                {selectedInvoice && selectedInvoiceUrl && (
                  selectedInvoice.mimeType?.startsWith('image/') ? (
                    <img
                      src={selectedInvoiceUrl}
                      alt={selectedInvoice.fileName}
                      className="viewer-image"
                    />
                  ) : (
                    <iframe
                      src={selectedInvoiceUrl}
                      title={selectedInvoice.fileName}
                      className="viewer-iframe"
                    />
                  )
                )}
                {selectedInvoice.items && selectedInvoice.items.length > 0 && (
                  <div className="invoice-breakdown">
                    <h4>Desglose de la factura</h4>
                    <table>
                      <thead>
                        <tr>
                          <th>Concepto</th>
                          <th>Cantidad</th>
                          <th>Precio u.</th>
                          <th>Subtotal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedInvoice.items.map((item) => (
                          <tr key={item.id}>
                            <td>{item.description}</td>
                            <td>{item.quantity}</td>
                            <td>{item.unitPrice.toFixed(2)} €</td>
                            <td>{item.subtotal.toFixed(2)} €</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <tfoot>
                      <tr>
                        <td></td>
                        <td></td>
                        <td>Total</td>
                        <td>{selectedInvoice.totalAmount.toFixed(2)} €</td>
                      </tr>
                    </tfoot>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <EmptyState
              icon="Documentos"
              title="Selecciona una factura"
              description="Haz clic en una factura de la lista para verla aquí"
            />
          )}
        </section>
      </div>

      <Modal
        isOpen={openInvoiceForm}
        onClose={() => setOpenInvoiceForm(false)}
        title={selectedInvoice ? 'Editar Factura' : 'Subir y Registrar Factura'}
        size="lg"
      >
        <InvoiceForm
          open={openInvoiceForm}
          setOpen={setOpenInvoiceForm}
          motos={[]} // Load inside
          workshops={[]} // Load inside
          selectedMotoId: selectedMoto
          onSave={handleSaveInvoice}
          initialData={selectedInvoice || {}}
        />
      </Modal>

      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Eliminar factura"
        size="sm"
      >
        <p>¿Estás seguro de eliminar <strong>{showDeleteConfirm?.fileName}</strong>?</p>
        <div className="modal-footer">
          <button className="btn-outline" onClick={() => setShowDeleteConfirm(null)}>
            Cancelar
          </button>
          <button className="btn-danger" onClick={() => handleDeleteInvoice(showDeleteConfirm.id)}>
            Eliminar
          </button>
        </div>
      </Modal>
    </>
  )
}

export default Facturas