import { createClient } from '@/lib/supabase/server'
import { getServices } from '@/lib/services/services'
import { redirect } from 'next/navigation'
import { ServicosClient } from './servicos-client'

export default async function ServicosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: services } = await getServices(supabase, user.id)

  return <ServicosClient services={services} />
}
