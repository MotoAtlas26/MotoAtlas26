/**
 * Servicio de sincronización con Google Drive
 * - Usa window.google.accounts.oauth2.initTokenClient (Google Identity Services)
 * - Scope: drive.file (solo archivos creados por la app) + openid email profile
 * - API: fetch nativo contra https://www.googleapis.com/drive/v3/files y https://www.googleapis.com/upload/drive/v3/files
 * - Sin dependencias de gapi.client
 */

const SCOPES = 'https://www.googleapis.com/auth/drive.file openid email profile'
const FOLDER_NAME = 'MotoAtlas'
const DB_FILE_NAME = 'motoatlas-db.json'
const API_BASE = 'https://www.googleapis.com/drive/v3'
const UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3'

// Estado interno
let tokenClient = null
let accessToken = null
let tokenExpiry = null
let currentUser = null
let isInitialized = false

// Claves de localStorage
const STORAGE_KEYS = {
  CONNECTED: 'motoatlas:drive:connected',
  USER: 'motoatlas:drive:user',
  LAST_SYNC: 'motoatlas:drive:lastSync'
}

/**
 * Verifica si el Client ID está configurado
 */
function getClientId() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  if (!clientId) {
    throw new Error(
      'VITE_GOOGLE_CLIENT_ID no configurado. ' +
      'Añade VITE_GOOGLE_CLIENT_ID=tu_client_id en .env.local y reinicia el servidor de desarrollo.'
    )
  }
  return clientId
}

/**
 * Inicializa el cliente de tokens de Google OAuth2
 * Debe llamarse antes de solicitar el token
 */
export function initGoogleClient(clientId) {
  if (!window.google || !window.google.accounts) {
    throw new Error('Google Identity Services no cargado. Asegúrate de incluir el script en index.html.')
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
      console.log('[Google Drive] Token obtenido, expira en:', response.expires_in, 'segundos')
    },
    error_callback: (error) => {
      console.error('[Google Drive] Error en error_callback:', error)
      accessToken = null
      tokenExpiry = null
      currentUser = null
    }
  })

  isInitialized = true
  return tokenClient
}

/**
 * Obtiene información del usuario desde Google OAuth2 userinfo endpoint
 */
async function fetchCurrentUser() {
  if (!accessToken) {
    throw new Error('No hay token de acceso')
  }

  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error(`Error al obtener info de usuario: ${response.statusText}`)
  }

  currentUser = await response.json()
  console.log('[Google Drive] Usuario obtenido:', currentUser.email)
  return currentUser
}

/**
 * Solicita el token de acceso (prompt: consent)
 * Llama a initGoogleClient primero si no está inicializado
 */
export async function signIn(clientId) {
  if (!tokenClient) {
    initGoogleClient(clientId)
  }

  return new Promise((resolve, reject) => {
    tokenClient.callback = async (response) => {
      if (response.error) {
        reject(new Error(response.error))
        return
      }
      accessToken = response.access_token
      tokenExpiry = Date.now() + (response.expires_in * 1000)
      try {
        await fetchCurrentUser()
        // Guardar estado de conexión en localStorage
        localStorage.setItem(STORAGE_KEYS.CONNECTED, 'true')
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(currentUser))
        resolve(currentUser)
      } catch (err) {
        reject(err)
      }
    }

    tokenClient.error_callback = (error) => {
      reject(new Error(error.error || 'Error al iniciar sesión'))
    }

    tokenClient.requestAccessToken({ prompt: 'consent' })
  })
}

/**
 * Cierra sesión y revoca el token
 */
export async function signOut() {
  if (tokenClient) {
    tokenClient.disconnect()
  }
  accessToken = null
  currentUser = null
  
  // Limpiar localStorage
  localStorage.removeItem(STORAGE_KEYS.CONNECTED)
  localStorage.removeItem(STORAGE_KEYS.USER)
  localStorage.removeItem(STORAGE_KEYS.LAST_SYNC)
  
  console.log('[Google Drive] Sesión cerrada')
}

/**
 * Obtiene la información del usuario actual (desde memoria o localStorage)
 */
export async function getCurrentUser() {
  if (currentUser) {
    return currentUser
  }
  
  // Intentar restaurar desde localStorage
  const storedUser = localStorage.getItem(STORAGE_KEYS.USER)
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser)
      return currentUser
    } catch {
      // Ignorar error de parseo
    }
  }
  
  if (!accessToken) {
    throw new Error('No hay token de acceso. Inicia sesión primero.')
  }
  
  await fetchCurrentUser()
  return currentUser
}

/**
 * Verifica si hay una sesión guardada en localStorage
 */
export function hasStoredSession() {
  return localStorage.getItem(STORAGE_KEYS.CONNECTED) === 'true'
}

/**
 * Restaura la sesión desde localStorage (sin prompt de usuario)
 * Requiere que el token haya sido obtenido previamente en esta sesión
 */
