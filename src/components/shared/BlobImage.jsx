import React from 'react'
import { useBlobUrl } from '../../hooks/useBlobUrl'

/**
 * BlobImage - Component for displaying blob images with lazy loading and automatic cleanup
 * Uses useBlobUrl hook to manage URL lifecycle and prevent memory leaks
 * 
 * @param {Blob|null} blob - The blob to display
 * @param {string} alt - Alt text for the image
 * @param {string} className - Additional CSS classes
 * @param {Object} style - Inline styles
 * @param {boolean} loading - Loading strategy (default: "lazy")
 * @param {string} decoding - Decoding strategy (default: "async")
 * @param {ReactNode} fallback - Fallback content when no blob
 * @param {Object} fallbackProps - Props for fallback image (src, alt)
 */
export const BlobImage = ({ 
  blob, 
  alt = '', 
  className = '', 
  style = {}, 
  loading = 'lazy', 
  decoding = 'async',
  fallback = null,
  fallbackProps = {}
}) => {
  const url = useBlobUrl(blob)

  if (!url) {
    if (fallback) return fallback
    if (fallbackProps.src) {
      return <img src={fallbackProps.src} alt={fallbackProps.alt || alt} className={className} style={style} loading={loading} decoding={decoding} />
    }
    return null
  }

  return (
    <img
      src={url}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      decoding={decoding}
    />
  )
}

export default BlobImage