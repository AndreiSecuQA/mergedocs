'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent } from '@dnd-kit/core'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { WizardLayout } from '@/components/shared/WizardLayout'
import { VariableSidebar } from '@/components/wizard/VariableSidebar'
import { TemplateEditor } from '@/components/wizard/TemplateEditor'
import { DraggableVariableChip } from '@/components/shared/DraggableVariableChip'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
  const editorHandleRef = useRef<{ insertVariable: (name: string) => void } | null>(null)

  // Guard
  useEffect(() => {
    if (!dataTable) router.replace('/')
  }, [dataTable, router])

  if (!dataTable) return null

  const insertVariable = useCallback((name: string) => {
    editorHandleRef.current?.insertVariable(name)
  }, [])

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

  const handleGeneratePreview = async () => {
    if (!dataTable?.rows?.[0]) {
      toast.error('No data rows found to preview.')
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
      router.push('/preview')
    } catch {
      toast.error('Failed to generate preview. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <WizardLayout currentStep={3}>
      <DndContext onDragStart={onDragStart} onDragEnd={onDragEnd}>
        <div className="flex gap-0 rounded-xl border border-zinc-200 overflow-hidden shadow-sm bg-white" style={{ height: 'calc(100vh - 200px)', minHeight: '500px' }}>
          {/* Sidebar */}
          <div className="w-[260px] shrink-0">
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
        <div className="mt-4 flex items-center justify-between gap-4">
          <Input
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="max-w-xs border-transparent bg-transparent shadow-none text-sm font-medium text-zinc-700 hover:border-zinc-200 focus:border-zinc-300 focus-visible:ring-0"
            placeholder="Template name…"
          />
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
    </WizardLayout>
  )
}
