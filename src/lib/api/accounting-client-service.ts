import { getAuthHeaders } from '@/lib/utils/api-helpers'

export interface AccountingClient {
  id: string
  codigo_empresa: string
  razon_social: string
  nit: string
  activa: boolean
  created_at: string
  updated_at: string
}

export interface AccountingClientResponse {
  total: number
  items: AccountingClient[]
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8005'

class AccountingClientService {
  async getAccountingClients(): Promise<AccountingClientResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/contabilidad-clientes`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      if (!response.ok) {
        throw new Error(`Error al obtener clientes de contabilidad: ${response.statusText}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching accounting clients:', error)
      throw error
    }
  }
}

export const accountingClientService = new AccountingClientService()
