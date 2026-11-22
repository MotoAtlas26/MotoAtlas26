import React from 'react'

/**
 * StatRow - Reusable stat display row component
 * Used for displaying key-value pairs in track details, settings, etc.
 * 
 * @param {string} label - Stat label
 * @param {string|number} value - Stat value
 * @param {string} unit - Optional unit (km, m, h, etc.)
 * @param {string} className - Additional CSS classes
 * @param {string} labelClassName - Additional CSS classes for label
 * @param {string} valueClassName - Additional CSS classes for value
 */
export const StatRow = ({ 
  label, 
  value, 
  unit = '', 
  className = '', 
  labelClassName = '', 
  valueClassName = '' 
}) => {
  return (
    <div className={`stat-row ${className}`}>
      <span className={`stat-label ${labelClassName}`}>{label}</span>
      <span className={`stat-value ${valueClassName}`}>
        {value}
        {unit && <span className="stat-unit">{unit}</span>}
      </span>
    </div>
  )
}

/**
 * StatGrid - Grid layout for multiple StatRow components
 * 
 * @param {Array} stats - Array of {label, value, unit} objects
 * @param {number} columns - Number of columns (default: 2)
 * @param {string} className - Additional CSS classes
 */
export const StatGrid = ({ 
  stats = [], 
  columns = 2, 
  className = '' 
}) => {
  return (
    <div className={`stat-grid ${className}`} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {stats.map((stat, index) => (
        <StatRow key={index} {...stat} />
      ))}
    </div>
  )
}

export default StatRow