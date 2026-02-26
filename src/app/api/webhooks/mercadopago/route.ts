import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    if (type === 'subscription_preapproval') {
      const supabase = await createClient()

      // Fetch subscription details from Mercado Pago
      const response = await fetch(
        `https://api.mercadopago.com/preapproval/${data.id}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
          },
        }
      )

      if (!response.ok) {
        return NextResponse.json({ error: 'Failed to fetch subscription' }, { status: 500 })
      }

      const subscription = await response.json()
      const userId = subscription.external_reference

      if (!userId) {
        return NextResponse.json({ error: 'No user reference' }, { status: 400 })
      }

      const plan = subscription.status === 'authorized' ? 'pro' : 'free'

      await supabase
        .from('profiles')
        .update({
          plan,
          mp_subscription_id: data.id,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
    }

    return NextResponse.json({ received: true })
  } catch {
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 })
  }
}
