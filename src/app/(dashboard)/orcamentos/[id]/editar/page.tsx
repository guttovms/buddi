import { createClient } from '@/lib/supabase/server'
import { getBudget } from '@/lib/services/budgets'
import { getClients } from '@/lib/services/clients'
import { getServices } from '@/lib/services/services'
import { redirect, notFound } from 'next/navigation'
import { OrcamentoForm } from '../../orcamento-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarOrcamentoPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [budgetResult, clientsResult, servicesResult] = await Promise.all([
    getBudget(supabase, id),
    getClients(supabase, user.id),
    getServices(supabase, user.id),
  ])

  if (!budgetResult.data) notFound()

  return (
    <OrcamentoForm
      clients={clientsResult.data}
      services={servicesResult.data}
      budget={budgetResult.data}
    />
  )
}
