import React, { useState, useEffect } from 'react';
import { TrashIcon, PlusIcon, UploadIcon } from '../../shared/Icons';

const CATEGORIES = [
  'Aceite y filtros',
  'Cadena y transmisión',
  'Frenos',
  'Suspensiones',
  'Neumáticos',
  'Motor y refrigeración',
  'Electricidad',
  'General',
];

export default function ManualForm({ motos = [], initialData = null, defaultType = 'diy', onSave, onCancel }) {
  const [motoId, setMotoId] = useState('');
  const [manualType, setManualType] = useState(defaultType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [pageRef, setPageRef] = useState('');
  const [torqueSpecs, setTorqueSpecs] = useState('');
  const [steps, setSteps] = useState([]);
  const [newStepText, setNewStepText] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileType, setFileType] = useState('');
  const [fileData, setFileData] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setMotoId(initialData.motoId || (motos[0]?.id ?? ''));
      setManualType(initialData.manualType || defaultType);
      setTitle(initialData.title || '');
      setCategory(initialData.category || 'General');
      setPageRef(initialData.pageRef || '');
      setTorqueSpecs(initialData.torqueSpecs || '');
      setSteps(Array.isArray(initialData.steps) ? initialData.steps : []);
      setFileName(initialData.fileName || '');
      setFileType(initialData.fileType || '');
      setFileData(initialData.fileData || '');
      setNotes(initialData.notes || '');
    } else {
      setMotoId(motos[0]?.id ?? '');
      setManualType(defaultType);
    }
  }, [initialData, defaultType, motos]);

  const handleAddStep = () => {
    const clean = newStepText.trim();
    if (!clean) return;
    setSteps((prev) => [...prev, { id: Date.now() + Math.random(), text: clean, done: false }]);
    setNewStepText('');
  };

  const handleRemoveStep = (id) => {
    setSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setFileName(file.name);
      setFileType(file.type || 'application/pdf');
      setFileData(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!motoId) return setError('Selecciona una moto.');
    if (!title.trim()) return setError('Introduce un título para el manual o guía.');

    setError('');
    setSaving(true);
    try {
      await onSave({
        ...(initialData?.id ? { id: initialData.id } : {}),
        motoId: Number(motoId) || motoId,
        manualType,
        title: title.trim(),
        category,
        pageRef: pageRef.trim(),
        torqueSpecs: torqueSpecs.trim(),
        steps,
        fileName,
        fileType,
        fileData,
        notes: notes.trim(),
        createdAt: initialData?.createdAt || new Date().toISOString(),
      });
    } catch (err) {
      setError(err?.message || 'Error al guardar el manual.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '1.5rem' }}>
      <h3 style={{ marginBottom: '1rem', color: 'var(--color-text-primary)' }}>
        {initialData ? 'Editar Manual / Guía' : 'Nuevo Manual o Guía de Taller'}
      </h3>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div className="form-group">
          <label>Moto *</label>
          <select value={motoId} onChange={(e) => setMotoId(e.target.value)} required>
            <option value="">Selecciona una moto...</option>
            {motos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.brand} {m.model} {m.plate ? `(${m.plate})` : ''}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Tipo de documento *</label>
          <select value={manualType} onChange={(e) => setManualType(e.target.value)}>
            <option value="diy">Guía de Mantenimiento en Casa (DIY)</option>
            <option value="owner">Manual Oficial del Propietario</option>
            <option value="workshop">Manual de Taller / Servicio</option>
          </select>
        </div>

        <div className="form-group">
          <label>Título *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej. Cambio de aceite y filtro 15.000 km"
            required
          />
        </div>

        <div className="form-group">
          <label>Categoría técnica</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Página de referencia en manual</label>
          <input
            type="text"
            value={pageRef}
            onChange={(e) => setPageRef(e.target.value)}
            placeholder="Ej. Manual Taller Pág. 142-145"
          />
        </div>

        <div className="form-group">
          <label>Pares de apriete / Datos clave</label>
          <input
            type="text"
            value={torqueSpecs}
            onChange={(e) => setTorqueSpecs(e.target.value)}
            placeholder="Ej. Vaciado: 25 Nm · Filtro: 17 Nm · 3.2L 10W40"
          />
        </div>
      </div>

      {/* Checklist de pasos DIY */}
      <div style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '10px', border: '1px solid var(--color-card-border)', background: 'rgba(255,255,255,0.02)' }}>
        <label style={{ display: 'block', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--color-text-primary)' }}>
          Checklist de pasos para hacer en casa ({steps.length})
        </label>
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: steps.length ? '0.75rem' : 0 }}>
          <input
            type="text"
            value={newStepText}
            onChange={(e) => setNewStepText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                handleAddStep();
              }
            }}
            placeholder="Ej. Calentar motor 3 min y retirar tapón de vaciado..."
            style={{ flex: 1 }}
          />
          <button type="button" className="btn btn-secondary" onClick={handleAddStep}>
            <PlusIcon width={16} height={16} /> Añadir paso
          </button>
        </div>

        {steps.length > 0 && (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            {steps.map((step, idx) => (
              <li
                key={step.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  padding: '0.45rem 0.7rem',
                  borderRadius: '6px',
                  background: 'rgba(255,255,255,0.03)',
                  fontSize: '0.875rem',
                }}
              >
                <span>
                  <strong style={{ opacity: 0.6, marginRight: '0.4rem' }}>{idx + 1}.</strong>
                  {step.text}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveStep(step.id)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.2rem' }}
                  title="Eliminar paso"
                >
                  <TrashIcon width={15} height={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Archivo adjunto y notas */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
        <div className="form-group">
          <label>Archivo PDF o imagen (opcional)</label>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.6rem 0.85rem',
              borderRadius: '8px',
              border: '1px dashed var(--color-card-border)',
              cursor: 'pointer',
              fontSize: '0.875rem',
            }}
          >
            <UploadIcon width={16} height={16} />
            <span>{fileName || 'Seleccionar PDF o captura...'}</span>
            <input type="file" accept="application/pdf,image/*" onChange={handleFileChange} style={{ display: 'none' }} />
          </label>
        </div>

        <div className="form-group">
          <label>Notas adicionales</label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Herramientas necesarias, recambios o advertencias..."
          />
        </div>
      </div>

      {error && (
        <div style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '0.75rem' }}>{error}</div>
      )}

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Cancelar
        </button>
        <button type="submit" className="btn btn-primary" disabled={saving}>
          {saving ? 'Guardando...' : editingManual ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  )
}
