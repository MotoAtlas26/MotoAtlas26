import React, { useState, useEffect } from 'react'
import { useDatabase } from '../../hooks/useDatabase'
import { useGPX } from '../../context/GPXContext'
import { getMotoModel, getMotoModelsArray } from '../../constants/motoModels'
import { formatDate } from '../../utils/formatters'
import { HomeIcon, WrenchIcon, ShieldIcon, FileTextIcon, CalendarIcon, PhoneIcon, FolderIcon, PlusIcon, TrashIcon, EditIcon, EyeIcon, DownloadIcon, UploadIcon } from '../shared/Icons'

const getDaysUntil = (dateStr) => {
  if (!dateStr) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr)
  target.setHours(0, 0, 0, 0)
  const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24))
  return diff
}

const getExpirationStatus = (days) => {
  if (days === null) return { label: 'Sin fecha', color: 'var(--color-text-secondary)', bg: 'var(--color-secondary-light)' }
  if (days < 0) return { label: `Caducado (${Math.abs(days)} días)`, color: 'var(--color-error)', bg: 'rgba(239, 68, 68, 0.1)' }
  if (days <= 30) return { label: `${days} días`, color: 'var(--color-secondary)', bg: 'rgba(245, 158, 11, 0.1)' }
  return { label: `${days} días`, color: 'var(--color-success)', bg: 'rgba(34, 197, 94, 0.1)' }
}

