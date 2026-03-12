import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useProjectStore } from '@/store/useProjectStore'
import { useUIStore } from '@/store/useUIStore'
import {
  Image as ImageIcon, Users, Film, PieChart, Upload,
  Copy, Check, Clock, CheckCircle, AlertCircle,
  ChevronLeft, ArrowRight, Download, Eye, X
} from 'lucide-react'

const AssetManager = () => {
  const { id } = useParams<{ id: string }>()
  const {
    currentProject, fetchProject,
    pendingPanels, fetchPendingPanels,
    uploadStoryboardImage
  } = useProjectStore()
  const { addToast } = useUIStore()

  const [activeTab, setActiveTab] = useState<'all' | 'characters' | 'storyboards'>('all')
  const [uploadedUrls, setUploadedUrls] = useState<Record<string, string>>({})

  // 加载项目数据
  useEffect(() => {
    if (id) {
      fetchProject(id)
      fetchPendingPanels(id)
    }
  }, [id])

  // 统计信息
  const getAssetStats = () => {
    if (!currentProject) return {
      totalCharacters: 0,
      turnaroundCount: 0,
      referenceCount: 0,
      storyboardCount: 0,
      totalStoryboards: 0,
      approvedCount: 0
    }

    let turnaroundCount = 0
    let referenceCount = 0

    currentProject.characters.forEach(char => {
      if (char.turnaround_image_urls && char.turnaround_image_urls.length > 0) {
        turnaroundCount += char.turnaround_image_urls.length
      }
      if (char.reference_image_url) {
        referenceCount++
      }
    })

    let storyboardCount = 0
    let approvedCount = 0
    currentProject.storyboard_panels.forEach(panel => {
      if (panel.generated_image_url) {
        storyboardCount++
        if (panel.is_approved) approvedCount++
      }
    })

    return {
      totalCharacters: currentProject.characters.length,
      turnaroundCount,
      referenceCount,
      storyboardCount,
      totalStoryboards: currentProject.storyboard_panels.length,
      approvedCount
    }
  }

  // 处理URL输入变化
  const handleUrlChange = (panelId: string, url: string) => {
    setUploadedUrls(prev => ({ ...prev, [panelId]: url }))
  }

  // 上传待处理面板
  const handleUpload = async (panelId: string) => {
    const url = uploadedUrls[panelId]
    if (!url || !id) {
      addToast('warning', '请输入有效的图片URL')
      return
    }
    try {
      await uploadStoryboardImage(id, panelId, url.trim())
      addToast('success', '图片上传成功')
      setUploadedUrls(prev => ({ ...prev, [panelId]: '' }))
      fetchPendingPanels(id)
      fetchProject(id)
    } catch (error) {
      addToast('error', '上传失败')
    }
  }

  // 复制MJ提示词
  const copyPrompt = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      addToast('success', '提示词已复制')
    } catch (error) {
      addToast('error', '复制失败')
    }
  }

  const stats = getAssetStats()

  if (!currentProject) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <PieChart className="w-16 h-16 text-[#6c5ce7]/50 mx-auto mb-4" />
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
            <h1 className="text-3xl font-serif font-bold text-[#e8e6f0] mb-2">资产管理</h1>
            <p className="text-[#9694a8]">
              管理项目中的所有角色和分镜资产
            </p>
          </div>

          <Link
            to={`/project/${id}/storyboard`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] text-white rounded-lg hover:shadow-lg hover:shadow-[#6c5ce7]/20 transition-all duration-300"
          >
            <Film className="w-4 h-4" />
            <span>前往分镜管理</span>
          </Link>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
          <motion.div
            whileHover={{ y: -4 }}
            className="bg-[#1c1f30] rounded-xl p-4 border border-[#232640] relative overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#6c5ce7]/10">
                <Users className="w-5 h-5 text-[#6c5ce7]" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#e8e6f0]">{stats.totalCharacters}</div>
                <div className="text-xs text-[#9694a8]">角色数</div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#6c5ce7] to-[#00cec9]"></div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-[#1c1f30] rounded-xl p-4 border border-[#232640] relative overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#a29bfe]/10">
                <ImageIcon className="w-5 h-5 text-[#a29bfe]" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#e8e6f0]">{stats.turnaroundCount}</div>
                <div className="text-xs text-[#9694a8]">三视图</div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#a29bfe] to-[#6c5ce7]"></div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-[#1c1f30] rounded-xl p-4 border border-[#232640] relative overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#00cec9]/10">
                <CheckCircle className="w-5 h-5 text-[#00cec9]" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#e8e6f0]">{stats.referenceCount}</div>
                <div className="text-xs text-[#9694a8]">参考图</div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#00cec9] to-[#00b894]"></div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-[#1c1f30] rounded-xl p-4 border border-[#232640] relative overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#fdcb6e]/10">
                <Film className="w-5 h-5 text-[#fdcb6e]" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#e8e6f0]">{stats.storyboardCount}</div>
                <div className="text-xs text-[#9694a8]">分镜图片</div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#fdcb6e] to-[#e17055]"></div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-[#1c1f30] rounded-xl p-4 border border-[#232640] relative overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#55efc4]/10">
                <CheckCircle className="w-5 h-5 text-[#55efc4]" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#e8e6f0]">{stats.approvedCount}</div>
                <div className="text-xs text-[#9694a8]">已审核</div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#55efc4] to-[#00b894]"></div>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="bg-[#1c1f30] rounded-xl p-4 border border-[#232640] relative overflow-hidden"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-[#fd79a8]/10">
                <Clock className="w-5 h-5 text-[#fd79a8]" />
              </div>
              <div>
                <div className="text-xl font-bold text-[#e8e6f0]">{stats.totalStoryboards - stats.storyboardCount}</div>
                <div className="text-xs text-[#9694a8]">待上传</div>
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#fd79a8] to-[#fdcb6e]"></div>
          </motion.div>
        </div>
      </motion.div>

      {/* 标签页导航 */}
      <div className="flex border-b border-[#232640] mb-6">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'all'
              ? 'text-[#6c5ce7] border-b-2 border-[#6c5ce7]'
              : 'text-[#9694a8] hover:text-[#e8e6f0]'
          }`}
        >
          全部资产
        </button>
        <button
          onClick={() => setActiveTab('characters')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'characters'
              ? 'text-[#6c5ce7] border-b-2 border-[#6c5ce7]'
              : 'text-[#9694a8] hover:text-[#e8e6f0]'
          }`}
        >
          角色资产
        </button>
        <button
          onClick={() => setActiveTab('storyboards')}
          className={`px-4 py-2 font-medium text-sm ${
            activeTab === 'storyboards'
              ? 'text-[#6c5ce7] border-b-2 border-[#6c5ce7]'
              : 'text-[#9694a8] hover:text-[#e8e6f0]'
          }`}
        >
          分镜资产
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'all' && (
          <motion.div
            key="all"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* 角色资产概览 */}
            <div>
              <h2 className="text-xl font-semibold text-[#e8e6f0] mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-[#6c5ce7]" />
                角色资产
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {currentProject.characters.map((character) => (
                  <motion.div
                    key={character.id}
                    whileHover={{ y: -2 }}
                    className="card-glow bg-[#1c1f30] rounded-xl border border-[#232640] p-4"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-[#e8e6f0]">{character.name}</h3>
                      <span className="px-2 py-1 text-xs rounded-full bg-[#a29bfe]/10 text-[#a29bfe] border border-[#a29bfe]/20">
                        {character.role}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {character.turnaround_image_urls && character.turnaround_image_urls.length > 0 && (
                        <div>
                          <h4 className="text-xs text-[#9694a8] mb-1">三视图 ({character.turnaround_image_urls.length})</h4>
                          <div className="flex gap-1">
                            {character.turnaround_image_urls.slice(0, 3).map((url, idx) => (
                              <img
                                key={idx}
                                src={url}
                                alt={`三视图 ${idx + 1}`}
                                className="w-12 h-12 object-cover rounded border border-[#232640]"
                              />
                            ))}
                            {character.turnaround_image_urls.length > 3 && (
                              <div className="w-12 h-12 flex items-center justify-center bg-[#232640] rounded border border-[#232640]">
                                <span className="text-xs text-[#9694a8]">+{character.turnaround_image_urls.length - 3}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {character.reference_image_url && (
                        <div>
                          <h4 className="text-xs text-[#9694a8] mb-1">参考图</h4>
                          <div className="flex items-center gap-2">
                            <img
                              src={character.reference_image_url}
                              alt={`${character.name}参考图`}
                              className="w-12 h-12 object-cover rounded border-2 border-green-500"
                            />
                            <span className="text-xs text-green-500">已设为参考图</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* 分镜资产概览 */}
            <div>
              <h2 className="text-xl font-semibold text-[#e8e6f0] mb-4 flex items-center gap-2">
                <Film className="w-5 h-5 text-[#00cec9]" />
                分镜资产
              </h2>

              {/* 按章节分组显示 */}
              {Array.from(new Set(currentProject.storyboard_panels.map(p => p.chapter_number)))
                .sort((a, b) => a - b)
                .map(chapter => {
                  const chapterPanels = currentProject.storyboard_panels
                    .filter(p => p.chapter_number === chapter)
                    .sort((a, b) => a.panel_number - b.panel_number)

                  const uploadedPanels = chapterPanels.filter(p => p.generated_image_url)

                  return (
                    <div key={chapter} className="mb-6">
                      <h3 className="text-lg font-medium text-[#e8e6f0] mb-3">
                        第 {chapter} 章 ({uploadedPanels.length}/{chapterPanels.length} 已上传)
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {uploadedPanels.map(panel => (
                          <div key={panel.id} className="relative group">
                            {panel.generated_image_url ? (
                              <img
                                src={panel.generated_image_url}
                                alt={`分镜 ${panel.panel_number}`}
                                className="w-full h-20 object-cover rounded border border-[#232640]"
                              />
                            ) : (
                              <div className="w-full h-20 bg-[#232640] rounded border border-dashed border-[#232640] flex items-center justify-center">
                                <X className="w-6 h-6 text-[#9694a8]" />
                              </div>
                            )}
                            {panel.is_approved && (
                              <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                                <Check className="w-2 h-2 text-white" />
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })}
            </div>
          </motion.div>
        )}

        {activeTab === 'characters' && (
          <motion.div
            key="characters"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {currentProject.characters.map((character) => (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-glow bg-[#1c1f30] rounded-xl border border-[#232640] p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-[#e8e6f0]">{character.name}</h3>
                  <span className="px-3 py-1 rounded-full bg-[#a29bfe]/10 text-[#a29bfe] text-sm border border-[#a29bfe]/20">
                    {character.role}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 三视图 */}
                  <div>
                    <h4 className="text-sm font-medium text-[#e8e6f0] mb-3 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      三视图 ({character.turnaround_image_urls?.length || 0})
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {character.turnaround_image_urls?.map((url, idx) => (
                        <div key={idx} className="relative group">
                          <img
                            src={url}
                            alt={`三视图 ${idx + 1}`}
                            className="w-full h-24 object-cover rounded border border-[#232640]"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                            <Eye className="w-5 h-5 text-white" />
                          </div>
                        </div>
                      )) || (
                        <p className="text-sm text-[#9694a8] col-span-3">暂无三视图</p>
                      )}
                    </div>
                  </div>

                  {/* 参考图 */}
                  <div>
                    <h4 className="text-sm font-medium text-[#e8e6f0] mb-3 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      参考图
                    </h4>
                    {character.reference_image_url ? (
                      <div className="relative group">
                        <img
                          src={character.reference_image_url}
                          alt={`${character.name}参考图`}
                          className="w-full h-32 object-cover rounded border-2 border-green-500"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                          <Download className="w-5 h-5 text-white" />
                        </div>
                        <div className="absolute top-2 right-2 px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded-full border border-green-500/30">
                          已设定
                        </div>
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-[#232640] border-2 border-dashed border-[#232640] rounded flex items-center justify-center">
                        <div className="text-center text-[#9694a8]">
                          <ImageIcon className="w-8 h-8 mx-auto mb-1" />
                          <p className="text-sm">未设定参考图</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {activeTab === 'storyboards' && (
          <motion.div
            key="storyboards"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* 待上传分镜列表 */}
            <div className="card-glow bg-[#1c1f30] rounded-xl border border-[#232640] p-6">
              <h3 className="text-lg font-medium text-[#e8e6f0] mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#fdcb6e]" />
                待上传分镜 ({pendingPanels.length})
              </h3>

              {pendingPanels.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">🎉</div>
                  <p className="text-[#9694a8]">所有分镜图片都已上传！</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingPanels.map((panel) => (
                    <div key={panel.panel_id} className="bg-[#232640]/50 rounded-lg p-4 border border-[#232640]">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium text-[#e8e6f0] mb-1">
                            第 {panel.chapter_number} 章 · 分镜 {panel.panel_number}
                          </h4>
                          <p className="text-sm text-[#9694a8] line-clamp-2">{panel.visual_description}</p>
                        </div>

                        <button
                          onClick={() => copyPrompt(panel.mj_prompt)}
                          className="flex items-center gap-1 px-3 py-1.5 bg-[#232640] text-[#e8e6f0] rounded text-sm hover:bg-[#2d2f45] transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                          <span>复制提示词</span>
                        </button>
                      </div>

                      <div className="bg-[#232640] rounded p-3 mb-3">
                        <div className="text-xs text-[#9694a8] mb-1">MJ提示词</div>
                        <pre className="text-xs text-[#e8e6f0] whitespace-pre-wrap font-mono overflow-x-auto">
                          {panel.mj_prompt}
                        </pre>
                      </div>

                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={uploadedUrls[panel.panel_id] || ''}
                          onChange={(e) => handleUrlChange(panel.panel_id, e.target.value)}
                          placeholder="粘贴MJ生成的图片URL..."
                          className="flex-1 px-3 py-2 bg-[#232640] border border-[#232640] rounded text-[#e8e6f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#6c5ce7] focus:border-transparent"
                        />
                        <button
                          onClick={() => handleUpload(panel.panel_id)}
                          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] text-white rounded text-sm hover:shadow-lg hover:shadow-[#6c5ce7]/20 transition-all"
                        >
                          <Upload className="w-4 h-4" />
                          <span>上传</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 已上传分镜概览 */}
            <div className="card-glow bg-[#1c1f30] rounded-xl border border-[#232640] p-6">
              <h3 className="text-lg font-medium text-[#e8e6f0] mb-4 flex items-center gap-2">
                <Film className="w-5 h-5 text-[#00cec9]" />
                已上传分镜 ({currentProject.storyboard_panels.filter(p => p.generated_image_url).length})
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {currentProject.storyboard_panels
                  .filter(panel => panel.generated_image_url)
                  .map(panel => (
                    <div key={panel.id} className="relative group">
                      <img
                        src={panel.generated_image_url!}
                        alt={`分镜 ${panel.panel_number}`}
                        className="w-full h-24 object-cover rounded border border-[#232640]"
                      />
                      <div className="absolute bottom-1 left-1 right-1 bg-black/50 text-xs text-white text-center py-1 rounded">
                        {panel.chapter_number}-{panel.panel_number}
                      </div>
                      {panel.is_approved && (
                        <div className="absolute top-1 right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <Check className="w-2 h-2 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 底部导航 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-wrap gap-4 pt-6 border-t border-[#232640]"
      >
        <Link
          to={`/project/${id}/characters`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#232640] text-[#e8e6f0] rounded-lg hover:bg-[#2d2f45] transition-colors"
        >
          <Users className="w-5 h-5" />
          <span>角色管理</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to={`/project/${id}/storyboard`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#232640] text-[#e8e6f0] rounded-lg hover:bg-[#2d2f45] transition-colors"
        >
          <Film className="w-5 h-5" />
          <span>分镜管理</span>
          <ArrowRight className="w-4 h-5" />
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

export default AssetManager