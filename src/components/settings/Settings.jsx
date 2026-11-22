import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useGPX } from '../../context/GPXContext'
import { useDatabase } from '../../hooks/useDatabase'
import { useAuth } from '../../context/AuthContext'
import { EmptyState, SectionHeader, SettingCard, Tabs, Modal, InstallAppButton } from '../shared'
import { formatBackupName } from '../../utils/formatters'
import { getMotoModelsArray, getMotoModel } from '../../constants/motoModels'
import { getThemesList } from '../../constants/themes'
import { applyThemeToDocument, validateActiveTheme, refreshActiveCustomTheme } from '../../utils/themeEngine'
import { TrashIcon, DownloadIcon, UploadIcon, FolderIcon, RefreshCwIcon, EditIcon, WrenchIcon, UserIcon, CheckCircleIcon, MotoIcon, PaletteIcon, PlusIcon, CloudIcon, CloudOffIcon, SyncIcon, LogOutIcon, UserCircleIcon } from '../shared/Icons'

const TABS = [
  { id: 'appearance', label: 'Apariencia' },
  { id: 'lists', label: 'Listados' },
  { id: 'misc', label: 'Varios' },
]

const typeOptions = [
  { value: 'workshop', label: 'Taller / Concesionario' },
  { value: 'owner', label: 'Propietario' }
]

const specialtyOptions = [
  { value: 'official', label: 'Concesionario Oficial' },
  { value: 'multibrand', label: 'Taller Multimarca' },
  { value: 'tires-suspension', label: 'Neumáticos y Suspensiones' },
  { value: 'electrical', label: 'Electricidad / Electrónica' },
  { value: 'owner', label: 'Automantenimiento' }
]

