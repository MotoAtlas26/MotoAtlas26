import React from 'react'
import { formatFileSize } from '../../../utils/formatters'
import { UploadIcon, ShieldIcon, FileIcon } from '../../shared/Icons'

export const DocumentacionForm = ({
  formData,
  setFormData,
  documentTypes,
  motosArray,
  editingDoc,
  saving,
  onSubmit,
  onCancel
}) => {
  const selectedDocType = documentTypes.find(t => t.code === formData.docType)

  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
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
            {documentTypes.map(t => <option key={t.code} value={t.code}>{t.name}</option>)}
          </select>
        </div>
      </div>

      <div>
        <label className="form-label">Título *</label>
        <input type="text" value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} className="form-input" placeholder="Ej: ITV 2024, Póliza MAPFRE, Manual taller..." required />
      </div>

      {selectedDocType && (
        <>
          {selectedDocType.hasExpiration && (
            <div>
              <label className="form-label">Fecha de vencimiento / Próxima ITV</label>
              <input type="date" value={formData.expirationDate} onChange={e => setFormData(prev => ({ ...prev, expirationDate: e.target.value }))} className="form-input" />
            </div>
          )}
          {selectedDocType.isInsurance && (
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
        </>
      )}

      <div>
        <label className="form-label">Notas</label>
        <textarea value={formData.notes} onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))} className="form-input" rows={3} placeholder="Observaciones adicionales..." />
      </div>

      <div>
        <label className="form-label">Archivo (PDF, JPG, PNG, WEBP)</label>
        <input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" onChange={e => setFormData(prev => ({ ...prev, file: e.target.files?.[0] }))} className="form-input" />
        {formData.file && <p style={{ marginTop: 'var(--space-1)', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>{formData.file.name} ({formatFileSize(formData.file.size)})</p>}
        {editingDoc?.fileDataUrl && !formData.file && <p style={{ marginTop: 'var(--space-1)', fontSize: '0.85rem', color: 'var(--color-text-secondary)' }}>Archivo actual: {editingDoc.fileName}</p>}
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Guardando...' : (editingDoc ? 'Actualizar' : 'Guardar')}
        </button>
      </div>
    </form>
  )
}

export default DocumentacionForm