// TODO: Stripe webhook handler — verify signature and trigger document generation
import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ error: 'Not implemented', code: 'NOT_IMPLEMENTED' }, { status: 501 })
}
