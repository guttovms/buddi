'use server'

import { createClient } from '@/lib/supabase/server'
import { updateProfile } from '@/lib/services/profiles'
import { revalidatePath } from 'next/cache'

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await updateProfile(supabase, user.id, {
    business_name: (formData.get('business_name') as string) || null,
    owner_name: (formData.get('owner_name') as string) || null,
    phone: (formData.get('phone') as string) || null,
    email: (formData.get('email') as string) || null,
    document: (formData.get('document') as string) || null,
    address: (formData.get('address') as string) || null,
    city: (formData.get('city') as string) || null,
    state: (formData.get('state') as string) || null,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/configuracoes')
}

export async function updateLogoAction(logoUrl: string | null) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await updateProfile(supabase, user.id, {
    logo_url: logoUrl,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/configuracoes')
}

export async function updateBrandColorAction(brandColor: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Não autenticado')

  const { error } = await updateProfile(supabase, user.id, {
    brand_color: brandColor,
  })

  if (error) throw new Error(error.message)
  revalidatePath('/configuracoes')
}
