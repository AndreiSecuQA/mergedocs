'use client'

import { useCallback, useState } from 'react'
import { FileUp, FilePlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DocumentSourceChoiceProps {
  onImportSuccess: (html: string) => void
  onCreateNew: () => void
}

export function DocumentSourceChoice({ onImportSuccess, onCreateNew }: DocumentSourceChoiceProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const processFile = useCallback(
    async (file: File) => {
      const name = file.name.toLowerCase()
      const ext = name.includes('.') ? name.split('.').pop()! : ''

      // .odt and .doc are binary formats — show a clear conversion message
      if (ext === 'odt' || ext === 'doc') {
        toast.error(
          `".${ext}" cannot be imported directly. Open the file in Word (or LibreOffice) and save it as .docx, then upload again.`,
          { duration: 8000 }
        )
        return
      }

      const apiFormats: string[] = [] // all formats handled client-side now
      const clientFormats = ['docx', 'txt', 'html', 'htm', 'md', 'markdown']

      if (!apiFormats.includes(ext) && !clientFormats.includes(ext)) {
        toast.error(`".${ext || 'Unknown format'}" is not supported. Use .docx, .txt, .html, or .md.`)
        return
      }

      setIsUploading(true)
      try {
        if (ext === 'docx') {
          // Parse DOCX fully client-side using mammoth's browser build.
          // This avoids all Vercel serverless bundling issues with mammoth.
          const arrayBuffer = await file.arrayBuffer()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const mammothMod = await import('mammoth/mammoth.browser') as any
          const mammoth = mammothMod.default ?? mammothMod
          const result = await mammoth.convertToHtml({ arrayBuffer })
          onImportSuccess(result.value || '<p></p>')
          toast.success('Document imported successfully')
        } else if (ext === 'txt') {
          const text = await file.text()
          const html = text
            .split('\n')
            .filter((line) => line.trim())
            .map((line) => `<p>${line}</p>`)
            .join('')
        } else if (ext === 'html' || ext === 'htm') {
          const html = await file.text()
          onImportSuccess(html || '<p></p>')
          toast.success('Document imported successfully')
        } else if (ext === 'md' || ext === 'markdown') {
          const md = await file.text()
          const html = md
            .split('\n')
            .map((line) => {
              if (line.startsWith('### ')) return `<h3>${line.slice(4)}</h3>`
              if (line.startsWith('## ')) return `<h2>${line.slice(3)}</h2>`
              if (line.startsWith('# ')) return `<h1>${line.slice(2)}</h1>`
              line = line.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
              line = line.replace(/\*(.+?)\*/g, '<em>$1</em>')
              if (line.trim() === '') return ''
              return `<p>${line}</p>`
            })
            .filter(Boolean)
            .join('')
          onImportSuccess(html || '<p></p>')
          toast.success('Document imported successfully')
        }
      } catch {
        toast.error('Something went wrong while reading the file. Please try again.')
      } finally {
        setIsUploading(false)
      }
    },
    [onImportSuccess]
  )

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
    e.target.value = ''
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Now, set up your document template</h2>
        <p className="text-zinc-500 mt-1">Import an existing document or start from a blank editor.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Import Document */}
        <label
          htmlFor="doc-upload"
          className={cn(
            'relative flex flex-col rounded-xl border-2 border-dashed cursor-pointer transition-all',
            isDragging ? 'border-blue-500 bg-blue-50 shadow-inner' : 'border-zinc-300 hover:border-blue-400 hover:bg-blue-50/30',
            isUploading && 'pointer-events-none'
          )}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={onDrop}
        >
          <input
            id="doc-upload"
            type="file"
            accept=".docx,.txt,.html,.htm,.md,.markdown"
            className="sr-only"
            onChange={onInputChange}
          />

          {/* Spinner overlay */}
          {isUploading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 rounded-xl z-10">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-2" />
              <span className="text-sm text-zinc-600 font-medium">Importing…</span>
            </div>
          )}

          <div className="p-6 flex flex-col h-full">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center mb-4">
              <FileUp className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-base font-semibold text-zinc-900 mb-1">Import a Document</h3>
            <p className="text-sm text-zinc-500 mb-4 flex-1">.docx, .txt, .html, .md</p>
            <p className="text-xs text-zinc-400">
              {isDragging ? 'Release to import' : 'Drop file here or click to browse'}
            </p>
          </div>
        </label>

        {/* Create New */}
        <Card className="hover:border-blue-300 hover:shadow-md transition-all group">
          <CardHeader>
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center mb-3 group-hover:bg-green-100 transition-colors">
              <FilePlus className="w-6 h-6 text-green-600" />
            </div>
            <CardTitle className="text-base">Start from Scratch</CardTitle>
            <CardDescription>Open a blank editor and write your template</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full" onClick={onCreateNew}>
              Open Editor
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
