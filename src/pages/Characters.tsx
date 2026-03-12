import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useProjectStore } from '@/store/useProjectStore'
import { useUIStore } from '@/store/useUIStore'
import {
  Users, Copy, Check, Sparkles,
  ChevronDown, ChevronUp, Eye,
  ArrowRight, Loader2
} from 'lucide-react'

const Characters = () => {
  const { id } = useParams<{ id: string }>()
  const {
    currentProject, fetchProject,
    characterPrompts, fetchCharacterPrompts,
    uploadTurnaround, setReference,
    generateStoryboardPrompts, isAgentRunning, agentProgress
  } = useProjectStore()
  const { addToast } = useUIStore()

  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({})
  const [copiedStates, setCopiedStates] = useState<Record<string, boolean>>({})
  const [uploadInputs, setUploadInputs] = useState<Record<string, string>>({})
  const [tempUrls, setTempUrls] = useState<Record<string, string[]>>({})

  useEffect(() => {
    if (id) {
      fetchProject(id)
      fetchCharacterPrompts(id)
    }
  }, [id])

  // 复制到剪贴板函数
  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedStates(prev => ({ ...prev, [id]: true }))
      addToast('success', '已复制到剪贴板')
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }))
      }, 2000)
      return true
    } catch {
      // fallback
      const textarea = document.createElement('textarea')
      textarea.value = text
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopiedStates(prev => ({ ...prev, [id]: true }))
      addToast('success', '已复制到剪贴板')
      setTimeout(() => {
        setCopiedStates(prev => ({ ...prev, [id]: false }))
      }, 2000)
      return true
    }
  }

  // 切换卡片展开状态
  const toggleCard = (id: string) => {
    setExpandedCards(prev => ({ ...prev, [id]: !prev[id] }))
  }

  // 处理上传输入变化
  const handleInputChange = (characterName: string, value: string) => {
    setUploadInputs(prev => ({ ...prev, [characterName]: value }))
  }

  // 上传三视图
  const handleUpload = async (characterName: string) => {
    const input = uploadInputs[characterName] || ''
    const urls = input.split(',').map(url => url.trim()).filter(url => url)

    if (urls.length === 0) {
      addToast('warning', '请输入有效的图片URL')
      return
    }

    if (currentProject) {
      try {
        await uploadTurnaround(id!, characterName, urls, '')
        setUploadInputs(prev => ({ ...prev, [characterName]: '' }))
        addToast('success', `已上传${characterName}的三视图`)
      } catch (error) {
        addToast('error', '上传失败')
      }
    }
  }

  // 设置参考图
  const handleSetReference = async (characterName: string, url: string) => {
    if (currentProject) {
      try {
        await setReference(id!, characterName, url)
        addToast('success', `已设置${characterName}的参考图`)
      } catch (error) {
        addToast('error', '设置参考图失败')
      }
    }
  }

  // 生成分镜提示词
  const handleGenerateStoryboardPrompts = async () => {
    if (id) {
      await generateStoryboardPrompts(id)
      addToast('success', '分镜MJ提示词已生成')
    }
  }

  // 计算进度
  const getCompletionStats = () => {
    if (!currentProject || !currentProject.characters) return { completed: 0, total: 0 }

    const mainRoles = ['protagonist', 'antagonist', 'supporting']
    const total = currentProject.characters.filter(c => mainRoles.includes(c.role)).length
    const completed = currentProject.characters.filter(c =>
      mainRoles.includes(c.role) && c.reference_image_url
    ).length

    return { completed, total }
  }

  const { completed, total } = getCompletionStats()

  if (!currentProject) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <Users className="w-16 h-16 text-[#6c5ce7]/50 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-[#e8e6f0] mb-2">暂无项目</h2>
          <p className="text-[#9694a8] mb-6">请先选择一个项目</p>
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

  return (
    <div className="flex-1 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#e8e6f0] mb-2">角色管理</h1>
            <p className="text-[#9694a8]">
              为所有角色生成三视图，并选择参考图以便后续分镜使用
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#9694a8]">参考图设置进度:</span>
              <span className="text-[#e8e6f0]">{completed}/{total}</span>
            </div>

            <button
              onClick={handleGenerateStoryboardPrompts}
              disabled={completed < total || isAgentRunning}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] text-white rounded-lg hover:shadow-lg hover:shadow-[#6c5ce7]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAgentRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>生成中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>生成分镜MJ提示词</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 进度条 */}
        <div className="w-full bg-[#232640] rounded-full h-2 mb-4">
          <div
            className="bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] h-2 rounded-full transition-all duration-300"
            style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
          ></div>
        </div>

        {isAgentRunning && (
          <div className="text-center text-sm text-[#9694a8] py-2">
            {agentProgress}
          </div>
        )}

        {!isAgentRunning && completed < total && (
          <div className="text-sm text-[#fdcb6e] bg-[#fdcb6e]/10 p-3 rounded-lg border border-[#fdcb6e]/20">
            ⚠️ 请为所有主要角色（主角、反派、配角）设置参考图，然后才能生成分镜MJ提示词
          </div>
        )}
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {currentProject.characters.map((character) => {
          const promptData = characterPrompts.find(p => p.character_name === character.name)
          const isExpanded = expandedCards[character.id] || false

          // 角色定位颜色
          const roleColors = {
            protagonist: { bg: 'bg-red-500/10', text: 'text-red-500', border: 'border-red-500/20', label: '主角' },
            antagonist: { bg: 'bg-purple-500/10', text: 'text-purple-500', border: 'border-purple-500/20', label: '反派' },
            supporting: { bg: 'bg-blue-500/10', text: 'text-blue-500', border: 'border-blue-500/20', label: '配角' },
            minor: { bg: 'bg-gray-500/10', text: 'text-gray-500', border: 'border-gray-500/20', label: '路人' }
          }

          const roleStyle = roleColors[character.role as keyof typeof roleColors] || roleColors.minor

          return (
            <motion.div
              key={character.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card-glow bg-[#1c1f30] rounded-xl border border-[#232640] overflow-hidden"
            >
              {/* 角色信息头 */}
              <div className="p-4 border-b border-[#232640]">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-medium text-[#e8e6f0]">{character.name}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full border ${roleStyle.bg} ${roleStyle.text} ${roleStyle.border}`}>
                        {roleStyle.label}
                      </span>
                    </div>
                    <p className="text-sm text-[#9694a8]">
                      {character.appearance.gender}, {character.appearance.age_appearance}
                    </p>
                    <p className="text-sm text-[#e8e6f0] mt-2">{character.personality}</p>
                  </div>

                  <button
                    onClick={() => toggleCard(character.id)}
                    className="p-1 text-[#9694a8] hover:text-[#e8e6f0] transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </button>
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="mt-4 pt-4 border-t border-[#232640]"
                    >
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-medium text-[#9694a8] mb-1">外貌描述</h4>
                          <div className="text-sm text-[#e8e6f0] space-y-1">
                            <p><span className="text-[#a29bfe]">发型发色:</span> {character.appearance.hair}</p>
                            <p><span className="text-[#a29bfe]">瞳色眼型:</span> {character.appearance.eyes}</p>
                            <p><span className="text-[#a29bfe]">体型身高:</span> {character.appearance.build}, {character.appearance.height}</p>
                            <p><span className="text-[#a29bfe]">服装风格:</span> {character.appearance.outfit}</p>
                            <p><span className="text-[#a29bfe]">配饰道具:</span> {character.appearance.accessories.join(', ')}</p>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-[#9694a8] mb-1">背景故事</h4>
                          <p className="text-sm text-[#e8e6f0]">{character.background}</p>
                        </div>

                        <div>
                          <h4 className="text-sm font-medium text-[#9694a8] mb-1">能力</h4>
                          <div className="flex flex-wrap gap-1">
                            {character.abilities.map((ability, idx) => (
                              <span key={idx} className="px-2 py-1 bg-[#6c5ce7]/10 text-[#6c5ce7] text-xs rounded border border-[#6c5ce7]/20">
                                {ability}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* MJ三视图提示词 */}
              <div className="p-4 border-b border-[#232640]">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-[#e8e6f0]">MJ三视图提示词</h4>
                  <button
                    onClick={() => promptData && copyToClipboard(promptData.mj_character_prompt, character.id)}
                    disabled={!promptData || !promptData.mj_character_prompt}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-[#232640] text-[#e8e6f0] rounded hover:bg-[#2d2f45] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {copiedStates[character.id] ? (
                      <>
                        <Check className="w-3 h-3" />
                        <span>已复制</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>复制</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="mj-prompt-block">
                  {promptData && promptData.mj_character_prompt ? (
                    <div className="whitespace-pre-wrap">{promptData.mj_character_prompt}</div>
                  ) : (
                    <div className="text-[#9694a8] italic">提示词尚未生成</div>
                  )}
                </div>
              </div>

              {/* 图片管理 */}
              <div className="p-4">
                <h4 className="text-sm font-medium text-[#e8e6f0] mb-3">图片管理</h4>

                {/* 上传三视图 */}
                <div className="mb-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={uploadInputs[character.name] || ''}
                      onChange={(e) => handleInputChange(character.name, e.target.value)}
                      placeholder="粘贴MJ生成的三视图图片URL（多个用逗号分隔）"
                      className="flex-1 px-3 py-2 bg-[#232640] border border-[#232640] rounded text-[#e8e6f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#6c5ce7] focus:border-transparent"
                    />
                    <button
                      onClick={() => handleUpload(character.name)}
                      disabled={!uploadInputs[character.name]}
                      className="px-3 py-2 bg-[#232640] text-[#e8e6f0] rounded hover:bg-[#2d2f45] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                    >
                      上传
                    </button>
                  </div>

                  {/* 已上传的三视图列表 */}
                  {character.turnaround_image_urls && character.turnaround_image_urls.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <h5 className="text-xs text-[#9694a8]">已上传的三视图</h5>
                      <div className="flex flex-wrap gap-2">
                        {character.turnaround_image_urls.map((url, idx) => (
                          <div key={idx} className="flex items-center gap-2 p-2 bg-[#232640]/50 rounded">
                            <img
                              src={url}
                              alt={`三视图 ${idx + 1}`}
                              className="w-10 h-10 object-cover rounded border border-[#232640]"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBmaWxsPSIjMTYxODI1Ii8+CjxwYXRoIGQ9Ik0xNSAyMEgxOSIgc3Ryb2tlPSIjOTY5NGE4IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+CjxwYXRoIGQ9Ik0xNyAxOEwxOSAyMEwyMSAxOCIgc3Ryb2tlPSIjOTY5NGE4IiBzdHJva2Utd2lkdGg9IjEuNSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+Cjwvc3ZnPgo='
                              }}
                            />
                            <div className="flex flex-col gap-1">
                              <button
                                onClick={() => handleSetReference(character.name, url)}
                                className="text-xs px-2 py-1 bg-[#6c5ce7]/10 text-[#6c5ce7] rounded hover:bg-[#6c5ce7]/20 transition-colors"
                              >
                                设为参考图
                              </button>
                              {character.reference_image_url === url && (
                                <span className="text-xs text-green-500">✓ 参考图</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* 参考图显示 */}
                {character.reference_image_url && (
                  <div className="p-3 bg-[#232640]/50 rounded-lg border border-green-500/20">
                    <div className="flex items-center gap-2">
                      <img
                        src={character.reference_image_url}
                        alt={`${character.name}参考图`}
                        className="w-12 h-12 object-cover rounded border-2 border-green-500"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjMTYxODI1Ii8+CjxwYXRoIGQ9Ik0yMy45OTk4IDIwSDE3Ljk5OThMNjcuOTk5OCAyMC4wMDAwIiBzdHJva2U9IiM5Njk0YTgiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPHBhdGggZD0iTTE5Ljk5OTggMTguMDAwMEwxNy45OTk4IDIwLjAwMDBMMTUuOTk5OCAxOC4wMDAwIiBzdHJva2U9IiM5Njk0YTgiIHN0cm9rZS13aWR0aD0iMS41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz4KPC9zdmc+Cg=='
                        }}
                      />
                      <div className="flex-1">
                        <h5 className="text-sm font-medium text-[#e8e6f0]">参考图</h5>
                        <p className="text-xs text-[#9694a8] truncate max-w-xs">{character.reference_image_url}</p>
                      </div>
                      <button
                        onClick={() => handleSetReference(character.name, '')}
                        className="text-xs px-2 py-1 bg-red-500/10 text-red-500 rounded hover:bg-red-500/20 transition-colors"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}

export default Characters