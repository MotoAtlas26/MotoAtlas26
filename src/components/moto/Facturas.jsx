import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { db } from '../../services/db'
import { useGPX } from '../../context/GPXContext'
import { EmptyState, Modal, SectionHeader, BlobImage } from '../shared'
import { formatFileSize, formatDate, getFileIcon } from '../../utils/formatters'
import { getMotoModel } from '../../constants/motoModels'
import { TrashIcon } from '../shared/Icons'
import { useBlobUrl } from '../../hooks/useBlobUrl'

export const Facturas = () => {
  const { selectedMoto } = useGPX()
  const [invoices, setInvoices] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const moto = getMotoModel(selectedMoto)
  const selectedInvoiceUrl = useBlobUrl(selectedInvoice?.blob || null)

  // Cargar facturas de la moto seleccionada
  const loadInvoices = async () => {
    try {
      const invs = await db.getInvoicesByMoto(selectedMoto)
      setInvoices(invs)
    } catch (error) {
      console.error('Error cargando facturas:', error)
    }
  }

  useEffect(() => {
    loadInvoices()
  }, [selectedMoto])

  const handleDeleteInvoice = async (id) => {
    try {
      await db.deleteImage(id)
      loadInvoices()
      if (selectedInvoice?.id === id) {
        setSelectedInvoice(null)
      }
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Error eliminando factura:', error)
    }
  }

  const openInvoice = (invoice) => {
    setSelectedInvoice(invoice)
  }

  return (
    <>
      <SectionHeader
        title={`Facturas - ${moto.name}`}
        subtitle="Gestión de facturas y documentos"
        actions={
          <Link to="/moto" className="btn-outline">
            📂 Volver al Dashboard
          </Link>
        }
      />

      <div className="facturas-layout">
        <aside className="facturas-list">
          <div className="list-header">
            <h3>Facturas ({invoices.length})</h3>
          </div>
          <div className="invoices-scroll">
            {invoices.length === 0 ? (
              <EmptyState
                icon="📄"
                title="No hay facturas"
                description="Sube tu primera factura desde el dashboard de la moto"
                action={
                  <Link to="/moto" className="btn-primary">
                    Subir Facturas
                  </Link>
                }
              />
            ) : (
              invoices.map((invoice) => (
                <div 
                  key={invoice.id} 
                  className={`invoice-item ${selectedInvoice?.id === invoice.id ? 'active' : ''}`}
                  onClick={() => openInvoice(invoice)}
                >
                  <span className="invoice-icon-sm">{getFileIcon(invoice.mimeType)}</span>
                  <div className="invoice-item-info">
                    <div className="invoice-item-name">{invoice.fileName}</div>
                    <div className="invoice-item-meta">
                      <span>{formatDate(invoice.createdAt)}</span>
                      <span className="separator">•</span>
                      <span>{formatFileSize(invoice.size)}</span>
                    </div>
                  </div>
                  <button 
                    className="btn-delete-sm"
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(invoice) }}
                    title="Eliminar"
                  >
                    <TrashIcon size={18} />
                  </button>
                </div>
              ))
            )}
          </div>
        </aside>

        <section className="facturas-viewer">
          {selectedInvoice ? (
            <div className="viewer-container">
              <div className="viewer-header">
                <h3>{selectedInvoice.fileName}</h3>
                <button 
                  className="btn-close-viewer"
                  onClick={() => setSelectedInvoice(null)}
                  title="Close"
                >
                  ✕
                </button>
              </div>
              <div className="viewer-content">
                {selectedInvoice && selectedInvoiceUrl && (
                  selectedInvoice.mimeType?.startsWith('image/') ? (
                    <img 
                      src={selectedInvoiceUrl} 
                      alt={selectedInvoice.fileName}
                      className="viewer-image"
                    />
                  ) : (
                    <iframe 
                      src={selectedInvoiceUrl} 
                      title={selectedInvoice.fileName}
                      className="viewer-iframe"
                    />
                  )
                )}
              </div>
            </div>
          ) : (
            <EmptyState
              icon="📄"
              title="Selecciona una factura"
              description="Haz clic en una factura de la lista para verla aquí"
            />
          )}
        </section>
      </div>

      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Eliminar factura"
        size="sm"
      >
        <p>¿Estás seguro de eliminar <strong>{showDeleteConfirm?.fileName}</strong>?</p>
        <div className="modal-footer">
          <button className="btn-outline" onClick={() => setShowDeleteConfirm(null)}>
            Cancelar
          </button>
          <button className="btn-danger" onClick={() => handleDeleteInvoice(showDeleteConfirm.id)}>
            Eliminar
          </button>
        </div>
      </Modal>
    </>
  )
}

export default Facturas