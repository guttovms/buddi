import { Client } from '@/types/database'
import { SupabaseClient } from '@supabase/supabase-js'

export async function getClients(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('user_id', userId)
    .order('name')

  return { data: (data as Client[]) || [], error }
}

export async function createClientRecord(
  supabase: SupabaseClient,
  client: {
    user_id: string
    name: string
    phone?: string
    email?: string
    document?: string
    address?: string
    city?: string
    state?: string
  }
) {
  const { data, error } = await supabase
    .from('clients')
    .insert(client)
    .select()
    .single()

  return { data: data as Client | null, error }
}

export async function updateClient(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<Client>
) {
  const { data, error } = await supabase
    .from('clients')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return { data: data as Client | null, error }
}

export async function deleteClient(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from('clients').delete().eq('id', id)
  return { error }
}
