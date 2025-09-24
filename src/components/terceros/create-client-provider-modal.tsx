"use client"

import { useState } from "react"
import { X, Building, User, Users, Loader2 } from "lucide-react"
import { CreateClientProviderRequest } from "@/lib/api/client-provider-service"

interface CreateClientProviderModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateClientProviderRequest) => Promise<void>
  isLoading: boolean
}

export function CreateClientProviderModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading
}: CreateClientProviderModalProps) {
  const [formData, setFormData] = useState<CreateClientProviderRequest>({
    tipo_entidad: 'CLIENTE',
    nombre_comercial: '',
    categoria: '',
    sector_economico: '',
    nivel_riesgo: 'BAJO',
    codigo_interno: '',
    notas: ''
  })

  const [errors, setErrors] = useState<Partial<Record<keyof CreateClientProviderRequest, string>>>({})

  if (!isOpen) return null

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateClientProviderRequest, string>> = {}

    if (!formData.nombre_comercial.trim()) {
      newErrors.nombre_comercial = 'El nombre comercial es requerido'
    }

    if (!formData.categoria.trim()) {
      newErrors.categoria = 'La categoría es requerida'
    }

    if (!formData.sector_economico.trim()) {
      newErrors.sector_economico = 'El sector económico es requerido'
    }

    if (!formData.codigo_interno.trim()) {
      newErrors.codigo_interno = 'El código interno es requerido'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await onSubmit(formData)
      // Reset form on success
      setFormData({
        tipo_entidad: 'CLIENTE',
        nombre_comercial: '',
        categoria: '',
        sector_economico: '',
        nivel_riesgo: 'BAJO',
        codigo_interno: '',
        notas: ''
      })
      setErrors({})
    } catch (error) {
      // Error handling is done in the parent component
    }
  }

  const handleInputChange = (field: keyof CreateClientProviderRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleClose = () => {
    if (!isLoading) {
      setFormData({
        tipo_entidad: 'CLIENTE',
        nombre_comercial: '',
        categoria: '',
        sector_economico: '',
        nivel_riesgo: 'BAJO',
        codigo_interno: '',
        notas: ''
      })
      setErrors({})
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Crear Nuevo {formData.tipo_entidad === 'CLIENTE' ? 'Cliente' : 'Proveedor'}
              </h3>
            </div>
            {!isLoading && (
              <button
                type="button"
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Entity Type Selector */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Tipo de Entidad *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleInputChange('tipo_entidad', 'CLIENTE')}
                disabled={isLoading}
                className={`p-3 rounded-lg border-2 transition-all disabled:opacity-50 ${
                  formData.tipo_entidad === 'CLIENTE'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span className="font-medium">Cliente</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => handleInputChange('tipo_entidad', 'PROVEEDOR')}
                disabled={isLoading}
                className={`p-3 rounded-lg border-2 transition-all disabled:opacity-50 ${
                  formData.tipo_entidad === 'PROVEEDOR'
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Proveedor</span>
                </div>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Nombre Comercial */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nombre Comercial *
              </label>
              <input
                type="text"
                value={formData.nombre_comercial}
                onChange={(e) => handleInputChange('nombre_comercial', e.target.value)}
                disabled={isLoading}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.nombre_comercial
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Ej: Contadores Asociados Ltda"
              />
              {errors.nombre_comercial && (
                <p className="text-sm text-red-600 mt-1">{errors.nombre_comercial}</p>
              )}
            </div>

            {/* Categoría */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Categoría *
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => handleInputChange('categoria', e.target.value)}
                disabled={isLoading}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.categoria
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
              >
                <option value="">Selecciona una categoría</option>
                <option value="EMPRESA">Empresa</option>
                <option value="PERSONA_NATURAL">Persona Natural</option>
                <option value="ENTIDAD_PUBLICA">Entidad Pública</option>
                <option value="ONG">ONG</option>
                <option value="COOPERATIVA">Cooperativa</option>
              </select>
              {errors.categoria && (
                <p className="text-sm text-red-600 mt-1">{errors.categoria}</p>
              )}
            </div>

            {/* Sector Económico */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Sector Económico *
              </label>
              <input
                type="text"
                value={formData.sector_economico}
                onChange={(e) => handleInputChange('sector_economico', e.target.value)}
                disabled={isLoading}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.sector_economico
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Ej: Servicios profesionales contables"
              />
              {errors.sector_economico && (
                <p className="text-sm text-red-600 mt-1">{errors.sector_economico}</p>
              )}
            </div>

            {/* Nivel de Riesgo */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Nivel de Riesgo
              </label>
              <select
                value={formData.nivel_riesgo}
                onChange={(e) => handleInputChange('nivel_riesgo', e.target.value as 'ALTO' | 'MEDIO' | 'BAJO')}
                disabled={isLoading}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="BAJO">Bajo</option>
                <option value="MEDIO">Medio</option>
                <option value="ALTO">Alto</option>
              </select>
            </div>

            {/* Código Interno */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Código Interno *
              </label>
              <input
                type="text"
                value={formData.codigo_interno}
                onChange={(e) => handleInputChange('codigo_interno', e.target.value)}
                disabled={isLoading}
                className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed ${
                  errors.codigo_interno
                    ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                    : 'border-gray-300 dark:border-gray-600'
                }`}
                placeholder="Ej: PROV-001"
              />
              {errors.codigo_interno && (
                <p className="text-sm text-red-600 mt-1">{errors.codigo_interno}</p>
              )}
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Notas
              </label>
              <textarea
                value={formData.notas}
                onChange={(e) => handleInputChange('notas', e.target.value)}
                disabled={isLoading}
                rows={3}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                placeholder="Información adicional sobre el cliente/proveedor..."
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creando...
                </>
              ) : (
                <>
                  Crear {formData.tipo_entidad === 'CLIENTE' ? 'Cliente' : 'Proveedor'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}