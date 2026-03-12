import { Card } from '../ui/Card'
import { CopyButton } from '../ui/CopyButton'
import { Badge } from '../ui/Badge'

interface MJPromptCardProps {
  prompt: string
  label?: string
  metadata?: {
    shotType?: string
    chapter?: number
    scene?: number
    panel?: number
  }
}

export function MJPromptCard({ prompt, label = 'MJ提示词', metadata }: MJPromptCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-[#e8e6f0]">{label}</h4>
        <CopyButton text={prompt} label="复制" />
      </div>

      <div className="bg-[#232640] rounded-lg p-3 border border-[#232640] mb-3">
        <pre className="text-sm text-[#e8e6f0] whitespace-pre-wrap font-mono">
          {prompt}
        </pre>
      </div>

      {metadata && Object.keys(metadata).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {metadata.shotType && (
            <Badge variant="outline" size="sm">
              {metadata.shotType}
            </Badge>
          )}
          {metadata.chapter !== undefined && (
            <Badge variant="outline" size="sm">
              第 {metadata.chapter} 章
            </Badge>
          )}
          {metadata.scene !== undefined && (
            <Badge variant="outline" size="sm">
              场景 {metadata.scene}
            </Badge>
          )}
          {metadata.panel !== undefined && (
            <Badge variant="outline" size="sm">
              分镜 {metadata.panel}
            </Badge>
          )}
        </div>
      )}
    </Card>
  )
}