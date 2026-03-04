import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { getBudgets } from '@/lib/services/budgets'
import { formatCurrency, formatDate, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'
import { Copy, ExternalLink, FileText, Pencil, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { deleteBudgetAction, duplicateBudgetAction, updateBudgetStatusAction } from './actions'

export default async function OrcamentosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: budgets } = await getBudgets(supabase, user.id)

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orçamentos</h1>
        <Link href="/orcamentos/novo">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Orçamento
          </Button>
        </Link>
      </div>

      {budgets.length === 0 ? (
        <div className="mt-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum orçamento criado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Crie seu primeiro orçamento profissional em minutos.
          </p>
          <Link href="/orcamentos/novo">
            <Button className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Criar Orçamento
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {budgets.map((budget) => (
            <Card key={budget.id} className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-gray-900">
                      #{budget.number} — {budget.client?.name || 'Sem cliente'}
                    </h3>
                    <Badge className={STATUS_COLORS[budget.status]}>
                      {STATUS_LABELS[budget.status]}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    {formatDate(budget.created_at)} · {formatCurrency(budget.total)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {budget.status === 'rascunho' && (
                  <form action={updateBudgetStatusAction.bind(null, budget.id, 'enviado')}>
                    <Button variant="outline" size="sm" type="submit">
                      Marcar Enviado
                    </Button>
                  </form>
                )}
                <Link
                  href={`/orcamentos/${budget.id}/editar`}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  title="Editar"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
                <form action={duplicateBudgetAction.bind(null, budget.id)}>
                  <button
                    type="submit"
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    title="Duplicar"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </form>
                <Link
                  href={`/orcamento/${budget.id}`}
                  target="_blank"
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  title="Ver link público"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
                <form action={deleteBudgetAction.bind(null, budget.id)}>
                  <button
                    type="submit"
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </form>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
