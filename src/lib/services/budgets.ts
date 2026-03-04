import { Budget, BudgetItem, BudgetWithItems } from '@/types/database'
import { SupabaseClient } from '@supabase/supabase-js'

export async function getBudgets(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('budgets')
    .select('*, client:clients(*)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  return { data: (data as (Budget & { client: { name: string } | null })[]) || [], error }
}

export async function getBudget(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('budgets')
    .select('*, client:clients(*), items:budget_items(*)')
    .eq('id', id)
    .single()

  return { data: data as BudgetWithItems | null, error }
}

export async function getPublicBudget(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('budgets')
    .select('*, client:clients(*), items:budget_items(*), profile:profiles(*)')
    .eq('id', id)
    .single()

  return { data: data as BudgetWithItems | null, error }
}

export async function createBudget(
  supabase: SupabaseClient,
  budget: {
    user_id: string
    client_id: string
    payment_conditions?: string
    validity_days?: number
    notes?: string
    total: number
  },
  items: Omit<BudgetItem, 'id' | 'budget_id'>[]
) {
  const { data: budgetData, error: budgetError } = await supabase
    .from('budgets')
    .insert(budget)
    .select()
    .single()

  if (budgetError || !budgetData) return { data: null, error: budgetError }

  const budgetItems = items.map((item) => ({
    ...item,
    budget_id: budgetData.id,
  }))

  const { error: itemsError } = await supabase
    .from('budget_items')
    .insert(budgetItems)

  if (itemsError) return { data: null, error: itemsError }

  return { data: budgetData as Budget, error: null }
}

export async function updateBudget(
  supabase: SupabaseClient,
  id: string,
  budget: {
    client_id: string
    payment_conditions?: string
    validity_days?: number
    notes?: string
    total: number
  },
  items: Omit<BudgetItem, 'id' | 'budget_id'>[]
) {
  const { data: budgetData, error: budgetError } = await supabase
    .from('budgets')
    .update({
      ...budget,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (budgetError || !budgetData) return { data: null, error: budgetError }

  const { error: deleteError } = await supabase
    .from('budget_items')
    .delete()
    .eq('budget_id', id)

  if (deleteError) return { data: null, error: deleteError }

  const budgetItems = items.map((item) => ({
    ...item,
    budget_id: id,
  }))

  const { error: itemsError } = await supabase
    .from('budget_items')
    .insert(budgetItems)

  if (itemsError) return { data: null, error: itemsError }

  return { data: budgetData as Budget, error: null }
}

export async function updateBudgetStatus(
  supabase: SupabaseClient,
  id: string,
  status: string
) {
  const updates: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  }

  if (status === 'aprovado') {
    updates.client_approved_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('budgets')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return { data: data as Budget | null, error }
}

export async function deleteBudget(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from('budgets').delete().eq('id', id)
  return { error }
}

export async function countBudgetsThisMonth(supabase: SupabaseClient, userId: string) {
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString()

  const { count, error } = await supabase
    .from('budgets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('created_at', firstDay)
    .lte('created_at', lastDay)

  return { count: count || 0, error }
}
