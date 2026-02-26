import { Profile } from '@/types/database'
import { SupabaseClient } from '@supabase/supabase-js'

export async function getProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  return { data: data as Profile | null, error }
}

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  updates: Partial<Profile>
) {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', userId)
    .select()
    .single()

  return { data: data as Profile | null, error }
}
