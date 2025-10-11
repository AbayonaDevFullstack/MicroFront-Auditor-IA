import { getAuthHeaders } from '@/lib/utils/api-helpers'

// Types for Invoice extraction API response
export interface InvoiceItem {
  codigo: string
  codigo_cliente: string
  referencia: string
  descripcion: string
  unidad_empaque: string
  cantidad: number
  valor_unitario: number
  valor_total: number
  porcentaje_iva: number
  valor_iva: number | null
}

export interface InvoiceData {
  numero_factura: string
  tipo_documento: string
  cufe: string
  fecha_emision: string
  fecha_vencimiento: string
  fecha_validacion_dian: string
  emisor_nit: string
  emisor_razon_social: string
  emisor_direccion: string
  emisor_ciudad: string
  emisor_telefono: string
  emisor_email: string
  receptor_nit: string
  receptor_razon_social: string
  receptor_direccion: string
  receptor_ciudad: string
  receptor_telefono: string
  asesor_comercial: string
  contacto: string
  zona: string
  items: InvoiceItem[]
  subtotal: number
  valor_gravado: number
  valor_no_gravado: number
  total_iva: number
  retencion_fuente: number
  retencion_ica: number
  valor_total: number
  forma_pago: string
  medio_pago: string
  terminos_pago: string | null
  numero_pedido: string | null
  orden_compra: string
  observaciones: string
  autorizacion_dian: string
  rango_numeracion: string
  total_items: number
  total_paginas: number
  extraction_timestamp: string
  message: string
}

export interface UploadProgress {
  loaded: number
  total: number
  percentage: number
}

class InvoiceService {
  private baseUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005'}/api/v1/contabilidad`

  async extractInvoiceData(
    file: File,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<InvoiceData> {
    if (!file) {
      throw new Error('No se ha proporcionado un archivo')
    }

    const formData = new FormData()
    formData.append('invoice_file', file)

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()

      // Upload progress tracking
      if (onProgress) {
        xhr.upload.addEventListener('progress', (event) => {
          if (event.lengthComputable) {
            const progress: UploadProgress = {
              loaded: event.loaded,
              total: event.total,
              percentage: Math.round((event.loaded / event.total) * 100)
            }
            onProgress(progress)
          }
        })
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data: InvoiceData = JSON.parse(xhr.responseText)
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
      xhr.open('POST', `${this.baseUrl}/extraer/factura`, true)
      xhr.timeout = 300000 // 5 minutes timeout

      // Add headers for CORS and Authentication
      const authHeaders = getAuthHeaders() as Record<string, string>
      Object.entries(authHeaders).forEach(([key, value]) => {
        if (key !== 'Content-Type') {
          xhr.setRequestHeader(key, value)
        }
      })

      // Don't set Content-Type - let browser set it with boundary for multipart/form-data
      xhr.send(formData)
    })
  }
}

export const invoiceService = new InvoiceService()