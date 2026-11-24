/**
 * MantenimientoForm - Formulario de registro de mantenimiento
 * Recibe: { motos, workshops, tires, initialData, onSave, onCancel }
 */
import React, { useState, useEffect } from 'react'
import { MAINTENANCE_CATEGORIES, SUSPENSION_FIELDS } from './MantenimientoConstants'
import { SuspensionSetupForm } from './SuspensionSetupForm'

export const MantenimientoForm = ({ motos, workshops, tires, initialData, onSave, onCancel }) => {
  const [form, setForm] = useState({
    motoId: initialData?.motoId || '',
    workshop: initialData?.workshop || 'Mantenimiento propio (DIY)',
    category: initialData?.category || MAINTENANCE_CATEGORIES[0],
    date: initialData?.date || new Date().toISOString().split('T')[0],
    mileage: initialData?.mileage || 0,
    title: initialData?.title || '',
    description: initialData?.description || '',
    cost: initialData?.cost || 0,
    suspensionSetup: initialData?.suspensionSetup || {}
  })
  const [selectedTireId, setSelectedTireId] = useState('')

  // Reset form when initialData changes (e.g., when editing different record)
  useEffect(() => {
    if (initialData) {
      setForm({
        motoId: initialData.motoId || '',
        workshop: initialData.workshop || 'Mantenimiento propio (DIY)',
        category: initialData.category || MAINTENANCE_CATEGORIES[0],
        date: initialData.date || new Date().toISOString().split('T')[0],
        mileage: initialData.mileage || 0,
        title: initialData.title || '',
        description: initialData.description || '',
        cost: initialData.cost || 0,
        suspensionSetup: initialData.suspensionSetup || {}
      })
      setSelectedTireId('')
    }
  }, [initialData])

  // Reset suspensionSetup when category changes
  useEffect(() => {
    if (SUSPENSION_FIELDS[form.category]) {
      setForm(prev => ({
        ...prev,
        suspensionSetup: { ...SUSPENSION_FIELDS[form.category] }
      }))
    } else {
      setForm(prev => ({ ...prev, suspensionSetup: {} }))
    }
  }, [form.category])

  const handleFieldChange = (e) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? (value === '' ? 0 : parseFloat(value)) : value
    }))
  }

  const handleSuspensionFieldChange = (section, field, value) => {
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
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <form onSubmit={handleSubmit} className="card" style={{ padding: 'var(--space-4)' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)', marginBottom: 'var(--space-3)' }}>
        <div>
          <span className="form-label">Moto</span>
          <select
            name="motoId"
            value={form.motoId || ''}
            onChange={handleFieldChange}
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
            name="workshop"
            value={form.workshop || ''}
            onChange={handleFieldChange}
            className="form-select form-select-md"
          >
            <option value="Mantenimiento propio (DIY)">Mantenimiento propio (DIY)</option>
            {workshops.map(w => (
              <option key={w} value={w}>{w}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        <div>
          <span className="form-label">Categoría</span>
          <select
            name="category"
            value={form.category || MAINTENANCE_CATEGORIES[0]}
            onChange={handleFieldChange}
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
            name="date"
            value={form.date}
            onChange={handleFieldChange}
            className="form-input form-input-md"
          />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
        <div>
          <span className="form-label">Kilometraje (km)</span>
          <input
            type="number"
            name="mileage"
            value={form.mileage}
            onChange={handleFieldChange}
            className="form-input form-input-md"
            min="0"
          />
        </div>
        <div>
          <span className="form-label">Título</span>
          <input
            type="text"
            name="title"
            value={form.title || ''}
            onChange={handleFieldChange}
            className="form-input form-input-md"
            placeholder="Ej. Engrase cadena tras ruta lluvia"
          />
        </div>
      </div>

      <div style={{ marginTop: 'var(--space-3)' }}>
        <span className="form-label">Descripción / Piezas sustituidas</span>
        <textarea
          name="description"
          value={form.description || ''}
          onChange={handleFieldChange}
          className="form-input form-input-md"
          rows={3}
          placeholder="Piezas sustituidas, observaciones, etc."
        ></textarea>
      </div>

      <div style={{ marginTop: 'var(--space-3)' }}>
        <span className="form-label">Coste (€, 0 si es ajuste/engrase)</span>
        <input
          type="number"
          name="cost"
          value={form.cost}
          onChange={handleFieldChange}
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
          onFieldChange={handleSuspensionFieldChange}
          tires={tires}
          selectedTireId={selectedTireId}
          setSelectedTireId={setSelectedTireId}
        />
      )}

      <div style={{ marginTop: 'var(--space-4)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onCancel}
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          Guardar Mantenimiento
        </button>
      </div>
    </form>
  )
}