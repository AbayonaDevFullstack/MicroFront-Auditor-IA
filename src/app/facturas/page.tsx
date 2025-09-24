"use client"

import { useState } from "react"
import { Receipt, DollarSign, Clock, CheckCircle, AlertTriangle, Filter, Download, Upload, Search } from "lucide-react"
import { InvoiceUploadModal } from "@/components/invoices/invoice-upload-modal"
import { InvoiceDetailsModal } from "@/components/invoices/invoice-details-modal"
import { type InvoiceData } from "@/lib/api/invoice-service"

export default function FacturasPage() {
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null)
  const facturas = [
    {
      id: "FAC-2024-001",
      number: "FV-001234",
      supplier: "Constructora ABC S.A.S.",
      client: "Empresa Cliente XYZ",
      amount: 2450000,
      status: "approved",
      issueDate: "2024-01-15",
      dueDate: "2024-02-14",
      type: "Venta",
      tax: 465500,
      category: "Servicios"
    },
    {
      id: "FAC-2024-002",
      number: "FC-005678",
      supplier: "Servicios Logísticos XYZ",
      client: "Nuestra Empresa",
      amount: 890000,
      status: "pending",
      issueDate: "2024-01-14",
      dueDate: "2024-02-13",
      type: "Compra",
      tax: 169100,
      category: "Logística"
    },
    {
      id: "FAC-2024-003",
      number: "FV-001235",
      supplier: "Nuestra Empresa",
      client: "Cliente Corporativo DEF",
      amount: 5670000,
      status: "approved",
      issueDate: "2024-01-13",
      dueDate: "2024-02-12",
      type: "Venta",
      tax: 1077300,
      category: "Consultoría"
    },
    {
      id: "FAC-2024-004",
      number: "FC-005679",
      supplier: "Transportes Rápidos GHI",
      client: "Nuestra Empresa",
      amount: 340000,
      status: "rejected",
      issueDate: "2024-01-12",
      dueDate: "2024-02-11",
      type: "Compra",
      tax: 64600,
      category: "Transporte"
    },
    {
      id: "FAC-2024-005",
      number: "FV-001236",
      supplier: "Nuestra Empresa",
      client: "Nuevo Cliente MNO",
      amount: 1250000,
      status: "in_review",
      issueDate: "2024-01-11",
      dueDate: "2024-02-10",
      type: "Venta",
      tax: 237500,
      category: "Productos"
    }
  ]

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "approved":
        return { label: "Aprobada", class: "status-valid", icon: CheckCircle }
      case "pending":
        return { label: "Pendiente", class: "status-pending", icon: Clock }
      case "in_review":
        return { label: "En Revisión", class: "status-warning", icon: Receipt }
      case "rejected":
        return { label: "Rechazada", class: "status-error", icon: AlertTriangle }
      default:
        return { label: "Desconocido", class: "status-pending", icon: Clock }
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const handleUploadSuccess = (data: InvoiceData) => {
    setInvoiceData(data)
    setShowDetailsModal(true)
  }

  const totalFacturas = facturas.length
  const totalAmount = facturas.reduce((sum, factura) => sum + factura.amount, 0)
  const approvedAmount = facturas
    .filter(f => f.status === 'approved')
    .reduce((sum, factura) => sum + factura.amount, 0)
  const pendingCount = facturas.filter(f => f.status === 'pending').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="accountingTitle">
          Control de Facturas
        </h1>
        <p className="accountingParagraph">
          Sistema integral para la gestión, validación y seguimiento de facturas de compra y venta.
          Incluye verificación automática, control de impuestos y análisis de cumplimiento fiscal.
        </p>
      </div>

      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Upload className="h-4 w-4" />
            Cargar Facturas
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Filter className="h-4 w-4 inline mr-2" />
            Filtros Avanzados
          </button>
          <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <Download className="h-4 w-4 inline mr-2" />
            Exportar
          </button>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar facturas..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-base p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Receipt className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-sm">Total Facturas</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">{totalFacturas}</p>
          <p className="text-xs text-muted-foreground">Este período</p>
        </div>

        <div className="card-base p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-sm">Monto Total</h3>
          </div>
          <p className="text-xl font-bold text-green-600 amount-positive">
            {formatCurrency(totalAmount)}
          </p>
          <p className="text-xs text-muted-foreground">Valor bruto</p>
        </div>

        <div className="card-base p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-sm">Aprobadas</h3>
          </div>
          <p className="text-xl font-bold text-green-600 amount-positive">
            {formatCurrency(approvedAmount)}
          </p>
          <p className="text-xs text-muted-foreground">Procesadas</p>
        </div>

        <div className="card-base p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <h3 className="font-semibold text-sm">Pendientes</h3>
          </div>
          <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
          <p className="text-xs text-muted-foreground">Por revisar</p>
        </div>
      </div>

      {/* Facturas Table */}
      <div className="card-base p-6">
        <h3 className="accountingSection mb-4">Facturas Recientes</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 font-semibold">ID</th>
                <th className="text-left py-3 px-4 font-semibold">Número</th>
                <th className="text-left py-3 px-4 font-semibold">Tipo</th>
                <th className="text-left py-3 px-4 font-semibold">Proveedor/Cliente</th>
                <th className="text-left py-3 px-4 font-semibold">Monto</th>
                <th className="text-left py-3 px-4 font-semibold">Impuestos</th>
                <th className="text-left py-3 px-4 font-semibold">Estado</th>
                <th className="text-left py-3 px-4 font-semibold">Fecha Emisión</th>
                <th className="text-left py-3 px-4 font-semibold">Vencimiento</th>
                <th className="text-left py-3 px-4 font-semibold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((factura) => {
                const statusConfig = getStatusConfig(factura.status)
                const StatusIcon = statusConfig.icon
                const isOverdue = new Date(factura.dueDate) < new Date() && factura.status === 'pending'

                return (
                  <tr key={factura.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="py-3 px-4 font-mono text-xs">{factura.id}</td>
                    <td className="py-3 px-4 font-mono font-medium">{factura.number}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        factura.type === 'Venta'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {factura.type}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-medium text-sm">
                          {factura.type === 'Venta' ? factura.client : factura.supplier}
                        </p>
                        <p className="text-xs text-muted-foreground">{factura.category}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${
                        factura.type === 'Venta' ? 'amount-positive' : 'amount-neutral'
                      }`}>
                        {formatCurrency(factura.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">
                      {formatCurrency(factura.tax)}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <StatusIcon className="h-4 w-4" />
                        <span className={`px-2 py-1 text-xs rounded-full border ${statusConfig.class}`}>
                          {statusConfig.label}
                        </span>
                        {isOverdue && (
                          <AlertTriangle className="h-3 w-3 text-red-500" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm">{factura.issueDate}</td>
                    <td className="py-3 px-4 text-sm">
                      <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                        {factura.dueDate}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button className="text-green-600 hover:text-green-700 text-sm font-medium">
                          Ver
                        </button>
                        <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                          Procesar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-base p-6">
          <h3 className="accountingSection mb-4">Análisis por Tipo</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Facturas de Venta</span>
              </div>
              <div className="text-right">
                <p className="font-semibold amount-positive">
                  {formatCurrency(facturas.filter(f => f.type === 'Venta').reduce((sum, f) => sum + f.amount, 0))}
                </p>
                <p className="text-xs text-muted-foreground">
                  {facturas.filter(f => f.type === 'Venta').length} facturas
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span>Facturas de Compra</span>
              </div>
              <div className="text-right">
                <p className="font-semibold amount-neutral">
                  {formatCurrency(facturas.filter(f => f.type === 'Compra').reduce((sum, f) => sum + f.amount, 0))}
                </p>
                <p className="text-xs text-muted-foreground">
                  {facturas.filter(f => f.type === 'Compra').length} facturas
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="card-base p-6">
          <h3 className="accountingSection mb-4">Próximos Vencimientos</h3>
          <div className="space-y-3">
            {facturas
              .filter(f => f.status === 'pending')
              .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
              .slice(0, 3)
              .map(factura => (
                <div key={factura.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">{factura.number}</p>
                    <p className="text-xs text-muted-foreground">
                      {factura.type === 'Venta' ? factura.client : factura.supplier}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{formatCurrency(factura.amount)}</p>
                    <p className="text-xs text-yellow-600">Vence: {factura.dueDate}</p>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      <InvoiceUploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onSuccess={handleUploadSuccess}
      />

      <InvoiceDetailsModal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        data={invoiceData}
      />
    </div>
  )
}