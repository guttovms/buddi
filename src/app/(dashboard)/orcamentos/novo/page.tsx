import { createClient } from '@/lib/supabase/server'
import { getClients } from '@/lib/services/clients'
import { getServices } from '@/lib/services/services'
import { redirect } from 'next/navigation'
import { NovoOrcamentoClient } from './novo-orcamento-client'

export default async function NovoOrcamentoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [clientsResult, servicesResult] = await Promise.all([
    getClients(supabase, user.id),
    getServices(supabase, user.id),
  ])

  return (
    <NovoOrcamentoClient
      clients={clientsResult.data}
      services={servicesResult.data}
    />
  )
}
