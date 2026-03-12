import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  color?: string
  variant?: 'solid' | 'outline' | 'soft'
  size?: 'sm' | 'md'
}

export function Badge({ children, color, variant = 'solid', size = 'md' }: BadgeProps) {
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  // Build classes dynamically based on color and variant
  const baseClasses = 'inline-flex items-center rounded-full font-medium'

  // Construct specific classes for each variant with potential color
  let variantClasses = ''
  if (variant === 'solid') {
    variantClasses = color
      ? 'text-white'  // We'll use inline style for background
      : 'bg-[#6c5ce7] text-white'
  } else if (variant === 'outline') {
    variantClasses = color
      ? 'border'  // We'll use inline style for text and border
      : 'text-[#6c5ce7] border border-[#6c5ce7]'
  } else { // soft
    variantClasses = color
      ? 'border'  // We'll use inline style for bg, text and border
      : 'bg-[#6c5ce7]/10 text-[#6c5ce7] border border-[#6c5ce7]/20'
  }

  // Combine classes
  const combinedClasses = cn(baseClasses, sizeClasses, variantClasses)

  // Apply inline styles when color is provided
  if (color) {
    if (variant === 'solid') {
      return (
        <span className={combinedClasses} style={{ backgroundColor: color }}>
          {children}
        </span>
      )
    } else if (variant === 'outline') {
      return (
        <span
          className={combinedClasses}
          style={{ color: color, borderColor: color }}
        >
          {children}
        </span>
      )
    } else { // soft
      return (
        <span
          className={combinedClasses}
          style={{
            backgroundColor: `${color}1a`, // 10% opacity (1a in hex)
            color: color,
            borderColor: `${color}33` // 20% opacity (33 in hex)
          }}
        >
          {children}
        </span>
      )
    }
  }

  // Return with static classes when no color is provided
  return (
    <span className={combinedClasses}>
      {children}
    </span>
  )
}