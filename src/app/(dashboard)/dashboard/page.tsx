import { createClient } from '@/lib/supabase/server'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowRight, Briefcase, CheckCircle, Clock, FileText, Plus, Send, TrendingUp, Users } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [budgetsResult, clientsResult, servicesResult] = await Promise.all([
    supabase
      .from('budgets')
      .select('id, number, status, total, created_at, client:clients(name)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    supabase.from('clients').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
    supabase.from('services').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
  ])

  const budgets = budgetsResult.data || []
  const totalClients = clientsResult.count || 0
  const totalServices = servicesResult.count || 0

  const draft = budgets.filter((b) => b.status === 'rascunho').length
  const sent = budgets.filter((b) => b.status === 'enviado').length
  const approved = budgets.filter((b) => b.status === 'aprovado').length
  const totalRevenue = budgets
    .filter((b) => b.status === 'aprovado')
    .reduce((sum, b) => sum + (b.total || 0), 0)

  const recentQuotes = budgets.slice(0, 5)

  const statusDot: Record<string, string> = {
    rascunho: 'bg-gray-300',
    enviado: 'bg-gray-500',
    aprovado: 'bg-gray-900',
    recusado: 'bg-gray-300',
  }

  const statusLabel: Record<string, string> = {
    rascunho: 'Rascunho',
    enviado: 'Enviado',
    aprovado: 'Aprovado',
    recusado: 'Recusado',
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">Visão geral dos seus orçamentos</p>
        </div>
        <Link
          href="/orcamentos/novo"
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm text-white transition-opacity hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Novo Orçamento
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          { label: 'Clientes', value: totalClients, icon: Users },
          { label: 'Serviços', value: totalServices, icon: Briefcase },
          { label: 'Orçamentos', value: budgets.length, icon: FileText },
          { label: 'Receita Aprovada', value: formatCurrency(totalRevenue), icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="rounded-xl rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="mb-1.5 text-xs text-gray-500">{label}</p>
                <p className="text-2xl font-semibold text-gray-900">{value}</p>
              </div>
              <Icon className="mt-1 h-4 w-4 text-gray-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Status overview + recent quotes */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Status */}
        <div className="flex flex-col gap-4 rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
          <p className="text-sm font-medium text-gray-900">Status dos orçamentos</p>
          <div className="space-y-3">
            {[
              { label: 'Rascunhos', value: draft, icon: Clock },
              { label: 'Enviados', value: sent, icon: Send },
              { label: 'Aprovados', value: approved, icon: CheckCircle },
            ].map(({ label, value, icon: Icon }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-sm text-gray-500">
                  <Icon className="h-4 w-4" />
                  {label}
                </div>
                <span className="text-sm font-medium text-gray-900">{value}</span>
              </div>
            ))}
          </div>

          {budgets.length > 0 && (
            <div className="mt-auto border-t border-gray-100 pt-3">
              <div className="flex h-1.5 gap-1 overflow-hidden rounded-full bg-gray-100">
                {draft > 0 && (
                  <div
                    className="rounded-full bg-gray-300"
                    style={{ width: `${(draft / budgets.length) * 100}%` }}
                  />
                )}
                {sent > 0 && (
                  <div
                    className="rounded-full bg-gray-500"
                    style={{ width: `${(sent / budgets.length) * 100}%` }}
                  />
                )}
                {approved > 0 && (
                  <div
                    className="rounded-full bg-gray-900"
                    style={{ width: `${(approved / budgets.length) * 100}%` }}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Recent quotes */}
        <div className="flex flex-col overflow-hidden rounded-xl border border-gray-200/80 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
            <p className="text-sm font-medium text-gray-900">Orçamentos Recentes</p>
            <Link
              href="/orcamentos"
              className="flex items-center gap-1 text-xs text-gray-500 transition-colors hover:text-gray-900"
            >
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {recentQuotes.length === 0 ? (
            <div className="flex flex-1 flex-col items-center justify-center p-10 text-center text-gray-500">
              <FileText className="mb-2 h-7 w-7 opacity-25" />
              <p className="text-sm">Nenhum orçamento ainda.</p>
              <Link
                href="/orcamentos/novo"
                className="mt-1.5 text-sm text-gray-900 underline underline-offset-2"
              >
                Criar primeiro orçamento
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {recentQuotes.map((q: Record<string, unknown>) => (
                <Link
                  key={q.id as string}
                  href={`/orcamento/${q.id}`}
                  className="flex items-center justify-between px-5 py-3.5 transition-colors hover:bg-gray-50"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <span
                      className={`h-1.5 w-1.5 shrink-0 rounded-full ${statusDot[(q.status as string) || 'rascunho']}`}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm text-gray-900">
                        {(q.client as { name: string } | null)?.name || 'Sem cliente'}
                      </p>
                      <p className="text-xs text-gray-500">{formatDate(q.created_at as string)}</p>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-4">
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(q.total as number)}
                    </span>
                    <span className="hidden text-xs text-gray-500 sm:block">
                      {statusLabel[(q.status as string) || 'rascunho']}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick access notice */}
      {(totalClients === 0 || totalServices === 0) && (
        <div className="rounded-xl border border-gray-200/80 bg-white p-5 shadow-sm">
          <p className="mb-3 text-sm text-gray-500">Para criar orçamentos, complete o cadastro:</p>
          <div className="flex flex-wrap gap-2">
            {totalClients === 0 && (
              <Link
                href="/clientes"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm transition-colors hover:bg-gray-50"
              >
                <Users className="h-4 w-4 text-gray-400" /> Cadastrar clientes
              </Link>
            )}
            {totalServices === 0 && (
              <Link
                href="/servicos"
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm transition-colors hover:bg-gray-50"
              >
                <Briefcase className="h-4 w-4 text-gray-400" /> Cadastrar serviços
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