export const Settings = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'dark')
  const [selectedMoto, setSelectedMoto] = useState('cfmoto-800mt-x')
  const [activeTab, setActiveTab] = useState('appearance')
  const [colorTheme, setColorTheme] = useState('cfmoto-gold')
  const { 
    fsSupported, 
    fsHasFolder, 
    pickFolder, 
    syncToFileSystem, 
    loadFromFile, 
    downloadDB, 
    createBackup, 
    listBackups, 
    loadBackup, 
    getFileSystemInfo, 
    clearTracks, 
    dbReady, 
    loadSettings, 
    saveSetting 
  } = useGPX()
  const { getWorkshops, saveWorkshop, editWorkshop, removeWorkshop, getMotorcycles, saveMotorcycle, editMotorcycle, removeMotorcycle, getCustomThemes, saveCustomTheme, editCustomTheme, removeCustomTheme } = useDatabase()
  const { user, isConnected, syncStatus, lastSync, error: authError, connect, disconnect, syncNow } = useAuth()
  const [backups, setBackups] = useState([])
  const [loadingBackups, setLoadingBackups] = useState(false)
  const [syncing, setSyncing] = useState(false)
  const [folderError, setFolderError] = useState(null)
  
  // Custom Themes state
  const [customThemes, setCustomThemes] = useState([])
  const [loadingCustomThemes, setLoadingCustomThemes] = useState(true)
  const [showCustomThemeForm, setShowCustomThemeForm] = useState(false)
  const [editingCustomTheme, setEditingCustomTheme] = useState(null)
  const [customThemeFormData, setCustomThemeFormData] = useState({
    name: '',
    brand: '',
    primaryColor: '#D2B474',
    secondaryColor: '#0D0D0F',
    tertiaryColor: '#D96B27'
  })
  const [deleteCustomThemeConfirm, setDeleteCustomThemeConfirm] = useState(null)
  const [customThemeFormError, setCustomThemeFormError] = useState(null)
  
  // Workshops state
  const [workshops, setWorkshops] = useState([])
  const [loadingWorkshops, setLoadingWorkshops] = useState(true)
  const [showWorkshopForm, setShowWorkshopForm] = useState(false)
  const [editingWorkshop, setEditingWorkshop] = useState(null)
  const [formData, setFormData] = useState({
    type: 'workshop',
    name: '',
    specialty: '',
    phone: '',
    address: '',
    cif: '',
    notes: '',
    isDefault: false
  })
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [formError, setFormError] = useState(null)

  // Motorcycles state
  const [motorcycles, setMotorcycles] = useState([])
  const [loadingMotorcycles, setLoadingMotorcycles] = useState(true)
  const [showMotorcycleForm, setShowMotorcycleForm] = useState(false)
  const [editingMotorcycle, setEditingMotorcycle] = useState(null)
  const [motorcycleFormData, setMotorcycleFormData] = useState({
    // Bloque 1 — Identificación y Compra
    brand: '',
    model: '',
    year: '',
    color: '',
    plate: '',
    vin: '',
    purchaseDate: '',
    purchaseOrigin: 'dealer', // 'dealer' | 'private'
    sellerName: '',
    initialMileage: '',
    currentMileage: '',
    // Bloque 2 — Neumáticos
    frontTireSize: '',
    frontTireBrand: '',
    rearTireSize: '',
    rearTireBrand: '',
    // Bloque 3 — Especificaciones e ITV
    nextITVDate: '',
    displacement: '',
    tankCapacity: ''
  })
  const [deleteMotorcycleConfirm, setDeleteMotorcycleConfirm] = useState(null)
  const [motorcycleFormError, setMotorcycleFormError] = useState(null)

  // Load workshops on mount
  useEffect(() => {
    const loadWorkshops = async () => {
      try {
        const data = await getWorkshops()
        setWorkshops(data)
      } catch (error) {
        console.error('Error loading workshops:', error)
      } finally {
        setLoadingWorkshops(false)
      }
    }
    loadWorkshops()
  }, [getWorkshops])

  // Load motorcycles on mount
  useEffect(() => {
    const loadMotorcycles = async () => {
      try {
        const data = await getMotorcycles()
        setMotorcycles(data)
      } catch (error) {
        console.error('Error loading motorcycles:', error)
      } finally {
        setLoadingMotorcycles(false)
      }
    }
    loadMotorcycles()
  }, [getMotorcycles])

  // Load custom themes on mount
  useEffect(() => {
    const loadCustomThemes = async () => {
      try {
        const data = await getCustomThemes()
        setCustomThemes(data)
      } catch (error) {
        console.error('Error loading custom themes:', error)
      } finally {
        setLoadingCustomThemes(false)
      }
    }
    loadCustomThemes()
  }, [getCustomThemes])

  // Themes list state (for appearance tab)
  const [themesList, setThemesList] = useState([])
  const [loadingThemes, setLoadingThemes] = useState(true)

  useEffect(() => {
    const loadThemes = async () => {
      try {
        const themes = await getThemesList()
        setThemesList(themes)
      } catch (error) {
        console.error('Error loading themes:', error)
      } finally {
        setLoadingThemes(false)
      }
    }
    loadThemes()
  }, [])

  const resetForm = () => {
    setFormData({
      type: 'workshop',
      name: '',
      specialty: '',
      phone: '',
      address: '',
      cif: '',
      notes: '',
      isDefault: false
    })
    setEditingWorkshop(null)
    setFormError(null)
  }

  const handleTypeChange = (type) => {
    setFormData(prev => {
      const newData = { ...prev, type }
      if (type === 'owner') {
        newData.name = 'Mantenimiento propio'
        newData.specialty = 'Automantenimiento'
        newData.phone = ''
        newData.address = ''
        newData.cif = ''
      }
      return newData
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormError(null)
    
    if (!formData.name.trim()) {
      setFormError('El nombre es obligatorio')
      return
    }
    if (!formData.specialty) {
      setFormError('La especialidad es obligatoria')
      return
    }
    if (formData.type === 'workshop' && !formData.phone.trim() && !formData.address.trim()) {
      setFormError('Teléfono o dirección son recomendados para talleres')
    }

    try {
      if (editingWorkshop) {
        await editWorkshop(editingWorkshop.id, formData)
      } else {
        await saveWorkshop(formData)
      }
      const data = await getWorkshops()
      setWorkshops(data)
      resetForm()
      setShowWorkshopForm(false)
    } catch (error) {
      console.error('Error saving workshop:', error)
      setFormError('Error al guardar. Inténtalo de nuevo.')
    }
  }

  const handleEdit = (workshop) => {
    setEditingWorkshop(workshop)
    setFormData({
      type: workshop.type,
      name: workshop.name,
      specialty: workshop.specialty || '',
      phone: workshop.phone || '',
      address: workshop.address || '',
      cif: workshop.cif || '',
      notes: workshop.notes || '',
      isDefault: workshop.isDefault || false
    })
    setShowWorkshopForm(true)
    setFormError(null)
  }

  const handleDeleteConfirm = (workshop) => {
    setDeleteConfirm(workshop)
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      await removeWorkshop(deleteConfirm.id)
      const data = await getWorkshops()
      setWorkshops(data)
    } catch (error) {
      console.error('Error deleting workshop:', error)
    } finally {
      setDeleteConfirm(null)
    }
  }

  // Motorcycle form handlers
  const resetMotorcycleForm = () => {
    setMotorcycleFormData({
      brand: '',
      model: '',
      year: '',
      color: '',
      plate: '',
      vin: '',
      purchaseDate: '',
      purchaseOrigin: 'dealer',
      sellerName: '',
      initialMileage: '',
      currentMileage: '',
      frontTireSize: '',
      frontTireBrand: '',
      rearTireSize: '',
      rearTireBrand: '',
      nextITVDate: '',
      displacement: '',
      tankCapacity: ''
    })
    setEditingMotorcycle(null)
    setMotorcycleFormError(null)
  }

  // Custom Theme form handlers
  const resetCustomThemeForm = () => {
    setCustomThemeFormData({
      name: '',
      brand: '',
      primaryColor: '#D2B474',
      secondaryColor: '#0D0D0F',
      tertiaryColor: '#D96B27'
    })
    setEditingCustomTheme(null)
    setCustomThemeFormError(null)
  }

  const handleCustomThemeSubmit = async (e) => {
    e.preventDefault()
    setCustomThemeFormError(null)
    
    if (!customThemeFormData.name.trim()) {
      setCustomThemeFormError('El nombre del tema es obligatorio')
      return
    }
    
    const swatches = [
      customThemeFormData.primaryColor,
      customThemeFormData.secondaryColor,
      customThemeFormData.tertiaryColor
    ]
    
    const dataToSave = {
      name: customThemeFormData.name.trim(),
      brand: customThemeFormData.brand.trim(),
      primaryColor: customThemeFormData.primaryColor,
      secondaryColor: customThemeFormData.secondaryColor,
      tertiaryColor: customThemeFormData.tertiaryColor,
      swatches
    }
    
    try {
      if (editingCustomTheme) {
        await editCustomTheme(editingCustomTheme.id, dataToSave)
      } else {
        await saveCustomTheme(dataToSave)
      }
      const data = await getCustomThemes()
      setCustomThemes(data)
      resetCustomThemeForm()
      setShowCustomThemeForm(false)
    } catch (error) {
      console.error('Error saving custom theme:', error)
      setCustomThemeFormError('Error al guardar. Inténtalo de nuevo.')
    }
  }

  const handleEditCustomTheme = (theme) => {
    setEditingCustomTheme(theme)
    setCustomThemeFormData({
      name: theme.name || '',
      brand: theme.brand || '',
      primaryColor: theme.primaryColor || theme.swatches?.[0] || '#D2B474',
      secondaryColor: theme.secondaryColor || theme.swatches?.[1] || '#0D0D0F',
      tertiaryColor: theme.tertiaryColor || theme.swatches?.[2] || '#D96B27'
    })
    setShowCustomThemeForm(true)
    setCustomThemeFormError(null)
  }

  const handleDeleteCustomThemeConfirm = (theme) => {
    setDeleteCustomThemeConfirm(theme)
  }

  const handleDeleteCustomTheme = async () => {
    if (!deleteCustomThemeConfirm) return
    try {
      await removeCustomTheme(deleteCustomThemeConfirm.id)
      const data = await getCustomThemes()
      setCustomThemes(data)
      
      // If the deleted theme was active, validate and potentially reset
      await validateActiveTheme()
      await refreshActiveCustomTheme()
      
      setDeleteCustomThemeConfirm(null)
    } catch (error) {
      console.error('Error deleting custom theme:', error)
    }
  }

  const handleMotorcycleSubmit = async (e) => {
    e.preventDefault()
    setMotorcycleFormError(null)
    
    if (!motorcycleFormData.brand.trim()) {
      setMotorcycleFormError('La marca es obligatoria')
      return
    }
    if (!motorcycleFormData.model.trim()) {
      setMotorcycleFormError('El modelo es obligatorio')
      return
    }

    try {
      const dataToSave = {
        ...motorcycleFormData,
        year: motorcycleFormData.year ? parseInt(motorcycleFormData.year) : null,
        initialMileage: motorcycleFormData.initialMileage ? parseInt(motorcycleFormData.initialMileage) : null,
        currentMileage: motorcycleFormData.currentMileage ? parseInt(motorcycleFormData.currentMileage) : null,
        displacement: motorcycleFormData.displacement ? parseInt(motorcycleFormData.displacement) : null,
        tankCapacity: motorcycleFormData.tankCapacity ? parseFloat(motorcycleFormData.tankCapacity) : null
      }

      if (editingMotorcycle) {
        await editMotorcycle(editingMotorcycle.id, dataToSave)
      } else {
        await saveMotorcycle(dataToSave)
      }
      const data = await getMotorcycles()
      setMotorcycles(data)
      resetMotorcycleForm()
      setShowMotorcycleForm(false)
    } catch (error) {
      console.error('Error saving motorcycle:', error)
      setMotorcycleFormError('Error al guardar. Inténtalo de nuevo.')
    }
  }

  const handleEditMotorcycle = (motorcycle) => {
    setEditingMotorcycle(motorcycle)
    setMotorcycleFormData({
      brand: motorcycle.brand || '',
      model: motorcycle.model || '',
      year: motorcycle.year ? String(motorcycle.year) : '',
      color: motorcycle.color || '',
      plate: motorcycle.plate || '',
      vin: motorcycle.vin || '',
      purchaseDate: motorcycle.purchaseDate || '',
      purchaseOrigin: motorcycle.purchaseOrigin || 'dealer',
      sellerName: motorcycle.sellerName || '',
      initialMileage: motorcycle.initialMileage ? String(motorcycle.initialMileage) : '',
      currentMileage: motorcycle.currentMileage ? String(motorcycle.currentMileage) : '',
      frontTireSize: motorcycle.frontTireSize || '',
      frontTireBrand: motorcycle.frontTireBrand || '',
      rearTireSize: motorcycle.rearTireSize || '',
      rearTireBrand: motorcycle.rearTireBrand || '',
      nextITVDate: motorcycle.nextITVDate || '',
      displacement: motorcycle.displacement ? String(motorcycle.displacement) : '',
      tankCapacity: motorcycle.tankCapacity ? String(motorcycle.tankCapacity) : ''
    })
    setShowMotorcycleForm(true)
    setMotorcycleFormError(null)
  }

  const handleDeleteMotorcycleConfirm = (motorcycle) => {
    setDeleteMotorcycleConfirm(motorcycle)
  }

  const handleDeleteMotorcycle = async () => {
    if (!deleteMotorcycleConfirm) return
    try {
      await removeMotorcycle(deleteMotorcycleConfirm.id)
      const data = await getMotorcycles()
      setMotorcycles(data)
    } catch (error) {
      console.error('Error deleting motorcycle:', error)
    } finally {
      setDeleteMotorcycleConfirm(null)
    }
  }

  const getSpecialtyLabel = (value) => {
    const specialties = {
      'official': 'Concesionario Oficial',
      'multibrand': 'Taller Multimarca',
      'tires-suspension': 'Neumáticos y Suspensiones',
      'electrical': 'Electricidad / Electrónica',
      'owner': 'Automantenimiento'
    }
    return specialties[value] || value
  }

  const getTypeLabel = (type) => type === 'workshop' ? 'Taller / Concesionario' : 'Propietario'
  const getTypeIcon = (type) => type === 'workshop' ? <WrenchIcon size={18} /> : <UserIcon size={18} />

  useEffect(() => {
    const loadSelectedMoto = async () => {
      const saved = await loadSettings('selectedMoto')
      if (saved) setSelectedMoto(saved)
    }
    loadSelectedMoto()
  }, [loadSettings])

  // Load and apply color theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('colorTheme') || 'cfmoto-gold'
    setColorTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  const handleMotoChange = async (motoId) => {
    setSelectedMoto(motoId)
    await saveSetting('selectedMoto', motoId)
  }

  const loadBackupsList = useCallback(async () => {
    if (!fsHasFolder) return
    setLoadingBackups(true)
    try { 
      const backupList = await listBackups()
      setBackups(backupList) 
    } finally { 
      setLoadingBackups(false) 
    }
  }, [fsHasFolder, listBackups])

  useEffect(() => { loadBackupsList() }, [loadBackupsList])

  const handlePickFolder = async () => {
    setFolderError(null)
    const result = await pickFolder()
    if (!result) setFolderError('No se seleccionó ninguna carpeta')
  }

  const handleSync = async () => {
    setSyncing(true)
    const success = await syncToFileSystem()
    if (success) await loadBackupsList()
    setSyncing(false)
  }

  const handleLoadFromFile = async () => { await loadFromFile(); await loadBackupsList() }
  const handleCreateBackup = async () => { const success = await createBackup(); if (success) await loadBackupsList() }
  const handleLoadBackup = async (handle) => { await loadBackup(handle); await loadBackupsList() }
  const handleDownloadDB = () => { downloadDB('MotoAtlas26-backup-' + new Date().toISOString().split('T')[0] + '.json') }

  const motoModels = getMotoModelsArray()
  const selectedMotoModel = getMotoModel(selectedMoto)

  const renderAppearanceTab = () => {
    const selectedTheme = themesList.find(t => t.id === colorTheme) || themesList[0]
    
    const handleThemeChange = async (newThemeId) => {
      setColorTheme(newThemeId)
      await applyThemeToDocument(newThemeId, theme)
    }
    
    const handleModeChange = async (e) => {
      const newMode = e.target.checked ? 'dark' : 'light'
      setTheme(newMode)
      await applyThemeToDocument(colorTheme, newMode)
    }

    if (loadingThemes) {
      return (
        <section className="settings-section">
          <div className="loading-state">
            <RefreshCwIcon size={24} spin />
            <span>Cargando temas...</span>
          </div>
        </section>
      )
    }

    return (
    <section className="settings-section">
      <SectionHeader
        title="Apariencia"
        subtitle="Personaliza la interfaz de la aplicación"
        actions={
          <div className="theme-toggle-header">
            <span className="theme-toggle-label">Modo Oscuro</span>
            <div className="toggle-row">
              <span>Desactivado</span>
              <label className="switch" title="Cambiar entre modo oscuro y claro">
                <input
                  type="checkbox"
                  checked={theme === 'dark'}
                  onChange={handleModeChange}
                />
                <span className="slider" />
              </label>
              <span>Activado</span>
            </div>
          </div>
        }
      />
      <div className="settings-grid">
        <SettingCard
          icon="🏍️"
          title="Modelo de Moto"
          description="Selecciona tu motocicleta para personalizar la información."
        >
          <div className="select-wrapper">
            <select value={selectedMoto} onChange={(e) => handleMotoChange(e.target.value)} className="form-select">
              {motoModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="moto-preview-mini" style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
            <img src={selectedMotoModel.fallbackImage} style={{ maxWidth: '160px' }} alt="Moto" />
          </div>
        </SettingCard>

        <SettingCard
          icon="🎨"
          title="Tema de Colores"
          description="Selecciona la paleta de colores principal de la aplicación (incluye temas personalizados)"
        >
          <div className="theme-selector">
            <select
              className="form-select"
              value={colorTheme}
              onChange={(e) => handleThemeChange(e.target.value)}
            >
              {themesList.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} {t.brand && `(${t.brand})`} {t.id.startsWith('custom-') && '✨'}
                </option>
              ))}
            </select>
            <div className="theme-swatch-palette">
              {selectedTheme && selectedTheme.swatches && selectedTheme.swatches.map((color, i) => (
                <div key={i} className="swatch-color" style={{ backgroundColor: color }} title={`${selectedTheme.name} - Color ${i+1}`} />
              ))}
            </div>
            <div className="theme-card-footer">
              <button className="btn-accept-theme" onClick={() => handleThemeChange(colorTheme)}>
                Aceptar
              </button>
            </div>
          </div>
        </SettingCard>
      </div>
    </section>
  )
}

  const renderListsTab = () => (
    <section className="settings-section">
      <SectionHeader 
        title="Listados" 
        subtitle="Gestiona tus talleres, proveedores y modelos de motos"
        actions={
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <button 
              className="btn-gold" 
              onClick={() => { resetForm(); setShowWorkshopForm(true); }}
            >
              <WrenchIcon size={16} /> Añadir Taller
            </button>
            <button 
              className="btn-gold" 
              onClick={() => { resetMotorcycleForm(); setShowMotorcycleForm(true); }}
            >
              <MotoIcon size={16} /> Añadir Moto
            </button>
          </div>
        }
      />
      <div className="settings-grid">
        {/* Workshops Form Modal */}
        {showWorkshopForm && (
          <Modal 
            isOpen={showWorkshopForm} 
            onClose={() => { setShowWorkshopForm(false); resetForm(); }}
            title={editingWorkshop ? 'Editar Taller / Proveedor' : 'Nuevo Taller / Proveedor'}
            size="lg"
          >
            <form onSubmit={handleSubmit} className="workshop-form">
              {formError && <div className="form-error">{formError}</div>}
              
              <div className="form-group">
                <label className="form-label">Tipo de proveedor <span className="required">*</span></label>
                <div className="segmented-control">
                  {typeOptions.map((option) => (
                    <label key={option.value} className={`segment ${formData.type === option.value ? 'active' : ''}`}>
                      <input
                        type="radio"
                        name="providerType"
                        value={option.value}
                        checked={formData.type === option.value}
                        onChange={() => handleTypeChange(option.value)}
                        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nombre / Etiqueta <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={formData.type === 'owner' ? 'Mantenimiento propio' : 'Ej: Talleres MotoSport, Concesionario KTM Madrid...'}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Especialidad <span className="required">*</span></label>
                <div className="select-wrapper">
                  <select
                    className="form-select"
                    value={formData.specialty}
                    onChange={(e) => setFormData(prev => ({ ...prev, specialty: e.target.value }))}
                    required
                  >
                    <option value="">Selecciona una especialidad</option>
                    <option value="official">Concesionario Oficial</option>
                    <option value="multibrand">Taller Multimarca</option>
                    <option value="tires-suspension">Neumáticos y Suspensiones</option>
                    <option value="electrical">Electricidad / Electrónica</option>
                    <option value="owner">Automantenimiento</option>
                  </select>
                </div>
              </div>

              {formData.type === 'workshop' && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Teléfono / WhatsApp</label>
                      <input
                        type="tel"
                        className="form-input"
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+34 600 000 000"
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label">CIF / NIF</label>
                      <input
                        type="text"
                        className="form-input"
                        value={formData.cif}
                        onChange={(e) => setFormData(prev => ({ ...prev, cif: e.target.value }))}
                        placeholder="B12345678"
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Dirección / Localidad</label>
                    <input
                      type="text"
                      className="form-input"
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="Calle Mayor 123, 28001 Madrid"
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label className="form-label">Notas / Contacto</label>
                <textarea
                  className="form-textarea"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Mecánico de referencia, horarios, observaciones..."
                  rows={3}
                />
              </div>

              <div className="form-group toggle-row">
                <label className="switch">
                  <input
                    type="checkbox"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData(prev => ({ ...prev, isDefault: e.target.checked }))}
                  />
                  <span className="slider" />
                </label>
                <span className="toggle-label">Proveedor habitual por defecto</span>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-outline" onClick={() => { setShowWorkshopForm(false); resetForm(); }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-gold">
                  {editingWorkshop ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Motorcycle Form Modal */}
        {showMotorcycleForm && (
          <Modal 
            isOpen={showMotorcycleForm} 
            onClose={() => { setShowMotorcycleForm(false); resetMotorcycleForm(); }}
            title={editingMotorcycle ? 'Editar Moto' : 'Nueva Moto'}
            size="xl"
          >
            <form onSubmit={handleMotorcycleSubmit} className="motorcycle-form">
              {motorcycleFormError && <div className="form-error">{motorcycleFormError}</div>}
              
              {/* Bloque 1 — Identificación y Compra */}
              <fieldset className="form-fieldset">
                <legend className="form-legend">
                  <MotoIcon size={18} /> Identificación y Compra
                </legend>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label form-label-required">Marca</label>
                    <input
                      type="text"
                      className="form-input"
                      value={motorcycleFormData.brand}
                      onChange={(e) => setMotorcycleFormData(prev => ({ ...prev, brand: e.target.value }))}
                      placeholder="Ej: CFMoto, KTM, Honda"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label form-label-required">Modelo</label>
                    <input
                      type="text"
                      className="form-input"
                      value={motorcycleFormData.model}
                      onChange={(e) => setMotorcycleFormData(prev => ({ ...prev, model: e.target.value }))}
                      placeholder="Ej: 800MT-X, 1290 Super Adventure"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Año de matriculación</label>
                    <input
                      type="number"
                      className="form-input"
                      value={motorcycleFormData.year}
                      onChange={(e) => setMotorcycleFormData(prev => ({ ...prev, year: e.target.value }))}
                      placeholder="2024"
                      min="1900"
                      max={new Date().getFullYear() + 1}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Color</label>
                    <input
                      type="text"
                      className="form-input"
                      value={motorcycleFormData.color}
                      onChange={(e) => setMotorcycleFormData(prev => ({ ...prev, color: e.target.value }))}
                      placeholder="Ej: Negro, Azul, Rojo"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Matrícula</label>
                    <input
                      type="text"
                      className="form-input"
                      value={motorcycleFormData.plate}
                      onChange={(e) => setMotorcycleFormData(prev => ({ ...prev, plate: e.target.value }))}
                      placeholder="Ej: 1234 ABC"
                      style={{ textTransform: 'uppercase' }}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bastidor / VIN</label>
                    <input
                      type="text"
                      className="form-input"
                      value={motorcycleFormData.vin}
                      onChange={(e) => setMotorcycleFormData(prev => ({ ...prev, vin: e.target.value }))}
                      placeholder="Opcional"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Fecha de compra</label>
                    <input
                      type="date"
                      className="form-input"
                      value={motorcycleFormData.purchaseDate}
                      onChange={(e) => setMotorcycleFormData(prev => ({ ...prev, purchaseDate: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Origen de compra <span className="required">*</span></label>
                    <div className="segmented-control">
                      <label className={`segment ${motorcycleFormData.purchaseOrigin === 'dealer' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="purchaseOrigin"
                          value="dealer"
                          checked={motorcycleFormData.purchaseOrigin === 'dealer'}
                          onChange={() => setMotorcycleFormData(prev => ({ ...prev, purchaseOrigin: 'dealer' }))}
                          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                        />
                        <span>Concesionario</span>
                      </label>
                      <label className={`segment ${motorcycleFormData.purchaseOrigin === 'private' ? 'active' : ''}`}>
                        <input
                          type="radio"
                          name="purchaseOrigin"
                          value="private"
                          checked={motorcycleFormData.purchaseOrigin === 'private'}
                          onChange={() => setMotorcycleFormData(prev => ({ ...prev, purchaseOrigin: 'private' }))}
                          style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                        />
                        <span>Segunda mano</span>
                      </label>
                    </div>
                  </div>
                </div>

                {motorcycleFormData.purchaseOrigin && (
                  <div className="form-group">
                    <label className="form-label">Nombre del concesionario / vendedor</label>
                    <input
                      type="text"
                      className="form-input"
                      value={motorcycleFormData.sellerName}
                      onChange={(e) => setMotorcycleFormData(prev => ({ ...prev, sellerName: e.target.value }))}
                      placeholder="Opcional"
                    />
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Kilometraje inicial (km)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={motorcycleFormData.initialMileage}
                      onChange={(e) => setMotorcycleFormData(prev => ({ ...prev, initialMileage: e.target.value }))}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Kilometraje actual (km)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={motorcycleFormData.currentMileage}
                      onChange={(e) => setMotorcycleFormData(prev => ({ ...prev, currentMileage: e.target.value }))}
                      placeholder="0"
                      min="0"
                    />
                  </div>
                </div>
              </fieldset>

              {/* Bloque 2 — Neumáticos */}
              <fieldset className="form-fieldset">
                <legend className="form-legend">
                  <WrenchIcon size={18} /> Neumáticos
                </legend>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Neumático delantero — Medida</label>
                    <input
                      type="text"
                      className="form-input"
                      value={motorcycleFormData.frontTireSize}
                      onChange={(e) => setMotorcycleFormData(prev => ({ ...prev, frontTireSize: e.target.value }))}
                      placeholder="Ej: 90/90-21"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Marca / Modelo</label>
                    <input
                      type="text"
                      className="form-input"
                      value={motorcycleFormData.frontTireBrand}
                      onChange={(e) => setMotorcycleFormData(prev => ({ ...prev, frontTireBrand: e.target.value }))}
                      placeholder="Ej: Michelin Anakee Wild"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Neumático trasero — Medida</label>
                    <input
                      type="text"
                      className="form-input"
                      value={motorcycleFormData.rearTireSize}
                      onChange={(e) => setMotorcycleFormData(prev => ({ ...prev, rearTireSize: e.target.value }))}
                      placeholder="Ej: 150/70-18"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Marca / Modelo</label>
                    <input
                      type="text"
                      className="form-input"
                      value={motorcycleFormData.rearTireBrand}
                      onChange={(e) => setMotorcycleFormData(prev => ({ ...prev, rearTireBrand: e.target.value }))}
                      placeholder="Ej: Michelin Anakee Wild"
                    />
                  </div>
                </div>
              </fieldset>

              {/* Bloque 3 — Especificaciones e ITV (Opcional) */}
              <fieldset className="form-fieldset">
                <legend className="form-legend">
                  <CheckCircleIcon size={18} /> Especificaciones e ITV (Opcional)
                </legend>
                
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Fecha próxima ITV</label>
                    <input
                      type="date"
                      className="form-input"
                      value={motorcycleFormData.nextITVDate}
                      onChange={(e) => setMotorcycleFormData(prev => ({ ...prev, nextITVDate: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Cilindrada (cc)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={motorcycleFormData.displacement}
                      onChange={(e) => setMotorcycleFormData(prev => ({ ...prev, displacement: e.target.value }))}
                      placeholder="Ej: 799"
                      min="0"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Capacidad del depósito (L)</label>
                    <input
                      type="number"
                      className="form-input"
                      value={motorcycleFormData.tankCapacity}
                      onChange={(e) => setMotorcycleFormData(prev => ({ ...prev, tankCapacity: e.target.value }))}
                      placeholder="Ej: 19.5"
                      min="0"
                      step="0.1"
                    />
                  </div>
                </div>
              </fieldset>

              <div className="form-actions">
                <button type="button" className="btn-outline" onClick={() => { setShowMotorcycleForm(false); resetMotorcycleForm(); }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-gold">
                  {editingMotorcycle ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Delete Confirmation Modal - Workshops */}
        {deleteConfirm && (
          <Modal 
            isOpen={!!deleteConfirm} 
            onClose={() => setDeleteConfirm(null)}
            title="Confirmar eliminación"
            size="sm"
          >
            <p>¿Estás seguro de que quieres eliminar <strong>{deleteConfirm.name}</strong>?</p>
            <p className="text-muted">Esta acción no se puede deshacer.</p>
            <div className="form-actions">
              <button className="btn-outline" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button className="btn-danger" onClick={handleDelete}>Eliminar</button>
            </div>
          </Modal>
        )}

        {/* Delete Confirmation Modal - Motorcycles */}
        {deleteMotorcycleConfirm && (
          <Modal 
            isOpen={!!deleteMotorcycleConfirm} 
            onClose={() => setDeleteMotorcycleConfirm(null)}
            title="Confirmar eliminación"
            size="sm"
          >
            <p>¿Estás seguro de que quieres eliminar <strong>{deleteMotorcycleConfirm.brand} {deleteMotorcycleConfirm.model}</strong>?</p>
            <p className="text-muted">Esta acción no se puede deshacer.</p>
            <div className="form-actions">
              <button className="btn-outline" onClick={() => setDeleteMotorcycleConfirm(null)}>Cancelar</button>
              <button className="btn-danger" onClick={handleDeleteMotorcycle}>Eliminar</button>
            </div>
          </Modal>
        )}

        {/* Motorcycles List */}
        <SettingCard
          icon={<MotoIcon size={20} />}
          title="Garaje"
          description="Gestiona tus motos: datos de compra, neumáticos, especificaciones e ITV"
        >
          {loadingMotorcycles ? (
            <div className="loading-state">
              <RefreshCwIcon size={24} spin />
              <span>Cargando motos...</span>
            </div>
          ) : motorcycles.length === 0 ? (
            <EmptyState
              icon={<MotoIcon size={32} />}
              title="Sin motos registradas"
              description="Añade tu primera moto para llevar el control de kilometraje, neumáticos, ITV y especificaciones."
              action={
                <button className="btn-gold" onClick={() => { resetMotorcycleForm(); setShowMotorcycleForm(true); }}>
                  <MotoIcon size={16} /> Añadir primera moto
                </button>
              }
            />
          ) : (
            <div className="motorcycles-list">
              {motorcycles.map((moto) => (
                <div key={moto.id} className="motorcycle-card">
                  <div className="motorcycle-header">
                    <div className="motorcycle-main">
                      <div className="motorcycle-name-row">
                        <span className="motorcycle-brand-model">{moto.brand} {moto.model}</span>
                        {moto.year && <span className="motorcycle-year">{moto.year}</span>}
                        {moto.plate && <span className="motorcycle-plate">{moto.plate}</span>}
                      </div>
                      <div className="motorcycle-meta">
                        {moto.color && <span className="motorcycle-color">🎨 {moto.color}</span>}
                        {(moto.frontTireSize || moto.rearTireSize) && (
                          <span className="motorcycle-tires">
                            🔧 {moto.frontTireSize || '—'} / {moto.rearTireSize || '—'}
                          </span>
                        )}
                        {moto.currentMileage && (
                          <span className="motorcycle-mileage">📍 {moto.currentMileage.toLocaleString()} km</span>
                        )}
                      </div>
                    </div>
                    <div className="motorcycle-actions">
                      <button 
                        className="btn-icon" 
                        onClick={() => handleEditMotorcycle(moto)}
                        title="Editar"
                      >
                        <EditIcon size={18} />
                      </button>
                      <button 
                        className="btn-icon danger" 
                        onClick={() => handleDeleteMotorcycleConfirm(moto)}
                        title="Eliminar"
                      >
                        <TrashIcon size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SettingCard>

        {/* Custom Themes List */}
        <SettingCard
          icon={<PaletteIcon size={20} />}
          title="Temas de Colores Personalizados"
          description="Crea tus propios temas de color con 3 tonos: principal, secundario y terciario"
          actions={
            <button 
              className="btn-gold" 
              onClick={() => { resetCustomThemeForm(); setShowCustomThemeForm(true); }}
            >
              <PlusIcon size={16} /> Añadir Tema
            </button>
          }
        >
          {loadingCustomThemes ? (
            <div className="loading-state">
              <RefreshCwIcon size={24} spin />
              <span>Cargando temas...</span>
            </div>
          ) : customThemes.length === 0 ? (
            <EmptyState
              icon={<PaletteIcon size={32} />}
              title="Sin temas personalizados"
              description="Crea tu primer tema de color personalizado definiendo 3 colores: principal (botones, logo), secundario (alertas, badges) y terciario (detalles)."
              action={
                <button className="btn-gold" onClick={() => { resetCustomThemeForm(); setShowCustomThemeForm(true); }}>
                  <PlusIcon size={16} /> Crear primer tema
                </button>
              }
            />
          ) : (
            <div className="custom-themes-list">
              {customThemes.map((theme) => (
                <div key={theme.id} className="custom-theme-card">
                  <div className="custom-theme-header">
                    <div className="custom-theme-main">
                      <div className="custom-theme-name-row">
                        <span className="custom-theme-name">{theme.name}</span>
                        {theme.brand && (
                          <span className="custom-theme-brand">{theme.brand}</span>
                        )}
                      </div>
                      <div className="custom-theme-swatches">
                        {theme.swatches && theme.swatches.map((color, index) => (
                          <div 
                            key={index} 
                            className="swatch-circle" 
                            style={{ backgroundColor: color }}
                            title={`Color ${index + 1}: ${color}`}
                          >
                            <span className="swatch-number">{index + 1}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="custom-theme-actions">
                      <button 
                        className="btn-icon" 
                        onClick={() => handleEditCustomTheme(theme)}
                        title="Editar"
                      >
                        <EditIcon size={18} />
                      </button>
                      <button 
                        className="btn-icon danger" 
                        onClick={() => handleDeleteCustomThemeConfirm(theme)}
                        title="Eliminar"
                      >
                        <TrashIcon size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SettingCard>

        {/* Custom Theme Form Modal */}
        {showCustomThemeForm && (
          <Modal 
            isOpen={showCustomThemeForm} 
            onClose={() => { setShowCustomThemeForm(false); resetCustomThemeForm(); }}
            title={editingCustomTheme ? 'Editar Tema Personalizado' : 'Nuevo Tema Personalizado'}
            size="lg"
          >
            <form onSubmit={handleCustomThemeSubmit} className="custom-theme-form">
              {customThemeFormError && <div className="form-error">{customThemeFormError}</div>}
              
              <div className="form-group">
                <label className="form-label">Nombre del tema <span className="required">*</span></label>
                <input
                  type="text"
                  className="form-input"
                  value={customThemeFormData.name}
                  onChange={(e) => setCustomThemeFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ej: Ténéré Rally, GS Trophy, Mi Tema"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Marca (opcional)</label>
                <input
                  type="text"
                  className="form-input"
                  value={customThemeFormData.brand}
                  onChange={(e) => setCustomThemeFormData(prev => ({ ...prev, brand: e.target.value }))}
                  placeholder="Ej: Yamaha, BMW, KTM"
                />
              </div>
              
              <fieldset className="form-fieldset">
                <legend>
                  <PaletteIcon size={18} /> Selector de Colores (Orden estricto: 1 → 2 → 3)
                </legend>
                
                <div className="color-picker-grid">
                  {/* Color 1: Primary */}
                  <div className="color-picker-item">
                    <div className="color-picker-label">
                      <span className="color-number">1</span>
                      <span>Color Principal</span>
                      <span className="color-desc">Botones, logo, pestaña activa, interruptores</span>
                    </div>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        className="color-input"
                        value={customThemeFormData.primaryColor}
                        onChange={(e) => setCustomThemeFormData(prev => ({ ...prev, primaryColor: e.target.value }))}
                      />
                      <input
                        type="text"
                        className="color-hex-input"
                        value={customThemeFormData.primaryColor}
                        onChange={(e) => {
                          const val = e.target.value
                          if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                            setCustomThemeFormData(prev => ({ ...prev, primaryColor: val }))
                          }
                        }}
                        placeholder="#RRGGBB"
                        maxLength={7}
                      />
                    </div>
                  </div>
                  
                  {/* Color 2: Secondary */}
                  <div className="color-picker-item">
                    <div className="color-picker-label">
                      <span className="color-number">2</span>
                      <span>Color Secundario</span>
                      <span className="color-desc">Alertas, badges destacados, acentos de ruta</span>
                    </div>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        className="color-input"
                        value={customThemeFormData.secondaryColor}
                        onChange={(e) => setCustomThemeFormData(prev => ({ ...prev, secondaryColor: e.target.value }))}
                      />
                      <input
                        type="text"
                        className="color-hex-input"
                        value={customThemeFormData.secondaryColor}
                        onChange={(e) => {
                          const val = e.target.value
                          if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                            setCustomThemeFormData(prev => ({ ...prev, secondaryColor: val }))
                          }
                        }}
                        placeholder="#RRGGBB"
                        maxLength={7}
                      />
                    </div>
                  </div>
                  
                  {/* Color 3: Tertiary */}
                  <div className="color-picker-item">
                    <div className="color-picker-label">
                      <span className="color-number">3</span>
                      <span>Color Terciario</span>
                      <span className="color-desc">Detalles complementarios y contraste</span>
                    </div>
                    <div className="color-input-wrapper">
                      <input
                        type="color"
                        className="color-input"
                        value={customThemeFormData.tertiaryColor}
                        onChange={(e) => setCustomThemeFormData(prev => ({ ...prev, tertiaryColor: e.target.value }))}
                      />
                      <input
                        type="text"
                        className="color-hex-input"
                        value={customThemeFormData.tertiaryColor}
                        onChange={(e) => {
                          const val = e.target.value
                          if (/^#[0-9A-Fa-f]{6}$/.test(val)) {
                            setCustomThemeFormData(prev => ({ ...prev, tertiaryColor: val }))
                          }
                        }}
                        placeholder="#RRGGBB"
                        maxLength={7}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Live Preview */}
                <div className="color-preview">
                  <span className="preview-label">Vista previa en vivo:</span>
                  <div className="preview-swatches">
                    <div className="preview-swatch">
                      <div 
                        className="preview-circle" 
                        style={{ backgroundColor: customThemeFormData.primaryColor }}
                      >
                        <span className="preview-number">1</span>
                      </div>
                      <span className="preview-hex">{customThemeFormData.primaryColor}</span>
                    </div>
                    <div className="preview-swatch">
                      <div 
                        className="preview-circle" 
                        style={{ backgroundColor: customThemeFormData.secondaryColor }}
                      >
                        <span className="preview-number">2</span>
                      </div>
                      <span className="preview-hex">{customThemeFormData.secondaryColor}</span>
                    </div>
                    <div className="preview-swatch">
                      <div 
                        className="preview-circle" 
                        style={{ backgroundColor: customThemeFormData.tertiaryColor }}
                      >
                        <span className="preview-number">3</span>
                      </div>
                      <span className="preview-hex">{customThemeFormData.tertiaryColor}</span>
                    </div>
                  </div>
                  <div className="preview-button">
                    <button 
                      type="button" 
                      className="btn-gold preview-btn"
                      style={{ 
                        backgroundColor: customThemeFormData.primaryColor,
                        color: (() => {
                          const hex = customThemeFormData.primaryColor.replace('#', '')
                          const r = parseInt(hex.substr(0,2), 16)
                          const g = parseInt(hex.substr(2,2), 16)
                          const b = parseInt(hex.substr(4,2), 16)
                          const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b
                          return lum > 128 ? '#0D0D0F' : '#FFFFFF'
                        })()
                      }}
                    >
                      Botón de muestra (contraste automático)
                    </button>
                  </div>
                </div>
              </fieldset>
              
              <div className="form-actions">
                <button type="button" className="btn-outline" onClick={() => { setShowCustomThemeForm(false); resetCustomThemeForm(); }}>
                  Cancelar
                </button>
                <button type="submit" className="btn-gold">
                  {editingCustomTheme ? 'Actualizar' : 'Guardar'}
                </button>
              </div>
            </form>
          </Modal>
        )}

        {/* Delete Custom Theme Confirmation Modal */}
        {deleteCustomThemeConfirm && (
          <Modal 
            isOpen={!!deleteCustomThemeConfirm} 
            onClose={() => setDeleteCustomThemeConfirm(null)}
            title="Eliminar Tema Personalizado"
            size="sm"
          >
            <div className="confirm-dialog">
              <p>¿Estás seguro de que quieres eliminar <strong>{deleteCustomThemeConfirm.name}</strong>?</p>
              <p className="confirm-warning">Esta acción no se puede deshacer. Si este tema está activo, se volverá al tema por defecto.</p>
              <div className="confirm-actions">
                <button className="btn-outline" onClick={() => setDeleteCustomThemeConfirm(null)}>Cancelar</button>
                <button className="btn-danger" onClick={handleDeleteCustomTheme}>Eliminar</button>
              </div>
            </div>
          </Modal>
        )}

        {/* Workshops List */}
        <SettingCard
          icon="🔧"
          title="Talleres"
          description="Gestiona tus proveedores de mantenimiento habituales"
        >
          {loadingWorkshops ? (
            <div className="loading-state">
              <RefreshCwIcon size={24} spin />
              <span>Cargando talleres...</span>
            </div>
          ) : workshops.length === 0 ? (
            <EmptyState
              icon="🔧"
              title="Sin talleres registrados"
              description="Añade tu primer taller, concesionario o registra tu mantenimiento propio para tener un historial completo."
              action={
                <button className="btn-gold" onClick={() => { resetForm(); setShowWorkshopForm(true); }}>
                  <WrenchIcon size={16} /> Añadir primer taller
                </button>
              }
            />
          ) : (
            <div className="workshops-list">
              {workshops.map((workshop) => (
                <div key={workshop.id} className="workshop-card">
                  <div className="workshop-header">
                    <div className="workshop-main">
                      <div className="workshop-name-row">
                        <span className="workshop-name">{workshop.name}</span>
                        <span className={`workshop-type-badge ${workshop.type}`}>
                          {getTypeIcon(workshop.type)}
                          {getTypeLabel(workshop.type)}
                        </span>
                        {workshop.isDefault && (
                          <span className="workshop-default-badge">
                            <CheckCircleIcon size={12} /> Habitual
                          </span>
                        )}
                      </div>
                      <div className="workshop-meta">
                        <span className="workshop-specialty">{getSpecialtyLabel(workshop.specialty)}</span>
                        {workshop.type === 'workshop' && (
                          <>
                            {workshop.phone && <span className="workshop-phone">{workshop.phone}</span>}
                            {workshop.address && <span className="workshop-address">{workshop.address}</span>}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="workshop-actions">
                      <button 
                        className="btn-icon" 
                        onClick={() => handleEdit(workshop)}
                        title="Editar"
                      >
                        <EditIcon size={18} />
                      </button>
                      <button 
                        className="btn-icon danger" 
                        onClick={() => handleDeleteConfirm(workshop)}
                        title="Eliminar"
                      >
                        <TrashIcon size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SettingCard>
      </div>
    </section>
  )

  const renderMiscTab = () => (
    <section className="settings-section">
      <SectionHeader title="Varios" subtitle="Herramientas de base de datos, backups y sincronización" />
      <div className="settings-grid">
        
        {/* Google Drive Sync Section */}
        <SettingCard
          icon={isConnected ? <CloudIcon size={20} /> : <CloudOffIcon size={20} />}
          title="Sincronización Google Drive"
          description={isConnected 
            ? 'Tus datos se sincronizan automáticamente entre dispositivos.' 
            : 'Conecta tu cuenta de Google para sincronizar tus datos entre dispositivos. Puedes usar MotoAtlas26 en modo local sin cuenta.'}
        >
          {!isConnected ? (
            <div className="space-y-3">
              <div className="p-4 rounded-lg bg-slate-800/40 border border-slate-700/50">
                <div className="flex items-center gap-3 mb-3">
                  <UserCircleIcon size={24} className="text-amber-500" />
                  <div>
                    <div className="font-medium text-slate-100">Modo Local Activo</div>
                    <div className="text-sm text-slate-400">Tus datos se guardan solo en este navegador (IndexedDB)</div>
                  </div>
                </div>
                <p className="text-sm text-slate-300 mb-4">
                  Conecta tu Google Drive para acceder a tus rutas, talleres, motos y temas desde cualquier dispositivo. 
                  Solo MotoAtlas26 puede acceder a sus propios archivos (alcance <code className="text-xs bg-slate-700 px-1 rounded">drive.file</code>.)
                </p>
                <button
                  onClick={connect}
                  disabled={syncStatus === 'syncing'}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-sm flex items-center justify-center gap-2"
                >
                  <SyncIcon size={16} /> Conectar con Google Drive
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/40 border border-slate-700/50">
                {user?.picture && (
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="w-12 h-12 rounded-full border-2 border-amber-500/50"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-slate-100 truncate">{user?.name || user?.email}</div>
                  <div className="text-sm text-slate-400 truncate">{user?.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    syncStatus === 'synced' ? 'bg-emerald-500/20 text-emerald-400' :
                    syncStatus === 'syncing' ? 'bg-amber-500/20 text-amber-400' :
                    syncStatus === 'error' ? 'bg-red-500/20 text-red-400' :
                    'bg-slate-600/50 text-slate-400'
                  }`}>
                    {syncStatus === 'synced' && <CheckCircleIcon size={10} className="inline-block mr-1" />}
                    {syncStatus === 'syncing' && <SyncIcon size={10} className="inline-block mr-1 spin" />}
                    {syncStatus === 'synced' ? 'Sincronizado' :
                     syncStatus === 'syncing' ? 'Sincronizando...' :
                     syncStatus === 'error' ? 'Error' : 'Pendiente'}
                  </span>
                </div>
              </div>

              {/* Last Sync */}
              {lastSync && (
                <div className="text-sm text-slate-400 flex items-center gap-2">
                  <SyncIcon size={14} />
                  <span>Última sincronización: {formatRelativeTime(lastSync)}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={syncNow}
                  disabled={syncStatus === 'syncing'}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-100 font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <SyncIcon size={16} /> {syncStatus === 'syncing' ? 'Sincronizando...' : 'Sincronizar ahora'}
                </button>
                <button
                  onClick={disconnect}
                  className="flex-1 py-2.5 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                >
                  <LogOutIcon size={16} /> Cerrar sesión
                </button>
              </div>

              {authError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                  {authError}
                </div>
              )}
            </div>
          )}
        </SettingCard>

        {/* PWA Install Button */}
        <SettingCard
          icon="📱"
          title="Instalar MotoAtlas26"
          description="Añade MotoAtlas26 a tu pantalla de inicio para acceso rápido y uso offline."
        >
          <InstallAppButton variant="card" />
        </SettingCard>

        {/* Existing Backups Section */}
        <SettingCard
          icon="💾"
          title="Historial de backups"
          description="Gestiona los backups automáticos y manuales de la base de datos."
        >
          <div className="backups-list">
            {loadingBackups ? (
              <RefreshCwIcon size={16} spin />
            ) : backups.length === 0 ? (
              <EmptyState icon="📦" title="Sin backups" description="No hay backups disponibles" />
            ) : (
              <ul>
                {backups.map((b, i) => (
                  <li key={i} className="backup-item">
                    <span>{formatBackupName(b.name)}</span>
                    <button onClick={() => handleLoadBackup(b.handle)} className="btn-tiny">Restaurar</button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </SettingCard>

        {/* Database Section */}
        <SettingCard
          icon="⚙️"
          title="Base de Datos"
          description="Estado de la conexión y herramientas de sincronización local."
        >
          <div className="setting-item">
            <div className="setting-label"><span className="setting-name">Estado</span></div>
            <div className="setting-control">{dbReady ? '✅ Conectada' : '⏳ Cargando...'}</div>
          </div>
          <div className="setting-item">
            <div className="setting-label"><span className="setting-name">Carpeta Sincronizada (File System API)</span></div>
            <div className="setting-control">
              {fsHasFolder ? (
                <div className="folder-info">
                  <span>{getFileSystemInfo().folderName}</span>
                  <button onClick={handleSync} disabled={syncing} className="btn-outline btn-small">
                    {syncing ? <RefreshCwIcon size={14} spin /> : 'Sincronizar'}
                  </button>
                  <button onClick={handleCreateBackup} className="btn-outline btn-small">Backup</button>
                </div>
              ) : (
                <button onClick={handlePickFolder} disabled={!fsSupported} className="btn-gold btn-small">
                  <FolderIcon size={14} /> Seleccionar Carpeta
                </button>
              )}
              {folderError && <span className="error-text">{folderError}</span>}
            </div>
          </div>
          <div className="setting-item">
            <div className="setting-label"><span className="setting-name">Acciones</span></div>
            <div className="setting-control">
              <div className="settings-actions">
                <button onClick={handleDownloadDB} className="btn-outline btn-small">
                  <DownloadIcon size={14} /> Descargar JSON
                </button>
                <button onClick={handleLoadFromFile} className="btn-outline btn-small">
                  <UploadIcon size={14} /> Cargar Archivo
                </button>
                <button onClick={clearTracks} className="danger btn-small">
                  <TrashIcon size={14} /> Limpiar Todo
                </button>
              </div>
            </div>
          </div>
        </SettingCard>
      </div>
    </section>
  )

  // Helper para formatear tiempo relativo
  const formatRelativeTime = (date) => {
    const now = new Date()
    const diff = now - new Date(date)
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'hace un momento'
    if (minutes < 60) return `hace ${minutes} min`
    if (hours < 24) return `hace ${hours} h`
    return `hace ${days} d`
  }

  return (
    <>
      <SectionHeader title="Configuración" subtitle="Personaliza tu experiencia MotoAtlas26" />
      <Tabs tabs={TABS} activeTab={activeTab} onChange={setActiveTab} />
      {activeTab === 'appearance' && renderAppearanceTab()}
      {activeTab === 'lists' && renderListsTab()}
      {activeTab === 'misc' && renderMiscTab()}
    </>
  )
}

export default Settings