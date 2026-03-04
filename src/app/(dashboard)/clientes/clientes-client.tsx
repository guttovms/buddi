'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MaskedInput } from '@/components/ui/masked-input'
import { Modal } from '@/components/ui/modal'
import { formatPhone, maskPhone, maskCpfCnpj } from '@/lib/utils'
import { Client } from '@/types/database'
import { Pencil, Plus, Search, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { createClientAction, deleteClientAction, updateClientAction } from './actions'

export function ClientesClient({ clients }: { clients: Client[] }) {
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Client | null>(null)
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = clients.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email?.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search)
  )

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
      <div className="mb-2 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-500">
            {clients.length} {clients.length === 1 ? 'cliente cadastrado' : 'clientes cadastrados'}
          </p>
        </div>
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
        <>
          <div className="relative mb-4 mt-4">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar clientes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2">
            {filtered.map((client) => (
              <div
                key={client.id}
                className="flex items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-600">
                    {client.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{client.name}</p>
                    <p className="text-sm text-gray-500">
                      {[client.email, client.city && client.state ? `${client.city}/${client.state}` : null]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {client.phone && (
                    <span className="hidden text-sm text-gray-500 sm:block">
                      {formatPhone(client.phone)}
                    </span>
                  )}
                  <button
                    onClick={() => openEdit(client)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(client.id)}
                    className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600"
                    title="Excluir"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {filtered.length === 0 && search && (
              <p className="py-8 text-center text-sm text-gray-500">
                Nenhum cliente encontrado para &quot;{search}&quot;
              </p>
            )}
          </div>
        </>
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
            label="Nome *"
            placeholder="Nome do cliente"
            defaultValue={editing?.name}
            required
          />
          <Input
            id="email"
            name="email"
            label="Email"
            type="email"
            placeholder="email@exemplo.com"
            defaultValue={editing?.email || ''}
          />
          <MaskedInput
            id="phone"
            name="phone"
            label="Telefone"
            placeholder="(00) 00000-0000"
            mask={maskPhone}
            defaultValue={editing?.phone || ''}
          />
          <MaskedInput
            id="document"
            name="document"
            label="CPF/CNPJ"
            placeholder="000.000.000-00"
            mask={maskCpfCnpj}
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
