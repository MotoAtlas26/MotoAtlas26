import React, { useState } from 'react'
import { TrashIcon } from '../../shared/Icons'

/**
 * Invoice Item Row Component
 */
export const InvoiceItemRow = ({ item, onDelete, onUpdate, isNew = false }) => {
  const [isEditing, setIsEditing] = useState(isNew)
  const [desc, setDesc] = useState(item.description)
  const [qty, setQty] = useState(item.quantity)
  const [price, setPrice] = useState(item.unitPrice)

  const subtotal = qty * price

  if (!isEditing) {
    return (
      <div className="invoice-item-row" onClick={() => setIsEditing(true)}>
        <span className="item-desc">{item.description}</span>
        <span className="item-qty">{item.quantity} x</span>
        <span className="item-price">{item.unitPrice.toFixed(2)} €</span>
        <span className="item-subtotal">{subtotal.toFixed(2)} €</span>
      </div>
    )
  }

  return (
    <div className="invoice-item-row editing">
      <input
        type="text"
        value={desc}
        onChange={(e) => setDesc(e.target.value)}
        className="form-input form-input-sm"
        placeholder="Descripción"
      />
      <input
        type="number"
        value={qty}
        onChange={(e) => setQty(parseFloat(e.target.value) || 0)}
        className="form-input form-input-sm"
        min="0"
        step="0.01"
        placeholder="Cant."
      />
      <input
        type="number"
        value={price}
        onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
        className="form-input form-input-sm"
        min="0"
        step="0.01"
        placeholder="€/u."
      />
      <span className="item-subtotal">{subtotal.toFixed(2)} €</span>
      <button
        type="button"
        className="btn btn-danger btn-danger-sm"
        onClick={() => {
          setIsEditing(false)
          onDelete(item.id)
        }}
      >
        Cancelar
      </button>
    </div>
  )
}

export default InvoiceItemRow