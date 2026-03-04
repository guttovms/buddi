import { createClient } from '@/lib/supabase/server'
import { abacate, PRO_PLAN } from '@/lib/abacatepay'
import { NextResponse } from 'next/server'

export async function POST() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

  const billing = await abacate.billing.create({
    frequency: 'MULTIPLE_PAYMENTS',
    methods: ['PIX'],
    products: [PRO_PLAN],
    returnUrl: `${baseUrl}/configuracoes`,
    completionUrl: `${baseUrl}/configuracoes`,
    metadata: { userId: user.id },
  })

  // Save billing id on profile
  await supabase
    .from('profiles')
    .update({ abacatepay_billing_id: billing.data.id })
    .eq('id', user.id)

  return NextResponse.json({ url: billing.data.url })
}
