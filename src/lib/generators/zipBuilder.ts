import JSZip from 'jszip'

/**
 * Package multiple document Buffers into a single .zip Buffer.
 */
export async function buildZip(
  documents: { filename: string; buffer: Buffer }[]
): Promise<Buffer> {
  const zip = new JSZip()

  for (const doc of documents) {
    zip.file(doc.filename, doc.buffer)
  }

  const result = await zip.generateAsync({ type: 'nodebuffer' })
  return Buffer.from(result)
}
