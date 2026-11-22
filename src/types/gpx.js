/**
 * @typedef {Object} GPXTrackPoint
 * @property {number} lat - Latitud
 * @property {number} lng - Longitud
 * @property {number} [elevation] - Elevación opcional
 * @property {Date} [timestamp] - Marca de tiempo opcional
 * @property {number} [speed] - Velocidad opcional
 */

/**
 * @typedef {Object} GPXTrack
 * @property {string} name - Nombre del track
 * @property {string} [description] - Descripción opcional
 * @property {GPXTrackPoint[]} points - Puntos del track
 * @property {Date} [startTime] - Hora de inicio opcional
 * @property {Date} [endTime] - Hora de fin opcional
 * @property {number} [distance] - Distancia opcional
 * @property {number} [duration] - Duración opcional
 * @property {number} [averageSpeed] - Velocidad promedio opcional
 * @property {number} [maxSpeed] - Velocidad máxima opcional
 * @property {number} [elevationGain] - Ganancia de elevación opcional
 * @property {number} [elevationLoss] - Pérdida de elevación opcional
 * @property {number} [minElevation] - Elevación mínima opcional
 * @property {number} [maxElevation] - Elevación máxima opcional
 * @property {{author?: string, copyright?: string, source?: string}} [metadata] - Metadatos opcional
 */

/**
 * @typedef {Object} UploadResult
 * @property {boolean} success - Si la carga fue exitosa
 * @property {string} message - Mensaje de resultado
 * @property {GPXTrack} [track] - Track cargado opcional
 */

export {}