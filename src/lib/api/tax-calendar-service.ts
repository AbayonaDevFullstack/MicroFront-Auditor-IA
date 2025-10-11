import { getAuthHeaders } from '@/lib/utils/api-helpers'

// Types for Tax Calendar API response
export interface GranContribuyenteCalendar {
  ultimo_digito_nit: number
  ano_gravable: number
  fecha_pago_primera_cuota: string
  fecha_declaracion_segunda_cuota: string
  fecha_pago_tercera_cuota: string
}

export interface PersonaJuridicaCalendar {
  ultimo_digito_nit: number
  ano_gravable: number
  fecha_declaracion_primera_cuota: string
  fecha_pago_segunda_cuota: string
}

export interface GranContribuyenteResponse {
  total_registros: number
  filtros_aplicados: {
    ultimo_digito_nit: number
    ano_gravable: number
  }
  calendarios: GranContribuyenteCalendar[]
}

export interface PersonaJuridicaResponse {
  total_registros: number
  filtros_aplicados: {
    ultimo_digito_nit: number
    ano_gravable: number
  }
  calendarios: PersonaJuridicaCalendar[]
}

class TaxCalendarService {
  private baseUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005'}/api/v1/tax-calendar`

  async getGrandesContribuyentesCalendar(
    anoGravable: number,
    ultimoDigitoNit: number
  ): Promise<GranContribuyenteResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/grandes-contribuyentes?ano_gravable=${anoGravable}&ultimo_digito_nit=${ultimoDigitoNit}`,
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      )

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

      const data: GranContribuyenteResponse = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching grandes contribuyentes calendar:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error desconocido al obtener el calendario tributario')
    }
  }

  async getPersonasJuridicasCalendar(
    anoGravable: number,
    ultimoDigitoNit: number
  ): Promise<PersonaJuridicaResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/personas-juridicas?ano_gravable=${anoGravable}&ultimo_digito_nit=${ultimoDigitoNit}`,
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      )

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

      const data: PersonaJuridicaResponse = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching personas juridicas calendar:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error desconocido al obtener el calendario tributario')
    }
  }

  async getCompleteGrandesContribuyentesCalendar(): Promise<GranContribuyenteResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/grandes-contribuyentes`,
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      )

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

      const data: GranContribuyenteResponse = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching complete grandes contribuyentes calendar:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error desconocido al obtener el calendario completo de grandes contribuyentes')
    }
  }

  async getCompletePersonasJuridicasCalendar(): Promise<PersonaJuridicaResponse> {
    try {
      const response = await fetch(
        `${this.baseUrl}/personas-juridicas`,
        {
          method: 'GET',
          headers: getAuthHeaders()
        }
      )

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

      const data: PersonaJuridicaResponse = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching complete personas juridicas calendar:', error)
      if (error instanceof Error) {
        throw error
      }
      throw new Error('Error desconocido al obtener el calendario completo de personas jurídicas')
    }
  }
}

export const taxCalendarService = new TaxCalendarService()