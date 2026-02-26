import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { LucideIcon } from 'lucide-react'

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  color?: string
}

export function StatsCard({ title, value, icon: Icon, color = 'text-blue-600' }: StatsCardProps) {
  return (
    <Card className="flex items-center gap-4">
      <div className={cn('rounded-lg bg-gray-50 p-3', color)}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{title}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </Card>
  )
}
