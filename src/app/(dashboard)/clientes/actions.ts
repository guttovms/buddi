'use server'

import { createClient } from '@/lib/supabase/server'
import { createClientRecord, deleteClient, updateClient } from '@/lib/services/clients'
import { revalidatePath } from 'next/cache'

export async function createClientAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await createClientRecord(supabase, {
    user_id: user.id,
    name: formData.get('name') as string,
    phone: (formData.get('phone') as string) || undefined,
    email: (formData.get('email') as string) || undefined,
    document: (formData.get('document') as string) || undefined,
    address: (formData.get('address') as string) || undefined,
    city: (formData.get('city') as string) || undefined,
    state: (formData.get('state') as string) || undefined,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/clientes')
}

export async function updateClientAction(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await updateClient(supabase, id, {
    name: formData.get('name') as string,
    phone: (formData.get('phone') as string) || undefined,
    email: (formData.get('email') as string) || undefined,
    document: (formData.get('document') as string) || undefined,
    address: (formData.get('address') as string) || undefined,
    city: (formData.get('city') as string) || undefined,
    state: (formData.get('state') as string) || undefined,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/clientes')
}

export async function deleteClientAction(id: string) {
  const supabase = await createClient()
  const { error } = await deleteClient(supabase, id)
  if (error) throw new Error(error.message)
  revalidatePath('/clientes')
}
