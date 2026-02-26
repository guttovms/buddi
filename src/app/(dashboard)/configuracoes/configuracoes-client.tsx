'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Profile } from '@/types/database'
import { useState } from 'react'
import { updateProfileAction } from './actions'

interface Props {
  profile: Profile | null
  userEmail: string
}

export function ConfiguracoesClient({ profile, userEmail }: Props) {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setSaved(false)
    const formData = new FormData(e.currentTarget)
    await updateProfileAction(formData)
    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <Badge className={profile?.plan === 'pro' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}>
          Plano {profile?.plan === 'pro' ? 'Pro' : 'Grátis'}
        </Badge>
      </div>

      <Card className="max-w-2xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Dados do Negócio</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            id="business_name"
            name="business_name"
            label="Nome do negócio"
            placeholder="Ex: Silva Pinturas"
            defaultValue={profile?.business_name || ''}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="owner_name"
              name="owner_name"
              label="Seu nome"
              placeholder="João Silva"
              defaultValue={profile?.owner_name || ''}
            />
            <Input
              id="phone"
              name="phone"
              label="Telefone"
              placeholder="(00) 00000-0000"
              defaultValue={profile?.phone || ''}
            />
          </div>
          <Input
            id="email"
            name="email"
            label="Email de contato"
            type="email"
            defaultValue={profile?.email || userEmail}
          />
          <Input
            id="document"
            name="document"
            label="CPF/CNPJ"
            placeholder="000.000.000-00"
            defaultValue={profile?.document || ''}
          />
          <Input
            id="address"
            name="address"
            label="Endereço"
            placeholder="Rua, número, bairro"
            defaultValue={profile?.address || ''}
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="city"
              name="city"
              label="Cidade"
              defaultValue={profile?.city || ''}
            />
            <Input
              id="state"
              name="state"
              label="Estado"
              placeholder="SP"
              defaultValue={profile?.state || ''}
            />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" loading={loading}>
              Salvar Alterações
            </Button>
            {saved && <span className="text-sm text-green-600">Salvo com sucesso!</span>}
          </div>
        </form>
      </Card>
    </div>
  )
}
