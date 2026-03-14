'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { WizardLayout } from '@/components/shared/WizardLayout'
import PreviewRenderer from '@/components/wizard/PreviewRenderer'
import { Button } from '@/components/ui/button'
import { useWizardStore } from '@/lib/store/wizardStore'
import { toast } from 'sonner'

// ——— DownloadGate ——————————————————————————————————————————
function DownloadGate({
  rowCount,
  onPay,
  isPaying,
}: {
  rowCount: number
  onPay: () => void
  isPaying: boolean
}) {
  if (rowCount === 1) {
    return (
      <p className="text-sm text-muted-foreground">
        You already have your document — download above.
      </p>
    )
  }

  const price = rowCount <= 50 ? '$4.99' : '$9.99'

  return (
    <div className="rounded-lg border p-4 space-y-3 bg-card">
      <h3 className="font-semibold">Download All {rowCount} Documents</h3>
      <p className="text-sm text-muted-foreground">
        Get all {rowCount} documents packaged as a .zip archive.
      </p>
      <div className="flex items-center justify-between">
        <span className="text-2xl font-bold">{price}</span>
        <Button onClick={onPay} disabled={isPaying}>
          {isPaying ? 'Redirecting…' : 'Pay & Download'}
        </Button>
      </div>
    </div>
  )
}

// ——— Main Page ———————————————————————————————————————————
export default function PreviewPage() {
  const router = useRouter()
  const { previewHtml, previewDocxBase64, dataTable, templateHtml } = useWizardStore()
  const [isPaying, setIsPaying] = useState(false)

  useEffect(() => {
    if (!previewHtml) router.replace('/editor')
  }, [previewHtml, router])

  if (!previewHtml || !dataTable) return null

  const rowCount = dataTable.rows.length

  // ——— Free single-doc download ——————————————————————————
  function handleFreeDownload() {
    if (!previewDocxBase64) return
    const bytes = Uint8Array.from(atob(previewDocxBase64), (c) => c.charCodeAt(0))
    const blob = new Blob([bytes], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'document-1.docx'
    a.click()
    URL.revokeObjectURL(url)
  }

  // ——— Stripe checkout ————————————————————————————————
  async function handlePayAndDownload() {
    setIsPaying(true)
    try {
      const sessionToken = crypto.randomUUID()
      // Persist state to localStorage so it survives the Stripe redirect
      localStorage.setItem(
        `mergedocs-session-${sessionToken}`,
        JSON.stringify({ templateHtml, dataTable })
      )

      const res = await fetch('/api/payment/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rowCount,
          sessionToken,
          templateHtml,
          dataTableJson: JSON.stringify(dataTable),
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Checkout failed. Please try again.')
        setIsPaying(false)
        return
      }

      window.location.href = data.checkoutUrl
    } catch {
      toast.error('Checkout failed. Please try again.')
      setIsPaying(false)
    }
  }

  return (
    <WizardLayout currentStep={4}>
      <div className="flex flex-col gap-6">
        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left 40%: summary panel */}
          <div className="lg:w-2/5 space-y-4">
            <h2 className="text-lg font-semibold">Preview — Row 1 of {rowCount}</h2>

            {/* Variable substitution table */}
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium">Variable</th>
                    <th className="px-3 py-2 text-left font-medium">Value (Row 1)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {dataTable.headers.map((header, i) => (
                    <tr key={header}>
                      <td className="px-3 py-2 font-mono text-xs text-blue-600">${header}</td>
                      <td className="px-3 py-2 truncate max-w-[150px] text-sm">
                        {dataTable.rows[0]?.[i] ?? (
                          <span className="text-muted-foreground italic">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-sm text-muted-foreground">
              {rowCount} total document{rowCount !== 1 ? 's' : ''} will be generated.
            </p>
          </div>

          {/* Right 60%: rendered preview */}
          <div className="lg:w-3/5">
            <PreviewRenderer previewHtml={previewHtml} />
          </div>
        </div>

        {/* Action bar */}
        <div className="border-t pt-4 space-y-4">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => router.push('/editor')}>
              ← Edit Template
            </Button>
            <Button
              variant="secondary"
              onClick={handleFreeDownload}
              disabled={!previewDocxBase64}
            >
              ↓ Download Document 1 — Free
            </Button>
          </div>

          <DownloadGate rowCount={rowCount} onPay={handlePayAndDownload} isPaying={isPaying} />
        </div>
      </div>
    </WizardLayout>
  )
}
