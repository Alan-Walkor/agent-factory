import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
  glowColor?: string
  onClick?: () => void
}

export function Card({ children, className, hoverable = false, glowColor = 'from-[#6c5ce7]/20 to-[#00cec9]/20', onClick }: CardProps) {
  const baseClasses = 'bg-[#1c1f30] rounded-xl border border-[#232640] overflow-hidden'

  const cardContent = (
    <div className={cn(baseClasses, className)} onClick={onClick}>
      {children}
    </div>
  )

  if (hoverable) {
    return (
      <motion.div
        whileHover={{ y: -4 }}
        className={cn('transition-transform duration-200', `bg-gradient-to-r ${glowColor} p-0.5 rounded-xl`)}
      >
        {cardContent}
      </motion.div>
    )
  }

  return cardContent
}