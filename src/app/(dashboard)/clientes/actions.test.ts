import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/services/clients', () => ({
  createClientRecord: vi.fn(),
  updateClient: vi.fn(),
  deleteClient: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { createClientRecord, updateClient, deleteClient } from '@/lib/services/clients'
import { createClientAction, updateClientAction, deleteClientAction } from './actions'

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

// ─── createClientAction ───────────────────────────────

describe('createClientAction', () => {
  it('throws when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })

    await expect(createClientAction(makeFormData({ name: 'Alice' }))).rejects.toThrow('Não autenticado')
  })

  it('creates client with form data', async () => {
    vi.mocked(createClientRecord).mockResolvedValue({ data: {} as any, error: null })

    await createClientAction(makeFormData({
      name: 'Alice',
      phone: '11999887766',
      email: 'alice@test.com',
      document: '',
      address: '',
      city: 'SP',
      state: 'SP',
    }))

    expect(createClientRecord).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        user_id: 'test-user-id',
        name: 'Alice',
        phone: '11999887766',
        email: 'alice@test.com',
        city: 'SP',
      })
    )
    expect(revalidatePath).toHaveBeenCalledWith('/clientes')
  })

  it('converts empty strings to undefined', async () => {
    vi.mocked(createClientRecord).mockResolvedValue({ data: {} as any, error: null })

    await createClientAction(makeFormData({ name: 'Bob', phone: '', email: '' }))

    const call = vi.mocked(createClientRecord).mock.calls[0][1]
    expect(call.phone).toBeUndefined()
    expect(call.email).toBeUndefined()
  })

  it('throws on service error', async () => {
    vi.mocked(createClientRecord).mockResolvedValue({ data: null, error: { message: 'DB error' } as any })

    await expect(createClientAction(makeFormData({ name: 'Alice' }))).rejects.toThrow('DB error')
  })
})

// ─── updateClientAction ───────────────────────────────

describe('updateClientAction', () => {
  it('updates client by id', async () => {
    vi.mocked(updateClient).mockResolvedValue({ data: {} as any, error: null })

    await updateClientAction('client-1', makeFormData({ name: 'Alice Updated', phone: '11999' }))

    expect(updateClient).toHaveBeenCalledWith(
      expect.anything(),
      'client-1',
      expect.objectContaining({ name: 'Alice Updated', phone: '11999' })
    )
    expect(revalidatePath).toHaveBeenCalledWith('/clientes')
  })
})

// ─── deleteClientAction ───────────────────────────────

describe('deleteClientAction', () => {
  it('deletes and revalidates', async () => {
    vi.mocked(deleteClient).mockResolvedValue({ error: null })

    await deleteClientAction('client-1')

    expect(deleteClient).toHaveBeenCalledWith(expect.anything(), 'client-1')
    expect(revalidatePath).toHaveBeenCalledWith('/clientes')
  })

  it('throws on error', async () => {
    vi.mocked(deleteClient).mockResolvedValue({ error: { message: 'Fail' } as any })

    await expect(deleteClientAction('client-1')).rejects.toThrow('Fail')
  })
})
