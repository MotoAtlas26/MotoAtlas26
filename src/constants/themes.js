/**
 * MotoAtlas26 — Single Source of Truth for Themes
 * Cada tema define swatches [Primary, Base, Secondary] y tokens completos para dark/light
 */

import { db } from '../services/db'

export const THEMES = [
  {
    id: 'cfmoto-gold',
    name: 'CFMOTO Gold',
    brand: 'CFMoto',
    swatches: ['#D2B474', '#0D0D0F', '#D96B27'], // [Primary, Base, Secondary]
    dark: {
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
      // Accents (semantic mapping from swatches)
      '--color-primary': '#D2B474',      // swatches[0] - Primary accent
      '--color-primary-light': '#EFE1C6',
      '--color-primary-dark': '#B8935A',
      '--color-primary-contrast': '#0D0D0F',  // Text on primary (gold is light)
      '--color-secondary': '#D96B27',    // swatches[2] - Secondary accent
      '--color-secondary-light': '#F07E2E',
      // Alerts
      '--color-alert-bg': '#291B14',
      '--color-alert-border': '#D96B27',
      '--color-success-bg': '#1A2E1A',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#2E1A1A',
      '--color-error-border': '#C62828',
    },
    light: {
      // Surfaces (light variants)
      '--color-canvas': '#F8F8FA',
      '--color-sidebar': '#FFFFFF',
      '--color-card': '#FFFFFF',
      '--color-card-border': '#E0E0E3',
      '--color-card-hover': '#F0F0F2',
      // Text
      '--color-text-primary': '#1A1A1C',
      '--color-text-secondary': '#5E6066',
      '--color-text-muted': '#8E9096',
      // Accents (same hue, adjusted for light bg)
      '--color-primary': '#B8935A',
      '--color-primary-light': '#D2B474',
      '--color-primary-dark': '#9A7A4A',
      '--color-primary-contrast': '#0D0D0F',  // Text on primary (gold is light)
      '--color-secondary': '#CC6600',
      '--color-secondary-light': '#E67300',
      // Alerts
      '--color-alert-bg': '#FFF3E0',
      '--color-alert-border': '#CC6600',
      '--color-success-bg': '#E8F5E9',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#FDEDEC',
      '--color-error-border': '#C62828',
    }
  },
  {
    id: 'ktm-snow',
    name: 'KTM Snow',
    brand: 'KTM',
    swatches: ['#FF6600', '#FFFFFF', '#0D0D0F'], // [Primary (Orange), Base (White), Secondary (Dark)]
    dark: {
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
      // Accents - KTM Orange as primary, dark as secondary
      '--color-primary': '#FF6600',      // swatches[0] - KTM Orange
      '--color-primary-light': '#FF8533',
      '--color-primary-dark': '#CC5200',
      '--color-primary-contrast': '#0D0D0F',  // Text on primary (orange is light)
      '--color-secondary': '#0D0D0F',    // swatches[2] - Dark accent
      '--color-secondary-light': '#1A1A1D',
      // Alerts
      '--color-alert-bg': '#2E1A0A',
      '--color-alert-border': '#FF6600',
      '--color-success-bg': '#1A2E1A',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#2E1A1A',
      '--color-error-border': '#C62828',
    },
    light: {
      // Surfaces (light variants)
      '--color-canvas': '#FFFFFF',
      '--color-sidebar': '#F8F8FA',
      '--color-card': '#FFFFFF',
      '--color-card-border': '#E0E0E3',
      '--color-card-hover': '#F0F0F2',
      // Text - Dark text for readability on white
      '--color-text-primary': '#0D0D0F',
      '--color-text-secondary': '#3E3E42',
      '--color-text-muted': '#6E726F',
      // Accents - KTM Orange adjusted for light bg, dark as secondary
      '--color-primary': '#CC5200',      // Darker orange for contrast on white
      '--color-primary-light': '#E65C00',
      '--color-primary-dark': '#B34700',
      '--color-primary-contrast': '#FFFFFF',  // Text on primary (darker orange)
      '--color-secondary': '#0D0D0F',    // Dark as secondary accent
      '--color-secondary-light': '#1A1A1D',
      // Alerts
      '--color-alert-bg': '#FFF3E0',
      '--color-alert-border': '#CC5200',
      '--color-success-bg': '#E8F5E9',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#FDEDEC',
      '--color-error-border': '#C62828',
    }
  },
  {
    id: 'ktm-orange',
    name: 'KTM Orange',
    brand: 'KTM',
    swatches: ['#FF6600', '#0D0D0F', '#FFFFFF'], // [Primary (Orange), Base (Dark), Secondary (White)]
    dark: {
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
      // Accents
      '--color-primary': '#FF6600',
      '--color-primary-light': '#FF8533',
      '--color-primary-dark': '#CC5200',
      '--color-primary-contrast': '#0D0D0F',  // Text on primary (orange is light)
      '--color-secondary': '#FFFFFF',
      '--color-secondary-light': '#F2F2F3',
      // Alerts
      '--color-alert-bg': '#2E1A0A',
      '--color-alert-border': '#FF6600',
      '--color-success-bg': '#1A2E1A',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#2E1A1A',
      '--color-error-border': '#C62828',
    },
    light: {
      // Surfaces
      '--color-canvas': '#F8F8FA',
      '--color-sidebar': '#FFFFFF',
      '--color-card': '#FFFFFF',
      '--color-card-border': '#E0E0E3',
      '--color-card-hover': '#F0F0F2',
      // Text
      '--color-text-primary': '#0D0D0F',
      '--color-text-secondary': '#3E3E42',
      '--color-text-muted': '#6E726F',
      // Accents
      '--color-primary': '#CC5200',
      '--color-primary-light': '#E65C00',
      '--color-primary-dark': '#B34700',
      '--color-primary-contrast': '#FFFFFF',  // Text on primary (darker orange)
      '--color-secondary': '#FFFFFF',
      '--color-secondary-light': '#F2F2F3',
      // Alerts
      '--color-alert-bg': '#FFF3E0',
      '--color-alert-border': '#CC5200',
      '--color-success-bg': '#E8F5E9',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#FDEDEC',
      '--color-error-border': '#C62828',
    }
  },
  {
    id: 'yamaha-blue',
    name: 'Yamaha Blue',
    brand: 'Yamaha',
    swatches: ['#0033A0', '#0D0D0F', '#FFFFFF'], // [Primary (Blue), Base (Dark), Secondary (White)]
    dark: {
      '--color-canvas': '#0D0D0F',
      '--color-sidebar': '#121214',
      '--color-card': '#191A1D',
      '--color-card-border': '#2B2C30',
      '--color-card-hover': '#25272C',
      '--color-text-primary': '#F2F2F3',
      '--color-text-secondary': '#8E9096',
      '--color-text-muted': '#6E726F',
      '--color-primary': '#0033A0',
      '--color-primary-light': '#0044CC',
      '--color-primary-dark': '#002680',
      '--color-primary-contrast': '#FFFFFF',  // Text on primary (blue is dark)
      '--color-secondary': '#FFFFFF',
      '--color-secondary-light': '#F2F2F3',
      '--color-alert-bg': '#1A1A2E',
      '--color-alert-border': '#0033A0',
      '--color-success-bg': '#1A2E1A',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#2E1A1A',
      '--color-error-border': '#C62828',
    },
    light: {
      '--color-canvas': '#F8F8FA',
      '--color-sidebar': '#FFFFFF',
      '--color-card': '#FFFFFF',
      '--color-card-border': '#E0E0E3',
      '--color-card-hover': '#F0F0F2',
      '--color-text-primary': '#0D0D0F',
      '--color-text-secondary': '#3E3E42',
      '--color-text-muted': '#6E726F',
      '--color-primary': '#002680',
      '--color-primary-light': '#0033A0',
      '--color-primary-dark': '#001F66',
      '--color-primary-contrast': '#FFFFFF',  // Text on primary (blue is dark)
      '--color-secondary': '#FFFFFF',
      '--color-secondary-light': '#F2F2F3',
      '--color-alert-bg': '#E8EFFF',
      '--color-alert-border': '#002680',
      '--color-success-bg': '#E8F5E9',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#FDEDEC',
      '--color-error-border': '#C62828',
    }
  },
  {
    id: 'honda-red',
    name: 'Honda Red',
    brand: 'Honda',
    swatches: ['#E30012', '#0D0D0F', '#FFFFFF'], // [Primary (Red), Base (Dark), Secondary (White)]
    dark: {
      '--color-canvas': '#0D0D0F',
      '--color-sidebar': '#121214',
      '--color-card': '#191A1D',
      '--color-card-border': '#2B2C30',
      '--color-card-hover': '#25272C',
      '--color-text-primary': '#F2F2F3',
      '--color-text-secondary': '#8E9096',
      '--color-text-muted': '#6E726F',
      '--color-primary': '#E30012',
      '--color-primary-light': '#FF1A1A',
      '--color-primary-dark': '#B3000E',
      '--color-primary-contrast': '#FFFFFF',  // Text on primary (red is dark)
      '--color-secondary': '#FFFFFF',
      '--color-secondary-light': '#F2F2F3',
      '--color-alert-bg': '#2E1A1A',
      '--color-alert-border': '#E30012',
      '--color-success-bg': '#1A2E1A',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#2E1A1A',
      '--color-error-border': '#C62828',
    },
    light: {
      '--color-canvas': '#F8F8FA',
      '--color-sidebar': '#FFFFFF',
      '--color-card': '#FFFFFF',
      '--color-card-border': '#E0E0E3',
      '--color-card-hover': '#F0F0F2',
      '--color-text-primary': '#0D0D0F',
      '--color-text-secondary': '#3E3E42',
      '--color-text-muted': '#6E726F',
      '--color-primary': '#B3000E',
      '--color-primary-light': '#D60010',
      '--color-primary-dark': '#99000C',
      '--color-primary-contrast': '#FFFFFF',  // Text on primary (red is dark)
      '--color-secondary': '#FFFFFF',
      '--color-secondary-light': '#F2F2F3',
      '--color-alert-bg': '#FDEDEC',
      '--color-alert-border': '#B3000E',
      '--color-success-bg': '#E8F5E9',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#FDEDEC',
      '--color-error-border': '#C62828',
    }
  },
  {
    id: 'suzuki-blue',
    name: 'Suzuki Blue',
    brand: 'Suzuki',
    swatches: ['#00A3E0', '#0D0D0F', '#FFFFFF'], // [Primary (Blue), Base (Dark), Secondary (White)]
    dark: {
      '--color-canvas': '#0D0D0F',
      '--color-sidebar': '#121214',
      '--color-card': '#191A1D',
      '--color-card-border': '#2B2C30',
      '--color-card-hover': '#25272C',
      '--color-text-primary': '#F2F2F3',
      '--color-text-secondary': '#8E9096',
      '--color-text-muted': '#6E726F',
      '--color-primary': '#00A3E0',
      '--color-primary-light': '#33B5E8',
      '--color-primary-dark': '#0082B3',
      '--color-primary-contrast': '#0D0D0F',  // Text on primary (cyan is light)
      '--color-secondary': '#FFFFFF',
      '--color-secondary-light': '#F2F2F3',
      '--color-alert-bg': '#1A2E2E',
      '--color-alert-border': '#00A3E0',
      '--color-success-bg': '#1A2E1A',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#2E1A1A',
      '--color-error-border': '#C62828',
    },
    light: {
      '--color-canvas': '#F8F8FA',
      '--color-sidebar': '#FFFFFF',
      '--color-card': '#FFFFFF',
      '--color-card-border': '#E0E0E3',
      '--color-card-hover': '#F0F0F2',
      '--color-text-primary': '#0D0D0F',
      '--color-text-secondary': '#3E3E42',
      '--color-text-muted': '#6E726F',
      '--color-primary': '#0082B3',
      '--color-primary-light': '#0095CC',
      '--color-primary-dark': '#006E99',
      '--color-primary-contrast': '#FFFFFF',  // Text on primary (darker cyan)
      '--color-secondary': '#FFFFFF',
      '--color-secondary-light': '#F2F2F3',
      '--color-alert-bg': '#E0F7FF',
      '--color-alert-border': '#0082B3',
      '--color-success-bg': '#E8F5E9',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#FDEDEC',
      '--color-error-border': '#C62828',
    }
  },
  {
    id: 'kawasaki-green',
    name: 'Kawasaki Green',
    brand: 'Kawasaki',
    swatches: ['#00A651', '#0D0D0F', '#FFFFFF'], // [Primary (Green), Base (Dark), Secondary (White)]
    dark: {
      '--color-canvas': '#0D0D0F',
      '--color-sidebar': '#121214',
      '--color-card': '#191A1D',
      '--color-card-border': '#2B2C30',
      '--color-card-hover': '#25272C',
      '--color-text-primary': '#F2F2F3',
      '--color-text-secondary': '#8E9096',
      '--color-text-muted': '#6E726F',
      '--color-primary': '#00A651',
      '--color-primary-light': '#00CC66',
      '--color-primary-dark': '#008541',
      '--color-primary-contrast': '#0D0D0F',  // Text on primary (green is light)
      '--color-secondary': '#FFFFFF',
      '--color-secondary-light': '#F2F2F3',
      '--color-alert-bg': '#1A2E1A',
      '--color-alert-border': '#00A651',
      '--color-success-bg': '#1A2E1A',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#2E1A1A',
      '--color-error-border': '#C62828',
    },
    light: {
      '--color-canvas': '#F8F8FA',
      '--color-sidebar': '#FFFFFF',
      '--color-card': '#FFFFFF',
      '--color-card-border': '#E0E0E3',
      '--color-card-hover': '#F0F0F2',
      '--color-text-primary': '#0D0D0F',
      '--color-text-secondary': '#3E3E42',
      '--color-text-muted': '#6E726F',
      '--color-primary': '#008541',
      '--color-primary-light': '#00964A',
      '--color-primary-dark': '#006B35',
      '--color-primary-contrast': '#FFFFFF',  // Text on primary (darker green)
      '--color-secondary': '#FFFFFF',
      '--color-secondary-light': '#F2F2F3',
      '--color-alert-bg': '#E8F5E9',
      '--color-alert-border': '#008541',
      '--color-success-bg': '#E8F5E9',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#FDEDEC',
      '--color-error-border': '#C62828',
    }
  },
  {
    id: 'ducati-red',
    name: 'Ducati Red',
    brand: 'Ducati',
    swatches: ['#C3002F', '#0D0D0F', '#FFFFFF'], // [Primary (Red), Base (Dark), Secondary (White)]
    dark: {
      '--color-canvas': '#0D0D0F',
      '--color-sidebar': '#121214',
      '--color-card': '#191A1D',
      '--color-card-border': '#2B2C30',
      '--color-card-hover': '#25272C',
      '--color-text-primary': '#F2F2F3',
      '--color-text-secondary': '#8E9096',
      '--color-text-muted': '#6E726F',
      '--color-primary': '#C3002F',
      '--color-primary-light': '#E60036',
      '--color-primary-dark': '#9C0026',
      '--color-primary-contrast': '#FFFFFF',  // Text on primary (red is dark)
      '--color-secondary': '#FFFFFF',
      '--color-secondary-light': '#F2F2F3',
      '--color-alert-bg': '#2E1A1A',
      '--color-alert-border': '#C3002F',
      '--color-success-bg': '#1A2E1A',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#2E1A1A',
      '--color-error-border': '#C62828',
    },
    light: {
      '--color-canvas': '#F8F8FA',
      '--color-sidebar': '#FFFFFF',
      '--color-card': '#FFFFFF',
      '--color-card-border': '#E0E0E3',
      '--color-card-hover': '#F0F0F2',
      '--color-text-primary': '#0D0D0F',
      '--color-text-secondary': '#3E3E42',
      '--color-text-muted': '#6E726F',
      '--color-primary': '#9C0026',
      '--color-primary-light': '#B3002B',
      '--color-primary-dark': '#80001F',
      '--color-primary-contrast': '#FFFFFF',  // Text on primary (red is dark)
      '--color-secondary': '#FFFFFF',
      '--color-secondary-light': '#F2F2F3',
      '--color-alert-bg': '#FDEDEC',
      '--color-alert-border': '#9C0026',
      '--color-success-bg': '#E8F5E9',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#FDEDEC',
      '--color-error-border': '#C62828',
    }
  },
  {
    id: 'bmw-blue',
    name: 'BMW Blue',
    brand: 'BMW',
    swatches: ['#0054A6', '#0D0D0F', '#FFFFFF'], // [Primary (Blue), Base (Dark), Secondary (White)]
    dark: {
      '--color-canvas': '#0D0D0F',
      '--color-sidebar': '#121214',
      '--color-card': '#191A1D',
      '--color-card-border': '#2B2C30',
      '--color-card-hover': '#25272C',
      '--color-text-primary': '#F2F2F3',
      '--color-text-secondary': '#8E9096',
      '--color-text-muted': '#6E726F',
      '--color-primary': '#0054A6',
      '--color-primary-light': '#0066CC',
      '--color-primary-dark': '#004385',
      '--color-primary-contrast': '#FFFFFF',  // Text on primary (blue is dark)
      '--color-secondary': '#FFFFFF',
      '--color-secondary-light': '#F2F2F3',
      '--color-alert-bg': '#1A1A2E',
      '--color-alert-border': '#0054A6',
      '--color-success-bg': '#1A2E1A',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#2E1A1A',
      '--color-error-border': '#C62828',
    },
    light: {
      '--color-canvas': '#F8F8FA',
      '--color-sidebar': '#FFFFFF',
      '--color-card': '#FFFFFF',
      '--color-card-border': '#E0E0E3',
      '--color-card-hover': '#F0F0F2',
      '--color-text-primary': '#0D0D0F',
      '--color-text-secondary': '#3E3E42',
      '--color-text-muted': '#6E726F',
      '--color-primary': '#004385',
      '--color-primary-light': '#0054A6',
      '--color-primary-dark': '#00366B',
      '--color-primary-contrast': '#FFFFFF',  // Text on primary (blue is dark)
      '--color-secondary': '#FFFFFF',
      '--color-secondary-light': '#F2F2F3',
      '--color-alert-bg': '#E8EFFF',
      '--color-alert-border': '#004385',
      '--color-success-bg': '#E8F5E9',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#FDEDEC',
      '--color-error-border': '#C62828',
    }
  },
  {
    id: 'triumph-black',
    name: 'Triumph Black',
    brand: 'Triumph',
    swatches: ['#B8860B', '#0D0D0F', '#FFFFFF'], // [Primary (Gold), Base (Dark), Secondary (White)]
    dark: {
      '--color-canvas': '#0D0D0F',
      '--color-sidebar': '#121214',
      '--color-card': '#191A1D',
      '--color-card-border': '#2B2C30',
      '--color-card-hover': '#25272C',
      '--color-text-primary': '#F2F2F3',
      '--color-text-secondary': '#8E9096',
      '--color-text-muted': '#6E726F',
      '--color-primary': '#B8860B',
      '--color-primary-light': '#DAA520',
      '--color-primary-dark': '#926B09',
      '--color-primary-contrast': '#0D0D0F',  // Text on primary (gold is light)
      '--color-secondary': '#FFFFFF',
      '--color-secondary-light': '#F2F2F3',
      '--color-alert-bg': '#2E240A',
      '--color-alert-border': '#B8860B',
      '--color-success-bg': '#1A2E1A',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#2E1A1A',
      '--color-error-border': '#C62828',
    },
    light: {
      '--color-canvas': '#F8F8FA',
      '--color-sidebar': '#FFFFFF',
      '--color-card': '#FFFFFF',
      '--color-card-border': '#E0E0E3',
      '--color-card-hover': '#F0F0F2',
      '--color-text-primary': '#0D0D0F',
      '--color-text-secondary': '#3E3E42',
      '--color-text-muted': '#6E726F',
      '--color-primary': '#926B09',
      '--color-primary-light': '#B8860B',
      '--color-primary-dark': '#7A5707',
      '--color-primary-contrast': '#FFFFFF',  // Text on primary (darker gold)
      '--color-secondary': '#FFFFFF',
      '--color-secondary-light': '#F2F2F3',
      '--color-alert-bg': '#FFF8E0',
      '--color-alert-border': '#926B09',
      '--color-success-bg': '#E8F5E9',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#FDEDEC',
      '--color-error-border': '#C62828',
    }
  },
  {
    id: 'harley-orange',
    name: 'Harley Orange',
    brand: 'Harley-Davidson',
    swatches: ['#FF6600', '#0D0D0F', '#C3002F'], // [Primary (Orange), Base (Dark), Secondary (Red)]
    dark: {
      '--color-canvas': '#0D0D0F',
      '--color-sidebar': '#121214',
      '--color-card': '#191A1D',
      '--color-card-border': '#2B2C30',
      '--color-card-hover': '#25272C',
      '--color-text-primary': '#F2F2F3',
      '--color-text-secondary': '#8E9096',
      '--color-text-muted': '#6E726F',
      '--color-primary': '#FF6600',
      '--color-primary-light': '#FF8533',
      '--color-primary-dark': '#CC5200',
      '--color-primary-contrast': '#0D0D0F',  // Text on primary (orange is light)
      '--color-secondary': '#C3002F',
      '--color-secondary-light': '#E60036',
      '--color-alert-bg': '#2E1A0A',
      '--color-alert-border': '#FF6600',
      '--color-success-bg': '#1A2E1A',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#2E1A1A',
      '--color-error-border': '#C62828',
    },
    light: {
      '--color-canvas': '#F8F8FA',
      '--color-sidebar': '#FFFFFF',
      '--color-card': '#FFFFFF',
      '--color-card-border': '#E0E0E3',
      '--color-card-hover': '#F0F0F2',
      '--color-text-primary': '#0D0D0F',
      '--color-text-secondary': '#3E3E42',
      '--color-text-muted': '#6E726F',
      '--color-primary': '#CC5200',
      '--color-primary-light': '#E65C00',
      '--color-primary-dark': '#B34700',
      '--color-primary-contrast': '#FFFFFF',  // Text on primary (darker orange)
      '--color-secondary': '#9C0026',
      '--color-secondary-light': '#B3002B',
      '--color-alert-bg': '#FFF3E0',
      '--color-alert-border': '#CC5200',
      '--color-success-bg': '#E8F5E9',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#FDEDEC',
      '--color-error-border': '#C62828',
    }
  }
]

