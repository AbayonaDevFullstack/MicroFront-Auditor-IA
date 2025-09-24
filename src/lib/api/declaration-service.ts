// Types for Declaration extraction API response
export interface ContribuyenteInfo {
  clasificacion: string
  vigencia_periodo: string
  numero_consecutivo: number
  razon_social_oficial: string
}

export interface DeclarationExtractionResponse {
  nit: string
  razon_social: string
  ano_gravable: number
  numero_formulario: string
  codigo_direccion_seccional: string
  actividad_economica_principal: string
  submission_date: string
  submission_date_only: string
  efectivo_equivalentes: number
  inversiones_instrumentos_financieros: number
  cuentas_documentos_arrendamientos: number
  inventarios: number
  activos_intangibles: number
  activos_biologicos: number
  propiedades_planta_equipo: number
  otros_activos: number
  patrimonio_bruto: number
  deudas: number
  patrimonio_liquido: number
  ingresos_brutos_actividades_ordinarias: number
  ingresos_financieros: number
  otros_ingresos: number
  total_ingresos_brutos: number
  devoluciones_rebajas_descuentos: number
  ingresos_no_constitutivos_renta: number
  ingresos_netos: number
  costos: number
  gastos_administracion: number
  gastos_distribucion_ventas: number
  gastos_financieros: number
  otros_gastos_deducciones: number
  total_costos_gastos: number
  total_costos_gastos_nomina: number
  aportes_sistema_seguridad_social: number
  aportes_sena_icbf_cajas: number
  inversiones_efectuadas_ano: number
  inversiones_liquidadas_periodos_anteriores: number
  renta_recuperacion_deducciones: number
  renta_pasiva_ece: number
  renta_liquida_ordinaria_ejercicio: number
  compensaciones: number
  renta_liquida: number
  renta_presuntiva: number
  renta_exenta: number
  rentas_gravables: number
  renta_liquida_gravable: number
  ingresos_ganancias_ocasionales: number
  costos_ganancias_ocasionales: number
  ganancias_ocasionales_no_gravadas: number
  ganancias_ocasionales_gravables: number
  subtotal_renta_impuesto: number
  impuesto_renta_liquida: number
  valor_adicionar_vaa: number
  descuentos_tributarios: number
  impuesto_neto_renta_sin_adicionado: number
  impuesto_adicionar_ia: number
  impuesto_neto_renta_con_adicionado: number
  impuesto_ganancias_ocasionales: number
  descuento_impuestos_exterior_ganancias: number
  total_impuesto_cargo: number
  valor_inversion_obras_impuestos_50: number
  descuento_efectivo_inversion_obras: number
  credito_fiscal_articulo_256: number
  anticipo_renta_liquidado_anterior: number
  saldo_favor_anterior_sin_solicitud: number
  autorretenciones: number
  otras_retenciones: number
  retenciones_autorretenciones: number
  anticipo_renta_ano_siguiente: number
  anticipo_puntos_adicionales_anterior: number
  anticipo_puntos_adicionales_siguiente: number
  saldo_pagar_impuesto: number
  sanciones: number
  valor_pagar: number
  saldo_favor: number
  fecha_presentacion: string
  hora_presentacion: string
  liquidacion_tipo: string
  codigo_contador_revisor: string
  numero_tarjeta_profesional: string
  es_gran_contribuyente: boolean
  contribuyente_info: ContribuyenteInfo | Record<string, any>
  additional_fields: Record<string, any>
  extraction_timestamp: string
  message: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

class DeclarationService {
  private baseUrl = 'http://localhost:8001/api/v1/compliance'

  async extractDeclarationData(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<DeclarationExtractionResponse> {
    if (!file) {
      throw new Error('No se ha proporcionado archivo')
    }

    const formData = new FormData()
    formData.append('declaration_file', file)

    try {
      const response = await fetch(`${this.baseUrl}/extract/declaration/detailed`, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        headers: {
          'Accept': 'application/json',
        }
      })

      if (!response.ok) {
        let errorText = 'Error desconocido'
        try {
          const errorData = await response.json()
          errorText = errorData.detail || errorData.message || `HTTP ${response.status} ${response.statusText}`
        } catch {
          errorText = `HTTP ${response.status} ${response.statusText}`
        }
        throw new Error(`Error HTTP ${response.status}: ${errorText}`)
      }

      const data: DeclarationExtractionResponse = await response.json()
      return data
    } catch (error) {
      console.error('Error extracting declaration data:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error desconocido durante la extracción')
    }
  }

  async extractDeclarationWithProgress(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<DeclarationExtractionResponse> {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      const formData = new FormData()
      formData.append('declaration_file', file)

      // Upload progress tracking
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress: UploadProgress = {
            loaded: event.loaded,
            total: event.total,
            percentage: Math.round((event.loaded / event.total) * 100)
          }
          onProgress(progress)
        }
      })

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data: DeclarationExtractionResponse = JSON.parse(xhr.responseText)
            resolve(data)
          } catch (error) {
            reject(new Error('Error al procesar la respuesta del servidor'))
          }
        } else {
          let errorMessage = `Error HTTP ${xhr.status}: ${xhr.statusText}`
          try {
            const errorResponse = JSON.parse(xhr.responseText)
            if (errorResponse.detail || errorResponse.message) {
              errorMessage = errorResponse.detail || errorResponse.message
            }
          } catch (e) {
            // Keep default error message
          }
          reject(new Error(errorMessage))
        }
      })

      xhr.addEventListener('error', () => {
        reject(new Error('Error de conexión al servidor. Verifica que el servidor esté ejecutándose en http://localhost:8001'))
      })

      xhr.addEventListener('timeout', () => {
        reject(new Error('Tiempo de espera agotado (5 minutos)'))
      })

      // Setup request
      xhr.open('POST', `${this.baseUrl}/extract/declaration/detailed`, true)
      xhr.timeout = 300000 // 5 minutes timeout

      // Add headers for CORS
      xhr.setRequestHeader('Accept', 'application/json')

      // Don't set Content-Type - let browser set it with boundary for multipart/form-data
      xhr.send(formData)
    })
  }
}

export const declarationService = new DeclarationService()