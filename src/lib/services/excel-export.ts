import * as XLSX from 'xlsx'
import { RutDetails } from '@/lib/api/rut-service'

export interface ExcelExportData {
  rutDetails: RutDetails[]
}

export class ExcelExportService {
  // Mapeo de países a códigos de moneda
  private static CURRENCY_MAP: Record<string, string> = {
    'COLOMBIA': 'COP',
    'MEXICO': 'MXN',
    'ARGENTINA': 'ARS',
    'PERU': 'PEN',
    'CHILE': 'CLP',
    'ECUADOR': 'USD',
    'VENEZUELA': 'VES',
    'URUGUAY': 'UYU',
    'PARAGUAY': 'PYG',
    'BOLIVIA': 'BOB'
  }

  private static getCurrencyByCountry(pais: string): string {
    return this.CURRENCY_MAP[pais.toUpperCase()] || 'COP'
  }

  private static formatDate(dateString: string): string {
    if (!dateString) return ''
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return ''

    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')

    return `${year}${month}${day}`
  }

  private static createClientesData(rutDetails: RutDetails[]): any[][] {
    // Headers para la hoja Clientes
    const headers = [
      'Compañía',
      'Código del cliente',
      'Razón social del cliente',
      'Moneda',
      'Condición de pago',
      'Tipo de cliente',
      'Contacto',
      'Dirección 1',
      'Dirección 2',
      'País',
      'Departamento',
      'Ciudad',
      'Teléfono',
      'Dirección de correo electrónico',
      'Fecha de ingreso AAAAMMDD',
      'Teléfono Celular'
    ]

    const data = [headers]

    rutDetails.forEach(rut => {
      // Buscar fecha de inicio de ejercicio del primer representante legal
      const fechaInicio = rut.representantes_legales.length > 0
        ? rut.representantes_legales[0].fecha_inicio_ejercicio || ''
        : ''

      const row = [
        '1', // Compañía - valor predeterminado
        rut.nit, // Código del cliente
        rut.razon_social, // Razón social del cliente
        this.getCurrencyByCountry(rut.pais), // Moneda basada en país
        '', // Condición de pago - vacío
        '001', // Tipo de cliente - valor predeterminado
        '', // Contacto - vacío
        rut.direccion_principal, // Dirección 1
        '', // Dirección 2 - vacío
        '169', // País - valor predeterminado (Colombia)
        '11', // Departamento - valor predeterminado
        '001', // Ciudad - valor predeterminado
        rut.telefono_1, // Teléfono
        rut.correo_electronico, // Dirección de correo electrónico
        this.formatDate(fechaInicio), // Fecha de ingreso AAAAMMDD
        '' // Teléfono Celular - vacío
      ]

      data.push(row)
    })

    return data
  }

  private static async loadTemplateFile(): Promise<XLSX.WorkBook> {
    try {
      // Intentar cargar el archivo template
      const templatePath = 'C:\\Users\\ANDRES BAYONA\\Documents\\LOUIS FRONTEND\\auditor-ia\\Formato clientes proveedores Pomelo.xlsx'

      // Para el navegador, necesitaremos copiar el template manualmente o crear uno básico
      // Por ahora, crearemos la estructura básica
      const wb = XLSX.utils.book_new()

      // Crear hojas vacías con los nombres correctos
      const sheetNames = ['Clientes', 'Proveedores', 'Config'] // Ajusta según las hojas del template

      sheetNames.forEach(name => {
        const ws = XLSX.utils.aoa_to_sheet([[]])
        XLSX.utils.book_append_sheet(wb, ws, name)
      })

      return wb
    } catch (error) {
      console.warn('No se pudo cargar el archivo template, creando estructura básica')
      const wb = XLSX.utils.book_new()

      // Crear hoja de Clientes vacía
      const ws = XLSX.utils.aoa_to_sheet([[]])
      XLSX.utils.book_append_sheet(wb, ws, 'Clientes')

      return wb
    }
  }

  public static async exportToExcel(rutDetails: RutDetails[]): Promise<void> {
    try {
      // Cargar el template o crear workbook básico
      const workbook = await this.loadTemplateFile()

      // Crear datos para la hoja Clientes
      const clientesData = this.createClientesData(rutDetails)

      // Crear la hoja de Clientes con los datos
      const clientesWorksheet = XLSX.utils.aoa_to_sheet(clientesData)

      // Aplicar estilos básicos a los headers
      const range = XLSX.utils.decode_range(clientesWorksheet['!ref'] || 'A1:P1')

      // Establecer ancho de columnas
      const colWidths = [
        { wch: 10 }, // Compañía
        { wch: 15 }, // Código del cliente
        { wch: 30 }, // Razón social del cliente
        { wch: 8 },  // Moneda
        { wch: 15 }, // Condición de pago
        { wch: 12 }, // Tipo de cliente
        { wch: 20 }, // Contacto
        { wch: 30 }, // Dirección 1
        { wch: 30 }, // Dirección 2
        { wch: 8 },  // País
        { wch: 12 }, // Departamento
        { wch: 8 },  // Ciudad
        { wch: 15 }, // Teléfono
        { wch: 25 }, // Email
        { wch: 12 }, // Fecha ingreso
        { wch: 15 }  // Teléfono Celular
      ]

      clientesWorksheet['!cols'] = colWidths

      // Reemplazar o agregar la hoja Clientes
      if (workbook.Sheets['Clientes']) {
        workbook.Sheets['Clientes'] = clientesWorksheet
      } else {
        XLSX.utils.book_append_sheet(workbook, clientesWorksheet, 'Clientes')
      }

      // Generar nombre de archivo con timestamp
      const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-')
      const fileName = `Clientes_Proveedores_Pomelo_${timestamp}.xlsx`

      // Exportar el archivo
      XLSX.writeFile(workbook, fileName)

      return
    } catch (error) {
      console.error('Error al exportar a Excel:', error)
      throw new Error('Error al generar el archivo Excel')
    }
  }

  public static async exportClientesListos(rutDetails: RutDetails[]): Promise<void> {
    // Filtrar solo los registros en estado LISTO
    const rutosListos = rutDetails.filter(rut => rut.processing_state === 'LISTO')

    if (rutosListos.length === 0) {
      throw new Error('No hay registros en estado LISTO para exportar')
    }

    await this.exportToExcel(rutosListos)
  }
}