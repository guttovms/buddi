import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock modules before imports
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/services/budgets', () => ({
  createBudget: vi.fn(),
  getBudget: vi.fn(),
  updateBudget: vi.fn(),
  updateBudgetStatus: vi.fn(),
  deleteBudget: vi.fn(),
  countBudgetsThisMonth: vi.fn(),
}))

vi.mock('@/lib/services/profiles', () => ({
  getProfile: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createBudget, getBudget, updateBudget, updateBudgetStatus, deleteBudget, countBudgetsThisMonth } from '@/lib/services/budgets'
import { getProfile } from '@/lib/services/profiles'
import {
  createBudgetAction,
  updateBudgetAction,
  duplicateBudgetAction,
  updateBudgetStatusAction,
  deleteBudgetAction,
} from './actions'

const mockUser = { id: 'test-user-id' }
const mockSupabase = {
  auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) },
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
})

// ─── createBudgetAction ───────────────────────────────

describe('createBudgetAction', () => {
  const baseData = {
    client_id: 'client-1',
    payment_conditions: '',
    validity_days: 30,
    notes: '',
    items: [
      { service_name: 'Paint', description: '', unit: 'm²', quantity: 10, unit_price: 30, total: 300, sort_order: 0 },
    ],
  }

  it('throws when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })

    await expect(createBudgetAction(baseData)).rejects.toThrow('Não autenticado')
  })

  it('throws when free plan limit reached', async () => {
    vi.mocked(getProfile).mockResolvedValue({ data: { plan: 'free' } as any, error: null })
    vi.mocked(countBudgetsThisMonth).mockResolvedValue({ count: 3, error: null })

    await expect(createBudgetAction(baseData)).rejects.toThrow('Limite de 3')
  })

  it('allows free plan under limit', async () => {
    vi.mocked(getProfile).mockResolvedValue({ data: { plan: 'free' } as any, error: null })
    vi.mocked(countBudgetsThisMonth).mockResolvedValue({ count: 2, error: null })
    vi.mocked(createBudget).mockResolvedValue({ data: { id: 'new-budget' } as any, error: null })

    await createBudgetAction(baseData)

    expect(createBudget).toHaveBeenCalled()
    expect(revalidatePath).toHaveBeenCalledWith('/orcamentos')
  })

  it('skips limit check for pro plan', async () => {
    vi.mocked(getProfile).mockResolvedValue({ data: { plan: 'pro', pro_until: new Date(Date.now() + 86400000).toISOString() } as any, error: null })
    vi.mocked(createBudget).mockResolvedValue({ data: { id: 'new-budget' } as any, error: null })

    await createBudgetAction(baseData)

    expect(countBudgetsThisMonth).not.toHaveBeenCalled()
    expect(createBudget).toHaveBeenCalled()
  })

  it('calculates total from items', async () => {
    vi.mocked(getProfile).mockResolvedValue({ data: { plan: 'pro', pro_until: new Date(Date.now() + 86400000).toISOString() } as any, error: null })
    vi.mocked(createBudget).mockResolvedValue({ data: { id: 'new-budget' } as any, error: null })

    await createBudgetAction(baseData)

    expect(createBudget).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ total: 300 }),
      expect.anything()
    )
  })

  it('throws when service returns error', async () => {
    vi.mocked(getProfile).mockResolvedValue({ data: { plan: 'pro', pro_until: new Date(Date.now() + 86400000).toISOString() } as any, error: null })
    vi.mocked(createBudget).mockResolvedValue({ data: null, error: { message: 'DB error' } as any })

    await expect(createBudgetAction(baseData)).rejects.toThrow('DB error')
  })
})

// ─── updateBudgetAction ───────────────────────────────

describe('updateBudgetAction', () => {
  const data = {
    client_id: 'client-1',
    payment_conditions: 'À vista',
    validity_days: 15,
    notes: '',
    items: [
      { service_name: 'Fix', description: '', unit: 'un', quantity: 1, unit_price: 200, total: 200, sort_order: 0 },
    ],
  }

  it('throws when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })

    await expect(updateBudgetAction('budget-1', data)).rejects.toThrow('Não autenticado')
  })

  it('updates budget with calculated total', async () => {
    vi.mocked(updateBudget).mockResolvedValue({ data: {} as any, error: null })

    await updateBudgetAction('budget-1', data)

    expect(updateBudget).toHaveBeenCalledWith(
      expect.anything(),
      'budget-1',
      expect.objectContaining({ total: 200, payment_conditions: 'À vista' }),
      data.items
    )
    expect(revalidatePath).toHaveBeenCalledWith('/orcamentos')
  })
})

