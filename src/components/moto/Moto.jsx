import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ImageUpload } from '../upload/ImageUpload'
import { useGPX } from '../../context/GPXContext'
import { Modal, SectionHeader, BlobImage } from '../shared'
import { formatFileSize, formatDateTime, getFileIcon } from '../../utils/formatters'
import { getMotoModel, getMotoModelsArray } from '../../constants/motoModels'
import { Mantenimiento } from './Mantenimiento'
import Documentacion from './Documentacion'
import { MotoDashboard } from './MotoDashboard'
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
        <MotoDashboard selectedMoto={selectedMoto} />
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