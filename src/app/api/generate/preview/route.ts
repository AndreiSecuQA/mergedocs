import { NextRequest, NextResponse } from 'next/server'
import { replaceVariables, replaceVariablesForPreview } from '@/lib/merge/variableReplacer'
import { generateDocxBase64 } from '@/lib/generators/docxGenerator'
import { sanitizeVariableName } from '@/lib/parsers/csvParser'
import { checkRateLimit } from '@/lib/rateLimit'
import { MergePreviewRequest } from '@/types'

const MAX_BODY_BYTES = 5 * 1024 * 1024

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const { allowed } = checkRateLimit(`preview:${ip}`, 30, 60_000)
  if (!allowed) {
    return NextResponse.json({ error: 'Too many requests', code: 'RATE_LIMITED' }, { status: 429 })
  }

  const ct = req.headers.get('content-type') ?? ''
  if (!ct.includes('application/json')) {
    return NextResponse.json({ error: 'Content-Type must be application/json', code: 'INVALID_CONTENT_TYPE' }, { status: 415 })
  }

  const contentLength = Number(req.headers.get('content-length') ?? 0)
  if (contentLength > MAX_BODY_BYTES) {
    return NextResponse.json({ error: 'Request body too large', code: 'BODY_TOO_LARGE' }, { status: 413 })
  }

  try {
    const body: MergePreviewRequest = await req.json()
    const { templateHtml, firstRow } = body

    if (!templateHtml || !firstRow) {
      return NextResponse.json(
        { error: 'templateHtml and firstRow are required.', code: 'MISSING_PARAMS' },
        { status: 400 }
      )
    }

    // Re-sanitize all variable keys from the incoming request
    const sanitizedRow = Object.fromEntries(
      Object.entries(firstRow).map(([k, v]) => [sanitizeVariableName(k), v])
    )

    const previewHtml = replaceVariablesForPreview(templateHtml, sanitizedRow)
    const { output: mergedHtml } = replaceVariables(templateHtml, sanitizedRow)
    const docxBase64 = await generateDocxBase64(mergedHtml)

    return NextResponse.json({ previewHtml, docxBase64 })
  } catch (err) {
    console.error('[preview] error:', err)
    const message = err instanceof Error ? err.message : 'Preview generation failed.'
    return NextResponse.json({ error: message, code: 'PREVIEW_ERROR' }, { status: 500 })
  }
}

