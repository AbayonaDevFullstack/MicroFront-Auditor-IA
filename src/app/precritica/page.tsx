"use client"

import React, { useState } from "react"
import { BarChart3 } from "lucide-react"
import { ComparativeAnalysisModal } from "@/components/ui/comparative-analysis-modal"
import { ComparativeAnalysisResults } from "@/components/ui/comparative-analysis-results"
import { ComparativeAnalysisResponse } from "@/lib/api/comparative-analysis-service"

export default function PrecriticaPage() {
  const [showComparativeModal, setShowComparativeModal] = useState(false)
  const [comparativeAnalysisResult, setComparativeAnalysisResult] = useState<ComparativeAnalysisResponse | null>(null)

  const handleComparativeAnalysisComplete = (result: ComparativeAnalysisResponse) => {
    setComparativeAnalysisResult(result)
  }

  return (
    <div className="space-y-6">
      {/* Análisis Comparativo Button */}
      <button
        onClick={() => setShowComparativeModal(true)}
        className="flex items-center gap-2 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium"
      >
        <BarChart3 className="h-4 w-4" />
        Análisis Comparativo
      </button>

      {/* Comparative Analysis Results */}
      {comparativeAnalysisResult && (
        <ComparativeAnalysisResults
          results={comparativeAnalysisResult}
          onClose={() => setComparativeAnalysisResult(null)}
        />
      )}

      {/* Comparative Analysis Modal */}
      <ComparativeAnalysisModal
        isOpen={showComparativeModal}
        onClose={() => setShowComparativeModal(false)}
        onAnalysisComplete={handleComparativeAnalysisComplete}
      />
    </div>
  )
}