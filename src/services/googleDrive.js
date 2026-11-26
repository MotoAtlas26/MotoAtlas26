const SCOPES = 'https://www.googleapis.com/auth/drive.file openid email profile'
const FOLDER_NAME = 'MotoAtlas'
const DB_FILE_NAME = 'motoatlas-db.json'
const API_BASE = 'https://www.googleapis.com/drive/v3'
const UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3'

let tokenClient = null
let accessToken = null
let tokenExpiry = null
let currentUser = null
let isInitialized = false

const STORAGE_KEYS = {
  SESSION: 'motoatlas_drive_session',
  CONNECTED: 'motoatlas:drive:connected',
  USER: 'motoatlas:drive:user',
  LAST_SYNC: 'motoatlas:drive:lastSync'
}

function saveSessionToStorage() {
  if (!accessToken || !currentUser) return
  const session = {
    connected: true,
    accessToken,
    expiresAt: tokenExpiry,
    user: currentUser,
    lastSync: localStorage.getItem(STORAGE_KEYS.LAST_SYNC)
  }
  try {
    localStorage.setItem(STORAGE_KEYS.SESSION, JSON.stringify(session))
  } catch (e) {
    console.warn('[Google Drive] Error guardando sesión:', e)
  }
}

export function loadSessionFromStorage() {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SESSION)
    if (stored) return JSON.parse(stored)
  } catch (e) {
    console.warn('[Google Drive] Error cargando sesión:', e)
  }
  return null
}

export function clearSessionFromStorage() {
  localStorage.removeItem(STORAGE_KEYS.SESSION)
  localStorage.removeItem(STORAGE_KEYS.CONNECTED)
  localStorage.removeItem(STORAGE_KEYS.USER)
  localStorage.removeItem(STORAGE_KEYS.LAST_SYNC)
}

export function initGoogleClient(clientId) {
  if (!window.google || !window.google.accounts) {
    setTimeout(() => initGoogleClient(clientId), 500);
    return;
  }

  tokenClient = window.google.accounts.oauth2.initTokenClient({
    client_id: clientId,
    scope: SCOPES,
    callback: (response) => {
      if (response.error) {
        console.error('[Google Drive] Error en callback:', response.error)
        accessToken = null
        tokenExpiry = null
        currentUser = null
        return
      }
      accessToken = response.access_token
      tokenExpiry = Date.now() + (response.expires_in * 1000)
      saveSessionToStorage()
    },
    error_callback: (error) => {
      console.error('[Google Drive] Error en error_callback:', error)
      accessToken = null
      tokenExpiry = null
      currentUser = null
    }
  })

  isInitialized = true
  
  const storedSession = loadSessionFromStorage()
  if (storedSession && storedSession.connected && storedSession.accessToken) {
    const now = Date.now()
    const expiresAt = storedSession.expiresAt || 0
    
    if (now < expiresAt - 120000) {
      accessToken = storedSession.accessToken
      tokenExpiry = expiresAt
      currentUser = storedSession.user
    } else {
      accessToken = null
      tokenExpiry = null
    }
  }
  
  return tokenClient
}

export async function renewTokenSilently() {
  if (!tokenClient) return false
  
  return new Promise((resolve) => {
    const originalCallback = tokenClient.callback
    const originalErrorCallback = tokenClient.error_callback
    
    tokenClient.callback = (response) => {
      if (response.error) {
        resolve(false)
      } else {
        accessToken = response.access_token
        tokenExpiry = Date.now() + (response.expires_in * 1000)
        saveSessionToStorage()
        resolve(true)
      }
      tokenClient.callback = originalCallback
      tokenClient.error_callback = originalErrorCallback
    }
    
    tokenClient.error_callback = (error) => {
      resolve(false)
      tokenClient.callback = originalCallback
      tokenClient.error_callback = originalErrorCallback
    }
    
    tokenClient.requestAccessToken({ prompt: '' })
  })
}

export async function ensureValidToken() {
  if (!accessToken) return await renewTokenSilently()
  
  const now = Date.now()
  if (tokenExpiry && now >= tokenExpiry - 120000) {
    return await renewTokenSilently()
  }
  
  return true
}

async function authenticatedFetch(url, options = {}) {
  const hasToken = await ensureValidToken()
  if (!hasToken) throw new Error('No se pudo obtener token de acceso válido')

  const headers = { ...options.headers, Authorization: `Bearer ${accessToken}` }
  let response = await fetch(url, { ...options, headers })

  if (response.status === 401) {
    accessToken = null
    const renewed = await renewTokenSilently()
    if (renewed) {
      headers.Authorization = `Bearer ${accessToken}`
      response = await fetch(url, { ...options, headers })
    }
  }
  return response
}

export async function syncToDrive(db) {
  const data = await db.exportAll()
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  
  const response = await authenticatedFetch(`${API_BASE}/files?q=name='${DB_FILE_NAME}' and trashed=false`)
  const result = await response.json()
  
  if (result.files && result.files.length > 0) {
    await authenticatedFetch(`${UPLOAD_BASE}/files/${result.files[0].id}?uploadType=media`, {
      method: 'PATCH',
      body: blob
    })
  } else {
    const formData = new FormData()
    formData.append('metadata', new Blob([JSON.stringify({ name: DB_FILE_NAME })], { type: 'application/json' }))
    formData.append('file', blob)
    await authenticatedFetch(`${UPLOAD_BASE}/files?uploadType=multipart`, { method: 'POST', body: formData })
  }
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString())
}

export async function syncFromDrive(db) {
  const response = await authenticatedFetch(`${API_BASE}/files?q=name='${DB_FILE_NAME}' and trashed=false`)
  const result = await response.json()
  if (!result.files || result.files.length === 0) throw new Error('No se encontró backup en Drive')
  
  const fileResponse = await authenticatedFetch(`${API_BASE}/files/${result.files[0].id}?alt=media`)
  const data = await fileResponse.json()
  await db.importAll(data)
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString())
}

export function getConnectionStatus() {
  return { hasToken: !!accessToken }
}

export function getLastSync() {
  return localStorage.getItem(STORAGE_KEYS.LAST_SYNC)
}

export function loadSessionFromStorageExport() {
  return loadSessionFromStorage()
}
