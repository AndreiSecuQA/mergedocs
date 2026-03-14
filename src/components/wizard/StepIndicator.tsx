'use client'

import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3 | 4 | 5
}

const STEPS = [
  { label: 'Data Source' },
  { label: 'Document' },
  { label: 'Editor' },
  { label: 'Preview' },
  { label: 'Download' },
]

export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <nav aria-label="Wizard progress" className="flex items-center w-full max-w-2xl mx-auto">
      {STEPS.map((step, index) => {
        const stepNumber = (index + 1) as 1 | 2 | 3 | 4 | 5
        const isCompleted = stepNumber < currentStep
        const isCurrent = stepNumber === currentStep
        const isFuture = stepNumber > currentStep

        return (
          <div key={stepNumber} className="flex items-center flex-1 last:flex-none">
            {/* Circle + label */}
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors',
                  isCompleted && 'bg-blue-600 text-white',
                  isCurrent && 'bg-blue-600 text-white ring-4 ring-blue-100',
                  isFuture && 'bg-gray-200 text-gray-500'
                )}
                aria-current={isCurrent ? 'step' : undefined}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <span>{stepNumber}</span>
                )}
              </div>
              <span
                className={cn(
                  'mt-1.5 text-xs tracking-wide hidden sm:block transition-colors whitespace-nowrap',
                  isCurrent && 'text-blue-600 font-semibold',
                  isCompleted && 'text-blue-500 font-medium',
                  isFuture && 'text-gray-400'
                )}
              >
                {step.label}
              </span>
            </div>

            {/* Connector line (not after last) */}
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  'h-0.5 flex-1 mx-2 transition-colors',
                  isCompleted ? 'bg-blue-500' : 'bg-gray-200'
                )}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}
