import { NextRequest, NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'
import { randomUUID } from 'crypto'

// Force Node.js runtime and disable caching
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SUPPORTED_EXTENSIONS = ['.docx']

export async function POST(req: NextRequest) {
  let tmpPath: string | null = null
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return NextResponse.json(
        { error: 'No file provided.', code: 'MISSING_FILE' },
        { status: 400 }
      )
    }

    const filename = (file as File).name.toLowerCase()
    const hasSupported = SUPPORTED_EXTENSIONS.some((ext) => filename.endsWith(ext))
    if (!hasSupported) {
      return NextResponse.json(
        { error: `Unsupported file type. Please upload a .docx file.`, code: 'INVALID_FILE_TYPE' },
        { status: 400 }
      )
    }

    // Write to /tmp — most reliable on Vercel serverless for binary file parsing.
    // mammoth's path option reads via Node fs.readFile which bypasses any bundling issues.
    const arrayBuffer = await (file as File).arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    tmpPath = join(tmpdir(), `mergedocs-${randomUUID()}.docx`)
    await writeFile(tmpPath, buffer)

    // Dynamic import ensures mammoth is never tree-shaken or bundled by webpack
    const mammoth = (await import('mammoth')).default
    const result = await mammoth.convertToHtml({ path: tmpPath })

    return NextResponse.json({ html: result.value })
  } catch (err) {
    // Log to Vercel function logs so we can debug server-side
    console.error('[parse-docx] error:', err)
    const message = err instanceof Error ? err.message : 'Failed to parse document.'
    return NextResponse.json(
      { error: message, code: 'PARSE_ERROR' },
      { status: 400 }
    )
  } finally {
    // Always clean up the temp file
    if (tmpPath) unlink(tmpPath).catch(() => {})
  }
}
