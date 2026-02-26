'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Select } from '@/components/ui/select'
import { formatCurrency, UNIT_OPTIONS } from '@/lib/utils'
import { Service } from '@/types/database'
import { Pencil, Plus, Trash2, Wrench } from 'lucide-react'
import { useState } from 'react'
import { createServiceAction, deleteServiceAction, updateServiceAction } from './actions'

export function ServicosClient({ services }: { services: Service[] }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const [loading, setLoading] = useState(false)

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(service: Service) {
    setEditing(service)
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    if (editing) {
      await updateServiceAction(editing.id, formData)
    } else {
      await createServiceAction(formData)
    }

    setLoading(false)
    setModalOpen(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este serviço?')) return
    await deleteServiceAction(id)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Serviço
        </Button>
      </div>

      {services.length === 0 ? (
        <div className="mt-12 text-center">
          <Wrench className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum serviço cadastrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Cadastre seus serviços para agilizar a criação de orçamentos.
          </p>
          <Button className="mt-4" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Cadastrar Serviço
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card key={service.id} className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{service.name}</h3>
                {service.description && (
                  <p className="mt-1 text-sm text-gray-500">{service.description}</p>
                )}
                <p className="mt-2 text-lg font-semibold text-blue-600">
                  {formatCurrency(service.price)}{' '}
                  <span className="text-sm font-normal text-gray-400">/ {service.unit}</span>
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(service)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(service.id)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? 'Editar Serviço' : 'Novo Serviço'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            name="name"
            label="Nome do serviço"
            placeholder="Ex: Pintura de parede"
            defaultValue={editing?.name}
            required
          />
          <Input
            id="description"
            name="description"
            label="Descrição (opcional)"
            placeholder="Ex: Inclui material e mão de obra"
            defaultValue={editing?.description || ''}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select
              id="unit"
              name="unit"
              label="Unidade"
              options={UNIT_OPTIONS}
              defaultValue={editing?.unit || 'un'}
            />
            <Input
              id="price"
              name="price"
              label="Preço (R$)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              defaultValue={editing?.price}
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={loading}>
              {editing ? 'Salvar' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
