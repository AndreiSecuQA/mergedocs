'use client'

import { useEffect, useRef } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { TextStyle } from '@tiptap/extension-text-style'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import { Placeholder } from '@tiptap/extension-placeholder'
import { useDroppable } from '@dnd-kit/core'
import { VariableNode } from '@/lib/tiptap/VariableNode'
import { EditorToolbar } from './EditorToolbar'
import { cn } from '@/lib/utils'

interface TemplateEditorProps {
  initialHtml: string
  onChange: (html: string) => void
  onVariableDrop?: (name: string) => void
  editorRef?: React.MutableRefObject<{ insertVariable: (name: string) => void } | null>
}

export function TemplateEditor({
  initialHtml,
  onChange,
  editorRef,
}: TemplateEditorProps) {
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialHtmlRef = useRef(initialHtml)

  const { setNodeRef, isOver } = useDroppable({ id: 'editor-area' })

  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: 'Start typing your template…' }),
      VariableNode,
    ],
    content: initialHtmlRef.current || '<p></p>',
    immediatelyRender: false,
    onUpdate({ editor }) {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
      debounceTimer.current = setTimeout(() => {
        onChange(editor.getHTML())
      }, 300)
    },
  })

  // Expose insertVariable via editorRef
  useEffect(() => {
    if (editorRef) {
      editorRef.current = {
        insertVariable: (name: string) => {
          editor?.chain().focus().insertVariable(name).run()
        },
      }
    }
  }, [editor, editorRef])

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current)
    }
  }, [])

  return (
    <div className="flex flex-col flex-1 overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <EditorToolbar editor={editor ?? null} />

      <div
        ref={setNodeRef}
        className={cn(
          'flex-1 overflow-y-auto transition-colors',
          isOver && 'bg-blue-50/40'
        )}
      >
        <EditorContent
          editor={editor}
          className="h-full [&_.ProseMirror]:min-h-[400px] [&_.ProseMirror]:p-6 [&_.ProseMirror]:outline-none [&_.ProseMirror_p]:my-2 [&_.ProseMirror_p]:leading-relaxed [&_.ProseMirror_.is-editor-empty:first-child::before]:content-[attr(data-placeholder)] [&_.ProseMirror_.is-editor-empty:first-child::before]:text-zinc-300 [&_.ProseMirror_.is-editor-empty:first-child::before]:float-left [&_.ProseMirror_.is-editor-empty:first-child::before]:pointer-events-none [&_.ProseMirror_.is-editor-empty:first-child::before]:h-0"
        />
      </div>
    </div>
  )
}
