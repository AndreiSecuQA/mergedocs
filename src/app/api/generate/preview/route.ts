import { NextRequest, NextResponse } from 'next/server'
import { replaceVariables, replaceVariablesForPreview } from '@/lib/merge/variableReplacer'
import { MergePreviewRequest } from '@/types'

export async function POST(req: NextRequest) {
  try {
    const body: MergePreviewRequest = await req.json()
    const { templateHtml, firstRow } = body

    if (!templateHtml || !firstRow) {
      return NextResponse.json(
        { error: 'templateHtml and firstRow are required.', code: 'MISSING_PARAMS' },
        { status: 400 }
      )
    }

    // Generate preview HTML with highlighted matches/mismatches
    const previewHtml = replaceVariablesForPreview(templateHtml, firstRow)

    // Generate plain replaced content (for .docx — placeholder for now)
    const { output } = replaceVariables(templateHtml, firstRow)

    // Return preview HTML and a placeholder docxBase64 (real generation in Session 4)
    return NextResponse.json({
      previewHtml,
      docxBase64: Buffer.from(output).toString('base64'),
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Preview generation failed.'
    return NextResponse.json(
      { error: message, code: 'PREVIEW_ERROR' },
      { status: 500 }
    )
  }
}
