/**
 * MotoAtlas26 — Dynamic CSS Custom Property Engine + Persistence
 * Aplica temas al documento y persiste en localStorage + IndexedDB (Dexie)
 */

import { getThemeById, THEMES, getDefaultTheme } from '../constants/themes'
import { db } from '../services/db'

const STORAGE_KEY_THEME = 'colorTheme'
const STORAGE_KEY_MODE = 'themeMode' // 'dark' | 'light'
const STORAGE_KEY_CUSTOM_THEME = 'activeCustomTheme' // Stores full custom theme data for sync init

/**
 * Legacy variable mapping: semantic token -> legacy variable name
 * These are set directly on documentElement.style so they take precedence over CSS aliases
 */
const LEGACY_VAR_MAP = {
  '--color-primary': '--gold',
  '--color-primary-light': '--gold-light',
  '--color-primary-dark': '--gold-dark',
  '--color-secondary': '--orange',
  '--color-secondary-light': '--orange-light',
  '--color-canvas': '--canvas',
  '--color-sidebar': '--sidebar',
  '--color-card': '--card',
  '--color-card-border': '--card-border',
  '--color-card-hover': '--card-hover',
  '--color-text-primary': '--text-primary',
  '--color-text-secondary': '--text-secondary',
  '--color-text-muted': '--text-muted',
  '--color-alert-bg': '--alert-bg',
  '--color-alert-border': '--alert-border',
}

/**
 * Aplica tokens de tema al documento (síncrono, sin flash)
 * @param {Object} tokens - Objeto con propiedades CSS
 * @param {string} themeId - ID del tema
 * @param {string} mode - 'dark' | 'light'
 */
function applyTokensToDocument(tokens, themeId, mode) {
  // Defensive guard: tokens must be a valid object
  if (!tokens || typeof tokens !== 'object') {
    console.warn('applyTokensToDocument: invalid tokens, skipping', { tokens, themeId, mode })
    return
  }
  
  const root = document.documentElement
  
  Object.entries(tokens).forEach(([prop, value]) => {
    root.style.setProperty(prop, value)
    if (LEGACY_VAR_MAP[prop]) {
      root.style.setProperty(LEGACY_VAR_MAP[prop], value)
    }
  })
  
  root.setAttribute('data-theme', themeId)
  root.setAttribute('data-mode', mode)
}

/**
 * Calcula la luminancia relativa WCAG 2.1 de un color hex
 * @param {string} hex - Color en formato hex (#RRGGBB)
 * @returns {number} Luminancia relativa (0-1)
 */
