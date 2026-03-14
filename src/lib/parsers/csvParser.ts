import Papa from 'papaparse'
import { ParsedDataTable } from '@/types'

const MAX_ROWS = 500
const MAX_COLUMNS = 50
const VARIABLE_NAME_REGEX = /^[a-zA-Z_][a-zA-Z0-9_]*$/

/**
 * Sanitize a raw header string into a valid $variableName.
 * - Trims whitespace
 * - Replaces spaces with underscores
 * - Strips chars not matching [a-zA-Z0-9_]
 * - Prefixes with _ if result starts with a digit
 */
export function sanitizeVariableName(raw: string): string {
  let name = raw
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
  if (name && /^[0-9]/.test(name)) {
    name = '_' + name
  }
  return name
}

/**
 * Parse a CSV File object into a ParsedDataTable.
 * Runs entirely client-side.
 */
export function parseCSV(file: File): Promise<ParsedDataTable> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      skipEmptyLines: true,
      complete(results) {
        try {
          const data = results.data

          if (!data || data.length < 2) {
            reject(new Error('CSV must have at least one header row and one data row.'))
            return
          }

          const rawHeaders = data[0]
          if (rawHeaders.length === 0) {
            reject(new Error('Header row must not be empty.'))
            return
          }

          if (rawHeaders.length > MAX_COLUMNS) {
            reject(new Error(`Maximum ${MAX_COLUMNS} columns allowed.`))
            return
          }

          const headers = rawHeaders.map((h, i) => {
            const sanitized = sanitizeVariableName(h)
            if (!sanitized) {
              throw new Error(`Column ${i + 1} has an invalid or empty header name.`)
            }
            if (!VARIABLE_NAME_REGEX.test(sanitized)) {
              throw new Error(`Header "${h}" produces an invalid variable name.`)
            }
            return sanitized
          })

          const dataRows = data.slice(1)

          if (dataRows.length === 0) {
            reject(new Error('At least one data row is required.'))
            return
          }

          if (dataRows.length > MAX_ROWS) {
            reject(new Error(`Maximum ${MAX_ROWS} data rows allowed on the free tier.`))
            return
          }

          const rows: Record<string, string>[] = dataRows.map((row) => {
            const record: Record<string, string> = {}
            headers.forEach((header, i) => {
              record[header] = row[i] ?? ''
            })
            return record
          })

          resolve({
            headers,
            rows,
            rowCount: rows.length,
            columnCount: headers.length,
          })
        } catch (err) {
          reject(err)
        }
      },
      error(err) {
        reject(new Error(`CSV parse error: ${err.message}`))
      },
    })
  })
}
