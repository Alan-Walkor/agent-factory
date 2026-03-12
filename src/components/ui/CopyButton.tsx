import { useState, useEffect } from 'react'
import { Copy, Check } from 'lucide-react'
import { Button } from './Button'

interface CopyButtonProps {
  text: string
  label?: string
  className?: string
}

export function CopyButton({ text, label = '复制', className }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleClick = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy text: ', err)
    }
  }

  return (
    <Button
      variant="secondary"
      size="sm"
      onClick={handleClick}
      className={className}
    >
      {copied ? (
        <>
          <Check className="w-4 h-4 mr-2" />
          已复制
        </>
      ) : (
        <>
          <Copy className="w-4 h-4 mr-2" />
          {label}
        </>
      )}
    </Button>
  )
}