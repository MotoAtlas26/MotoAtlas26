import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ImageUpload } from '../upload/ImageUpload'
import { useGPX } from '../../context/GPXContext'
import { Modal, SectionHeader } from '../shared'
import { formatFileSize, formatDateTime, getFileIcon } from '../../utils/formatters'
import { getMotoModel } from '../../constants/motoModels'

export const Moto = () => {
  const { selectedMoto } = useGPX()
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const moto = getMotoModel(selectedMoto)

  return (
    <>
      <SectionHeader
        title={moto.name}
        subtitle="Panel de Control Moto"
        actions={
          <div className="header-actions">
            <Link to="/moto/facturas" className="btn-outline">
              📂 Ver Facturas
            </Link>
            <button className="btn-primary" onClick={() => setShowInvoiceModal(true)}>
              Subir Facturas
            </button>
            <Link to="/fileUpload" className="btn-outline">
              Registrar Mantenimiento
            </Link>
          </div>
        }
      />

      <section className="moto-stats-overview">
        <div className="placeholder-card">
          <h3>Dashboard Moto</h3>
          <p>Aquí se añadirán las futuras gráficas y estadísticas de mantenimiento.</p>
        </div>
      </section>

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
    </>
  )
}

export default Moto