import React, { useState, useEffect, useCallback } from 'react'
import { useDatabase } from '../../../hooks/useDatabase'
import { useGPX } from '../../../context/GPXContext'
import { Modal, SectionHeader } from '../../shared'
import { formatDate, formatFileSize } from '../../../utils/formatters'
import { getMotoModel, getMotoModelsArray } from '../../../constants/motoModels'
import { TrashIcon, EditIcon, EyeIcon, DownloadIcon, CalendarIcon, PhoneIcon, ShieldIcon, FileIcon, UploadIcon } from '../../shared/Icons'
import { DocumentacionForm } from './DocumentacionForm'
import { DocumentacionViewer } from './DocumentacionViewer'
import { DocumentacionList } from './DocumentacionList'

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

export const Documentacion = () => {
  const { selectedMoto } = useGPX()
  const motosArray = getMotoModelsArray()
  const {
    saveMotoDocument,
    getMotoDocumentsByMoto,
    getAllMotoDocuments,
    updateMotoDocument,
    deleteMotoDocument,
    getAllDocumentTypes
  } = useDatabase()
  const [documents, setDocuments] = useState([])
  const [documentTypes, setDocumentTypes] = useState([])
  const [loadingDocTypes, setLoadingDocTypes] = useState(true)
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

  // Load document types from database
  useEffect(() => {
    const loadDocTypes = async () => {
      try {
        const types = await getAllDocumentTypes()
        setDocumentTypes(types)
        if (types.length > 0 && !types.find(t => t.code === formData.docType)) {
          setFormData(prev => ({ ...prev, docType: types[0].code }))
        }
      } catch (err) {
        console.error('Error loading document types:', err)
      } finally {
        setLoadingDocTypes(false)
      }
    }
    loadDocTypes()
  }, [getAllDocumentTypes, formData.docType])

  // Find insurance doc for roadside assistance card
  const insuranceDoc = documents.find(d => d.docType === 'insurance' && d.assistancePhone)
  const itvDoc = documents.find(d => d.docType === 'itv' && d.expirationDate)
  const insuranceExpirationDoc = documents.find(d => d.docType === 'insurance' && d.expirationDate)

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

      const selectedDocType = documentTypes.find(t => t.code === formData.docType)

      const docData = {
        motoId: formData.motoId,
        docType: formData.docType,
        title: formData.title,
        expirationDate: selectedDocType?.hasExpiration ? (formData.expirationDate || null) : null,
        policyNumber: selectedDocType?.isInsurance ? (formData.policyNumber || null) : null,
        assistancePhone: selectedDocType?.isInsurance ? (formData.assistancePhone || null) : null,
        insurerName: selectedDocType?.isInsurance ? (formData.insurerName || null) : null,
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
    const defaultDocType = documentTypes.length > 0 ? documentTypes[0].code : 'itv'
    setFormData({
      motoId: selectedMoto || '',
      docType: defaultDocType,
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
            {documentTypes.map(t => <option key={t.code} value={t.code}>{t.name}</option>)}
          </select>
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      <Modal isOpen={showForm} onClose={resetForm} title={editingDoc ? 'Editar Documento' : 'Añadir Documento'} size="lg">
        <DocumentacionForm
          formData={formData}
          setFormData={setFormData}
          documentTypes={documentTypes}
          motosArray={motosArray}
          editingDoc={editingDoc}
          saving={saving}
          onSubmit={handleSubmit}
          onCancel={resetForm}
        />
      </Modal>

      {/* Document Viewer Modal */}
      <Modal isOpen={!!viewerDoc} onClose={closeViewer} title={viewerDoc?.title || 'Ver Documento'} size="xl">
        <DocumentacionViewer
          viewerDoc={viewerDoc}
          documentTypes={documentTypes}
          getMotoModel={getMotoModel}
          onClose={closeViewer}
          onDownload={downloadFile}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </Modal>

      {/* Documents List */}
      <div style={{ background: 'var(--color-card)', border: '1px solid var(--color-card-border)', borderRadius: 'var(--radius-card)', overflow: 'hidden' }}>
        <DocumentacionList
          documents={documents}
          documentTypes={documentTypes}
          filterMotoId={filterMotoId}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>
    </>
  )
}

export default Documentacion