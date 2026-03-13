import { useLocation } from 'react-router-dom'
import { useProjectStore } from '@/store/useProjectStore'
import { useUIStore } from '@/store/useUIStore'
import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

const Header = () => {
  const location = useLocation()
  const { currentProject, isAgentRunning, agentProgress } = useProjectStore()
  const { sidebarCollapsed } = useUIStore()

  const routeNames: Record<string, string> = {
    '': '仪表盘',
    'create': '新建项目',
    'story': '故事大纲',
    'characters': '角色管理',
    'storyboard': '分镜工作台',
    'assets': '资产管理',
    'post': '后期制作',
  }

  const generateBreadcrumb = () => {
    const pathParts = location.pathname.split('/').filter(Boolean)
    const breadcrumbs = []

    if (pathParts[0] === 'project' && pathParts[1]) {
      // 项目路径
      breadcrumbs.push('仪表盘')
      breadcrumbs.push(currentProject?.name || '项目')

      if (pathParts[2]) {
        const routeKey = pathParts[2]
        breadcrumbs.push(routeNames[routeKey] || routeKey)
      }
    } else {
      // 非项目路径
      const routeKey = pathParts[0] || ''
      breadcrumbs.push(routeNames[routeKey] || '仪表盘')
    }

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumb()

  return (
    <header
      className="fixed top-0 left-0 right-0 h-16 bg-[#0f1019]/80 backdrop-blur-xl border-b border-[#1c1f30] z-30"
      style={{ paddingLeft: `${sidebarCollapsed ? 72 : 260}px` }}
    >
      <div className="h-full flex items-center justify-between px-6">
        {/* 左侧面包屑 */}
        <div className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={index} className="flex items-center">
              {index > 0 && <span className="mx-2 text-[#5c5a6e]">/</span>}
              <span
                className={`${
                  index === breadcrumbs.length - 1
                    ? 'text-[#e8e6f0] font-medium'
                    : 'text-[#9694a8] hover:text-[#e8e6f0] cursor-pointer'
                }`}
              >
                {crumb}
              </span>
            </div>
          ))}
        </div>

        {/* 右侧状态 */}
        <div className="flex items-center space-x-4">
          {/* 项目状态标签 */}
          {currentProject && (
            <div className="px-3 py-1 bg-[#1c1f30] rounded-full text-xs text-[#9694a8] capitalize">
              {currentProject.status}
            </div>
          )}

          {/* Agent运行指示器 */}
          {isAgentRunning && (
            <motion.div
              className="flex items-center space-x-2 px-3 py-1.5 bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] rounded-full text-white text-xs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                background: 'linear-gradient(90deg, #6c5ce7, #00cec9, #6c5ce7)',
                backgroundSize: '200% 200%',
                animation: 'gradientShift 3s linear infinite',
              }}
            >
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>{agentProgress}</span>
            </motion.div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header