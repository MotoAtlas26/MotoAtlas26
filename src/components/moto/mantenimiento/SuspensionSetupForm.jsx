/**
 * SuspensionSetupForm - Bloque técnico de suspensiones y neumáticos
 * Muestra campos exclusivos según categoría:
 * - 'Reglaje / Tarado de suspensiones': solo Horquilla + Amortiguador
 * - 'Neumáticos y presiones': selector de neumáticos Dexie + Presiones (bar) + escenario
 */
import React from 'react'
import { SUSPENSION_FIELDS } from './MantenimientoConstants'

export const SuspensionSetupForm = ({ 
  category, 
  setup, 
  onFieldChange, 
  tires, 
  selectedTireId, 
  setSelectedTireId 
}) => {
  const isSuspension = category === 'Reglaje / Tarado de suspensiones'
  const isTires = category === 'Neumáticos y presiones'

  if (!isSuspension && !isTires) return null

  return (
    <div style={{ marginTop: 'var(--space-3)', borderTop: '1px solid var(--color-card-border)', paddingTop: 'var(--space-3)' }}>
      <h5 style={{ margin: '0 0 var(--space-2)', color: 'var(--color-text-secondary)' }}>
        {isSuspension ? 'Ajustes de Suspensión' : 'Presiones de Neumáticos'}
      </h5>

      {/* Bloque de Suspensiones (solo para categoría 'Reglaje / Tarado de suspensiones') */}
      {isSuspension && (
        <>
          {/* Horquilla Delantera */}
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <span className="form-label">Horquilla Delantera</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
              <div>
                <span>Precarga</span>
                <input
                  type="number"
                  value={setup?.horquilla?.precarga?.value || ''}
                  onChange={(e) => onFieldChange('horquilla', 'precarga', { value: e.target.value, unit: 'vueltas' })}
                  className="form-input form-input-sm"
                  min="0"
                  step="0.5"
                />
                <span className="form-label-sm">{setup?.horquilla?.precarga?.unit || 'vueltas'}</span>
              </div>
              <div>
                <span>Compresión</span>
                <input
                  type="number"
                  value={setup?.horquilla?.compresion?.value || ''}
                  onChange={(e) => onFieldChange('horquilla', 'compresion', { value: e.target.value, unit: 'clics' })}
                  className="form-input form-input-sm"
                  min="0"
                  step="1"
                />
                <span className="form-label-sm">{setup?.horquilla?.compresion?.unit || 'clics'}</span>
              </div>
            </div>
            <div style={{ marginTop: 'var(--space-1)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
              <div>
                <span>Extensión / Rebote</span>
                <input
                  type="number"
                  value={setup?.horquilla?.extension?.value || ''}
                  onChange={(e) => onFieldChange('horquilla', 'extension', { value: e.target.value, unit: 'clics' })}
                  className="form-input form-input-sm"
                  min="0"
                  step="1"
                />
                <span className="form-label-sm">{setup?.horquilla?.extension?.unit || 'clics'}</span>
              </div>
              <div>
                <span>Compresión Alta</span>
                <input
                  type="number"
                  value={setup?.horquilla?.compresion_alta?.value || ''}
                  onChange={(e) => onFieldChange('horquilla', 'compresion_alta', { value: e.target.value, unit: 'clics' })}
                  className="form-input form-input-sm"
                  min="0"
                  step="1"
                />
                <span className="form-label-sm">{setup?.horquilla?.compresion_alta?.unit || 'clics'}</span>
              </div>
            </div>
          </div>

          {/* Amortiguador Trasero */}
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <span className="form-label">Amortiguador Trasero</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
              <div>
                <span>Precarga</span>
                <input
                  type="number"
                  value={setup?.amortiguador?.precarga?.value || ''}
                  onChange={(e) => onFieldChange('amortiguador', 'precarga', { value: e.target.value, unit: 'clics/mm' })}
                  className="form-input form-input-sm"
                  min="0"
                  step="0.5"
                />
                <span className="form-label-sm">{setup?.amortiguador?.precarga?.unit || 'clics/mm'}</span>
              </div>
              <div>
                <span>Compresión Alta</span>
                <input
                  type="number"
                  value={setup?.amortiguador?.compresion_alta?.value || ''}
                  onChange={(e) => onFieldChange('amortiguador', 'compresion_alta', { value: e.target.value, unit: 'clics' })}
                  className="form-input form-input-sm"
                  min="0"
                  step="1"
                />
                <span className="form-label-sm">{setup?.amortiguador?.compresion_alta?.unit || 'clics'}</span>
              </div>
            </div>
            <div style={{ marginTop: 'var(--space-1)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)' }}>
              <div>
                <span>Compresión Baja</span>
                <input
                  type="number"
                  value={setup?.amortiguador?.compresion_baja?.value || ''}
                  onChange={(e) => onFieldChange('amortiguador', 'compresion_baja', { value: e.target.value, unit: 'clics' })}
                  className="form-input form-input-sm"
                  min="0"
                  step="1"
                />
                <span className="form-label-sm">{setup?.amortiguador?.compresion_baja?.unit || 'clics'}</span>
              </div>
              <div>
                <span>Extensión / Rebote</span>
                <input
                  type="number"
                  value={setup?.amortiguador?.extension?.value || ''}
                  onChange={(e) => onFieldChange('amortiguador', 'extension', { value: e.target.value, unit: 'clics' })}
                  className="form-input form-input-sm"
                  min="0"
                  step="1"
                />
                <span className="form-label-sm">{setup?.amortiguador?.extension?.unit || 'clics'}</span>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Bloque de Presiones de Neumáticos (solo para categoría 'Neumáticos y presiones') */}
      {isTires && (
        <div style={{ marginBottom: 'var(--space-3)' }}>
          {/* Selector de neumático del catálogo */}
          <div style={{ marginBottom: 'var(--space-3)' }}>
            <span className="form-label">Neumático montado</span>
            <select
              value={selectedTireId || ''}
              onChange={(e) => {
                const tireId = e.target.value
                setSelectedTireId(tireId)
                if (tireId) {
                  const tire = tires.find(t => t.id === parseInt(tireId))
                  if (tire) {
                    // Populate separate front/rear fields (new schema)
                    onFieldChange('neumaticos', 'frontBrand', { value: tire.frontBrand || tire.brand })
                    onFieldChange('neumaticos', 'frontModel', { value: tire.frontModel || tire.model })
                    onFieldChange('neumaticos', 'frontSize', { value: tire.frontSize })
                    onFieldChange('neumaticos', 'rearBrand', { value: tire.rearBrand || tire.brand })
                    onFieldChange('neumaticos', 'rearModel', { value: tire.rearModel || tire.model })
                    onFieldChange('neumaticos', 'rearSize', { value: tire.rearSize })
                    // Also populate legacy fields for compatibility
                    onFieldChange('neumaticos', 'brand', { value: tire.frontBrand || tire.brand })
                    onFieldChange('neumaticos', 'model', { value: tire.frontModel || tire.model })
                    if (tire.recommendedFrontBar && !setup?.neumaticos?.delantero?.value) {
                      onFieldChange('neumaticos', 'delantero', { value: tire.recommendedFrontBar.toString(), unit: 'bar' })
                    }
                    if (tire.recommendedRearBar && !setup?.neumaticos?.trasero?.value) {
                      onFieldChange('neumaticos', 'trasero', { value: tire.recommendedRearBar.toString(), unit: 'bar' })
                    }
                  }
                }
              }}
              className="form-select form-select-md"
            >
              <option value="">Otro / Introducción manual</option>
              {tires.map(tire => (
                <option key={tire.id} value={tire.id}>
                  {(tire.frontBrand || tire.brand)} {(tire.frontModel || tire.model)} · {(tire.rearBrand || tire.brand)} {(tire.rearModel || tire.model)} · {tire.frontSize} / {tire.rearSize}
                </option>
              ))}
            </select>
          </div>

          {/* Campos del neumático - Rueda Delantera */}
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <span className="form-label" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Rueda Delantera</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
              <div>
                <span className="form-label">Marca</span>
                <input
                  type="text"
                  value={setup?.neumaticos?.frontBrand || setup?.neumaticos?.brand || ''}
                  onChange={(e) => onFieldChange('neumaticos', 'frontBrand', { value: e.target.value })}
                  className="form-input form-input-sm"
                  placeholder="Ej: Michelin, Pirelli, Metzeler..."
                />
              </div>
              <div>
                <span className="form-label">Modelo</span>
                <input
                  type="text"
                  value={setup?.neumaticos?.frontModel || setup?.neumaticos?.model || ''}
                  onChange={(e) => onFieldChange('neumaticos', 'frontModel', { value: e.target.value })}
                  className="form-input form-input-sm"
                  placeholder="Ej: Anakee Wild, Scorpion Rally..."
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
              <div>
                <span className="form-label">Medida</span>
                <input
                  type="text"
                  value={setup?.neumaticos?.frontSize || ''}
                  onChange={(e) => onFieldChange('neumaticos', 'frontSize', { value: e.target.value })}
                  className="form-input form-input-sm"
                  placeholder="Ej: 90/90-21, 110/80 R19"
                />
              </div>
              <div>
                <span className="form-label">Presión (bar)</span>
                <input
                  type="number"
                  value={setup?.neumaticos?.delantero?.value || ''}
                  onChange={(e) => onFieldChange('neumaticos', 'delantero', { value: e.target.value, unit: 'bar' })}
                  className="form-input form-input-sm"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Campos del neumático - Rueda Trasera */}
          <div style={{ marginBottom: 'var(--space-2)' }}>
            <span className="form-label" style={{ fontWeight: 600, color: 'var(--color-primary)' }}>Rueda Trasera</span>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
              <div>
                <span className="form-label">Marca</span>
                <input
                  type="text"
                  value={setup?.neumaticos?.rearBrand || setup?.neumaticos?.brand || ''}
                  onChange={(e) => onFieldChange('neumaticos', 'rearBrand', { value: e.target.value })}
                  className="form-input form-input-sm"
                  placeholder="Ej: Michelin, Pirelli, Metzeler..."
                />
              </div>
              <div>
                <span className="form-label">Modelo</span>
                <input
                  type="text"
                  value={setup?.neumaticos?.rearModel || setup?.neumaticos?.model || ''}
                  onChange={(e) => onFieldChange('neumaticos', 'rearModel', { value: e.target.value })}
                  className="form-input form-input-sm"
                  placeholder="Ej: Anakee Wild, Scorpion Rally..."
                />
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginTop: 'var(--space-1)' }}>
              <div>
                <span className="form-label">Medida</span>
                <input
                  type="text"
                  value={setup?.neumaticos?.rearSize || ''}
                  onChange={(e) => onFieldChange('neumaticos', 'rearSize', { value: e.target.value })}
                  className="form-input form-input-sm"
                  placeholder="Ej: 150/70 R18, 150/70 R17"
                />
              </div>
              <div>
                <span className="form-label">Presión (bar)</span>
                <input
                  type="number"
                  value={setup?.neumaticos?.trasero?.value || ''}
                  onChange={(e) => onFieldChange('neumaticos', 'trasero', { value: e.target.value, unit: 'bar' })}
                  className="form-input form-input-sm"
                  min="0"
                  step="0.1"
                />
              </div>
            </div>
          </div>

          {/* Presiones de Neumáticos - unidad en la etiqueta (legacy, kept for compatibility) */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-2)', marginBottom: 'var(--space-2)' }}>
            <div>
              <span className="form-label">Delantero (bar)</span>
              <input
                type="number"
                value={setup?.neumaticos?.delantero?.value || ''}
                onChange={(e) => onFieldChange('neumaticos', 'delantero', { value: e.target.value, unit: 'bar' })}
                className="form-input form-input-sm"
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <span className="form-label">Trasero (bar)</span>
              <input
                type="number"
                value={setup?.neumaticos?.trasero?.value || ''}
                onChange={(e) => onFieldChange('neumaticos', 'trasero', { value: e.target.value, unit: 'bar' })}
                className="form-input form-input-sm"
                min="0"
                step="0.1"
              />
            </div>
          </div>
          <div style={{ marginTop: 'var(--space-1)' }}>
            <span className="form-label">Escenario</span>
            <select
              onChange={(e) => onFieldChange('neumaticos', 'escenario', { value: e.target.value })}
              className="form-select form-select-sm"
            >
              <option value="Carretera solo">Carretera solo</option>
              <option value="Con pasajero y equipaje">Con pasajero y equipaje</option>
              <option value="Off-road / Trail">Off-road / Trail</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}