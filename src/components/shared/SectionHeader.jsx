import React from 'react'

/**
 * SectionHeader - Reusable section header component
 * 
 * @param {string} title - Section title
 * @param {string} subtitle - Optional subtitle/description
 * @param {ReactNode} actions - Optional action buttons/links
 * @param {string} className - Additional CSS classes
 * @param {string} titleClassName - Additional CSS classes for title
 */
export const SectionHeader = ({ 
  title, 
  subtitle = '', 
  actions = null, 
  className = '', 
  titleClassName = '' 
}) => {
  return (
    <header className={`section-header ${className}`}>
      <div className="section-header-content">
        <h2 className={`section-title ${titleClassName}`}>{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="section-actions">{actions}</div>}
    </header>
  )
}

export default SectionHeader