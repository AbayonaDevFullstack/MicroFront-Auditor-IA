"use client"

import { useState, useEffect } from "react"
import { ChevronDown, User, Users, Loader2, Search, X } from "lucide-react"
import { ClientProvider } from "@/lib/api/client-provider-service"

interface ClientProviderSelectorProps {
  onSelect: (provider: ClientProvider | null) => void
  onLoadData: (type: 'CLIENTE' | 'PROVEEDOR') => void
  clientProviders: ClientProvider[]
  isLoading: boolean
  className?: string
}

export function ClientProviderSelector({
  onSelect,
  onLoadData,
  clientProviders,
  isLoading,
  className = ""
}: ClientProviderSelectorProps) {
  const [entityType, setEntityType] = useState<'CLIENTE' | 'PROVEEDOR'>('CLIENTE')
  const [selectedProvider, setSelectedProvider] = useState<ClientProvider | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    onLoadData(entityType)
  }, [entityType])

  const handleEntityTypeChange = (type: 'CLIENTE' | 'PROVEEDOR') => {
    setEntityType(type)
    setSelectedProvider(null)
    setSearchTerm('')
    setShowDropdown(false)
    onSelect(null)
  }

  const handleSelectProvider = (provider: ClientProvider) => {
    setSelectedProvider(provider)
    setShowDropdown(false)
    setSearchTerm('')
    onSelect(provider)
  }

  const handleClearSelection = () => {
    setSelectedProvider(null)
    onSelect(null)
  }

  const filteredProviders = clientProviders.filter(provider =>
    provider.nombre_comercial.toLowerCase().includes(searchTerm.toLowerCase()) ||
    provider.codigo_interno.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CO')
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Entity Type Selector */}
      <div className="flex gap-3">
        <button
          onClick={() => handleEntityTypeChange('CLIENTE')}
          className={`flex-1 p-3 rounded-lg border-2 transition-all ${
            entityType === 'CLIENTE'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <User className="h-5 w-5" />
            <span className="font-medium">Clientes</span>
          </div>
        </button>
        <button
          onClick={() => handleEntityTypeChange('PROVEEDOR')}
          className={`flex-1 p-3 rounded-lg border-2 transition-all ${
            entityType === 'PROVEEDOR'
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Users className="h-5 w-5" />
            <span className="font-medium">Proveedores</span>
          </div>
        </button>
      </div>

      {/* Selection Dropdown */}
      <div className="relative" style={{zIndex: 30, position: 'relative'}}>
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          disabled={isLoading || clientProviders.length === 0}
          className="w-full p-4 text-left border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed bg-white dark:bg-gray-800 min-h-[64px] hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-gray-500">Cargando {entityType.toLowerCase()}s...</span>
                </div>
              ) : selectedProvider ? (
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{selectedProvider.nombre_comercial}</p>
                    <p className="text-sm text-gray-500 truncate">
                      {selectedProvider.codigo_interno} • {selectedProvider.categoria}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleClearSelection()
                    }}
                    className="ml-2 p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  >
                    <X className="h-4 w-4 text-gray-400" />
                  </button>
                </div>
              ) : (
                <span className="text-gray-500 text-base">
                  {clientProviders.length === 0
                    ? `No hay ${entityType.toLowerCase()}s disponibles`
                    : `Selecciona un ${entityType.toLowerCase()}`
                  }
                </span>
              )}
            </div>
            {!isLoading && clientProviders.length > 0 && !selectedProvider && (
              <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
            )}
          </div>
        </button>

        {/* Dropdown Menu */}
        {showDropdown && clientProviders.length > 0 && (
          <div className="absolute w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl max-h-80 overflow-hidden" style={{zIndex: 40, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', position: 'absolute'}}>
            {/* Search Input */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={`Buscar ${entityType.toLowerCase()}...`}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Provider List */}
            <div className="max-h-60 overflow-y-auto">
              {filteredProviders.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  {searchTerm ? 'No se encontraron resultados' : `No hay ${entityType.toLowerCase()}s disponibles`}
                </div>
              ) : (
                filteredProviders.map((provider) => (
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
                        Registrado: {formatDate(provider.fecha_registro)} • {provider.total_ruts} RUT(s)
                      </p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Selected Provider Info */}
      {selectedProvider && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            {entityType === 'CLIENTE' ? (
              <User className="h-4 w-4 text-green-600" />
            ) : (
              <Users className="h-4 w-4 text-green-600" />
            )}
            <h4 className="font-medium text-green-800 dark:text-green-200">
              {entityType === 'CLIENTE' ? 'Cliente' : 'Proveedor'} Seleccionado
            </h4>
          </div>
          <div className="space-y-2 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500">Nombre:</span>
                <p className="font-medium">{selectedProvider.nombre_comercial}</p>
              </div>
              <div>
                <span className="text-gray-500">Código:</span>
                <p className="font-medium">{selectedProvider.codigo_interno}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-gray-500">Categoría:</span>
                <p className="font-medium">{selectedProvider.categoria}</p>
              </div>
              <div>
                <span className="text-gray-500">RUTs:</span>
                <p className="font-medium">{selectedProvider.total_ruts}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}