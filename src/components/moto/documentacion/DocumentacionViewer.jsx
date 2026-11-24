import React from 'react'
import { formatDate, formatFileSize } from '../../../utils/formatters'
import { DownloadIcon, EyeIcon, EditIcon, TrashIcon, CalendarIcon, PhoneIcon, ShieldIcon, FileIcon } from '../../shared/Icons'

const isPDF = (mime) => mime === 'application/pdf'
const isImage = (mime) => mime?.startsWith('image/')

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

export const DocumentacionViewer = ({ viewerDoc, documentTypes, getMotoModel, onClose, onDownload, onEdit, onDelete }) => {
  if (!viewerDoc) return null

  const docType = documentTypes.find(t => t.code === viewerDoc.docType) || { name: viewerDoc.docType }
  const moto = getMotoModel(viewerDoc.motoId)
  const daysLeft = viewerDoc.expirationDate ? (() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const target = new Date(viewerDoc.expirationDate)
    target.setHours(0, 0, 0, 0)
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24))
  })() : null

  const getExpirationStatus = (days) => {
    if (days === null) return { label: 'Sin fecha', color: 'var(--color-text-secondary)', bg: 'var(--color-secondary-light)' }
    if (days < 0) return { label: `Caducado (${Math.abs(days)} días)`, color: 'var(--color-error)', bg: 'rgba(239, 68, 68, 0.1)' }
    if (days <= 30) return { label: `${days} días`, color: 'var(--color-secondary)', bg: 'rgba(245, 158, 11, 0.1)' }
    return { label: `${days} días`, color: 'var(--color-success)', bg: 'rgba(34, 197, 94, 0.1)' }
  }

  const status = daysLeft !== null ? getExpirationStatus(daysLeft) : null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-2)', paddingBottom: 'var(--space-2)', borderBottom: '1px solid var(--color-card-border)' }}>
        <div>
          <span style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Moto: </span>
          <strong>{moto?.name || viewerDoc.motoId}</strong>
          <span style={{ marginLeft: 'var(--space-3)', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Tipo: </span>
          <span style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)', padding: '2px 8px', borderRadius: 'var(--radius-full)', fontSize: '0.75rem', fontWeight: 600 }}>
            {docType.name}
          </span>
        </div>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <button className="btn-outline" onClick={() => onDownload(viewerDoc)}>
            <DownloadIcon size={16} style={{ marginRight: 'var(--space-1)' }} /> Descargar
          </button>
        </div>
      </div>
      <div style={{ background: 'var(--color-secondary-light)', borderRadius: 'var(--radius-sm)', overflow: 'hidden' }}>
        {renderFileViewer(viewerDoc)}
      </div>
      {viewerDoc.expirationDate && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', padding: 'var(--space-2)', background: status?.bg, borderRadius: 'var(--radius-sm)', border: `1px solid ${status?.color}` }}>
          <CalendarIcon size={16} style={{ color: status?.color }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 500, color: status?.color }}>
            Vence: {formatDate(viewerDoc.expirationDate)} ({status?.label})
          </span>
        </div>
      )}
      {viewerDoc.notes && (
        <div style={{ padding: 'var(--space-3)', background: 'var(--color-card)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--color-card-border)' }}>
          <strong>Notas:</strong> {viewerDoc.notes}
        </div>
      )}
      {viewerDoc.policyNumber && (
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <FileIcon size={14} style={{ verticalAlign: 'middle' }} />
          Póliza: {viewerDoc.policyNumber}
        </div>
      )}
      {viewerDoc.insurerName && (
        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-secondary)', display: 'flex', alignItems: 'center', gap: 'var(--space-1)' }}>
          <ShieldIcon size={14} style={{ verticalAlign: 'middle' }} />
          {viewerDoc.insurerName}
        </div>
      )}
      {viewerDoc.assistancePhone && (
        <a href={`tel:${viewerDoc.assistancePhone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--space-1)', fontSize: '0.85rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 500 }}>
          <PhoneIcon size={14} /> {viewerDoc.assistancePhone}
        </a>
      )}
    </div>
  )
}

export default DocumentacionViewer