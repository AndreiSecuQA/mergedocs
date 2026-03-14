import { NextRequest, NextResponse } from 'next/server'
import { replaceVariables, replaceVariablesForPreview } from '@/lib/merge/variableReplacer'
import { generateDocxBase64 } from '@/lib/generators/docxGenerator'
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

    // Generate preview HTML with highlighted matched/unmatched variables
    const previewHtml = replaceVariablesForPreview(templateHtml, firstRow)

    // Generate real merged content and convert to .docx
    const { output: mergedHtml } = replaceVariables(templateHtml, firstRow)
    const docxBase64 = await generateDocxBase64(mergedHtml)

    return NextResponse.json({ previewHtml, docxBase64 })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Preview generation failed.'
    return NextResponse.json({ error: message, code: 'PREVIEW_ERROR' }, { status: 500 })
  }
}

