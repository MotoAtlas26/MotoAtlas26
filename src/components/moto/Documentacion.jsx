import React, { useState, useEffect, useCallback } from 'react'
import { useDatabase } from '../../hooks/useDatabase'
import { useGPX } from '../../context/GPXContext'
import { Modal, SectionHeader, BlobImage } from '../shared'
import { formatDate, formatFileSize } from '../../utils/formatters'
import { getMotoModel, getMotoModelsArray } from '../../constants/motoModels'
import { TrashIcon, EditIcon, EyeIcon, DownloadIcon, AlertIcon, CheckIcon, CalendarIcon, PhoneIcon, ShieldIcon, FileIcon, UploadIcon } from '../shared/Icons'

const DOC_TYPES = [
  { value: 'itv', label: 'Ficha Técnica / ITV', icon: '📋' },
  { value: 'circulation', label: 'Permiso de Circulación', icon: '📄' },
  { value: 'insurance', label: 'Póliza / Recibo de Seguro', icon: '🛡️' },
  { value: 'manual', label: 'Manual de Propietario / Taller (PDF)', icon: '📖' },
  { value: 'other', label: 'Otros documentos', icon: '📁' }
]

const getDocTypeInfo = (type) => DOC_TYPES.find(t => t.value === type) || DOC_TYPES[4]

const getDaysUntil = (dateStr) => {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24))
  return diff
}

const getExpirationStatus = (days) => {
  if (days === null) return { label: 'Sin fecha', color: 'var(--color-text-secondary)', bg: 'var(--color-secondary-light)' }
  if (days < 0) return { label: `Caducado (${Math.abs(days)} días)`, color: 'var(--color-error)', bg: 'rgba(239, 68, 68, 0.1)' }
  if (days <= 30) return { label: `${days} días`, color: 'var(--color-secondary)', bg: 'rgba(245, 158, 11, 0.1)' }
  return { label: `${days} días`, color: 'var(--color-success)', bg: 'rgba(34, 197, 94, 0.1)' }
}

const isPDF = (mime) => mime === 'application/pdf'
const isImage = (mime) => mime?.startsWith('image/')

