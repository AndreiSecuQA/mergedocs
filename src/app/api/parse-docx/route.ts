import { NextRequest, NextResponse } from 'next/server'
import mammoth from 'mammoth'

export async function POST(req: NextRequest) {
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
    if (!filename.endsWith('.docx')) {
      return NextResponse.json(
        { error: 'Only .docx files are supported. Please save your document as .docx first.', code: 'INVALID_FILE_TYPE' },
        { status: 400 }
      )
    }

    const arrayBuffer = await (file as File).arrayBuffer()
    const result = await mammoth.convertToHtml({ arrayBuffer })

    return NextResponse.json({ html: result.value })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to parse document.'
    return NextResponse.json(
      { error: message, code: 'PARSE_ERROR' },
      { status: 400 }
    )
  }
}
