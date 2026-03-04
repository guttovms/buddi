import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getProfile, updateProfile } from './profiles'
import { createMockSupabase } from './__mocks__/supabase'

describe('profiles service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('getProfile', () => {
    it('returns profile by userId', async () => {
      const profile = { id: 'user-1', business_name: 'Test Business' }
      const { client, chain } = createMockSupabase({ data: profile, error: null })
      chain.single.mockResolvedValue({ data: profile, error: null })

      const result = await getProfile(client as any, 'user-1')

      expect(client.from).toHaveBeenCalledWith('profiles')
      expect(chain.eq).toHaveBeenCalledWith('id', 'user-1')
      expect(result.data).toEqual(profile)
      expect(result.error).toBeNull()
    })

    it('returns null and error when not found', async () => {
      const error = { message: 'Not found' }
      const { client, chain } = createMockSupabase({ data: null, error })
      chain.single.mockResolvedValue({ data: null, error })

      const result = await getProfile(client as any, 'missing-id')

      expect(result.data).toBeNull()
      expect(result.error).toEqual(error)
    })
  })

  describe('updateProfile', () => {
    it('updates profile and sets updated_at', async () => {
      const updated = { id: 'user-1', business_name: 'Updated' }
      const { client, chain } = createMockSupabase({ data: updated, error: null })
      chain.single.mockResolvedValue({ data: updated, error: null })

      const result = await updateProfile(client as any, 'user-1', {
        business_name: 'Updated',
      })

      expect(client.from).toHaveBeenCalledWith('profiles')
      expect(chain.update).toHaveBeenCalledWith(
        expect.objectContaining({
          business_name: 'Updated',
          updated_at: expect.any(String),
        })
      )
      expect(chain.eq).toHaveBeenCalledWith('id', 'user-1')
      expect(result.data).toEqual(updated)
    })
  })
})
