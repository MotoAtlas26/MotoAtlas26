import React from 'react'

/**
 * EmptyState - Reusable empty state component
 * 
 * @param {string} icon - Emoji or icon component
 * @param {string} title - Main title
 * @param {string} description - Description text
 * @param {ReactNode} action - Optional action button/link
 * @param {string} className - Additional CSS classes
 */
export const EmptyState = ({ 
  icon = '📁', 
  title = 'No hay contenido', 
  description = '', 
  action = null, 
  className = '' 
}) => {
  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state-icon">{icon}</div>
      <h3 className="empty-state-title">{title}</h3>
      {description && <p className="empty-state-desc">{description}</p>}
      {action && <div className="empty-state-action">{action}</div>}
    </div>
  )
}

export default EmptyState