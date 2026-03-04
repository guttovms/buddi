export type Profile = {
  id: string
  business_name: string | null
  owner_name: string | null
  phone: string | null
  email: string | null
  document: string | null
  address: string | null
  city: string | null
  state: string | null
  logo_url: string | null
  brand_color: string | null
  plan: 'free' | 'pro'
  pro_until: string | null
  abacatepay_billing_id: string | null
  budgets_this_month: number
  created_at: string
  updated_at: string
}

export type Service = {
  id: string
  user_id: string
  name: string
  description: string | null
  unit: string
  price: number
  created_at: string
}

export type Client = {
  id: string
  user_id: string
  name: string
  phone: string | null
  email: string | null
  document: string | null
  address: string | null
  city: string | null
  state: string | null
  created_at: string
}

export type Budget = {
  id: string
  user_id: string
  client_id: string | null
  number: number
  status: 'rascunho' | 'enviado' | 'aprovado' | 'recusado'
  payment_conditions: string | null
  validity_days: number
  notes: string | null
  total: number
  client_viewed_at: string | null
  client_approved_at: string | null
  created_at: string
  updated_at: string
}

export type BudgetItem = {
  id: string
  budget_id: string
  service_name: string
  description: string | null
  unit: string
  quantity: number
  unit_price: number
  total: number
  sort_order: number
}

export type BudgetWithItems = Budget & {
  items: BudgetItem[]
  client: Client | null
  profile?: Profile
}
