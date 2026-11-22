/**
 * GPX Track Processing Utilities
 * Centralized logic for calculating track statistics, simplifying tracks, etc.
 */

const EARTH_RADIUS = 6371000 // meters

/**
 * Calculate distance between two lat/lng points using Haversine formula
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in meters
 */
export const haversineDistance = (lat1, lng1, lat2, lng2) => {
  const toRad = (deg) => deg * Math.PI / 180
  const dLat = toRad(lat2 - lat1)
  const dLng = toRad(lng2 - lng1)
  const a = Math.sin(dLat / 2) ** 2 + 
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2
  return 2 * EARTH_RADIUS * Math.asin(Math.sqrt(a))
}

/**
 * Calculate total distance of a track from points array
 * @param {Array} points - Array of {lat, lng} points
 * @returns {number} Total distance in meters
 */
export const calculateDistance = (points) => {
  if (!points || points.length < 2) return 0
  let total = 0
  for (let i = 1; i < points.length; i++) {
    total += haversineDistance(
      points[i - 1].lat, points[i - 1].lng,
      points[i].lat, points[i].lng
    )
  }
  return total
}

/**
 * Calculate elevation gain from points with elevation data
 * @param {Array} points - Array of {lat, lng, ele} points
 * @returns {number} Total elevation gain in meters
 */
export const calculateElevationGain = (points) => {
  if (!points || points.length < 2) return 0
  let gain = 0
  for (let i = 1; i < points.length; i++) {
    const prevEle = points[i - 1].ele
    const currEle = points[i].ele
    if (prevEle != null && currEle != null && currEle > prevEle) {
      gain += currEle - prevEle
    }
  }
  return gain
}

/**
 * Calculate elevation loss from points with elevation data
 * @param {Array} points - Array of {lat, lng, ele} points
 * @returns {number} Total elevation loss in meters
 */
export const calculateElevationLoss = (points) => {
  if (!points || points.length < 2) return 0
  let loss = 0
  for (let i = 1; i < points.length; i++) {
    const prevEle = points[i - 1].ele
    const currEle = points[i].ele
    if (prevEle != null && currEle != null && currEle < prevEle) {
      loss += prevEle - currEle
    }
  }
  return loss
}

/**
 * Calculate track duration from points with time data
 * @param {Array} points - Array of {time} points
 * @returns {number} Duration in seconds
 */
export const calculateDuration = (points) => {
  if (!points || points.length < 2) return 0
  const firstTime = points[0].time ? new Date(points[0].time).getTime() : null
  const lastTime = points[points.length - 1].time ? new Date(points[points.length - 1].time).getTime() : null
  if (!firstTime || !lastTime) return 0
  return Math.floor((lastTime - firstTime) / 1000)
}

/**
 * Calculate speed statistics from points
 * @param {Array} points - Array of {lat, lng, time, ele} points
 * @returns {Object} Speed stats {averageSpeed, maxSpeed, minSpeed}
 */
export const calculateSpeedStats = (points) => {
  if (!points || points.length < 2) return { averageSpeed: 0, maxSpeed: 0, minSpeed: 0 }
  
  let totalDistance = 0
  let totalTime = 0
  let maxSpeed = 0
  let minSpeed = Infinity
  
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    
    if (prev.time && curr.time && prev.lat && prev.lng && curr.lat && curr.lng) {
      const distance = haversineDistance(prev.lat, prev.lng, curr.lat, curr.lng)
      const timeDiff = (new Date(curr.time).getTime() - new Date(prev.time).getTime()) / 1000
      
      if (timeDiff > 0) {
        const speed = distance / timeDiff // m/s
        maxSpeed = Math.max(maxSpeed, speed)
        minSpeed = Math.min(minSpeed, speed)
        totalDistance += distance
        totalTime += timeDiff
      }
    }
  }
  
  return {
    averageSpeed: totalTime > 0 ? totalDistance / totalTime : 0,
    maxSpeed: maxSpeed === 0 ? 0 : maxSpeed,
    minSpeed: minSpeed === Infinity ? 0 : minSpeed
  }
}

/**
 * Get track bounds (min/max lat/lng)
 * @param {Array} points - Array of {lat, lng} points
 * @returns {Object} Bounds {minLat, maxLat, minLng, maxLng}
 */
