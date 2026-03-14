export interface ParsedDataTable {
  headers: string[]
  rows: Record<string, string>[]
  rowCount: number
  columnCount: number
}

export interface MergePreviewRequest {
  templateHtml: string
  firstRow: Record<string, string>
}

export interface MergePreviewResponse {
  previewHtml: string
  docxBase64: string
}

export interface CheckoutRequest {
  rowCount: number
  sessionToken: string
}

export interface CheckoutResponse {
  checkoutUrl: string
}

export interface ApiError {
  error: string
  code: string
}

export type PricingTier = 'free' | 'batch_50' | 'batch_500'

export interface PricingConfig {
  tier: PricingTier
  maxRows: number
  priceUsd: number
  stripePriceId: string
}
