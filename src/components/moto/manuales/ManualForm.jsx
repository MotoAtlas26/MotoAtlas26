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

const createEmptySpec = () => ({
  id: Date.now() + Math.random(),
  screw: '',
  torque: '',
  pageRef: '',
  comment: '',
});

export default function ManualForm({ motos = [], initialData = null, defaultType = 'diy', onSave, onCancel }) {
  const [motoId, setMotoId] = useState('');
  const [manualType, setManualType] = useState(defaultType);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [specs, setSpecs] = useState([]);
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
      
      // Migrar datos antiguos: si existe specs (nuevo formato), usarlo; si no, migrar de torqueSpecs/pageRef
      if (Array.isArray(initialData.specs) && initialData.specs.length > 0) {
        setSpecs(initialData.specs.map(s => ({ ...s, id: s.id || Date.now() + Math.random() })));
      } else {
        const migratedSpecs = [];
        if (initialData.torqueSpecs?.trim() || initialData.pageRef?.trim()) {
          migratedSpecs.push(createEmptySpec());
          // Intentar parsear torqueSpecs si tiene formato "Tornillo: valor"
          const torqueText = initialData.torqueSpecs?.trim() || '';
          const pageText = initialData.pageRef?.trim() || '';
          migratedSpecs[0].torque = torqueText;
          migratedSpecs[0].pageRef = pageText;
        } else {
          migratedSpecs.push(createEmptySpec());
        }
        setSpecs(migratedSpecs);
      }
      
      setSteps(Array.isArray(initialData.steps) ? initialData.steps : []);
      setFileName(initialData.fileName || '');
      setFileType(initialData.fileType || '');
      setFileData(initialData.fileData || '');
      setNotes(initialData.notes || '');
    } else {
      setMotoId(motos[0]?.id ?? '');
      setManualType(defaultType);
      setSpecs([createEmptySpec()]);
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

  const handleAddSpec = () => {
    setSpecs((prev) => [...prev, createEmptySpec()]);
  };

  const handleRemoveSpec = (id) => {
    setSpecs((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSpecChange = (id, field, value) => {
    setSpecs((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
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
        specs: specs.filter(s => s.screw.trim() || s.torque.trim() || s.pageRef.trim() || s.comment.trim()),
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
          <label>Categoría técnica</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Pares de apriete y referencias por tornillo */}
      <div style={{ marginBottom: '1rem', padding: '1rem', borderRadius: '10px', border: '1px solid var(--color-card-border)', background: 'rgba(255,255,255,0.02)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <label style={{ fontWeight: 600, color: 'var(--color-text-primary)', margin: 0 }}>
            Pares de apriete y referencias por tornillo ({specs.filter(s => s.screw.trim() || s.torque.trim() || s.pageRef.trim() || s.comment.trim()).length})
          </label>
          <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddSpec}>
            <PlusIcon width={14} height={14} /> Añadir tornillo / par
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {specs.map((spec, idx) => (
            <div
              key={spec.id}
              style={{
                display: 'grid',
                gridTemplateColumns: '1.5fr 1fr 1fr 1.5fr auto',
                gap: '0.5rem',
                alignItems: 'end',
              }}
            >
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Tornillo / Pieza</label>
                <input
                  type="text"
                  value={spec.screw}
                  onChange={(e) => handleSpecChange(spec.id, 'screw', e.target.value)}
                  placeholder="Ej. Tapón vaciado aceite"
                  style={{ fontSize: '0.875rem' }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Par / Dato</label>
                <input
                  type="text"
                  value={spec.torque}
                  onChange={(e) => handleSpecChange(spec.id, 'torque', e.target.value)}
                  placeholder="Ej. 25 Nm"
                  style={{ fontSize: '0.875rem' }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Pág. manual</label>
                <input
                  type="text"
                  value={spec.pageRef}
                  onChange={(e) => handleSpecChange(spec.id, 'pageRef', e.target.value)}
                  placeholder="Ej. Pág. 142"
                  style={{ fontSize: '0.875rem' }}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', display: 'block', marginBottom: '0.2rem' }}>Comentario</label>
                <input
                  type="text"
                  value={spec.comment}
                  onChange={(e) => handleSpecChange(spec.id, 'comment', e.target.value)}
                  placeholder="Ej. Cambiar arandela"
                  style={{ fontSize: '0.875rem' }}
                />
              </div>
              {specs.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveSpec(spec.id)}
                  style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.4rem 0.5rem', height: 'fit-content' }}
                  title="Eliminar"
                >
                  <TrashIcon width={16} height={16} />
                </button>
              )}
            </div>
          ))}
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
          {saving ? 'Guardando...' : initialData ? 'Actualizar' : 'Crear'}
        </button>
      </div>
    </form>
  )
}
