import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(),
}))

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/lib/services/profiles', () => ({
  updateProfile: vi.fn(),
}))

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { updateProfile } from '@/lib/services/profiles'
import { updateProfileAction, updateLogoAction, updateBrandColorAction } from './actions'

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

// ─── updateProfileAction ──────────────────────────────

describe('updateProfileAction', () => {
  it('throws when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })

    await expect(
      updateProfileAction(makeFormData({ business_name: 'Test' }))
    ).rejects.toThrow('Não autenticado')
  })

  it('updates profile with form data', async () => {
    vi.mocked(updateProfile).mockResolvedValue({ data: {} as any, error: null })

    await updateProfileAction(makeFormData({
      business_name: 'My Business',
      owner_name: 'João',
      phone: '11999887766',
      email: 'joao@test.com',
      document: '',
      address: '',
      city: 'SP',
      state: 'SP',
    }))

    expect(updateProfile).toHaveBeenCalledWith(
      expect.anything(),
      'test-user-id',
      expect.objectContaining({
        business_name: 'My Business',
        owner_name: 'João',
        phone: '11999887766',
        city: 'SP',
      })
    )
    expect(revalidatePath).toHaveBeenCalledWith('/configuracoes')
  })

  it('converts empty strings to null', async () => {
    vi.mocked(updateProfile).mockResolvedValue({ data: {} as any, error: null })

    await updateProfileAction(makeFormData({
      business_name: '',
      owner_name: '',
      phone: '',
      email: '',
      document: '',
      address: '',
      city: '',
      state: '',
    }))

    const call = vi.mocked(updateProfile).mock.calls[0][2]
    expect(call.business_name).toBeNull()
    expect(call.phone).toBeNull()
  })
})

// ─── updateLogoAction ─────────────────────────────────

describe('updateLogoAction', () => {
  it('throws when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })

    await expect(updateLogoAction('https://example.com/logo.png')).rejects.toThrow('Não autenticado')
  })

  it('updates logo_url', async () => {
    vi.mocked(updateProfile).mockResolvedValue({ data: {} as any, error: null })

    await updateLogoAction('https://example.com/logo.png')

    expect(updateProfile).toHaveBeenCalledWith(
      expect.anything(),
      'test-user-id',
      { logo_url: 'https://example.com/logo.png' }
    )
  })

  it('removes logo when null', async () => {
    vi.mocked(updateProfile).mockResolvedValue({ data: {} as any, error: null })

    await updateLogoAction(null)

    expect(updateProfile).toHaveBeenCalledWith(
      expect.anything(),
      'test-user-id',
      { logo_url: null }
    )
  })
})

// ─── updateBrandColorAction ───────────────────────────

describe('updateBrandColorAction', () => {
  it('throws when not authenticated', async () => {
    mockSupabase.auth.getUser.mockResolvedValueOnce({ data: { user: null }, error: null })

    await expect(updateBrandColorAction('#ff0000')).rejects.toThrow('Não autenticado')
  })

  it('updates brand_color', async () => {
    vi.mocked(updateProfile).mockResolvedValue({ data: {} as any, error: null })

    await updateBrandColorAction('#059669')

    expect(updateProfile).toHaveBeenCalledWith(
      expect.anything(),
      'test-user-id',
      { brand_color: '#059669' }
    )
    expect(revalidatePath).toHaveBeenCalledWith('/configuracoes')
  })
})
