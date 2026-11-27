import React, { useState, useEffect, useCallback } from 'react';
import { useDatabase } from '../../../hooks/useDatabase';
import { PlusIcon, BookIcon, WrenchIcon, TrashIcon, EditIcon, EyeIcon } from '../../shared/Icons';
import ManualForm from './ManualForm';
import ManualViewerModal from './ManualViewerModal';

// Estilo compartido para inputs y selects (modo oscuro compatible)
const inputStyle = {
  background: 'var(--color-card, #16171B)',
  color: 'var(--color-text-primary, #F2F2F3)',
  border: '1px solid var(--color-card-border, #2A2D35)',
  borderRadius: '8px',
  padding: '0.6rem 0.85rem',
  width: '100%',
  boxSizing: 'border-box',
  fontSize: '0.875rem',
};

// Helper para obtener specs (nuevo formato o migrado desde campos antiguos)
const getSpecs = (manual) => {
  if (Array.isArray(manual.specs) && manual.specs.length > 0) {
    return manual.specs.filter(s => s.screw?.trim() || s.torque?.trim() || s.pageRef?.trim() || s.comment?.trim());
  }
  const legacySpecs = [];
  if (manual.torqueSpecs?.trim() || manual.pageRef?.trim()) {
    legacySpecs.push({
      screw: '',
      torque: manual.torqueSpecs?.trim() || '',
      pageRef: manual.pageRef?.trim() || '',
      comment: '',
    });
  }
  return legacySpecs;
};

