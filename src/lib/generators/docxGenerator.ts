import HTMLtoDOCX from 'html-to-docx'

/**
 * Convert merged HTML into a .docx Buffer.
 * html-to-docx expects a full HTML document string.
 */
export async function generateDocx(mergedHtml: string): Promise<Buffer> {
  const fullHtml = `<!DOCTYPE html><html><body>${mergedHtml}</body></html>`
  const result = await HTMLtoDOCX(fullHtml, null, {
    table: { row: { cantSplit: true } },
    footer: false,
    pageNumber: false,
  })
  return Buffer.from(result)
}

/**
 * Convert merged HTML into a base64-encoded .docx string.
 */
export async function generateDocxBase64(mergedHtml: string): Promise<string> {
  const buffer = await generateDocx(mergedHtml)
  return buffer.toString('base64')
}
