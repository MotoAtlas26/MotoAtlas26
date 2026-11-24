/**
 * MantenimientoList - Lista de historial de mantenimientos con filtros
 * Recibe: { maintenances, motos, onEdit, onDelete, onCopySetup, filters, onFilterChange }
 */
import React from 'react'
import { MAINTENANCE_CATEGORIES } from './MantenimientoConstants'
import { EmptyState } from '../../../components/shared'

export const MantenimientoList = ({
  maintenances,
  motos,
  onEdit,
  onDelete,
  onCopySetup,
  filters,
  onFilterChange
}) => {
  // Calcular KPIs
  const totalGastado = maintenances
    .filter(m => m.cost && m.cost > 0)
    .reduce((sum, m) => sum + (m.cost || 0), 0)

  const ultimoKm = Math.max(
    ...maintenances.map(m => m.mileage || 0),
    0
  )

  const ultimoEngrase = maintenances
    .filter(m => m.category === 'Engrase / Tensión de cadena')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .at(0)

  const kmDesdeUltimoEngrase = ultimoEngrase
    ? Math.max(0, (ultimoKm || 0) - (ultimoEngrase.mileage || 0))
    : 0

  return (
    <div>
      <div style={{ marginTop: 'var(--space-4)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-3)', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)', flexWrap: 'wrap', alignItems: 'center' }}>
            <span className="small-text">Filtrar:</span>
            <select
              value={filters.category}
              onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
              className="form-select form-select-sm"
              style={{ width: '180px' }}
            >
              <option value="all">Todas las categorías</option>
              {MAINTENANCE_CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <select
              value={filters.moto}
              onChange={(e) => onFilterChange({ ...filters, moto: e.target.value })}
              className="form-select form-select-sm"
              style={{ width: '180px' }}
            >
              <option value="all">Todas las motos</option>
              {motos.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)' }}>
            Total gastado: {totalGastado.toFixed(2)} € | 
            Último km: {ultimoKm} km | 
            km desde último engrase: {kmDesdeUltimoEngrase} km
          </div>
        </div>

        {maintenances.length === 0 && (
          <EmptyState
            icon="🔧"
            title="No hay mantenimientos registrados"
            description="Añade tu primer mantenimiento usando el formulario de arriba"
          />
        )}

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--color-card)', color: 'var(--color-text-primary)' }}>
                <th style={{ padding: 'var(--space-2)', textAlign: 'left' }}>Fecha</th>
                <th style={{ padding: 'var(--space-2)', textAlign: 'left' }}>Moto</th>
                <th style={{ padding: 'var(--space-2)', textAlign: 'left' }}>Categoría</th>
                <th style={{ padding: 'var(--space-2)', textAlign: 'left' }}>Neumático</th>
                <th style={{ padding: 'var(--space-2)', textAlign: 'left' }}>Km</th>
                <th style={{ padding: 'var(--space-2)', textAlign: 'left' }}>Coste (€)</th>
                <th style={{ padding: 'var(--space-2)', textAlign: 'left' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {maintenances.map((m) => {
                const isTiresCategory = m.category === 'Neumáticos y presiones'
                const tireInfo = isTiresCategory && m.suspensionSetup?.neumaticos
                  ? (
                    <>
                      <div style={{ fontWeight: 500 }}>
                        Del: {(m.suspensionSetup.neumaticos.frontBrand || m.suspensionSetup.neumaticos.brand || '')} {(m.suspensionSetup.neumaticos.frontModel || m.suspensionSetup.neumaticos.model || '')} {(m.suspensionSetup.neumaticos.frontSize && `(${m.suspensionSetup.neumaticos.frontSize})`)} · {(m.suspensionSetup.neumaticos.delantero?.value ? `${m.suspensionSetup.neumaticos.delantero.value} bar` : '—')}
                      </div>
                      <div style={{ fontSize: '0.85em', color: 'var(--color-text-secondary)', marginTop: '2px' }}>
                        Tras: {(m.suspensionSetup.neumaticos.rearBrand || m.suspensionSetup.neumaticos.brand || '')} {(m.suspensionSetup.neumaticos.rearModel || m.suspensionSetup.neumaticos.model || '')} {(m.suspensionSetup.neumaticos.rearSize && `(${m.suspensionSetup.neumaticos.rearSize})`)} · {(m.suspensionSetup.neumaticos.trasero?.value ? `${m.suspensionSetup.neumaticos.trasero.value} bar` : '—')}
                      </div>
                    </>
                  )
                  : '—'
                return (
                  <tr key={m.id} style={{ background: 'var(--color-card)', color: 'var(--color-text-primary)' }}>
                    <td style={{ padding: 'var(--space-2)' }}>{new Date(m.date).toLocaleDateString()}</td>
                    <td style={{ padding: 'var(--space-2)' }}>{m.motoId || '—'}</td>
                    <td style={{ padding: 'var(--space-2)' }}>{m.category || '—'}</td>
                    <td style={{ padding: 'var(--space-2)' }}>{tireInfo}</td>
                    <td style={{ padding: 'var(--space-2)' }}>{m.mileage || 0}</td>
                    <td style={{ padding: 'var(--space-2)' }}>{m.cost || 0} €</td>
                    <td style={{ padding: 'var(--space-2)' }}>
                      <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                        <button
                          type="button"
                          className="btn btn-outline btn-outline-sm"
                          onClick={() => {
                            const setup = m.suspensionSetup || {}
                            onCopySetup(setup)
                            onEdit(m)
                          }}
                        >
                          Copiar ajustes
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline btn-outline-sm"
                          onClick={() => onEdit(m)}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          className="btn btn-danger btn-danger-sm"
                          onClick={() => {
                            if (window.confirm('¿Eliminar este mantenimiento?')) {
                              onDelete(m.id)
                            }
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}