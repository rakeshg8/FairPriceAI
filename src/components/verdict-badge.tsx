import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface VerdictBadgeProps {
  verdict: 'Fair Price' | 'Overpriced' | 'Underpriced'
}

export function VerdictBadge({ verdict }: VerdictBadgeProps) {
  const verdictStyles = {
    'Fair Price': 'bg-green-500/20 text-green-700 border-green-500/30 hover:bg-green-500/30 dark:text-green-400 dark:border-green-500/40',
    'Overpriced': 'bg-red-500/20 text-red-700 border-red-500/30 hover:bg-red-500/30 dark:text-red-400 dark:border-red-500/40',
    'Underpriced': 'bg-blue-500/20 text-blue-700 border-blue-500/30 hover:bg-blue-500/30 dark:text-blue-400 dark:border-blue-500/40',
  }

  return (
    <Badge
      variant="outline"
      className={cn(
        'font-semibold transition-colors',
        verdictStyles[verdict] || 'bg-secondary'
      )}
    >
      {verdict}
    </Badge>
  )
}
