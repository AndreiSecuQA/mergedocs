'use client'

import { Editor } from '@tiptap/react'
import {
  Bold,
  Italic,
  Underline,
  Heading1,
  Heading2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Undo,
  Redo,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface EditorToolbarProps {
  editor: Editor | null
}

interface ToolbarButtonProps {
  onClick: () => void
  isActive?: boolean
  disabled?: boolean
  title: string
  children: React.ReactNode
}

function ToolbarButton({ onClick, isActive = false, disabled = false, title, children }: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
      aria-pressed={isActive}
      className={cn(
        'p-1.5 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400',
        isActive ? 'bg-blue-100 text-blue-700' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
        disabled && 'opacity-40 cursor-not-allowed pointer-events-none'
      )}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-zinc-200 mx-1" aria-hidden="true" />
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  const disabled = !editor

  return (
    <div
      className="flex flex-wrap items-center gap-0.5 p-2 border-b border-zinc-200 bg-white"
      role="toolbar"
      aria-label="Text formatting"
    >
      {/* Bold */}
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleBold().run()}
        isActive={editor?.isActive('bold') ?? false}
        disabled={disabled}
        title="Bold (⌘B)"
      >
        <Bold className="w-4 h-4" />
      </ToolbarButton>

      {/* Italic */}
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleItalic().run()}
        isActive={editor?.isActive('italic') ?? false}
        disabled={disabled}
        title="Italic (⌘I)"
      >
        <Italic className="w-4 h-4" />
      </ToolbarButton>

      {/* Underline */}
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleUnderline().run()}
        isActive={editor?.isActive('underline') ?? false}
        disabled={disabled}
        title="Underline (⌘U)"
      >
        <Underline className="w-4 h-4" />
      </ToolbarButton>

      <Divider />

      {/* H1 */}
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
        isActive={editor?.isActive('heading', { level: 1 }) ?? false}
        disabled={disabled}
        title="Heading 1"
      >
        <Heading1 className="w-4 h-4" />
      </ToolbarButton>

      {/* H2 */}
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
        isActive={editor?.isActive('heading', { level: 2 }) ?? false}
        disabled={disabled}
        title="Heading 2"
      >
        <Heading2 className="w-4 h-4" />
      </ToolbarButton>

      <Divider />

      {/* Align Left */}
      <ToolbarButton
        onClick={() => editor?.chain().focus().setTextAlign('left').run()}
        isActive={editor?.isActive({ textAlign: 'left' }) ?? false}
        disabled={disabled}
        title="Align left"
      >
        <AlignLeft className="w-4 h-4" />
      </ToolbarButton>

      {/* Align Center */}
      <ToolbarButton
        onClick={() => editor?.chain().focus().setTextAlign('center').run()}
        isActive={editor?.isActive({ textAlign: 'center' }) ?? false}
        disabled={disabled}
        title="Align center"
      >
        <AlignCenter className="w-4 h-4" />
      </ToolbarButton>

      {/* Align Right */}
      <ToolbarButton
        onClick={() => editor?.chain().focus().setTextAlign('right').run()}
        isActive={editor?.isActive({ textAlign: 'right' }) ?? false}
        disabled={disabled}
        title="Align right"
      >
        <AlignRight className="w-4 h-4" />
      </ToolbarButton>

      <Divider />

      {/* Bullet list */}
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleBulletList().run()}
        isActive={editor?.isActive('bulletList') ?? false}
        disabled={disabled}
        title="Bullet list"
      >
        <List className="w-4 h-4" />
      </ToolbarButton>

      {/* Ordered list */}
      <ToolbarButton
        onClick={() => editor?.chain().focus().toggleOrderedList().run()}
        isActive={editor?.isActive('orderedList') ?? false}
        disabled={disabled}
        title="Numbered list"
      >
        <ListOrdered className="w-4 h-4" />
      </ToolbarButton>

      <Divider />

      {/* Undo */}
      <ToolbarButton
        onClick={() => editor?.chain().focus().undo().run()}
        disabled={disabled || !editor?.can().undo()}
        title="Undo (⌘Z)"
      >
        <Undo className="w-4 h-4" />
      </ToolbarButton>

      {/* Redo */}
      <ToolbarButton
        onClick={() => editor?.chain().focus().redo().run()}
        disabled={disabled || !editor?.can().redo()}
        title="Redo (⌘⇧Z)"
      >
        <Redo className="w-4 h-4" />
      </ToolbarButton>
    </div>
  )
}
