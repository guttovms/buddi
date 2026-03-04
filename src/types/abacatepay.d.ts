declare module '@abacatepay/sdk' {
  interface Product {
    externalId: string
    name: string
    quantity: number
    price: number
  }

  interface BillingCreateParams {
    frequency: 'ONE_TIME' | 'MULTIPLE_PAYMENTS'
    methods: ('PIX')[]
    products: Product[]
    returnUrl: string
    completionUrl: string
    metadata?: Record<string, string>
  }

  interface BillingResponse {
    data: {
      id: string
      url: string
      [key: string]: unknown
    }
  }

  interface AbacatePayInstance {
    billing: {
      create(params: BillingCreateParams): Promise<BillingResponse>
      list(): Promise<{ data: unknown[] }>
    }
  }

  export function AbacatePay(config: { secret: string }): AbacatePayInstance
}
