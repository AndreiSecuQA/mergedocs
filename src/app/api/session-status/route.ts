import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token')

  if (!token) {
    return NextResponse.json(
      { error: 'token query parameter is required', code: 'MISSING_PARAMS' },
      { status: 400 }
    )
  }

  try {
    const session = await prisma.mergeSession.findUnique({
      where: { token },
      select: { downloadUrl: true, expiresAt: true },
    })

    if (!session) {
      return NextResponse.json({ error: 'Session not found', code: 'SESSION_NOT_FOUND' }, { status: 404 })
    }

    if (session.downloadUrl) {
      return NextResponse.json({ status: 'ready', downloadUrl: session.downloadUrl })
    }

    return NextResponse.json({ status: 'pending' })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Status check failed.'
    return NextResponse.json({ error: message, code: 'STATUS_ERROR' }, { status: 500 })
  }
}
