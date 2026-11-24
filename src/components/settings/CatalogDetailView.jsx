import React, { useState, useEffect, useCallback } from 'react'
import { MotoIcon, WrenchIcon, PaletteIcon, PlusIcon, EditIcon, TrashIcon, ChevronLeftIcon, ShieldIcon, CircleIcon } from '../shared/Icons'

const CATALOG_CONFIG = {
  garaje: {
    title: 'Garaje / Motos',
    icon: MotoIcon,
    description: 'Gestiona tus motos: marca, modelo, año, matrícula, kilometraje y notas',
    fields: [
      { name: 'brand', label: 'Marca', type: 'text', required: true, placeholder: 'Ej: Yamaha, BMW, KTM' },
      { name: 'model', label: 'Modelo', type: 'text', required: true, placeholder: 'Ej: Ténéré 700, R 1250 GS' },
      { name: 'year', label: 'Año', type: 'number', min: 1900, max: new Date().getFullYear() + 1, placeholder: '2024' },
      { name: 'plate', label: 'Matrícula', type: 'text', placeholder: 'Ej: 1234 ABC' },
      { name: 'currentMileage', label: 'Km actuales', type: 'number', min: 0, placeholder: '0' },
      { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Observaciones, modificaciones, etc.' },
    ],
    formatItem: (item) => (
      <div className="catalog-item">
        <div className="catalog-item-main">
          <div className="catalog-item-title">{item.brand} {item.model}</div>
          <div className="catalog-item-meta">
            {item.year && <span className="meta-badge">{item.year}</span>}
            {item.plate && <span className="meta-badge">{item.plate}</span>}
            {item.currentMileage && <span className="meta-badge">{item.currentMileage.toLocaleString()} km</span>}
          </div>
          {item.notes && <div className="catalog-item-notes">{item.notes}</div>}
        </div>
      </div>
    ),
  },
  talleres: {
    title: 'Talleres',
    icon: WrenchIcon,
    description: 'Registra tus talleres de confianza: nombre, teléfono, dirección, especialidad y notas',
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true, placeholder: 'Ej: MotoSport Madrid' },
      { name: 'phone', label: 'Teléfono', type: 'tel', placeholder: '+34 91 123 45 67' },
      { name: 'address', label: 'Dirección', type: 'text', placeholder: 'Calle, número, ciudad, código postal' },
      { name: 'specialty', label: 'Especialidad', type: 'text', placeholder: 'Ej: Suspensiones, Motor, Electricidad, Neumáticos' },
      { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Horario, contacto, observaciones...' },
    ],
    formatItem: (item) => (
      <div className="catalog-item">
        <div className="catalog-item-main">
          <div className="catalog-item-title">{item.name}</div>
          <div className="catalog-item-meta">
            {item.specialty && <span className="meta-badge">{item.specialty}</span>}
            {item.phone && <span className="meta-badge">{item.phone}</span>}
          </div>
          {item.address && <div className="catalog-item-notes">{item.address}</div>}
          {item.notes && <div className="catalog-item-notes">{item.notes}</div>}
        </div>
      </div>
    ),
  },
  neumaticos: {
    title: 'Neumáticos',
    icon: CircleIcon,
    description: 'Catálogo de neumáticos: marca, modelo, medidas y presiones recomendadas',
    fields: [
      { name: 'brand', label: 'Marca', type: 'text', required: true, placeholder: 'Ej: Michelin, Pirelli, Metzeler' },
      { name: 'model', label: 'Modelo', type: 'text', required: true, placeholder: 'Ej: Anakee Wild, Scorpion Rally' },
      { name: 'frontSize', label: 'Medida Delantero', type: 'text', placeholder: 'Ej: 90/90-21' },
      { name: 'rearSize', label: 'Medida Trasero', type: 'text', placeholder: 'Ej: 150/70-18' },
      { name: 'frontPressure', label: 'Presión Del. (bar)', type: 'number', step: 0.1, min: 0, placeholder: '2.3' },
      { name: 'rearPressure', label: 'Presión Tras. (bar)', type: 'number', step: 0.1, min: 0, placeholder: '2.5' },
      { name: 'notes', label: 'Notas', type: 'textarea', placeholder: 'Uso recomendado, observaciones...' },
    ],
    formatItem: (item) => (
      <div className="catalog-item">
        <div className="catalog-item-main">
          <div className="catalog-item-title">{item.brand} {item.model}</div>
          <div className="catalog-item-meta">
            <span className="meta-badge tire-badge">
              Del: {item.frontSize || '—'} · Tras: {item.rearSize || '—'}
            </span>
            {(item.frontPressure || item.rearPressure) && (
              <span className="meta-badge pressure-badge">
                Presión: {item.frontPressure ? `${item.frontPressure} bar` : '—'} / {item.rearPressure ? `${item.rearPressure} bar` : '—'}
              </span>
            )}
          </div>
          {item.notes && <div className="catalog-item-notes">{item.notes}</div>}
        </div>
      </div>
    ),
  },
  documentTypes: {
    title: 'Tipos de Documento',
    icon: ShieldIcon,
    description: 'Define los tipos de documento para la Guantera Digital',
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', required: true, placeholder: 'Ej: Seguro, ITV, Permiso de circulación' },
      { 
        name: 'expiryType', 
        label: 'Tipo de vencimiento', 
        type: 'select', 
        required: true,
        options: [
          { value: 'none', label: 'Sin fecha de vencimiento' },
          { value: 'date', label: 'Con fecha de vencimiento' },
          { value: 'insurance', label: 'Seguro y Asistencia' },
        ]
      },
    ],
    formatItem: (item) => (
      <div className="catalog-item">
        <div className="catalog-item-main">
          <div className="catalog-item-title">{item.name}</div>
          <div className="catalog-item-meta">
            <span className="meta-badge expiry-badge">
              {item.expiryType === 'none' && 'Sin vencimiento'}
              {item.expiryType === 'date' && 'Con fecha de vencimiento'}
              {item.expiryType === 'insurance' && 'Seguro y Asistencia'}
            </span>
          </div>
        </div>
      </div>
    ),
  },
  customThemes: {
    title: 'Temas Personalizados',
    icon: PaletteIcon,
    description: 'Crea tus propios temas de color con 3 tonos: principal, secundario y terciario',
    fields: [
      { name: 'name', label: 'Nombre del tema', type: 'text', required: true, placeholder: 'Ej: Ténéré Rally, GS Trophy, Mi Tema' },
      { name: 'primaryColor', label: 'Color 1 (Principal)', type: 'color', required: true, defaultValue: '#FF6B00' },
      { name: 'secondaryColor', label: 'Color 2 (Secundario)', type: 'color', required: true, defaultValue: '#00A8E8' },
      { name: 'tertiaryColor', label: 'Color 3 (Terciario)', type: 'color', required: true, defaultValue: '#22C55E' },
    ],
    formatItem: (item) => (
      <div className="catalog-item catalog-theme-item">
        <div className="catalog-item-main">
          <div className="catalog-item-title">{item.name}</div>
          <div className="catalog-item-meta theme-swatches">
            {item.primaryColor && (
              <div className="swatch-circle" style={{ backgroundColor: item.primaryColor }} title={`Color 1: ${item.primaryColor}`}>
                <span className="swatch-number">1</span>
              </div>
            )}
            {item.secondaryColor && (
              <div className="swatch-circle" style={{ backgroundColor: item.secondaryColor }} title={`Color 2: ${item.secondaryColor}`}>
                <span className="swatch-number">2</span>
              </div>
            )}
            {item.tertiaryColor && (
              <div className="swatch-circle" style={{ backgroundColor: item.tertiaryColor }} title={`Color 3: ${item.tertiaryColor}`}>
                <span className="swatch-number">3</span>
              </div>
            )}
          </div>
        </div>
      </div>
    ),
  },
}

