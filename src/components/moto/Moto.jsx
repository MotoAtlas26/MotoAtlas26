import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ImageUpload } from '../upload/ImageUpload'
import { useGPX } from '../../context/GPXContext'
import { Modal, SectionHeader, BlobImage } from '../shared'
import { formatFileSize, formatDateTime, getFileIcon } from '../../utils/formatters'
import { getMotoModel, getMotoModelsArray } from '../../constants/motoModels'
import { Mantenimiento } from './Mantenimiento'
import { Documentacion } from './Documentacion'
import { TrashIcon, UploadIcon, FileTextIcon, PlusIcon, HomeIcon, WrenchIcon, FolderIcon, ShieldIcon } from '../shared/Icons'

export const Moto = () => {
  const { selectedMoto } = useGPX()
  const moto = getMotoModel(selectedMoto)
  const motosArray = getMotoModelsArray()

  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedMotoId, setSelectedMotoId] = useState(selectedMoto)
  const [view, setView] = useState('dashboard')

  const tabs = [
    { id: 'dashboard', label: 'Resumen', icon: HomeIcon },
    { id: 'facturas', label: 'Facturas', icon: FileTextIcon },
    { id: 'mantenimiento', label: 'Mantenimiento', icon: WrenchIcon },
    { id: 'documentacion', label: 'Documentación', icon: ShieldIcon },
  ]

  return (
    <div>
      {/* Cabecera superior moderna */}
      <header className="moto-header">
        <div className="moto-header-left">
          <h1 className="moto-title">{moto.name}</h1>
          <span className="moto-subtitle">Panel de Control Moto</span>
        </div>
        <div className="moto-header-actions">
          <button 
            className="btn-primary" 
            onClick={() => setShowInvoiceModal(true)}
            aria-label="Subir factura"
          >
            <PlusIcon size={18} />
            <span>Subir Factura</span>
          </button>
          <Link 
            to="/fileUpload" 
            className="btn-secondary"
            aria-label="Registrar mantenimiento"
          >
            <PlusIcon size={18} />
            <span>Registrar Mantenimiento</span>
          </Link>
        </div>
      </header>

      {/* Barra de pestañas segmentada moderna */}
      <nav className="moto-segmented-tabs" role="tablist" aria-label="Secciones de la moto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = view === tab.id
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              id={`tab-${tab.id}`}
              className={`moto-tab ${isActive ? 'active' : ''}`}
              onClick={() => setView(tab.id)}
            >
              <Icon size={18} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </nav>

      {/* Dashboard Técnico Real */}
      {view === 'dashboard' && (
        <section className="moto-stats-overview" id="panel-dashboard" role="tabpanel" aria-labelledby="tab-dashboard">
          {/* 4 Tarjetas KPI */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
            {/* Card 1: Gasto total acumulado */}
            <div style={{ 
              background: 'var(--color-card)', 
              border: '1px solid var(--color-card-border)', 
              borderRadius: 'var(--radius-card)', 
              padding: 'var(--space-4)', 
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: 'var(--space-1)' }}>€ {0}</div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Gasto total Facturas + Mantenimientos</div>
            </div>

            {/* Card 2: Último kilometraje registrado */}
            <div style={{ 
              background: 'var(--color-card)', 
              border: '1px solid var(--color-card-border)', 
              borderRadius: 'var(--radius-card)', 
              padding: 'var(--space-4)', 
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', color: 'var(--color-secondary)', marginBottom: 'var(--space-1)' }}>0 km</div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Último km registrado</div>
            </div>

            {/* Card 3: Último engrase de cadena */}
            <div style={{ 
              background: 'var(--color-card)', 
              border: '1px solid var(--color-card-border)', 
              borderRadius: 'var(--radius-card)', 
              padding: 'var(--space-4)', 
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', color: 'var(--color-primary-dark)', marginBottom: 'var(--space-1)' }}>
                0 km
              </div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                0 km desde
              </div>
            </div>

            {/* Card 4: Tarado de suspensión activo */}
            <div style={{ 
              background: 'var(--color-card)', 
              border: '1px solid var(--color-card-border)', 
              borderRadius: 'var(--radius-card)', 
              padding: 'var(--space-4)', 
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2rem', color: 'var(--color-tertiary)', marginBottom: 'var(--space-1)' }}>Ninguno</div>
              <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
                Último registro suspensionSetup
              </div>
            </div>
          </div>

          {/* Gráfica visual de gastos por categoría (SVG/CSS puro) */}
          <div style={{ 
            background: 'var(--color-card)', 
            border: '1px solid var(--color-card-border)', 
            borderRadius: 'var(--radius-card)', 
            padding: 'var(--space-4)', 
            marginTop: 'var(--space-4)'
          }}>
            <h4 style={{ margin: '0 0 var(--space-3)', color: 'var(--color-text-primary)' }}>Gastos por Categoría</h4>
            <div style={{ 
              display: 'flex', 
              alignItems: 'flex-end', 
              gap: 'var(--space-2)', 
              height: '120px'
            }}>
              {['Engrase / Tensión de cadena', 'Cambio de pieza / Recambio', 'Reglaje / Tarado de suspensiones', 'Aceite y filtros', 'Neumáticos y presiones', 'Revisión general / Otros'].map((cat, i) => {
                return (
                  <div key={cat} style={{ 
                    flex: '1', 
                    background: i % 2 === 0 ? 'var(--color-primary)' : 'var(--color-secondary)', 
                    height: '10%', 
                    minHeight: '20px', 
                    borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)', 
                    position: 'relative', 
                    overflow: 'hidden'
                  }}>
                    <span style={{ 
                      position: 'absolute', 
                      bottom: '0', 
                      left: '0', 
                      right: '0', 
                      padding: 'var(--space-1)', 
                      color: 'var(--color-primary-contrast)', 
                      fontSize: '0.65rem', 
                      textAlign: 'center'
                    }}>
                      {cat}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Actividad reciente unificada */}
          <div style={{ 
            background: 'var(--color-card)', 
            border: '1px solid var(--color-card-border)', 
            borderRadius: 'var(--radius-card)', 
            padding: 'var(--space-4)', 
            marginTop: 'var(--space-4)'
          }}>
            <h4 style={{ margin: '0 0 var(--space-3)', color: 'var(--color-text-primary)' }}>Actividad Reciente Unificada</h4>
            <div style={{ 
              height: '150px', 
              overflowY: 'auto',
              borderRadius: 'var(--radius-sm)',
              background: 'var(--color-card)',
              border: '1px solid var(--color-card-border)'
            }}>
              <p style={{ padding: 'var(--space-3)', color: 'var(--color-text-secondary)' }}>
                Cargar actividad reciente...
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Vista de Mantenimiento */}
      {view === 'mantenimiento' && (
        <div id="panel-mantenimiento" role="tabpanel" aria-labelledby="tab-mantenimiento">
          <Mantenimiento />
        </div>
      )}

      {/* Vista de Documentación (Guantera Digital) */}
      {view === 'documentacion' && (
        <div id="panel-documentacion" role="tabpanel" aria-labelledby="tab-documentacion">
          <Documentacion />
        </div>
      )}

      {/* Vista de Facturas */}
      {view === 'facturas' && (
        <div id="panel-facturas" role="tabpanel" aria-labelledby="tab-facturas">
          <p style={{ padding: 'var(--space-4)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
            Vista de Facturas - Próximamente
          </p>
        </div>
      )}

      {/* Modal de Facturas */}
      <Modal
        isOpen={showInvoiceModal}
        onClose={() => setShowInvoiceModal(false)}
        title={`Subir Facturas - ${moto.name}`}
        size="lg"
      >
        <ImageUpload 
          motoId={selectedMoto} 
          type="invoice" 
          onUploadComplete={() => setShowInvoiceModal(false)}
        />
      </Modal>
    </div>
  )
}

export default Moto