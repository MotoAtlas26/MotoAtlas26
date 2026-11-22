import React from 'react'

/**
 * FileSystemManager - Acceso a archivos del sistema para BD MotoAtlas26
 * Usa File System Access API para leer/escribir directamente en carpetas del usuario
 * Permite acceso externo a la BD desde scripts, otras apps, backups manuales, etc.
 * 
 * ESTRUCTURA JSON EXPORTADA:
 * {
 *   version: 1,
 *   exportedAt: "2024-01-15T10:30:00.000Z",
 *   tracks: [{ id, name, date, distance, elevationGain, elevationLoss, maxElevation, minElevation, averageSpeed, maxSpeed, duration, gpxBlob, gpxText, createdAt, updatedAt }],
 *   trackPoints: [{ id, trackId, lat, lng, elevation, timestamp, sequence }],
 *   images: [{ id, type, trackId, motoId, fileName, mimeType, size, blob, description, tags, createdAt }],
 *   maintenance: [{ id, motoId, type, date, mileage, cost, workshop, description, createdAt }],
 *   motoProfile: [{ id, model, year, vin, purchaseDate, currentMileage, updatedAt }],
 *   settings: [{ id, key, value, updatedAt }],
 *   uploads: [{ id, type, fileName, size, status, localPath, remoteUrl, createdAt }]
 * }
 * 
 * ACCESO EXTERNO:
 * - El archivo MotoAtlas26-db.json en la carpeta MotoAtlas26/ es legible por cualquier script/app
 * - Formato JSON estandar, parsable con jq, Python, Node.js, etc.
 * - Backups automaticos con timestamp: MotoAtlas26-backup-2024-01-15T10-30-00.json
 */

const DB_FILE_NAME = 'MotoAtlas26-db.json'
const DB_FOLDER_NAME = 'MotoAtlas26'

class FileSystemManager {
  constructor() {
    this.dirHandle = null
    this.fileHandle = null
    this.isSupported = 'showDirectoryPicker' in window
  }

  checkSupport() {
    return this.isSupported
  }

  async pickFolder() {
    if (!this.isSupported) {
      console.warn('File System Access API no soportada en este navegador')
      return null
    }

    try {
      this.dirHandle = await window.showDirectoryPicker({
        mode: 'readwrite',
        startIn: 'documents',
        suggestedName: DB_FOLDER_NAME
      })
      return this.dirHandle
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Error seleccionando carpeta:', error)
      }
      return null
    }
  }

  async getDBFileHandle() {
    if (!this.dirHandle) return null

    try {
      this.fileHandle = await this.dirHandle.getFileHandle(DB_FILE_NAME, { create: true })
      return this.fileHandle
    } catch (error) {
      console.error('Error obteniendo handle del archivo:', error)
      return null
    }
  }

  async saveDB(data) {
    if (!this.fileHandle) {
      await this.getDBFileHandle()
    }
    if (!this.fileHandle) return false

    try {
      const writable = await this.fileHandle.createWritable()
      const jsonString = JSON.stringify(data, null, 2)
      await writable.write(jsonString)
      await writable.close()
      console.log('BD guardada en:', this.fileHandle.name)
      return true
    } catch (error) {
      console.error('Error guardando BD:', error)
      return false
    }
  }

  async loadDB() {
    if (!this.fileHandle) {
      await this.getDBFileHandle()
    }
    if (!this.fileHandle) return null

    try {
      const file = await this.fileHandle.getFile()
      const text = await file.text()
      const data = JSON.parse(text)
      console.log('BD cargada desde:', this.fileHandle.name)
      return data
    } catch (error) {
      if (error.name !== 'NotFoundError') {
        console.error('Error cargando BD:', error)
      }
      return null
    }
  }

  async loadDBFromFile() {
    return new Promise((resolve) => {
      const input = document.createElement('input')
      input.type = 'file'
      input.accept = '.json'
      input.onchange = async (e) => {
        const file = e.target.files[0]
        if (!file) return resolve(null)
        try {
          const text = await file.text()
          const data = JSON.parse(text)
          console.log('BD importada desde archivo:', file.name)
          resolve(data)
        } catch (error) {
          console.error('Error importando BD:', error)
          resolve(null)
        }
      }
      input.click()
    })
  }

  getInfo() {
    return {
      isSupported: this.isSupported,
      hasFolder: !!this.dirHandle,
      hasFile: !!this.fileHandle,
      folderName: this.dirHandle?.name || null,
      fileName: this.fileHandle?.name || null
    }
  }

  async createTimestampedBackup(data) {
    if (!this.dirHandle) return false

    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const backupName = 'MotoAtlas26-backup-' + timestamp + '.json'
      const handle = await this.dirHandle.getFileHandle(backupName, { create: true })
      const writable = await handle.createWritable()
      await writable.write(JSON.stringify(data, null, 2))
      await writable.close()
      console.log('Backup creado:', backupName)
      return true
    } catch (error) {
      console.error('Error creando backup:', error)
      return false
    }
  }

  async listBackups() {
    if (!this.dirHandle) return []

    const backups = []
    try {
      for await (const [name, handle] of this.dirHandle.entries()) {
        if (handle.kind === 'file' && name.startsWith('MotoAtlas26-backup-') && name.endsWith('.json')) {
          backups.push({ name, handle })
        }
      }
      backups.sort((a, b) => b.name.localeCompare(a.name))
      return backups
    } catch (error) {
      console.error('Error listando backups:', error)
      return []
    }
  }

  async loadBackup(handle) {
    try {
      const file = await handle.getFile()
      const text = await file.text()
      return JSON.parse(text)
    } catch (error) {
      console.error('Error cargando backup:', error)
      return null
    }
  }
}

// Instancia singleton
export const fileSystem = new FileSystemManager()

/**
 * Hook para usar FileSystem en componentes React
 */
export function useFileSystem() {
  const [fsInfo, setFsInfo] = React.useState(fileSystem.getInfo())

  const refreshInfo = () => setFsInfo(fileSystem.getInfo())

  const pickFolder = async () => {
    const result = await fileSystem.pickFolder()
    refreshInfo()
    return result
  }

  const saveDB = async (data) => {
    const result = await fileSystem.saveDB(data)
    refreshInfo()
    return result
  }

  const loadDB = async () => {
    const result = await fileSystem.loadDB()
    refreshInfo()
    return result
  }

  const downloadDB = (data, fileName) => fileSystem.downloadDB(data, fileName)

  const loadFromFile = () => fileSystem.loadDBFromFile()

  const createBackup = async (data) => {
    const result = await fileSystem.createTimestampedBackup(data)
    refreshInfo()
    return result
  }

  const listBackups = async () => await fileSystem.listBackups()

  const loadBackup = async (handle) => await fileSystem.loadBackup(handle)

  return {
    ...fsInfo,
    pickFolder,
    saveDB,
    loadDB,
    downloadDB,
    loadFromFile,
    createBackup,
    listBackups,
    loadBackup,
    refreshInfo
  }
}

// Para uso directo sin React
export function initFileSystem() {
  return fileSystem
}

export default fileSystem
