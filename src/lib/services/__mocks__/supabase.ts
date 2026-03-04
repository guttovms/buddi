import { vi } from 'vitest'

type ChainResult = { data: unknown; error: unknown; count?: number }

export function createMockChain(resolvedValue: ChainResult = { data: null, error: null }) {
  const chain: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(resolvedValue),
  }

  // Make chain thenable so `await supabase.from('x').select().eq()` resolves
  const thenable = Object.assign(chain, {
    then(resolve: (v: ChainResult) => void) {
      return Promise.resolve(resolvedValue).then(resolve)
    },
  })

  return thenable
}

export function createMockSupabase(resolvedValue: ChainResult = { data: null, error: null }) {
  const chain = createMockChain(resolvedValue)

  const client = {
    from: vi.fn().mockReturnValue(chain),
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { id: 'test-user-id' } },
        error: null,
      }),
    },
  }

  return { client, chain }
}
