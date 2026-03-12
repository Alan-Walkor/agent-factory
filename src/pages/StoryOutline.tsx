import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useProjectStore } from '@/store/useProjectStore'
import { BookOpen, ChevronDown, MapPin, Clock, Users, Zap, ArrowRight } from 'lucide-react'

const StoryOutline = () => {
  const { id } = useParams<{ id: string }>()
  const { currentProject, fetchProject, isLoading } = useProjectStore()
  const [expandedChapter, setExpandedChapter] = useState<number | null>(null)

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
          <div className="h-32 bg-[#1c1f30] rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-[#1c1f30] rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!currentProject || !currentProject.story_outline) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-[#6c5ce7]/50 mx-auto mb-4" />
          <h2 className="text-xl font-medium text-[#e8e6f0] mb-2">暂无故事大纲</h2>
          <p className="text-[#9694a8] mb-6">此项目尚未创建故事大纲</p>
          <Link
            to={`/project/${id}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#232640] text-[#e8e6f0] rounded-lg hover:bg-[#2d2f45] transition-colors"
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span>返回世界观</span>
          </Link>
        </div>
      </div>
    )
  }

  const { story_outline } = currentProject
  const hasScripts = currentProject.chapter_scripts && currentProject.chapter_scripts.length > 0

  const toggleChapter = (chapterNum: number) => {
    setExpandedChapter(expandedChapter === chapterNum ? null : chapterNum)
  }

  return (
    <div className="flex-1 p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <h1 className="text-3xl font-serif font-bold text-[#e8e6f0]">{story_outline.title}</h1>
          <span className="px-3 py-1 bg-[#00cec9]/10 text-[#00cec9] text-sm rounded-full border border-[#00cec9]/20 capitalize">
            {story_outline.genre.replace('_', ' ')}
          </span>
        </div>

        <div className="mb-6 p-4 bg-[#1c1f30] rounded-xl border border-[#232640]">
          <h2 className="text-sm font-medium text-[#9694a8] mb-2">一句话梗概</h2>
          <p className="text-[#e8e6f0] font-medium">{story_outline.logline}</p>
        </div>
      </motion.div>

      {/* 故事弧线 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold text-[#e8e6f0] mb-4">故事弧线</h2>
        <div className="p-6 bg-[#1c1f30] rounded-xl border border-[#232640]">
          <p className="text-[#e8e6f0] leading-relaxed">{story_outline.story_arc}</p>
        </div>
      </motion.div>

      {/* 主题标签 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="mb-8"
      >
        <h2 className="text-lg font-medium text-[#e8e6f0] mb-4">主题</h2>
        <div className="flex flex-wrap gap-2">
          {story_outline.themes.map((theme, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-[#6c5ce7]/10 text-[#6c5ce7] text-sm rounded-full border border-[#6c5ce7]/20"
            >
              {theme}
            </span>
          ))}
        </div>
      </motion.div>

      {/* 摘要 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mb-8"
      >
        <h2 className="text-xl font-semibold text-[#e8e6f0] mb-4">故事摘要</h2>
        <div className="p-6 bg-[#1c1f30] rounded-xl border border-[#232640] leading-relaxed text-[#e8e6f0]">
          {story_outline.synopsis}
        </div>
      </motion.div>

      {/* 章节列表 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-8"
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-[#e8e6f0]">章节大纲</h2>
          <span className="text-sm text-[#9694a8]">
            共 {story_outline.total_chapters} 章
          </span>
        </div>

        <div className="space-y-2">
          {story_outline.chapter_outlines.map((chapter, index) => {
            const isExpanded = expandedChapter === chapter.chapter_number
            const hasScript = hasScripts &&
              currentProject.chapter_scripts.some(s => s.chapter_number === chapter.chapter_number)

            return (
              <motion.div
                key={chapter.chapter_number}
                className="card-glow bg-[#1c1f30] rounded-xl border border-[#232640] overflow-hidden"
              >
                <button
                  onClick={() => toggleChapter(chapter.chapter_number)}
                  className="w-full p-4 text-left flex items-center justify-between hover:bg-[#232640]/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 h-8 flex items-center justify-center bg-[#6c5ce7]/10 text-[#6c5ce7] rounded-full text-sm font-medium">
                      {chapter.chapter_number}
                    </span>
                    <div>
                      <h3 className="font-medium text-[#e8e6f0]">{chapter.title}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="px-2 py-1 bg-[#00cec9]/10 text-[#00cec9] text-xs rounded-full border border-[#00cec9]/20">
                          {chapter.mood}
                        </span>
                        {chapter.time_of_day && (
                          <span className="px-2 py-1 bg-[#fdcb6e]/10 text-[#fdcb6e] text-xs rounded-full border border-[#fdcb6e]/20">
                            {chapter.time_of_day}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {hasScript && (
                      <span className="px-2 py-1 bg-[#55efc4]/10 text-[#55efc4] text-xs rounded-full border border-[#55efc4]/20 flex items-center gap-1">
                        <Zap className="w-3 h-3" />
                        已编写
                      </span>
                    )}
                    <ChevronDown
                      className={`w-5 h-5 text-[#9694a8] transition-transform duration-200 ${
                        isExpanded ? 'rotate-180' : ''
                      }`}
                    />
                  </div>
                </button>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-[#232640] p-4 bg-[#232640]/20"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="text-sm font-medium text-[#9694a8] mb-2">章节概要</h4>
                          <p className="text-[#e8e6f0] text-sm leading-relaxed mb-4">{chapter.summary}</p>

                          <h4 className="text-sm font-medium text-[#9694a8] mb-2">关键事件</h4>
                          <ul className="space-y-1">
                            {chapter.key_events.map((event, idx) => (
                              <li key={idx} className="text-[#e8e6f0] text-sm flex items-start gap-2">
                                <span className="w-1.5 h-1.5 bg-[#6c5ce7] rounded-full mt-2 flex-shrink-0"></span>
                                <span>{event}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div>
                          <div className="grid grid-cols-1 gap-4">
                            <div>
                              <h4 className="text-sm font-medium text-[#9694a8] mb-2 flex items-center gap-1">
                                <Users className="w-3 h-3" />
                                涉及角色
                              </h4>
                              <div className="flex flex-wrap gap-1">
                                {chapter.characters_involved.map((char, idx) => (
                                  <span
                                    key={idx}
                                    className="px-2 py-1 bg-[#a29bfe]/10 text-[#a29bfe] text-xs rounded border border-[#a29bfe]/20"
                                  >
                                    {char}
                                  </span>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="text-sm font-medium text-[#9694a8] mb-2 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                地点
                              </h4>
                              <p className="text-[#e8e6f0] text-sm">{chapter.location}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* 底部操作 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="flex flex-wrap gap-4 pt-6 border-t border-[#232640]"
      >
        <Link
          to={`/project/${id}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#232640] text-[#e8e6f0] rounded-lg hover:bg-[#2d2f45] transition-colors"
        >
          <ArrowRight className="w-4 h-4 rotate-180" />
          <span>返回世界观</span>
        </Link>
        <Link
          to={`/project/${id}/characters`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] text-white rounded-lg hover:shadow-lg hover:shadow-[#6c5ce7]/20 transition-all duration-300"
        >
          <Users className="w-5 h-5" />
          <span>管理角色</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </motion.div>
    </div>
  )
}

export default StoryOutline