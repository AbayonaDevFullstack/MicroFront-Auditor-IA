"use client"

import { Check, Loader2 } from "lucide-react"

interface Step {
  id: string
  title: string
  description: string
  status: 'pending' | 'in_progress' | 'completed' | 'error'
}

interface ProgressStepsProps {
  steps: Step[]
  currentStep?: string
}

export function ProgressSteps({ steps, currentStep }: ProgressStepsProps) {
  return (
    <div className="space-y-4">
      {steps.map((step, index) => {
        const isActive = step.id === currentStep
        const isCompleted = step.status === 'completed'
        const isError = step.status === 'error'
        const isInProgress = step.status === 'in_progress'

        return (
          <div key={step.id} className="flex items-start gap-3">
            {/* Step indicator */}
            <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 flex-shrink-0 mt-0.5 ${
              isCompleted
                ? 'bg-green-100 border-green-500 text-green-700'
                : isError
                ? 'bg-red-100 border-red-500 text-red-700'
                : isInProgress
                ? 'bg-blue-100 border-blue-500 text-blue-700'
                : 'bg-gray-100 border-gray-300 text-gray-500'
            }`}>
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : isInProgress ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 min-w-0">
              <h4 className={`text-sm font-medium ${
                isCompleted
                  ? 'text-green-700'
                  : isError
                  ? 'text-red-700'
                  : isInProgress
                  ? 'text-blue-700'
                  : 'text-gray-700'
              }`}>
                {step.title}
              </h4>
              <p className={`text-xs mt-1 ${
                isCompleted
                  ? 'text-green-600'
                  : isError
                  ? 'text-red-600'
                  : isInProgress
                  ? 'text-blue-600'
                  : 'text-gray-500'
              }`}>
                {step.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}