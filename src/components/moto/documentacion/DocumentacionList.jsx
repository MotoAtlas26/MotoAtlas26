import React from 'react'
import { formatDate, formatFileSize } from '../../../utils/formatters'
import { getMotoModel } from '../../../constants/motoModels'
import { TrashIcon, EditIcon, EyeIcon, DownloadIcon, CalendarIcon, PhoneIcon, ShieldIcon, FileIcon, UploadIcon } from '../../shared/Icons'

const isPDF = (mime) => mime === 'application/pdf'
const isImage = (mime) => mime?.startsWith('image/')

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

export const DocumentacionList = ({
  documents,
  documentTypes,
  filterMotoId,
  onView,
  onEdit,
  onDelete
}) => {
  if (documents.length === 0) {
    return (
      <div style={{ padding: 'var(--space-8)', textAlign: 'center' }}>
        <FileIcon size={48} style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-3)' }} />
        <h3 style={{ margin: '0 0 var(--space-2)', color: 'var(--color-text-primary)' }}>Sin documentos</h3>
        <p style={{ color: 'var(--color-text-secondary)', marginBottom: 'var(--space-4)' }}>
          {filterMotoId ? 'Esta moto no tiene documentos registrados.' : 'No hay documentos que coincidan con los filtros.'}
        </p>
        <button className="btn btn-primary" onClick={onEdit}>
          <UploadIcon size={18} style={{ marginRight: 'var(--space-1)' }} /> Añadir primer documento
        </button>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 'var(--space-3)', padding: 'var(--space-3)' }}>
      {documents.map(doc => {
        const moto = getMotoModel(doc.motoId)
        const docType = documentTypes.find(t => t.code === doc.docType) || { name: doc.docType, hasExpiration: false, isInsurance: false }
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
                <FileIcon size={24} style={{ color: 'var(--color-primary)' }} />
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
                {docType.name}
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
              <button className="btn-outline btn-sm" onClick={() => onView(doc)} style={{ flex: 1 }}>
                <EyeIcon size={14} style={{ marginRight: 'var(--space-1)' }} /> Ver
              </button>
              <button className="btn-outline btn-sm" onClick={() => onEdit(doc)} style={{ flex: 1 }}>
                <EditIcon size={14} style={{ marginRight: 'var(--space-1)' }} /> Editar
              </button>
              <button className="btn-danger btn-sm" onClick={() => onDelete(doc.id)} style={{ flex: 1 }}>
                <TrashIcon size={14} style={{ marginRight: 'var(--space-1)' }} /> Eliminar
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default DocumentacionList