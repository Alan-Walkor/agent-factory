import { cn } from '@/lib/utils'
import { Button } from './Button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: { label: string; onClick: () => void }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {icon && <div className="mx-auto mb-4">{icon}</div>}
      <h3 className="text-lg font-medium text-[#e8e6f0] mb-2">{title}</h3>
      {description && <p className="text-[#9694a8] mb-6">{description}</p>}
      {action && (
        <Button variant="secondary" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}