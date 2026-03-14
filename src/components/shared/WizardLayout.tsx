import { StepIndicator } from '@/components/wizard/StepIndicator'

interface WizardLayoutProps {
  children: React.ReactNode
  currentStep: 1 | 2 | 3 | 4 | 5
}

export function WizardLayout({ children, currentStep }: WizardLayoutProps) {
  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-zinc-200 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-6">
          {/* Logo */}
          <div className="shrink-0 flex items-center gap-2">
            <span className="font-bold text-xl text-blue-600 tracking-tight">MergeDocs</span>
          </div>

          {/* Step indicator — grows to center */}
          <div className="flex-1 flex justify-center">
            <StepIndicator currentStep={currentStep} />
          </div>

          {/* Spacer to balance flex */}
          <div className="shrink-0 w-[110px]" aria-hidden="true" />
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10">
        {children}
      </main>
    </div>
  )
}
