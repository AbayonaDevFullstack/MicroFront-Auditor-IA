"use client"

import React, { useState, useEffect, useRef } from "react"
import { Users, Building, UserCheck, Truck, ChevronDown, Loader2, FileText, CheckCircle, AlertTriangle, Download } from "lucide-react"
import { cn } from "@/lib/utils"
import { rutService, RutExtractionWithClientResponse, UploadProgress, RutDetails } from "@/lib/api/rut-service"
import { accountingClientService, AccountingClient } from "@/lib/api/accounting-client-service"
import { FileUpload } from "@/components/ui/file-upload"
import { RutResults } from "@/components/ui/rut-results"
import { ExcelExportService } from "@/lib/services/excel-export"

type TerceroType = 'cliente' | 'proveedor'

export default function TercerosPage() {
  // Ref to prevent duplicate API calls in StrictMode
  const hasFetchedClients = useRef(false)

  // Accounting client states
  const [accountingClients, setAccountingClients] = useState<AccountingClient[]>([])
  const [selectedAccountingClient, setSelectedAccountingClient] = useState<AccountingClient | null>(null)
  const [isLoadingAccountingClients, setIsLoadingAccountingClients] = useState(false)
  const [accountingError, setAccountingError] = useState<string | null>(null)

  const [selectedType, setSelectedType] = useState<TerceroType | null>(null)

  // RUT extraction states
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [isExtracting, setIsExtracting] = useState(false)
  const [extractionProgress, setExtractionProgress] = useState<UploadProgress | null>(null)
  const [extractionResults, setExtractionResults] = useState<RutExtractionWithClientResponse | null>(null)
  const [extractionError, setExtractionError] = useState<string | null>(null)

  const loadAccountingClients = async () => {
    setIsLoadingAccountingClients(true)
    setAccountingError(null)

    try {
      const response = await accountingClientService.getAccountingClients()
      setAccountingClients(response.items)
    } catch (error) {
      console.error('Error loading accounting clients:', error)
      setAccountingError(error instanceof Error ? error.message : 'Error al cargar clientes de contabilidad')
      setAccountingClients([])
    } finally {
      setIsLoadingAccountingClients(false)
    }
  }

  const handleAccountingClientChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = event.target.value
    const client = accountingClients.find(ac => ac.id === selectedId)
    setSelectedAccountingClient(client || null)
    // Reset everything when changing accounting client
    setSelectedType(null)
    setSelectedFiles([])
    setExtractionResults(null)
    setExtractionError(null)
  }

  const handleTypeChange = (type: TerceroType) => {
    setSelectedType(type)
  }

  const handleFilesChange = (files: any[]) => {
    // Convert FileWithPreview to File array
    const fileArray = files.map(f => f as File)
    setSelectedFiles(fileArray)
    setExtractionError(null)
  }

  const handleStartExtraction = async () => {
    if (!selectedAccountingClient) {
      setExtractionError('Debe seleccionar un cliente de contabilidad primero')
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
        parseInt(selectedAccountingClient.codigo_empresa),
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

  const handleGenerateExcel = async () => {
    if (!extractionResults || !selectedAccountingClient) {
      return
    }

    try {
      console.log('Selected Accounting Client:', selectedAccountingClient)
      console.log('Codigo Empresa:', selectedAccountingClient.codigo_empresa)

      // Convertir los resultados al formato RutDetails
      const rutDetails: RutDetails[] = extractionResults.results
        .filter(result => result.success && result.data)
        .map(result => {
          const rutData = result.data!.rut_data
          return {
            id: 0, // No tenemos ID aún
            nit: rutData.nit,
            dv: rutData.dv,
            numero_formulario: rutData.numero_formulario,
            razon_social: rutData.razon_social,
            nombre_comercial: rutData.nombre_comercial,
            tipo_contribuyente: rutData.tipo_contribuyente,
            pais: rutData.pais,
            departamento: rutData.departamento,
            ciudad_municipio: rutData.ciudad_municipio,
            direccion_principal: rutData.direccion_principal,
            telefono_1: rutData.telefono_1,
            correo_electronico: rutData.correo_electronico,
            actividad_principal_codigo: rutData.actividad_principal_codigo,
            processing_state: 'LISTO',
            representantes_legales: rutData.representantes_legales,
            created_at: rutData.extraction_timestamp,
            updated_at: null,
            original_filename: result.filename
          }
        })

      // Pasar el codigo_empresa del cliente de contabilidad seleccionado
      console.log('Calling exportToExcel with codigo_empresa:', selectedAccountingClient.codigo_empresa)
      await ExcelExportService.exportToExcel(rutDetails, selectedAccountingClient.codigo_empresa)
    } catch (error) {
      console.error('Error generating Excel:', error)
      setExtractionError(error instanceof Error ? error.message : 'Error al generar el archivo Excel')
    }
  }

  // Load accounting clients on mount
  useEffect(() => {
    if (!hasFetchedClients.current) {
      hasFetchedClients.current = true
      loadAccountingClients()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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

      {/* Accounting Client Selector - FIRST ELEMENT */}
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Cliente de Contabilidad</h3>
            <p className="text-sm text-muted-foreground">
              Selecciona el cliente de contabilidad para el cual realizarás la gestión de terceros
            </p>
          </div>

          {accountingError && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-800 dark:text-red-200">{accountingError}</p>
            </div>
          )}

          <div className="relative">
            <select
              value={selectedAccountingClient?.id || ''}
              onChange={handleAccountingClientChange}
              disabled={isLoadingAccountingClients || accountingClients.length === 0}
              className={cn(
                "w-full px-4 py-3 pr-10 text-sm border border-gray-300 dark:border-gray-600 rounded-lg",
                "bg-white dark:bg-gray-800 text-foreground",
                "focus:ring-2 focus:ring-purple-500 focus:border-purple-500",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "appearance-none"
              )}
            >
              <option value="">
                {isLoadingAccountingClients
                  ? 'Cargando clientes...'
                  : accountingClients.length === 0
                    ? 'No hay clientes disponibles'
                    : 'Selecciona un cliente de contabilidad'
                }
              </option>
              {accountingClients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.razon_social} - {client.nit}
                </option>
              ))}
            </select>

            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              {isLoadingAccountingClients ? (
                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>

          {selectedAccountingClient && (
            <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Building className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{selectedAccountingClient.razon_social}</p>
                  <p className="text-xs text-muted-foreground">
                    NIT: {selectedAccountingClient.nit} • Código: {selectedAccountingClient.codigo_empresa}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tipo de Tercero Selector - Only show if accounting client is selected */}
      {selectedAccountingClient && (
      <>
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
          {selectedType && (
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
          )}
        </div>
      </div>

      {/* RUT Batch Upload - Only show when type is selected */}
      {selectedAccountingClient && selectedType && (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <div className="space-y-6">
            {/* Header */}
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                Carga Masiva de RUTs
              </h3>
              <p className="text-sm text-muted-foreground">
                Sube múltiples archivos RUT para {selectedAccountingClient.razon_social} ({selectedType === 'cliente' ? 'Clientes' : 'Proveedores'})
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
                <div className="space-y-4">
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

                  {/* Generate Excel Button */}
                  {extractionResults.successful_extractions > 0 && (
                    <button
                      onClick={handleGenerateExcel}
                      className="w-full btn-primary flex items-center justify-center gap-2"
                    >
                      <Download className="h-5 w-5" />
                      Generar Formato {selectedType === 'cliente' ? 'Clientes' : 'Proveedores'}
                    </button>
                  )}
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
      {selectedType && (
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
      )}
      </>
      )}
    </div>
  )
}