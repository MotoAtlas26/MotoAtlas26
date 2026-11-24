import Dexie from 'dexie'

export class MotoAtlas26DB extends Dexie {
  constructor() {
    super('MotoAtlas26DB')
    
    this.version(4).stores({
      tracks: '++id, name, date, distance, elevationGain, duration, createdAt, updatedAt',
      trackPoints: '++id, trackId, lat, lng, elevation, timestamp, sequence',
      images: '++id, type, trackId, motoId, fileName, mimeType, size, blob, description, tags, aspectRatio, colorTheme, createdAt',
      maintenance: '++id, motoId, type, date, mileage, cost, workshop, description, createdAt',
      motoProfile: '++id, model, year, vin, purchaseDate, currentMileage, updatedAt',
      settings: '++id, key, value, updatedAt',
      uploads: '++id, type, fileName, size, status, localPath, remoteUrl, createdAt',
      workshops: '++id, type, name, specialty, isDefault, createdAt',
      motorcycles: '++id, brand, model, year, plate, purchaseDate, createdAt'
    })

    // Version 5: Add customThemes table for user-defined color themes
    this.version(5).stores({
      tracks: '++id, name, date, distance, elevationGain, duration, createdAt, updatedAt',
      trackPoints: '++id, trackId, lat, lng, elevation, timestamp, sequence',
      images: '++id, type, trackId, motoId, fileName, mimeType, size, blob, description, tags, aspectRatio, colorTheme, createdAt',
      maintenance: '++id, motoId, type, date, mileage, cost, workshop, description, createdAt',
      motoProfile: '++id, model, year, vin, purchaseDate, currentMileage, updatedAt',
      settings: '++id, key, value, updatedAt',
      uploads: '++id, type, fileName, size, status, localPath, remoteUrl, createdAt',
      workshops: '++id, type, name, specialty, isDefault, createdAt',
      motorcycles: '++id, brand, model, year, plate, purchaseDate, createdAt',
      customThemes: '++id, name, brand, createdAt'
    })

    // Version 6: Add invoices and maintenances tables for Moto module
    this.version(6).stores({
      tracks: '++id, name, date, distance, elevationGain, duration, createdAt, updatedAt',
      trackPoints: '++id, trackId, lat, lng, elevation, timestamp, sequence',
      images: '++id, type, trackId, motoId, fileName, mimeType, size, blob, description, tags, aspectRatio, colorTheme, createdAt',
      maintenance: '++id, motoId, type, date, mileage, cost, workshop, description, createdAt',
      motoProfile: '++id, model, year, vin, purchaseDate, currentMileage, updatedAt',
      settings: '++id, key, value, updatedAt',
      uploads: '++id, type, fileName, size, status, localPath, remoteUrl, createdAt',
      workshops: '++id, type, name, specialty, isDefault, createdAt',
      motorcycles: '++id, brand, model, year, plate, purchaseDate, createdAt',
      customThemes: '++id, name, brand, createdAt',
      invoices: '++id, motoId, workshopId, date, odometerKm, invoiceNumber, totalAmount, items, notes, fileName, fileMimeType, fileDataUrl, createdAt',
      maintenances: '++id, motoId, workshopId, date, odometerKm, type, title, cost, details, suspensionSetup, createdAt'
    })

    // Version 7: Add motoDocuments table for Guantera Digital
    this.version(7).stores({
      tracks: '++id, name, date, distance, elevationGain, duration, createdAt, updatedAt',
      trackPoints: '++id, trackId, lat, lng, elevation, timestamp, sequence',
      images: '++id, type, trackId, motoId, fileName, mimeType, size, blob, description, tags, aspectRatio, colorTheme, createdAt',
      maintenance: '++id, motoId, type, date, mileage, cost, workshop, description, createdAt',
      motoProfile: '++id, model, year, vin, purchaseDate, currentMileage, updatedAt',
      settings: '++id, key, value, updatedAt',
      uploads: '++id, type, fileName, size, status, localPath, remoteUrl, createdAt',
      workshops: '++id, type, name, specialty, isDefault, createdAt',
      motorcycles: '++id, brand, model, year, plate, purchaseDate, createdAt',
      customThemes: '++id, name, brand, createdAt',
      invoices: '++id, motoId, workshopId, date, odometerKm, invoiceNumber, totalAmount, items, notes, fileName, fileMimeType, fileDataUrl, createdAt',
      maintenances: '++id, motoId, workshopId, date, odometerKm, type, title, cost, details, suspensionSetup, createdAt',
      motoDocuments: '++id, motoId, docType, title, expirationDate, policyNumber, assistancePhone, insurerName, notes, fileName, fileMimeType, fileDataUrl, createdAt'
    })

    // Version 8: Add tires table for tire catalog
    this.version(8).stores({
      tracks: '++id, name, date, distance, elevationGain, duration, createdAt, updatedAt',
      trackPoints: '++id, trackId, lat, lng, elevation, timestamp, sequence',
      images: '++id, type, trackId, motoId, fileName, mimeType, size, blob, description, tags, aspectRatio, colorTheme, createdAt',
      maintenance: '++id, motoId, type, date, mileage, cost, workshop, description, createdAt',
      motoProfile: '++id, model, year, vin, purchaseDate, currentMileage, updatedAt',
      settings: '++id, key, value, updatedAt',
      uploads: '++id, type, fileName, size, status, localPath, remoteUrl, createdAt',
      workshops: '++id, type, name, specialty, isDefault, createdAt',
      motorcycles: '++id, brand, model, year, plate, purchaseDate, createdAt',
      customThemes: '++id, name, brand, createdAt',
      invoices: '++id, motoId, workshopId, date, odometerKm, invoiceNumber, totalAmount, items, notes, fileName, fileMimeType, fileDataUrl, createdAt',
      maintenances: '++id, motoId, workshopId, date, odometerKm, type, title, cost, details, suspensionSetup, createdAt',
      motoDocuments: '++id, motoId, docType, title, expirationDate, policyNumber, assistancePhone, insurerName, notes, fileName, fileMimeType, fileDataUrl, createdAt',
      tires: '++id, brand, model, frontSize, rearSize, recommendedFrontBar, recommendedRearBar, notes, createdAt'
    })
    
    this.tracks.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date()
      obj.updatedAt = new Date()
    })
    this.tracks.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.updatedAt = new Date()
    })
    this.invoices.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date()
    })
    this.invoices.hook('updating', (primKey, obj, trans) => {
      obj.updatedAt = new Date()
    })
    this.maintenances.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date()
    })
    this.maintenances.hook('updating', (primKey, obj, trans) => {
      obj.updatedAt = new Date()
    })
    this.images.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date()
    })
    this.maintenance.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date()
    })
    this.settings.hook('creating', (primKey, obj, trans) => {
      obj.updatedAt = new Date()
    })
    this.settings.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.updatedAt = new Date()
    })
    this.invoices.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date()
    })
    this.maintenances.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date()
    })
    this.motoDocuments.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date()
      window.dispatchEvent(new CustomEvent('db:changed'))
    })
    this.motoDocuments.hook('updating', (modifications, primKey, obj, trans) => {
      window.dispatchEvent(new CustomEvent('db:changed'))
    })
    this.motoDocuments.hook('deleting', (primKey, obj, trans) => {
      window.dispatchEvent(new CustomEvent('db:changed'))
    })
    this.tires.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date()
      window.dispatchEvent(new CustomEvent('db:changed'))
    })
    this.tires.hook('updating', (modifications, primKey, obj, trans) => {
      window.dispatchEvent(new CustomEvent('db:changed'))
    })
    this.tires.hook('deleting', (primKey, obj, trans) => {
      window.dispatchEvent(new CustomEvent('db:changed'))
    })
  }

  async saveTrack(trackData, points = []) {
    return await this.transaction('rw', this.tracks, this.trackPoints, async () => {
      const trackId = await this.tracks.add({
        name: trackData.name,
        date: trackData.date || new Date(),
        distance: trackData.distance || 0,
        elevationGain: trackData.elevationGain || 0,
        elevationLoss: trackData.elevationLoss || 0,
        maxElevation: trackData.maxElevation || 0,
        minElevation: trackData.minElevation || 0,
        averageSpeed: trackData.averageSpeed || 0,
        maxSpeed: trackData.maxSpeed || 0,
        duration: trackData.duration || 0,
        gpxBlob: trackData.gpxBlob,
        gpxText: trackData.gpxText
      })

      if (points.length > 0) {
        const pointRecords = points.map((point, index) => ({
          trackId,
          lat: point.lat,
          lng: point.lng,
          elevation: point.elevation,
          timestamp: point.timestamp,
          sequence: index
        }))
        await this.trackPoints.bulkAdd(pointRecords)
      }

      return trackId
    })
  }

  async getTrack(id) {
    const track = await this.tracks.get(id)
    if (!track) return null

    const points = await this.trackPoints
      .where('trackId')
      .equals(id)
      .sortBy('sequence')

    return { ...track, points }
  }

  // Lazy: get a track with points loaded on demand (only when selected for map)
  async getTrackWithPoints(id) {
    const track = await this.tracks.get(id)
    if (!track) return null

    const points = await this.trackPoints
      .where('trackId')
      .equals(id)
      .sortBy('sequence')

    return { ...track, points }
  }

  async getAllTracks() {
    const tracks = await this.tracks.orderBy('date').reverse().toArray()
    // Return only metadata - points are loaded on demand for lazy loading
    return tracks.map(track => ({
      ...track,
      points: undefined  // Points loaded on demand only
    }))
  }

  async getTracksWithPoints() {
    const tracks = await this.getAllTracks()
    const tracksWithPoints = await Promise.all(
      tracks.map(async (track) => {
        const points = await this.trackPoints
          .where('trackId')
          .equals(track.id)
          .sortBy('sequence')
        return { ...track, points }
      })
    )
    return tracksWithPoints
  }

  async deleteTrack(id) {
    return await this.transaction('rw', this.tracks, this.trackPoints, async () => {
      await this.trackPoints.where('trackId').equals(id).delete()
      await this.tracks.delete(id)
    })
  }

  async updateTrack(id, updates) {
    return await this.tracks.update(id, updates)
  }

  // ============ IMÁGENES/FACTURAS ============

  async saveImage(imageData) {
    const id = await this.images.add({
      type: imageData.type || 'invoice',
      trackId: imageData.trackId || null,
      motoId: imageData.motoId || null,
      fileName: imageData.fileName,
      mimeType: imageData.mimeType,
      size: imageData.size,
      blob: imageData.blob,
      description: imageData.description || '',
      tags: imageData.tags || [],
      aspectRatio: imageData.aspectRatio || null,
      colorTheme: imageData.colorTheme || null
    })
    return id
  }

  async saveMotoImage(motoId, imageBlob, metadata = {}) {
    const existing = await this.images
      .where('motoId').equals(motoId)
      .and(img => img.type === 'moto_profile')
      .first()
    
    if (existing) {
      await this.images.update(existing.id, {
        blob: imageBlob,
        fileName: metadata.fileName || `${motoId}.webp`,
        mimeType: metadata.mimeType || 'image/webp',
        size: imageBlob.size,
        description: metadata.description || `Imagen de ${motoId}`,
        tags: metadata.tags || ['moto', 'profile'],
        aspectRatio: metadata.aspectRatio,
        colorTheme: metadata.colorTheme,
        updatedAt: new Date()
      })
      return existing.id
    }
    
    return await this.images.add({
      type: 'moto_profile',
      trackId: null,
      motoId,
      fileName: metadata.fileName || `${motoId}.webp`,
      mimeType: metadata.mimeType || 'image/webp',
      size: imageBlob.size,
      blob: imageBlob,
      description: metadata.description || `Imagen de ${motoId}`,
      tags: metadata.tags || ['moto', 'profile'],
      aspectRatio: metadata.aspectRatio,
      colorTheme: metadata.colorTheme,
      createdAt: new Date()
    })
  }

  async getMotoImage(motoId) {
    return await this.images
      .where('motoId').equals(motoId)
      .and(img => img.type === 'moto_profile')
      .first()
  }

  async getImagesByTrack(trackId) {
    return await this.images.where('trackId').equals(trackId).toArray()
  }

  async getImagesByType(type) {
    return await this.images.where('type').equals(type).toArray()
  }

  async getInvoicesByMoto(motoId) {
    return await this.images
      .where('motoId').equals(motoId)
      .and(img => img.type === 'invoice')
      .sortBy('createdAt')
  }

  async getImage(id) {
    return await this.images.get(id)
  }

  async deleteImage(id) {
    return await this.images.delete(id)
  }

  // ============ MANTENIMIENTO (legacy) ============

  async saveMaintenance(record) {
    return await this.maintenance.add({
      ...record,
      date: record.date || new Date()
    })
  }

  async getAllMaintenance() {
    return await this.maintenance.orderBy('date').reverse().toArray()
  }

  async getMaintenanceByMoto(motoId) {
    return await this.maintenance.where('motoId').equals(motoId).toArray()
  }

  // ============ FACTURAS (INVOICES) ============

  async saveInvoice(invoiceData) {
    return await this.invoices.add({
      ...invoiceData,
      createdAt: new Date()
    })
  }

  async getInvoice(id) {
    return await this.invoices.get(id)
  }

  async getInvoicesByMoto(motoId) {
    return await this.invoices.where('motoId').equals(motoId).reverse().sortBy('date')
  }

  async getAllInvoices() {
    return await this.invoices.orderBy('date').reverse().toArray()
  }

  async updateInvoice(id, updates) {
    return await this.invoices.update(id, updates)
  }

  async deleteInvoice(id) {
    return await this.invoices.delete(id)
  }

  // ============ MANTENIMIENTOS (NUEVA TABLA) ============

  async saveMaintenanceRecord(maintenanceData) {
    return await this.maintenances.add({
      ...maintenanceData,
      createdAt: new Date()
    })
  }

  async getMaintenanceRecord(id) {
    return await this.maintenances.get(id)
  }

  async getMaintenancesByMoto(motoId) {
    return await this.maintenances.where('motoId').equals(motoId).reverse().sortBy('date')
  }

  async getAllMaintenances() {
    return await this.maintenances.orderBy('date').reverse().toArray()
  }

  async updateMaintenanceRecord(id, updates) {
    return await this.maintenances.update(id, updates)
  }

  async deleteMaintenanceRecord(id) {
    return await this.maintenances.delete(id)
  }

  // ============ DOCUMENTOS MOTO (GUANTERA DIGITAL) ============

  async saveMotoDocument(documentData) {
    return await this.motoDocuments.add({
      ...documentData,
      createdAt: new Date()
    })
  }

  async getMotoDocument(id) {
    return await this.motoDocuments.get(id)
  }

  async getMotoDocumentsByMoto(motoId) {
    return await this.motoDocuments.where('motoId').equals(motoId).reverse().sortBy('createdAt')
  }

  async getAllMotoDocuments() {
    return await this.motoDocuments.orderBy('createdAt').reverse().toArray()
  }

  async getMotoDocumentsByType(docType) {
    return await this.motoDocuments.where('docType').equals(docType).toArray()
  }

  async updateMotoDocument(id, updates) {
    return await this.motoDocuments.update(id, updates)
  }

  async deleteMotoDocument(id) {
    return await this.motoDocuments.delete(id)
  }

  // ============ NEUMÁTICOS (CATÁLOGO) ============

  async saveTire(tireData) {
    return await this.tires.add({
      ...tireData,
      createdAt: new Date()
    })
  }

  async getTire(id) {
    return await this.tires.get(id)
  }

  async getAllTires() {
    return await this.tires.orderBy('brand').toArray()
  }

  async updateTire(id, updates) {
    return await this.tires.update(id, updates)
  }

  async deleteTire(id) {
    return await this.tires.delete(id)
  }

  // ============ TALLERES Y MANTENIMIENTO PROPIO ============

  async getAllWorkshops() {
    const list = await this.workshops.toArray()
    return list.sort((a, b) => Number(Boolean(b.isDefault)) - Number(Boolean(a.isDefault)))
  }

  async addWorkshop(data) {
    return await this.transaction('rw', this.workshops, async () => {
      if (data.isDefault) {
        await this.workshops
          .filter(w => Boolean(w.isDefault))
          .modify({ isDefault: false })
      }
      return await this.workshops.add({
        ...data,
        createdAt: new Date()
      })
    })
  }

  async updateWorkshop(id, data) {
    return await this.transaction('rw', this.workshops, async () => {
      if (data.isDefault) {
        await this.workshops
          .filter(w => Boolean(w.isDefault) && w.id !== id)
          .modify({ isDefault: false })
      }
      return await this.workshops.update(id, data)
    })
  }

  async deleteWorkshop(id) {
    return await this.workshops.delete(id)
  }

  // ============ MOTOCICLETAS (GARAJE) ============

  async getAllMotorcycles() {
    return await this.motorcycles.orderBy('createdAt').reverse().toArray()
  }

  async addMotorcycle(data) {
    return await this.motorcycles.add({
      ...data,
      createdAt: new Date()
    })
  }

  async updateMotorcycle(id, data) {
    return await this.motorcycles.update(id, data)
  }

  async deleteMotorcycle(id) {
    return await this.motorcycles.delete(id)
  }

  // ============ TEMAS PERSONALIZADOS ============

  async getAllCustomThemes() {
    return await this.customThemes.orderBy('createdAt').reverse().toArray()
  }

  async addCustomTheme(data) {
    return await this.customThemes.add({
      ...data,
      createdAt: new Date()
    })
  }

  async updateCustomTheme(id, data) {
    return await this.customThemes.update(id, data)
  }

  async deleteCustomTheme(id) {
    return await this.customThemes.delete(id)
  }

  // ============ PERFIL MOTO ============

  async saveMotoProfile(profile) {
    const existing = await this.motoProfile.toArray()
    if (existing.length > 0) {
      return await this.motoProfile.update(existing[0].id, {
        ...profile,
        updatedAt: new Date()
      })
    }
    return await this.motoProfile.add({
      ...profile,
      updatedAt: new Date()
    })
  }

  async getMotoProfile() {
    const profiles = await this.motoProfile.toArray()
    return profiles[0] || null
  }

  // ============ CONFIGURACIÓN ============

  async setSetting(key, value) {
    const existing = await this.settings.where('key').equals(key).first()
    if (existing) {
      return await this.settings.update(existing.id, { value, updatedAt: new Date() })
    }
    return await this.settings.add({ key, value, updatedAt: new Date() })
  }

  async getSetting(key, defaultValue = null) {
    const setting = await this.settings.where('key').equals(key).first()
    return setting ? setting.value : defaultValue
  }

  async getAllSettings() {
    const settings = await this.settings.toArray()
    return Object.fromEntries(settings.map(s => [s.key, s.value]))
  }

  // ============ UTILIDADES ============

  async clearAllData() {
    await this.transaction('rw', 
      this.tracks, 
      this.trackPoints, 
      this.images, 
      this.maintenance, 
      this.motoProfile, 
      this.settings,
      this.uploads,
      this.workshops,
      this.motorcycles,
      this.customThemes,
      this.invoices,
      this.maintenances,
      this.motoDocuments,
      this.tires,
      async () => {
        await Promise.all([
          this.tracks.clear(),
          this.trackPoints.clear(),
          this.images.clear(),
          this.maintenance.clear(),
          this.motoProfile.clear(),
          this.settings.clear(),
          this.uploads.clear(),
          this.workshops.clear(),
          this.motorcycles.clear(),
          this.customThemes.clear(),
          this.invoices.clear(),
          this.maintenances.clear(),
          this.motoDocuments.clear(),
          this.tires.clear()
        ])
      }
    )
  }

  async getDatabaseSize() {
    const tracks = await this.tracks.count()
    const points = await this.trackPoints.count()
    const images = await this.images.count()
    const maintenance = await this.maintenance.count()
    const workshops = await this.workshops.count()
    const invoices = await this.invoices.count()
    const maintenances = await this.maintenances.count()
    const motoDocuments = await this.motoDocuments.count()
    const tires = await this.tires.count()

    return { tracks, points, images, maintenance, workshops, invoices, maintenances, motoDocuments, tires }
  }

  async exportAll() {
    const [tracks, trackPoints, images, maintenance, motoProfile, settings, uploads, workshops, motorcycles, customThemes, invoices, maintenances, motoDocuments, tires] = await Promise.all([
      this.tracks.toArray(),
      this.trackPoints.toArray(),
      this.images.toArray(),
      this.maintenance.toArray(),
      this.motoProfile.toArray(),
      this.settings.toArray(),
      this.uploads.toArray(),
      this.workshops.toArray(),
      this.motorcycles.toArray(),
      this.customThemes.toArray(),
      this.invoices.toArray(),
      this.maintenances.toArray(),
      this.motoDocuments.toArray(),
      this.tires.toArray()
    ])

    return {
      version: 8,
      exportedAt: new Date().toISOString(),
      tracks,
      trackPoints,
      images,
      maintenance,
      motoProfile,
      settings,
      uploads,
      workshops,
      motorcycles,
      customThemes,
      invoices,
      maintenances,
      motoDocuments,
      tires
    }
  }

  async importAll(data) {
    return await this.transaction('rw',
      this.tracks,
      this.trackPoints,
      this.images,
      this.maintenance,
      this.motoProfile,
      this.settings,
      this.uploads,
      this.workshops,
      this.motorcycles,
      this.customThemes,
      this.invoices,
      this.maintenances,
      this.motoDocuments,
      this.tires,
      async () => {
        await Promise.all([
          this.tracks.bulkPut(data.tracks || []),
          this.trackPoints.bulkPut(data.trackPoints || []),
          this.images.bulkPut(data.images || []),
          this.maintenance.bulkPut(data.maintenance || []),
          this.motoProfile.bulkPut(data.motoProfile || []),
          this.settings.bulkPut(data.settings || []),
          this.uploads.bulkPut(data.uploads || []),
          this.workshops.bulkPut(data.workshops || []),
          this.motorcycles.bulkPut(data.motorcycles || []),
          this.customThemes.bulkPut(data.customThemes || []),
          this.invoices.bulkPut(data.invoices || []),
          this.maintenances.bulkPut(data.maintenances || []),
          this.motoDocuments.bulkPut(data.motoDocuments || []),
          this.tires.bulkPut(data.tires || [])
        ])
      }
    )
  }
}

export const db = new MotoAtlas26DB()

export async function initDB() {
  try {
    await db.open()
    console.log('MotoAtlas26DB inicializada correctamente')
    return true
  } catch (error) {
    console.error('Error inicializando MotoAtlas26DB:', error)
    return false
  }
}

export default db