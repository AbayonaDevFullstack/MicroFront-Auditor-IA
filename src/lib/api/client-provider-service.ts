export interface ClientProvider {
  id: number
  tipo_entidad: 'CLIENTE' | 'PROVEEDOR'
  nombre_comercial: string
  razon_social_principal: string | null
  categoria: string
  estado: string
  codigo_interno: string
  total_ruts: number
  tiene_rut_principal: boolean
  fecha_registro: string
}

export interface CreateClientProviderResponse {
  id: number
  nombre_comercial: string
  tipo_entidad: 'CLIENTE' | 'PROVEEDOR'
  codigo_interno: string
  message: string
}

export interface ClientProviderRut {
  id: number
  rut_record_id: number
  es_principal: boolean
  rol_en_relacion: string | null
  estado: 'ACTIVO' | 'INACTIVO'
  fecha_asociacion: string
  observaciones: string
  asociado_por: string
  nit: string
  dv: string
  numero_formulario: string
  razon_social: string
  nombre_comercial: string
  tipo_contribuyente: string
  pais: string
  departamento: string
  ciudad_municipio: string
  direccion_principal: string
  telefono_1: string
  correo_electronico: string
  actividad_principal_codigo: string
  processing_state: 'EXTRAIDO' | 'LISTO' | 'PROCESADO'
  original_filename: string
  created_at: string
}

export interface ClientProviderRutsResponse {
  cliente_proveedor_id: number
  cliente_proveedor_nombre: string
  total_ruts: number
  ruts_principales: number
  ruts_activos: number
  ruts: ClientProviderRut[]
}

export interface ClientProviderResponse {
  total: number
  page: number
  size: number
  items: ClientProvider[]
}

export interface CreateClientProviderRequest {
  tipo_entidad: 'CLIENTE' | 'PROVEEDOR'
  nombre_comercial: string
  categoria: string
  sector_economico: string
  nivel_riesgo: 'ALTO' | 'MEDIO' | 'BAJO'
  codigo_interno: string
  notas: string
}

class ClientProviderService {
  private baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001/api/v1'

  private getHeaders(): HeadersInit {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_AUTH_TOKEN}`,
      'x-user-id': process.env.NEXT_PUBLIC_USER_ID || ''
    }
  }

  async getClientProviders(tipoEntidad: 'CLIENTE' | 'PROVEEDOR'): Promise<ClientProviderResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/clientes-proveedores/?tipo_entidad=${tipoEntidad}`, {
        headers: this.getHeaders()
      })

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`)
      }

      const data: ClientProviderResponse = await response.json()
      return data
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al obtener ${tipoEntidad.toLowerCase()}s: ${error.message}`)
      }
      throw new Error(`Error al obtener ${tipoEntidad.toLowerCase()}s`)
    }
  }

  async createClientProvider(data: CreateClientProviderRequest): Promise<CreateClientProviderResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/clientes-proveedores/`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        let errorMessage = `Error HTTP ${response.status}: ${response.statusText}`
        try {
          const errorResponse = await response.json()
          if (errorResponse.detail || errorResponse.message) {
            errorMessage = errorResponse.detail || errorResponse.message
          }
        } catch (e) {
          // Keep default error message
        }
        throw new Error(errorMessage)
      }

      const result: CreateClientProviderResponse = await response.json()
      return result
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al crear ${data.tipo_entidad.toLowerCase()}: ${error.message}`)
      }
      throw new Error(`Error al crear ${data.tipo_entidad.toLowerCase()}`)
    }
  }

  async getClientProviderRuts(clientProviderId: number): Promise<ClientProviderRutsResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/clientes-proveedores/${clientProviderId}/ruts`, {
        headers: this.getHeaders()
      })

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}: ${response.statusText}`)
      }

      const data: ClientProviderRutsResponse = await response.json()
      return data
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Error al obtener RUTs del cliente/proveedor: ${error.message}`)
      }
      throw new Error('Error al obtener RUTs del cliente/proveedor')
    }
  }
}

export const clientProviderService = new ClientProviderService()