// ─── duplicateBudgetAction ────────────────────────────

describe('duplicateBudgetAction', () => {
  it('throws when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })

    await expect(duplicateBudgetAction('budget-1')).rejects.toThrow('Não autenticado')
  })

  it('throws when free plan limit reached', async () => {
    vi.mocked(getProfile).mockResolvedValue({ data: { plan: 'free' } as any, error: null })
    vi.mocked(countBudgetsThisMonth).mockResolvedValue({ count: 3, error: null })

    await expect(duplicateBudgetAction('budget-1')).rejects.toThrow('Limite de 3')
  })

  it('throws when original budget not found', async () => {
    vi.mocked(getProfile).mockResolvedValue({ data: { plan: 'pro', pro_until: new Date(Date.now() + 86400000).toISOString() } as any, error: null })
    vi.mocked(getBudget).mockResolvedValue({ data: null, error: null })

    await expect(duplicateBudgetAction('missing')).rejects.toThrow('Orçamento não encontrado')
  })

  it('duplicates budget with all items', async () => {
    vi.mocked(getProfile).mockResolvedValue({ data: { plan: 'pro', pro_until: new Date(Date.now() + 86400000).toISOString() } as any, error: null })
    vi.mocked(getBudget).mockResolvedValue({
      data: {
        id: 'original',
        client_id: 'client-1',
        payment_conditions: 'PIX',
        validity_days: 30,
        notes: 'Test',
        total: 500,
        items: [
          { id: 'item-1', budget_id: 'original', service_name: 'Paint', description: '', unit: 'm²', quantity: 5, unit_price: 100, total: 500, sort_order: 0 },
        ],
      } as any,
      error: null,
    })
    vi.mocked(createBudget).mockResolvedValue({ data: { id: 'new' } as any, error: null })

    await duplicateBudgetAction('original')

    // Items should NOT contain id or budget_id from original
    const createCall = vi.mocked(createBudget).mock.calls[0]
    const items = createCall[2]
    expect(items[0]).not.toHaveProperty('id')
    expect(items[0]).not.toHaveProperty('budget_id')
    expect(items[0].service_name).toBe('Paint')
    expect(revalidatePath).toHaveBeenCalledWith('/orcamentos')
  })
})

// ─── updateBudgetStatusAction ─────────────────────────

describe('updateBudgetStatusAction', () => {
  it('updates status and revalidates', async () => {
    vi.mocked(updateBudgetStatus).mockResolvedValue({ data: {} as any, error: null })

    await updateBudgetStatusAction('budget-1', 'enviado')

    expect(updateBudgetStatus).toHaveBeenCalledWith(expect.anything(), 'budget-1', 'enviado')
    expect(revalidatePath).toHaveBeenCalledWith('/orcamentos')
  })

  it('throws on error', async () => {
    vi.mocked(updateBudgetStatus).mockResolvedValue({ data: null, error: { message: 'Fail' } as any })

    await expect(updateBudgetStatusAction('budget-1', 'enviado')).rejects.toThrow('Fail')
  })
})

// ─── deleteBudgetAction ───────────────────────────────

describe('deleteBudgetAction', () => {
  it('deletes and revalidates', async () => {
    vi.mocked(deleteBudget).mockResolvedValue({ error: null })

    await deleteBudgetAction('budget-1')

    expect(deleteBudget).toHaveBeenCalledWith(expect.anything(), 'budget-1')
    expect(revalidatePath).toHaveBeenCalledWith('/orcamentos')
  })

  it('throws on error', async () => {
    vi.mocked(deleteBudget).mockResolvedValue({ error: { message: 'Fail' } as any })

    await expect(deleteBudgetAction('budget-1')).rejects.toThrow('Fail')
  })
})
