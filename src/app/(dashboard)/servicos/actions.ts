'use server'

import { createClient } from '@/lib/supabase/server'
import { createService, deleteService, updateService } from '@/lib/services/services'
import { revalidatePath } from 'next/cache'

export async function createServiceAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await createService(supabase, {
    user_id: user.id,
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || undefined,
    unit: formData.get('unit') as string,
    price: parseFloat(formData.get('price') as string),
  })

  if (error) throw new Error(error.message)
  revalidatePath('/servicos')
}

export async function updateServiceAction(id: string, formData: FormData) {
  const supabase = await createClient()

  const { error } = await updateService(supabase, id, {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || undefined,
    unit: formData.get('unit') as string,
    price: parseFloat(formData.get('price') as string),
  })

  if (error) throw new Error(error.message)
  revalidatePath('/servicos')
}

export async function deleteServiceAction(id: string) {
  const supabase = await createClient()
  const { error } = await deleteService(supabase, id)
  if (error) throw new Error(error.message)
  revalidatePath('/servicos')
}
