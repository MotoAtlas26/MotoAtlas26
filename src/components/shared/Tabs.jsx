import React from 'react'

/**
 * Componente de pestañas (Tabs) reutilizable y accesible.
 * Cambia dinámicamente de color según el tema activo (CFMOTO Gold / KTM Snow)
 * usando las CSS Custom Properties definidas en variables.css.
 * 
 * @param {Array} tabs - Array de objetos { id, label, icon? }
 * @param {string} activeTab - ID de la pestaña activa
 * @param {Function} onChange - Callback al cambiar de pestaña (recibe el id)
 */
export const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div 
      role="tablist" 
      aria-label="Navegación de secciones"
      className="tabs-container"
    >
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          id={`tab-${tab.id}`}
          type="button"
          className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {tab.icon && <span className="tab-icon" aria-hidden="true">{tab.icon}</span>}
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  )
}

export default Tabs