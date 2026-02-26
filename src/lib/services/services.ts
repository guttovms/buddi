import { Service } from '@/types/database'
import { SupabaseClient } from '@supabase/supabase-js'

export async function getServices(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('user_id', userId)
    .order('name')

  return { data: (data as Service[]) || [], error }
}

export async function createService(
  supabase: SupabaseClient,
  service: { user_id: string; name: string; description?: string; unit: string; price: number }
) {
  const { data, error } = await supabase
    .from('services')
    .insert(service)
    .select()
    .single()

  return { data: data as Service | null, error }
}

export async function updateService(
  supabase: SupabaseClient,
  id: string,
  updates: Partial<Service>
) {
  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  return { data: data as Service | null, error }
}

export async function deleteService(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from('services').delete().eq('id', id)
  return { error }
}
