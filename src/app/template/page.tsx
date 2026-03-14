'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { WizardLayout } from '@/components/shared/WizardLayout'
import { DocumentSourceChoice } from '@/components/wizard/DocumentSourceChoice'
import { useWizardStore } from '@/lib/store/wizardStore'

export default function TemplatePage() {
  const router = useRouter()
  const { dataTable, setTemplateHtml, setTemplateSource, setCurrentStep } = useWizardStore()

  // Guard: redirect if no data
  useEffect(() => {
    if (!dataTable) router.replace('/')
  }, [dataTable, router])

  if (!dataTable) return null

  const handleImportSuccess = (html: string) => {
    setTemplateHtml(html)
    setTemplateSource('import')
    setCurrentStep(3)
    router.push('/editor')
  }

  const handleCreateNew = () => {
    setTemplateHtml('')
    setTemplateSource('new')
    setCurrentStep(3)
    router.push('/editor')
  }

  return (
    <WizardLayout currentStep={2}>
      <div className="max-w-3xl mx-auto space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </Link>
        <DocumentSourceChoice
          onImportSuccess={handleImportSuccess}
          onCreateNew={handleCreateNew}
        />
      </div>
    </WizardLayout>
  )
}