export const getTrackBounds = (points) => {
  if (!points || points.length === 0) return null
  
  let minLat = points[0].lat
  let maxLat = points[0].lat
  let minLng = points[0].lng
  let maxLng = points[0].lng
  
  for (const point of points) {
    minLat = Math.min(minLat, point.lat)
    maxLat = Math.max(maxLat, point.lat)
    minLng = Math.min(minLng, point.lng)
    maxLng = Math.max(maxLng, point.lng)
  }
  
  return { minLat, maxLat, minLng, maxLng }
}

/**
 * Get elevation stats (min/max elevation)
 * @param {Array} points - Array of {ele} points
 * @returns {Object} Elevation stats {minElevation, maxElevation}
 */
export const getElevationStats = (points) => {
  if (!points || points.length === 0) return { minElevation: 0, maxElevation: 0 }
  
  const elevations = points.map(p => p.ele).filter(e => e != null)
  if (elevations.length === 0) return { minElevation: 0, maxElevation: 0 }
  
  return {
    minElevation: Math.min(...elevations),
    maxElevation: Math.max(...elevations)
  }
}

/**
 * Douglas-Peucker algorithm for track simplification
 * @param {Array} points - Array of {lat, lng} points
 * @param {number} tolerance - Tolerance in meters
 * @returns {Array} Simplified points array
 */
export const simplifyTrack = (points, tolerance = 10) => {
  if (!points || points.length <= 2) return points
  
  const perpendicularDistance = (point, lineStart, lineEnd) => {
    const x = point.lng
    const y = point.lat
    const x1 = lineStart.lng
    const y1 = lineStart.lat
    const x2 = lineEnd.lng
    const y2 = lineEnd.lat
    
    const A = y2 - y1
    const B = x1 - x2
    const C = x2 * y1 - x1 * y2
    
    return Math.abs(A * x + B * y + C) / Math.sqrt(A * A + B * B)
  }
  
  const simplify = (pts, start, end, tol, result) => {
    let maxDist = 0
    let index = 0
    
    for (let i = start + 1; i < end; i++) {
      const dist = perpendicularDistance(pts[i], pts[start], pts[end])
      if (dist > maxDist) {
        maxDist = dist
        index = i
      }
    }
    
    if (maxDist > tol) {
      if (index - start > 1) simplify(pts, start, index, tol, result)
      result.push(pts[index])
      if (end - index > 1) simplify(pts, index, end, tol, result)
    }
  }
  
  const result = [points[0]]
  simplify(points, 0, points.length - 1, tolerance, result)
  result.push(points[points.length - 1])
  
  return result
}

/**
 * Convert track to GeoJSON LineString
 * @param {Object} track - Track object with points array
 * @returns {Object} GeoJSON Feature
 */
export const trackToGeoJSON = (track) => {
  if (!track || !track.points || track.points.length === 0) return null
  
  const coordinates = track.points.map(p => [p.lng, p.lat, p.ele].filter(v => v != null))
  
  return {
    type: 'Feature',
    properties: {
      name: track.name,
      distance: track.distance,
      elevationGain: track.elevationGain,
      elevationLoss: track.elevationLoss,
      duration: track.duration,
      ...track
    },
    geometry: {
      type: 'LineString',
      coordinates
    }
  }
}

/**
 * Calculate all track statistics at once
 * @param {Array} points - Array of {lat, lng, ele, time} points
 * @returns {Object} Complete track statistics
 */
export const calculateTrackStats = (points) => {
  const distance = calculateDistance(points)
  const elevationGain = calculateElevationGain(points)
  const elevationLoss = calculateElevationLoss(points)
  const duration = calculateDuration(points)
  const speedStats = calculateSpeedStats(points)
  const elevationStats = getElevationStats(points)
  const bounds = getTrackBounds(points)
  
  return {
    distance,
    elevationGain,
    elevationLoss,
    duration,
    averageSpeed: speedStats.averageSpeed,
    maxSpeed: speedStats.maxSpeed,
    minSpeed: speedStats.minSpeed,
    minElevation: elevationStats.minElevation,
    maxElevation: elevationStats.maxElevation,
    bounds
  }
}