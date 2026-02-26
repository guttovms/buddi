import { createClient } from '@/lib/supabase/server'
import { getClients } from '@/lib/services/clients'
import { redirect } from 'next/navigation'
import { ClientesClient } from './clientes-client'

export default async function ClientesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: clients } = await getClients(supabase, user.id)

  return <ClientesClient clients={clients} />
}
