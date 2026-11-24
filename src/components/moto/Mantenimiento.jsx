/**
 * Mantenimiento Técnico MotoAtlas26
 * Formulario de registro y historial de mantenimientos con bloque técnico de suspensiones/presiones
 */
import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../../services/db'
import { useGPX } from '../../context/GPXContext'
import { useDatabase } from '../../hooks/useDatabase'
import { EmptyState, Modal, SectionHeader, BlobImage } from '../shared'
import { formatFileSize, formatDate, formatDateTime } from '../../utils/formatters'
import { getMotoModel, getMotoModelsArray, getDefaultMotoModel } from '../../constants/motoModels'
import { TrashIcon, CheckIcon, EditIcon } from '../shared/Icons'

/**
 * Categorías de intervención de mantenimiento
 */
const MAINTENANCE_CATEGORIES = [
  'Engrase / Tensión de cadena',
  'Cambio de pieza / Recambio',
  'Reglaje / Tarado de suspensiones',
  'Aceite y filtros',
  'Neumáticos y presiones',
  'Revisión general / Otros'
]

/**
 * Bloque técnico de suspensiones por categoría
 */
const SUSPENSION_FIELDS = {
  'Engrase / Tensión de cadena': null,
  'Cambio de pieza / Recambio': null,
  'Reglaje / Tarado de suspensiones': {
    showToggle: true,
    horquilla: {
      precarga: { value: '', unit: 'vueltas' },
      compresion: { value: '', unit: 'clics' },
      extension: { value: '', unit: 'clics' }
    },
    amortiguador: {
      precarga: { value: '', unit: 'clics/mm' },
      compresion_alta: { value: '', unit: 'clics' },
      compresion_baja: { value: '', unit: 'clics' },
      extension: { value: '', unit: 'clics' }
    },
    neumaticos: {
      delantero: { value: '', unit: 'bar' },
      trasero: { value: '', unit: 'bar' },
      escenario: 'Carretera solo'
    }
  },
  'Aceite y filtros': null,
  'Neumáticos y presiones': {
    showToggle: true,
    neumaticos: {
      delantero: { value: '', unit: 'bar' },
      trasero: { value: '', unit: 'bar' },
      escenario: 'Carretera solo'
    }
  },
  'Revisión general / Otros': null
}

/**
 * Componente Row de categoría de mantenimiento
 */
const MaintenanceCategoryRow = ({ category, onToggle }) => {
  const isSuspension = category === 'Reglaje / Tarado de suspensiones'
  const isTires = category === 'Neumáticos y presiones'

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
      <span className="form-label">{category}</span>
      {isSuspension || isTires && (
        <button
          type="button"
          className="btn btn-outline btn-outline-sm"
          onClick={onToggle}
          style={{ padding: '0 var(--space-2)', fontSize: '0.75rem' }}
        >
          {isSuspension ? 'Mostrar ajustes' : 'Mostrar presiones'}
        </button>
      )}
    </div>
  )
}

/**
 * Componente de ajustes técnicos de suspensión y neumáticos
 * Muestra bloques exclusivos según la categoría:
 * - 'Reglaje / Tarado de suspensiones': solo horquilla + amortiguador
 * - 'Neumáticos y presiones': solo presiones de neumáticos
 */