/**
 * Genera tokens de tema completos a partir de 3 colores base (swatches)
 * @param {Object} customTheme - { primaryColor, secondaryColor, tertiaryColor, swatches }
 * @returns {Object} Tema con estructura dark/light completa
 */
function generateCustomThemeTokens(customTheme) {
  const primary = customTheme.primaryColor || customTheme.swatches?.[0] || '#D2B474'
  const secondary = customTheme.secondaryColor || customTheme.swatches?.[1] || '#0D0D0F'
  const tertiary = customTheme.tertiaryColor || customTheme.swatches?.[2] || '#D96B27'
  
  // Calculate luminance for contrast color
  const luminance = (r, g, b) => {
    const a = [r, g, b].map(v => {
      v /= 255
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
    })
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722
  }
  
  const hexToRgb = (hex) => {
    const clean = hex.replace('#', '')
    const bigint = parseInt(clean, 16)
    return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255]
  }
  
  const primaryRgb = hexToRgb(primary)
  const primaryLum = luminance(...primaryRgb)
  const primaryContrast = primaryLum > 0.5 ? '#0D0D0F' : '#FFFFFF'
  
  // Calculate tertiary contrast
  const tertiaryRgb = hexToRgb(tertiary)
  const tertiaryLum = luminance(...tertiaryRgb)
  const tertiaryContrast = tertiaryLum > 0.5 ? '#0D0D0F' : '#FFFFFF'
  
  // Helper to lighten/darken a color
  const adjustColor = (hex, amount) => {
    const rgb = hexToRgb(hex)
    return '#' + rgb.map(c => {
      const adjusted = Math.round(Math.min(255, Math.max(0, c + amount * 255)))
      return adjusted.toString(16).padStart(2, '0')
    }).join('')
  }
  
  return {
    id: customTheme.id || `custom-${Date.now()}`,
    name: customTheme.name,
    brand: customTheme.brand || 'Personalizado',
    swatches: [primary, secondary, tertiary],
    dark: {
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
      // Accents (semantic mapping from swatches)
      '--color-primary': primary,
      '--color-primary-light': adjustColor(primary, 0.2),
      '--color-primary-dark': adjustColor(primary, -0.2),
      '--color-primary-contrast': primaryContrast,
      '--color-secondary': secondary,
      '--color-secondary-light': adjustColor(secondary, 0.15),
      '--color-tertiary': tertiary,
      '--color-tertiary-light': adjustColor(tertiary, 0.15),
      '--color-tertiary-contrast': tertiaryContrast,
      // Alerts
      '--color-alert-bg': '#2E1A0A',
      '--color-alert-border': secondary,
      '--color-success-bg': '#1A2E1A',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#2E1A1A',
      '--color-error-border': '#C62828',
    },
    light: {
      // Surfaces
      '--color-canvas': '#F8F8FA',
      '--color-sidebar': '#FFFFFF',
      '--color-card': '#FFFFFF',
      '--color-card-border': '#E0E0E3',
      '--color-card-hover': '#F0F0F2',
      // Text
      '--color-text-primary': '#0D0D0F',
      '--color-text-secondary': '#3E3E42',
      '--color-text-muted': '#6E726F',
      // Accents
      '--color-primary': primary,
      '--color-primary-light': adjustColor(primary, 0.1),
      '--color-primary-dark': adjustColor(primary, -0.15),
      '--color-primary-contrast': primaryContrast,
      '--color-secondary': secondary,
      '--color-secondary-light': adjustColor(secondary, 0.1),
      '--color-tertiary': tertiary,
      '--color-tertiary-light': adjustColor(tertiary, 0.1),
      '--color-tertiary-contrast': tertiaryContrast,
      // Alerts
      '--color-alert-bg': '#FFF3E0',
      '--color-alert-border': primary,
      '--color-success-bg': '#E8F5E9',
      '--color-success-border': '#2E7D32',
      '--color-error-bg': '#FDEDEC',
      '--color-error-border': '#C62828',
    }
  }
}

