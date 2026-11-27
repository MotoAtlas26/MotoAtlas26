import React, { useState, useEffect, useCallback } from 'react';
import { useDatabase } from '../../../hooks/useDatabase';
import { PlusIcon, BookIcon, WrenchIcon, TrashIcon, EditIcon, EyeIcon } from '../../shared/Icons';
import ManualForm from './ManualForm';
import ManualViewerModal from './ManualViewerModal';

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
      return (
        m.title?.toLowerCase().includes(q) ||
        m.torqueSpecs?.toLowerCase().includes(q) ||
        m.notes?.toLowerCase().includes(q)
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
          <select value={activeMotoId} onChange={(e) => setActiveMotoId(e.target.value)}>
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
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar guía, par de apriete o tarea..."
          style={{ flex: '1 1 220px' }}
        />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ width: 'auto', minWidth: '180px' }}>
          <option value="Todas">Todas las categorías</option>
          <option value="Aceite y filtros">Aceite y filtros</option>
          <option value="Cadena y transmisión">Cadena y transmisión</option>
          <option value="Frenos">Frenos</option>
        </select>
      </div>
    </div>
  )

}
