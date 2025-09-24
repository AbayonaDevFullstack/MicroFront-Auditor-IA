"use client"

import { useState, useEffect } from "react"
import { X, Building, Loader2, ChevronDown, User, Users } from "lucide-react"
import { ClientProvider } from "@/lib/api/client-provider-service"

interface ClientProviderModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  entityType: 'CLIENTE' | 'PROVEEDOR'
  onEntityTypeChange: (type: 'CLIENTE' | 'PROVEEDOR') => void
  clientProviders: ClientProvider[]
  selectedClientProvider: ClientProvider | null
  onSelectClientProvider: (provider: ClientProvider | null) => void
  isLoading: boolean
}

export function ClientProviderModal({
  isOpen,
  onClose,
  onConfirm,
  entityType,
  onEntityTypeChange,
  clientProviders,
  selectedClientProvider,
  onSelectClientProvider,
  isLoading
}: ClientProviderModalProps) {
  const [showDropdown, setShowDropdown] = useState(false)

  useEffect(() => {
    if (isOpen) {
      onEntityTypeChange(entityType)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleEntityTypeChange = (type: 'CLIENTE' | 'PROVEEDOR') => {
    onEntityTypeChange(type)
    onSelectClientProvider(null)
    setShowDropdown(false)
  }

  const handleSelectProvider = (provider: ClientProvider) => {
    onSelectClientProvider(provider)
    setShowDropdown(false)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO')
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-lg w-full mx-4">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Crear Cliente/Proveedor
              </h3>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Entity Type Selector */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Tipo de Entidad
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleEntityTypeChange('CLIENTE')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  entityType === 'CLIENTE'
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
                onClick={() => handleEntityTypeChange('PROVEEDOR')}
                className={`p-3 rounded-lg border-2 transition-all ${
                  entityType === 'PROVEEDOR'
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

          {/* Client/Provider Selector */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">
              Seleccionar {entityType === 'CLIENTE' ? 'Cliente' : 'Proveedor'}
            </label>

            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                disabled={isLoading || clientProviders.length === 0}
                className="w-full p-3 text-left border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span className="text-gray-500">Cargando...</span>
                      </div>
                    ) : selectedClientProvider ? (
                      <div>
                        <p className="font-medium truncate">{selectedClientProvider.nombre_comercial}</p>
                        <p className="text-sm text-gray-500 truncate">
                          {selectedClientProvider.codigo_interno} • {selectedClientProvider.categoria}
                        </p>
                      </div>
                    ) : (
                      <span className="text-gray-500">
                        {clientProviders.length === 0
                          ? `No hay ${entityType.toLowerCase()}s disponibles`
                          : `Selecciona un ${entityType.toLowerCase()}`
                        }
                      </span>
                    )}
                  </div>
                  {!isLoading && clientProviders.length > 0 && (
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  )}
                </div>
              </button>

              {/* Dropdown */}
              {showDropdown && clientProviders.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {clientProviders.map((provider) => (
                    <button
                      key={provider.id}
                      onClick={() => handleSelectProvider(provider)}
                      className="w-full p-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                    >
                      <div className="space-y-1">
                        <p className="font-medium text-foreground">{provider.nombre_comercial}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <span>{provider.codigo_interno}</span>
                          <span>{provider.categoria}</span>
                          <span className={`px-2 py-0.5 rounded-full text-xs ${
                            provider.estado === 'ACTIVO'
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {provider.estado}
                          </span>
                        </div>
                        {provider.razon_social_principal && (
                          <p className="text-sm text-gray-500 truncate">
                            {provider.razon_social_principal}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          Registrado: {formatDate(provider.fecha_registro)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Selected Provider Details */}
          {selectedClientProvider && (
            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
                {entityType === 'CLIENTE' ? 'Cliente' : 'Proveedor'} Seleccionado
              </h4>
              <div className="space-y-2 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500">Nombre:</span>
                    <p className="font-medium">{selectedClientProvider.nombre_comercial}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Código:</span>
                    <p className="font-medium">{selectedClientProvider.codigo_interno}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-gray-500">Categoría:</span>
                    <p className="font-medium">{selectedClientProvider.categoria}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Estado:</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      selectedClientProvider.estado === 'ACTIVO'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {selectedClientProvider.estado}
                    </span>
                  </div>
                </div>
                {selectedClientProvider.razon_social_principal && (
                  <div>
                    <span className="text-gray-500">Razón Social:</span>
                    <p className="font-medium">{selectedClientProvider.razon_social_principal}</p>
                  </div>
                )}
                <div>
                  <span className="text-gray-500">RUTs registrados:</span>
                  <p className="font-medium">{selectedClientProvider.total_ruts}</p>
                </div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={onConfirm}
              disabled={!selectedClientProvider}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Crear {entityType === 'CLIENTE' ? 'Cliente' : 'Proveedor'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}