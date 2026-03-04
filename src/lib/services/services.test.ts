import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getServices, createService, updateService, deleteService } from './services'
import { createMockSupabase } from './__mocks__/supabase'

describe('services service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('getServices', () => {
    it('returns sorted services for user', async () => {
      const services = [{ id: '1', name: 'Painting' }, { id: '2', name: 'Plumbing' }]
      const { client, chain } = createMockSupabase({ data: services, error: null })

      const result = await getServices(client as any, 'user-1')

      expect(client.from).toHaveBeenCalledWith('services')
      expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-1')
      expect(chain.order).toHaveBeenCalledWith('name')
      expect(result.data).toEqual(services)
    })

    it('returns empty array when no data', async () => {
      const { client } = createMockSupabase({ data: null, error: null })

      const result = await getServices(client as any, 'user-1')

      expect(result.data).toEqual([])
    })
  })

  describe('createService', () => {
    it('creates and returns new service', async () => {
      const service = { id: '1', name: 'Painting', price: 150 }
      const { client, chain } = createMockSupabase({ data: service, error: null })
      chain.single.mockResolvedValue({ data: service, error: null })

      const result = await createService(client as any, {
        user_id: 'user-1',
        name: 'Painting',
        unit: 'm²',
        price: 150,
      })

      expect(client.from).toHaveBeenCalledWith('services')
      expect(chain.insert).toHaveBeenCalledWith({
        user_id: 'user-1',
        name: 'Painting',
        unit: 'm²',
        price: 150,
      })
      expect(result.data).toEqual(service)
    })
  })

  describe('updateService', () => {
    it('updates service by id', async () => {
      const updated = { id: '1', name: 'Painting Pro', price: 200 }
      const { client, chain } = createMockSupabase({ data: updated, error: null })
      chain.single.mockResolvedValue({ data: updated, error: null })

      const result = await updateService(client as any, '1', { name: 'Painting Pro', price: 200 })

      expect(chain.update).toHaveBeenCalledWith({ name: 'Painting Pro', price: 200 })
      expect(chain.eq).toHaveBeenCalledWith('id', '1')
      expect(result.data).toEqual(updated)
    })
  })

  describe('deleteService', () => {
    it('deletes service by id', async () => {
      const { client, chain } = createMockSupabase({ data: null, error: null })

      const result = await deleteService(client as any, '1')

      expect(client.from).toHaveBeenCalledWith('services')
      expect(chain.delete).toHaveBeenCalled()
      expect(chain.eq).toHaveBeenCalledWith('id', '1')
      expect(result.error).toBeNull()
    })
  })
})
