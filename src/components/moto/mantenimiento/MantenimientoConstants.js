/**
 * Constantes compartidas para el módulo de Mantenimiento
 */

/**
 * Categorías de intervención de mantenimiento
 */
export const MAINTENANCE_CATEGORIES = [
  'Engrase / Tensión de cadena',
  'Cambio de pieza / Recambio',
  'Reglaje / Tarado de suspensiones',
  'Aceite y filtros',
  'Neumáticos y presiones',
  'Revisión general / Otros'
]

/**
 * Bloque técnico de suspensiones por categoría
 */
export const SUSPENSION_FIELDS = {
  'Engrase / Tensión de cadena': null,
  'Cambio de pieza / Recambio': null,
  'Reglaje / Tarado de suspensiones': {
    showToggle: true,
    horquilla: {
      precarga: { value: '', unit: 'vueltas' },
      compresion: { value: '', unit: 'clics' },
      extension: { value: '', unit: 'clics' }
    },
    amortiguador: {
      precarga: { value: '', unit: 'clics/mm' },
      compresion_alta: { value: '', unit: 'clics' },
      compresion_baja: { value: '', unit: 'clics' },
      extension: { value: '', unit: 'clics' }
    },
    neumaticos: {
      delantero: { value: '', unit: 'bar' },
      trasero: { value: '', unit: 'bar' },
      escenario: 'Carretera solo'
    }
  },
  'Aceite y filtros': null,
  'Neumáticos y presiones': {
    showToggle: true,
    neumaticos: {
      delantero: { value: '', unit: 'bar' },
      trasero: { value: '', unit: 'bar' },
      escenario: 'Carretera solo'
    }
  },
  'Revisión general / Otros': null
}