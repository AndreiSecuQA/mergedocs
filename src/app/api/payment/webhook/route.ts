import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { prisma } from '@/lib/db/prisma'

function getStripe() {
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) throw new Error('STRIPE_SECRET_KEY is not set')
  return new Stripe(key, { apiVersion: '2026-02-25.clover' })
}

// Next.js App Router reads the raw request body via request.text()
export async function POST(request: NextRequest) {
  const stripe = getStripe()
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET ?? ''
    )
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook signature verification failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const sessionToken = session.metadata?.sessionToken

    if (sessionToken) {
      try {
        // Mark session as paid
        await prisma.mergeSession.update({
          where: { token: sessionToken },
          data: {
            paidAt: new Date(),
            stripeSessionId: session.id,
          },
        })

        // Trigger bulk generation — fire-and-forget (do NOT await)
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'
        fetch(`${baseUrl}/api/generate/bulk`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionToken }),
        }).catch((err) => console.error('[webhook] bulk generation error:', err))
      } catch (err) {
        console.error('[webhook] DB update failed:', err)
        // Still return 200 to avoid Stripe retrying endlessly
      }
    }
  }

  return NextResponse.json({ received: true })
}
