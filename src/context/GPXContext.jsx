import React, { createContext, useContext, useReducer, useEffect, useState, useMemo, useCallback } from 'react'
import { db, initDB } from '../services/db'
import { fileSystem } from '../services/fileSystem'

const GPXContext = createContext()

export const useGPX = () => {
  const context = useContext(GPXContext)
  if (context === undefined) {
    throw new Error('useGPX must be used within a GPXProvider')
  }
  return context
}

const initialState = {
  tracks: [],
  selectedTrack: null,
  isLoading: false,
  error: null,
  dbReady: false,
  fsReady: false,
  fsSupported: false,
  fsHasFolder: false,
  selectedMoto: 'cfmoto-800mt-x',
}

function gpxReducer(state, action) {
  switch (action.type) {
    case 'SET_TRACKS':
      return { ...state, tracks: action.payload }
    case 'ADD_TRACK':
      return { ...state, tracks: [action.payload, ...state.tracks] }
    case 'SET_SELECTED_TRACK':
      return { ...state, selectedTrack: action.payload }
    case 'SET_SELECTED_MOTO':
      return { ...state, selectedMoto: action.payload }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    case 'CLEAR_TRACKS':
      return { ...state, tracks: [], selectedTrack: null }
    case 'SET_DB_READY':
      return { ...state, dbReady: action.payload }
    case 'SET_FS_READY':
      return { ...state, fsReady: action.payload }
    case 'SET_FS_INFO':
      return {
        ...state,
        fsSupported: action.payload.isSupported,
        fsHasFolder: action.payload.hasFolder,
      }
    default:
      return state
  }
}

