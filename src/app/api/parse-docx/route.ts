import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'
import { writeFile, unlink } from 'fs/promises'
import { tmpdir } from 'os'
import { join } from 'path'

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

    // Write to /tmp then pass as a file path — the most reliable approach on Vercel
    // because mammoth uses its own ZIP reader that needs fs access to its own resources.
    const arrayBuffer = await (file as File).arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    tmpPath = join(tmpdir(), `mergedocs-${Date.now()}-${Math.random().toString(36).slice(2)}.docx`)
    await writeFile(tmpPath, buffer)

    const result = await mammoth.convertToHtml({ path: tmpPath })

    return NextResponse.json({ html: result.value })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to parse document.'
    return NextResponse.json(
      { error: message, code: 'PARSE_ERROR' },
      { status: 400 }
    )
  } finally {
    // Always clean up the temp file
    if (tmpPath) {
      unlink(tmpPath).catch(() => {})
    }
  }
}
