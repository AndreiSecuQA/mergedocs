'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { WizardLayout } from '@/components/shared/WizardLayout'
import { ManualTableEditor } from '@/components/wizard/ManualTableEditor'
import { useWizardStore } from '@/lib/store/wizardStore'
import { ParsedDataTable } from '@/types'

export default function ManualPage() {
  const router = useRouter()
  const { setDataTable, setDataSource, setCurrentStep } = useWizardStore()

  const handleConfirm = (table: ParsedDataTable) => {
    setDataTable(table)
    setDataSource('manual')
    setCurrentStep(2)
    router.push('/template')
  }

  return (
    <WizardLayout currentStep={1}>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 mb-6"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </Link>
          <h2 className="text-2xl font-bold text-zinc-900">Build your data table</h2>
          <p className="text-zinc-500 mt-1">
            The first row contains your variable names. Each additional row generates one document.
          </p>
        </div>

        <ManualTableEditor onConfirm={handleConfirm} />
      </div>
    </WizardLayout>
  )
}