function getRelativeLuminance(hex) {
  const clean = hex.replace('#', '')
  const bigint = parseInt(clean, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  const a = [r, g, b].map(v => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
}

/**
 * Calcula el color de contraste basado en luminancia (WCAG)
 * @param {string} hex - Color en formato hex
 * @returns {string} '#111111' para colores claros (L > 0.42), '#FFFFFF' para colores oscuros (L <= 0.42)
 */
function getContrastColor(hex) {
  const lum = getRelativeLuminance(hex)
  return lum > 0.42 ? '#111111' : '#FFFFFF'
}

/**
 * Calcula el color de borde visible para colores extremos
 * @param {string} hex - Color en formato hex
 * @param {string} mode - 'dark' | 'light'
 * @returns {string} CSS border value
 */
function getBorderColor(hex, mode) {
  const lum = getRelativeLuminance(hex)
  
  if (mode === 'dark') {
    // En modo oscuro: si el color es muy oscuro (L < 0.08), usar borde visible
    if (lum < 0.08) {
      return '1.5px solid #525866'
    }
    return '1px solid rgba(255,255,255,0.14)'
  } else {
    // En modo claro: si el color es muy claro (L > 0.85), usar borde visible
    if (lum > 0.85) {
      return '1.5px solid #9CA3AF'
    }
    return '1px solid rgba(0,0,0,0.12)'
  }
}

/**
 * Calcula color de texto seguro sobre fondo neutro (canvas/card)
 * Si el color de marca tiene contraste < 3.5:1 sobre el fondo neutro, lo sustituye
 * @param {string} hex - Color de marca
 * @param {string} mode - 'dark' | 'light'
 * @returns {string} Color seguro para texto/iconos sobre fondo neutro
 */
function getSafeTextColor(hex, mode) {
  const lum = getRelativeLuminance(hex)
  
  if (mode === 'dark') {
    // Fondo oscuro (#0D0D0F / #16171B) - luminancia ~0.005
    // Contraste = (L_text + 0.05) / (L_bg + 0.05)
    // Para 3.5:1 necesitamos L_text >= 0.175 aprox
    // Colores muy oscuros (L < 0.15) no tienen suficiente contraste
    if (lum < 0.15) {
      return '#F2F2F3' // Blanco suave para modo oscuro
    }
    return hex // El color original tiene suficiente contraste
  } else {
    // Fondo claro (#F4F5F7 / #FFFFFF) - luminancia ~0.92
    // Para 3.5:1 necesitamos L_text <= 0.26 aprox
    // Colores muy claros (L > 0.75) no tienen suficiente contraste
    if (lum > 0.75) {
      return '#18191C' // Negro suave para modo claro
    }
    return hex // El color original tiene suficiente contraste
  }
}

/**
 * Genera los 3 tokens principales (primary, secondary, tertiary) desde swatches
 * Orden estricto: swatches[0]=primary, swatches[1]=secondary, swatches[2]=tertiary
 * @param {Array<string>} swatches - Array de 3 colores hex
 * @param {string} mode - 'dark' | 'light'
 * @returns {Object} Tokens con color, contrast, border y safe-text para cada uno
 */
function generateMainTokensFromSwatches(swatches, mode = 'dark') {
  const primary = swatches?.[0] || '#D2B474'
  const secondary = swatches?.[1] || '#E07A5F'
  const tertiary = swatches?.[2] || '#3D5A80'
  
  const primaryContrast = getContrastColor(primary)
  const secondaryContrast = getContrastColor(secondary)
  const tertiaryContrast = getContrastColor(tertiary)
  
  const primaryBorder = getBorderColor(primary, mode)
  const secondaryBorder = getBorderColor(secondary, mode)
  const tertiaryBorder = getBorderColor(tertiary, mode)
  
  const primaryText = getSafeTextColor(primary, mode)
  const secondaryText = getSafeTextColor(secondary, mode)
  const tertiaryText = getSafeTextColor(tertiary, mode)
  
  // Helper to lighten/darken a color
  const adjustColor = (hex, amount) => {
    const clean = hex.replace('#', '')
    const bigint = parseInt(clean, 16)
    const r = (bigint >> 16) & 255
    const g = (bigint >> 8) & 255
    const b = bigint & 255
    return '#' + [r, g, b].map(c => {
      const adjusted = Math.round(Math.min(255, Math.max(0, c + amount * 255)))
      return adjusted.toString(16).padStart(2, '0')
    }).join('')
  }
  
  return {
    // Primary (Color 1 - Marca principal)
    '--color-primary': primary,
    '--color-primary-light': adjustColor(primary, mode === 'dark' ? 0.2 : 0.1),
    '--color-primary-dark': adjustColor(primary, mode === 'dark' ? -0.2 : -0.15),
    '--color-primary-contrast': primaryContrast,
    '--color-primary-border': primaryBorder,
    '--color-primary-text': primaryText,
    
    // Secondary (Color 2 - Marca secundaria)
    '--color-secondary': secondary,
    '--color-secondary-light': adjustColor(secondary, mode === 'dark' ? 0.15 : 0.1),
    '--color-secondary-dark': adjustColor(secondary, mode === 'dark' ? -0.15 : -0.1),
    '--color-secondary-contrast': secondaryContrast,
    '--color-secondary-border': secondaryBorder,
    '--color-secondary-text': secondaryText,
    
    // Tertiary (Color 3 - Acento / Google Drive / Nube)
    '--color-tertiary': tertiary,
    '--color-tertiary-light': adjustColor(tertiary, mode === 'dark' ? 0.15 : 0.1),
    '--color-tertiary-dark': adjustColor(tertiary, mode === 'dark' ? -0.15 : -0.1),
    '--color-tertiary-contrast': tertiaryContrast,
    '--color-tertiary-border': tertiaryBorder,
    '--color-tertiary-text': tertiaryText,
  }
}

/**
 * Genera tokens neutros estrictos según modo
 * @param {string} mode - 'dark' | 'light'
 * @returns {Object} Tokens neutros
 */
function generateNeutralTokens(mode) {
  if (mode === 'dark') {
    return {
      '--color-canvas': '#0D0D0F',
      '--color-sidebar': '#121214',
      '--color-card': '#16171B',
      '--color-card-border': '#2A2D35',
      '--color-card-hover': '#1E2026',
      '--color-input-bg': '#1E2026',
      '--color-text-primary': '#F2F2F3',
      '--color-text-secondary': '#A1A7B3',
      '--color-text-muted': '#6E726F',
      '--color-alert-bg': '#2E1A0A',
      '--color-alert-border': '#FF6600',
      '--color-success-bg': '#1A2E1A',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#2E1A1A',
      '--color-error-border': '#C62828',
    }
  } else {
    return {
      '--color-canvas': '#F4F5F7',
      '--color-sidebar': '#FFFFFF',
      '--color-card': '#FFFFFF',
      '--color-card-border': '#DCDFE4',
      '--color-card-hover': '#EBEDF0',
      '--color-input-bg': '#FFFFFF',
      '--color-text-primary': '#18191C',
      '--color-text-secondary': '#525866',
      '--color-text-muted': '#8E9096',
      '--color-alert-bg': '#FFF3E0',
      '--color-alert-border': '#CC5200',
      '--color-success-bg': '#E8F5E9',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#FDEDEC',
      '--color-error-border': '#C62828',
    }
  }
}

/**
 * Aplica un tema al documento y persiste la selección
 * @param {string} themeId - ID del tema (ej: 'motoatlas-gold', 'custom-1')
 * @param {string} mode - 'dark' | 'light'
 * @returns {Promise<boolean>} true si se aplicó correctamente
 */
export async function applyThemeToDocument(themeId, mode = 'dark') {
  const theme = await getThemeById(themeId)
  if (!theme) return false
  
  // Generar tokens neutros estrictos según modo
  const neutralTokens = generateNeutralTokens(mode)
  
  // Siempre generar los 3 tokens principales desde swatches (consistencia predefinidos + personalizados)
  const mainTokens = generateMainTokensFromSwatches(theme.swatches, mode)
  
  // Merge: neutralTokens (base) + mainTokens calculados (prioridad)
  const enhancedTokens = { ...neutralTokens, ...mainTokens }
  
  // Apply tokens synchronously
  applyTokensToDocument(enhancedTokens, themeId, mode)
  
  // Persist to localStorage (synchronous, immediate)
  localStorage.setItem(STORAGE_KEY_THEME, themeId)
  localStorage.setItem(STORAGE_KEY_MODE, mode)
  
  // If it's a custom theme, also store the full theme data for sync init
  if (themeId.startsWith('custom-')) {
    const customThemeData = {
      id: theme.id,
      name: theme.name,
      brand: theme.brand,
      swatches: theme.swatches,
      dark: theme.dark,
      light: theme.light
    }
    localStorage.setItem(STORAGE_KEY_CUSTOM_THEME, JSON.stringify(customThemeData))
  } else {
    // Clear custom theme data if switching to predefined theme
    localStorage.removeItem(STORAGE_KEY_CUSTOM_THEME)
  }
  
  // Persist to Dexie settings (async, fire-and-forget)
  try {
    await db.setSetting('colorTheme', themeId)
    await db.setSetting('themeMode', mode)
  } catch (error) {
    // Dexie might not be ready yet, but localStorage already saved
    console.debug('Theme persistence to Dexie deferred:', error.message)
  }
  
  return true
}

/**
 * Obtiene el tema guardado desde localStorage
 * @returns {{themeId: string, mode: string}}
 */
export function getSavedTheme() {
  return {
    themeId: localStorage.getItem(STORAGE_KEY_THEME) || 'motoatlas26',
    mode: localStorage.getItem(STORAGE_KEY_MODE) || 'dark'
  }
}

/**
 * Synchronous lookup for predefined themes only (no Dexie needed)
 * @param {string} id - Theme ID
 * @returns {Object|null} Theme object or null
 */
function getPredefinedThemeById(id) {
  return THEMES.find(t => t.id === id) || null
}

/**
 * Inicializa el tema al arrancar la app (antes de renderizar React)
 * Debe llamarse en main.jsx ANTES de ReactDOM.createRoot()
 * 100% síncrono - usa localStorage para temas personalizados
 */
export function initTheme() {
  const { themeId, mode } = getSavedTheme()
  
  // If it's a custom theme, try to load from localStorage first (sync)
  if (themeId.startsWith('custom-')) {
    const storedCustomTheme = localStorage.getItem(STORAGE_KEY_CUSTOM_THEME)
    if (storedCustomTheme) {
      try {
        const customTheme = JSON.parse(storedCustomTheme)
        const neutralTokens = generateNeutralTokens(mode)
        const mainTokens = generateMainTokensFromSwatches(customTheme.swatches, mode)
        applyTokensToDocument({ ...neutralTokens, ...mainTokens }, themeId, mode)
        return
      } catch (e) {
        console.warn('Failed to parse stored custom theme:', e)
      }
    }
  }
  
  // Synchronous lookup for predefined themes
  const theme = getPredefinedThemeById(themeId)
  
  if (!theme) {
    // Fallback to default theme (motoatlas26)
    const defaultTheme = getDefaultTheme()
    if (defaultTheme) {
      const neutralTokens = generateNeutralTokens('dark')
      const mainTokens = generateMainTokensFromSwatches(defaultTheme.swatches, 'dark')
      applyTokensToDocument({ ...neutralTokens, ...mainTokens }, 'motoatlas26', 'dark')
    } else {
      // Ultimate fallback - hardcoded minimal tokens
      const neutralTokens = generateNeutralTokens('dark')
      const mainTokens = generateMainTokensFromSwatches(['#D2B474', '#E07A5F', '#3D5A80'], 'dark')
      applyTokensToDocument({ ...neutralTokens, ...mainTokens }, 'motoatlas26', 'dark')
    }
    return
  }
  
  const neutralTokens = generateNeutralTokens(mode)
  const mainTokens = generateMainTokensFromSwatches(theme.swatches, mode)
  applyTokensToDocument({ ...neutralTokens, ...mainTokens }, themeId, mode)
}

/**
 * Alterna entre modo oscuro y claro manteniendo el tema actual
 * @param {string} currentThemeId - ID del tema actual
 * @returns {Promise<string>} Nuevo modo ('dark' | 'light')
 */
export async function toggleMode(currentThemeId) {
  const { mode } = getSavedTheme()
  const newMode = mode === 'dark' ? 'light' : 'dark'
  await applyThemeToDocument(currentThemeId, newMode)
  return newMode
}

/**
 * Valida que el tema activo sea compatible con el modo actual
 * Si no, regenera los tokens para el modo correcto
 * @param {string} themeId - ID del tema
 * @param {string} mode - 'dark' | 'light'
 * @returns {Promise<boolean>}
 */
export async function validateActiveTheme(themeId, mode) {
  const theme = await getThemeById(themeId)
  if (!theme) return false
  
  // Verificar si el tema tiene tokens para el modo actual
  if (!theme[mode]) {
    // Regenerar tokens para el modo correcto
    await applyThemeToDocument(themeId, mode)
    return true
  }
  return true
}

/**
 * Refresca el tema personalizado activo desde Dexie (para sync)
 * @returns {Promise<void>}
 */
export async function refreshActiveCustomTheme() {
  const { themeId, mode } = getSavedTheme()
  if (themeId.startsWith('custom-')) {
    try {
      const customTheme = await db.getSetting('activeCustomTheme')
      if (customTheme) {
        const neutralTokens = generateNeutralTokens(mode)
        const mainTokens = generateMainTokensFromSwatches(customTheme.swatches, mode)
        applyTokensToDocument({ ...neutralTokens, ...mainTokens }, themeId, mode)
      }
    } catch (e) {
      console.debug('Could not refresh custom theme from Dexie:', e.message)
    }
  }
}

/**
 * Obtiene lista de temas disponibles para UI
 * @returns {Promise<Array>} Array de temas con id, name, brand, swatches
 */
export async function getAvailableThemes() {
  const predefined = THEMES.map(t => ({
    id: t.id,
    name: t.name,
    brand: t.brand,
    swatches: t.swatches,
    group: t.group,
    isCustom: false
  }))
  
  // Add custom themes from Dexie
  try {
    const customThemes = await db.getAllCustomThemes()
    const custom = customThemes.map(t => ({
      id: t.id,
      name: t.name,
      brand: t.brand || 'Personalizado',
      swatches: t.swatches,
      group: 'custom',
      isCustom: true
    }))
    return [...predefined, ...custom]
  } catch (e) {
    return predefined
  }
}