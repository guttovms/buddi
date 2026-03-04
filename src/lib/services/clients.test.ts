import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getClients, createClientRecord, updateClient, deleteClient } from './clients'
import { createMockSupabase } from './__mocks__/supabase'

describe('clients service', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
  })

  describe('getClients', () => {
    it('returns sorted clients for user', async () => {
      const clients = [{ id: '1', name: 'Alice' }, { id: '2', name: 'Bob' }]
      const { client, chain } = createMockSupabase({ data: clients, error: null })

      const result = await getClients(client as any, 'user-1')

      expect(client.from).toHaveBeenCalledWith('clients')
      expect(chain.eq).toHaveBeenCalledWith('user_id', 'user-1')
      expect(chain.order).toHaveBeenCalledWith('name')
      expect(result.data).toEqual(clients)
    })

    it('returns empty array when no data', async () => {
      const { client } = createMockSupabase({ data: null, error: null })

      const result = await getClients(client as any, 'user-1')

      expect(result.data).toEqual([])
    })
  })

  describe('createClientRecord', () => {
    it('creates and returns new client', async () => {
      const newClient = { id: '1', name: 'Alice', user_id: 'user-1' }
      const { client, chain } = createMockSupabase({ data: newClient, error: null })
      chain.single.mockResolvedValue({ data: newClient, error: null })

      const result = await createClientRecord(client as any, {
        user_id: 'user-1',
        name: 'Alice',
      })

      expect(client.from).toHaveBeenCalledWith('clients')
      expect(chain.insert).toHaveBeenCalledWith({ user_id: 'user-1', name: 'Alice' })
      expect(result.data).toEqual(newClient)
    })

    it('returns error on failure', async () => {
      const error = { message: 'Insert failed' }
      const { client, chain } = createMockSupabase({ data: null, error })
      chain.single.mockResolvedValue({ data: null, error })

      const result = await createClientRecord(client as any, {
        user_id: 'user-1',
        name: 'Alice',
      })

      expect(result.data).toBeNull()
      expect(result.error).toEqual(error)
    })
  })

  describe('updateClient', () => {
    it('updates client by id', async () => {
      const updated = { id: '1', name: 'Alice Updated' }
      const { client, chain } = createMockSupabase({ data: updated, error: null })
      chain.single.mockResolvedValue({ data: updated, error: null })

      const result = await updateClient(client as any, '1', { name: 'Alice Updated' })

      expect(chain.update).toHaveBeenCalledWith({ name: 'Alice Updated' })
      expect(chain.eq).toHaveBeenCalledWith('id', '1')
      expect(result.data).toEqual(updated)
    })
  })

  describe('deleteClient', () => {
    it('deletes client by id', async () => {
      const { client, chain } = createMockSupabase({ data: null, error: null })

      const result = await deleteClient(client as any, '1')

      expect(client.from).toHaveBeenCalledWith('clients')
      expect(chain.delete).toHaveBeenCalled()
      expect(chain.eq).toHaveBeenCalledWith('id', '1')
      expect(result.error).toBeNull()
    })
  })
})
