import React from 'react'
import { useBlobUrl } from '../../../hooks/useBlobUrl'
import { EmptyState } from '../../shared'

export const FacturaViewerModal = ({ selectedInvoice, onClose }) => {
  const selectedInvoiceUrl = useBlobUrl(selectedInvoice?.blob || null)

  if (!selectedInvoice) {
    return (
      <EmptyState
        icon="Documentos"
        title="Selecciona una factura"
        description="Haz clic en una factura de la lista para verla aquí"
      />
    )
  }

  return (
    <section className="facturas-viewer">
      <div className="viewer-container">
        <div className="viewer-header">
          <h3>{selectedInvoice.fileName}</h3>
          <button
            className="btn-close-viewer"
            onClick={onClose}
            title="Cerrar"
          >
            Cerrar
          </button>
        </div>
        <div className="viewer-content">
          {selectedInvoiceUrl && (
            selectedInvoice.fileMimeType?.startsWith('image/') ? (
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
          {selectedInvoice.items && selectedInvoice.items.length > 0 && (
            <div className="invoice-breakdown">
              <h4>Desglose de la factura</h4>
              <table>
                <thead>
                  <tr>
                    <th>Concepto</th>
                    <th>Cantidad</th>
                    <th>Precio u.</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedInvoice.items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.description}</td>
                      <td>{item.quantity}</td>
                      <td>{item.unitPrice.toFixed(2)} €</td>
                      <td>{item.subtotal.toFixed(2)} €</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td></td>
                    <td></td>
                    <td>Total</td>
                    <td>{selectedInvoice.totalAmount.toFixed(2)} €</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

export default FacturaViewerModal