export const GPXProvider = ({ children }) => {
  const [state, dispatch] = useReducer(gpxReducer, initialState)
  const [lastSync, setLastSync] = useState(null)

  useEffect(() => {
    const init = async () => {
      await initDB()
      dispatch({ type: 'SET_DB_READY', payload: true })
      dispatch({ type: 'SET_FS_INFO', payload: fileSystem.getInfo() })
      dispatch({ type: 'SET_FS_READY', payload: true })
      await loadFromDB()
      await preloadMotoImages()
      const savedMoto = await db.getSetting('selectedMoto')
      if (savedMoto) {
        dispatch({ type: 'SET_SELECTED_MOTO', payload: savedMoto })
      }
    }
    init()
  }, [])

  const loadFromDB = useCallback(async () => {
    dispatch({ type: 'SET_LOADING', payload: true })
    try {
      const tracks = await db.getAllTracks()
      dispatch({ type: 'SET_TRACKS', payload: tracks })
    } catch (error) {
      console.error('Error loading tracks:', error)
      dispatch({ type: 'SET_ERROR', payload: error.message })
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [dispatch])

  const preloadMotoImages = async () => {
    const baseUrl = import.meta.env.BASE_URL || '/'
    const motoImages = [
      {
        motoId: 'cfmoto-800mt-x',
        fileName: '800MT-X.webp',
        path: `${baseUrl}800MT-X.webp`,
        colorTheme: { primary: '#E8A838', secondary: '#1A1A1A' }
      },
      {
        motoId: 'ktm-1290-super-adventure-s',
        fileName: 'KTM-1290-S-Adv-S.webp',
        path: `${baseUrl}KTM-1290-S-Adv-S.webp`,
        colorTheme: { primary: '#FF8200', secondary: '#000000' }
      }
    ]

    for (const moto of motoImages) {
      try {
        const existing = await db.getMotoImage(moto.motoId)
        if (!existing) {
          const response = await fetch(moto.path)
          if (response.ok) {
            const blob = await response.blob()
            
            // Obtener aspect ratio de la imagen
            const aspectRatio = await getImageAspectRatio(blob)
            
            await db.saveMotoImage(moto.motoId, blob, {
              fileName: moto.fileName,
              mimeType: 'image/webp',
              description: `Imagen de perfil de ${moto.motoId}`,
              tags: ['moto', 'profile'],
              aspectRatio,
              colorTheme: moto.colorTheme
            })
            console.log(`Imagen precargada: ${moto.motoId}`)
          }
        }
      } catch (error) {
        console.warn(`No se pudo precargar imagen para ${moto.motoId}:`, error)
      }
    }
  }

  const getImageAspectRatio = (blob) => {
    return new Promise((resolve) => {
      const url = URL.createObjectURL(blob)
      const img = new Image()
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve(img.width / img.height)
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        resolve(null)
      }
      img.src = url
    })
  }

  const saveSetting = useCallback(async (key, value) => {
    try {
      await db.setSetting(key, value)
      if (key === 'selectedMoto') {
        dispatch({ type: 'SET_SELECTED_MOTO', payload: value })
      }
      return true
    } catch (error) {
      console.error('Error saving setting:', error)
      return false
    }
  }, [dispatch])

  const loadSettings = async (key) => {
    try {
      return await db.getSetting(key)
    } catch (error) {
      console.error('Error loading setting:', error)
      return null
    }
  }

  const parseGPXFile = (content) => {
    try {
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(content, 'text/xml')
      const trackElements = xmlDoc.getElementsByTagName('trk')
      if (trackElements.length === 0) return null
      const trackElement = trackElements[0]
      const nameElement = trackElement.getElementsByTagName('name')[0]
      const trackName = nameElement?.textContent || 'Unknown Track'
      const points = []
      const ptElements = trackElement.getElementsByTagName('trkpt')
      for (let pt of ptElements) {
        const lat = parseFloat(pt.getAttribute('lat') || '0')
        const lng = parseFloat(pt.getAttribute('lon') || '0')
        const eleElement = pt.getElementsByTagName('ele')[0]
        const elevation = eleElement ? parseFloat(eleElement.textContent || '0') : undefined
        const timeElement = pt.getElementsByTagName('time')[0]
        const timestamp = timeElement ? new Date(timeElement.textContent || '') : undefined
        points.push({ lat, lng, elevation, timestamp })
      }
      return {
        name: trackName,
        points,
        distance: points.length * 100,
        elevationGain: 0,
        elevationLoss: 0,
        maxElevation: Math.max(...points.map(p => p.elevation || 0)),
        minElevation: Math.min(...points.map(p => p.elevation || 0)),
        averageSpeed: 0,
        maxSpeed: 0,
      }
    } catch (error) {
      console.error('Error parsing GPX file:', error)
      return null
    }
  }

  const uploadGPX = useCallback(async (file) => {
    dispatch({ type: 'SET_LOADING', payload: true })
    dispatch({ type: 'SET_ERROR', payload: null })
    try {
      const content = await file.text()
      const track = parseGPXFile(content)
      if (!track) throw new Error('No se pudo parsear el archivo GPX')
      const trackId = await db.saveTrack({ ...track, gpxBlob: file, gpxText: content }, track.points)
      const savedTrack = await db.getTrack(trackId)
      dispatch({ type: 'ADD_TRACK', payload: savedTrack })
      if (state.fsHasFolder) await syncToFileSystem()
      return { success: true, message: 'GPX subido correctamente', track: savedTrack }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido'
      dispatch({ type: 'SET_ERROR', payload: message })
      return { success: false, message }
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false })
    }
  }, [dispatch])

  const setSelectedTrack = useCallback((track) => {
    dispatch({ type: 'SET_SELECTED_TRACK', payload: track })
  }, [dispatch])

  const clearTracks = useCallback(async () => {
    try {
      await db.clearAllData()
      dispatch({ type: 'CLEAR_TRACKS' })
      if (state.fsHasFolder) await syncToFileSystem()
    } catch (error) {
      console.error('Error clearing tracks:', error)
    }
  }, [dispatch, state.fsHasFolder])

  const deleteTrack = useCallback(async (id) => {
    try {
      await db.deleteTrack(id)
      await loadFromDB()
      if (state.fsHasFolder) await syncToFileSystem()
    } catch (error) {
      console.error('Error deleting track:', error)
    }
  }, [dispatch, state.fsHasFolder])

  const pickFolder = async () => {
    const result = await fileSystem.pickFolder()
    if (result) {
      dispatch({ type: 'SET_FS_INFO', payload: fileSystem.getInfo() })
      const data = await fileSystem.loadDB()
      if (data) {
        await db.importAll(data)
        await loadFromDB()
        setLastSync(new Date())
      }
    }
    return result
  }

  const syncToFileSystem = async () => {
    if (!state.fsHasFolder) return false
    try {
      const data = await db.exportAll()
      const success = await fileSystem.saveDB(data)
      if (success) {
        setLastSync(new Date())
        await fileSystem.createTimestampedBackup(data)
      }
      return success
    } catch (error) {
      console.error('Error sync:', error)
      return false
    }
  }

  const loadFromFile = async () => {
    const data = await fileSystem.loadDBFromFile()
    if (data) {
      await db.importAll(data)
      await loadFromDB()
      setLastSync(new Date())
    }
    return data
  }

  const downloadDB = (fileName = 'MotoAtlas26-db.json') => {
    const exportData = async () => {
      const data = await db.exportAll()
      fileSystem.downloadDB(data, fileName)
    }
    exportData()
  }

  const createBackup = async () => {
    if (!state.fsHasFolder) return false
    const data = await db.exportAll()
    return await fileSystem.createTimestampedBackup(data)
  }

  const listBackups = async () => {
    if (!state.fsHasFolder) return []
    return await fileSystem.listBackups()
  }

  const loadBackup = async (handle) => {
    const data = await fileSystem.loadBackup(handle)
    if (data) {
      await db.importAll(data)
      await loadFromDB()
      setLastSync(new Date())
    }
    return data
  }

  const getFileSystemInfo = () => fileSystem.getInfo()

  const contextValue = useMemo(() => ({
    ...state,
    uploadGPX,
    setSelectedTrack,
    loadFromDB,
    clearTracks,
    deleteTrack,
    parseGPXFile,
    saveSetting,
    loadSettings,
    pickFolder,
    syncToFileSystem,
    loadFromFile,
    downloadDB,
    createBackup,
    listBackups,
    loadBackup,
    getFileSystemInfo,
    preloadMotoImages,
    getImageAspectRatio,
    lastSync,
  }), [
    state,
    uploadGPX,
    setSelectedTrack,
    loadFromDB,
    clearTracks,
    deleteTrack,
    saveSetting,
    lastSync
  ])

  return (
    <GPXContext.Provider value={contextValue}>
      {children}
    </GPXContext.Provider>
  )
}
