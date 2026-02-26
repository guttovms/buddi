import { createClient } from '@/lib/supabase/server'
import { getProfile } from '@/lib/services/profiles'
import { redirect } from 'next/navigation'
import { ConfiguracoesClient } from './configuracoes-client'

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await getProfile(supabase, user.id)

  return <ConfiguracoesClient profile={profile} userEmail={user.email || ''} />
}