export async function restoreSession() {
  if (!hasStoredSession()) {
    return null
  }
  
  const clientId = getClientId()
  initGoogleClient(clientId)
  
  // El token de acceso no se guarda en localStorage por seguridad
  // El usuario debe volver a hacer signIn para obtener un nuevo token
  // Pero podemos devolver la info del usuario guardada
  const storedUser = localStorage.getItem(STORAGE_KEYS.USER)
  if (storedUser) {
    try {
      currentUser = JSON.parse(storedUser)
      return currentUser
    } catch {
      return null
    }
  }
  
  return null
}

/**
 * Busca o crea la carpeta "MotoAtlas" en el Drive del usuario
 * @returns {Promise<{id: string, name: string}>}
 */
export async function ensureMotoAtlasFolder() {
  if (!accessToken) {
    throw new Error('No hay token de acceso. Inicia sesión primero.')
  }

  // Buscar carpeta existente
  const query = `name='${FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`
  const url = `${API_BASE}/files?q=${encodeURIComponent(query)}`
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error(`Error al buscar carpeta: ${response.statusText}`)
  }

  const data = await response.json()
  const existingFolder = data.files?.[0]

  if (existingFolder) {
    console.log('[Google Drive] Carpeta MotoAtlas encontrada:', existingFolder.id)
    return existingFolder
  }

  // Crear carpeta nueva
  const createUrl = `${API_BASE}/files`
  const createResponse = await fetch(createUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      name: FOLDER_NAME,
      mimeType: 'application/vnd.google-apps.folder'
    })
  })

  if (!createResponse.ok) {
    throw new Error(`Error al crear carpeta: ${createResponse.statusText}`)
  }

  const newFolder = await createResponse.json()
  console.log('[Google Drive] Carpeta MotoAtlas creada:', newFolder.id)
  return newFolder
}

/**
 * Busca o crea el archivo motoatlas-db.json dentro de la carpeta MotoAtlas
 * @param {string} folderId - ID de la carpeta MotoAtlas
 * @returns {Promise<{id: string, name: string}>}
 */
export async function findOrCreateDBFile(folderId) {
  if (!accessToken) {
    throw new Error('No hay token de acceso. Inicia sesión primero.')
  }

  // Buscar archivo existente
  const query = `name='${DB_FILE_NAME}' and '${folderId}' in parents and trashed=false`
  const url = `${API_BASE}/files?q=${encodeURIComponent(query)}`
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error(`Error al buscar archivo: ${response.statusText}`)
  }

  const data = await response.json()
  const existingFile = data.files?.[0]

  if (existingFile) {
    console.log('[Google Drive] Archivo motoatlas-db.json encontrado:', existingFile.id)
    return existingFile
  }

  // Crear archivo nuevo (multipart upload para crear con contenido vacío)
  const metadata = {
    name: DB_FILE_NAME,
    parents: [folderId],
    mimeType: 'application/json'
  }

  const form = new FormData()
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
  form.append('file', new Blob(['{}'], { type: 'application/json' }))

  const createUrl = `${UPLOAD_BASE}/files?uploadType=multipart`
  const createResponse = await fetch(createUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: form
  })

  if (!createResponse.ok) {
    throw new Error(`Error al crear archivo: ${createResponse.statusText}`)
  }

  const newFile = await createResponse.json()
  console.log('[Google Drive] Archivo motoatlas-db.json creado:', newFile.id)
  return newFile
}

/**
 * Lee el contenido del archivo motoatlas-db.json desde Google Drive
 * @param {string} fileId - ID del archivo
 * @returns {Promise<Object>} - Contenido JSON del archivo
 */
export async function readDBFile(fileId) {
  if (!accessToken) {
    throw new Error('No hay token de acceso. Inicia sesión primero.')
  }

  const url = `${API_BASE}/files/${fileId}?alt=media`
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    if (response.status === 404) {
      return null
    }
    throw new Error(`Error al leer archivo: ${response.statusText}`)
  }

  const content = await response.json()
  console.log('[Google Drive] Contenido del archivo leído:', Object.keys(content).length, 'tablas')
  return content
}

/**
 * Escribe el contenido del archivo motoatlas-db.json en Google Drive usando multipart upload
 * Si el archivo no existe, lo crea. Si existe, lo actualiza.
 * @param {string} fileId - ID del archivo
 * @param {Object} data - Datos a guardar (exportAll())
 * @returns {Promise<{id: string, name: string}>}
 */
