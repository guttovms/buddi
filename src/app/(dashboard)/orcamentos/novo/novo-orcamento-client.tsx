'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { formatCurrency, UNIT_OPTIONS } from '@/lib/utils'
import { Client, Service } from '@/types/database'
import { Plus, Trash2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { createBudgetAction } from '../actions'

interface BudgetItemForm {
  service_name: string
  description: string
  unit: string
  quantity: number
  unit_price: number
  total: number
  sort_order: number
}

interface Props {
  clients: Client[]
  services: Service[]
}

export function NovoOrcamentoClient({ clients, services }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [clientId, setClientId] = useState('')
  const [paymentConditions, setPaymentConditions] = useState('')
  const [validityDays, setValidityDays] = useState(30)
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<BudgetItemForm[]>([
    { service_name: '', description: '', unit: 'un', quantity: 1, unit_price: 0, total: 0, sort_order: 0 },
  ])

  function addItem() {
    setItems([
      ...items,
      {
        service_name: '',
        description: '',
        unit: 'un',
        quantity: 1,
        unit_price: 0,
        total: 0,
        sort_order: items.length,
      },
    ])
  }

  function removeItem(index: number) {
    if (items.length <= 1) return
    setItems(items.filter((_, i) => i !== index))
  }

  function updateItem(index: number, field: keyof BudgetItemForm, value: string | number) {
    const updated = [...items]
    const item = { ...updated[index], [field]: value }

    if (field === 'quantity' || field === 'unit_price') {
      item.total = Number(item.quantity) * Number(item.unit_price)
    }

    updated[index] = item
    setItems(updated)
  }

  function fillFromService(index: number, serviceId: string) {
    const service = services.find((s) => s.id === serviceId)
    if (!service) return

    const updated = [...items]
    updated[index] = {
      ...updated[index],
      service_name: service.name,
      description: service.description || '',
      unit: service.unit,
      unit_price: service.price,
      total: updated[index].quantity * service.price,
    }
    setItems(updated)
  }

  const total = items.reduce((sum, item) => sum + item.total, 0)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!clientId) {
      setError('Selecione um cliente.')
      return
    }
    if (items.some((i) => !i.service_name || i.unit_price <= 0)) {
      setError('Preencha todos os itens corretamente.')
      return
    }

    setLoading(true)
    setError('')

    try {
      await createBudgetAction({
        client_id: clientId,
        payment_conditions: paymentConditions,
        validity_days: validityDays,
        notes,
        items,
      })
      router.push('/orcamentos')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar orçamento.')
      setLoading(false)
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Novo Orçamento</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Client selection */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Cliente</h2>
          <Select
            id="client"
            label="Selecione o cliente"
            options={[
              { value: '', label: 'Selecione...' },
              ...clients.map((c) => ({ value: c.id, label: c.name })),
            ]}
            value={clientId}
            onChange={(e) => setClientId(e.target.value)}
          />
        </Card>

        {/* Items */}
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Itens</h2>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="mr-1 h-4 w-4" />
              Adicionar Item
            </Button>
          </div>

          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="rounded-lg border border-gray-200 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Item {index + 1}</span>
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>

                {services.length > 0 && (
                  <div className="mb-3">
                    <Select
                      id={`service-${index}`}
                      label="Preencher a partir de serviço"
                      options={[
                        { value: '', label: 'Selecione (opcional)...' },
                        ...services.map((s) => ({
                          value: s.id,
                          label: `${s.name} — ${formatCurrency(s.price)}/${s.unit}`,
                        })),
                      ]}
                      onChange={(e) => fillFromService(index, e.target.value)}
                    />
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <Input
                    id={`name-${index}`}
                    label="Nome do item"
                    value={item.service_name}
                    onChange={(e) => updateItem(index, 'service_name', e.target.value)}
                    placeholder="Ex: Pintura de parede"
                    required
                  />
                  <Input
                    id={`desc-${index}`}
                    label="Descrição"
                    value={item.description}
                    onChange={(e) => updateItem(index, 'description', e.target.value)}
                    placeholder="Detalhes (opcional)"
                  />
                </div>
                <div className="mt-3 grid grid-cols-4 gap-3">
                  <Select
                    id={`unit-${index}`}
                    label="Unidade"
                    options={UNIT_OPTIONS}
                    value={item.unit}
                    onChange={(e) => updateItem(index, 'unit', e.target.value)}
                  />
                  <Input
                    id={`qty-${index}`}
                    label="Qtd"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', parseFloat(e.target.value) || 0)}
                  />
                  <Input
                    id={`price-${index}`}
                    label="Preço Unit."
                    type="number"
                    step="0.01"
                    min="0"
                    value={item.unit_price}
                    onChange={(e) => updateItem(index, 'unit_price', parseFloat(e.target.value) || 0)}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subtotal</label>
                    <p className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-semibold text-gray-900">
                      {formatCurrency(item.total)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-end border-t border-gray-200 pt-4">
            <p className="text-xl font-bold text-gray-900">
              Total: <span className="text-blue-600">{formatCurrency(total)}</span>
            </p>
          </div>
        </Card>

        {/* Conditions */}
        <Card>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Condições</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="payment_conditions"
              label="Condições de pagamento"
              placeholder="Ex: 50% entrada + 50% na entrega"
              value={paymentConditions}
              onChange={(e) => setPaymentConditions(e.target.value)}
            />
            <Input
              id="validity"
              label="Validade (dias)"
              type="number"
              min="1"
              value={validityDays}
              onChange={(e) => setValidityDays(parseInt(e.target.value) || 30)}
            />
          </div>
          <div className="mt-4">
            <Textarea
              id="notes"
              label="Observações"
              placeholder="Informações adicionais sobre o orçamento..."
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </Card>

        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}

        <div className="flex justify-end gap-3">
          <Button variant="outline" type="button" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" loading={loading}>
            Criar Orçamento
          </Button>
        </div>
      </form>
    </div>
  )
}
