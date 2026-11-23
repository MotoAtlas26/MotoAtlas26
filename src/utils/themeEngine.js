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
 * Calcula el color de contraste basado en luminancia (WCAG)
 * @param {string} hex - Color en formato hex
 * @returns {string} '#0D0D0F' para colores claros, '#FFFFFF' para colores oscuros
 */
function getContrastColor(hex) {
  const clean = hex.replace('#', '')
  const bigint = parseInt(clean, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  const a = [r, g, b].map(v => {
    v /= 255
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  })
  const lum = a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
  return lum > 0.5 ? '#0D0D0F' : '#FFFFFF'
}

/**
 * Genera los 3 tokens principales (primary, secondary, tertiary) desde swatches
 * Orden estricto: swatches[0]=primary, swatches[1]=secondary, swatches[2]=tertiary
 * @param {Array<string>} swatches - Array de 3 colores hex
 * @param {string} mode - 'dark' | 'light'
 * @returns {Object} Tokens con color, contrast y border para cada uno
 */
function generateMainTokensFromSwatches(swatches, mode = 'dark') {
  const primary = swatches?.[0] || '#D2B474'
  const secondary = swatches?.[1] || '#E07A5F'
  const tertiary = swatches?.[2] || '#3D5A80'
  
  const primaryContrast = getContrastColor(primary)
  const secondaryContrast = getContrastColor(secondary)
  const tertiaryContrast = getContrastColor(tertiary)
  
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
  
  // Tertiary border: visible outline when tertiary is white or black
  // Dark mode: rgba(255,255,255,0.22) | Light mode: rgba(0,0,0,0.18)
  const tertiaryBorder = mode === 'dark' 
    ? 'rgba(255,255,255,0.22)' 
    : 'rgba(0,0,0,0.18)'
  
  return {
    '--color-primary': primary,
    '--color-primary-light': adjustColor(primary, mode === 'dark' ? 0.2 : 0.1),
    '--color-primary-dark': adjustColor(primary, mode === 'dark' ? -0.2 : -0.15),
    '--color-primary-contrast': primaryContrast,
    '--color-secondary': secondary,
    '--color-secondary-light': adjustColor(secondary, mode === 'dark' ? 0.15 : 0.1),
    '--color-secondary-contrast': secondaryContrast,
    '--color-tertiary': tertiary,
    '--color-tertiary-light': adjustColor(tertiary, mode === 'dark' ? 0.15 : 0.1),
    '--color-tertiary-contrast': tertiaryContrast,
    '--color-tertiary-border': tertiaryBorder,
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
  
  const tokens = theme[mode]
  
  // Siempre generar los 3 tokens principales desde swatches (consistencia predefinidos + personalizados)
  const mainTokens = generateMainTokensFromSwatches(theme.swatches, mode)
  
  // Merge: tokens del tema (superficies, texto, alertas) + mainTokens calculados (prioridad)
  const enhancedTokens = { ...tokens, ...mainTokens }
  
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
        const tokens = customTheme[mode]
        if (tokens) {
          // Apply main tokens from swatches for consistency
          const mainTokens = generateMainTokensFromSwatches(customTheme.swatches, mode)
          applyTokensToDocument({ ...tokens, ...mainTokens }, themeId, mode)
          return
        }
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
    if (defaultTheme && defaultTheme.dark) {
      const mainTokens = generateMainTokensFromSwatches(defaultTheme.swatches, 'dark')
      applyTokensToDocument({ ...defaultTheme.dark, ...mainTokens }, 'motoatlas26', 'dark')
    } else {
      // Ultimate fallback - hardcoded minimal tokens
      applyTokensToDocument({
        '--color-canvas': '#0D0D0F',
        '--color-sidebar': '#121214',
        '--color-card': '#191A1D',
        '--color-card-border': '#2B2C30',
        '--color-text-primary': '#F2F2F3',
        '--color-text-secondary': '#8E9096',
        '--color-primary': '#D2B474',
        '--color-primary-contrast': '#0D0D0F',
        '--color-secondary': '#E07A5F',
        '--color-secondary-contrast': '#FFFFFF',
        '--color-tertiary': '#3D5A80',
        '--color-tertiary-contrast': '#FFFFFF',
        '--color-tertiary-border': 'rgba(255,255,255,0.22)',
      }, 'motoatlas26', 'dark')
    }
    return
  }
  
  const tokens = theme[mode]
  if (!tokens) {
    // Mode not found, fallback to dark
    const darkTokens = theme.dark
    if (darkTokens) {
      const mainTokens = generateMainTokensFromSwatches(theme.swatches, 'dark')
      applyTokensToDocument({ ...darkTokens, ...mainTokens }, themeId, 'dark')
    }
    return
  }
  
  const mainTokens = generateMainTokensFromSwatches(theme.swatches, mode)
  applyTokensToDocument({ ...tokens, ...mainTokens }, themeId, mode)
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
 * Establece el modo explícitamente
 * @param {string} currentThemeId - ID del tema actual
 * @param {string} mode - 'dark' | 'light'
 * @returns {Promise<void>}
 */
export async function setMode(currentThemeId, mode) {
  await applyThemeToDocument(currentThemeId, mode)
}

/**
 * Verifica si el tema activo actual es un tema personalizado que ya no existe
 * Si es así, vuelve al tema por defecto
 * @returns {Promise<boolean>} true si se restableció al tema por defecto
 */
export async function validateActiveTheme() {
  const { themeId, mode } = getSavedTheme()
  
  if (themeId.startsWith('custom-')) {
    const customId = parseInt(themeId.replace('custom-', ''))
    try {
      const exists = await db.customThemes.get(customId)
      if (!exists) {
        // Custom theme was deleted, reset to default
        await applyThemeToDocument('motoatlas26', mode)
        return true
      }
    } catch (e) {
      console.warn('Error validating custom theme:', e)
    }
  }
  
  return false
}

/**
 * Actualiza el tema activo si se ha editado el tema personalizado actual
 * @returns {Promise<void>}
 */
export async function refreshActiveCustomTheme() {
  const { themeId, mode } = getSavedTheme()
  
  if (themeId.startsWith('custom-')) {
    const customId = parseInt(themeId.replace('custom-', ''))
    try {
      const updatedTheme = await db.customThemes.get(customId)
      if (updatedTheme) {
        // Re-apply with updated data
        await applyThemeToDocument(themeId, mode)
      }
    } catch (e) {
      console.warn('Error refreshing custom theme:', e)
    }
  }
}

export { getThemeById } from '../constants/themes'
export { getThemesList } from '../constants/themes'