const SuspensionSetupForm = ({ category, setup, onFieldChange }) => {
  const isSuspension = category === 'Reglaje / Tarado de suspensiones'
  const isTires = category === 'Neumáticos y presiones'

  if (!isSuspension && !isTires) return null

  return (
    <div style={{ marginTop: 'var(--space-3)', borderTop: '1px solid var(--color-card-border)', paddingTop: 'var(--space-3)' }}>
      <h5 style={{ margin: '0 0 var(--space-2)', color: 'var(--color-text-secondary)' }}>
        {isSuspension ? 'Ajustes de Suspensión' : 'Presiones de Neumáticos'}
      </h5>

      {/* Bloque de Suspensiones (solo para categoría 'Reglaje / Tarado de suspensiones') */}
      {isSuspension && (
        <>
          {/* Horquilla Delantera */}
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <span className="form-label">Horquilla Delantera</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
              <div>
                <span>Precarga</span>
                <input
                  type="number"
                  value={setup?.horquilla?.precarga?.value || ''}
                  onChange={(e) => onFieldChange('horquilla', 'precarga', { value: e.target.value, unit: 'vueltas' })}
                  className="form-input form-input-sm"
                  min="0"
                  step="0.5"
                />
                <span className="form-label-sm">{setup?.horquilla?.precarga?.unit || 'vueltas'}</span>
              </div>
              <div>
                <span>Compresión</span>
                <input
                  type="number"
                  value={setup?.horquilla?.compresion?.value || ''}
                  onChange={(e) => onFieldChange('horquilla', 'compresion', { value: e.target.value, unit: 'clics' })}
                  className="form-input form-input-sm"
                  min="0"
                  step="1"
                />
                <span className="form-label-sm">{setup?.horquilla?.compresion?.unit || 'clics'}</span>
              </div>
            </div>
            <div style={{ marginTop: 'var(--space-1)', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
              <div>
                <span>Extensión / Rebote</span>
                <input
                  type="number"
                  value={setup?.horquilla?.extension?.value || ''}
                  onChange={(e) => onFieldChange('horquilla', 'extension', { value: e.target.value, unit: 'clics' })}
                  className="form-input form-input-sm"
                  min="0"
                  step="1"
                />
                <span className="form-label-sm">{setup?.horquilla?.extension?.unit || 'clics'}</span>
              </div>
              <div>
                <span>Compresión Alta</span>
                <input
                  type="number"
                  value={setup?.horquilla?.compresion_alta?.value || ''}
                  onChange={(e) => onFieldChange('horquilla', 'compresion_alta', { value: e.target.value, unit: 'clics' })}
                  className="form-input form-input-sm"
                  min="0"
                  step="1"
                />
                <span className="form-label-sm">{setup?.horquilla?.compresion_alta?.unit || 'clics'}</span>
              </div>
            </div>
          </div>

          {/* Amortiguador Trasero */}
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <span className="form-label">Amortiguador Trasero</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
              <div>
                <span>Precarga</span>
                <input
                  type="number"
                  value={setup?.amortiguador?.precarga?.value || ''}
                  onChange={(e) => onFieldChange('amortiguador', 'precarga', { value: e.target.value, unit: 'clics/mm' })}
                  className="form-input form-input-sm"
                  min="0"
                  step="0.5"
                />
                <span className="form-label-sm">{setup?.amortiguador?.precarga?.unit || 'clics/mm'}</span>
              </div>
              <div>
                <span>Compresión Alta</span>
                <input
                  type="number"
                  value={setup?.amortiguador?.compresion_alta?.value || ''}
                  onChange={(e) => onFieldChange('amortiguador', 'compresion_alta', { value: e.target.value, unit: 'clics' })}
                  className="form-input form-input-sm"
                  min="0"
                  step="1"
                />
                <span className="form-label-sm">{setup?.amortiguador?.compresion_alta?.unit || 'clics'}</span>
              </div>
            </div>
            <div style={{ marginTop: 'var(--space-1)', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
              <div>
                <span>Compresión Baja</span>
                <input
                  type="number"
                  value={setup?.amortiguador?.compresion_baja?.value || ''}
                  onChange={(e) => onFieldChange('amortiguador', 'compresion_baja', { value: e.target.value, unit: 'clics' })}
                  className="form-input form-input-sm"
                  min="0"
                  step="1"
                />
                <span className="form-label-sm">{setup?.amortiguador?.compresion_baja?.unit || 'clics'}</span>
              </div>
              <div>
                <span>Extensión / Rebote</span>
                <input
                  type="number"
                  value={setup?.amortiguador?.extension?.value || ''}
                  onChange={(e) => onFieldChange('amortiguador', 'extension', { value: e.target.value, unit: 'clics' })}
                  className="form-input form-input-sm"
                  min="0"
                  step="1"
                />
                <span className="form-label-sm">{setup?.amortiguador?.extension?.unit || 'clics'}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bloque de Presiones de Neumáticos (solo para categoría 'Neumáticos y presiones') */}
      {isTires && (
        <div style={{ marginBottom: 'var(--space-3)' }}>
          {/* Selector de neumático del catálogo */}
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <span className="form-label">Neumático montado</span>
            <select
              value={selectedTireId || ''}
              onChange={(e) => {
                const tireId = e.target.value
                setSelectedTireId(tireId)
                if (tireId) {
                  const tire = tires.find(t => t.id === parseInt(tireId))
                  if (tire) {
                    // Auto-rellenar campos del neumático
                    onFieldChange('neumaticos', 'brand', { value: tire.brand })
                    onFieldChange('neumaticos', 'model', { value: tire.model })
                    onFieldChange('neumaticos', 'frontSize', { value: tire.frontSize })
                    onFieldChange('neumaticos', 'rearSize', { value: tire.rearSize })
                    // Auto-rellenar presiones recomendadas solo si los inputs están vacíos
                    if (tire.recommendedFrontBar && !setup?.neumaticos?.delantero?.value) {
                      onFieldChange('neumaticos', 'delantero', { value: tire.recommendedFrontBar.toString(), unit: 'bar' })
                    }
                    if (tire.recommendedRearBar && !setup?.neumaticos?.trasero?.value) {
                      onFieldChange('neumaticos', 'trasero', { value: tire.recommendedRearBar.toString(), unit: 'bar' })
                    }
                  }
                }
              }}
              className="form-select form-select-md"
            >
              <option value="">Otro / Introducción manual</option>
              {tires.map(tire => (
                <option key={tire.id} value={tire.id}>
                  {tire.brand} · {tire.model} · {tire.frontSize} / {tire.rearSize}
                </option>
              ))}
            </select>
          </div>

          {/* Campos del neumático (editables manualmente) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <div>
              <span className="form-label">Marca</span>
              <input
                type="text"
                value={setup?.neumaticos?.brand || ''}
                onChange={(e) => onFieldChange('neumaticos', 'brand', { value: e.target.value })}
                className="form-input form-input-sm"
                placeholder="Ej: Michelin, Pirelli, Metzeler..."
              />
            </div>
            <div>
              <span className="form-label">Modelo</span>
              <input
                type="text"
                value={setup?.neumaticos?.model || ''}
                onChange={(e) => onFieldChange('neumaticos', 'model', { value: e.target.value })}
                className="form-input form-input-sm"
                placeholder="Ej: Anakee Adventure, Scorpion Trail III..."
              />
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <div>
              <span className="form-label">Medida Delantero</span>
              <input
                type="text"
                value={setup?.neumaticos?.frontSize || ''}
                onChange={(e) => onFieldChange('neumaticos', 'frontSize', { value: e.target.value })}
                className="form-input form-input-sm"
                placeholder="Ej: 90/90-21, 110/80 R19"
              />
            </div>
            <div>
              <span className="form-label">Medida Trasero</span>
              <input
                type="text"
                value={setup?.neumaticos?.rearSize || ''}
                onChange={(e) => onFieldChange('neumaticos', 'rearSize', { value: e.target.value })}
                className="form-input form-input-sm"
                placeholder="Ej: 150/70 R18, 150/70 R17"
              />
            </div>
          </div>

          {/* Presiones de Neumáticos - unidad en la etiqueta */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <div>
              <span className="form-label">Delantero (bar)</span>
              <input
                type="number"
                value={setup?.neumaticos?.delantero?.value || ''}
                onChange={(e) => onFieldChange('neumaticos', 'delantero', { value: e.target.value, unit: 'bar' })}
                className="form-input form-input-sm"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <span className="form-label">Trasero (bar)</span>
              <input
                type="number"
                value={setup?.neumaticos?.trasero?.value || ''}
                onChange={(e) => onFieldChange('neumaticos', 'trasero', { value: e.target.value, unit: 'bar' })}
                className="form-input form-input-sm"
                min="0"
                step="0.1"
              />
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-1)' }}>
            <span className="form-label">Escenario</span>
            <select
              onChange={(e) => onFieldChange('neumaticos', 'escenario', { value: e.target.value })}
              className="form-select form-select-sm"
            >
              <option value="Carretera solo">Carretera solo</option>
              <option value="Con pasajero y equipaje">Con pasajero y equipaje</option>
              <option value="Off-road / Trail">Off-road / Trail</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Main Mantenimiento Component ───────────────────────────────────────────── */
export const Mantenimiento = () => {
  const { selectedMoto } = useGPX()
  const moto = getMotoModel(selectedMoto)
  const { saveMaintenanceRecord, getMaintenancesByMoto, getAllMaintenances, getAllTires, deleteMaintenanceRecord } = useDatabase()
  const [motos, setMotos] = useState([])
  const [maintenances, setMaintenances] = useState([])
  const [form, setForm] = useState({
    motoId: selectedMoto || '',
    workshop: 'Mantenimiento propio (DIY)',
    category: MAINTENANCE_CATEGORIES[0],
    date: new Date().toISOString().split('T')[0],
    mileage: 0,
    title: '',
    description: '',
    cost: 0,
    suspensionSetup: {}
  })
  const [filtered, setFiltered] = useState({ category: 'all', moto: 'all', workshop: 'all' })
  const [editingId, setEditingId] = useState(null)
  const [copiedSetup, setCopiedSetup] = useState(null)
  const [viewingDetailId, setViewingDetailId] = useState(null)
  const [tires, setTires] = useState([])
  const [selectedTireId, setSelectedTireId] = useState('')

  // Cargar motos disponibles
  useEffect(() => {
    // Motos se cargan desde el perfil/garaje; si no hay selección, usar la moto actual
    if (selectedMoto) {
      setMotos([{ id: selectedMoto, name: selectedMoto }])
    }
  }, [selectedMoto])

  // Cargar historial
  useEffect(() => {
    const loadMaintenances = async () => {
      const all = await getAllMaintenances()
      let filtered = all

      // Filtrar por moto
      if (filtered.moto !== 'all' && filtered.moto) {
        filtered = filtered.filter(m => m.motoId === filtered.moto)
      }

      // Filtrar por categoría
      if (filtered.category !== 'all' && filtered.category) {
        filtered = filtered.filter(m => m.category === filtered.category)
      }

      setMaintenances(filtered)
    }
    loadMaintenances()
  }, [filtered.moto, filtered.category])

  // Cargar catálogo de neumáticos
  useEffect(() => {
    const loadTires = async () => {
      const allTires = await getAllTires()
      setTires(allTires)
    }
    loadTires()
  }, [getAllTires])

  // Calcular KPIs
  const totalGastado = maintenances
    .filter(m => m.cost && m.cost > 0)
    .reduce((sum, m) => sum + (m.cost || 0), 0)

  const ultimoKm = Math.max(
    ...maintenances.map(m => m.mileage || 0),
    ...(moto?.currentMileage ? [moto.currentMileage] : []),
    0
  )

  const ultimoEngrase = maintenances
    .filter(m => m.category === 'Engrase / Tensión de cadena')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .at(0)

  const kmDesdeUltimoEngrase = ultimoEngrase
    ? Math.max(0, (ultimoKm || 0) - (ultimoEngrase.mileage || 0))
    : 0

  const ultimoTarado = maintenances
    .filter(m => m.category === 'Reglaje / Tarado de suspensiones')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .at(0)

  // Manejo de cambio de archivo (foto opcional)
  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return

    file.arrayBuffer().then((buffer) => {
      const base64 = Buffer.from(buffer).toString('base64')
      setForm(prev => ({
        ...prev,
        // Foto no se guarda directamente en DB maintenance, se podría subir a Drive
        // Por ahora solo guardamos el dataUrl si es necesario
      }))
    })
  }, [])

  // Guardar mantenimiento
  const handleSave = useCallback(async () => {
    const maintenanceData = {
      id: editingId || undefined,
      motoId: form.motoId,
      workshop: form.workshop,
      date: form.date,
      mileage: form.mileage,
      type: form.category,
      title: form.title,
      cost: form.cost,
      details: form.description,
      suspensionSetup: form.suspensionSetup || null,
      createdAt: new Date()
    }

    if (editingId) {
      await saveMaintenanceRecord(id, maintenanceData)
    } else {
      await saveMaintenanceRecord(maintenanceData)
    }

    setForm({
      motoId: selectedMoto || '',
      workshop: 'Mantenimiento propio (DIY)',
      category: MAINTENANCE_CATEGORIES[0],
      date: new Date().toISOString().split('T')[0],
      mileage: 0,
      title: '',
      description: '',
      cost: 0,
      includeSuspension: false,
      suspensionSetup: {}
    })
    setEditingId(null)
    // Recargar historial
    const loadMaintenances = async () => {
      const all = await getAllMaintenances()
      setMaintenances(all)
    }
    loadMaintenances()
  }, [form, editingId, saveMaintenanceRecord, selectedMoto])

  // Copiar ajustes de un mantenimiento anterior
  const copySetup = useCallback((setup) => {
    setCopiedSetup(setup)
    // Rellenar el formulario con los valores copiados
    setForm(prev => ({
      ...prev,
      suspensionSetup: { ...setup }
    }))
  }, [])

  // Limpiar setup copiado
  const clearCopiedSetup = useCallback(() => {
    setCopiedSetup(null)
    setForm(prev => ({
      ...prev,
      suspensionSetup: {}
    }))
  }, [])

  return (
    <div>
      <SectionHeader
        title="Bitácora Técnica de Mantenimiento"
        subtitle={`Moto: ${moto.name || 'Selecciona una moto'}`}
        actions={
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setEditingId(null)}
          >
            + Registrar Mantenimiento
          </button>
        }
      />

      {/* Formulario de Registro */}
      <div style={{ margin: 'var(--space-4) 0' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
          <div>
            <span className="form-label">Moto</span>
            <select
              value={form.motoId || ''}
              onChange={(e) => setForm(prev => ({ ...prev, motoId: e.target.value }))}
              className="form-select form-select-md"
            >
              <option value="">Selecciona una moto</option>
              {motos.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="form-label">Realizado por</span>
            <select
              value={form.workshop || ''}
              onChange={(e) => setForm(prev => ({ ...prev, workshop: e.target.value }))}
              className="form-select form-select-md"
            >
              <option value="Mantenimiento propio (DIY)">Mantenimiento propio (DIY)</option>
              { /* Talleres se cargarían dinámicamente */ }
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div>
            <span className="form-label">Categoría</span>
            <select
              value={form.category || MAINTENANCE_CATEGORIES[0]}
              onChange={(e) => {
                const selected = e.target.value
                setForm(prev => ({
                  ...prev,
                  category: selected,
                  suspensionSetup: SUSPENSION_FIELDS[selected] ? { ...SUSPENSION_FIELDS[selected] } : {}
                }))
              }}
              className="form-select form-select-md"
            >
              <option value="">-- Selecciona categoría --</option>
              {MAINTENANCE_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <span className="form-label">Fecha</span>
            <input
              type="date"
              value={form.date}
              onChange={(e) => setForm(prev => ({ ...prev, date: e.target.value }))}
              className="form-input form-input-md"
            />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
          <div>
            <span className="form-label">Kilometraje (km)</span>
            <input
              type="number"
              value={form.mileage}
              onChange={(e) => setForm(prev => ({ ...prev, mileage: parseInt(e.target.value) || 0 }))}
              className="form-input form-input-md"
              min="0"
            />
          </div>
          <div>
            <span className="form-label">Título</span>
            <input
              type="text"
              value={form.title || ''}
              onChange={(e) => setForm(prev => ({ ...prev, title: e.target.value }))}
              className="form-input form-input-md"
              placeholder="Ej. Engrase cadena tras ruta lluvia"
            />
          </div>
        </div>

        <div style={{ marginTop: 'var(--space-3)' }}>
          <span className="form-label">Descripción / Piezas sustituidas</span>
          <textarea
            value={form.description || ''}
            onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
            className="form-input form-input-md"
            rows={3}
            placeholder="Piezas sustituidas, observaciones, etc."
          ></textarea>
        </div>

        <div style={{ marginTop: 'var(--space-3)' }}>
          <span className="form-label">Coste (€, 0 si es ajuste/engrase)</span>
          <input
            type="number"
            value={form.cost}
            onChange={(e) => setForm(prev => ({ ...prev, cost: parseFloat(e.target.value) || 0 }))}
            className="form-input form-input-md"
            min="0"
            step="0.01"
            placeholder="0 para ajustes sin gasto"
          />
        </div>

        {/* Bloque técnico de suspensiones/presiones - se renderiza según la categoría seleccionada */}
        {(form.category === 'Reglaje / Tarado de suspensiones' || form.category === 'Neumáticos y presiones') && (
          <SuspensionSetupForm
            category={form.category}
            setup={form.suspensionSetup}
            onFieldChange={(section, field, value) => {
              setForm(prev => ({
                ...prev,
                suspensionSetup: {
                  ...prev.suspensionSetup,
                  [section]: {
                    ...prev.suspensionSetup[section],
                    [field]: value
                  }
                }
              }))
            }}
          />
        )}

        <div style={{ marginTop: 'var(--space-4)' }}>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            style={{ width: '100%' }}
          >
            {editingId ? 'Actualizar Mantenimiento' : 'Guardar Mantenimiento'}
          </button>
        </div>
      </div>

      {/* Historial de Mantenimiento */}
      <SectionHeader
        title="Historial de Mantenimiento"
        subtitle={`
          Total gastado: ${totalGastado.toFixed(2)} € | 
          Último km: ${ultimoKm} km | 
          km desde último engrase: ${kmDesdeUltimoEngrase} km
        `}
      />

      {maintenances.length === 0 && (
        <EmptyState
          icon="🔧"
          title="No hay mantenimientos registrados"
          description="Añade tu primer mantenimiento usando el formulario de arriba"
        />
      )}

      <div style={{ marginTop: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)' }}>
          <span className="small-text">Filtrar:</span>
          <select
            onChange={(e) => setFiltered(prev => ({ ...prev, category: e.target.value }))}
            className="form-select form-select-sm"
            style={{ width: '150px' }}
          >
            <option value="all">Todas las categorías</option>
            {MAINTENANCE_CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            onChange={(e) => setFiltered(prev => ({ ...prev, moto: e.target.value }))}
            className="form-select form-select-sm"
            style={{ width: '180px' }}
          >
            <option value="all">Todas las motos</option>
            {motos.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-card)', color: 'var(--color-text-primary)' }}>
                <th style={{ padding: 'var(--space-2)', textAlign: 'left' }}>Fecha</th>
                <th style={{ padding: 'var(--space-2)', textAlign: 'left' }}>Moto</th>
                <th style={{ padding: 'var(--space-2)', textAlign: 'left' }}>Categoría</th>
                <th style={{ padding: 'var(--space-2)', textAlign: 'left' }}>Neumático</th>
                <th style={{ padding: 'var(--space-2)', textAlign: 'left' }}>Km</th>
                <th style={{ padding: 'var(--space-2)', textAlign: 'left' }}>Coste (€)</th>
                <th style={{ padding: 'var(--space-2)', textAlign: 'left' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {maintenances.map((m) => {
                const isTiresCategory = m.category === 'Neumáticos y presiones'
                const tireInfo = isTiresCategory && m.suspensionSetup?.neumaticos
                  ? `${m.suspensionSetup.neumaticos.brand || ''} ${m.suspensionSetup.neumaticos.model || ''} · ${m.suspensionSetup.neumaticos.frontSize || ''} / ${m.suspensionSetup.neumaticos.rearSize || ''}`.trim()
                  : '—'
                return (
                  <tr key={m.id} style={{ background: m.id === editingId ? 'var(--color-primary)' : 'var(--color-card)', color: 'var(--color-text-primary)' }}>
                    <td style={{ padding: 'var(--space-2)' }}>{new Date(m.date).toLocaleDateString()}</td>
                    <td style={{ padding: 'var(--space-2)' }}>{m.motoId || '—'}</td>
                    <td style={{ padding: 'var(--space-2)' }}>{m.category || '—'}</td>
                    <td style={{ padding: 'var(--space-2)' }}>{tireInfo}</td>
                    <td style={{ padding: 'var(--space-2)' }}>{m.mileage || 0}</td>
                    <td style={{ padding: 'var(--space-2)' }}>{m.cost || 0} €</td>
                    <td style={{ padding: 'var(--space-2)' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-outline-sm"
                          onClick={() => {
                            const setup = m.suspensionSetup || {}
                            copySetup(setup)
                            setEditingId(m.id)
                          }}
                        >
                          Copiar
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-danger-sm"
                          onClick={async () => {
                            if (window.confirm('¿Eliminar este mantenimiento?')) {
                              await deleteMaintenanceRecord(m.id)
                              const loadMaintenances = async () => {
                                const all = await getAllMaintenances()
                                setMaintenances(all)
                              }
                              loadMaintenances()
                            }
                          }}
                        >
                          Borrar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {editingId && (
        <Modal
          isOpen={true}
          onClose={() => {
            setEditingId(null)
            clearCopiedSetup()
          }}
          title="Confirmar"
          size="sm"
        >
          <p>¿Estás seguro de que quieres eliminar este mantenimiento?</p>
          <div style={{ marginTop: 'var(--space-3)', display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn btn-outline"
              onClose={() => setEditingId(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn btn-danger"
              onClick={async () => {
                // Lógica de eliminación
                if (editingId) {
                  await deleteMaintenanceRecord(editingId)
                  setEditingId(null)
                  clearCopiedSetup()
                  const loadMaintenances = async () => {
                    const all = await getAllMaintenances()
                    setMaintenances(all)
                  }
                  loadMaintenances()
                }
              }}
            >
              Eliminar
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}