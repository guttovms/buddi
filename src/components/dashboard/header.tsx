'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { LogOut, User } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  userName?: string | null
}

export function Header({ userName }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div className="lg:ml-0 ml-12">
        <h2 className="text-sm font-medium text-gray-500">
          Olá, <span className="text-gray-900">{userName || 'Usuário'}</span>
        </h2>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" onClick={() => router.push('/configuracoes')}>
          <User className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}
