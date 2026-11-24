/**
 * MotoAtlas26 — Single Source of Truth for Themes
 * Cada tema define swatches [Principal, Secundario, Acento] y tokens completos para dark/light
 * Orden: MotoAtlas26 (default) + 13 marcas ordenadas alfabéticamente A-Z
 */

import { db } from '../services/db'

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
 * Genera tokens de tema base (superficies, texto, alertas) para dark/light
 * @param {string} mode - 'dark' | 'light'
 * @returns {Object} Tokens base
 */
function getBaseTokens(mode) {
  if (mode === 'dark') {
    return {
      // Surfaces
      '--color-canvas': '#0D0D0F',
      '--color-sidebar': '#121214',
      '--color-card': '#191A1D',
      '--color-card-border': '#2B2C30',
      '--color-card-hover': '#25272C',
      // Text
      '--color-text-primary': '#F2F2F3',
      '--color-text-secondary': '#8E9096',
      '--color-text-muted': '#6E726F',
      // Alerts (base, will be overridden by theme-specific)
      '--color-alert-bg': '#2E1A0A',
      '--color-alert-border': '#FF6600',
      '--color-success-bg': '#1A2E1A',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#2E1A1A',
      '--color-error-border': '#C62828',
    }
  } else {
    return {
      // Surfaces (light variants)
      '--color-canvas': '#F8F8FA',
      '--color-sidebar': '#FFFFFF',
      '--color-card': '#FFFFFF',
      '--color-card-border': '#E0E0E3',
      '--color-card-hover': '#F0F0F2',
      // Text
      '--color-text-primary': '#0D0D0F',
      '--color-text-secondary': '#3E3E42',
      '--color-text-muted': '#6E726F',
      // Alerts
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
 * Genera tokens de acento (primary, secondary, tertiary) desde swatches
 * @param {Array<string>} swatches - Array de 3 colores hex [primary, secondary, tertiary]
 * @param {string} mode - 'dark' | 'light'
 * @returns {Object} Tokens de acento con contrastes y border
 */
function generateAccentTokens(swatches, mode) {
  const primary = swatches[0]
  const secondary = swatches[1]
  const tertiary = swatches[2]

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
    '--color-tertiary': tertiary,
    '--color-tertiary-light': adjustColor(tertiary, mode === 'dark' ? 0.15 : 0.1),
    '--color-tertiary-contrast': tertiaryContrast,
    '--color-tertiary-border': tertiaryBorder,
  }
}

/**
 * Crea un tema completo combinando base + acentos
 */
function createTheme(id, name, brand, swatches, group) {
  return {
    id,
    name,
    brand,
    swatches,
    group,
    dark: { ...getBaseTokens('dark'), ...generateAccentTokens(swatches, 'dark') },
    light: { ...getBaseTokens('light'), ...generateAccentTokens(swatches, 'light') },
  }
}

// 14 TEMAS OFICIALES - MotoAtlas26 (default) + 13 marcas A-Z
export const THEMES = [
  // 1. MotoAtlas26 (DEFAULT) - Grupo Original
  createTheme(
    'motoatlas26',
    'MotoAtlas26',
    'MotoAtlas',
    ['#D2B474', '#64748B', '#3D5A80'],
    'original'
  ),
  // 2. Aprilia - Grupo Marcas
  createTheme(
    'aprilia',
    'Aprilia',
    'Aprilia',
    ['#E30613', '#111111', '#6A0DAD'],
    'marcas'
  ),
  // 3. BMW - Grupo Marcas
  createTheme(
    'bmw',
    'BMW',
    'BMW',
    ['#0066B1', '#003D78', '#E22718'],
    'marcas'
  ),
  // 4. CFMOTO - Grupo Marcas
  createTheme(
    'cfmoto',
    'CFMOTO',
    'CFMOTO',
    ['#009BB4', '#000000', '#E6007E'],
    'marcas'
  ),
  // 5. Ducati - Grupo Marcas
  createTheme(
    'ducati',
    'Ducati',
    'Ducati',
    ['#D5001C', '#FFFFFF', '#1A1A1A'],
    'marcas'
  ),
  // 6. Harley-Davidson - Grupo Marcas
  createTheme(
    'harley-davidson',
    'Harley-Davidson',
    'Harley-Davidson',
    ['#FF6600', '#111111', '#FFFFFF'],
    'marcas'
  ),
  // 7. Honda - Grupo Marcas
  createTheme(
    'honda',
    'Honda',
    'Honda',
    ['#CC0000', '#003399', '#FFFFFF'],
    'marcas'
  ),
  // 8. Kawasaki - Grupo Marcas
  createTheme(
    'kawasaki',
    'Kawasaki',
    'Kawasaki',
    ['#66CC00', '#111111', '#FFFFFF'],
    'marcas'
  ),
  // 9. KOVE - Grupo Marcas
  createTheme(
    'kove',
    'KOVE',
    'KOVE',
    ['#00A9B4', '#FFFFFF', '#D81E28'],
    'marcas'
  ),
  // 10. KTM - Grupo Marcas
  createTheme(
    'ktm',
    'KTM',
    'KTM',
    ['#FF6600', '#111111', '#FFFFFF'],
    'marcas'
  ),
  // 11. Suzuki - Grupo Marcas
  createTheme(
    'suzuki',
    'Suzuki',
    'Suzuki',
    ['#0055B8', '#FFFFFF', '#DFFF00'],
    'marcas'
  ),
  // 12. Triumph - Grupo Marcas
  createTheme(
    'triumph',
    'Triumph',
    'Triumph',
    ['#FF3850', '#000000', '#C5A059'],
    'marcas'
  ),
  // 13. VOGE - Grupo Marcas
  createTheme(
    'voge',
    'VOGE',
    'VOGE',
    ['#111111', '#9D9D9E', '#FFEC00'],
    'marcas'
  ),
  // 14. Yamaha - Grupo Marcas
  createTheme(
    'yamaha',
    'Yamaha',
    'Yamaha',
    ['#0033A0', '#FFFFFF', '#111111'],
    'marcas'
  ),
]

/**
 * Genera tokens de tema completos a partir de 3 colores base (swatches) para temas personalizados
 * @param {Object} customTheme - { primaryColor, secondaryColor, tertiaryColor, swatches }
 * @returns {Object} Tema con estructura dark/light completa
 */
function generateCustomThemeTokens(customTheme) {
  const primary = customTheme.primaryColor || customTheme.swatches?.[0] || '#D2B474'
  const secondary = customTheme.secondaryColor || customTheme.swatches?.[1] || '#64748B'
  const tertiary = customTheme.tertiaryColor || customTheme.swatches?.[2] || '#3D5A80'

  const swatches = [primary, secondary, tertiary]

  return {
    id: `custom-${customTheme.id}`,
    name: customTheme.name,
    brand: customTheme.brand || 'Personalizado',
    swatches,
    group: 'personalizados',
    dark: { ...getBaseTokens('dark'), ...generateAccentTokens(swatches, 'dark') },
    light: { ...getBaseTokens('light'), ...generateAccentTokens(swatches, 'light') },
  }
}

/**
 * Obtiene un tema por ID (predefinido o personalizado desde Dexie)
 * @param {string} id - ID del tema
 * @returns {Promise<Object|null>} Tema completo o null
 */
export async function getThemeById(id) {
  // Primero buscar en temas predefinidos
  const predefined = THEMES.find(t => t.id === id)
  if (predefined) return predefined

  // Si es tema personalizado (custom-<id>), buscar en Dexie
  if (id.startsWith('custom-')) {
    const customId = id.replace('custom-', '')
    try {
      const customTheme = await db.customThemes.get(customId)
      if (customTheme) {
        return generateCustomThemeTokens(customTheme)
      }
    } catch (error) {
      console.error('Error fetching custom theme:', error)
    }
  }

  return null
}

/**
 * Obtiene todos los temas personalizados desde Dexie
 * @returns {Promise<Array>} Array de temas personalizados formateados
 */
export async function getCustomThemes() {
  try {
    const themes = await db.customThemes.toArray()
    return themes.map(t => generateCustomThemeTokens(t))
  } catch (error) {
    console.error('Error fetching custom themes:', error)
    return []
  }
}

/**
 * Obtiene el tema por defecto (MotoAtlas26)
 * @returns {Object} Tema por defecto
 */
export function getDefaultTheme() {
  return THEMES[0] // MotoAtlas26
}

/**
 * Obtiene la lista de temas predefinidos (para selector)
 * @returns {Array} Array de temas predefinidos
 */
export function getThemesList() {
  return THEMES
}