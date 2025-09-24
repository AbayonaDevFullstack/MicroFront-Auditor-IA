"use client"

import React, { useState, useEffect } from "react"
import { Users, Building, UserCheck, Truck, ChevronDown, Loader2, Upload, FileText, CheckCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import { clientProviderService, ClientProvider, ClientProviderResponse } from "@/lib/api/client-provider-service"
import { rutService, RutExtractionWithClientResponse, UploadProgress } from "@/lib/api/rut-service"
import { FileUpload } from "@/components/ui/file-upload"
import { RutResults } from "@/components/ui/rut-results"

type TerceroType = 'cliente' | 'proveedor'

export default function TercerosPage() {
  const [selectedType, setSelectedType] = useState<TerceroType>('cliente')
  const [clientProviders, setClientProviders] = useState<ClientProvider[]>([])
  const [selectedClientProvider, setSelectedClientProvider] = useState<ClientProvider | null>(null)
  const [isLoadingList, setIsLoadingList] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // RUT extraction states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionProgress, setExtractionProgress] = useState<UploadProgress | null>(null)
  const [extractionResults, setExtractionResults] = useState<RutExtractionWithClientResponse | null>(null)
  const [extractionError, setExtractionError] = useState<string | null>(null)

  // Load client providers when type changes
  useEffect(() => {
    loadClientProviders()
  }, [selectedType])

  const loadClientProviders = async () => {
    setIsLoadingList(true)
    setError(null)
    setSelectedClientProvider(null)

    try {
      const response = await clientProviderService.getClientProviders(
        selectedType === 'cliente' ? 'CLIENTE' : 'PROVEEDOR'
      )
      setClientProviders(response.items)
    } catch (error) {
      console.error('Error loading client providers:', error)
      setError(error instanceof Error ? error.message : 'Error al cargar la lista')
      setClientProviders([])
    } finally {
      setIsLoadingList(false)
    }
  }

  const handleTypeChange = (type: TerceroType) => {
    setSelectedType(type)
  }

  const handleClientProviderChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = parseInt(event.target.value)
    const provider = clientProviders.find(cp => cp.id === selectedId)
    setSelectedClientProvider(provider || null)
    // Reset extraction states when changing client/provider
    setSelectedFiles([])
    setExtractionResults(null)
    setExtractionError(null)
  }

  const handleFilesChange = (files: any[]) => {
    // Convert FileWithPreview to File array
    const fileArray = files.map(f => f as File)
    setSelectedFiles(fileArray)
    setExtractionError(null)
  }

  const handleStartExtraction = async () => {
    if (!selectedClientProvider) {
      setExtractionError('Debe seleccionar un cliente/proveedor primero')
      return
    }

    if (selectedFiles.length === 0) {
      setExtractionError('Debe seleccionar al menos un archivo')
      return
    }

    setIsExtracting(true)
    setExtractionProgress(null)
    setExtractionError(null)
    setExtractionResults(null)

    try {
      const response = await rutService.extractRutFromFilesWithClient(
        selectedFiles,
        selectedClientProvider.id,
        (progress) => {
          setExtractionProgress(progress)
        }
      )

      setExtractionResults(response)
    } catch (error) {
      console.error('Error during RUT extraction:', error)
      setExtractionError(error instanceof Error ? error.message : 'Error durante la extracción')
    } finally {
      setIsExtracting(false)
      setExtractionProgress(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center">
            <Users className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Gestión de Terceros v2</h1>
            <p className="text-muted-foreground">
              Nueva versión mejorada para la gestión integral de terceros
            </p>
          </div>
        </div>
      </div>

      {/* Tipo de Tercero Selector */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Tipo de Tercero</h3>
            <p className="text-sm text-muted-foreground">
              Selecciona el tipo de tercero que deseas gestionar
            </p>
          </div>

          {/* Segmented Control */}
          <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg w-fit">
            <button
              onClick={() => handleTypeChange('cliente')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
                selectedType === 'cliente'
                  ? "bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              )}
            >
              <UserCheck className="h-4 w-4" />
              Cliente
            </button>
            <button
              onClick={() => handleTypeChange('proveedor')}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200",
                selectedType === 'proveedor'
                  ? "bg-white dark:bg-gray-700 text-green-600 dark:text-green-400 shadow-sm"
                  : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              )}
            >
              <Truck className="h-4 w-4" />
              Proveedor
            </button>
          </div>

          {/* Selected Type Display */}
          <div className="flex items-center gap-3 pt-2">
            <div className={cn(
              "w-8 h-8 rounded-lg flex items-center justify-center",
              selectedType === 'cliente'
                ? "bg-blue-100 dark:bg-blue-900/20"
                : "bg-green-100 dark:bg-green-900/20"
            )}>
              {selectedType === 'cliente' ? (
                <UserCheck className="h-4 w-4 text-blue-600" />
              ) : (
                <Truck className="h-4 w-4 text-green-600" />
              )}
            </div>
            <div>
              <p className="font-medium text-foreground">
                {selectedType === 'cliente' ? 'Cliente' : 'Proveedor'} seleccionado
              </p>
              <p className="text-xs text-muted-foreground">
                {selectedType === 'cliente'
                  ? 'Gestiona información de tus clientes'
                  : 'Gestiona información de tus proveedores'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Client/Provider Selector */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Seleccionar {selectedType === 'cliente' ? 'Cliente' : 'Proveedor'}
            </h3>
            <p className="text-sm text-muted-foreground">
              Elige el {selectedType} específico que deseas gestionar
            </p>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
            </div>
          )}

          <div className="relative">
            <select
              value={selectedClientProvider?.id || ''}
              onChange={handleClientProviderChange}
              disabled={isLoadingList || clientProviders.length === 0}
              className={cn(
                "w-full px-4 py-3 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg",
                "bg-white dark:bg-gray-800 text-foreground",
                "focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "appearance-none"
              )}
            >
              <option value="">
                {isLoadingList
                  ? 'Cargando...'
                  : clientProviders.length === 0
                    ? `No hay ${selectedType}s disponibles`
                    : `Selecciona un ${selectedType}`
                }
              </option>
              {clientProviders.map((provider) => (
                <option key={provider.id} value={provider.id}>
                  {provider.nombre_comercial} - Código Empresa {provider.id}
                </option>
              ))}
            </select>

            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {isLoadingList ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>

          {selectedClientProvider && (
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  selectedType === 'cliente'
                    ? "bg-blue-100 dark:bg-blue-900/20"
                    : "bg-green-100 dark:bg-green-900/20"
                )}>
                  {selectedType === 'cliente' ? (
                    <UserCheck className="h-4 w-4 text-blue-600" />
                  ) : (
                    <Truck className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-foreground">{selectedClientProvider.nombre_comercial}</p>
                  <p className="text-xs text-muted-foreground">
                    {selectedClientProvider.tipo_entidad} • Código: {selectedClientProvider.codigo_interno}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Categoría:</span>
                  <span className="ml-2 font-medium">{selectedClientProvider.categoria}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">Estado:</span>
                  <span className={cn(
                    "ml-2 px-2 py-1 rounded-full text-xs font-medium",
                    selectedClientProvider.estado === 'ACTIVO'
                      ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400"
                      : "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400"
                  )}>
                    {selectedClientProvider.estado}
                  </span>
                </div>
                <div>
                  <span className="text-muted-foreground">Total RUTs:</span>
                  <span className="ml-2 font-medium">{selectedClientProvider.total_ruts}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">RUT Principal:</span>
                  <span className="ml-2 font-medium">
                    {selectedClientProvider.tiene_rut_principal ? 'Sí' : 'No'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RUT Batch Upload - Only show when client/provider is selected */}
      {selectedClientProvider && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Carga Masiva de RUTs
              </h3>
              <p className="text-sm text-muted-foreground">
                Sube múltiples archivos RUT para {selectedClientProvider.nombre_comercial}
              </p>
            </div>

            {/* File Upload */}
            <div className="space-y-4">
              <FileUpload
                onFilesChange={handleFilesChange}
                maxFiles={50}
                acceptedTypes={['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'image/bmp', 'image/tiff', 'image/webp']}
                maxFileSize={50}
                isUploading={isExtracting}
              />

              {/* Extract Button */}
              {selectedFiles.length > 0 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    {selectedFiles.length} archivo{selectedFiles.length !== 1 ? 's' : ''} seleccionado{selectedFiles.length !== 1 ? 's' : ''}
                  </div>
                  <button
                    onClick={handleStartExtraction}
                    disabled={isExtracting}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50"
                  >
                    {isExtracting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <FileText className="h-4 w-4" />
                        Extraer RUTs
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* Extraction Error */}
              {extractionError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <p className="text-sm text-red-800 dark:text-red-200">{extractionError}</p>
                  </div>
                </div>
              )}

              {/* Progress Bar */}
              {isExtracting && extractionProgress && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Procesando archivos...</span>
                    <span>{extractionProgress.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${extractionProgress.percentage}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Success Message */}
              {extractionResults && !isExtracting && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div className="text-sm">
                      <p className="text-green-800 dark:text-green-200 font-medium">
                        ¡Extracción completada!
                      </p>
                      <p className="text-green-700 dark:text-green-300">
                        {extractionResults.successful_extractions} de {extractionResults.total_files} archivos procesados exitosamente
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Extraction Results */}
      {extractionResults && (
        <RutResults
          results={extractionResults}
          onClose={() => setExtractionResults(null)}
        />
      )}

      {/* Content Area - Currently Empty */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto">
            <Building className="h-8 w-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Gestión de {selectedType === 'cliente' ? 'Clientes' : 'Proveedores'}
            </h3>
            <p className="text-muted-foreground">
              Los componentes para gestionar {selectedType === 'cliente' ? 'clientes' : 'proveedores'} se agregarán aquí.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}