import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/services/services', () => ({
  createService: vi.fn(),
  updateService: vi.fn(),
  deleteService: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createService, updateService, deleteService } from '@/lib/services/services'
import { createServiceAction, updateServiceAction, deleteServiceAction } from './actions'

const mockUser = { id: 'test-user-id' }
const mockSupabase = {
  auth: { getUser: vi.fn().mockResolvedValue({ data: { user: mockUser }, error: null }) },
}

function makeFormData(entries: Record<string, string>): FormData {
  const fd = new FormData()
  for (const [key, value] of Object.entries(entries)) {
    fd.append(key, value)
  }
  return fd
}

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(createClient).mockResolvedValue(mockSupabase as any)
})

// ─── createServiceAction ──────────────────────────────

describe('createServiceAction', () => {
  it('throws when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })

    await expect(
      createServiceAction(makeFormData({ name: 'Paint', unit: 'm²', price: '150' }))
    ).rejects.toThrow('Não autenticado')
  })

  it('creates service with parsed price', async () => {
    vi.mocked(createService).mockResolvedValue({ data: {} as any, error: null })

    await createServiceAction(makeFormData({
      name: 'Painting',
      description: 'Interior painting',
      unit: 'm²',
      price: '150.50',
    }))

    expect(createService).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        user_id: 'test-user-id',
        name: 'Painting',
        description: 'Interior painting',
        unit: 'm²',
        price: 150.50,
      })
    )
    expect(revalidatePath).toHaveBeenCalledWith('/servicos')
  })

  it('converts empty description to undefined', async () => {
    vi.mocked(createService).mockResolvedValue({ data: {} as any, error: null })

    await createServiceAction(makeFormData({ name: 'Fix', description: '', unit: 'un', price: '100' }))

    const call = vi.mocked(createService).mock.calls[0][1]
    expect(call.description).toBeUndefined()
  })
})

// ─── updateServiceAction ──────────────────────────────

describe('updateServiceAction', () => {
  it('updates service with parsed price', async () => {
    vi.mocked(updateService).mockResolvedValue({ data: {} as any, error: null })

    await updateServiceAction('svc-1', makeFormData({
      name: 'Updated',
      description: '',
      unit: 'h',
      price: '200',
    }))

    expect(updateService).toHaveBeenCalledWith(
      expect.anything(),
      'svc-1',
      expect.objectContaining({ name: 'Updated', unit: 'h', price: 200 })
    )
    expect(revalidatePath).toHaveBeenCalledWith('/servicos')
  })
})

// ─── deleteServiceAction ──────────────────────────────

describe('deleteServiceAction', () => {
  it('deletes and revalidates', async () => {
    vi.mocked(deleteService).mockResolvedValue({ error: null })

    await deleteServiceAction('svc-1')

    expect(deleteService).toHaveBeenCalledWith(expect.anything(), 'svc-1')
    expect(revalidatePath).toHaveBeenCalledWith('/servicos')
  })

  it('throws on error', async () => {
    vi.mocked(deleteService).mockResolvedValue({ error: { message: 'Fail' } as any })

    await expect(deleteServiceAction('svc-1')).rejects.toThrow('Fail')
  })
})
