import { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProjectStore } from '@/store/useProjectStore'
import { Globe, MapPin, Sparkles, Shield, BookOpen, Users, ArrowRight } from 'lucide-react'

const WorldView = () => {
  const { id } = useParams<{ id: string }>()
  const { currentProject, fetchProject, isLoading } = useProjectStore()

  useEffect(() => {
    if (id) {
      fetchProject(id)
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="flex-1 p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-[#1c1f30] rounded w-1/3 mb-6"></div>
          <div className="h-4 bg-[#1c1f30] rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="h-32 bg-[#1c1f30] rounded"></div>
            <div className="h-32 bg-[#1c1f30] rounded"></div>
          </div>
          <div className="h-64 bg-[#1c1f30] rounded"></div>
        </div>
      </div>
    )
  }

  if (!currentProject || !currentProject.world_setting) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <Globe className="w-16 h-16 text-[#6c5ce7]/50 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-[#e8e6f0] mb-2">暂无世界观</h2>
          <p className="text-[#9694a8] mb-6">此项目尚未创建世界观设定</p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#232640] text-[#e8e6f0] rounded-lg hover:bg-[#2d2f45] transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>返回项目列表</span>
          </Link>
        </div>
      </div>
    )
  }

  const { world_setting } = currentProject

  return (
    <div className="flex-1 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <h1 className="text-3xl font-serif font-bold text-[#e8e6f0]">{world_setting.name}</h1>
          <span className="px-3 py-1 bg-[#6c5ce7]/10 text-[#6c5ce7] text-sm rounded-full border border-[#6c5ce7]/20">
            {world_setting.era}
          </span>
        </div>

        <p className="text-[#9694a8] mb-6">{world_setting.visual_style}</p>

        {/* 色彩条 */}
        <div className="flex flex-wrap gap-2 mb-8">
          {world_setting.color_palette.map((color, index) => (
            <div
              key={index}
              className="w-10 h-10 rounded-full border border-[#232640]"
              style={{ backgroundColor: color }}
              title={color}
            />
          ))}
        </div>
      </motion.div>

      {/* 内容区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="card-glow bg-[#1c1f30] rounded-xl p-6 border border-[#232640]"
        >
          <h2 className="text-lg font-medium text-[#e8e6f0] mb-4 flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#6c5ce7]" />
            世界概述
          </h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-[#9694a8] mb-1">世界描述</h3>
              <p className="text-[#e8e6f0] leading-relaxed">{world_setting.description || '尚未设定'}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-[#9694a8] mb-1">地理环境</h3>
              <p className="text-[#e8e6f0] leading-relaxed">{world_setting.geography || '尚未设定'}</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="card-glow bg-[#1c1f30] rounded-xl p-6 border border-[#232640]"
        >
          <h2 className="text-lg font-medium text-[#e8e6f0] mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-[#00cec9]" />
            关键地点
          </h2>
          <div className="space-y-2">
            {world_setting.key_locations.length > 0 ? (
              world_setting.key_locations.map((location, index) => (
                <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-[#232640]/50">
                  <span className="w-6 h-6 flex items-center justify-center bg-[#6c5ce7]/10 text-[#6c5ce7] text-xs rounded-full">
                    {index + 1}
                  </span>
                  <span className="text-[#e8e6f0]">{location}</span>
                </div>
              ))
            ) : (
              <p className="text-[#9694a8] italic">尚未设定</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* 魔法体系和社会结构 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card-glow bg-[#1c1f30] rounded-xl p-6 border border-[#232640]"
        >
          <h2 className="text-lg font-medium text-[#e8e6f0] mb-4 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-[#fdcb6e]" />
            魔法体系
          </h2>
          {world_setting.magic_system ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-[#9694a8] mb-1">名称</h3>
                <p className="text-[#e8e6f0]">{world_setting.magic_system.name}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#9694a8] mb-1">核心规则</h3>
                <p className="text-[#e8e6f0]">{world_setting.magic_system.rules}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#9694a8] mb-1">等级划分</h3>
                <div className="flex flex-wrap gap-2">
                  {world_setting.magic_system.levels.length > 0 ? (
                    world_setting.magic_system.levels.map((level, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-[#fdcb6e]/10 text-[#fdcb6e] text-sm rounded border border-[#fdcb6e]/20"
                      >
                        {level}
                      </span>
                    ))
                  ) : (
                    <span className="text-[#9694a8] italic">无等级划分</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#9694a8] mb-1">限制与代价</h3>
                <p className="text-[#e8e6f0]">{world_setting.magic_system.limitations || '无'}</p>
              </div>
            </div>
          ) : (
            <p className="text-[#9694a8] italic">此世界不存在魔法体系</p>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card-glow bg-[#1c1f30] rounded-xl p-6 border border-[#232640]"
        >
          <h2 className="text-lg font-medium text-[#e8e6f0] mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-[#e17055]" />
            社会结构
          </h2>
          {world_setting.social_structure ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-[#9694a8] mb-1">政治体制</h3>
                <p className="text-[#e8e6f0]">{world_setting.social_structure.government}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#9694a8] mb-1">主要势力</h3>
                <div className="flex flex-wrap gap-2">
                  {world_setting.social_structure.factions.length > 0 ? (
                    world_setting.social_structure.factions.map((faction, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-[#e17055]/10 text-[#e17055] text-sm rounded border border-[#e17055]/20"
                      >
                        {faction}
                      </span>
                    ))
                  ) : (
                    <span className="text-[#9694a8] italic">无主要势力</span>
                  )}
                </div>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#9694a8] mb-1">经济基础</h3>
                <p className="text-[#e8e6f0]">{world_setting.social_structure.economy || '未指定'}</p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-[#9694a8] mb-1">文化特征</h3>
                <p className="text-[#e8e6f0]">{world_setting.social_structure.culture || '未指定'}</p>
              </div>
            </div>
          ) : (
            <p className="text-[#9694a8] italic">此世界不存在社会结构</p>
          )}
        </motion.div>
      </div>

      {/* 底部操作 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap gap-4 pt-6 border-t border-[#232640]"
      >
        <Link
          to={`/project/${id}/story`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] text-white rounded-lg hover:shadow-lg hover:shadow-[#6c5ce7]/20 transition-all duration-300"
        >
          <BookOpen className="w-5 h-5" />
          <span>查看故事大纲</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to={`/project/${id}/characters`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#232640] text-[#e8e6f0] rounded-lg hover:bg-[#2d2f45] transition-colors"
        >
          <Users className="w-5 h-5" />
          <span>管理角色</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  )
}

export default WorldView