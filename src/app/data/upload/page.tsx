'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { WizardLayout } from '@/components/shared/WizardLayout'
import { FileUploader } from '@/components/wizard/FileUploader'
import { DataTablePreview } from '@/components/wizard/DataTablePreview'
import { useWizardStore } from '@/lib/store/wizardStore'
import { ParsedDataTable } from '@/types'

export default function UploadPage() {
  const router = useRouter()
  const { setDataTable, setDataSource, setCurrentStep } = useWizardStore()
  const [parsedTable, setParsedTable] = useState<ParsedDataTable | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleParsed = (table: ParsedDataTable) => {
    setParsedTable(table)
  }

  const handleConfirm = (table: ParsedDataTable) => {
    setDataTable(table)
    setDataSource('upload')
    setCurrentStep(2)
    router.push('/template')
  }

  return (
    <WizardLayout currentStep={1}>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800 mb-6"
          >
            <ChevronLeft className="w-4 h-4" /> Back
          </Link>
          <h2 className="text-2xl font-bold text-zinc-900">Upload your data file</h2>
          <p className="text-zinc-500 mt-1">Upload a CSV or Excel file. The first row must contain your variable names.</p>
        </div>

        <FileUploader onParsed={handleParsed} isLoading={isLoading} />

        {parsedTable && (
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-zinc-800">Preview &amp; confirm your data</h3>
            <DataTablePreview table={parsedTable} onConfirm={handleConfirm} />
          </div>
        )}
      </div>
    </WizardLayout>
  )
}
