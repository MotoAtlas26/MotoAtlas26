import React from 'react'

/**
 * SettingCard - Reusable setting card component
 * 
 * @param {string} icon - Emoji or icon component
 * @param {string} title - Setting title
 * @param {string} description - Setting description
 * @param {ReactNode} children - Setting control (toggle, select, input, etc.)
 * @param {string} className - Additional CSS classes
 * @param {string} headerClassName - Additional CSS classes for header
 */
export const SettingCard = ({ 
  icon, 
  title, 
  description = '', 
  children, 
  className = '', 
  headerClassName = '' 
}) => {
  return (
    <div className={`setting-card ${className}`}>
      <div className={`setting-card-header ${headerClassName}`}>
        {icon && <span className="setting-card-icon">{icon}</span>}
        <h3 className="setting-card-title">{title}</h3>
      </div>
      <div className="setting-card-body">
        {description && <p className="setting-card-description">{description}</p>}
        {children}
      </div>
    </div>
  )
}

export default SettingCard