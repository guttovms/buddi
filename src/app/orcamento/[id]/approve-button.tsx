'use client'

import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { CheckCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export function ApproveButton({ budgetId }: { budgetId: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleApprove() {
    if (!confirm('Deseja aprovar este orçamento?')) return

    setLoading(true)
    await supabase
      .from('budgets')
      .update({
        status: 'aprovado',
        client_approved_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', budgetId)

    router.refresh()
  }

  return (
    <Button onClick={handleApprove} loading={loading} className="bg-green-600 hover:bg-green-700">
      <CheckCircle className="mr-2 h-4 w-4" />
      Aprovar Orçamento
    </Button>
  )
}
