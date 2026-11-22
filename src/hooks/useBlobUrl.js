import { useState, useEffect } from 'react'

/**
 * Hook for managing blob URLs with automatic cleanup
 * Prevents memory leaks by revoking URLs on unmount or when blob changes
 * 
 * @param {Blob|null} blob - The blob to create a URL for
 * @returns {string|null} The blob URL or null if no blob
 */
export const useBlobUrl = (blob) => {
  const [url, setUrl] = useState(null)

  useEffect(() => {
    if (!blob) {
      setUrl(null)
      return
    }

    const objectUrl = URL.createObjectURL(blob)
    setUrl(objectUrl)

    // Cleanup function to revoke the URL when blob changes or component unmounts
    return () => {
      URL.revokeObjectURL(objectUrl)
    }
  }, [blob])

  return url
}

/**
 * Hook for managing multiple blob URLs
 * @param {Object} blobs - Object with keys mapping to blobs
 * @returns {Object} Object with same keys mapping to blob URLs
 */
export const useBlobUrls = (blobs) => {
  const [urls, setUrls] = useState({})

  useEffect(() => {
    const newUrls = {}
    const objectUrls = []

    // Create URLs for all blobs
    for (const [key, blob] of Object.entries(blobs)) {
      if (blob) {
        const objectUrl = URL.createObjectURL(blob)
        newUrls[key] = objectUrl
        objectUrls.push(objectUrl)
      } else {
        newUrls[key] = null
      }
    }

    setUrls(newUrls)

    // Cleanup all URLs on unmount or when blobs change
    return () => {
      objectUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [blobs])

  return urls
}