import * as XLSX from 'xlsx'
import { ParsedDataTable } from '@/types'
import { sanitizeVariableName } from './csvParser'

const MAX_ROWS = 500
const MAX_COLUMNS = 50
const VARIABLE_NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024 // 10MB

/**
 * Parse an XLS or XLSX File object into a ParsedDataTable.
 * Runs entirely client-side using SheetJS.
 */
export async function parseXLSX(file: File): Promise<ParsedDataTable> {
  if (file.size > MAX_FILE_SIZE_BYTES) {
    throw new Error('File size exceeds the 10MB limit.')
  }

  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })

  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    throw new Error('No sheets found in the workbook.')
  }

  const sheet = workbook.Sheets[sheetName]
  // Convert to array of arrays (raw values as strings)
  const rawData: string[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: '',
    raw: false,
  })

  if (!rawData || rawData.length < 2) {
    throw new Error('Spreadsheet must have at least one header row and one data row.')
  }

  const rawHeaders = rawData[0]

  if (rawHeaders.length === 0) {
    throw new Error('Header row must not be empty.')
  }

  if (rawHeaders.length > MAX_COLUMNS) {
    throw new Error(`Maximum ${MAX_COLUMNS} columns allowed.`)
  }

  const headers = rawHeaders.map((h, i) => {
    const sanitized = sanitizeVariableName(String(h))
    if (!sanitized) {
      throw new Error(`Column ${i + 1} has an invalid or empty header name.`)
    }
    if (!VARIABLE_NAME_REGEX.test(sanitized)) {
      throw new Error(`Header "${h}" produces an invalid variable name.`)
    }
    return sanitized
  })

  const dataRows = rawData.slice(1).filter((row) =>
    row.some((cell) => cell !== undefined && cell !== null && String(cell).trim() !== '')
  )

  if (dataRows.length === 0) {
    throw new Error('At least one data row is required.')
  }

  if (dataRows.length > MAX_ROWS) {
    throw new Error(`Maximum ${MAX_ROWS} data rows allowed on the free tier.`)
  }

  const rows: Record<string, string>[] = dataRows.map((row) => {
    const record: Record<string, string> = {}
    headers.forEach((header, i) => {
      record[header] = row[i] !== undefined ? String(row[i]) : ''
    })
    return record
  })

  return {
    headers,
    rows,
    rowCount: rows.length,
    columnCount: headers.length,
  }
}
