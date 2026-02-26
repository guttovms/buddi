'use client'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { formatPhone } from '@/lib/utils'
import { Client } from '@/types/database'
import { Pencil, Phone, Plus, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { createClientAction, deleteClientAction, updateClientAction } from './actions'

export function ClientesClient({ clients }: { clients: Client[] }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [loading, setLoading] = useState(false)

  function openCreate() {
    setEditing(null)
    setModalOpen(true)
  }

  function openEdit(client: Client) {
    setEditing(client)
    setModalOpen(true)
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)

    if (editing) {
      await updateClientAction(editing.id, formData)
    } else {
      await createClientAction(formData)
    }

    setLoading(false)
    setModalOpen(false)
  }

  async function handleDelete(id: string) {
    if (!confirm('Tem certeza que deseja excluir este cliente?')) return
    await deleteClientAction(id)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Cliente
        </Button>
      </div>

      {clients.length === 0 ? (
        <div className="mt-12 text-center">
          <Users className="mx-auto h-12 w-12 text-gray-300" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">Nenhum cliente cadastrado</h3>
          <p className="mt-1 text-sm text-gray-500">
            Cadastre seus clientes para criar orçamentos mais rápido.
          </p>
          <Button className="mt-4" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" />
            Cadastrar Cliente
          </Button>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {clients.map((client) => (
            <Card key={client.id} className="flex items-start justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{client.name}</h3>
                {client.phone && (
                  <p className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                    <Phone className="h-3 w-3" />
                    {formatPhone(client.phone)}
                  </p>
                )}
                {client.email && (
                  <p className="mt-0.5 text-sm text-gray-500">{client.email}</p>
                )}
                {client.city && client.state && (
                  <p className="mt-0.5 text-sm text-gray-400">
                    {client.city} - {client.state}
                  </p>
                )}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => openEdit(client)}
                  className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(client.id)}
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
        title={editing ? 'Editar Cliente' : 'Novo Cliente'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="name"
            name="name"
            label="Nome completo"
            placeholder="Ex: João da Silva"
            defaultValue={editing?.name}
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="phone"
              name="phone"
              label="Telefone"
              placeholder="(00) 00000-0000"
              defaultValue={editing?.phone || ''}
            />
            <Input
              id="email"
              name="email"
              label="Email"
              type="email"
              placeholder="email@exemplo.com"
              defaultValue={editing?.email || ''}
            />
          </div>
          <Input
            id="document"
            name="document"
            label="CPF/CNPJ"
            placeholder="000.000.000-00"
            defaultValue={editing?.document || ''}
          />
          <Input
            id="address"
            name="address"
            label="Endereço"
            placeholder="Rua, número, bairro"
            defaultValue={editing?.address || ''}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="city"
              name="city"
              label="Cidade"
              defaultValue={editing?.city || ''}
            />
            <Input
              id="state"
              name="state"
              label="Estado"
              placeholder="SP"
              defaultValue={editing?.state || ''}
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
