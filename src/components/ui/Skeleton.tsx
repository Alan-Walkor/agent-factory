import { cn } from '@/lib/utils'

interface SkeletonProps {
  width?: string
  height?: string
  rounded?: boolean
  className?: string
}

export function Skeleton({ width, height, rounded = false, className }: SkeletonProps) {
  return (
    <div
      className={cn(
        'animate-pulse bg-[#232640] rounded',
        rounded ? 'rounded-full' : 'rounded-lg',
        className
      )}
      style={{
        width: width || '100%',
        height: height || '1rem'
      }}
    />
  )
}