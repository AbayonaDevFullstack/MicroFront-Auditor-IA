"use client"

import React, { useState } from "react"
import { Upload, FileText, Loader2, X, Building, CheckCircle, AlertTriangle, Calendar, Clock, Users, BarChart3 } from "lucide-react"
import { FileUpload } from "@/components/ui/file-upload"
import { declarationService, DeclarationExtractionResponse, UploadProgress } from "@/lib/api/declaration-service"
import { taxCalendarService, GranContribuyenteResponse, PersonaJuridicaResponse } from "@/lib/api/tax-calendar-service"
import { TaxCalendarModal } from "@/components/ui/tax-calendar-modal"

export default function AnalisisEficaciaPage() {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null)
  const [extractionResult, setExtractionResult] = useState<DeclarationExtractionResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [taxCalendar, setTaxCalendar] = useState<GranContribuyenteResponse | PersonaJuridicaResponse | null>(null)
  const [isLoadingCalendar, setIsLoadingCalendar] = useState(false)
  const [showCalendarModal, setShowCalendarModal] = useState(false)
  const [calendarModalData, setCalendarModalData] = useState<GranContribuyenteResponse | PersonaJuridicaResponse | null>(null)
  const [calendarModalType, setCalendarModalType] = useState<'grandes-contribuyentes' | 'personas-juridicas'>('grandes-contribuyentes')
  const [isLoadingCalendarModal, setIsLoadingCalendarModal] = useState(false)

  const handleFileChange = (files: File[]) => {
    if (files.length > 0) {
      setSelectedFile(files[0])
      setError(null)
    }
  }

  const handleExtractDeclaration = async () => {
    if (!selectedFile) {
      setError('Por favor selecciona un archivo para procesar.')
      return
    }

    setIsUploading(true)
    setUploadProgress(null)
    setError(null)

    try {
      const response = await declarationService.extractDeclarationWithProgress(
        selectedFile,
        (progress) => {
          setUploadProgress(progress)
        }
      )

      setExtractionResult(response)
      setShowUploadModal(false)
      setSelectedFile(null)

      // Load tax calendar after successful extraction
      await loadTaxCalendar(response)
    } catch (error) {
      console.error('Error extracting declaration:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido durante la extracción')
    } finally {
      setIsUploading(false)
      setUploadProgress(null)
    }
  }

  const handleCloseUploadModal = () => {
    if (!isUploading) {
      setShowUploadModal(false)
      setSelectedFile(null)
      setError(null)
      setUploadProgress(null)
    }
  }

  const loadTaxCalendar = async (declarationData: DeclarationExtractionResponse) => {
    if (!declarationData.nit || !declarationData.ano_gravable) return

    setIsLoadingCalendar(true)
    try {
      // Get last digit of NIT
      const ultimoDigitoNit = parseInt(declarationData.nit.slice(-1))
      const anoGravable = declarationData.ano_gravable

      // Determine if it's gran contribuyente
      const isGranContribuyente = declarationData.es_gran_contribuyente

      let calendarResponse
      if (isGranContribuyente) {
        calendarResponse = await taxCalendarService.getGrandesContribuyentesCalendar(anoGravable, ultimoDigitoNit)
      } else {
        calendarResponse = await taxCalendarService.getPersonasJuridicasCalendar(anoGravable, ultimoDigitoNit)
      }

      setTaxCalendar(calendarResponse)
    } catch (error) {
      console.error('Error loading tax calendar:', error)
      // Don't show error for calendar, it's optional
    } finally {
      setIsLoadingCalendar(false)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value)
  }

  const isGranContribuyente = () => {
    return extractionResult?.es_gran_contribuyente &&
           extractionResult.contribuyente_info &&
           typeof extractionResult.contribuyente_info === 'object' &&
           'clasificacion' in extractionResult.contribuyente_info
  }

  const handleViewCompleteGrandesContribuyentes = async () => {
    setCalendarModalType('grandes-contribuyentes')
    setShowCalendarModal(true)
    setIsLoadingCalendarModal(true)
    setCalendarModalData(null)

    try {
      const response = await taxCalendarService.getCompleteGrandesContribuyentesCalendar()
      setCalendarModalData(response)
    } catch (error) {
      console.error('Error loading complete grandes contribuyentes calendar:', error)
    } finally {
      setIsLoadingCalendarModal(false)
    }
  }

  const handleViewCompletePersonasJuridicas = async () => {
    setCalendarModalType('personas-juridicas')
    setShowCalendarModal(true)
    setIsLoadingCalendarModal(true)
    setCalendarModalData(null)

    try {
      const response = await taxCalendarService.getCompletePersonasJuridicasCalendar()
      setCalendarModalData(response)
    } catch (error) {
      console.error('Error loading complete personas juridicas calendar:', error)
    } finally {
      setIsLoadingCalendarModal(false)
    }
  }


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="accountingTitle">
          Análisis de Eficacia
        </h1>
        <p className="accountingParagraph">
          Evaluación integral de la eficiencia de los procesos contables y operativos.
          Utiliza inteligencia artificial para identificar áreas de mejora y optimización.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-start">
        <button
          onClick={() => setShowUploadModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Upload className="h-4 w-4" />
          Extraer Declaración de Renta
        </button>


        <button
          onClick={handleViewCompleteGrandesContribuyentes}
          className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors font-medium"
        >
          <Building className="h-4 w-4" />
          Calendario Grandes Contribuyentes
        </button>

        <button
          onClick={handleViewCompletePersonasJuridicas}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
        >
          <Users className="h-4 w-4" />
          Calendario Personas Jurídicas
        </button>
      </div>

      {/* Gran Contribuyente Badge */}
      {extractionResult && isGranContribuyente() && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Building className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-purple-700 dark:text-purple-300">
                Gran Contribuyente
              </h3>
              <p className="text-sm text-purple-600 dark:text-purple-400">
                Clasificación especial DIAN
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-purple-600 dark:text-purple-400 font-medium">Clasificación:</span>
              <p className="font-semibold">{(extractionResult.contribuyente_info as any).clasificacion}</p>
            </div>
            <div>
              <span className="text-purple-600 dark:text-purple-400 font-medium">Vigencia:</span>
              <p className="font-semibold">{(extractionResult.contribuyente_info as any).vigencia_periodo}</p>
            </div>
            <div>
              <span className="text-purple-600 dark:text-purple-400 font-medium">Consecutivo:</span>
              <p className="font-semibold">{(extractionResult.contribuyente_info as any).numero_consecutivo}</p>
            </div>
            <div>
              <span className="text-purple-600 dark:text-purple-400 font-medium">Razón Social:</span>
              <p className="font-semibold">{(extractionResult.contribuyente_info as any).razon_social_oficial}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tax Calendar Table */}
      {extractionResult && taxCalendar && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Calendar Header */}
          <div className="bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-full">
                <Calendar className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-orange-700 dark:text-orange-300">
                  Calendario Tributario {extractionResult.ano_gravable}
                </h3>
                <p className="text-sm text-orange-600 dark:text-orange-400">
                  {extractionResult.es_gran_contribuyente ? 'Grandes Contribuyentes' : 'Personas Jurídicas'}
                  {' '}| Último dígito NIT: {extractionResult.nit.slice(-1)}
                </p>
              </div>
              {isLoadingCalendar && (
                <div className="ml-auto">
                  <Loader2 className="h-5 w-5 animate-spin text-orange-600" />
                </div>
              )}
            </div>
          </div>

          {/* Calendar Content */}
          <div className="p-6">
            {taxCalendar.calendarios.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-semibold text-gray-800 dark:text-gray-200">
                        Obligación
                      </th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-800 dark:text-gray-200">
                        Fecha Límite
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {extractionResult.es_gran_contribuyente ? (
                      // Gran Contribuyente Calendar
                      <>
                        {(taxCalendar as GranContribuyenteResponse).calendarios.map((calendar, index) => (
                          <React.Fragment key={index}>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-3 px-4 font-medium">Pago Primera Cuota</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  {new Date(calendar.fecha_pago_primera_cuota).toLocaleDateString('es-CO')}
                                </div>
                              </td>
                            </tr>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-3 px-4 font-medium">Declaración Segunda Cuota</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  {new Date(calendar.fecha_declaracion_segunda_cuota).toLocaleDateString('es-CO')}
                                </div>
                              </td>
                            </tr>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-3 px-4 font-medium">Pago Tercera Cuota</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  {new Date(calendar.fecha_pago_tercera_cuota).toLocaleDateString('es-CO')}
                                </div>
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </>
                    ) : (
                      // Persona Jurídica Calendar
                      <>
                        {(taxCalendar as PersonaJuridicaResponse).calendarios.map((calendar, index) => (
                          <React.Fragment key={index}>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-3 px-4 font-medium">Declaración Primera Cuota</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  {new Date(calendar.fecha_declaracion_primera_cuota).toLocaleDateString('es-CO')}
                                </div>
                              </td>
                            </tr>
                            <tr className="border-b border-gray-100 dark:border-gray-800">
                              <td className="py-3 px-4 font-medium">Pago Segunda Cuota</td>
                              <td className="py-3 px-4">
                                <div className="flex items-center gap-2">
                                  <Clock className="h-4 w-4 text-gray-500" />
                                  {new Date(calendar.fecha_pago_segunda_cuota).toLocaleDateString('es-CO')}
                                </div>
                              </td>
                            </tr>
                          </React.Fragment>
                        ))}
                      </>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No se encontraron fechas del calendario tributario para este contribuyente.</p>
              </div>
            )}

            {/* Calendar Info */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <span>Total de registros: {taxCalendar.total_registros}</span>
                <span className="mx-2">•</span>
                <span>Último dígito NIT: {taxCalendar.filtros_aplicados.ultimo_digito_nit}</span>
                <span className="mx-2">•</span>
                <span>Año gravable: {taxCalendar.filtros_aplicados.ano_gravable}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Declaration Form */}
      {extractionResult && (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Form Header */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-green-700 dark:text-green-300">
                  Declaración de Renta - {extractionResult.ano_gravable}
                </h3>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {extractionResult.razon_social} | NIT: {extractionResult.nit}
                </p>
              </div>
              <div className="ml-auto">
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                  Extraído exitosamente
                </span>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {/* Información General */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Información General
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Año Gravable</label>
                    <p className="text-lg font-semibold">{extractionResult.ano_gravable}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Número de Formulario</label>
                    <p className="font-medium">{extractionResult.numero_formulario}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Actividad Económica Principal</label>
                    <p className="font-medium">{extractionResult.actividad_economica_principal}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Fecha de Presentación</label>
                    <p className="font-medium">{extractionResult.fecha_presentacion}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Hora de Presentación</label>
                    <p className="font-medium">{extractionResult.hora_presentacion || 'No especificada'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Código Dirección Seccional</label>
                    <p className="font-medium">{extractionResult.codigo_direccion_seccional}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Tipo de Liquidación</label>
                    <p className="font-medium">{extractionResult.liquidacion_tipo}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Código Contador/Revisor</label>
                    <p className="font-medium">{extractionResult.codigo_contador_revisor || 'No especificado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Tarjeta Profesional</label>
                    <p className="font-medium">{extractionResult.numero_tarjeta_profesional || 'No especificada'}</p>
                  </div>
                </div>
              </div>

              {/* Patrimonio y Activos */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Patrimonio y Activos
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Efectivo y Equivalentes</label>
                    <p className="font-medium">{formatCurrency(extractionResult.efectivo_equivalentes)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Inversiones</label>
                    <p className="font-medium">{formatCurrency(extractionResult.inversiones_instrumentos_financieros)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Cuentas y Documentos por Cobrar</label>
                    <p className="font-medium">{formatCurrency(extractionResult.cuentas_documentos_arrendamientos)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Inventarios</label>
                    <p className="font-medium">{formatCurrency(extractionResult.inventarios)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Activos Intangibles</label>
                    <p className="font-medium">{formatCurrency(extractionResult.activos_intangibles)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Activos Biológicos</label>
                    <p className="font-medium">{formatCurrency(extractionResult.activos_biologicos)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Propiedades, Planta y Equipo</label>
                    <p className="font-medium">{formatCurrency(extractionResult.propiedades_planta_equipo)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Otros Activos</label>
                    <p className="font-medium">{formatCurrency(extractionResult.otros_activos)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Patrimonio Bruto</label>
                    <p className="font-semibold text-lg text-blue-600">{formatCurrency(extractionResult.patrimonio_bruto)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Deudas</label>
                    <p className="font-medium text-red-600">{formatCurrency(extractionResult.deudas)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Patrimonio Líquido</label>
                    <p className="font-semibold text-lg text-green-600">{formatCurrency(extractionResult.patrimonio_liquido)}</p>
                  </div>
                </div>
              </div>

              {/* Ingresos */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Ingresos
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Ingresos Brutos Ordinarios</label>
                    <p className="font-medium">{formatCurrency(extractionResult.ingresos_brutos_actividades_ordinarias)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Ingresos Financieros</label>
                    <p className="font-medium">{formatCurrency(extractionResult.ingresos_financieros)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Otros Ingresos</label>
                    <p className="font-medium">{formatCurrency(extractionResult.otros_ingresos)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Ingresos Brutos</label>
                    <p className="font-semibold text-lg text-green-600">{formatCurrency(extractionResult.total_ingresos_brutos)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Devoluciones, Rebajas y Descuentos</label>
                    <p className="font-medium text-red-600">{formatCurrency(extractionResult.devoluciones_rebajas_descuentos)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Ingresos No Constitutivos de Renta</label>
                    <p className="font-medium">{formatCurrency(extractionResult.ingresos_no_constitutivos_renta)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Ingresos Netos</label>
                    <p className="font-semibold text-lg text-blue-600">{formatCurrency(extractionResult.ingresos_netos)}</p>
                  </div>
                </div>
              </div>

              {/* Costos y Gastos */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Costos y Gastos
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Costos</label>
                    <p className="font-medium">{formatCurrency(extractionResult.costos)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Gastos de Administración</label>
                    <p className="font-medium">{formatCurrency(extractionResult.gastos_administracion)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Gastos de Ventas</label>
                    <p className="font-medium">{formatCurrency(extractionResult.gastos_distribucion_ventas)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Gastos Financieros</label>
                    <p className="font-medium">{formatCurrency(extractionResult.gastos_financieros)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Otros Gastos y Deducciones</label>
                    <p className="font-medium">{formatCurrency(extractionResult.otros_gastos_deducciones)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Costos y Gastos</label>
                    <p className="font-semibold text-lg text-red-600">{formatCurrency(extractionResult.total_costos_gastos)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Costos y Gastos Nómina</label>
                    <p className="font-medium">{formatCurrency(extractionResult.total_costos_gastos_nomina)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Aportes Sistema Seguridad Social</label>
                    <p className="font-medium">{formatCurrency(extractionResult.aportes_sistema_seguridad_social)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Aportes SENA, ICBF, Cajas</label>
                    <p className="font-medium">{formatCurrency(extractionResult.aportes_sena_icbf_cajas)}</p>
                  </div>
                </div>
              </div>

              {/* Renta Líquida */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Renta Líquida
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Inversiones Efectuadas en el Año</label>
                    <p className="font-medium">{formatCurrency(extractionResult.inversiones_efectuadas_ano)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Inversiones Liquidadas Períodos Anteriores</label>
                    <p className="font-medium">{formatCurrency(extractionResult.inversiones_liquidadas_periodos_anteriores)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Renta por Recuperación de Deducciones</label>
                    <p className="font-medium">{formatCurrency(extractionResult.renta_recuperacion_deducciones)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Renta Pasiva ECE</label>
                    <p className="font-medium">{formatCurrency(extractionResult.renta_pasiva_ece)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Renta Líquida Ordinaria del Ejercicio</label>
                    <p className="font-medium">{formatCurrency(extractionResult.renta_liquida_ordinaria_ejercicio)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Compensaciones</label>
                    <p className="font-medium">{formatCurrency(extractionResult.compensaciones)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Renta Líquida</label>
                    <p className="font-medium">{formatCurrency(extractionResult.renta_liquida)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Renta Presuntiva</label>
                    <p className="font-medium">{formatCurrency(extractionResult.renta_presuntiva)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Renta Exenta</label>
                    <p className="font-medium">{formatCurrency(extractionResult.renta_exenta)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Rentas Gravables</label>
                    <p className="font-medium">{formatCurrency(extractionResult.rentas_gravables)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Renta Líquida Gravable</label>
                    <p className="font-semibold text-lg text-purple-600">{formatCurrency(extractionResult.renta_liquida_gravable)}</p>
                  </div>
                </div>
              </div>

              {/* Impuestos */}
              <div className="space-y-4">
                <h4 className="font-semibold text-lg text-gray-800 dark:text-gray-200 border-b border-gray-200 dark:border-gray-700 pb-2">
                  Impuestos
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Ingresos por Ganancias Ocasionales</label>
                    <p className="font-medium">{formatCurrency(extractionResult.ingresos_ganancias_ocasionales)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Costos por Ganancias Ocasionales</label>
                    <p className="font-medium">{formatCurrency(extractionResult.costos_ganancias_ocasionales)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Ganancias Ocasionales No Gravadas</label>
                    <p className="font-medium">{formatCurrency(extractionResult.ganancias_ocasionales_no_gravadas)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Ganancias Ocasionales Gravables</label>
                    <p className="font-medium">{formatCurrency(extractionResult.ganancias_ocasionales_gravables)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Subtotal Renta e Impuesto</label>
                    <p className="font-medium">{formatCurrency(extractionResult.subtotal_renta_impuesto)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Impuesto de Renta Líquida</label>
                    <p className="font-medium">{formatCurrency(extractionResult.impuesto_renta_liquida)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Valor a Adicionar (VAA)</label>
                    <p className="font-medium">{formatCurrency(extractionResult.valor_adicionar_vaa)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Descuentos Tributarios</label>
                    <p className="font-medium">{formatCurrency(extractionResult.descuentos_tributarios)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Impuesto Neto de Renta (Sin Adicionado)</label>
                    <p className="font-medium">{formatCurrency(extractionResult.impuesto_neto_renta_sin_adicionado)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Impuesto a Adicionar (IA)</label>
                    <p className="font-medium">{formatCurrency(extractionResult.impuesto_adicionar_ia)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Impuesto Neto de Renta (Con Adicionado)</label>
                    <p className="font-medium">{formatCurrency(extractionResult.impuesto_neto_renta_con_adicionado)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Impuesto sobre Ganancias Ocasionales</label>
                    <p className="font-medium">{formatCurrency(extractionResult.impuesto_ganancias_ocasionales)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Descuento Impuestos del Exterior</label>
                    <p className="font-medium">{formatCurrency(extractionResult.descuento_impuestos_exterior_ganancias)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Impuesto a Cargo</label>
                    <p className="font-semibold text-lg text-orange-600">{formatCurrency(extractionResult.total_impuesto_cargo)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Valor Inversión en Obras e Impuestos (50%)</label>
                    <p className="font-medium">{formatCurrency(extractionResult.valor_inversion_obras_impuestos_50)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Descuento Efectivo por Inversión en Obras</label>
                    <p className="font-medium">{formatCurrency(extractionResult.descuento_efectivo_inversion_obras)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Crédito Fiscal Artículo 256</label>
                    <p className="font-medium">{formatCurrency(extractionResult.credito_fiscal_articulo_256)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Anticipo de Renta Liquidado Año Anterior</label>
                    <p className="font-medium">{formatCurrency(extractionResult.anticipo_renta_liquidado_anterior)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Saldo a Favor del Año Anterior</label>
                    <p className="font-medium">{formatCurrency(extractionResult.saldo_favor_anterior_sin_solicitud)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Autorretenciones</label>
                    <p className="font-medium">{formatCurrency(extractionResult.autorretenciones)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Otras Retenciones</label>
                    <p className="font-medium">{formatCurrency(extractionResult.otras_retenciones)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Retenciones y Autorretenciones</label>
                    <p className="font-medium">{formatCurrency(extractionResult.retenciones_autorretenciones)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Anticipo de Renta del Año Siguiente</label>
                    <p className="font-medium">{formatCurrency(extractionResult.anticipo_renta_ano_siguiente)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Anticipo 3 Puntos Adicionales (Año Anterior)</label>
                    <p className="font-medium">{formatCurrency(extractionResult.anticipo_puntos_adicionales_anterior)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Anticipo 3 Puntos Adicionales (Año Siguiente)</label>
                    <p className="font-medium">{formatCurrency(extractionResult.anticipo_puntos_adicionales_siguiente)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Saldo a Pagar por Impuesto</label>
                    <p className="font-medium">{formatCurrency(extractionResult.saldo_pagar_impuesto)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Sanciones</label>
                    <p className="font-medium text-red-600">{formatCurrency(extractionResult.sanciones)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Valor a Pagar</label>
                    <p className="font-semibold text-lg text-red-600">{formatCurrency(extractionResult.valor_pagar)}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Saldo a Favor</label>
                    <p className="font-semibold text-lg text-green-600">{formatCurrency(extractionResult.saldo_favor)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Extraction Info */}
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Extraído el: {new Date(extractionResult.extraction_timestamp).toLocaleString('es-CO')}</span>
                <span className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  {extractionResult.message}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleCloseUploadModal} />
          <div className="relative z-10 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-foreground">Extracción de Declaración de Renta</h2>
                <button
                  onClick={handleCloseUploadModal}
                  disabled={isUploading}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="font-medium text-red-800 dark:text-red-200">Error</span>
                  </div>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-1">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <FileUpload
                  onFilesChange={handleFileChange}
                  maxFiles={1}
                  acceptedTypes={['application/pdf']}
                  maxFileSize={50}
                />

                {uploadProgress && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Procesando archivo...</span>
                      <span>{uploadProgress.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {selectedFile && (
                  <div className="flex gap-3 pt-4 border-t">
                    <button
                      onClick={handleExtractDeclaration}
                      disabled={isUploading}
                      className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Extrayendo datos...
                        </>
                      ) : (
                        <>
                          <FileText className="h-4 w-4" />
                          Extraer Datos
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCloseUploadModal}
                      disabled={isUploading}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}


      {/* Tax Calendar Modal */}
      <TaxCalendarModal
        isOpen={showCalendarModal}
        onClose={() => setShowCalendarModal(false)}
        data={calendarModalData}
        type={calendarModalType}
        loading={isLoadingCalendarModal}
      />

    </div>
  )
}