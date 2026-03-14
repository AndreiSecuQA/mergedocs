'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { WizardLayout } from '@/components/shared/WizardLayout'
import { Button } from '@/components/ui/button'
import { useWizardStore } from '@/lib/store/wizardStore'

export default function PreviewPage() {
  const router = useRouter()
  const { dataTable, previewHtml, previewDocxBase64, dataTable: dt } = useWizardStore()

  useEffect(() => {
    if (!dataTable) router.replace('/')
  }, [dataTable, router])

  if (!dataTable) return null

  const downloadFirstDoc = () => {
    if (!previewDocxBase64) return
    const binary = atob(previewDocxBase64)
    const bytes = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
    const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'mergedocs-preview.docx'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <WizardLayout currentStep={4}>
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Link href="/editor" className="inline-flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-800">
            <ChevronLeft className="w-4 h-4" /> Edit Template
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={downloadFirstDoc} disabled={!previewDocxBase64}>
              Download First Document (Free)
            </Button>
            <Button onClick={() => router.push('/download')}>
              Download All ({dt?.rowCount ?? 0} documents) →
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
          <div className="bg-zinc-50 border-b border-zinc-200 px-4 py-2 text-xs text-zinc-500 font-medium">
            Preview — showing row 1 of {dt?.rowCount ?? 0}
          </div>
          <div
            className="p-8 prose prose-zinc max-w-none min-h-[400px]"
            dangerouslySetInnerHTML={{ __html: previewHtml || '<p class="text-zinc-400">No preview available.</p>' }}
          />
        </div>
      </div>
    </WizardLayout>
  )
}