export default function Manuales({ selectedMoto = null }) {
  const {
    getAllManuals,
    saveManual,
    updateManual,
    deleteManual,
    saveMaintenance,
    getMotorcycles,
  } = useDatabase();

  const [motos, setMotos] = useState([]);
  const [manuals, setManuals] = useState([]);
  const [activeMotoId, setActiveMotoId] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [defaultFormType, setDefaultFormType] = useState('diy');
  const [editingManual, setEditingManual] = useState(null);
  const [viewingManual, setViewingManual] = useState(null);

  const loadData = useCallback(async () => {
    const [motosList, manualsList] = await Promise.all([getMotorcycles(), getAllManuals()]);
    setMotos(motosList || []);
    setManuals(manualsList || []);
    if (selectedMoto?.id) {
      setActiveMotoId(String(selectedMoto.id));
    } else if (motosList?.length > 0 && !activeMotoId) {
      setActiveMotoId(String(motosList[0].id));
    }
  }, [getMotorcycles, getAllManuals, selectedMoto, activeMotoId]);

  useEffect(() => {
    loadData();
    window.addEventListener('motoatlas:drive-synced', loadData);
    return () => window.removeEventListener('motoatlas:drive-synced', loadData);
  }, [loadData]);

  const motoManuals = manuals.filter((m) => !activeMotoId || String(m.motoId) === String(activeMotoId));
  const ownerManual = motoManuals.find((m) => m.manualType === 'owner');
  const workshopManual = motoManuals.find((m) => m.manualType === 'workshop');

  const diyGuides = motoManuals.filter((m) => {
    if (m.manualType !== 'diy') return false;
    if (categoryFilter !== 'Todas' && m.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const specs = getSpecs(m);
      const specsMatch = specs.some(s =>
        s.screw?.toLowerCase().includes(q) ||
        s.torque?.toLowerCase().includes(q) ||
        s.pageRef?.toLowerCase().includes(q) ||
        s.comment?.toLowerCase().includes(q)
      );
      return (
        m.title?.toLowerCase().includes(q) ||
        m.torqueSpecs?.toLowerCase().includes(q) ||
        m.notes?.toLowerCase().includes(q) ||
        specsMatch
      );
    }
    return true;
  });

  const handleOpenNew = (type = 'diy') => {
    setEditingManual(null);
    setDefaultFormType(type);
    setShowForm(true);
  };

  const handleSaveManual = async (data) => {
    if (data.id) {
      await updateManual(data.id, data);
    } else {
      await saveManual(data);
    }
    setShowForm(false);
    setEditingManual(null);
    await loadData();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este manual o guía?')) return;
    await deleteManual(id);
    if (viewingManual?.id === id) setViewingManual(null);
    await loadData();
  };

  const handleToggleStep = async (manual, stepId) => {
    const updatedSteps = (manual.steps || []).map((s) =>
      s.id === stepId ? { ...s, done: !s.done } : s
    );
    await updateManual(manual.id, { steps: updatedSteps });
    const updated = { ...manual, steps: updatedSteps };
    setViewingManual(updated);
    setManuals((prev) => prev.map((m) => (m.id === manual.id ? updated : m)));
  };

  const handleResetSteps = async (manual) => {
    const resetSteps = (manual.steps || []).map((s) => ({ ...s, done: false }));
    await updateManual(manual.id, { steps: resetSteps });
    const updated = { ...manual, steps: resetSteps };
    setViewingManual(updated);
    setManuals((prev) => prev.map((m) => (m.id === manual.id ? updated : m)));
  };

  const handleRegisterMaintenance = async (manual) => {
    const motoObj = motos.find((m) => String(m.id) === String(manual.motoId));
    await saveMaintenance({
      motoId: manual.motoId,
      date: new Date().toISOString().split('T')[0],
      category: manual.category || 'General',
      description: `${manual.title} (Realizado en casa con guía DIY)`,
      odometer: motoObj?.odometer || 0,
      cost: 0,
      notes: [manual.torqueSpecs, manual.notes].filter(Boolean).join(' · '),
      createdAt: new Date().toISOString(),
    });
  };

  const activeMotoObj = motos.find((m) => String(m.id) === String(activeMotoId));
  const activeMotoName = activeMotoObj ? `${activeMotoObj.brand} ${activeMotoObj.model}` : '';

  return (
    <div>
      {/* Cabecera */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--color-text-primary)' }}>Manuales y Guías de Taller</h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Manual oficial, manual de taller y fichas paso a paso para mantenimiento en casa
          </p>
        </div>
        {!showForm && (
          <button type="button" className="btn btn-primary" onClick={() => handleOpenNew('diy')}>
            <PlusIcon width={16} height={16} /> Añadir Manual / Guía
          </button>
        )}
      </div>

      {/* Formulario colapsable */}
      {showForm && (
        <ManualForm
          motos={motos}
          initialData={editingManual}
          defaultType={defaultFormType}
          onSave={handleSaveManual}
          onCancel={() => {
            setShowForm(false);
            setEditingManual(null);
          }}
        />
      )}

      {/* Selector rápido de moto si hay varias */}
      {motos.length > 1 && (
        <div style={{ marginBottom: '1.25rem', maxWidth: '320px' }}>
          <select
            value={activeMotoId}
            onChange={(e) => setActiveMotoId(e.target.value)}
            style={inputStyle}
          >
            {motos.map((m) => (
              <option key={m.id} value={m.id}>
                {m.brand} {m.model} {m.plate ? `(${m.plate})` : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Tarjetas rápidas: Manual Oficial y Manual de Taller */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Manual Oficial */}
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <BookIcon width={24} height={24} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
            <div>
              <strong style={{ display: 'block', color: 'var(--color-text-primary)' }}>Manual Oficial del Propietario</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                {ownerManual ? ownerManual.fileName || ownerManual.title : 'Sin archivo cargado'}
              </span>
            </div>
          </div>
          {ownerManual ? (
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setViewingManual(ownerManual)}>
                Abrir
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setEditingManual(ownerManual); setShowForm(true); }}>
                <EditIcon width={14} height={14} />
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleOpenNew('owner')}>
              Subir PDF
            </button>
          )}
        </div>

        {/* Manual de Taller */}
        <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <WrenchIcon width={24} height={24} style={{ color: 'var(--color-secondary)', flexShrink: 0 }} />
            <div>
              <strong style={{ display: 'block', color: 'var(--color-text-primary)' }}>Manual de Taller / Servicio</strong>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                {workshopManual ? workshopManual.fileName || workshopManual.title : 'Sin archivo cargado'}
              </span>
            </div>
          </div>
          {workshopManual ? (
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => setViewingManual(workshopManual)}>
                Abrir
              </button>
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setEditingManual(workshopManual); setShowForm(true); }}>
                <EditIcon width={14} height={14} />
              </button>
            </div>
          ) : (
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleOpenNew('workshop')}>
              Subir PDF
            </button>
          )}
        </div>
      </div>

            {/* Filtros para Guías DIY */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar guía, par de apriete o tarea..."
          style={{ ...inputStyle, flex: '1 1 220px' }}
        />
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ ...inputStyle, width: 'auto', minWidth: '180px' }}
        >
          <option value="Todas">Todas las categorías</option>
          <option value="Aceite y filtros">Aceite y filtros</option>
          <option value="Cadena y transmisión">Cadena y transmisión</option>
          <option value="Frenos">Frenos</option>
          <option value="Suspensiones">Suspensiones</option>
          <option value="Neumáticos">Neumáticos</option>
          <option value="Motor y refrigeración">Motor y refrigeración</option>
          <option value="Electricidad">Electricidad</option>
          <option value="General">General</option>
        </select>
      </div>

      {/* Lista de Guías DIY */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {diyGuides.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-secondary)' }}>
            {search || categoryFilter !== 'Todas'
              ? 'No hay guías que coincidan con el filtro.'
              : 'No hay guías DIY para esta moto. Crea tu primera guía de mantenimiento.'}
          </div>
        ) : (
          diyGuides.map((guide) => {
            const specs = getSpecs(guide);
            const specsCount = specs.length;
            return (
              <div key={guide.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <WrenchIcon width={20} height={20} style={{ color: '#22c55e' }} />
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <strong style={{ display: 'block', color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{guide.title}</strong>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.25rem', fontSize: '0.8rem', color: 'var(--color-text-secondary)', flexWrap: 'wrap' }}>
                      <span>{guide.category}</span>
                      {specsCount > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <WrenchIcon width={12} height={12} style={{ opacity: 0.7 }} />
                          {specsCount} {specsCount === 1 ? 'par de apriete' : 'pares de apriete'}
                        </span>
                      )}
                      {guide.steps?.length > 0 && (
                        <span>{guide.steps.length} pasos</span>
                      )}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => setViewingManual(guide)}>
                    <EyeIcon width={14} height={14} /> Ver
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => { setEditingManual(guide); setShowForm(true); }}>
                    <EditIcon width={14} height={14} />
                  </button>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => handleDelete(guide.id)} style={{ color: '#ef4444', borderColor: '#ef4444' }}>
                    <TrashIcon width={14} height={14} />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal visor */}
      <ManualViewerModal
        manual={viewingManual}
        motoName={activeMotoName}
        onClose={() => setViewingManual(null)}
        onToggleStep={handleToggleStep}
        onResetSteps={handleResetSteps}
        onRegisterMaintenance={handleRegisterMaintenance}
      />
    </div>
  )
}
