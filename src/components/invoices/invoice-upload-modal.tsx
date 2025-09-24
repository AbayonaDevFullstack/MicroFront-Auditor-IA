"use client"

import { useState, useRef } from "react"
import { Upload, X, FileText, AlertCircle } from "lucide-react"
import { invoiceService, type UploadProgress } from "@/lib/api/invoice-service"

interface InvoiceUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (data: any) => void
}

export function InvoiceUploadModal({ isOpen, onClose, onSuccess }: InvoiceUploadModalProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  if (!isOpen) return null

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = async (file: File) => {
    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      setError('Tipo de archivo no válido. Solo se permiten PDF e imágenes (JPEG, PNG, WebP)')
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo 10MB')
      return
    }

    setError(null)
    setIsUploading(true)
    setProgress(null)

    try {
      const data = await invoiceService.extractInvoiceData(file, (progress) => {
        setProgress(progress)
      })

      onSuccess(data)
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al procesar la factura')
    } finally {
      setIsUploading(false)
      setProgress(null)
    }
  }

  const resetModal = () => {
    setError(null)
    setProgress(null)
    setIsUploading(false)
    setDragActive(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClose = () => {
    if (!isUploading) {
      resetModal()
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-6 max-w-md w-full mx-4">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">
              Subir Factura
            </h3>
            {!isUploading && (
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600'
            } ${isUploading ? 'pointer-events-none opacity-50' : 'cursor-pointer hover:border-blue-400'}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              onChange={handleFileInput}
              disabled={isUploading}
            />

            <div className="space-y-4">
              <div className="flex justify-center">
                {isUploading ? (
                  <div className="h-12 w-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                ) : (
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                    <Upload className="h-6 w-6 text-blue-600" />
                  </div>
                )}
              </div>

              {isUploading ? (
                <div className="space-y-2">
                  <p className="text-sm text-foreground">Procesando factura...</p>
                  {progress && (
                    <div className="space-y-1">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress.percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-500">
                        {progress.percentage}% - {Math.round(progress.loaded / 1024)}KB de {Math.round(progress.total / 1024)}KB
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm text-foreground">
                    <span className="font-medium">Haz clic para subir</span> o arrastra y suelta
                  </p>
                  <p className="text-xs text-gray-500">
                    PDF, JPEG, PNG o WebP (máx. 10MB)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-red-800 dark:text-red-200">
                  Error al procesar factura
                </p>
                <p className="text-sm text-red-600 dark:text-red-300">
                  {error}
                </p>
              </div>
            </div>
          )}

          {/* Instructions */}
          {!isUploading && !error && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <FileText className="h-4 w-4" />
                <span>Formatos soportados</span>
              </div>
              <ul className="text-xs text-gray-500 space-y-1 ml-6">
                <li>• PDF de facturas electrónicas</li>
                <li>• Imágenes de facturas (JPEG, PNG, WebP)</li>
                <li>• Tamaño máximo: 10MB</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}