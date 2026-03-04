import { AbacatePay } from '@abacatepay/sdk'

export const abacate = AbacatePay({ secret: process.env.ABACATEPAY_API_KEY! })

export const PRO_PLAN = {
  externalId: 'buddi-pro',
  name: 'Buddi Pro — Orçamentos Ilimitados',
  quantity: 1,
  price: 1990, // centavos (R$19,90)
}