/**
 * Obtiene un tema por su ID (soporta temas predefinidos y personalizados)
 * @param {string} id - ID del tema
 * @returns {Promise<Object|null>} Tema encontrado o null
 */
export async function getThemeById(id) {
  // Primero buscar en temas predefinidos
  const predefined = THEMES.find(t => t.id === id)
  if (predefined) return predefined
  
  // Si es un tema personalizado (custom-*), buscar en Dexie
  if (id.startsWith('custom-')) {
    try {
      const customTheme = await db.customThemes.get(parseInt(id.replace('custom-', '')))
      if (customTheme) {
        return generateCustomThemeTokens(customTheme)
      }
    } catch (e) {
      console.warn('Error loading custom theme:', e)
    }
  }
  
  return null
}

/**
 * Obtiene lista simplificada para dropdowns (predefinidos + personalizados)
 * @returns {Promise<Array>} [{id, name, brand, swatches}]
 */
export async function getThemesList() {
  const predefined = THEMES.map(t => ({
    id: t.id,
    name: t.name,
    brand: t.brand,
    swatches: t.swatches
  }))
  
  try {
    const customThemes = await db.getAllCustomThemes()
    const custom = customThemes.map(t => ({
      id: `custom-${t.id}`,
      name: t.name,
      brand: t.brand || 'Personalizado',
      swatches: t.swatches || [t.primaryColor, t.secondaryColor, t.tertiaryColor]
    }))
    return [...predefined, ...custom]
  } catch (e) {
    console.warn('Error loading custom themes:', e)
    return predefined
  }
}

