'use client'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { MaskedInput } from '@/components/ui/masked-input'
import { createClient } from '@/lib/supabase/client'
import { maskPhone, maskCpfCnpj, isPro, formatDate } from '@/lib/utils'
import { Profile } from '@/types/database'
import { Camera, Crown, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { updateProfileAction, updateLogoAction, updateBrandColorAction } from './actions'

interface Props {
  profile: Profile | null
  userEmail: string
}

export function ConfiguracoesClient({ profile, userEmail }: Props) {
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [logoUrl, setLogoUrl] = useState(profile?.logo_url || '')
  const [uploading, setUploading] = useState(false)
  const [brandColor, setBrandColor] = useState(profile?.brand_color || '#2563eb')
  const [colorSaved, setColorSaved] = useState(false)
  const [upgrading, setUpgrading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Selecione uma imagem (PNG, JPG, etc.)')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 2MB.')
      return
    }

    setUploading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const ext = file.name.split('.').pop()
      const filePath = `${user.id}/logo.${ext}`

      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(filePath)

      const urlWithCacheBust = `${publicUrl}?t=${Date.now()}`
      setLogoUrl(urlWithCacheBust)
      await updateLogoAction(publicUrl)
    } catch (err) {
      alert('Erro ao enviar logo. Tente novamente.')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  async function handleRemoveLogo() {
    setUploading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Não autenticado')

      const { data: files } = await supabase.storage
        .from('logos')
        .list(user.id)

      if (files && files.length > 0) {
        await supabase.storage
          .from('logos')
          .remove(files.map((f) => `${user.id}/${f.name}`))
      }

      setLogoUrl('')
      await updateLogoAction(null)
    } catch (err) {
      alert('Erro ao remover logo.')
      console.error(err)
    } finally {
      setUploading(false)
    }
  }

  async function handleUpgrade() {
    setUpgrading(true)
    try {
      const res = await fetch('/api/checkout', { method: 'POST' })
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Erro ao iniciar checkout. Tente novamente.')
      }
    } catch {
      alert('Erro ao iniciar checkout. Tente novamente.')
    } finally {
      setUpgrading(false)
    }
  }

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
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Plano</h2>
        {isPro(profile) ? (
          <div className="flex items-center gap-3">
            <Crown className="h-5 w-5 text-yellow-500" />
            <div>
              <p className="font-medium text-gray-900">Plano Pro ativo</p>
              <p className="text-sm text-gray-500">
                Válido até {profile?.pro_until ? formatDate(profile.pro_until) : '—'}
              </p>
            </div>
            <Button variant="outline" size="sm" className="ml-auto" onClick={handleUpgrade} loading={upgrading}>
              Renovar
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <div>
              <p className="font-medium text-gray-900">Plano Grátis</p>
              <p className="text-sm text-gray-500">Limite de 3 orçamentos por mês</p>
            </div>
            <Button className="ml-auto" onClick={handleUpgrade} loading={upgrading}>
              <Crown className="mr-2 h-4 w-4" />
              Assinar Pro — R$19,90/mês
            </Button>
          </div>
        )}
      </Card>

      <Card className="mt-4 max-w-2xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Logo do Negócio</h2>
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => !uploading && fileInputRef.current?.click()}
            className="relative flex h-28 w-28 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-blue-400 hover:bg-blue-50"
          >
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt="Logo"
                style={{ maxWidth: '96px', maxHeight: '96px' }}
                className="object-contain"
                onError={() => setLogoUrl('')}
              />
            ) : (
              <Camera className="h-8 w-8 text-gray-400" />
            )}
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/70">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              </div>
            )}
          </button>
          <div>
            <p className="text-sm font-medium text-gray-700">
              {logoUrl ? 'Clique na logo para trocar' : 'Clique para enviar'}
            </p>
            <p className="text-xs text-gray-500">PNG, JPG ou SVG. Máx 2MB.</p>
            {logoUrl && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                disabled={uploading}
                className="mt-1 flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-3 w-3" />
                Remover logo
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
        </div>
      </Card>

      <Card className="mt-4 max-w-2xl">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">Cor do Orçamento</h2>
        <p className="mb-3 text-sm text-gray-500">
          Escolha a cor de destaque do seu orçamento. Ela aparecerá no total, cabeçalho e detalhes.
        </p>
        <div className="flex items-center gap-4">
          <div className="flex gap-2">
            {['#2563eb', '#059669', '#dc2626', '#7c3aed', '#d97706', '#0891b2', '#374151'].map((color) => (
              <button
                key={color}
                type="button"
                onClick={async () => {
                  setBrandColor(color)
                  setColorSaved(false)
                  await updateBrandColorAction(color)
                  setColorSaved(true)
                  setTimeout(() => setColorSaved(false), 2000)
                }}
                className={`h-8 w-8 rounded-full border-2 transition-transform hover:scale-110 ${
                  brandColor === color ? 'border-gray-900 scale-110' : 'border-transparent'
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={brandColor}
              onChange={async (e) => {
                setBrandColor(e.target.value)
              }}
              onBlur={async () => {
                setColorSaved(false)
                await updateBrandColorAction(brandColor)
                setColorSaved(true)
                setTimeout(() => setColorSaved(false), 2000)
              }}
              className="h-8 w-8 cursor-pointer rounded border-0 bg-transparent p-0"
            />
            <span className="text-xs text-gray-500">Personalizar</span>
          </div>
          {colorSaved && <span className="text-xs text-green-600">Salvo!</span>}
        </div>
        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200">
          <div className="px-4 py-2 text-xs font-medium text-white" style={{ backgroundColor: brandColor }}>
            Pré-visualização
          </div>
          <div className="flex items-center justify-between px-4 py-3">
            <span className="text-sm text-gray-600">Total do orçamento</span>
            <span className="text-lg font-bold" style={{ color: brandColor }}>R$ 1.500,00</span>
          </div>
        </div>
      </Card>

      <Card className="mt-4 max-w-2xl">
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
            <MaskedInput
              id="phone"
              name="phone"
              label="Telefone"
              placeholder="(00) 00000-0000"
              mask={maskPhone}
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
          <MaskedInput
            id="document"
            name="document"
            label="CPF/CNPJ"
            placeholder="000.000.000-00"
            mask={maskCpfCnpj}
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
