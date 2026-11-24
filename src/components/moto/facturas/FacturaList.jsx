import React from 'react'
import { EmptyState } from '../../shared'
import { formatDate, getFileIcon } from '../../../utils/formatters'
import { TrashIcon } from '../../shared/Icons'

/**
 * Invoice List Item Component
 */
const InvoiceListItem = ({
  invoice,
  selectedInvoiceId,
  onView,
  onEdit,
  onDelete,
  motos,
  workshops
}) => {
  const moto = motos.find((m) => m.id === invoice.motoId) || null
  const workshop = workshops.find((w) => w.id === invoice.workshopId) || null
  const workshopText = workshop ? workshop.name : 'Mantenimiento propio (DIY)'

  return (
    <div
      key={invoice.id}
      className={`invoice-item ${selectedInvoiceId === invoice.id ? 'active' : ''}`}
      onClick={() => onView(invoice)}
    >
      <span className="invoice-icon-sm">{getFileIcon(invoice.fileMimeType)}</span>
      <div className="invoice-item-info">
        <div className="invoice-item-name">
          {moto?.name || 'Moto desconocida'}
        </div>
        <div className="invoice-item-meta">
          <span>{formatDate(invoice.date)}</span>
          <span className="separator">•</span>
          <span>{invoice.invoiceNumber || '—'}</span>
          <span className="separator">•</span>
          <span>{workshopText}</span>
        </div>
      </div>
      <div className="invoice-item-actions">
        <button
          className="btn-view-sm"
          title="Ver"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          Ver
        </button>
        <button
          className="btn-edit-sm"
          title="Editar"
          onClick={(e) => {
            e.stopPropagation()
            onEdit(invoice)
          }}
        >
          Editar
        </button>
        <button
          className="btn-delete-sm"
          title="Eliminar"
          onClick={(e) => {
            e.stopPropagation()
            onDelete(invoice.id)
          }}
        >
          <TrashIcon size={18} />
        </button>
      </div>
    </div>
  )
}

export const FacturaList = ({
  invoices,
  selectedInvoice,
  onView,
  onEdit,
  onDelete,
  motos,
  workshops
}) => {
  return (
    <aside className="facturas-list">
      <div className="list-header">
        <h3>Facturas ({invoices.length})</h3>
      </div>
      <div className="invoices-scroll">
        {invoices.length === 0 ? (
          <EmptyState
            icon="Documentos"
            title="No hay facturas"
            description="Sube tu primera factura desde el dashboard de la moto"
          />
        ) : (
          invoices.map((invoice) => (
            <InvoiceListItem
              key={invoice.id}
              invoice={invoice}
              selectedInvoiceId={selectedInvoice?.id}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              motos={motos}
              workshops={workshops}
            />
          ))
        )}
      </div>
    </aside>
  )
}

export default FacturaList