import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

export async function POST(request: NextRequest) {
  // Validate webhook secret
  const secret = request.nextUrl.searchParams.get('secret')
  if (secret !== process.env.ABACATEPAY_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Invalid secret' }, { status: 401 })
  }

  const body = await request.json()

  // Only handle billing.paid events
  if (body.event !== 'billing.paid') {
    return NextResponse.json({ ok: true })
  }

  const userId = body.data?.metadata?.userId
  if (!userId) {
    return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
  }

  // Use service role to update profile (no user session in webhooks)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  )

  const proUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('profiles')
    .update({ plan: 'pro', pro_until: proUntil })
    .eq('id', userId)

  if (error) {
    console.error('Webhook: failed to update profile', error)
    return NextResponse.json({ error: 'Update failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
