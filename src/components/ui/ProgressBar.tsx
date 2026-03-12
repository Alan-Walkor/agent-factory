import { cn } from '@/lib/utils'

interface ProgressBarProps {
  value: number     // 0-100
  label?: string
  showPercentage?: boolean
  color?: string    // 渐变色或单色
}

export function ProgressBar({ value, label, showPercentage = true, color }: ProgressBarProps) {
  const percentage = Math.min(Math.max(value, 0), 100)
  const colorStyle = color ? { background: `linear-gradient(to right, ${color}, ${color})` } : {}

  return (
    <div className="w-full">
      {label && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-[#e8e6f0]">{label}</span>
          {showPercentage && (
            <span className="text-sm text-[#9694a8]">{percentage}%</span>
          )}
        </div>
      )}
      <div className="w-full bg-[#232640] rounded-full h-2.5">
        <div
          className={cn(
            'h-2.5 rounded-full bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] transition-all duration-500 ease-out'
          )}
          style={{
            ...colorStyle,
            width: `${percentage}%`
          }}
        />
      </div>
      {!label && showPercentage && (
        <div className="text-right mt-1">
          <span className="text-xs text-[#9694a8]">{percentage}%</span>
        </div>
      )}
    </div>
  )
}