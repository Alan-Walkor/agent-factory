import { Badge } from './Badge'
import type { ProjectStatus } from '@/types'

interface StatusBadgeProps {
  status: ProjectStatus
  size?: 'sm' | 'md'
}

// 映射状态到标签和颜色
const statusConfig: Record<ProjectStatus, { label: string; color: string }> = {
  init: { label: '初始化', color: '#636e72' },
  worldbuilding: { label: '构建世界观', color: '#6c5ce7' },
  outlining: { label: '编排大纲', color: '#a29bfe' },
  scripting: { label: '编写剧本', color: '#74b9ff' },
  storyboarding: { label: '设计分镜', color: '#00cec9' },
  character_design: { label: '设计角色', color: '#fd79a8' },
  mj_prompt_ready: { label: '等待MJ生成', color: '#fdcb6e' },
  asset_collecting: { label: '回收资产', color: '#e17055' },
  post_production: { label: '后期制作', color: '#00b894' },
  completed: { label: '已完成', color: '#55efc4' },
}

export function StatusBadge({ status, size }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, color: '#636e72' }

  return (
    <Badge
      variant="soft"
      size={size}
      color={config.color}
    >
      {config.label}
    </Badge>
  )
}