'use client'

import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ParsedDataTable } from '@/types'
import { sanitizeVariableName } from '@/lib/parsers/csvParser'

const VARIABLE_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/

interface DataTablePreviewProps {
  table: ParsedDataTable
  onConfirm: (table: ParsedDataTable) => void
}

export function DataTablePreview({ table, onConfirm }: DataTablePreviewProps) {
  const [headers, setHeaders] = useState<string[]>([...table.headers])
  const [rows, setRows] = useState<Record<string, string>[]>(
    table.rows.map((r) => ({ ...r }))
  )

  const updateHeader = (idx: number, value: string) => {
    setHeaders((prev) => {
      const next = [...prev]
      next[idx] = value
      return next
    })
  }

  const sanitizeHeader = (idx: number) => {
    setHeaders((prev) => {
      const next = [...prev]
      next[idx] = sanitizeVariableName(next[idx])
      return next
    })
  }

  const updateCell = (rowIdx: number, colKey: string, newColKey: string, value: string) => {
    setRows((prev) => {
      const next = prev.map((r) => ({ ...r }))
      next[rowIdx][newColKey] = value
      return next
    })
  }

  const isHeaderValid = (h: string) => h.length > 0 && VARIABLE_REGEX.test(h)

  const hasErrors = headers.some((h) => !isHeaderValid(h))

  const handleConfirm = useCallback(() => {
    // Re-sanitize + build final table
    const finalHeaders = headers.map(sanitizeVariableName)
    const invalidIdx = finalHeaders.findIndex((h) => !isHeaderValid(h))
    if (invalidIdx !== -1) {
      toast.error(`Column ${invalidIdx + 1} has an invalid variable name. Use letters, digits, and underscores only.`)
      return
    }
    // Remap rows to final headers
    const finalRows = rows.map((row) => {
      const record: Record<string, string> = {}
      table.headers.forEach((origKey, i) => {
        record[finalHeaders[i]] = row[origKey] ?? ''
      })
      return record
    })
    onConfirm({
      headers: finalHeaders,
      rows: finalRows,
      rowCount: finalRows.length,
      columnCount: finalHeaders.length,
    })
  }, [headers, rows, table.headers, onConfirm])

  return (
    <div className="space-y-4">
      {/* Metadata */}
      <div className="flex items-center gap-2 text-sm text-zinc-600">
        <Badge variant="secondary">{headers.length} variables</Badge>
        <span>·</span>
        <Badge variant="secondary">{rows.length} documents will be generated</Badge>
      </div>

      {/* Scrollable table */}
      <div className="rounded-lg border border-zinc-200 overflow-auto max-h-[400px]">
        <table className="w-full text-sm border-collapse">
          <thead className="sticky top-0 z-10">
            <tr>
              {headers.map((h, i) => (
                <th key={i} className="bg-slate-100 border-b border-zinc-200 p-0 min-w-[130px]">
                  <Input
                    value={h}
                    onChange={(e) => updateHeader(i, e.target.value)}
                    onBlur={() => sanitizeHeader(i)}
                    placeholder="variableName"
                    className={cn(
                      'rounded-none border-0 border-r border-zinc-200 bg-transparent font-mono text-xs h-9',
                      'focus-visible:ring-0 focus-visible:ring-offset-0',
                      !isHeaderValid(h) && 'border-red-400 bg-red-50 text-red-700 placeholder:text-red-300'
                    )}
                  />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr key={rowIdx} className="hover:bg-zinc-50">
                {table.headers.map((origKey, colIdx) => (
                  <td key={colIdx} className="border-b border-r border-zinc-100 p-0">
                    <Input
                      value={row[origKey] ?? ''}
                      onChange={(e) => updateCell(rowIdx, origKey, origKey, e.target.value)}
                      className="rounded-none border-0 bg-transparent text-xs h-8 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        {hasErrors && (
          <p className="text-xs text-red-600">Fix highlighted header names before continuing.</p>
        )}
        <div className="ml-auto">
          <Button onClick={handleConfirm} disabled={hasErrors}>
            Confirm Data →
          </Button>
        </div>
      </div>
    </div>
  )
}
