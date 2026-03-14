'use client'

import { Badge } from '@/components/ui/badge'
import { DraggableVariableChip } from '@/components/shared/DraggableVariableChip'

interface VariableSidebarProps {
  headers: string[]
  editorContent: string
  onInsert: (name: string) => void
}

export function VariableSidebar({ headers, editorContent, onInsert }: VariableSidebarProps) {
  return (
    <aside className="flex flex-col h-full bg-white border-r border-zinc-200 p-4 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <h2 className="text-sm font-semibold text-zinc-800">Variables</h2>
        <Badge variant="secondary" className="text-xs px-1.5 py-0">{headers.length}</Badge>
      </div>
      <p className="text-xs text-zinc-400 mb-4">Click or drag into document</p>

      {/* Chip list — skip empty-string headers (shouldn't happen after fixes, but guard anyway) */}
      <div className="flex flex-col gap-2">
        {headers.filter((name) => name.length > 0).map((name) => {
          const isUsed = editorContent.includes(`data-variable="${name}"`)
          return (
            <DraggableVariableChip
              key={name}
              name={name}
              isUsed={isUsed}
              onClick={() => onInsert(name)}
            />
          )
        })}
      </div>

      {headers.filter((n) => n.length > 0).length === 0 && (
        <p className="text-xs text-zinc-400 italic mt-2">No variables found.</p>
      )}
    </aside>
  )
}
