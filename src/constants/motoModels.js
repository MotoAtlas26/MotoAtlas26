/**
 * Centralized motorcycle models configuration
 * Used across Home, Moto, Facturas, and Settings components
 */

import cfmoto800mtx from '../assets/motos/800MT-X.webp'
import ktm1290 from '../assets/motos/KTM-1290-S-Adv-S.webp'

export const MOTO_MODELS = {
  'cfmoto-800mt-x': {
    id: 'cfmoto-800mt-x',
    name: 'CFMOTO 800MT-X',
    colorTheme: { primary: '#E8A838', secondary: '#1A1A1A' },
    fallbackImage: cfmoto800mtx
  },
  'ktm-1290-super-adventure-s': {
    id: 'ktm-1290-super-adventure-s',
    name: 'KTM 1290 Super Adventure S',
    colorTheme: { primary: '#FF8200', secondary: '#000000' },
    fallbackImage: ktm1290
  }
}

/**
 * Get moto model by ID with fallback to default
 * @param {string} motoId - Motorcycle ID
 * @returns {Object} Moto model object
 */
export const getMotoModel = (motoId) => {
  return MOTO_MODELS[motoId] || MOTO_MODELS['cfmoto-800mt-x']
}

/**
 * Get all moto models as array for select options
 * @returns {Array} Array of moto model objects
 */
export const getMotoModelsArray = () => {
  return Object.values(MOTO_MODELS)
}

/**
 * Get default moto model
 * @returns {Object} Default moto model (CFMOTO 800MT-X)
 */
export const getDefaultMotoModel = () => {
  return MOTO_MODELS['cfmoto-800mt-x']
}