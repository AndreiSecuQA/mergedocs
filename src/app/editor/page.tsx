'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { toast } from 'sonner'
import { Loader2, PanelLeftOpen, X } from 'lucide-react'
import { WizardLayout } from '@/components/shared/WizardLayout'
import { VariableSidebar } from '@/components/wizard/VariableSidebar'
import { TemplateEditor } from '@/components/wizard/TemplateEditor'
import { DraggableVariableChip } from '@/components/shared/DraggableVariableChip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'
import { useWizardStore } from '@/lib/store/wizardStore'

export default function EditorPage() {
  const router = useRouter()
  const {
    dataTable,
    templateHtml,
    templateName,
    setTemplateHtml,
    setTemplateName,
    setPreviewHtml,
    setPreviewDocxBase64,
    setCurrentStep,
  } = useWizardStore()

  const [editorHtml, setEditorHtml] = useState(templateHtml)
  const [activeDragId, setActiveDragId] = useState<string | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [mobileBannerDismissed, setMobileBannerDismissed] = useState(false)
  const editorHandleRef = useRef<{ insertVariable: (name: string) => void } | null>(null)

  const insertVariable = useCallback((name: string) => {
    editorHandleRef.current?.insertVariable(name)
  }, [])

  // Guard — must come after all hooks
  useEffect(() => {
    if (!dataTable) router.replace('/')
  }, [dataTable, router])

  if (!dataTable) return null

  const onDragStart = (event: DragStartEvent) => {
    setActiveDragId(String(event.active.id))
  }

  const onDragEnd = (event: DragEndEvent) => {
    setActiveDragId(null)
    const { over, active } = event
    if (over?.id === 'editor-area') {
      insertVariable(String(active.id))
    }
  }

  const handleGeneratePreview = async (): Promise<void> => {
    if (!dataTable?.rows?.[0]) {
      toast.error('No data rows found to preview.')
      return
    }
    // Check at least one variable is placed in the template
    if (!editorHtml.includes('data-variable=')) {
      toast.warning('Add at least one variable to your template before previewing.')
      return
    }
    setIsGenerating(true)
    try {
      setTemplateHtml(editorHtml)
      const res = await fetch('/api/generate/preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateHtml: editorHtml,
          firstRow: dataTable.rows[0],
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Preview generation failed.')
        return
      }
      setPreviewHtml(data.previewHtml)
      setPreviewDocxBase64(data.docxBase64)
      setCurrentStep(4)
      toast.success('Preview ready')
      router.push('/preview')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to generate preview.'
      toast.error(`Could not generate preview — ${msg}`)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <WizardLayout currentStep={3}>
      <ErrorBoundary>
        <div className="flex flex-col">
        {/* Mobile warning banner */}
        {!mobileBannerDismissed && (
        <div className="flex md:hidden items-start justify-between gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-4 text-sm text-amber-800">
          <span>⚠ The template editor works best on a desktop. Some drag features may not be available on mobile.</span>
          <button
            onClick={() => setMobileBannerDismissed(true)}
            className="shrink-0 mt-0.5"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex gap-0 rounded-xl border border-zinc-200 overflow-hidden shadow-sm bg-white" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
          {/* Desktop sidebar — hidden on mobile, shown md+ */}
          <div className="hidden md:block w-[260px] shrink-0">
            <VariableSidebar
              headers={dataTable.headers}
              editorContent={editorHtml}
              onInsert={insertVariable}
            />
          </div>

          {/* Editor area */}
          <div className="flex flex-col flex-1 overflow-hidden">
            <TemplateEditor
              initialHtml={templateHtml}
              onChange={setEditorHtml}
              editorRef={editorHandleRef}
            />
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activeDragId ? (
            <DraggableVariableChip
              name={activeDragId}
              isUsed={false}
              onClick={() => {}}
            />
          ) : null}
        </DragOverlay>

        {/* Bottom action bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {/* Mobile: Variables sheet trigger */}
            <Sheet>
              <SheetTrigger className="md:hidden inline-flex items-center gap-1 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground">
                <PanelLeftOpen className="w-4 h-4" /> Variables
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-0">
                <VariableSidebar
                  headers={dataTable.headers}
                  editorContent={editorHtml}
                  onInsert={insertVariable}
                />
              </SheetContent>
            </Sheet>

            <Input
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              className="max-w-xs border-transparent bg-transparent shadow-none text-sm font-medium text-zinc-700 hover:border-zinc-200 focus:border-zinc-300 focus-visible:ring-0"
              placeholder="Template name…"
            />
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={() => router.push('/template')}>
              ← Back to Document
            </Button>
            <Button onClick={handleGeneratePreview} disabled={isGenerating}>
              {isGenerating ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generating…</>
              ) : (
                'Generate Preview →'
              )}
            </Button>
          </div>
        </div>
      </DndContext>
        </div>
      </ErrorBoundary>
    </WizardLayout>
  )
}
