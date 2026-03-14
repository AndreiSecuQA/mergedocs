import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { replaceVariables } from '@/lib/merge/variableReplacer'
import { generateDocx } from '@/lib/generators/docxGenerator'
import { buildZip } from '@/lib/generators/zipBuilder'
import { uploadToR2 } from '@/lib/storage/r2Client'
import { prisma } from '@/lib/db/prisma'
import { ParsedDataTable } from '@/types'

function createR2Client(): S3Client {
  return new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID ?? '',
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? '',
    },
  })
}

async function downloadFromR2(key: string): Promise<Buffer> {
  const client = createR2Client()
  const command = new GetObjectCommand({
    Bucket: process.env.R2_BUCKET_NAME ?? '',
    Key: key,
  })
  const response = await client.send(command)
  const chunks: Uint8Array[] = []
  const stream = response.Body as AsyncIterable<Uint8Array>
  for await (const chunk of stream) {
    chunks.push(chunk)
  }
  return Buffer.concat(chunks)
}

export async function POST(req: NextRequest) {
  try {
    const { sessionToken } = await req.json()

    if (!sessionToken) {
      return NextResponse.json(
        { error: 'sessionToken is required', code: 'MISSING_PARAMS' },
        { status: 400 }
      )
    }

    // 1. Load and verify session from DB
    const mergeSession = await prisma.mergeSession.findUnique({
      where: { token: sessionToken },
    })

    if (!mergeSession) {
      return NextResponse.json({ error: 'Session not found', code: 'SESSION_NOT_FOUND' }, { status: 404 })
    }

    if (!mergeSession.paidAt) {
      return NextResponse.json({ error: 'Session not paid', code: 'NOT_PAID' }, { status: 402 })
    }

    // 2. Download input.json from R2
    const inputBuffer = await downloadFromR2(`sessions/${sessionToken}/input.json`)
    const { templateHtml, dataTableJson } = JSON.parse(inputBuffer.toString('utf-8')) as {
      templateHtml: string
      dataTableJson: string
    }

    // 3. Parse data table
    const dataTable = JSON.parse(dataTableJson) as ParsedDataTable
    const { headers, rows } = dataTable

    // 4. Generate a .docx for each row
    const documents: { filename: string; buffer: Buffer }[] = []
    for (let i = 0; i < rows.length; i++) {
      const rowData = headers.reduce<Record<string, string>>((acc, header, colIdx) => {
        acc[header] = rows[i][colIdx] ?? ''
        return acc
      }, {})
      const { output: mergedHtml } = replaceVariables(templateHtml, rowData)
      const buffer = await generateDocx(mergedHtml)
      documents.push({ filename: `document-${i + 1}.docx`, buffer })
    }

    // 5. Build zip archive
    const zipBuffer = await buildZip(documents)

    // 6. Upload zip to R2
    const zipKey = `sessions/${sessionToken}/output.zip`
    await uploadToR2(zipKey, zipBuffer, 'application/zip')

    // 7. Generate pre-signed download URL (1 hour)
    const client = createR2Client()
    const downloadUrl = await getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME ?? '',
        Key: zipKey,
      }),
      { expiresIn: 3600 }
    )

    // 8. Update MergeSession in DB
    const expiresAt = new Date(Date.now() + 3600 * 1000)
    await prisma.mergeSession.update({
      where: { token: sessionToken },
      data: { zipKey, downloadUrl, expiresAt },
    })

    return NextResponse.json({ zipKey, downloadUrl })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Bulk generation failed.'
    return NextResponse.json({ error: message, code: 'BULK_ERROR' }, { status: 500 })
  }
}