const DB_METHODS = {
  garaje: { getAll: 'getMotorcycles', save: 'saveMotorcycle', edit: 'editMotorcycle', remove: 'removeMotorcycle' },
  talleres: { getAll: 'getWorkshops', save: 'saveWorkshop', edit: 'editWorkshop', remove: 'removeWorkshop' },
  neumaticos: { getAll: 'getAllTires', save: 'saveTire', edit: 'updateTire', remove: 'deleteTire' },
  documentTypes: { getAll: 'getAllDocumentTypes', save: 'saveDocumentType', edit: 'updateDocumentType', remove: 'deleteDocumentType' },
  customThemes: { getAll: 'getCustomThemes', save: 'saveCustomTheme', edit: 'editCustomTheme', remove: 'removeCustomTheme' },
}

export function CatalogDetailView({ catalogKey, onBack, dbProps }) {
  const config = CATALOG_CONFIG[catalogKey]
  const dbMethods = DB_METHODS[catalogKey]
  
  if (!config || !dbMethods) {
    return (
      <div className="catalog-detail-view">
        <div className="catalog-error">
          <p>Catálogo no encontrado: {catalogKey}</p>
        </div>
      </div>
    )
  }

  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState(null)
  const [formData, setFormData] = useState({})
  const [formError, setFormError] = useState(null)

  // Initialize form data with defaults
  const resetForm = useCallback(() => {
    const defaults = {}
    config.fields.forEach(field => {
      if (field.defaultValue !== undefined) {
        defaults[field.name] = field.defaultValue
      } else if (field.type === 'number') {
        defaults[field.name] = ''
      } else if (field.type === 'select') {
        defaults[field.name] = field.options?.[0]?.value || ''
      } else {
        defaults[field.name] = ''
      }
    })
    setFormData(defaults)
    setFormError(null)
    setEditingItem(null)
  }, [config.fields])

  const loadItems = useCallback(async () => {
    setLoading(true)
    try {
      const data = await dbProps[dbMethods.getAll]()
      setItems(data || [])
    } catch (error) {
      console.error(`Error loading ${catalogKey}:`, error)
    } finally {
      setLoading(false)
    }
  }, [catalogKey, dbMethods.getAll, dbProps])

  useEffect(() => {
    loadItems()
    resetForm()
  }, [loadItems, resetForm])

  const handleInputChange = (e) => {
    const { name, value, type } = e.target
    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) }))
    } else if (type === 'color') {
      setFormData(prev => ({ ...prev, [name]: value }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)

    // Validate required fields
    for (const field of config.fields) {
      if (field.required && !formData[field.name]) {
        setFormError(`${field.label} es obligatorio`)
        return
      }
    }

    try {
      const dataToSave = { ...formData }
      
      // Convert numbers
      config.fields.forEach(field => {
        if (field.type === 'number' && dataToSave[field.name] !== '') {
          dataToSave[field.name] = Number(dataToSave[field.name])
        }
      })

      if (editingItem) {
        await dbProps[dbMethods.edit](editingItem.id, dataToSave)
      } else {
        await dbProps[dbMethods.save](dataToSave)
      }
      
      resetForm()
      setShowForm(false)
      loadItems()
    } catch (error) {
      console.error(`Error saving ${catalogKey}:`, error)
      setFormError('Error al guardar. Inténtalo de nuevo.')
    }
  }

  const handleEdit = (item) => {
    setEditingItem(item)
    const data = { ...item }
    // Remove id and createdAt for editing
    delete data.id
    delete data.createdAt
    setFormData(data)
    setShowForm(true)
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`¿Eliminar "${item.name || item.brand + ' ' + item.model || item.name}"?`)) return
    try {
      await dbProps[dbMethods.remove](item.id)
      loadItems()
    } catch (error) {
      console.error(`Error deleting ${catalogKey}:`, error)
      alert('Error al eliminar')
    }
  }

  const handleAddNew = () => {
    resetForm()
    setShowForm(true)
  }

  const handleCancel = () => {
    resetForm()
    setShowForm(false)
  }

  const Icon = config.icon

  return (
    <div className="catalog-detail-view">
      {/* Back button - own row, left aligned */}
      <div className="catalog-back-row">
        <button className="btn btn-ghost" onClick={onBack}>
          <ChevronLeftIcon size={18} /> Volver a Listados
        </button>
      </div>

      {/* Header: title left, add button right */}
      <div className="catalog-header">
        <div className="catalog-title-section">
          <Icon size={28} />
          <div>
            <h1 className="catalog-title">{config.title}</h1>
            <p className="catalog-description">{config.description}</p>
          </div>
        </div>

        {/* Add new button (when not in form mode) */}
        {!showForm && (
          <button className="btn btn-primary" onClick={handleAddNew}>
            <PlusIcon size={18} /> Añadir nuevo
          </button>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="catalog-form-overlay" onClick={handleCancel}>
          <div className="catalog-form-modal" onClick={(e) => e.stopPropagation()}>
            <div className="catalog-form-header">
              <h2>{editingItem ? 'Editar' : 'Nuevo'} {config.title.slice(0, -1)}</h2>
              <button className="btn-icon" onClick={handleCancel} aria-label="Cerrar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            
            {formError && <div className="form-error">{formError}</div>}
            
            <form onSubmit={handleSubmit} className="catalog-form">
              {config.fields.map((field) => (
                <div key={field.name} className="form-group">
                  <label className="form-label">
                    {field.label}
                    {field.required && <span className="required">*</span>}
                  </label>
                  {field.type === 'textarea' ? (
                    <textarea
                      className="form-textarea"
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleInputChange}
                      placeholder={field.placeholder}
                      rows={3}
                    />
                  ) : field.type === 'select' ? (
                    <div className="select-wrapper">
                      <select
                        className="form-select"
                        name={field.name}
                        value={formData[field.name] || ''}
                        onChange={handleInputChange}
                        required={field.required}
                      >
                        <option value="">Seleccionar...</option>
                        {field.options?.map(opt => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    </div>
                  ) : field.type === 'color' ? (
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        className="color-input"
                        name={field.name}
                        value={formData[field.name] || field.defaultValue || '#000000'}
                        onChange={handleInputChange}
                      />
                      <input
                        type="text"
                        className="color-hex-input"
                        value={formData[field.name] || field.defaultValue || '#000000'}
                        onChange={handleInputChange}
                        name={field.name}
                        placeholder="#RRGGBB"
                        maxLength={7}
                      />
                    </div>
                  ) : (
                    <input
                      type={field.type}
                      className="form-input"
                      name={field.name}
                      value={formData[field.name] || ''}
                      onChange={handleInputChange}
                      placeholder={field.placeholder}
                      min={field.min}
                      max={field.max}
                      step={field.step}
                      required={field.required}
                    />
                  )}
                </div>
              ))}
              
              <div className="form-actions">
                <button type="button" className="btn btn-ghost" onClick={handleCancel}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingItem ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* List */}
      <div className="catalog-list-section">
        {loading ? (
          <div className="loading-state">
            <svg className="spin" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>Cargando...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="empty-state">
            <Icon size={48} />
            <h3>Sin {config.title.toLowerCase()} registrad{config.title.endsWith('s') ? 'os' : 'os'}</h3>
            <p>Añade tu primer elemento para empezar.</p>
          </div>
        ) : (
          <div className="catalog-list">
            {items.map((item) => (
              <div key={item.id} className="catalog-card">
                {config.formatItem(item)}
                <div className="catalog-actions">
                  <button 
                    className="btn-icon" 
                    onClick={() => handleEdit(item)}
                    title="Editar"
                  >
                    <EditIcon size={18} />
                  </button>
                  <button 
                    className="btn-icon danger" 
                    onClick={() => handleDelete(item)}
                    title="Eliminar"
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default CatalogDetailView