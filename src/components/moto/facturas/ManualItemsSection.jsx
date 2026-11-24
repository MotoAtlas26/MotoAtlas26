import React from 'react'
import { InvoiceItemRow } from './InvoiceItemRow'

export const ManualItemsSection = ({ itemsManual, setItemsManual }) => {
  return (
    <div className="manual-items-section">
      <h5>Líneas de factura</h5>
      <p className="small-text">Añade líneas de concepto y precio manualmente</p>
      <div className="items-list">
        {itemsManual.map((item) => (
          <InvoiceItemRow
            key={item.id}
            item={item}
            onDelete={(id) => setItemsManual(itemsManual.filter(i => i.id !== id))}
          />
        ))}
        <button
          type="button"
          className="btn btn-primary btn-sm"
          onClick={() => {
            const newItem = {
              id: crypto.randomUUID(),
              description: '',
              category: 'Otros',
              quantity: 1,
              unitPrice: 0
            }
            setItemsManual([...itemsManual, newItem])
          }}
        >
          + Añadir línea
        </button>
      </div>
    </div>
  )
}

export default ManualItemsSection