export const Documentacion = () => {
  const { selectedMoto } = useGPX()
  const motosArray = getMotoModelsArray()
  const {
    saveMotoDocument,
    getMotoDocumentsByMoto,
    getAllMotoDocuments,
    updateMotoDocument,
    deleteMotoDocument
  } = useDatabase()

  const [documents, setDocuments] = useState([])
  const [filterMotoId, setFilterMotoId] = useState(selectedMoto || '')
  const [filterType, setFilterType] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingDoc, setEditingDoc] = useState(null)
  const [viewerDoc, setViewerDoc] = useState(null)
  const [formData, setFormData] = useState({
    motoId: selectedMoto || '',
    docType: 'itv',
    title: '',
    expirationDate: '',
    policyNumber: '',
    assistancePhone: '',
    insurerName: '',
    notes: '',
    file: null
  })
  const [saving, setSaving] = useState(false)

  // Load documents
  const loadDocuments = useCallback(async () => {
    let docs = []
    if (filterMotoId) {
      docs = await getMotoDocumentsByMoto(filterMotoId)
    } else {
      docs = await getAllMotoDocuments()
    }
    if (filterType) {
      docs = docs.filter(d => d.docType === filterType)
    }
    setDocuments(docs)
  }, [filterMotoId, filterType, getMotoDocumentsByMoto, getAllMotoDocuments])

  useEffect(() => { loadDocuments() }, [loadDocuments])

  // Find insurance doc for roadside assistance card
  const insuranceDoc = documents.find(d => d.docType === 'insurance' && d.assistancePhone)
  const itvDoc = documents.find(d => d.docType === 'itv' && d.expirationDate)
  const insuranceExpirationDoc = documents.find(d => d.docType === 'insurance' && d.expirationDate)

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) setFormData(prev => ({ ...prev, file }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      let fileDataUrl = null
      let fileName = ''
      let fileMimeType = ''
      if (formData.file) {
        fileName = formData.file.name
        fileMimeType = formData.file.type
        fileDataUrl = await new Promise(resolve => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.readAsDataURL(formData.file)
        })
      }

      const docData = {
        motoId: formData.motoId,
        docType: formData.docType,
        title: formData.title,
        expirationDate: formData.expirationDate || null,
        policyNumber: formData.policyNumber || null,
        assistancePhone: formData.assistancePhone || null,
        insurerName: formData.insurerName || null,
        notes: formData.notes || null,
        fileName,
        fileMimeType,
        fileDataUrl
      }

      if (editingDoc) {
        await updateMotoDocument(editingDoc.id, docData)
      } else {
        await saveMotoDocument(docData)
      }
      resetForm()
      loadDocuments()
    } catch (err) {
      console.error('Error guardando documento:', err)
      alert('Error al guardar el documento')
    } finally {
      setSaving(false)
    }
  }

  const resetForm = () => {
    setFormData({
      motoId: selectedMoto || '',
      docType: 'itv',
      title: '',
      expirationDate: '',
      policyNumber: '',
      assistancePhone: '',
      insurerName: '',
      notes: '',
      file: null
    })
    setEditingDoc(null)
    setShowForm(false)
  }

  const handleEdit = (doc) => {
    setFormData({
      motoId: doc.motoId,
      docType: doc.docType,
      title: doc.title,
      expirationDate: doc.expirationDate || '',
      policyNumber: doc.policyNumber || '',
      assistancePhone: doc.assistancePhone || '',
      insurerName: doc.insurerName || '',
      notes: doc.notes || '',
      file: null
    })
    setEditingDoc(doc)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este documento?')) return
    await deleteMotoDocument(id)
    loadDocuments()
  }

  const handleView = (doc) => setViewerDoc(doc)
  const closeViewer = () => setViewerDoc(null)

  const downloadFile = (doc) => {
    if (!doc.fileDataUrl) return
    const a = document.createElement('a')
    a.href = doc.fileDataUrl
    a.download = doc.fileName || `documento-${doc.id}`
    a.click()
  }

  const renderFileViewer = (doc) => {
    if (!doc.fileDataUrl) return <p style={{ padding: 'var(--space-4)', textAlign: 'center', color: 'var(--color-text-secondary)' }}>Sin archivo adjunto</p>
    if (isPDF(doc.fileMimeType)) {
      return <iframe src={doc.fileDataUrl} style={{ width: '100%', height: '500px', border: 'none', borderRadius: 'var(--radius-sm)' }} title={doc.title} />
    }
    if (isImage(doc.fileMimeType)) {
      return <img src={doc.fileDataUrl} alt={doc.title} style={{ maxWidth: '100%', maxHeight: '500px', borderRadius: 'var(--radius-sm)', display: 'block', margin: '0 auto' }} />
    }
    return <p style={{ padding: 'var(--space-4)', textAlign: 'center' }}>Formato no previsualizable</p>
  }

  const AlertCard = ({ icon, title, children, variant = 'primary' }) => (
    <div style={{
      background: 'var(--color-card)',
      border: '1px solid var(--color-card-border)',
      borderRadius: 'var(--radius-card)',
      padding: 'var(--space-4)',
      display: 'flex',
      alignItems: 'center',
      gap: 'var(--space-3)',
      borderLeft: `4px solid var(--color-${variant})`
    }}>
      <span style={{ fontSize: '1.5rem' }}>{icon}</span>
      <div style={{ flex: 1 }}>
        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{title}</div>
        {children}
      </div>
    </div>
  )

  const ExpirationBadge = ({ label, days }) => {
    const { color, bg } = getExpirationStatus(days)
    return (
      <span style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-1)',
        padding: 'var(--space-1) var(--space-2)',
        borderRadius: 'var(--radius-full)',
        fontSize: '0.8rem',
        fontWeight: 600,
        background: bg,
        color
      }}>
        {label}
      </span>
    )
  }

  return (
    <>
      <SectionHeader
        title="Guantera Digital"
        subtitle="Documentación de tus motos: ITV, Seguro, Permiso, Manuales y más"
        actions={
          <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
            <UploadIcon size={18} style={{ marginRight: 'var(--space-1)' }} /> Añadir Documento
          </button>
        }
      />

      {/* Quick Access Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        {/* Roadside Assistance */}
        {insuranceDoc && (
          <AlertCard icon="📞" title="Asistencia en Carretera" variant="primary">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)', alignItems: 'center', marginTop: 'var(--space-2)' }}>
              <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                <ShieldIcon size={14} style={{ verticalAlign: 'middle', marginRight: 'var(--space-1)' }} />
                {insuranceDoc.insurerName || 'Aseguradora'}
              </span>
              {insuranceDoc.policyNumber && (
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.9rem' }}>
                  <FileIcon size={14} style={{ verticalAlign: 'middle', marginRight: 'var(--space-1)' }} />
                  Póliza: {insuranceDoc.policyNumber}
                </span>
              )}
              <a href={`tel:${insuranceDoc.assistancePhone}`} className="btn btn-primary" style={{ marginTop: 'var(--space-1)' }}>
                <PhoneIcon size={16} style={{ marginRight: 'var(--space-1)' }} /> Llamar Asistencia
              </a>
            </div>
          </AlertCard>
        )}

        {/* Expiration Traffic Lights */}
        <AlertCard icon="⏰" title="Próximos Vencimientos" variant="secondary">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <CalendarIcon size={16} style={{ color: 'var(--color-primary)' }} />
                <span>Próxima ITV</span>
              </span>
              {itvDoc ? (
                <ExpirationBadge label={getExpirationStatus(getDaysUntil(itvDoc.expirationDate)).label} days={getDaysUntil(itvDoc.expirationDate)} />
              ) : (
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>No registrada</span>
              )}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <ShieldIcon size={16} style={{ color: 'var(--color-secondary)' }} />
                <span>Renovación Seguro</span>
              </span>
              {insuranceExpirationDoc ? (
                <ExpirationBadge label={getExpirationStatus(getDaysUntil(insuranceExpirationDoc.expirationDate)).label} days={getDaysUntil(insuranceExpirationDoc.expirationDate)} />
              ) : (
                <span style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>No registrada</span>
              )}
            </div>
          </div>
        </AlertCard>
      </div>

      {/* Filters */}
      <div style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-card-border)',
        borderRadius: 'var(--radius-card)',
        padding: 'var(--space-3)',
        marginBottom: 'var(--space-4)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 'var(--space-3)',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Moto:</label>
          <select
            value={filterMotoId}
            onChange={e => setFilterMotoId(e.target.value)}
            className="form-select"
            style={{ minWidth: '180px' }}
          >
            <option value="">Todas las motos</option>
            {motosArray.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Tipo:</label>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="form-select"
            style={{ minWidth: '180px' }}
          >
            <option value="">Todos los tipos</option>
            {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
          </select>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      <Modal isOpen={showForm} onClose={resetForm} title={editingDoc ? 'Editar Documento' : 'Añadir Documento'} size="lg">
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
            <div>
              <label className="form-label">Moto *</label>
              <select value={formData.motoId} onChange={e => setFormData(prev => ({ ...prev, motoId: e.target.value }))} className="form-input" required>
                {motosArray.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Tipo de documento *</label>
              <select value={formData.docType} onChange={e => setFormData(prev => ({ ...prev, docType: e.target.value }))} className="form-input" required>
                {DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label">Título *</label>
            <input type="text" value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} className="form-input" placeholder="Ej: ITV 2024, Póliza MAPFRE, Manual taller..." required />
          </div>

          <div>
            <label className="form-label">Fecha de vencimiento / Próxima ITV</label>
            <input type="date" value={formData.expirationDate} onChange={e => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))} className="form-input" />
          </div>

          {/* Insurance-specific fields */}
          {formData.docType === 'insurance' && (
            <div style={{ background: 'var(--color-secondary-light)', borderRadius: 'var(--radius-card)', padding: 'var(--space-3)', border: '1px solid var(--color-card-border)' }}>
              <h4 style={{ margin: '0 0 var(--space-3)', color: 'var(--color-text-primary)', display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                <ShieldIcon size={20} /> Datos del Seguro
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)' }}>
                <div>
                  <label className="form-label">Aseguradora</label>
                  <input type="text" value={formData.insurerName} onChange={e => setFormData(prev => ({ ...prev, insurerName: e.target.value }))} className="form-input" placeholder="Ej: MAPFRE, AXA, Allianz..." />
                </div>
                <div>
                  <label className="form-label">Nº de Póliza</label>
                  <input type="text" value={formData.policyNumber} onChange={e => setFormData(prev => ({ ...prev, policyNumber: e.target.value }))} className="form-input" placeholder="Ej: POL-2024-123456" />
                </div>
                <div>
                  <label className="form-label">Tel. Asistencia en Carretera</label>
                  <input type="tel" value={formData.assistancePhone} onChange={e => setFormData(prev => ({ ...prev, assistancePhone: e.target.value }))} className="form-input" placeholder="Ej: 900 123 456" />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="form-label">Notas</label>
            <textarea value={formData.notes} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} className="form-input" rows={3} placeholder="Observaciones adicionales..." />
          </div>

          <div>
            <label className="form-label">Archivo (PDF, JPG, PNG, WEBP)</label>
            <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={handleFileChange} className="form-input" />
            {formData.file && <p style={{ marginTop: 'var(--space-1)', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{formData.file.name} ({formatFileSize(formData.file.size)})</p>}
            {editingDoc?.fileDataUrl && !formData.file && <p style={{ marginTop: 'var(--space-1)', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Archivo actual: {editingDoc.fileName}</p>}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
            <button type="button" className="btn btn-secondary" onClick={resetForm}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Guardando...' : (editingDoc ? 'Actualizar' : 'Guardar')}
            </button>
          </div>
        </form>
      </Modal>

      {/* Document Viewer Modal */}
      <Modal isOpen={!!viewerDoc} onClose={closeViewer} title={viewerDoc?.title || 'Ver Documento'} size="xl">
        {viewerDoc && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--color-card-border)' }}>
              <div>
                <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Moto: </span>
                <strong>{getMotoModel(viewerDoc.motoId)?.name || viewerDoc.motoId}</strong>
                <span style={{ marginLeft: 'var(--space-3)', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Tipo: </span>
                <span style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600 }}>
                  {getDocTypeInfo(viewerDoc.docType).icon} {getDocTypeInfo(viewerDoc.docType).label}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button className="btn-outline" onClick={() => downloadFile(viewerDoc)}>
                  <DownloadIcon size={16} style={{ marginRight: 'var(--space-1)' }} /> Descargar
                </button>
              </div>
            </div>
            <div style={{ background: 'var(--color-secondary-light)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
              {renderFileViewer(viewerDoc)}
            </div>
            {viewerDoc.notes && (
              <div style={{ padding: 'var(--space-3)', background: 'var(--color-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-card-border)' }}>
                <strong>Notas:</strong> {viewerDoc.notes}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Documents List */}
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
        {documents.length === 0 ? (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
            <FileIcon size={48} style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }} />
            <h3 style={{ margin: '0 0 var(--space-2)', color: 'var(--color-text-primary)' }}>Sin documentos</h3>
            <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
              {filterMotoId ? 'Esta moto no tiene documentos registrados.' : 'No hay documentos que coincidan con los filtros.'}
            </p>
            <button className="btn btn-primary" onClick={() => { resetForm(); setShowForm(true); }}>
              <UploadIcon size={18} style={{ marginRight: 'var(--space-1)' }} /> Añadir primer documento
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-3)', padding: 'var(--space-3)' }}>
            {documents.map(doc => {
              const moto = getMotoModel(doc.motoId)
              const typeInfo = getDocTypeInfo(doc.docType)
              const daysLeft = doc.expirationDate ? getDaysUntil(doc.expirationDate) : null
              const status = daysLeft !== null ? getExpirationStatus(daysLeft) : null

              return (
                <div key={doc.id} style={{
                  background: 'var(--color-background)',
                  border: '1px solid var(--color-card-border)',
                  borderRadius: 'var(--radius-card)',
                  padding: 'var(--space-3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 'var(--space-2)',
                  transition: 'box-shadow 0.2s',
                  position: 'relative'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                      <span style={{ fontSize: '1.5rem' }}>{typeInfo.icon}</span>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--color-text-primary)' }}>{doc.title}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>{moto?.name || doc.motoId}</div>
                      </div>
                    </div>
                    <span style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: status?.bg || 'var(--color-secondary-light)',
                      color: status?.color || 'var(--color-text-secondary)',
                      textTransform: 'uppercase'
                    }}>
                      {typeInfo.label}
                    </span>
                  </div>

                  {doc.expirationDate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', paddingTop: 'var(--space-1)' }}>
                      <CalendarIcon size={14} style={{ color: status?.color || 'var(--color-text-secondary)' }} />
                      <span style={{ fontSize: '0.85rem', fontWeight: 500, color: status?.color || 'var(--color-text-primary)' }}>
                        {status?.label || formatDate(doc.expirationDate)}
                      </span>
                    </div>
                  )}

                  {doc.docType === 'insurance' && doc.assistancePhone && (
                    <a href={`tel:${doc.assistancePhone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: '0.85rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>
                      <PhoneIcon size={14} /> {doc.assistancePhone}
                    </a>
                  )}

                  {doc.policyNumber && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      <FileIcon size={12} style={{ verticalAlign: 'middle', marginRight: 'var(--space-1)' }} />
                      Póliza: {doc.policyNumber}
                    </div>
                  )}

                  {doc.insurerName && (
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      <ShieldIcon size={12} style={{ verticalAlign: 'middle', marginRight: 'var(--space-1)' }} />
                      {doc.insurerName}
                    </div>
                  )}

                  {doc.fileName && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: '0.8rem', color: 'var(--color-text-secondary)', marginTop: 'var(--space-1)' }}>
                      {isPDF(doc.fileMimeType) ? <FileIcon size={14} /> : <FileIcon size={14} />}
                      {doc.fileName} ({formatFileSize(doc.fileDataUrl?.length || 0)})
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)', paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-card-border)' }}>
                    <button className="btn-outline btn-sm" onClick={() => handleView(doc)} style={{ flex: 1 }}>
                      <EyeIcon size={14} style={{ marginRight: 'var(--space-1)' }} /> Ver
                    </button>
                    <button className="btn-outline btn-sm" onClick={() => handleEdit(doc)} style={{ flex: 1 }}>
                      <EditIcon size={14} style={{ marginRight: 'var(--space-1)' }} /> Editar
                    </button>
                    <button className="btn-danger btn-sm" onClick={() => handleDelete(doc.id)} style={{ flex: 1 }}>
                      <TrashIcon size={14} style={{ marginRight: 'var(--space-1)' }} /> Eliminar
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

export default Documentacion