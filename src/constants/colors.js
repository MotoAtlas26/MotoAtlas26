// Colores oficiales CFMoto 800MT-X (Dashboard Dorado)
// Fuente: estilos/dashboard.jpg - Paleta exacta
// RE-EXPORT from themes.js for backward compatibility
// Default theme: CFMOTO Gold (dark mode) - synchronous fallback for predefined theme

import { THEMES } from './themes'

// Synchronous lookup for predefined themes only (no Dexie needed)
function getPredefinedThemeById(id) {
  return THEMES.find(t => t.id === id)
}

const defaultTheme = getPredefinedThemeById('cfmoto-gold')
const dark = defaultTheme?.dark || {}

export const MOTOATLAS26_CANVAS = dark['--color-canvas'] || '#0D0D0F'
export const MOTOATLAS26_SIDEBAR = dark['--color-sidebar'] || '#121214'
export const MOTOATLAS26_CARD = dark['--color-card'] || '#191A1D'
export const MOTOATLAS26_CARD_BORDER = dark['--color-card-border'] || '#2B2C30'
export const MOTOATLAS26_GOLD = dark['--color-primary'] || '#D2B474'
export const MOTOATLAS26_GOLD_LIGHT = dark['--color-primary-light'] || '#EFE1C6'
export const MOTOATLAS26_ORANGE = dark['--color-secondary'] || '#D96B27'
export const MOTOATLAS26_ALERT_BG = dark['--color-alert-bg'] || '#291B14'
export const MOTOATLAS26_TEXT_PRIMARY = dark['--color-text-primary'] || '#F2F2F3'
export const MOTOATLAS26_TEXT_SECONDARY = dark['--color-text-secondary'] || '#8E9096'

// Variantes derivadas
export const MOTOATLAS26_GOLD_DARK = dark['--color-primary-dark'] || '#B8935A'
export const MOTOATLAS26_GOLD_GLOW = `rgba(210, 180, 116, 0.5)`
export const MOTOATLAS26_GOLD_GLOW_STRONG = `rgba(210, 180, 116, 0.6)`
export const MOTOATLAS26_NEUTRAL_LIGHT = '#A0A5A2'
export const MOTOATLAS26_NEUTRAL_DARK = '#6E726F'

export default {
  MOTOATLAS26_CANVAS,
  MOTOATLAS26_SIDEBAR,
  MOTOATLAS26_CARD,
  MOTOATLAS26_CARD_BORDER,
  MOTOATLAS26_GOLD,
  MOTOATLAS26_GOLD_LIGHT,
  MOTOATLAS26_ORANGE,
  MOTOATLAS26_ALERT_BG,
  MOTOATLAS26_TEXT_PRIMARY,
  MOTOATLAS26_TEXT_SECONDARY,
  MOTOATLAS26_GOLD_DARK,
  MOTOATLAS26_GOLD_GLOW,
  MOTOATLAS26_GOLD_GLOW_STRONG,
  MOTOATLAS26_NEUTRAL_LIGHT,
  MOTOATLAS26_NEUTRAL_DARK,
}