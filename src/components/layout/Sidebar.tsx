import { Link, useLocation, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useUIStore } from '@/store/useUIStore'
import { useProjectStore } from '@/store/useProjectStore'
import clsx from 'clsx'
import {
  LayoutDashboard, PlusCircle, Globe, BookOpen,
  Users, Film, Image as ImageIcon, Scissors,
  ChevronLeft, ChevronRight
} from 'lucide-react'

const Sidebar = () => {
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const { currentProject } = useProjectStore()
  const location = useLocation()
  const params = useParams()

  const routeNames: Record<string, string> = {
    '/': '仪表盘',
    '/create': '新建项目',
    [`/project/${params.id}`]: '世界观',
    [`/project/${params.id}/story`]: '故事大纲',
    [`/project/${params.id}/characters`]: '角色管理',
    [`/project/${params.id}/storyboard`]: '分镜工作台',
    [`/project/${params.id}/assets`]: '资产管理',
    [`/project/${params.id}/post`]: '后期制作',
  }

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/'
    return location.pathname.startsWith(path)
  }

  const navItemClass = (active: boolean) => clsx(
    'flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-200 group relative',
    active
      ? 'bg-[#6c5ce7]/10 text-white'
      : 'text-[#9694a8] hover:bg-[#232640] hover:text-[#e8e6f0]'
  )

  const iconClass = (active: boolean) => clsx(
    'w-5 h-5 flex-shrink-0',
    active ? 'text-[#6c5ce7]' : 'group-hover:text-[#6c5ce7] text-[#6c5ce7]/60'
  )

  const globalNav = [
    { path: '/', label: '仪表盘', icon: LayoutDashboard },
    { path: '/create', label: '新建项目', icon: PlusCircle },
  ]

  const projectNav = [
    { path: `/project/${params.id}`, label: '世界观', icon: Globe },
    { path: `/project/${params.id}/story`, label: '故事大纲', icon: BookOpen },
    { path: `/project/${params.id}/characters`, label: '角色管理', icon: Users },
    { path: `/project/${params.id}/storyboard`, label: '分镜工作台', icon: Film },
    { path: `/project/${params.id}/assets`, label: '资产管理', icon: ImageIcon },
    { path: `/project/${params.id}/post`, label: '后期制作', icon: Scissors },
  ]

  return (
    <motion.aside
      className={clsx(
        'fixed left-0 top-0 h-screen bg-[#0f1019] border-r border-[#1c1f30] z-40 flex flex-col',
        sidebarCollapsed ? 'w-18' : 'w-64'
      )}
      initial={false}
      animate={{ width: sidebarCollapsed ? 72 : 260 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
    >
      {/* 顶部 Logo 区域 */}
      <div className="flex items-center justify-between p-4 border-b border-[#1c1f30]">
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="font-serif text-xl font-bold text-[#e8e6f0]"
            >
              AI剧场工厂
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-[#232640] text-[#9694a8] hover:text-[#e8e6f0]"
        >
          {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* 导航菜单 */}
      <nav className="flex-1 overflow-y-auto p-3">
        <div className="space-y-1">
          {globalNav.map(({ path, label, icon: Icon }) => (
            <Link key={path} to={path} className={navItemClass(isActive(path))}>
              <Icon className={iconClass(isActive(path))} />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{ opacity: 1, width: 'auto' }}
                    exit={{ opacity: 0, width: 0 }}
                    className="truncate"
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
              {isActive(path) && (
                <motion.div
                  layoutId="sidebar-highlight"
                  className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#6c5ce7] to-[#00cec9]"
                />
              )}
            </Link>
          ))}
        </div>

        {/* 项目导航分隔线 */}
        {currentProject && (
          <>
            <div className="my-4 border-t border-[#1c1f30]"></div>
            <div className="space-y-1">
              {projectNav.map(({ path, label, icon: Icon }) => (
                <Link key={path} to={path} className={navItemClass(isActive(path))}>
                  <Icon className={iconClass(isActive(path))} />
                  <AnimatePresence>
                    {!sidebarCollapsed && (
                      <motion.span
                        initial={{ opacity: 0, width: 0 }}
                        animate={{ opacity: 1, width: 'auto' }}
                        exit={{ opacity: 0, width: 0 }}
                        className="truncate"
                      >
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {isActive(path) && (
                    <motion.div
                      layoutId="sidebar-highlight"
                      className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[#6c5ce7] to-[#00cec9]"
                    />
                  )}
                </Link>
              ))}
            </div>
          </>
        )}
      </nav>

      {/* 项目状态摘要（仅在非折叠状态下显示） */}
      {currentProject && !sidebarCollapsed && (
        <div className="p-4 border-t border-[#1c1f30]">
          <div className="bg-[#1c1f30] rounded-lg p-3">
            <h3 className="text-sm font-medium text-[#e8e6f0] truncate">{currentProject.name}</h3>
            <p className="text-xs text-[#9694a8] mt-1 capitalize">{currentProject.status}</p>
            <div className="flex justify-between text-xs text-[#9694a8] mt-2">
              <span>{currentProject.characters.length} 角色</span>
              <span>{currentProject.chapter_scripts.length} 章节</span>
              <span>{currentProject.storyboard_panels.length} 分镜</span>
            </div>
          </div>
        </div>
      )}
    </motion.aside>
  )
}

export default Sidebar