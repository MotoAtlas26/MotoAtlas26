import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useGPX } from '../../context/GPXContext'
import { useDatabase } from '../../hooks/useDatabase'
import { useAuth } from '../../context/AuthContext'
import { EmptyState, SectionHeader, SettingCard, Tabs, Modal, InstallAppButton, ThemeSelect } from '../shared'
import CatalogDetailView from './CatalogDetailView'
import { formatBackupName } from '../../utils/formatters'
import { getMotoModelsArray, getMotoModel } from '../../constants/motoModels'
import { getThemesList, THEMES } from '../../constants/themes'
import { applyThemeToDocument, validateActiveTheme, refreshActiveCustomTheme, getSavedTheme } from '../../utils/themeEngine'
import { TrashIcon, DownloadIcon, UploadIcon, FolderIcon, RefreshCwIcon, EditIcon, WrenchIcon, UserIcon, CheckCircleIcon, MotoIcon, PaletteIcon, PlusIcon, CloudIcon, CloudOffIcon, SyncIcon, LogOutIcon, UserCircleIcon, ChevronLeftIcon, CircleIcon, ShieldIcon, ChevronRightIcon } from '../shared/Icons'

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
  const [activeCatalog, setActiveCatalog] = useState(null)
  // Initialize theme from localStorage (synced with initTheme in main.jsx)
  const savedTheme = getSavedTheme()
  const [colorTheme, setColorTheme] = useState(savedTheme.themeId)
  const [selectedThemeId, setSelectedThemeId] = useState(savedTheme.themeId)
  const [appliedThemeId, setAppliedThemeId] = useState(savedTheme.themeId)
  
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
  const { getWorkshops, saveWorkshop, editWorkshop, removeWorkshop, getMotorcycles, saveMotorcycle, editMotorcycle, removeMotorcycle, getCustomThemes, saveCustomTheme, editCustomTheme, removeCustomTheme, getAllTires, saveTire, updateTire, deleteTire, getAllDocumentTypes, saveDocumentType, updateDocumentType, deleteDocumentType } = useDatabase()
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

  // Tires state
  const [tires, setTires] = useState([])
  const [loadingTires, setLoadingTires] = useState(true)
  const [showTireForm, setShowTireForm] = useState(false)
  const [editingTire, setEditingTire] = useState(null)
  const [tireFormData, setTireFormData] = useState({
    brand: '',
    model: '',
    frontSize: '',
    rearSize: '',
    recommendedFrontBar: '',
    recommendedRearBar: '',
    notes: ''
  })
  const [deleteTireConfirm, setDeleteTireConfirm] = useState(null)
  const [tireFormError, setTireFormError] = useState(null)

  // Document Types state
  const [documentTypes, setDocumentTypes] = useState([])
  const [loadingDocumentTypes, setLoadingDocumentTypes] = useState(true)
  const [showDocumentTypeForm, setShowDocumentTypeForm] = useState(false)
  const [editingDocumentType, setEditingDocumentType] = useState(null)
  const [documentTypeFormData, setDocumentTypeFormData] = useState({
    name: '',
    controlType: 'none',
    hasExpiration: false,
    isInsurance: false
  })
  const [deleteDocumentTypeConfirm, setDeleteDocumentTypeConfirm] = useState(null)
  const [documentTypeFormError, setDocumentTypeFormError] = useState(null)

  // Available themes state (predefined + custom)
  const [availableThemes, setAvailableThemes] = useState([])
  const [loadingThemes, setLoadingThemes] = useState(true)
  
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

  // Load tires on mount
  useEffect(() => {
    const loadTires = async () => {
      try {
        const data = await getAllTires()
        setTires(data)
      } catch (error) {
        console.error('Error loading tires:', error)
      } finally {
        setLoadingTires(false)
      }
    }
    loadTires()
  }, [getAllTires])

  // Load document types on mount
  useEffect(() => {
    const loadDocumentTypes = async () => {
      try {
        const data = await getAllDocumentTypes()
        setDocumentTypes(data)
      } catch (error) {
        console.error('Error loading document types:', error)
      } finally {
        setLoadingDocumentTypes(false)
      }
    }
    loadDocumentTypes()
  }, [getAllDocumentTypes])

  const loadAvailableThemes = useCallback(async () => {
    try {
      const customThemesData = await getCustomThemes()
      const custom = customThemesData.map(t => ({
        id: `custom-${t.id}`,
        name: t.name,
        brand: t.brand || 'Personalizado',
        swatches: t.swatches || [t.primaryColor, t.secondaryColor, t.tertiaryColor]
      }))
      setAvailableThemes([...THEMES, ...custom])
    } catch (error) {
      console.error('Error loading available themes:', error)
      setAvailableThemes(THEMES)
    } finally {
      setLoadingThemes(false)
    }
  }, [getCustomThemes])

  useEffect(() => {
    loadAvailableThemes()
  }, [loadAvailableThemes])

  // Validate selectedThemeId against availableThemes after they load
  useEffect(() => {
    if (availableThemes.length > 0) {
      const themeExists = availableThemes.some(t => t.id === selectedThemeId)
      if (!themeExists) {
        // Fallback to motoatlas26 if saved theme doesn't exist
        setSelectedThemeId('motoatlas26')
        setColorTheme('motoatlas26')
        setAppliedThemeId('motoatlas26')
        applyThemeToDocument('motoatlas26', theme)
      } else {
        // Sync appliedThemeId with the valid selectedThemeId on initial load
        setAppliedThemeId(selectedThemeId)
      }
    }
  }, [availableThemes, theme]) // Only run on mount/theme change, NOT on selectedThemeId change

  // Reload available themes when switching to Appearance tab
  useEffect(() => {
    if (activeTab === 'appearance') {
      loadAvailableThemes()
    }
  }, [activeTab, loadAvailableThemes])

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

  // Tire form handlers
  const resetTireForm = () => {
    setTireFormData({
      brand: '',
      model: '',
      frontSize: '',
      rearSize: '',
      recommendedFrontBar: '',
      recommendedRearBar: '',
      notes: ''
    })
    setEditingTire(null)
    setTireFormError(null)
  }

  const handleTireSubmit = async (e) => {
    e.preventDefault()
    setTireFormError(null)
    
    if (!tireFormData.brand.trim()) {
      setTireFormError('La marca es obligatoria')
      return
    }
    if (!tireFormData.model.trim()) {
      setTireFormError('El modelo es obligatorio')
      return
    }
    if (!tireFormData.frontSize.trim()) {
      setTireFormError('La medida delantera es obligatoria')
      return
    }
    if (!tireFormData.rearSize.trim()) {
      setTireFormError('La medida trasera es obligatoria')
      return
    }

    try {
      if (editingTire) {
        await updateTire(editingTire.id, tireFormData)
      } else {
        await saveTire(tireFormData)
      }
      const data = await getAllTires()
      setTires(data)
      resetTireForm()
      setShowTireForm(false)
    } catch (error) {
      console.error('Error saving tire:', error)
      setTireFormError('Error al guardar. Inténtalo de nuevo.')
    }
  }

  const handleTireEdit = (tire) => {
    setEditingTire(tire)
    setTireFormData({
      brand: tire.brand,
      model: tire.model,
      frontSize: tire.frontSize,
      rearSize: tire.rearSize,
      recommendedFrontBar: tire.recommendedFrontBar || '',
      recommendedRearBar: tire.recommendedRearBar || '',
      notes: tire.notes || ''
    })
    setShowTireForm(true)
    setTireFormError(null)
  }

  const handleTireDeleteConfirm = (tire) => {
    setDeleteTireConfirm(tire)
  }

  const handleTireDelete = async () => {
    if (!deleteTireConfirm) return
    try {
      await deleteTire(deleteTireConfirm.id)
      const data = await getAllTires()
      setTires(data)
    } catch (error) {
      console.error('Error deleting tire:', error)
    } finally {
      setDeleteTireConfirm(null)
    }
  }

  // Document Type form handlers
  const resetDocumentTypeForm = () => {
    setDocumentTypeFormData({
      name: '',
      controlType: 'none',
      hasExpiration: false,
      isInsurance: false
    })
    setEditingDocumentType(null)
    setDocumentTypeFormError(null)
  }

  const handleDocumentTypeSubmit = async (e) => {
    e.preventDefault()
    setDocumentTypeFormError(null)
    
    if (!documentTypeFormData.name.trim()) {
      setDocumentTypeFormError('El nombre es obligatorio')
      return
    }

    try {
      if (editingDocumentType) {
        await updateDocumentType(editingDocumentType.id, documentTypeFormData)
      } else {
        // Generate a slug-like code for new custom types
        const code = documentTypeFormData.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '')
          + '-' + Date.now()
        await saveDocumentType({ ...documentTypeFormData, code })
      }
      const data = await getAllDocumentTypes()
      setDocumentTypes(data)
      resetDocumentTypeForm()
      setShowDocumentTypeForm(false)
    } catch (error) {
      console.error('Error saving document type:', error)
      setDocumentTypeFormError('Error al guardar. Inténtalo de nuevo.')
    }
  }

  const handleDocumentTypeEdit = (docType) => {
    setEditingDocumentType(docType)
    let controlType = 'none';
    if (docType.isInsurance) controlType = 'insurance';
    else if (docType.hasExpiration) controlType = 'expiration';
    setDocumentTypeFormData({
      name: docType.name,
      controlType,
      hasExpiration: docType.hasExpiration,
      isInsurance: docType.isInsurance
    })
    setDocumentTypeFormError(null)
  }

  const handleDocumentTypeDeleteConfirm = (docType) => {
    setDeleteDocumentTypeConfirm(docType)
  }

  const handleDocumentTypeDelete = async () => {
    if (!deleteDocumentTypeConfirm) return
    try {
      await deleteDocumentType(deleteDocumentTypeConfirm.id)
      const data = await getAllDocumentTypes()
      setDocumentTypes(data)
    } catch (error) {
      console.error('Error deleting document type:', error)
    } finally {
      setDeleteDocumentTypeConfirm(null)
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
      // Reload available themes for appearance tab
      await loadAvailableThemes()
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
      // Reload available themes for appearance tab
      await loadAvailableThemes()
      
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
    const savedTheme = localStorage.getItem('colorTheme') || 'motoatlas26'
    setColorTheme(savedTheme)
    setSelectedThemeId(savedTheme)
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
    const selectedTheme = availableThemes.find(t => t.id === selectedThemeId) || availableThemes[0]
    
    // Group 1: Original - only MotoAtlas26
    const originalTheme = availableThemes.find(t => t.group === 'original')
    
    // Group 2: Personalizados - custom themes from Dexie, alphabetical by name
    const customThemesList = availableThemes
      .filter(t => t.group === 'personalizados')
      .sort((a, b) => a.name.localeCompare(b.name))
    
    // Group 3: Marcas - 13 official brands, alphabetical A-Z
    const brandThemes = availableThemes
      .filter(t => t.group === 'marcas')
      .sort((a, b) => a.name.localeCompare(b.name))
    
    const handleThemeChange = (newThemeId) => {
      setSelectedThemeId(newThemeId)
    }
    
    const handleAcceptTheme = async () => {
      setColorTheme(selectedThemeId)
      setAppliedThemeId(selectedThemeId)
      await applyThemeToDocument(selectedThemeId, theme)
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
      />
      
      {/* Dark Mode Card */}
      <div className="settings-mode-card">
        <div className="settings-mode-info">
          <h3 className="settings-mode-title">Modo de Interfaz</h3>
          <p className="settings-mode-description">Alterna entre tema oscuro y claro</p>
        </div>
        <div className="settings-mode-toggle">
          <span className="settings-mode-label">Desactivado</span>
          <label className="switch" title="Cambiar entre modo oscuro y claro">
            <input
              type="checkbox"
              checked={theme === 'dark'}
              onChange={handleModeChange}
            />
            <span className="slider" />
          </label>
          <span className="settings-mode-label">Activado</span>
        </div>
      </div>
      
      <div className="settings-grid">
        <SettingCard
          icon="🏍️"
          title="Modelo de Moto"
          description="Selecciona tu motocicleta para personalizar la información."
          className="appearance-card"
        >
          <div className="appearance-card-selector">
            <select value={selectedMoto} onChange={(e) => handleMotoChange(e.target.value)} className="form-select">
              {motoModels.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>
          <div className="appearance-card-preview moto-preview">
            <img src={selectedMotoModel.fallbackImage} alt="Moto" />
          </div>
        </SettingCard>

        <SettingCard
          icon="🎨"
          title="Tema de Colores"
          description="Selecciona la paleta de colores principal de la aplicación (incluye temas personalizados)"
          className="appearance-card"
        >
          <div className="appearance-card-selector">
            <ThemeSelect
              options={[
                { label: 'Original', options: originalTheme ? [{ value: originalTheme.id, label: originalTheme.name, swatches: originalTheme.swatches }] : [] },
                { label: 'Personalizados', options: customThemesList.map(t => ({ value: t.id, label: t.name, swatches: t.swatches })) },
                { label: 'Marcas', options: brandThemes.map(t => ({ value: t.id, label: t.name, swatches: t.swatches })) }
              ]}
              value={selectedThemeId}
              onChange={handleThemeChange}
            />
          </div>
          <div className="appearance-card-preview theme-preview">
            <div className="theme-swatch-row">
              <div className="theme-swatch-item">
                <span className="theme-swatch-label">Principal</span>
                <span className="theme-swatch-color" style={{ backgroundColor: selectedTheme.swatches?.[0] || '#D2B474' }} />
                <span className="theme-swatch-hex">{selectedTheme.swatches?.[0] || '#D2B474'}</span>
              </div>
              <div className="theme-swatch-item">
                <span className="theme-swatch-label">Secundario</span>
                <span className="theme-swatch-color" style={{ backgroundColor: selectedTheme.swatches?.[1] || '#0D0D0F' }} />
                <span className="theme-swatch-hex">{selectedTheme.swatches?.[1] || '#0D0D0F'}</span>
              </div>
              <div className="theme-swatch-item">
                <span className="theme-swatch-label">Terciario</span>
                <span className="theme-swatch-color" style={{ backgroundColor: selectedTheme.swatches?.[2] || '#D96B27' }} />
                <span className="theme-swatch-hex">{selectedTheme.swatches?.[2] || '#D96B27'}</span>
              </div>
            </div>
            <div className="theme-card-footer">
              <button className="btn btn-accept-theme" onClick={handleAcceptTheme}>
                Aceptar
              </button>
            </div>
          </div>
        </SettingCard>
      </div>
    </section>
  )
}

  const renderListsTab = () => {
    // Si hay un catálogo seleccionado, renderizar solo la vista de detalle
    if (activeCatalog !== null) {
      const dbProps = {
        getWorkshops, saveWorkshop, editWorkshop, removeWorkshop,
        getMotorcycles, saveMotorcycle, editMotorcycle, removeMotorcycle,
        getCustomThemes, saveCustomTheme, editCustomTheme, removeCustomTheme,
        getAllTires, saveTire, updateTire, deleteTire,
        getAllDocumentTypes, saveDocumentType, updateDocumentType, deleteDocumentType
      }
      return (
        <CatalogDetailView 
          catalogKey={activeCatalog} 
          onBack={() => setActiveCatalog(null)} 
          dbProps={dbProps}
        />
      )
    }

    // Vista principal de Listados: 5 tarjetas limpias en grid
    return (
      <section className="settings-section">
        <SectionHeader 
          title="Listados" 
          subtitle="Gestiona tus catálogos: motos, talleres, neumáticos, tipos de documento y temas"
        />

        <div className="settings-grid">
          {/* 1. Garaje / Motos */}
          <SettingCard
            icon={<MotoIcon size={24} />}
            title="Garaje"
            description="Registra tus motos para llevar el control de kilometraje y mantenimiento."
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {motorcycles.length} moto{motorcycles.length !== 1 ? 's' : ''} registrada{motorcycles.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button 
              className="btn btn-primary w-full" 
              onClick={() => setActiveCatalog('garaje')}
            >
              Abrir listado <ChevronRightIcon size={16} />
            </button>
          </SettingCard>

          {/* 2. Talleres */}
          <SettingCard
            icon={<WrenchIcon size={24} />}
            title="Talleres"
            description="Gestiona tus talleres de confianza para mantenimiento y reparaciones."
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {workshops.length} taller{workshops.length !== 1 ? 'es' : ''} registrado{workshops.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button 
              className="btn btn-primary w-full" 
              onClick={() => setActiveCatalog('talleres')}
            >
              Abrir listado <ChevronRightIcon size={16} />
            </button>
          </SettingCard>

          {/* 3. Neumáticos */}
          <SettingCard
            icon={<CircleIcon size={24} />}
            title="Neumáticos"
            description="Catálogo de neumáticos con medidas y presiones recomendadas."
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {tires.length} neumático{tires.length !== 1 ? 's' : ''} registrado{tires.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button 
              className="btn btn-primary w-full" 
              onClick={() => setActiveCatalog('neumaticos')}
            >
              Abrir listado <ChevronRightIcon size={16} />
            </button>
          </SettingCard>

          {/* 4. Tipos de Documento */}
          <SettingCard
            icon={<ShieldIcon size={24} />}
            title="Tipos de Documento"
            description="Define tipos de documentos para facturas, seguros, ITV y más."
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {documentTypes.length} tipo{documentTypes.length !== 1 ? 's' : ''} registrado{documentTypes.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button 
              className="btn btn-primary w-full" 
              onClick={() => setActiveCatalog('documentTypes')}
            >
              Abrir listado <ChevronRightIcon size={16} />
            </button>
          </SettingCard>

          {/* 5. Temas Personalizados */}
          <SettingCard
            icon={<PaletteIcon size={24} />}
            title="Temas Personalizados"
            description="Crea tus propios temas de color para la aplicación."
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {customThemes.length} tema{customThemes.length !== 1 ? 's' : ''} personalizado{customThemes.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button 
              className="btn btn-primary w-full" 
              onClick={() => setActiveCatalog('customThemes')}
            >
              Abrir listado <ChevronRightIcon size={16} />
            </button>
          </SettingCard>
        </div>
      </section>
    )
  }

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
              <div className="p-4 rounded-lg" style={{ background: 'var(--color-card)', border: 'var(--border-width) solid var(--color-card-border)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <UserCircleIcon size={24} style={{ color: 'var(--color-tertiary)' }} />
                  <div>
                    <div className="font-medium" style={{ color: 'var(--color-text-primary)' }}>Modo Local Activo</div>
                    <div className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>Tus datos se guardan solo en este navegador (IndexedDB)</div>
                  </div>
                </div>
                <p className="text-sm mb-4" style={{ color: 'var(--color-text-secondary)' }}>
                  Conecta tu Google Drive para acceder a tus rutas, talleres, motos y temas desde cualquier dispositivo. 
                  Solo MotoAtlas26 puede acceder a sus propios archivos (alcance <code style={{ fontSize: 'var(--font-size-xs)', background: 'var(--color-card-hover)', padding: '0.125rem 0.25rem', borderRadius: 'var(--radius-sm)' }}>drive.file</code>.)
                </p>
                <button
                  onClick={connect}
                  disabled={syncStatus === 'syncing'}
                  className="w-full py-2.5 font-bold rounded-lg text-sm flex items-center justify-center gap-2"
                  style={{ 
                    background: 'var(--color-tertiary)',
                    color: 'var(--color-tertiary-contrast)',
                    border: 'var(--border-width) solid var(--color-tertiary-border)'
                  }}
                >
                  <SyncIcon size={16} /> Conectar con Google Drive
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 rounded-lg" style={{ background: 'var(--color-card)', border: 'var(--border-width) solid var(--color-card-border)' }}>
                {user?.picture && (
                  <img 
                    src={user.picture} 
                    alt={user.name} 
                    className="w-12 h-12 rounded-full border-2"
                    style={{ borderColor: 'var(--color-tertiary-border)' }}
                  />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>{user?.name || user?.email}</div>
                  <div className="text-sm truncate" style={{ color: 'var(--color-text-secondary)' }}>{user?.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded-full text-xs font-medium" style={{
                    background: syncStatus === 'synced' ? 'var(--color-success-bg)' :
                              syncStatus === 'syncing' ? 'var(--color-alert-bg)' :
                              syncStatus === 'error' ? 'var(--color-error-bg)' :
                              'var(--color-card-hover)',
                    color: syncStatus === 'synced' ? 'var(--color-success-border)' :
                           syncStatus === 'syncing' ? 'var(--color-alert-border)' :
                           syncStatus === 'error' ? 'var(--color-error-border)' :
                           'var(--color-text-muted)',
                    border: 'var(--border-width) solid',
                    borderColor: syncStatus === 'synced' ? 'var(--color-success-border)' :
                                 syncStatus === 'syncing' ? 'var(--color-alert-border)' :
                                 syncStatus === 'error' ? 'var(--color-error-border)' :
                                 'var(--color-card-border)'
                  }}>
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
                <div className="text-sm flex items-center gap-2" style={{ color: 'var(--color-text-secondary)' }}>
                  <SyncIcon size={14} />
                  <span>Última sincronización: {formatRelativeTime(lastSync)}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={syncNow}
                  disabled={syncStatus === 'syncing'}
                  className="flex-1 py-2.5 font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                  style={{ 
                    background: 'var(--color-card)',
                    color: 'var(--color-text-primary)',
                    border: 'var(--border-width) solid var(--color-card-border)'
                  }}
                >
                  <SyncIcon size={16} /> {syncStatus === 'syncing' ? 'Sincronizando...' : 'Sincronizar ahora'}
                </button>
                <button
                  onClick={disconnect}
                  className="flex-1 py-2.5 font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                  style={{ 
                    background: 'var(--color-error-bg)',
                    color: 'var(--color-error-border)',
                    border: 'var(--border-width) solid var(--color-error-border)'
                  }}
                >
                  <LogOutIcon size={16} /> Cerrar sesión
                </button>
              </div>

              {authError && (
                <div className="p-3 rounded-lg text-sm" style={{ 
                  background: 'var(--color-error-bg)',
                  border: 'var(--border-width) solid var(--color-error-border)',
                  color: 'var(--color-error-border)'
                }}>
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