'use client'

import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function PrintButton() {
  return (
    <Button
      variant="outline"
      onClick={() => window.print()}
      className="print:hidden"
    >
      <Download className="mr-2 h-4 w-4" />
      Baixar PDF
    </Button>
  )
}
