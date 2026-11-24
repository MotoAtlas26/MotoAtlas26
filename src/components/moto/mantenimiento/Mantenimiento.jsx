/**
 * Mantenimiento - Orquestador principal del módulo de mantenimiento
 * Componente ligero que coordina Form y List
 */
import React, { useState, useEffect, useCallback } from 'react'
import { useGPX } from '../../../context/GPXContext'
import { useDatabase } from '../../../hooks/useDatabase'
import { getMotoModel } from '../../../constants/motoModels'
import { SectionHeader } from '../../../components/shared'
import { MantenimientoForm } from './MantenimientoForm'
import { MantenimientoList } from './MantenimientoList'
import { MAINTENANCE_CATEGORIES } from './MantenimientoConstants'

export const Mantenimiento = () => {
  const { selectedMoto } = useGPX()
  const moto = getMotoModel(selectedMoto)
  const { 
    saveMaintenanceRecord, 
    getMaintenancesByMoto, 
    getAllMaintenances, 
    getAllTires, 
    deleteMaintenanceRecord 
  } = useDatabase()
  
  const [motos, setMotos] = useState([])
  const [maintenances, setMaintenances] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [copiedSetup, setCopiedSetup] = useState(null)
  const [tires, setTires] = useState([])
  const [filters, setFilters] = useState({ category: 'all', moto: 'all', workshop: 'all' })

  // Cargar motos disponibles
  useEffect(() => {
    if (selectedMoto) {
      setMotos([{ id: selectedMoto, name: selectedMoto }])
    }
  }, [selectedMoto])

  // Cargar historial
  const loadMaintenances = useCallback(async () => {
    const all = await getAllMaintenances()
    let filtered = all

    // Filtrar por moto
    if (filters.moto !== 'all' && filters.moto) {
      filtered = filtered.filter(m => m.motoId === filters.moto)
    }

    // Filtrar por categoría
    if (filters.category !== 'all' && filters.category) {
      filtered = filtered.filter(m => m.category === filters.category)
    }

    setMaintenances(filtered)
  }, [filters.moto, filters.category, getAllMaintenances])

  useEffect(() => {
    loadMaintenances()
  }, [loadMaintenances])

  // Cargar catálogo de neumáticos
  useEffect(() => {
    const loadTires = async () => {
      const allTires = await getAllTires()
      setTires(allTires)
    }
    loadTires()
  }, [getAllTires])

  // Guardar mantenimiento
  const handleSave = useCallback(async (formData) => {
    const maintenanceData = {
      id: editingId || undefined,
      motoId: formData.motoId,
      workshop: formData.workshop,
      date: formData.date,
      mileage: formData.mileage,
      type: formData.category,
      title: formData.title,
      cost: formData.cost,
      details: formData.description,
      suspensionSetup: formData.suspensionSetup || null,
      createdAt: new Date()
    }

    if (editingId) {
      await saveMaintenanceRecord(editingId, maintenanceData)
    } else {
      await saveMaintenanceRecord(maintenanceData)
    }

    // Reset form
    setShowForm(false)
    setEditingId(null)
    setCopiedSetup(null)
    loadMaintenances()
  }, [editingId, saveMaintenanceRecord, loadMaintenances])

  // Copiar ajustes de un mantenimiento anterior
  const copySetup = useCallback((setup) => {
    setCopiedSetup(setup)
  }, [])

  // Editar mantenimiento
  const handleEdit = useCallback((maintenance) => {
    setEditingId(maintenance.id)
    setShowForm(true)
    // El formulario se rellenará via initialData prop
  }, [])

  // Eliminar mantenimiento
  const handleDelete = useCallback(async (id) => {
    await deleteMaintenanceRecord(id)
    loadMaintenances()
  }, [deleteMaintenanceRecord, loadMaintenances])

  // Cancelar formulario
  const handleCancel = useCallback(() => {
    setShowForm(false)
    setEditingId(null)
    setCopiedSetup(null)
  }, [])

  // Datos iniciales para el formulario (cuando se edita)
  const initialData = editingId 
    ? maintenances.find(m => m.id === editingId) 
    : null

  // Preparar datos para el formulario cuando se edita
  const formInitialData = initialData ? {
    motoId: initialData.motoId,
    workshop: initialData.workshop,
    category: initialData.category,
    date: initialData.date,
    mileage: initialData.mileage,
    title: initialData.title,
    description: initialData.details,
    cost: initialData.cost,
    suspensionSetup: initialData.suspensionSetup || {}
  } : null

  return (
    <div>
      <SectionHeader
        title="Bitácora Técnica de Mantenimiento"
        subtitle={`Moto: ${moto.name || 'Selecciona una moto'}`}
        actions={
          !showForm && (
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => {
                setEditingId(null)
                setShowForm(true)
              }}
            >
              + Registrar Mantenimiento
            </button>
          )
        }
      />

      {/* Formulario de Registro - Condicional */}
      {showForm && (
        <div style={{ margin: 'var(--space-4) 0' }}>
          <MantenimientoForm
            motos={motos}
            workshops={['Mantenimiento propio (DIY)']}
            tires={tires}
            initialData={formInitialData}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      )}

      {/* Historial de Mantenimiento */}
      <MantenimientoList
        maintenances={maintenances}
        motos={motos}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCopySetup={copySetup}
        filters={filters}
        onFilterChange={setFilters}
      />
    </div>
  )
}

export default Mantenimiento