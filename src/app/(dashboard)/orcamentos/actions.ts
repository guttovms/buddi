'use server'

import { createClient } from '@/lib/supabase/server'
import { createBudget, deleteBudget, getBudget, updateBudget, updateBudgetStatus, countBudgetsThisMonth } from '@/lib/services/budgets'
import { getProfile } from '@/lib/services/profiles'
import { FREE_BUDGET_LIMIT, isPro } from '@/lib/utils'
import { BudgetItem } from '@/types/database'
import { revalidatePath } from 'next/cache'

export async function createBudgetAction(data: {
  client_id: string
  payment_conditions: string
  validity_days: number
  notes: string
  items: Omit<BudgetItem, 'id' | 'budget_id'>[]
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  // Check plan limits
  const { data: profile } = await getProfile(supabase, user.id)
  if (!isPro(profile)) {
    const { count } = await countBudgetsThisMonth(supabase, user.id)
    if (count >= FREE_BUDGET_LIMIT) {
      throw new Error(`Limite de ${FREE_BUDGET_LIMIT} orçamentos/mês atingido. Faça upgrade para o plano Pro.`)
    }
  }

  const total = data.items.reduce((sum, item) => sum + item.total, 0)

  const { data: budget, error } = await createBudget(
    supabase,
    {
      user_id: user.id,
      client_id: data.client_id,
      payment_conditions: data.payment_conditions || undefined,
      validity_days: data.validity_days,
      notes: data.notes || undefined,
      total,
    },
    data.items
  )

  if (error) throw new Error(error.message)
  revalidatePath('/orcamentos')
  return budget
}

export async function updateBudgetAction(
  id: string,
  data: {
    client_id: string
    payment_conditions: string
    validity_days: number
    notes: string
    items: Omit<BudgetItem, 'id' | 'budget_id'>[]
  }
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const total = data.items.reduce((sum, item) => sum + item.total, 0)

  const { error } = await updateBudget(
    supabase,
    id,
    {
      client_id: data.client_id,
      payment_conditions: data.payment_conditions || undefined,
      validity_days: data.validity_days,
      notes: data.notes || undefined,
      total,
    },
    data.items
  )

  if (error) throw new Error(error.message)
  revalidatePath('/orcamentos')
}

export async function duplicateBudgetAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { data: profile } = await getProfile(supabase, user.id)
  if (!isPro(profile)) {
    const { count } = await countBudgetsThisMonth(supabase, user.id)
    if (count >= FREE_BUDGET_LIMIT) {
      throw new Error(`Limite de ${FREE_BUDGET_LIMIT} orçamentos/mês atingido. Faça upgrade para o plano Pro.`)
    }
  }

  const { data: original } = await getBudget(supabase, id)
  if (!original) throw new Error('Orçamento não encontrado')

  const items = original.items.map((item) => ({
    service_name: item.service_name,
    description: item.description,
    unit: item.unit,
    quantity: item.quantity,
    unit_price: item.unit_price,
    total: item.total,
    sort_order: item.sort_order,
  }))

  const { error } = await createBudget(
    supabase,
    {
      user_id: user.id,
      client_id: original.client_id!,
      payment_conditions: original.payment_conditions || undefined,
      validity_days: original.validity_days,
      notes: original.notes || undefined,
      total: original.total,
    },
    items
  )

  if (error) throw new Error(error.message)
  revalidatePath('/orcamentos')
}

export async function updateBudgetStatusAction(id: string, status: string) {
  const supabase = await createClient()
  const { error } = await updateBudgetStatus(supabase, id, status)
  if (error) throw new Error(error.message)
  revalidatePath('/orcamentos')
}

export async function deleteBudgetAction(id: string) {
  const supabase = await createClient()
  const { error } = await deleteBudget(supabase, id)
  if (error) throw new Error(error.message)
  revalidatePath('/orcamentos')
}
