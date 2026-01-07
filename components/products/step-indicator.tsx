"use client"

import { Check } from "lucide-react"

interface Step {
  id: number
  name: string
}

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300 ${
                  index < currentStep - 1
                    ? "bg-green-500 border-green-500 text-white"
                    : index === currentStep - 1
                    ? "bg-blue-500 border-blue-500 text-white"
                    : "bg-white border-gray-300 text-gray-500"
                }`}
              >
                {index < currentStep - 1 ? (
                  <Check className="w-5 h-5" />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium ${
                  index <= currentStep - 1 ? "text-blue-600" : "text-gray-500"
                }`}
              >
                {step.name}
              </span>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-2 rounded ${
                  index < currentStep - 1 ? "bg-green-500" : "bg-gray-200"
                }`}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}