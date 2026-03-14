'use client'

import { useEffect, useRef, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { WizardLayout } from '@/components/shared/WizardLayout'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { Button } from '@/components/ui/button'
import { useWizardStore } from '@/lib/store/wizardStore'
import { Loader2 } from 'lucide-react'

const MAX_POLL_ATTEMPTS = 150 // 5 minutes at 2s intervals

// ——— Inner component that reads searchParams ——————————————————————————
function DownloadContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const status = searchParams.get('status')
  const cancelled = searchParams.get('cancelled')
  const { reset } = useWizardStore()

  const [downloadUrl, setDownloadUrl] = useState<string | null>(null)
  const [isPolling, setIsPolling] = useState(false)
  const [timedOut, setTimedOut] = useState(false)
  const [autoDownloaded, setAutoDownloaded] = useState(false)
  const pollAttempts = useRef(0)
  const pollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ——— Cancelled / no token states ——————————————————————————————————
  const isCancelled = cancelled === 'true' || !token || status !== 'success'

  useEffect(() => {
    if (isCancelled) return

    setIsPolling(true)

    const poll = async () => {
      if (pollAttempts.current >= MAX_POLL_ATTEMPTS) {
        setTimedOut(true)
        setIsPolling(false)
        return
      }
      pollAttempts.current += 1

      try {
        const res = await fetch(`/api/session-status?token=${token}`)
        const data = await res.json()
        if (data.status === 'ready' && data.downloadUrl) {
          setDownloadUrl(data.downloadUrl)
          setIsPolling(false)
          return
        }
      } catch {
        // network hiccup — keep polling
      }

      pollTimer.current = setTimeout(poll, 2000)
    }

    poll()

    return () => {
      if (pollTimer.current) clearTimeout(pollTimer.current)
    }
  }, [isCancelled, token])

  // Auto-trigger download once URL is available
  useEffect(() => {
    if (downloadUrl && !autoDownloaded) {
      setAutoDownloaded(true)
      window.location.href = downloadUrl
    }
  }, [downloadUrl, autoDownloaded])

  // ——— Render: cancelled / no token ——————————————————————————————————
  if (isCancelled) {
    return (
      <WizardLayout currentStep={5}>
        <div className="max-w-lg mx-auto text-center space-y-4 py-16">
          <div className="text-4xl">✕</div>
          <h2 className="text-xl font-semibold">Payment Cancelled</h2>
          <p className="text-muted-foreground">
            Your payment was cancelled. Your template has not been lost.
          </p>
          <Button onClick={() => router.push('/preview')}>← Back to Preview</Button>
        </div>
      </WizardLayout>
    )
  }

  // ——— Render: timed out ——————————————————————————————————————————
  if (timedOut) {
    return (
      <WizardLayout currentStep={5}>
        <div className="max-w-lg mx-auto text-center space-y-4 py-16">
          <div className="text-4xl">⏱</div>
          <h2 className="text-xl font-semibold">Taking Longer Than Expected</h2>
          <p className="text-muted-foreground">
            Generation is taking longer than expected. Please check your email or try again.
          </p>
          <a href="mailto:support@mergedocs.app">
            <Button variant="outline">Contact Support</Button>
          </a>
        </div>
      </WizardLayout>
    )
  }

  // ——— Render: polling ——————————————————————————————————————————————
  if (isPolling || !downloadUrl) {
    return (
      <WizardLayout currentStep={5}>
        <div className="max-w-lg mx-auto text-center space-y-4 py-16">
          <Loader2 className="w-10 h-10 animate-spin mx-auto text-blue-600" />
          <h2 className="text-xl font-semibold">Generating Your Documents…</h2>
          <p className="text-muted-foreground">
            This may take a moment. Please don&apos;t close this tab.
          </p>
        </div>
      </WizardLayout>
    )
  }

  // ——— Render: ready ——————————————————————————————————————————————
  return (
    <WizardLayout currentStep={5}>
      <div className="max-w-lg mx-auto text-center space-y-4 py-16">
        <div className="text-5xl">✓</div>
        <h2 className="text-xl font-semibold">Your Documents Are Ready</h2>
        <p className="text-muted-foreground">
          Download started automatically. Check your Downloads folder.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href={downloadUrl}>
            <Button>↓ Download Again</Button>
          </a>
          <Button
            variant="outline"
            onClick={() => {
              reset()
              router.push('/')
            }}
          >
            Start New Merge
          </Button>
        </div>
      </div>
    </WizardLayout>
  )
}

// ——— Page wrapper with Suspense (required for useSearchParams in App Router) —
export default function DownloadPage() {
  return (
    <Suspense
      fallback={
        <WizardLayout currentStep={5}>
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        </WizardLayout>
      }
    >
      <DownloadContent />
    </Suspense>
  )
}