export async function writeDBFile(fileId, data) {
  if (!accessToken) {
    throw new Error('No hay token de acceso. Inicia sesión primero.')
  }

  const jsonContent = JSON.stringify(data, null, 2)
  const metadata = {
    name: DB_FILE_NAME,
    mimeType: 'application/json'
  }

  const form = new FormData()
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }))
  form.append('file', new Blob([jsonContent], { type: 'application/json' }))

  const url = fileId 
    ? `${UPLOAD_BASE}/files/${fileId}?uploadType=multipart`
    : `${UPLOAD_BASE}/files?uploadType=multipart`
  
  const method = fileId ? 'PATCH' : 'POST'

  const response = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`
    },
    body: form
  })

  if (!response.ok) {
    throw new Error(`Error al escribir archivo: ${response.statusText}`)
  }

  const file = await response.json()
  console.log('[Google Drive] Archivo actualizado:', file.id)
  return file
}

/**
 * Obtiene preferencias visuales desde localStorage
 */
function getVisualPreferences() {
  try {
    return {
      theme: localStorage.getItem('motoatlas:theme') || 'motoatlas26',
      darkMode: localStorage.getItem('motoatlas:darkMode') === 'true',
      selectedMoto: localStorage.getItem('motoatlas:selectedMoto') || null
    }
  } catch {
    return { theme: 'motoatlas26', darkMode: false, selectedMoto: null }
  }
}

/**
 * Restaura preferencias visuales en localStorage
 */
function restoreVisualPreferences(prefs) {
  try {
    if (prefs.theme) localStorage.setItem('motoatlas:theme', prefs.theme)
    if (typeof prefs.darkMode === 'boolean') localStorage.setItem('motoatlas:darkMode', prefs.darkMode.toString())
    if (prefs.selectedMoto) localStorage.setItem('motoatlas:selectedMoto', prefs.selectedMoto)
  } catch (e) {
    console.warn('[Google Drive] Error restaurando preferencias visuales:', e)
  }
}

/**
 * Sincroniza desde Google Drive: lee el archivo y restaura los datos en Dexie
 * @param {Object} db - Instancia de Dexie
 * @returns {Promise<Object>} - Datos importados
 */
export async function syncFromDrive(db) {
  if (!accessToken) {
    throw new Error('No hay token de acceso. Inicia sesión primero.')
  }

  // Buscar carpeta y archivo
  const folder = await ensureMotoAtlasFolder()
  const file = await findOrCreateDBFile(folder.id)

  // Leer contenido
  const data = await readDBFile(file.id)

  if (!data) {
    console.log('[Google Drive] Archivo vacío en Drive, no hay nada que sincronizar')
    return null
  }

  // Importar en Dexie
  if (db.importAll) {
    await db.importAll(data)
    console.log('[Google Drive] Datos importados desde Drive')
  } else {
    throw new Error('db.importAll no está disponible. Asegúrate de usar la instancia de Dexie correcta.')
  }

  // Restaurar preferencias visuales si existen en el backup
  if (data.preferences) {
    restoreVisualPreferences(data.preferences)
  }

  // Actualizar timestamp de última sincronización
  const now = new Date().toISOString()
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now)

  // Disparar evento global para que las vistas recarguen datos
  window.dispatchEvent(new CustomEvent('motoatlas:drive-synced', { 
    detail: { source: 'drive', timestamp: now } 
  }))

  return data
}

/**
 * Sincroniza hacia Google Drive: exporta datos de Dexie y actualiza el archivo
 * @param {Object} db - Instancia de Dexie
 * @returns {Promise<Object>} - Datos exportados
 */
export async function syncToDrive(db) {
  if (!accessToken) {
    throw new Error('No hay token de acceso. Inicia sesión primero.')
  }

  // Exportar datos de Dexie
  let data
  if (db.exportAll) {
    data = await db.exportAll()
    console.log('[Google Drive] Datos exportados para Drive:', Object.keys(data).length, 'tablas')
  } else {
    throw new Error('db.exportAll no está disponible. Asegúrate de usar la instancia de Dexie correcta.')
  }

  // Añadir preferencias visuales al backup
  data.preferences = getVisualPreferences()
  data.syncedAt = new Date().toISOString()

  // Buscar carpeta y archivo
  const folder = await ensureMotoAtlasFolder()
  const file = await findOrCreateDBFile(folder.id)

  // Escribir en Drive
  const updatedFile = await writeDBFile(file.id, data)

  // Actualizar timestamp de última sincronización
  const now = new Date().toISOString()
  localStorage.setItem(STORAGE_KEYS.LAST_SYNC, now)

  console.log('[Google Drive] Datos sincronizados hacia Drive')
  return data
}

/**
 * Obtiene el estado de conexión actual
 */
export function getConnectionStatus() {
  return {
    hasToken: !!accessToken,
    hasUser: !!currentUser,
    user: currentUser,
    isStoredSession: hasStoredSession(),
    lastSync: localStorage.getItem(STORAGE_KEYS.LAST_SYNC),
    tokenExpiry
  }
}

/**
 * Obtiene el timestamp de la última sincronización
 */
export function getLastSync() {
  const lastSync = localStorage.getItem(STORAGE_KEYS.LAST_SYNC)
  return lastSync ? new Date(lastSync) : null
}

// Exportar funciones de utilidad
export { tokenClient, accessToken, currentUser }