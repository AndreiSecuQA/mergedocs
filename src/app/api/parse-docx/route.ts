import { NextRequest, NextResponse } from 'next/server'

// Must be nodejs runtime — Edge runtime does not have Buffer or fs
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SUPPORTED_EXTENSIONS = ['.docx']

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file')

    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No file provided.', code: 'MISSING_FILE' }, { status: 400 })
    }

    const filename = (file as File).name.toLowerCase()
    if (!SUPPORTED_EXTENSIONS.some((ext) => filename.endsWith(ext))) {
      return NextResponse.json(
        { error: 'Unsupported file type. Please upload a .docx file.', code: 'INVALID_FILE_TYPE' },
        { status: 400 }
      )
    }

    // Convert to Node.js Buffer and pass directly to mammoth.
    // mammoth checks `if (options.buffer)` and passes it to JSZip.loadAsync() which accepts Buffers.
    // serverExternalPackages in next.config.ts ensures mammoth is NOT bundled by webpack.
    const arrayBuffer = await (file as File).arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // require() instead of import() — avoids dynamic import resolution issues on Vercel
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mammoth = require('mammoth')
    const result = await mammoth.convertToHtml({ buffer })

    return NextResponse.json({ html: result.value })
  } catch (err) {
    console.error('[parse-docx]', err)
    const message = err instanceof Error ? err.message : 'Failed to parse document.'
    return NextResponse.json({ error: message, code: 'PARSE_ERROR' }, { status: 400 })
  }
}
