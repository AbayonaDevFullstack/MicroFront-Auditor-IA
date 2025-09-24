"use client"

import { Loader2, Upload, FileText } from "lucide-react"
import { cn } from "@/lib/utils"

interface LoadingOverlayProps {
  isVisible: boolean
  title?: string
  message?: string
  progress?: number
  filesCount?: number
  children?: React.ReactNode
}

export function LoadingOverlay({
  isVisible,
  title = "Procesando archivos...",
  message = "Por favor espera mientras extraemos los datos de RUT",
  progress,
  filesCount,
  children
}: LoadingOverlayProps) {
  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative z-10 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 p-8 max-w-md w-full mx-4">
        <div className="text-center space-y-6">
          {/* Icon and Animation */}
          <div className="relative">
            <div className="mx-auto h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>

            {/* Floating icons animation */}
            <div className="absolute -top-2 -right-2 h-6 w-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center animate-bounce delay-75">
              <FileText className="h-3 w-3 text-green-600" />
            </div>
            <div className="absolute -bottom-2 -left-2 h-6 w-6 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center animate-bounce delay-150">
              <Upload className="h-3 w-3 text-indigo-600" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              {title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {message}
            </p>
          </div>

          {/* Progress Bar */}
          {progress !== undefined && (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Progreso</span>
                <span>{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
                <div
                  className="h-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {/* Files Count */}
          {filesCount !== undefined && (
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <FileText className="h-4 w-4" />
              <span>Procesando {filesCount} archivo{filesCount !== 1 ? 's' : ''}</span>
            </div>
          )}

          {/* Custom content */}
          {children}

          {/* Status indicators */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 bg-green-500 rounded-full animate-pulse" />
              <span>Extrayendo datos</span>
            </div>
            <span>•</span>
            <div className="flex items-center gap-1">
              <div className="h-1.5 w-1.5 bg-blue-500 rounded-full animate-pulse delay-75" />
              <span>Validando información</span>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              ⚠️ No cierres esta ventana hasta que termine el procesamiento
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

interface ProcessingStepsProps {
  currentStep: number
  steps: string[]
}

export function ProcessingSteps({ currentStep, steps }: ProcessingStepsProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-medium text-foreground">Pasos del proceso:</h4>
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className={cn(
              "h-2 w-2 rounded-full flex-shrink-0",
              index < currentStep ? "bg-green-500" :
              index === currentStep ? "bg-blue-500 animate-pulse" :
              "bg-gray-300 dark:bg-gray-600"
            )} />
            <span className={cn(
              index <= currentStep ? "text-foreground" : "text-muted-foreground"
            )}>
              {step}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}