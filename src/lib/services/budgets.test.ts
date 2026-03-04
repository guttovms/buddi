import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  getBudgets,
  getBudget,
  getPublicBudget,
  createBudget,
  updateBudget,
  updateBudgetStatus,
  deleteBudget,
  countBudgetsThisMonth,
} from './budgets'
import { createMockSupabase, createMockChain } from './__mocks__/supabase'

describe('budgets service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.useRealTimers()
  })

  // ─── getBudgets ─────────────────────────────────────

  describe('getBudgets', () => {
    it('returns budgets with client data', async () => {
      const budgets = [{ id: '1', status: 'rascunho', client: { name: 'Alice' } }]
      const { client, chain } = createMockSupabase({ data: budgets, error: null })

      const result = await getBudgets(client as any, 'user-1')

      expect(client.from).toHaveBeenCalledWith('budgets')
      expect(chain.select).toHaveBeenCalledWith('*, client:clients(*)')
      expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-1')
      expect(chain.order).toHaveBeenCalledWith('created_at', { ascending: false })
      expect(result.data).toEqual(budgets)
    })

    it('returns empty array when no data', async () => {
      const { client } = createMockSupabase({ data: null, error: null })

      const result = await getBudgets(client as any, 'user-1')

      expect(result.data).toEqual([])
    })
  })

  // ─── getBudget ──────────────────────────────────────

  describe('getBudget', () => {
    it('returns budget with items and client', async () => {
      const budget = { id: '1', items: [], client: { name: 'Alice' } }
      const { client, chain } = createMockSupabase({ data: budget, error: null })
      chain.single.mockResolvedValue({ data: budget, error: null })

      const result = await getBudget(client as any, '1')

      expect(chain.select).toHaveBeenCalledWith('*, client:clients(*), items:budget_items(*)')
      expect(chain.eq).toHaveBeenCalledWith('id', '1')
      expect(result.data).toEqual(budget)
    })
  })

  // ─── getPublicBudget ────────────────────────────────

  describe('getPublicBudget', () => {
    it('includes profile in select', async () => {
      const budget = { id: '1', profile: { business_name: 'Test' } }
      const { client, chain } = createMockSupabase({ data: budget, error: null })
      chain.single.mockResolvedValue({ data: budget, error: null })

      const result = await getPublicBudget(client as any, '1')

      expect(chain.select).toHaveBeenCalledWith(
        '*, client:clients(*), items:budget_items(*), profile:profiles(*)'
      )
      expect(result.data).toEqual(budget)
    })
  })

  // ─── createBudget ───────────────────────────────────

  describe('createBudget', () => {
    it('inserts budget then items', async () => {
      const budgetData = { id: 'budget-1', total: 300 }
      const budgetChain = createMockChain({ data: budgetData, error: null })
      budgetChain.single.mockResolvedValue({ data: budgetData, error: null })

      const itemsChain = createMockChain({ data: null, error: null })

      const client = {
        from: vi.fn()
          .mockReturnValueOnce(budgetChain)
          .mockReturnValueOnce(itemsChain),
      }

      const items = [
        { service_name: 'Paint', description: '', unit: 'm²', quantity: 10, unit_price: 30, total: 300, sort_order: 0 },
      ]

      const result = await createBudget(client as any, {
        user_id: 'user-1',
        client_id: 'client-1',
        total: 300,
      }, items)

      expect(client.from).toHaveBeenNthCalledWith(1, 'budgets')
      expect(client.from).toHaveBeenNthCalledWith(2, 'budget_items')
      expect(itemsChain.insert).toHaveBeenCalledWith([
        expect.objectContaining({ budget_id: 'budget-1', service_name: 'Paint' }),
      ])
      expect(result.data).toEqual(budgetData)
      expect(result.error).toBeNull()
    })

    it('returns error and skips items if budget insert fails', async () => {
      const error = { message: 'Insert failed' }
      const budgetChain = createMockChain({ data: null, error })
      budgetChain.single.mockResolvedValue({ data: null, error })

      const client = { from: vi.fn().mockReturnValue(budgetChain) }

      const result = await createBudget(client as any, {
        user_id: 'user-1',
        client_id: 'client-1',
        total: 0,
      }, [])

      expect(client.from).toHaveBeenCalledTimes(1)
      expect(result.data).toBeNull()
      expect(result.error).toEqual(error)
    })

    it('returns error if items insert fails', async () => {
      const budgetData = { id: 'budget-1' }
      const budgetChain = createMockChain({ data: budgetData, error: null })
      budgetChain.single.mockResolvedValue({ data: budgetData, error: null })

      const itemsError = { message: 'Items failed' }
      const itemsChain = createMockChain({ data: null, error: itemsError })

      const client = {
        from: vi.fn()
          .mockReturnValueOnce(budgetChain)
          .mockReturnValueOnce(itemsChain),
      }

      const result = await createBudget(client as any, {
        user_id: 'user-1',
        client_id: 'client-1',
        total: 0,
      }, [{ service_name: 'X', description: '', unit: 'un', quantity: 1, unit_price: 10, total: 10, sort_order: 0 }])

      expect(result.data).toBeNull()
      expect(result.error).toEqual(itemsError)
    })
  })

  // ─── updateBudget ───────────────────────────────────

  describe('updateBudget', () => {
    it('updates budget, deletes old items, inserts new items', async () => {
      const budgetData = { id: 'budget-1' }
      const updateChain = createMockChain({ data: budgetData, error: null })
      updateChain.single.mockResolvedValue({ data: budgetData, error: null })

      const deleteChain = createMockChain({ data: null, error: null })
      const insertChain = createMockChain({ data: null, error: null })

      const client = {
        from: vi.fn()
          .mockReturnValueOnce(updateChain)
          .mockReturnValueOnce(deleteChain)
          .mockReturnValueOnce(insertChain),
      }

      const items = [
        { service_name: 'New Item', description: '', unit: 'un', quantity: 2, unit_price: 50, total: 100, sort_order: 0 },
      ]

      const result = await updateBudget(client as any, 'budget-1', {
        client_id: 'client-1',
        total: 100,
      }, items)

      expect(client.from).toHaveBeenNthCalledWith(1, 'budgets')
      expect(client.from).toHaveBeenNthCalledWith(2, 'budget_items')
      expect(client.from).toHaveBeenNthCalledWith(3, 'budget_items')
      expect(updateChain.update).toHaveBeenCalledWith(
        expect.objectContaining({ client_id: 'client-1', total: 100, updated_at: expect.any(String) })
      )
      expect(deleteChain.delete).toHaveBeenCalled()
      expect(deleteChain.eq).toHaveBeenCalledWith('budget_id', 'budget-1')
      expect(insertChain.insert).toHaveBeenCalledWith([
        expect.objectContaining({ budget_id: 'budget-1', service_name: 'New Item' }),
      ])
      expect(result.data).toEqual(budgetData)
    })

    it('stops if budget update fails', async () => {
      const error = { message: 'Update failed' }
      const updateChain = createMockChain({ data: null, error })
      updateChain.single.mockResolvedValue({ data: null, error })

      const client = { from: vi.fn().mockReturnValue(updateChain) }

      const result = await updateBudget(client as any, 'budget-1', {
        client_id: 'client-1',
        total: 0,
      }, [])

      expect(client.from).toHaveBeenCalledTimes(1)
      expect(result.error).toEqual(error)
    })

    it('stops if delete old items fails', async () => {
      const budgetData = { id: 'budget-1' }
      const updateChain = createMockChain({ data: budgetData, error: null })
      updateChain.single.mockResolvedValue({ data: budgetData, error: null })

      const deleteError = { message: 'Delete failed' }
      const deleteChain = createMockChain({ data: null, error: deleteError })

      const client = {
        from: vi.fn()
          .mockReturnValueOnce(updateChain)
          .mockReturnValueOnce(deleteChain),
      }

      const result = await updateBudget(client as any, 'budget-1', {
        client_id: 'client-1',
        total: 0,
      }, [])

      expect(client.from).toHaveBeenCalledTimes(2)
      expect(result.error).toEqual(deleteError)
    })
  })

  // ─── updateBudgetStatus ─────────────────────────────

  describe('updateBudgetStatus', () => {
    it('updates status and updated_at', async () => {
      const budget = { id: '1', status: 'enviado' }
      const { client, chain } = createMockSupabase({ data: budget, error: null })
      chain.single.mockResolvedValue({ data: budget, error: null })

      await updateBudgetStatus(client as any, '1', 'enviado')

      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'enviado', updated_at: expect.any(String) })
      )
      // Should NOT contain client_approved_at
      const updateArg = chain.update.mock.calls[0][0]
      expect(updateArg).not.toHaveProperty('client_approved_at')
    })

    it('sets client_approved_at when status is aprovado', async () => {
      const budget = { id: '1', status: 'aprovado' }
      const { client, chain } = createMockSupabase({ data: budget, error: null })
      chain.single.mockResolvedValue({ data: budget, error: null })

      await updateBudgetStatus(client as any, '1', 'aprovado')

      const updateArg = chain.update.mock.calls[0][0]
      expect(updateArg).toHaveProperty('client_approved_at')
      expect(updateArg.client_approved_at).toEqual(expect.any(String))
    })
  })

  // ─── deleteBudget ───────────────────────────────────

  describe('deleteBudget', () => {
    it('deletes budget by id', async () => {
      const { client, chain } = createMockSupabase({ data: null, error: null })

      const result = await deleteBudget(client as any, 'budget-1')

      expect(client.from).toHaveBeenCalledWith('budgets')
      expect(chain.delete).toHaveBeenCalled()
      expect(chain.eq).toHaveBeenCalledWith('id', 'budget-1')
      expect(result.error).toBeNull()
    })
  })

  // ─── countBudgetsThisMonth ──────────────────────────

  describe('countBudgetsThisMonth', () => {
    it('returns count for current month', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 2, 15)) // March 15, 2026

      const { client, chain } = createMockSupabase({ data: null, error: null, count: 5 })

      const result = await countBudgetsThisMonth(client as any, 'user-1')

      expect(chain.select).toHaveBeenCalledWith('*', { count: 'exact', head: true })
      expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-1')
      // Verify date range covers March 2026 (ISO strings include timezone offset)
      const gteDate = chain.gte.mock.calls[0][1]
      const lteDate = chain.lte.mock.calls[0][1]
      expect(new Date(gteDate).getMonth()).toBe(2) // March (0-indexed)
      expect(new Date(gteDate).getDate()).toBe(1)
      expect(new Date(lteDate).getMonth()).toBe(2) // Still March
      expect(new Date(lteDate).getDate()).toBe(31)
      expect(result.count).toBe(5)
    })

    it('returns 0 when count is null', async () => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date(2026, 0, 10)) // January 10, 2026

      const { client } = createMockSupabase({ data: null, error: null, count: undefined })

      const result = await countBudgetsThisMonth(client as any, 'user-1')

      expect(result.count).toBe(0)
    })
  })
})
