'use client'

import { useCallback, useRef, useState } from 'react'
import { UploadCloud, Loader2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ParsedDataTable } from '@/types'
import { parseCSV } from '@/lib/parsers/csvParser'
import { parseXLSX } from '@/lib/parsers/xlsxParser'

const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ACCEPTED_EXTENSIONS = ['.csv', '.xls', '.xlsx']
const ACCEPTED_MIME = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]

type DropzoneState = 'idle' | 'dragover' | 'parsing' | 'error'

interface FileUploaderProps {
  onParsed: (table: ParsedDataTable) => void
  isLoading?: boolean
}

export function FileUploader({ onParsed, isLoading = false }: FileUploaderProps) {
  const [state, setState] = useState<DropzoneState>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const getExtension = (filename: string) =>
    '.' + filename.toLowerCase().split('.').pop()

  const processFile = useCallback(
    async (file: File) => {
      const ext = getExtension(file.name)

      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        const msg = `Unsupported file type "${ext}". Please upload a .csv, .xls, or .xlsx file.`
        setErrorMsg(msg)
        setState('error')
        toast.error(msg)
        return
      }

      if (file.size > MAX_FILE_SIZE) {
        const msg = 'File is too large. Maximum size is 10MB.'
        setErrorMsg(msg)
        setState('error')
        toast.error(msg)
        return
      }

      setState('parsing')
      setErrorMsg(null)

      try {
        let table: ParsedDataTable
        if (ext === '.csv') {
          table = await parseCSV(file)
        } else {
          table = await parseXLSX(file)
        }
        setState('idle')
        const invalidCount = table.headers.filter((h) => /^_col\d+$/.test(h)).length
        toast.success(
          `Data loaded — ${table.rows.length} row${table.rows.length !== 1 ? 's' : ''}, ${table.headers.length} variable${table.headers.length !== 1 ? 's' : ''}`
        )
        if (invalidCount > 0) {
          toast.warning(
            `${invalidCount} column${invalidCount > 1 ? 's have' : ' has'} an empty or invalid name — please rename ${invalidCount > 1 ? 'them' : 'it'} before continuing.`
          )
        }
        onParsed(table)
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Failed to parse file.'
        setErrorMsg(msg)
        setState('error')
        toast.error(msg)
      }
    },
    [onParsed]
  )

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setState('dragover')
  }, [])

  const onDragLeave = useCallback(() => {
    setState((s) => (s === 'dragover' ? 'idle' : s))
  }, [])

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      const file = e.dataTransfer.files[0]
      if (file) processFile(file)
    },
    [processFile]
  )

  const onInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (file) processFile(file)
      e.target.value = ''
    },
    [processFile]
  )

  const handleClick = () => {
    if (state === 'parsing' || isLoading) return
    inputRef.current?.click()
  }

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="File upload dropzone"
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={cn(
        'relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed',
        'min-h-[220px] cursor-pointer select-none transition-colors duration-150',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        state === 'idle' && 'border-zinc-300 bg-white hover:border-blue-400 hover:bg-blue-50/30',
        state === 'dragover' && 'border-blue-500 bg-blue-50 shadow-inner',
        state === 'parsing' && 'border-zinc-300 bg-zinc-50 cursor-not-allowed',
        state === 'error' && 'border-red-300 bg-red-50 cursor-pointer'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv,.xls,.xlsx"
        className="sr-only"
        onChange={onInputChange}
        tabIndex={-1}
      />

      {state === 'parsing' || isLoading ? (
        <>
          <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
          <p className="text-sm font-medium text-zinc-600">Parsing file…</p>
        </>
      ) : state === 'error' ? (
        <>
          <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
          <p className="text-sm font-medium text-red-600 text-center max-w-xs px-4">
            {errorMsg}
          </p>
          <p className="text-xs text-red-400 mt-2">Click to try again</p>
        </>
      ) : (
        <>
          <UploadCloud
            className={cn(
              'w-10 h-10 mb-3 transition-colors',
              state === 'dragover' ? 'text-blue-500' : 'text-zinc-400'
            )}
          />
          <p className="text-sm font-medium text-zinc-700">
            {state === 'dragover'
              ? 'Release to upload'
              : 'Drop your CSV or Excel file here'}
          </p>
          <p className="text-xs text-zinc-400 mt-1">or click to browse</p>
          <p className="text-xs text-zinc-300 mt-3">.csv · .xls · .xlsx · max 10MB</p>
        </>
      )}
    </div>
  )
}
