import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useProjectStore } from '@/store/useProjectStore'
import { useUIStore } from '@/store/useUIStore'
import {
  Scissors, Play, Pause, RotateCcw, Download,
  FileVideo, Clock, CheckCircle, AlertCircle,
  ChevronLeft, ArrowRight, Volume2, Settings,
  SkipForward, SkipBack, Repeat, FileJson
} from 'lucide-react'

const PostProduction = () => {
  const { id } = useParams<{ id: string }>()
  const {
    currentProject, fetchProject,
    runPhaseTwo, isAgentRunning, agentProgress
  } = useProjectStore()
  const { addToast } = useUIStore()

  // 加载项目数据
  useEffect(() => {
    if (id) {
      fetchProject(id)
    }
  }, [id])

  // 检查是否所有必需条件都满足
  const getApprovalStats = () => {
    if (!currentProject) return { approved: 0, total: 0, ready: false }

    const total = currentProject.storyboard_panels.length
    const approved = currentProject.storyboard_panels.filter(panel => panel.is_approved).length
    const ready = total > 0 && approved === total

    return { approved, total, ready }
  }

  // 开始后期制作
  const handleStartPostProduction = async () => {
    if (!id) return

    try {
      await runPhaseTwo(id)
      addToast('success', '后期制作脚本生成完成！')
    } catch (error) {
      addToast('error', '后期制作启动失败')
    }
  }

  // 导出剪辑脚本
  const exportScript = (scripts: any[]) => {
    if (!currentProject) return

    const blob = new Blob([JSON.stringify(scripts, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `editing_scripts_${currentProject.name || 'project'}.json`
    a.click()
    URL.revokeObjectURL(url)
    addToast('success', '剪辑脚本导出成功')
  }

  const { approved, total, ready } = getApprovalStats()

  if (!currentProject) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <Scissors className="w-16 h-16 text-[#6c5ce7]/50 mx-auto mb-4" />
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
            <h1 className="text-3xl font-serif font-bold text-[#e8e6f0] mb-2">后期制作</h1>
            <p className="text-[#9694a8]">
              生成最终视频编辑脚本，合成最终视频
            </p>
          </div>

          {currentProject.editing_scripts && currentProject.editing_scripts.length > 0 && (
            <button
              onClick={() => exportScript(currentProject.editing_scripts || [])}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#232640] text-[#e8e6f0] rounded-lg hover:bg-[#2d2f45] transition-colors"
            >
              <FileJson className="w-4 h-4" />
              <span>导出脚本</span>
            </button>
          )}
        </div>

        {/* 审核状态检查 */}
        <div className="mb-6">
          <div className="flex flex-wrap items-center gap-6 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <div className="w-16 bg-[#232640] rounded-full h-2.5">
                  <div
                    className="bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] h-2.5 rounded-full"
                    style={{ width: `${total > 0 ? (approved / total) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
              <span className="text-sm text-[#e8e6f0] ml-2">{approved}/{total}</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-[#55efc4]" />
              <span className="text-[#e8e6f0]">{approved}</span>
              <span className="text-[#9694a8]">已审核</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-[#ff7675]" />
              <span className="text-[#e8e6f0]">{total - approved}</span>
              <span className="text-[#9694a8]">待审核</span>
            </div>
          </div>

          {!ready && (
            <div className="text-sm text-[#fdcb6e] bg-[#fdcb6e]/10 p-3 rounded-lg border border-[#fdcb6e]/20">
              ⚠️ 请先在分镜管理页审核所有面板，当前 {approved}/{total} 个已审核通过
            </div>
          )}

          {ready && (
            <div className="text-sm text-[#55efc4] bg-[#55efc4]/10 p-3 rounded-lg border border-[#55efc4]/20">
              ✅ 所有分镜均已审核通过，可以生成剪辑脚本
            </div>
          )}
        </div>

        {/* 生成按钮 */}
        <div className="mb-8">
          <button
            onClick={handleStartPostProduction}
            disabled={!ready || isAgentRunning}
            className="w-full py-4 bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-[#6c5ce7]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAgentRunning ? (
              <>
                <RotateCcw className="w-5 h-5 animate-spin" />
                <span>生成中... {agentProgress}</span>
              </>
            ) : (
              <>
                <Scissors className="w-5 h-5" />
                <span>生成剪辑脚本</span>
              </>
            )}
          </button>
        </div>
      </motion.div>

      {/* 生成的剪辑脚本展示 */}
      {currentProject.editing_scripts && currentProject.editing_scripts.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-[#e8e6f0] mb-4 flex items-center gap-2">
            <FileVideo className="w-5 h-5 text-[#00cec9]" />
            生成的剪辑脚本
          </h2>

          <div className="space-y-6">
            {currentProject.editing_scripts.map((script, index) => (
              <motion.div
                key={script.id || index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-glow bg-[#1c1f30] rounded-xl border border-[#232640] overflow-hidden"
              >
                <div className="p-4 border-b border-[#232640]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-[#e8e6f0] text-lg">
                      {script.chapter_title || `第 ${script.chapter_number} 章`}
                    </h3>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-[#9694a8] flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {script.duration}s
                      </span>
                      <button
                        onClick={() => {
                          // 下载特定章节的脚本
                          exportScript([script])
                        }}
                        className="flex items-center gap-1 px-3 py-1.5 bg-[#232640] text-[#e8e6f0] rounded text-sm hover:bg-[#2d2f45] transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>下载章节</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 时间线展示 */}
                <div className="p-4">
                  <h4 className="text-sm font-medium text-[#e8e6f0] mb-3">片段时间线</h4>
                  <div className="overflow-x-auto pb-2">
                    <div className="flex gap-2 min-w-max">
                      {script.scenes.map((scene, sceneIdx) => (
                        <div
                          key={scene.id || sceneIdx}
                          className="flex-shrink-0 bg-[#232640]/50 rounded-lg p-3 border border-[#232640] w-48"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-12 h-12 bg-[#232640] rounded border border-[#232640] flex items-center justify-center">
                              <Play className="w-4 h-4 text-[#9694a8]" />
                            </div>
                            <div>
                              <div className="text-xs font-medium text-[#e8e6f0]">片段 {sceneIdx + 1}</div>
                              <div className="text-xs text-[#9694a8]">{scene.duration}s</div>
                            </div>
                          </div>

                          <div className="space-y-1 text-xs">
                            <div className="flex items-center gap-1">
                              <Repeat className="w-3 h-3 text-[#00cec9]" />
                              <span className="text-[#9694a8]">转场: {scene.transition_effect}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Volume2 className="w-3 h-3 text-[#6c5ce7]" />
                              <span className="text-[#9694a8]">音效: {scene.sound_effects?.join(', ') || '无'}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Settings className="w-3 h-3 text-[#a29bfe]" />
                              <span className="text-[#9694a8]">效果: {scene.motion_effect}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 片段列表 */}
                <div className="p-4 border-t border-[#232640]">
                  <h4 className="text-sm font-medium text-[#e8e6f0] mb-3">片段详情</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[#232640]">
                          <th className="text-left py-2 text-[#9694a8]">片段</th>
                          <th className="text-left py-2 text-[#9694a8]">缩略图</th>
                          <th className="text-left py-2 text-[#9694a8]">时长</th>
                          <th className="text-left py-2 text-[#9694a8]">转场</th>
                          <th className="text-left py-2 text-[#9694a8]">字幕</th>
                          <th className="text-left py-2 text-[#9694a8]">音效</th>
                          <th className="text-left py-2 text-[#9694a8]">效果</th>
                        </tr>
                      </thead>
                      <tbody>
                        {script.scenes.map((scene, sceneIdx) => (
                          <tr key={scene.id || sceneIdx} className="border-b border-[#232640]/50">
                            <td className="py-2 text-[#e8e6f0]">片段 {sceneIdx + 1}</td>
                            <td className="py-2">
                              <div className="w-10 h-10 bg-[#232640] rounded border border-[#232640] flex items-center justify-center">
                                <FileVideo className="w-4 h-4 text-[#9694a8]" />
                              </div>
                            </td>
                            <td className="py-2 text-[#e8e6f0]">{scene.duration}s</td>
                            <td className="py-2 text-[#e8e6f0]">{scene.transition_effect}</td>
                            <td className="py-2 text-[#e8e6f0]">{scene.subtitle_text?.substring(0, 20) || '-'}</td>
                            <td className="py-2 text-[#e8e6f0]">{scene.sound_effects?.join(', ') || '无'}</td>
                            <td className="py-2 text-[#e8e6f0]">{scene.motion_effect}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* 如果没有生成脚本且不是运行中 */}
      {!isAgentRunning && (!currentProject.editing_scripts || currentProject.editing_scripts.length === 0) && (
        <div className="text-center py-12">
          <FileVideo className="w-16 h-16 text-[#9694a8]/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-[#e8e6f0] mb-2">暂无剪辑脚本</h3>
          <p className="text-[#9694a8] mb-4">
            {!ready
              ? '请先完成所有分镜的审核'
              : '点击上方按钮生成后期制作脚本'}
          </p>
        </div>
      )}

      {/* 底部导航 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-4 pt-6 border-t border-[#232640]"
      >
        <Link
          to={`/project/${id}/assets`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#232640] text-[#e8e6f0] rounded-lg hover:bg-[#2d2f45] transition-colors"
        >
          <Scissors className="w-5 h-5" />
          <span>资产管理</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to={`/project/${id}/storyboard`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#232640] text-[#e8e6f0] rounded-lg hover:bg-[#2d2f45] transition-colors"
        >
          <FileVideo className="w-5 h-5" />
          <span>分镜管理</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <div className="flex-1" />
        <Link
          to={`/project/${id}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] text-white rounded-lg hover:shadow-lg hover:shadow-[#6c5ce7]/20 transition-all duration-300"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>返回项目</span>
        </Link>
      </motion.div>
    </div>
  )
}

export default PostProduction