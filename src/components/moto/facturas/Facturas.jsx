import React, { useState, useEffect, useCallback } from 'react'
import { db } from '../../../services/db'
import { useGPX } from '../../../context/GPXContext'
import { Modal, SectionHeader } from '../../shared'
import { getMotoModel } from '../../../constants/motoModels'
import { FacturaForm } from './FacturaForm'
import { FacturaList } from './FacturaList'
import { FacturaViewerModal } from './FacturaViewerModal'

export const Facturas = () => {
  const { selectedMoto } = useGPX()
  const [invoices, setInvoices] = useState([])
  const [selectedInvoice, setSelectedInvoice] = useState(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null)
  const [openInvoiceForm, setOpenInvoiceForm] = useState(false)
  const [motos, setMotos] = useState([])
  const [workshops, setWorkshops] = useState([])
  const moto = getMotoModel(selectedMoto)

  // Load motos and workshops
  const loadMotos = useCallback(async () => {
    const motosData = await db.getAllMotorcycles()
    setMotos(motosData)
    return motosData
  }, [])

  const loadWorkshops = useCallback(async () => {
    const workshopsData = await db.getAllWorkshops()
    setWorkshops(workshopsData)
    return workshopsData
  }, [])

  // Cargar facturas de la moto seleccionada
  const loadInvoices = useCallback(async () => {
    if (!selectedMoto) return
    try {
      const invs = await db.getInvoicesByMoto(selectedMoto)
      setInvoices(invs)
    } catch (error) {
      console.error('Error cargando facturas:', error)
    }
  }, [selectedMoto])

  // Cargar datos iniciales
  useEffect(() => {
    if (selectedMoto) {
      loadInvoices()
      loadMotos()
      loadWorkshops()
    }
  }, [selectedMoto, loadInvoices, loadMotos, loadWorkshops])

  const handleDeleteInvoice = async (id) => {
    try {
      await db.deleteInvoice(id)
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

  const openInvoiceFormModal = useCallback(async (invoiceToEdit = null) => {
    try {
      await loadMotos()
      await loadWorkshops()
      if (invoiceToEdit) {
        setSelectedInvoice(invoiceToEdit)
      } else {
        setSelectedInvoice(null)
      }
      setOpenInvoiceForm(true)
    } catch (error) {
      console.error('Error cargando datos del formulario:', error)
    }
  }, [loadMotos, loadWorkshops])

  const handleSaveInvoice = useCallback(async (invoiceData) => {
    try {
      await db.saveInvoice(invoiceData)
      loadInvoices()
      setOpenInvoiceForm(false)
      setSelectedInvoice(null)
    } catch (error) {
      console.error('Error guardando factura:', error)
    }
  }, [loadInvoices])

  const handleEditInvoice = useCallback(async (invoice) => {
    openInvoiceFormModal(invoice)
  }, [openInvoiceFormModal])

  return (
    <>
      <SectionHeader
        title={`Facturas - ${moto.name}`}
        subtitle="Gestión de facturas y documentación"
        actions={
          <button
            className="btn btn-primary"
            onClick={() => openInvoiceFormModal()}
          >
            + Subir Factura
          </button>
        }
      />

      <div className="facturas-layout">
        <FacturaList
          invoices={invoices}
          selectedInvoice={selectedInvoice}
          onView={openInvoice}
          onEdit={handleEditInvoice}
          onDelete={(id) => setShowDeleteConfirm(invoices.find(i => i.id === id))}
          motos={motos}
          workshops={workshops}
        />

        <FacturaViewerModal
          selectedInvoice={selectedInvoice}
          onClose={() => setSelectedInvoice(null)}
        />
      </div>

      <Modal
        isOpen={openInvoiceForm}
        onClose={() => {
          setOpenInvoiceForm(false)
          setSelectedInvoice(null)
        }}
        title={selectedInvoice ? 'Editar Factura' : 'Subir y Registrar Factura'}
        size="lg"
      >
        <FacturaForm
          open={openInvoiceForm}
          setOpen={setOpenInvoiceForm}
          motos={motos}
          workshops={workshops}
          selectedMotoId={selectedMoto}
          onSave={handleSaveInvoice}
          initialData={selectedInvoice || {}}
        />
      </Modal>

      <Modal
        isOpen={!!showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(null)}
        title="Eliminar factura"
        size="sm"
      >
        <p>¿Estás seguro de eliminar <strong>{showDeleteConfirm?.fileName}</strong>?</p>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={() => setShowDeleteConfirm(null)}>
            Cancelar
          </button>
          <button className="btn btn-danger" onClick={() => handleDeleteInvoice(showDeleteConfirm.id)}>
            Eliminar
          </button>
        </div>
      </Modal>
    </>
  )
}

export default Facturas