/**
 * Centralized formatting utilities for MotoLog
 * Replaces duplicated formatters across components
 */

/**
 * Format file size in human readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

/**
 * Format date with configurable options
 * @param {string|Date} dateStr - Date string or Date object
 * @param {Object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateStr, options = {}) => {
  const defaultOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    ...options
  }
  return new Date(dateStr).toLocaleDateString('es-ES', defaultOptions)
}

/**
 * Format date with time
 * @param {string|Date} dateStr - Date string or Date object
 * @returns {string} Formatted date and time string
 */
export const formatDateTime = (dateStr) => {
  return formatDate(dateStr, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

/**
 * Get file icon based on MIME type
 * @param {string} mimeType - MIME type of the file
 * @returns {string} Emoji icon
 */
export const getFileIcon = (mimeType) => {
  if (mimeType?.includes('pdf')) return '📄'
  if (mimeType?.includes('word')) return '📝'
  if (mimeType?.includes('pages')) return '📝'
  if (mimeType?.startsWith('image/')) return '🖼️'
  return '📄'
}

/**
 * Format distance in meters to human readable format
 * @param {number} meters - Distance in meters
 * @returns {string} Formatted distance string
 */
export const formatDistance = (meters) => {
  if (meters >= 1000) {
    return `${(meters / 1000).toFixed(2)} km`
  }
  return `${meters.toFixed(0)} m`
}

/**
 * Format time in seconds to human readable format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
  if (!seconds) return 'N/A'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m ${secs}s`
  }
  return `${minutes}m ${secs}s`
}

/**
 * Format elevation in meters
 * @param {number} meters - Elevation in meters
 * @returns {string} Formatted elevation string
 */
export const formatElevation = (meters) => {
  return `${Math.round(meters)}m`
}

/**
 * Format speed from m/s to km/h
 * @param {number} mps - Speed in meters per second
 * @returns {string} Formatted speed string
 */
export const formatSpeed = (mps) => {
  const kmh = mps * 3.6
  return `${kmh.toFixed(1)} km/h`
}

/**
 * Format backup filename to readable date
 * @param {string} name - Backup filename
 * @returns {string} Formatted date string
 */
export const formatBackupName = (name) => {
  const match = name.match(/MotoAtlas26-backup-(\d{4})-(\d{2})-(\d{2})T(\d{2})-(\d{2})-(\d{2})/)
  return match ? `${match[3]}/${match[2]}/${match[1]} ${match[4]}:${match[5]}` : name
}

/**
 * Format currency amount
 * @param {number} amount - Amount in cents or euros
 * @param {string} currency - Currency code (default: EUR)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'EUR') => {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency
  }).format(amount)
}

/**
 * Format number with thousand separators
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (num) => {
  return new Intl.NumberFormat('es-ES').format(num)
}