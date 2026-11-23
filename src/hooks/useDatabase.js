import { useCallback } from 'react'
import { db } from '../services/db'

/**
 * Hook personalizado para acceder a la base de datos MotoAtlas26
 * Proporciona funciones tipadas para operaciones comunes
 */
export function useDatabase() {
  
  // Tracks
  const saveTrack = useCallback(async (trackData, points = []) => {
    return await db.saveTrack(trackData, points)
  }, [])

  const getTrack = useCallback(async (id) => {
    return await db.getTrack(id)
  }, [])

  const getTrackLazy = useCallback(async (id) => {
    return await db.getTrackWithPoints(id)
  }, [])

  const getAllTracks = useCallback(async () => {
    return await db.getAllTracks()
  }, [])

  const getTracksWithPoints = useCallback(async () => {
    return await db.getTracksWithPoints()
  }, [])

  const deleteTrack = useCallback(async (id) => {
    return await db.deleteTrack(id)
  }, [])

  const updateTrack = useCallback(async (id, updates) => {
    return await db.updateTrack(id, updates)
  }, [])

  // Images
  const saveImage = useCallback(async (imageData) => {
    return await db.saveImage(imageData)
  }, [])

  const getImagesByTrack = useCallback(async (trackId) => {
    return await db.getImagesByTrack(trackId)
  }, [])

  const getImagesByType = useCallback(async (type) => {
    return await db.getImagesByType(type)
  }, [])

  const getImage = useCallback(async (id) => {
    return await db.getImage(id)
  }, [])

  const deleteImage = useCallback(async (id) => {
    return await db.deleteImage(id)
  }, [])

  // Maintenance
  const saveMaintenance = useCallback(async (record) => {
    return await db.saveMaintenance(record)
  }, [])

  const getAllMaintenance = useCallback(async () => {
    return await db.getAllMaintenance()
  }, [])

  const getMaintenanceByMoto = useCallback(async (motoId) => {
    return await db.getMaintenanceByMoto(motoId)
  }, [])

  // Workshops
  const getWorkshops = useCallback(async () => {
    return await db.getAllWorkshops()
  }, [])

  const saveWorkshop = useCallback(async (data) => {
    return await db.addWorkshop(data)
  }, [])

  const editWorkshop = useCallback(async (id, data) => {
    return await db.updateWorkshop(id, data)
  }, [])

  const removeWorkshop = useCallback(async (id) => {
    return await db.deleteWorkshop(id)
  }, [])

  // Motorcycles (Garaje)
  const getMotorcycles = useCallback(async () => {
    return await db.getAllMotorcycles()
  }, [])

  const saveMotorcycle = useCallback(async (data) => {
    return await db.addMotorcycle(data)
  }, [])

  const editMotorcycle = useCallback(async (id, data) => {
    return await db.updateMotorcycle(id, data)
  }, [])

  const removeMotorcycle = useCallback(async (id) => {
    return await db.deleteMotorcycle(id)
  }, [])

  // Moto Profile
  const saveMotoProfile = useCallback(async (profile) => {
    return await db.saveMotoProfile(profile)
  }, [])

  const getMotoProfile = useCallback(async () => {
    return await db.getMotoProfile()
  }, [])

  // Settings
  const setSetting = useCallback(async (key, value) => {
    return await db.setSetting(key, value)
  }, [])

  const getSetting = useCallback(async (key, defaultValue = null) => {
    return await db.getSetting(key, defaultValue)
  }, [])

  const getAllSettings = useCallback(async () => {
    return await db.getAllSettings()
  }, [])

  // Custom Themes
  const getCustomThemes = useCallback(async () => {
    return await db.getAllCustomThemes()
  }, [])

  const saveCustomTheme = useCallback(async (data) => {
    return await db.addCustomTheme(data)
  }, [])

  const editCustomTheme = useCallback(async (id, data) => {
    return await db.updateCustomTheme(id, data)
  }, [])

  const removeCustomTheme = useCallback(async (id) => {
    return await db.deleteCustomTheme(id)
  }, [])

  // Invoices
  const saveInvoice = useCallback(async (invoiceData) => {
    return await db.saveInvoice(invoiceData)
  }, [])

  const getInvoice = useCallback(async (id) => {
    return await db.getInvoice(id)
  }, [])

  const getInvoicesByMoto = useCallback(async (motoId) => {
    return await db.getInvoicesByMoto(motoId)
  }, [])

  const getAllInvoices = useCallback(async () => {
    return await db.getAllInvoices()
  }, [])

  const updateInvoice = useCallback(async (id, updates) => {
    return await db.updateInvoice(id, updates)
  }, [])

  const deleteInvoice = useCallback(async (id) => {
    return await db.deleteInvoice(id)
  }, [])

  // Maintenances (new table)
  const saveMaintenanceRecord = useCallback(async (maintenanceData) => {
    return await db.saveMaintenanceRecord(maintenanceData)
  }, [])

  const getMaintenanceRecord = useCallback(async (id) => {
    return await db.getMaintenanceRecord(id)
  }, [])

  const getMaintenancesByMoto = useCallback(async (motoId) => {
    return await db.getMaintenancesByMoto(motoId)
  }, [])

  const getAllMaintenances = useCallback(async () => {
    return await db.getAllMaintenances()
  }, [])

  const updateMaintenanceRecord = useCallback(async (id, updates) => {
    return await db.updateMaintenanceRecord(id, updates)
  }, [])

  const deleteMaintenanceRecord = useCallback(async (id) => {
    return await db.deleteMaintenanceRecord(id)
  }, [])

  // Utilities
  const clearAllData = useCallback(async () => {
    return await db.clearAllData()
  }, [])

  const getDatabaseSize = useCallback(async () => {
    return await db.getDatabaseSize()
  }, [])

  const exportAll = useCallback(async () => {
    return await db.exportAll()
  }, [])

  const importAll = useCallback(async (data) => {
    return await db.importAll(data)
  }, [])

  return {
    // Tracks
    saveTrack,
    getTrack,
    getAllTracks,
    getTrackLazy,
    getTracksWithPoints,
    deleteTrack,
    updateTrack,
    // Images
    saveImage,
    getImagesByTrack,
    getImagesByType,
    getImage,
    deleteImage,
    // Maintenance (legacy)
    saveMaintenance,
    getAllMaintenance,
    getMaintenanceByMoto,
    // Workshops
    getWorkshops,
    saveWorkshop,
    editWorkshop,
    removeWorkshop,
    // Motorcycles (Garaje)
    getMotorcycles,
    saveMotorcycle,
    editMotorcycle,
    removeMotorcycle,
    // Moto Profile
    saveMotoProfile,
    getMotoProfile,
    // Settings
    setSetting,
    getSetting,
    getAllSettings,
    // Custom Themes
    getCustomThemes,
    saveCustomTheme,
    editCustomTheme,
    removeCustomTheme,
    // Invoices
    saveInvoice,
    getInvoice,
    getInvoicesByMoto,
    getAllInvoices,
    updateInvoice,
    deleteInvoice,
    // Maintenances (new table)
    saveMaintenanceRecord,
    getMaintenanceRecord,
    getMaintenancesByMoto,
    getAllMaintenances,
    updateMaintenanceRecord,
    deleteMaintenanceRecord,
    // Utilities
    clearAllData,
    getDatabaseSize,
    exportAll,
    importAll,
  }
}

export default useDatabase