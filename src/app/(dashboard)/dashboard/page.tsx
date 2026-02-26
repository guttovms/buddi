import { StatsCard } from '@/components/dashboard/stats-card'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/server'
import { CheckCircle, Clock, FileText, Plus, Users } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [budgetsResult, clientsResult] = await Promise.all([
    supabase.from('budgets').select('status', { count: 'exact' }).eq('user_id', user.id),
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const budgets = budgetsResult.data || []
  const totalBudgets = budgets.length
  const pending = budgets.filter((b) => b.status === 'enviado').length
  const approved = budgets.filter((b) => b.status === 'aprovado').length
  const totalClients = clientsResult.count || 0

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link href="/orcamentos/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Orçamento
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total de Orçamentos" value={totalBudgets} icon={FileText} />
        <StatsCard title="Pendentes" value={pending} icon={Clock} color="text-yellow-600" />
        <StatsCard title="Aprovados" value={approved} icon={CheckCircle} color="text-green-600" />
        <StatsCard title="Clientes" value={totalClients} icon={Users} color="text-purple-600" />
      </div>

      {totalBudgets === 0 && (
        <div className="mt-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum orçamento ainda</h3>
          <p className="mt-1 text-sm text-gray-500">
            Comece criando seu primeiro orçamento profissional.
          </p>
          <Link href="/orcamentos/novo">
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Criar Orçamento
            </Button>
          </Link>
        </div>
      )}
    </div>
  )
}
