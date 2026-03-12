import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProjectStore } from '@/store/useProjectStore'
import { useUIStore } from '@/store/useUIStore'
import {
  PlusCircle, FileText, Loader2, Clock, CheckCircle,
  ArrowRight, Trash2, Eye
} from 'lucide-react'

const Dashboard = () => {
  const navigate = useNavigate()
  const { projects, fetchProjects, isLoading, deleteProject } = useProjectStore()
  const { addToast } = useUIStore()

  useEffect(() => {
    fetchProjects()
  }, [])

  // 统计数据
  const stats = {
    total: projects.length,
    inProgress: projects.filter(p => !['init', 'completed'].includes(p.status)).length,
    pending: projects.filter(p => p.status === 'mj_prompt_ready').length,
    completed: projects.filter(p => p.status === 'completed').length,
  }

  // 状态配置
  const statusConfig: Record<string, { label: string; color: string }> = {
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

  // 删除处理
  const handleDelete = async (id: string, name: string) => {
    if (!window.confirm(`确定要删除项目「${name}」吗？此操作不可撤销。`)) return
    await deleteProject(id)
    addToast('success', `项目「${name}」已删除`)
  }

  // 项目卡片动画配置
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Hero 区域 */}
      <div
        className="relative mb-8 p-8 rounded-2xl bg-gradient-to-br from-[#161825]/50 to-[#1c1f30]/50 border border-[#232640] overflow-hidden"
        style={{
          background: `
            radial-gradient(circle at 10% 20%, rgba(108, 92, 231, 0.1) 0%, transparent 20%),
            radial-gradient(circle at 90% 80%, rgba(0, 206, 201, 0.1) 0%, transparent 20%),
            linear-gradient(to bottom, #161825, #1c1f30)
          `
        }}
      >
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] bg-clip-text text-transparent mb-2">
              AI动漫剧场工厂
            </h1>
            <p className="text-[#9694a8] text-lg">
              多Agent驱动的动漫自动化生产流水线
            </p>
          </div>
          <Link
            to="/create"
            className="mt-4 md:mt-0 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] text-white rounded-full hover:shadow-lg hover:shadow-[#6c5ce7]/20 transition-all duration-300 group"
          >
            <PlusCircle className="w-5 h-5" />
            <span>创建新项目</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* 统计卡片行 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          whileHover={{ y: -4 }}
          className="bg-[#1c1f30] rounded-xl p-5 border border-[#232640] relative overflow-hidden"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-[#6c5ce7]/10">
              <FileText className="w-6 h-6 text-[#6c5ce7]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#e8e6f0]">{stats.total}</div>
              <div className="text-sm text-[#9694a8]">项目总数</div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#6c5ce7] to-[#00cec9]"></div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-[#1c1f30] rounded-xl p-5 border border-[#232640] relative overflow-hidden"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-[#00cec9]/10">
              <Loader2 className="w-6 h-6 text-[#00cec9] animate-spin" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#e8e6f0]">{stats.inProgress}</div>
              <div className="text-sm text-[#9694a8]">进行中</div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00cec9] to-[#00cec9]/0"></div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-[#1c1f30] rounded-xl p-5 border border-[#232640] relative overflow-hidden"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-[#fdcb6e]/10">
              <Clock className="w-6 h-6 text-[#fdcb6e]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#e8e6f0]">{stats.pending}</div>
              <div className="text-sm text-[#9694a8]">待处理</div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#fdcb6e] to-[#fdcb6e]/0"></div>
        </motion.div>

        <motion.div
          whileHover={{ y: -4 }}
          className="bg-[#1c1f30] rounded-xl p-5 border border-[#232640] relative overflow-hidden"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-[#55efc4]/10">
              <CheckCircle className="w-6 h-6 text-[#55efc4]" />
            </div>
            <div>
              <div className="text-2xl font-bold text-[#e8e6f0]">{stats.completed}</div>
              <div className="text-sm text-[#9694a8]">已完成</div>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#55efc4] to-[#55efc4]/0"></div>
        </motion.div>
      </div>

      {/* 项目列表 */}
      <div>
        <h2 className="text-xl font-semibold text-[#e8e6f0] mb-4">项目列表</h2>

        {projects.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🎬</div>
            <h3 className="text-lg font-medium text-[#e8e6f0] mb-2">还没有项目</h3>
            <p className="text-[#9694a8] mb-6">开始创建你的第一部作品吧</p>
            <Link
              to="/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] text-white rounded-full hover:shadow-lg hover:shadow-[#6c5ce7]/20 transition-all duration-300"
            >
              <PlusCircle className="w-5 h-5" />
              <span>创建新项目</span>
            </Link>
          </div>
        ) : (
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {projects.map((project) => (
              <motion.div
                key={project.id}
                variants={item}
                className="bg-[#1c1f30] rounded-xl border border-[#232640] overflow-hidden hover:border-[#2d2f45] transition-colors duration-300"
              >
                <div
                  className="h-1 w-full"
                  style={{ backgroundColor: statusConfig[project.status]?.color || '#636e72' }}
                ></div>

                <div className="p-5">
                  <h3 className="text-lg font-medium text-[#e8e6f0] mb-2 truncate">{project.name}</h3>

                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className="px-2 py-1 text-xs rounded-full"
                      style={{
                        backgroundColor: `${statusConfig[project.status]?.color}20`,
                        color: statusConfig[project.status]?.color,
                        border: `1px solid ${statusConfig[project.status]?.color}30`
                      }}
                    >
                      {statusConfig[project.status]?.label || project.status}
                    </span>
                  </div>

                  <p className="text-xs text-[#9694a8] mb-4">
                    创建于 {new Date(project.created_at).toLocaleDateString('zh-CN')}
                  </p>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/project/${project.id}`}
                      className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-[#232640] hover:bg-[#2d2f45] text-[#e8e6f0] rounded-lg transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>查看详情</span>
                    </Link>
                    <button
                      onClick={() => handleDelete(project.id, project.name)}
                      className="p-2 text-[#e8e6f0]/60 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Dashboard