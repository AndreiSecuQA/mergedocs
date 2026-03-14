'use client'

import { useDraggable } from '@dnd-kit/core'
import { CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DraggableVariableChipProps {
  name: string
  isUsed: boolean
  onClick: () => void
}

export function DraggableVariableChip({ name, isUsed, onClick }: DraggableVariableChipProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: name,
    data: { variableName: name },
  })

  return (
    <div className="relative inline-flex">
      <button
        ref={setNodeRef}
        type="button"
        onClick={onClick}
        title={`Click or drag to insert $${name}`}
        aria-label={`Insert variable $${name}`}
        className={cn(
          'variable-chip',
          isUsed ? 'cursor-default opacity-80' : 'cursor-grab active:cursor-grabbing',
          isDragging && 'opacity-40'
        )}
        {...listeners}
        {...attributes}
      >
        ${name}
      </button>

      {/* Used indicator */}
      {isUsed && (
        <span
          className="absolute -top-1.5 -right-1.5 flex items-center justify-center"
          aria-label="Variable used in template"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-green-500 bg-white rounded-full" />
        </span>
      )}
    </div>
  )
}
