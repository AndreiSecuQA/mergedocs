import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { uploadToR2 } from '@/lib/storage/r2Client'
import { prisma } from '@/lib/db/prisma'
import { checkRateLimit } from '@/lib/rateLimit'

const MAX_BODY_BYTES = 5 * 1024 * 1024

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  return new Stripe(key, { apiVersion: '2026-02-25.clover' })
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const ip = req.headers.get('x-forwarded-for') ?? 'unknown'
  const { allowed } = checkRateLimit(`checkout:${ip}`, 10, 60_000)
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
    const stripe = getStripe()
    const body = await req.json() as { rowCount: number; sessionToken: string; templateHtml: string; dataTableJson: string }
    const { rowCount, sessionToken, templateHtml, dataTableJson } = body

    if (!rowCount || !sessionToken || !templateHtml || !dataTableJson) {
      return NextResponse.json(
        { error: 'rowCount, sessionToken, templateHtml, and dataTableJson are required.', code: 'MISSING_PARAMS' },
        { status: 400 }
      )
    }

    // Pricing tier validation
    if (rowCount > 500) {
      return NextResponse.json(
        { error: 'Exceeds maximum of 500 rows', code: 'ROW_LIMIT_EXCEEDED' },
        { status: 400 }
      )
    }

    const pricingTier = rowCount <= 50 ? 'batch_50' : 'batch_500'
    const unitAmount = rowCount <= 50 ? 499 : 999 // cents

    // Upload template + data to R2
    const inputJson = JSON.stringify({ templateHtml, dataTableJson })
    await uploadToR2(
      `sessions/${sessionToken}/input.json`,
      Buffer.from(inputJson, 'utf-8'),
      'application/json'
    )

    // Create MergeSession in DB
    await prisma.mergeSession.create({
      data: {
        token: sessionToken,
        rowCount: Number(rowCount),
        pricingTier,
      },
    })

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

    // Create Stripe Checkout session
    const stripeSession = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: unitAmount,
            product_data: {
              name: `MergeDocs — ${rowCount} document${rowCount !== 1 ? 's' : ''}`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: { sessionToken },
      success_url: `${baseUrl}/download?token=${sessionToken}&status=success`,
      cancel_url: `${baseUrl}/preview?cancelled=true`,
    })

    return NextResponse.json({ checkoutUrl: stripeSession.url })
  } catch (err) {
    console.error('[checkout] error:', err)
    const message = err instanceof Error ? err.message : 'Checkout failed.'
    return NextResponse.json({ error: message, code: 'CHECKOUT_ERROR' }, { status: 500 })
  }
}