export const MotoDashboard = ({ selectedMoto }) => {
  const { selectedMoto: gpxSelectedMoto } = useGPX()
  const moto = getMotoModel(selectedMoto || gpxSelectedMoto)
  const motosArray = getMotoModelsArray()
  const {
    getMotoDocumentsByMoto,
    getAllMotoDocuments,
    getMotoMaintenanceByMoto,
    getAllMotoMaintenance,
    getMotoInvoicesByMoto,
    getAllMotoInvoices
  } = useDatabase()

  const [documents, setDocuments] = useState([])
  const [maintenance, setMaintenance] = useState([])
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [docs, maint, invs] = await Promise.all([
          selectedMoto ? getMotoDocumentsByMoto(selectedMoto) : getAllMotoDocuments(),
          selectedMoto ? getMotoMaintenanceByMoto(selectedMoto) : getAllMotoMaintenance(),
          selectedMoto ? getMotoInvoicesByMoto(selectedMoto) : getAllMotoInvoices()
        ])
        setDocuments(docs)
        setMaintenance(maint)
        setInvoices(invs)
      } catch (err) {
        console.error('Error loading dashboard data:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [selectedMoto, getMotoDocumentsByMoto, getAllMotoDocuments, getMotoMaintenanceByMoto, getAllMotoMaintenance, getMotoInvoicesByMoto, getAllMotoInvoices])

  // Calculate stats
  const totalExpenses = [...invoices, ...maintenance].reduce((sum, item) => sum + (item.amount || 0), 0)
  const lastKm = [...maintenance, ...invoices]
    .filter(item => item.km)
    .sort((a, b) => (b.km || 0) - (a.km || 0))[0]?.km || 0
  const lastChainLube = maintenance
    .filter(m => m.category === 'chain' && m.km)
    .sort((a, b) => (b.km || 0) - (a.km || 0))[0]?.km || 0
  const lastSuspensionSetup = maintenance
    .filter(m => m.category === 'suspension' && m.km)
    .sort((a, b) => (b.km || 0) - (a.km || 0))[0]

  // Recent activity (last 10 items)
  const recentActivity = [...invoices, ...maintenance, ...documents]
    .map(item => ({
      ...item,
      type: item.amount !== undefined ? (item.items ? 'invoice' : 'maintenance') : 'document',
      date: item.date || item.expirationDate || item.createdAt
    }))
    .filter(item => item.date)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 10)

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
        <div style={{ color: 'var(--color-text-secondary)' }}>Cargando dashboard...</div>
      </div>
    )
  }

  return (
    <section className="moto-stats-overview" id="panel-dashboard" role="tabpanel" aria-labelledby="tab-dashboard">
      {/* 4 Tarjetas KPI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-3)', marginBottom: 'var(--space-4)' }}>
        {/* Card 1: Gasto total acumulado */}
        <div style={{
          background: 'var(--color-card)',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--space-4)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', color: 'var(--color-primary)', marginBottom: 'var(--space-1)' }}>
            € {totalExpenses.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Gasto total Facturas + Mantenimientos</div>
        </div>

        {/* Card 2: Último kilometraje registrado */}
        <div style={{
          background: 'var(--color-card)',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--space-4)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', color: 'var(--color-secondary)', marginBottom: 'var(--space-1)' }}>
            {lastKm.toLocaleString('es-ES')} km
          </div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>Último km registrado</div>
        </div>

        {/* Card 3: Último engrase de cadena */}
        <div style={{
          background: 'var(--color-card)',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--space-4)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', color: 'var(--color-primary-dark)', marginBottom: 'var(--space-1)' }}>
            {lastChainLube ? `${lastChainLube.toLocaleString('es-ES')} km` : '—'}
          </div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            {lastChainLube ? `${(lastKm - lastChainLube).toLocaleString('es-ES')} km desde` : 'Sin registros'}
          </div>
        </div>

        {/* Card 4: Tarado de suspensión activo */}
        <div style={{
          background: 'var(--color-card)',
          border: '1px solid var(--color-card-border)',
          borderRadius: 'var(--radius-card)',
          padding: 'var(--space-4)',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '2rem', color: 'var(--color-tertiary)', marginBottom: 'var(--space-1)' }}>
            {lastSuspensionSetup ? 'Configurado' : 'Ninguno'}
          </div>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.85rem' }}>
            {lastSuspensionSetup ? `Último: ${lastSuspensionSetup.km.toLocaleString('es-ES')} km` : 'Último registro suspensionSetup'}
          </div>
        </div>
      </div>

      {/* Gráfica visual de gastos por categoría (SVG/CSS puro) */}
      <div style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-card-border)',
        borderRadius: 'var(--radius-card)',
        padding: 'var(--space-4)',
        marginTop: 'var(--space-4)'
      }}>
        <h4 style={{ margin: '0 0 var(--space-3)', color: 'var(--color-text-primary)' }}>Gastos por Categoría</h4>
        <div style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: 'var(--space-2)',
          height: '120px'
        }}>
          {['Engrase / Tensión de cadena', 'Cambio de pieza / Recambio', 'Reglaje / Tarado de suspensiones', 'Aceite y filtros', 'Neumáticos y presiones', 'Revisión general / Otros'].map((cat, i) => {
            const catMaintenance = maintenance.filter(m => m.category === cat.toLowerCase().replace(/\s+/g, '_').replace('/', '_'))
            const catInvoices = invoices.filter(i => i.category === cat.toLowerCase().replace(/\s+/g, '_').replace('/', '_'))
            const catTotal = [...catMaintenance, ...catInvoices].reduce((sum, item) => sum + (item.amount || 0), 0)
            const maxTotal = Math.max(...['Engrase / Tensión de cadena', 'Cambio de pieza / Recambio', 'Reglaje / Tarado de suspensiones', 'Aceite y filtros', 'Neumáticos y presiones', 'Revisión general / Otros'].map(c => {
              const m = maintenance.filter(m => m.category === c.toLowerCase().replace(/\s+/g, '_').replace('/', '_'))
              const inv = invoices.filter(i => i.category === c.toLowerCase().replace(/\s+/g, '_').replace('/', '_'))
              return [...m, ...inv].reduce((sum, item) => sum + (item.amount || 0), 0)
            }))
            const heightPercent = maxTotal > 0 ? Math.max(10, (catTotal / maxTotal) * 100) : 10

            return (
              <div key={cat} style={{
                flex: '1',
                background: i % 2 === 0 ? 'var(--color-primary)' : 'var(--color-secondary)',
                height: `${heightPercent}%`,
                minHeight: '20px',
                borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <span style={{
                  position: 'absolute',
                  bottom: '0',
                  left: '0',
                  right: '0',
                  padding: 'var(--space-1)',
                  color: 'var(--color-primary-contrast)',
                  fontSize: '0.65rem',
                  textAlign: 'center'
                }}>
                  {cat} (€{catTotal.toLocaleString('es-ES')})
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Actividad reciente unificada */}
      <div style={{
        background: 'var(--color-card)',
        border: '1px solid var(--color-card-border)',
        borderRadius: 'var(--radius-card)',
        padding: 'var(--space-4)',
        marginTop: 'var(--space-4)'
      }}>
        <h4 style={{ margin: '0 0 var(--space-3)', color: 'var(--color-text-primary)' }}>Actividad Reciente Unificada</h4>
        <div style={{
          maxHeight: '300px',
          overflowY: 'auto',
          borderRadius: 'var(--radius-sm)',
          background: 'var(--color-card)',
          border: '1px solid var(--color-card-border)'
        }}>
          {recentActivity.length === 0 ? (
            <p style={{ padding: 'var(--space-3)', color: 'var(--color-text-secondary)', textAlign: 'center' }}>
              Sin actividad reciente
            </p>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {recentActivity.map((item, idx) => (
                <li key={`${item.type}-${item.id}-${idx}`} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-3)',
                  padding: 'var(--space-3)',
                  borderBottom: idx < recentActivity.length - 1 ? '1px solid var(--color-card-border)' : 'none'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: item.type === 'invoice' ? 'var(--color-primary-light)' :
                              item.type === 'maintenance' ? 'var(--color-secondary-light)' : 'var(--color-tertiary-light)',
                    color: item.type === 'invoice' ? 'var(--color-primary)' :
                           item.type === 'maintenance' ? 'var(--color-secondary)' : 'var(--color-tertiary)',
                    flexShrink: 0
                  }}>
                    {item.type === 'invoice' && <FileTextIcon size={20} />}
                    {item.type === 'maintenance' && <WrenchIcon size={20} />}
                    {item.type === 'document' && <ShieldIcon size={20} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 500, color: 'var(--color-text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.type === 'invoice' ? item.title || 'Factura' :
                       item.type === 'maintenance' ? item.title || item.category : item.title}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--color-text-secondary)' }}>
                      {formatDate(item.date)} • {item.type === 'invoice' ? `€${(item.amount || 0).toLocaleString('es-ES')}` :
                       item.type === 'maintenance' ? `${item.km ? item.km.toLocaleString('es-ES') + ' km' : ''} ${item.category}` :
                       item.docType}
                    </div>
                  </div>
                  {item.amount !== undefined && (
                    <div style={{ fontWeight: 600, color: 'var(--color-primary)', whiteSpace: 'nowrap' }}>
                      €{(item.amount || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  )
}

export default MotoDashboard