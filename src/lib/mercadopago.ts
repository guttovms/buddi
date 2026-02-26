import { MercadoPagoConfig, PreApproval } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
})

export const preApproval = new PreApproval(client)

export const PRO_PLAN = {
  reason: 'OrçaRápido Pro — Orçamentos Ilimitados',
  auto_recurring: {
    frequency: 1,
    frequency_type: 'months' as const,
    transaction_amount: 19.9,
    currency_id: 'BRL',
  },
}
