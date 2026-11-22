/**
 * Servicio de sincronización con Google Drive
 * - Usa window.google.accounts.oauth2.initTokenClient (Google Identity Services)
 * - Scope: drive.file (solo archivos creados por la app) + openid email profile
 * - API: fetch nativo contra https://www.googleapis.com/drive/v3/files y https://www.googleapis.com/upload/drive/v3/files
 * - Sin dependencias de gapi.client
 */

const SCOPES = 'https://www.googleapis.com/auth/drive.file openid email profile'
const FOLDER_NAME = 'MotoAtlas26'
const DB_FILE_NAME = 'MotoAtlas26-db.json'
const API_BASE = 'https://www.googleapis.com/drive/v3'
const UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3'

let tokenClient = null
let accessToken = null
let currentUser = null

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
        currentUser = null
        return
      }
      accessToken = response.access_token
      console.log('[Google Drive] Token obtenido')
    },
    error_callback: (error) => {
      console.error('[Google Drive] Error en error_callback:', error)
      accessToken = null
      currentUser = null
    }
  })

  return tokenClient
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
      await fetchCurrentUser()
      resolve(currentUser)
    }

    tokenClient.error_callback = (error) => {
      reject(new Error(error.error || 'Error al iniciar sesión'))
    }

    tokenClient.prompt()
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
  console.log('[Google Drive] Sesión cerrada')
}

/**
 * Obtiene la información del usuario actual
 */
export async function getCurrentUser() {
  if (!accessToken) {
    throw new Error('No hay token de acceso. Inicia sesión primero.')
  }
  if (currentUser) {
    return currentUser
  }
  await fetchCurrentUser()
  return currentUser
}

/**
 * Busca o crea la carpeta "MotoAtlas26" en el Drive del usuario
 * @returns {Promise<{id: string, name: string}>}
 */
export async function ensureMotoAtlas26Folder() {
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
    console.log('[Google Drive] Carpeta MotoAtlas26 encontrada:', existingFolder.id)
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
  console.log('[Google Drive] Carpeta MotoAtlas26 creada:', newFolder.id)
  return newFolder
}

/**
 * Busca o crea el archivo MotoAtlas26-db.json dentro de la carpeta MotoAtlas26
 * @param {string} folderId - ID de la carpeta MotoAtlas26
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
    console.log('[Google Drive] Archivo MotoAtlas26-db.json encontrado:', existingFile.id)
    return existingFile
  }

  // Crear archivo nuevo
  const createUrl = `${API_BASE}/files`
  const createResponse = await fetch(createUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      name: DB_FILE_NAME,
      parents: [folderId],
      mimeType: 'application/json'
    })
  })

  if (!createResponse.ok) {
    throw new Error(`Error al crear archivo: ${createResponse.statusText}`)
  }

  const newFile = await createResponse.json()
  console.log('[Google Drive] Archivo MotoAtlas26-db.json creado:', newFile.id)
  return newFile
}

/**
 * Lee el contenido del archivo MotoAtlas26-db.json desde Google Drive
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
    throw new Error(`Error al leer archivo: ${response.statusText}`)
  }

  const content = await response.json()
  console.log('[Google Drive] Contenido del archivo leído:', Object.keys(content).length, 'registros')
  return content
}

/**
 * Escribe el contenido del archivo MotoAtlas26-db.json en Google Drive
 * Si el archivo no existe, lo crea. Si existe, lo actualiza.
 * @param {string} fileId - ID del archivo (o null para crear nuevo)
 * @param {Object} data - Datos a guardar (exportAll())
 * @returns {Promise<{id: string, name: string}>}
 */
export async function writeDBFile(fileId, data) {
  if (!accessToken) {
    throw new Error('No hay token de acceso. Inicia sesión primero.')
  }

  const url = fileId ? `${API_BASE}/files/${fileId}` : `${API_BASE}/files`
  const method = fileId ? 'PATCH' : 'POST'

  const response = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify({
      name: DB_FILE_NAME,
      mimeType: 'application/json',
      ...(fileId ? {} : { parents: [fileId] }) // Solo para crear nuevo
    })
  })

  if (!response.ok) {
    throw new Error(`Error al escribir archivo: ${response.statusText}`)
  }

  const file = await response.json()
  console.log('[Google Drive] Archivo actualizado:', file.id)
  return file
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
  const folder = await ensureMotoAtlas26Folder()
  const file = await findOrCreateDBFile(folder.id)

  // Leer contenido
  const data = await readDBFile(file.id)

  // Importar en Dexie
  if (db.importAll) {
    await db.importAll(data)
    console.log('[Google Drive] Datos importados desde Drive')
  } else {
    throw new Error('db.importAll no está disponible. Asegúrate de usar la instancia de Dexie correcta.')
  }

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
    console.log('[Google Drive] Datos exportados para Drive:', Object.keys(data).length, 'registros')
  } else {
    throw new Error('db.exportAll no está disponible. Asegúrate de usar la instancia de Dexie correcta.')
  }

  // Buscar carpeta y archivo
  const folder = await ensureMotoAtlas26Folder()
  const file = await findOrCreateDBFile(folder.id)

  // Escribir en Drive
  const updatedFile = await writeDBFile(file.id, data)

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
    user: currentUser
  }
}

// Exportar funciones de utilidad
export { tokenClient, accessToken, currentUser }
