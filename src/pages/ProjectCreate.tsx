import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useProjectStore } from '@/store/useProjectStore'
import { useUIStore } from '@/store/useUIStore'
import {
  Sparkles, Globe, BookOpen, Users, FileText, Film, Wand2,
  Loader2, ChevronRight
} from 'lucide-react'

const ProjectCreate = () => {
  const navigate = useNavigate()
  const { runPhaseOne, isAgentRunning, agentProgress, error } = useProjectStore()
  const { addToast } = useUIStore()

  const [form, setForm] = useState({
    projectName: '',
    worldIdea: '',
    storyRequirements: '',
    totalChapters: 12,
  })

  const handleSubmit = async () => {
    if (!form.projectName.trim() || !form.worldIdea.trim() || !form.storyRequirements.trim()) {
      addToast('warning', '请填写所有必填项')
      return
    }

    if (form.worldIdea.length < 50) {
      addToast('warning', '世界观创意描述太简短，请详细一些')
      return
    }

    if (form.storyRequirements.length < 50) {
      addToast('warning', '故事需求描述太简短，请详细一些')
      return
    }

    const projectId = await runPhaseOne({
      project_name: form.projectName,
      world_idea: form.worldIdea,
      story_requirements: form.storyRequirements,
      total_chapters: form.totalChapters,
    })

    if (projectId) {
      addToast('success', '项目创建成功！AI已完成阶段一')
      navigate(`/project/${projectId}`)
    }
  }

  const handleChange = (field: keyof typeof form, value: string | number) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  // 创建步骤配置
  const steps = [
    { icon: Globe, title: '构建世界观', desc: '设计完整的背景设定' },
    { icon: BookOpen, title: '编排大纲', desc: '梳理故事脉络' },
    { icon: Users, title: '设计角色', desc: '创建人物形象与设定' },
    { icon: FileText, title: '编写剧本', desc: '撰写章节内容' },
    { icon: Film, title: '拆解分镜', desc: '转化画面表现形式' },
    { icon: Wand2, title: '生成提示词', desc: '为MJ生成准备素材' },
  ]

  return (
    <div className="flex h-full">
      {/* 左侧表单区域 */}
      <div className="flex-1 p-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-serif font-bold text-[#e8e6f0] mb-2">创建新项目</h1>
          <p className="text-[#9694a8] mb-8">让我们开始打造你的动漫世界</p>

          <div className="space-y-6">
            {/* 项目名称 */}
            <div>
              <label className="block text-sm font-medium text-[#e8e6f0] mb-2">项目名称 *</label>
              <input
                type="text"
                value={form.projectName}
                onChange={(e) => handleChange('projectName', e.target.value)}
                placeholder="例：星辰破晓录"
                disabled={isAgentRunning}
                className="w-full px-4 py-3 bg-[#1c1f30] border border-[#232640] rounded-lg text-[#e8e6f0] placeholder-[#5c5a6e] focus:outline-none focus:ring-2 focus:ring-[#6c5ce7] focus:border-transparent disabled:opacity-50"
              />
              <p className="text-xs text-[#9694a8] mt-2">为你的动漫作品取一个响亮的名字</p>
            </div>

            {/* 世界观创意 */}
            <div>
              <label className="block text-sm font-medium text-[#e8e6f0] mb-2">世界观创意 *</label>
              <textarea
                value={form.worldIdea}
                onChange={(e) => handleChange('worldIdea', e.target.value)}
                placeholder={`描述你想要的世界观设定...\n例：一个将蒸汽朋克机械文明与东方仙侠修炼体系融合的世界。天空中漂浮着巨大的齿轮岛屿，修仙者需要同时掌握灵力和机械原理...`}
                rows={6}
                disabled={isAgentRunning}
                className="w-full px-4 py-3 bg-[#1c1f30] border border-[#232640] rounded-lg text-[#e8e6f0] placeholder-[#5c5a6e] focus:outline-none focus:ring-2 focus:ring-[#6c5ce7] focus:border-transparent resize-none disabled:opacity-50"
              />
              <p className="text-xs text-[#9694a8] mt-2">越详细越好：时代背景、魔法体系、社会结构、视觉风格</p>
            </div>

            {/* 故事需求 */}
            <div>
              <label className="block text-sm font-medium text-[#e8e6f0] mb-2">故事需求 *</label>
              <textarea
                value={form.storyRequirements}
                onChange={(e) => handleChange('storyRequirements', e.target.value)}
                placeholder={`描述你想要的故事类型和方向...\n例：主角是一个被家族驱逐的天才少年，在底层挣扎时意外获得了失落的上古机关术传承，踏上复仇与自我救赎的旅程...`}
                rows={6}
                disabled={isAgentRunning}
                className="w-full px-4 py-3 bg-[#1c1f30] border border-[#232640] rounded-lg text-[#e8e6f0] placeholder-[#5c5a6e] focus:outline-none focus:ring-2 focus:ring-[#6c5ce7] focus:border-transparent resize-none disabled:opacity-50"
              />
              <p className="text-xs text-[#9694a8] mt-2">主角设定、故事主线、想要的风格和情感基调</p>
            </div>

            {/* 章节数量 */}
            <div>
              <label className="block text-sm font-medium text-[#e8e6f0] mb-2">章节数量</label>
              <select
                value={form.totalChapters}
                onChange={(e) => handleChange('totalChapters', Number(e.target.value))}
                disabled={isAgentRunning}
                className="w-full px-4 py-3 bg-[#1c1f30] border border-[#232640] rounded-lg text-[#e8e6f0] focus:outline-none focus:ring-2 focus:ring-[#6c5ce7] focus:border-transparent disabled:opacity-50"
              >
                <option value={6}>6章（短篇）</option>
                <option value={8}>8章</option>
                <option value={12}>12章（标准）</option>
                <option value={16}>16章</option>
                <option value={24}>24章（长篇）</option>
              </select>
            </div>

            {/* 提交按钮 */}
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                disabled={isAgentRunning}
                className="w-full py-4 bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#6c5ce7]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAgentRunning ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>AI创作中...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>启动AI创作流水线</span>
                  </>
                )}
              </button>

              {error && (
                <p className="text-red-500 text-sm mt-2">{error}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 右侧引导区 */}
      <div className="w-2/5 p-8 bg-[#161825]/50 border-l border-[#232640]">
        <div className="sticky top-8">
          <h2 className="text-xl font-serif font-bold text-[#e8e6f0] mb-6">创作流程预览</h2>

          <div className="space-y-4 mb-8">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-4 bg-[#1c1f30] rounded-lg border border-[#232640]"
              >
                <div className="p-2 bg-[#6c5ce7]/10 rounded-lg">
                  <step.icon className="w-5 h-5 text-[#6c5ce7]" />
                </div>
                <div>
                  <h3 className="font-medium text-[#e8e6f0]">{step.title}</h3>
                  <p className="text-sm text-[#9694a8]">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="p-4 bg-[#1c1f30] rounded-lg border border-[#232640]">
            <div className="flex items-center gap-2 mb-2">
              <Wand2 className="w-5 h-5 text-[#00cec9]" />
              <h3 className="font-medium text-[#e8e6f0]">预计耗时</h3>
            </div>
            <p className="text-sm text-[#9694a8]">全程预计 3-10 分钟，取决于内容复杂度</p>
          </div>

          <div className="mt-8 p-4 bg-gradient-to-r from-[#6c5ce7]/10 to-[#00cec9]/10 rounded-lg border border-[#6c5ce7]/20">
            <h3 className="font-medium text-[#e8e6f0] mb-2">小贴士</h3>
            <ul className="text-sm text-[#9694a8] space-y-1">
              <li>• 世界观设定越详细，AI创作越精准</li>
              <li>• 尝试融入多种风格元素（如赛博朋克+武侠）</li>
              <li>• 明确故事的情感基调和主题</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 运行中覆盖层 */}
      {isAgentRunning && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1c1f30] rounded-2xl p-8 max-w-md w-full mx-4 border border-[#232640]"
          >
            <div className="text-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 border-4 border-[#6c5ce7] border-t-[#00cec9] rounded-full mx-auto mb-4"
              />
              <h3 className="text-lg font-medium text-[#e8e6f0] mb-2">AI创作中...</h3>
              <p className="text-[#9694a8] text-sm mb-4">{agentProgress || '正在处理...'}</p>
              <div className="flex justify-center">
                <div className="w-8 h-1 bg-[#232640] rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#6c5ce7] to-[#00cec9]"
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 10 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default ProjectCreate