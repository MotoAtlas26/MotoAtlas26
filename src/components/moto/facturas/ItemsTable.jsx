import React from 'react'
import { InvoiceItemRow } from './InvoiceItemRow'

export const ItemsTable = ({
  parsedData,
  itemsManual,
  setItemsManual,
  onAddItem,
  onDeleteParsedItem
}) => {
  return (
    <div className="items-table">
      <h5>Líneas de factura</h5>
      <p className="small-text">
        {parsedData?.items?.length > 0
          ? `${parsedData.items.length} línea(s) detectada(s) del PDF`
          : 'Añade líneas de concepto + precio'}
      </p>
      <div className="items-list">
        {parsedData?.items?.map((item) => (
          <InvoiceItemRow
            key={item.id}
            item={item}
            onDelete={onDeleteParsedItem}
          />
        ))}

        {(!parsedData?.items || parsedData.items.length === 0) && (
          <InvoiceItemRow
            item={{
              id: crypto.randomUUID(),
              description: '',
              category: 'Otros',
              quantity: 1,
              unitPrice: 0
            }}
            onDelete={() => {}}
            isNew
          />
        )}
      </div>
      <button
        type="button"
        className="btn btn-primary btn-sm"
        onClick={onAddItem}
      >
        + Añadir línea
      </button>
    </div>
  )
}

export default ItemsTable