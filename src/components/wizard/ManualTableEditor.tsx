'use client'

import { useCallback, useState } from 'react'
import { Plus, Minus, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ParsedDataTable } from '@/types'
import { sanitizeVariableName } from '@/lib/parsers/csvParser'

const VARIABLE_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/
const MIN_COLS = 1
const MIN_ROWS = 1
const MAX_COLS = 50
const MAX_ROWS = 500

type CellGrid = string[][]

function makeEmptyRow(colCount: number): string[] {
  return Array(colCount).fill('')
}

interface ManualTableEditorProps {
  onConfirm: (table: ParsedDataTable) => void
}

export function ManualTableEditor({ onConfirm }: ManualTableEditorProps) {
  // headers[i] = header string for column i
  const [headers, setHeaders] = useState<string[]>(['column1', 'column2'])
  // rows[r][c] = data cell value
  const [rows, setRows] = useState<CellGrid>([['', ''], ['', '']])
  const [hoveredRow, setHoveredRow] = useState<number | null>(null)
  const [hoveredCol, setHoveredCol] = useState<number | null>(null)

  const colCount = headers.length
  const dataRowCount = rows.length

  // ── Header operations ──────────────────────────────────────────────
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

  const addColumn = () => {
    if (colCount >= MAX_COLS) { toast.error(`Maximum ${MAX_COLS} columns allowed.`); return }
    const newName = `column${colCount + 1}`
    setHeaders((prev) => [...prev, newName])
    setRows((prev) => prev.map((row) => [...row, '']))
  }

  const removeColumn = (idx: number) => {
    if (colCount <= MIN_COLS) return
    setHeaders((prev) => prev.filter((_, i) => i !== idx))
    setRows((prev) => prev.map((row) => row.filter((_, i) => i !== idx)))
  }

  const removeLastColumn = () => removeColumn(colCount - 1)

  // ── Row operations ─────────────────────────────────────────────────
  const updateCell = (rowIdx: number, colIdx: number, value: string) => {
    setRows((prev) => {
      const next = prev.map((r) => [...r])
      next[rowIdx][colIdx] = value
      return next
    })
  }

  const addRow = () => {
    if (dataRowCount >= MAX_ROWS) { toast.error(`Maximum ${MAX_ROWS} rows allowed.`); return }
    setRows((prev) => [...prev, makeEmptyRow(colCount)])
  }

  const removeRow = (idx: number) => {
    if (dataRowCount <= MIN_ROWS) return
    setRows((prev) => prev.filter((_, i) => i !== idx))
  }

  const removeLastRow = () => removeRow(dataRowCount - 1)

  // ── Validation & confirm ───────────────────────────────────────────
  const isHeaderValid = (h: string) => h.length > 0 && VARIABLE_REGEX.test(h)
  const hasHeaderErrors = headers.some((h) => !isHeaderValid(h))
  const hasDuplicates = new Set(headers).size !== headers.length

  const handleConfirm = useCallback(() => {
    const finalHeaders = headers.map(sanitizeVariableName)
    const invalidIdx = finalHeaders.findIndex((h) => !isHeaderValid(h))
    if (invalidIdx !== -1) {
      toast.error(`Column ${invalidIdx + 1} has an invalid or empty variable name.`)
      return
    }
    if (hasDuplicates) {
      toast.error('All column names must be unique.')
      return
    }
    const hasAtLeastOneCell = rows.some((row) => row.some((cell) => cell.trim() !== ''))
    if (!hasAtLeastOneCell) {
      toast.error('At least one data cell must be filled in.')
      return
    }
    const tableRows = rows.map((row) => {
      const record: Record<string, string> = {}
      finalHeaders.forEach((h, i) => {
        record[h] = row[i] ?? ''
      })
      return record
    })
    onConfirm({
      headers: finalHeaders,
      rows: tableRows,
      rowCount: tableRows.length,
      columnCount: finalHeaders.length,
    })
  }, [headers, rows, hasDuplicates, onConfirm])

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={addColumn}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Column
        </Button>
        <Button variant="outline" size="sm" onClick={addRow}>
          <Plus className="w-3.5 h-3.5 mr-1" /> Add Row
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={removeLastColumn}
          disabled={colCount <= MIN_COLS}
        >
          <Minus className="w-3.5 h-3.5 mr-1" /> Remove Column
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={removeLastRow}
          disabled={dataRowCount <= MIN_ROWS}
        >
          <Minus className="w-3.5 h-3.5 mr-1" /> Remove Row
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-zinc-200 overflow-auto max-h-[450px]">
        <table className="w-full text-sm border-collapse">
          {/* Header row */}
          <thead className="sticky top-0 z-10">
            <tr>
              {headers.map((h, colIdx) => (
                <th
                  key={colIdx}
                  className="bg-blue-50 border-b border-r border-zinc-200 p-0 relative min-w-[140px] group"
                  onMouseEnter={() => setHoveredCol(colIdx)}
                  onMouseLeave={() => setHoveredCol(null)}
                >
                  <div className="flex items-center">
                    <Input
                      value={h}
                      onChange={(e) => updateHeader(colIdx, e.target.value)}
                      onBlur={() => sanitizeHeader(colIdx)}
                      placeholder="variableName"
                      className={cn(
                        'rounded-none border-0 bg-transparent font-mono text-xs h-9 flex-1',
                        'focus-visible:ring-0 focus-visible:ring-offset-0',
                        !isHeaderValid(h) && 'text-red-700 placeholder:text-red-300',
                        hasDuplicates && headers.filter((x) => x === h).length > 1 && 'text-orange-600'
                      )}
                    />
                    {/* Col delete icon */}
                    {colCount > MIN_COLS && (
                      <button
                        onClick={(e) => { e.stopPropagation(); removeColumn(colIdx) }}
                        className={cn(
                          'p-1 mr-0.5 rounded text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-opacity',
                          hoveredCol === colIdx ? 'opacity-100' : 'opacity-0'
                        )}
                        aria-label={`Remove column ${h}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                  {!isHeaderValid(h) && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-400" />
                  )}
                </th>
              ))}
              {/* Extra th for the row-delete column */}
              <th className="bg-blue-50 border-b border-zinc-200 w-8" />
            </tr>
          </thead>

          {/* Data rows */}
          <tbody>
            {rows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="group hover:bg-zinc-50"
                onMouseEnter={() => setHoveredRow(rowIdx)}
                onMouseLeave={() => setHoveredRow(null)}
              >
                {row.map((cell, colIdx) => (
                  <td key={colIdx} className="border-b border-r border-zinc-100 p-0">
                    <Input
                      value={cell}
                      onChange={(e) => updateCell(rowIdx, colIdx, e.target.value)}
                      className="rounded-none border-0 bg-transparent text-xs h-8 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </td>
                ))}
                {/* Row delete icon */}
                <td className="border-b border-zinc-100 p-0 w-8">
                  {dataRowCount > MIN_ROWS && (
                    <button
                      onClick={() => removeRow(rowIdx)}
                      className={cn(
                        'p-1 rounded text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-opacity mx-auto flex',
                        hoveredRow === rowIdx ? 'opacity-100' : 'opacity-0'
                      )}
                      aria-label={`Remove row ${rowIdx + 1}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Status badge + confirm */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <Badge variant="secondary">{colCount} variables</Badge>
          <span>·</span>
          <Badge variant="secondary">{dataRowCount} documents will be generated</Badge>
        </div>
        <Button
          onClick={handleConfirm}
          disabled={hasHeaderErrors || hasDuplicates}
        >
          Confirm Data →
        </Button>
      </div>
    </div>
  )
}
