export const dynamic = 'force-dynamic'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import { getPublicBudget } from '@/lib/services/budgets'
import { formatCurrency, formatDate, STATUS_COLORS, STATUS_LABELS } from '@/lib/utils'
import { CheckCircle, Download, FileText } from 'lucide-react'
import { notFound } from 'next/navigation'
import { ApproveButton } from './approve-button'

interface Props {
  params: Promise<{ id: string }>
}

export default async function OrcamentoPublicoPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: budget } = await getPublicBudget(supabase, id)

  if (!budget) notFound()

  // Mark as viewed
  if (!budget.client_viewed_at) {
    await supabase
      .from('budgets')
      .update({ client_viewed_at: new Date().toISOString() })
      .eq('id', id)
  }

  const profile = budget.profile

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <Card className="mb-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {profile?.business_name || 'Orçamento'}
              </h1>
              {profile?.owner_name && (
                <p className="text-sm text-gray-500">{profile.owner_name}</p>
              )}
              {profile?.phone && (
                <p className="text-sm text-gray-500">{profile.phone}</p>
              )}
              {profile?.email && (
                <p className="text-sm text-gray-500">{profile.email}</p>
              )}
            </div>
            <Badge className={STATUS_COLORS[budget.status]}>
              {STATUS_LABELS[budget.status]}
            </Badge>
          </div>
        </Card>

        {/* Client info */}
        <Card className="mb-6">
          <h2 className="mb-2 text-sm font-medium text-gray-500">Cliente</h2>
          <p className="font-medium text-gray-900">{budget.client?.name}</p>
          {budget.client?.address && (
            <p className="text-sm text-gray-500">{budget.client.address}</p>
          )}
          <p className="mt-2 text-sm text-gray-400">
            Orçamento #{budget.number} · {formatDate(budget.created_at)}
          </p>
        </Card>

        {/* Items */}
        <Card className="mb-6">
          <h2 className="mb-4 text-sm font-medium text-gray-500">Itens do Orçamento</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="pb-2 font-medium">Item</th>
                  <th className="pb-2 font-medium">Qtd</th>
                  <th className="pb-2 font-medium">Unit.</th>
                  <th className="pb-2 text-right font-medium">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {budget.items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-3">
                      <p className="font-medium text-gray-900">{item.service_name}</p>
                      {item.description && (
                        <p className="text-xs text-gray-400">{item.description}</p>
                      )}
                    </td>
                    <td className="py-3 text-gray-600">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-3 text-gray-600">{formatCurrency(item.unit_price)}</td>
                    <td className="py-3 text-right font-medium text-gray-900">
                      {formatCurrency(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="pt-4 text-right text-lg font-bold text-gray-900">
                    Total:
                  </td>
                  <td className="pt-4 text-right text-lg font-bold text-blue-600">
                    {formatCurrency(budget.total)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {/* Conditions */}
        {(budget.payment_conditions || budget.notes) && (
          <Card className="mb-6">
            {budget.payment_conditions && (
              <div className="mb-3">
                <h3 className="text-sm font-medium text-gray-500">Condições de Pagamento</h3>
                <p className="mt-1 text-gray-900">{budget.payment_conditions}</p>
              </div>
            )}
            {budget.notes && (
              <div>
                <h3 className="text-sm font-medium text-gray-500">Observações</h3>
                <p className="mt-1 text-gray-900">{budget.notes}</p>
              </div>
            )}
            <p className="mt-3 text-xs text-gray-400">
              Válido por {budget.validity_days} dias a partir de {formatDate(budget.created_at)}
            </p>
          </Card>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          {budget.status === 'enviado' && (
            <ApproveButton budgetId={budget.id} />
          )}
          {budget.status === 'aprovado' && (
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Orçamento aprovado!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
