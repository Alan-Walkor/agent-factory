import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useProjectStore } from '@/store/useProjectStore'
import { useUIStore } from '@/store/useUIStore'
import {
  Grid3X3, List, Filter, Search, Upload, Check, X,
  ChevronLeft, ChevronRight, ZoomIn, RotateCcw,
  Copy, CheckCircle, AlertCircle, Clock, Eye,
  Download, MoreHorizontal, BookOpen, Users,
  Sparkles, ArrowRight
} from 'lucide-react'

const Storyboard = () => {
  const { id } = useParams<{ id: string }>()
  const {
    currentProject, fetchProject,
    fetchStoryboards, updateStoryboardStatus, generateStoryboardImages,
    uploadStoryboardImage, isAgentRunning, agentProgress
  } = useProjectStore()
  const { addToast } = useUIStore()

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedChapter, setSelectedChapter] = useState<number | 'all'>('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPanels, setSelectedPanels] = useState<Set<string>>(new Set())
  const [uploadUrl, setUploadUrl] = useState('')
  const [detailModal, setDetailModal] = useState<{
    open: boolean
    panel?: any
    mode: 'view' | 'upload'
  }>({ open: false, mode: 'view' })
  const [bulkAction, setBulkAction] = useState<'approve' | 'reject' | 'regenerate' | null>(null)

  // 获取当前章节的分镜
  const getFilteredPanels = () => {
    if (!currentProject?.storyboard_panels) return []

    let filtered = currentProject.storyboard_panels

    // 过滤章节
    if (selectedChapter !== 'all') {
      filtered = filtered.filter(panel => panel.chapter_number === selectedChapter)
    }

    // 搜索过滤
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(panel =>
        panel.visual_description.toLowerCase().includes(term) ||
        panel.mj_prompt.toLowerCase().includes(term) ||
        panel.generated_image_url?.toLowerCase().includes(term)
      )
    }

    return filtered
  }

  // 获取所有章节编号
  const getChapters = () => {
    if (!currentProject?.storyboard_panels) return []
    return [...new Set(currentProject.storyboard_panels.map(panel => panel.chapter_number))]
      .sort((a, b) => a - b)
  }

  // 统计信息
  const getStats = () => {
    if (!currentProject?.storyboard_panels) return { total: 0, approved: 0, pending: 0, rejected: 0 }

    const allPanels = currentProject.storyboard_panels
    return {
      total: allPanels.length,
      approved: allPanels.filter(p => p.is_approved).length,
      pending: allPanels.filter(p => !p.is_approved).length,
      rejected: 0 // rejected panels are not stored separately, only those with is_approved = false
    }
  }

  // 加载项目和分镜数据
  useEffect(() => {
    if (id && id !== 'undefined') {
      fetchProject(id)
      fetchStoryboards(id)
    }
  }, [id])

  // 批量操作处理
  const handleBulkAction = async () => {
    if (!bulkAction || selectedPanels.size === 0) return
    if (!id || id === 'undefined') { addToast('error', '项目ID无效'); return }

    const panelIds = Array.from(selectedPanels)
    try {
      for (const panelId of panelIds) {
        if (bulkAction === 'approve') {
          await updateStoryboardStatus(id, panelId, 'approved') // We assume this API handles is_approved flag appropriately
        } else if (bulkAction === 'reject') {
          await updateStoryboardStatus(id, panelId, 'rejected') // We assume this API handles rejection appropriately
        } else if (bulkAction === 'regenerate') {
          // 重新生成图片
          await generateStoryboardImages(id, panelId)
        }
      }

      addToast('success', `批量操作完成`)
      setSelectedPanels(new Set())
      setBulkAction(null)
    } catch (error) {
      addToast('error', '批量操作失败')
    }
  }

  // 单个面板操作
  const handlePanelAction = async (panelId: string, action: 'approve' | 'reject' | 'regenerate') => {
    if (!id || id === 'undefined') { addToast('error', '项目ID无效'); return }
    try {
      if (action === 'approve') {
        await updateStoryboardStatus(id, panelId, 'approved')
        addToast('success', '分镜已批准')
      } else if (action === 'reject') {
        await updateStoryboardStatus(id, panelId, 'rejected')
        addToast('success', '分镜已拒绝')
      } else if (action === 'regenerate') {
        await generateStoryboardImages(id, panelId)
        addToast('success', '重新生成分镜图片')
      }
    } catch (error) {
      addToast('error', `操作失败: ${error}`)
    }
  }

  // 复制MJ提示词
  const copyPrompt = async (text: string, panelId: string) => {
    try {
      await navigator.clipboard.writeText(text)
      addToast('success', '提示词已复制')
    } catch (error) {
      addToast('error', '复制失败')
    }
  }

  const filteredPanels = getFilteredPanels()
  const chapters = getChapters()
  const stats = getStats()

  if (!currentProject) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="text-center">
          <Grid3X3 className="w-16 h-16 text-[#6c5ce7]/50 mx-auto mb-4" />
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
            <h1 className="text-3xl font-serif font-bold text-[#e8e6f0] mb-2">分镜管理</h1>
            <p className="text-[#9694a8]">
              管理所有分镜的MJ提示词和图片
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-[#9694a8]">总计:</span>
              <span className="text-[#e8e6f0]">{stats.total}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle className="w-4 h-4 text-[#55efc4]" />
              <span className="text-[#9694a8]">已批准:</span>
              <span className="text-[#e8e6f0]">{stats.approved}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-[#fdcb6e]" />
              <span className="text-[#9694a8]">待处理:</span>
              <span className="text-[#e8e6f0]">{stats.pending}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4 text-[#ff7675]" />
              <span className="text-[#9694a8]">已拒绝:</span>
              <span className="text-[#e8e6f0]">{stats.rejected}</span>
            </div>
          </div>
        </div>

        {/* 控制栏 */}
        <div className="flex flex-wrap gap-4 mb-6 p-4 bg-[#1c1f30] rounded-xl border border-[#232640]">
          {/* 章节筛选 */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#9694a8]" />
            <select
              value={selectedChapter}
              onChange={(e) => setSelectedChapter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="px-3 py-2 bg-[#232640] border border-[#232640] rounded text-[#e8e6f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]"
            >
              <option value="all">所有章节</option>
              {chapters.map(chapter => (
                <option key={chapter} value={chapter}>{chapter}章</option>
              ))}
            </select>
          </div>

          {/* 搜索 */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#9694a8]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="搜索场景描述或提示词..."
              className="w-full pl-10 pr-4 py-2 bg-[#232640] border border-[#232640] rounded text-[#e8e6f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]"
            />
          </div>

          {/* 视图模式切换 */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-[#6c5ce7]/20 text-[#6c5ce7]'
                  : 'text-[#9694a8] hover:bg-[#232640]'
              }`}
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-[#6c5ce7]/20 text-[#6c5ce7]'
                  : 'text-[#9694a8] hover:bg-[#232640]'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* 批量操作 */}
          {selectedPanels.size > 0 && (
            <div className="flex items-center gap-2 ml-auto">
              <span className="text-sm text-[#9694a8]">{selectedPanels.size} 项选中</span>
              <select
                value={bulkAction || ''}
                onChange={(e) => setBulkAction(e.target.value as any)}
                className="px-3 py-2 bg-[#232640] border border-[#232640] rounded text-[#e8e6f0] text-sm focus:outline-none focus:ring-2 focus:ring-[#6c5ce7]"
              >
                <option value="">批量操作</option>
                <option value="approve">批准</option>
                <option value="reject">拒绝</option>
                <option value="regenerate">重新生成</option>
              </select>
              {bulkAction && (
                <button
                  onClick={handleBulkAction}
                  className="px-3 py-2 bg-[#6c5ce7] text-white rounded text-sm hover:bg-[#5d50d1] transition-colors"
                >
                  确认
                </button>
              )}
            </div>
          )}
        </div>

        {/* 生成分镜图片按钮 */}
        <div className="mb-6">
          <button
            onClick={() => {
              // 这里可以触发生成分镜图片的逻辑
              addToast('info', '开始生成分镜图片...')
            }}
            disabled={isAgentRunning}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] text-white rounded-lg hover:shadow-lg hover:shadow-[#6c5ce7]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isAgentRunning ? (
              <>
                <RotateCcw className="w-4 h-4 animate-spin" />
                <span>生成中...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>生成分镜图片</span>
              </>
            )}
          </button>

          {isAgentRunning && (
            <div className="text-sm text-[#9694a8] mt-2">{agentProgress}</div>
          )}
        </div>
      </motion.div>

      {/* 分镜面板列表 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6' : 'space-y-4'}
      >
        {filteredPanels.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
            <Grid3X3 className="w-16 h-16 text-[#6c5ce7]/30 mb-4" />
            <h3 className="text-lg font-medium text-[#e8e6f0] mb-2">暂无分镜面板</h3>
            <p className="text-sm text-[#9694a8] mb-4">
              {currentProject.storyboard_panels.length === 0
                ? '请先在世界观页面执行「步骤四：生成剧本与分镜」'
                : '当前筛选条件下没有匹配的分镜面板'}
            </p>
            {currentProject.storyboard_panels.length === 0 && (
              <Link
                to={`/project/${id}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] text-white rounded-lg hover:shadow-lg hover:shadow-[#6c5ce7]/20 transition-all duration-300"
              >
                <ArrowRight className="w-4 h-4 rotate-180" />
                <span>前往世界观页面生成</span>
              </Link>
            )}
          </div>
        )}
        {filteredPanels.map((panel) => (
          <motion.div
            key={panel.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`relative ${
              viewMode === 'grid'
                ? 'card-glow bg-[#1c1f30] rounded-xl border border-[#232640] overflow-hidden'
                : 'card-glow bg-[#1c1f30] rounded-xl border border-[#232640] p-4'
            }`}
          >
            {/* 选择框 */}
            <div className="absolute top-3 left-3">
              <input
                type="checkbox"
                checked={selectedPanels.has(panel.id)}
                onChange={(e) => {
                  const newSelected = new Set(selectedPanels)
                  if (e.target.checked) {
                    newSelected.add(panel.id)
                  } else {
                    newSelected.delete(panel.id)
                  }
                  setSelectedPanels(newSelected)
                }}
                className="w-4 h-4 text-[#6c5ce7] bg-[#232640] border-[#232640] rounded focus:ring-[#6c5ce7] focus:ring-2"
              />
            </div>

            {/* 章节标签 */}
            <div className="flex items-center justify-between p-4 pb-2">
              <span className="px-2 py-1 bg-[#00cec9]/10 text-[#00cec9] text-xs rounded-full border border-[#00cec9]/20">
                第 {panel.chapter_number} 章
              </span>

              {/* 状态标签 */}
              <span className={`px-2 py-1 text-xs rounded-full border text-xs ${
                panel.is_approved
                  ? 'bg-[#55efc4]/10 text-[#55efc4] border-[#55efc4]/20'
                  : 'bg-[#fdcb6e]/10 text-[#fdcb6e] border-[#fdcb6e]/20'
              }`}>
                {panel.is_approved ? '已批准' : '待处理'}
              </span>
            </div>

            {/* 图像区域 */}
            <div className="relative aspect-video bg-[#232640] rounded-lg overflow-hidden mb-4 mx-4">
              {panel.generated_image_url ? (
                <img
                  src={panel.generated_image_url}
                  alt={`分镜 ${panel.id}`}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setDetailModal({ open: true, panel, mode: 'view' })}
                />
              ) : (
                <div
                  className="w-full h-full flex items-center justify-center text-[#9694a8] cursor-pointer"
                  onClick={() => setDetailModal({ open: true, panel, mode: 'upload' })}
                >
                  <div className="text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2" />
                    <p className="text-sm">点击上传图片</p>
                  </div>
                </div>
              )}

              {/* 操作按钮覆盖层 */}
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  onClick={() => setDetailModal({ open: true, panel, mode: 'view' })}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDetailModal({ open: true, panel, mode: 'upload' })}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <button
                  onClick={() => copyPrompt(panel.mj_prompt, panel.id)}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 场景描述 */}
            <div className="px-4 mb-4">
              <p className="text-sm text-[#e8e6f0] line-clamp-2">{panel.visual_description}</p>
            </div>

            {/* 动作按钮 */}
            <div className="px-4 pb-4">
              <div className="flex gap-2">
                <button
                  onClick={() => handlePanelAction(panel.id, 'approve')}
                  disabled={panel.is_approved}
                  className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-sm transition-colors ${
                    panel.is_approved
                      ? 'bg-[#55efc4]/20 text-[#55efc4] cursor-not-allowed'
                      : 'bg-[#55efc4]/10 text-[#55efc4] hover:bg-[#55efc4]/20'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>批准</span>
                </button>

                <button
                  onClick={() => handlePanelAction(panel.id, 'reject')}
                  disabled={false} /* Reject button always enabled since we don't store reject state separately */
                  className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-sm transition-colors ${
                    'bg-[#ff7675]/10 text-[#ff7675] hover:bg-[#ff7675]/20'
                  }`}
                >
                  <X className="w-4 h-4" />
                  <span>拒绝</span>
                </button>

                <button
                  onClick={() => handlePanelAction(panel.id, 'regenerate')}
                  className="flex-1 flex items-center justify-center gap-1 py-2 px-3 bg-[#6c5ce7]/10 text-[#6c5ce7] rounded-lg text-sm hover:bg-[#6c5ce7]/20 transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>重绘</span>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* 详情模态框 */}
      <AnimatePresence>
        {detailModal.open && detailModal.panel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => setDetailModal({ open: false, mode: 'view' })}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#1c1f30] rounded-2xl border border-[#232640] w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* 模态框头部 */}
              <div className="flex items-center justify-between p-6 border-b border-[#232640]">
                <div>
                  <h3 className="text-lg font-medium text-[#e8e6f0]">
                    {detailModal.mode === 'view' ? '查看分镜' : '上传分镜图片'} - 第 {detailModal.panel.chapter_number} 章
                  </h3>
                  <p className="text-sm text-[#9694a8]">{detailModal.panel.visual_description}</p>
                </div>
                <button
                  onClick={() => setDetailModal({ open: false, mode: 'view' })}
                  className="p-2 text-[#9694a8] hover:text-[#e8e6f0] hover:bg-[#232640] rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 模态框内容 */}
              <div className="flex-1 overflow-auto p-6">
                {detailModal.mode === 'view' ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 左侧：图片预览 */}
                    <div>
                      <h4 className="text-sm font-medium text-[#e8e6f0] mb-3">分镜图片</h4>
                      {detailModal.panel.generated_image_url ? (
                        <img
                          src={detailModal.panel.generated_image_url}
                          alt="分镜预览"
                          className="w-full h-64 object-contain rounded-lg bg-[#232640] border border-[#232640]"
                        />
                      ) : (
                        <div className="w-full h-64 flex items-center justify-center bg-[#232640] border border-dashed border-[#232640] rounded-lg">
                          <div className="text-center text-[#9694a8]">
                            <Upload className="w-12 h-12 mx-auto mb-2" />
                            <p>暂无图片</p>
                            <button
                              onClick={() => setDetailModal(prev => ({ ...prev, mode: 'upload' }))}
                              className="mt-2 px-4 py-2 bg-[#6c5ce7] text-white rounded-lg text-sm hover:bg-[#5d50d1] transition-colors"
                            >
                              上传图片
                            </button>
                          </div>
                        </div>
                      )}

                      {/* 操作按钮 */}
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => copyPrompt(detailModal.panel.mj_prompt, detailModal.panel.id)}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-[#232640] text-[#e8e6f0] rounded-lg hover:bg-[#2d2f45] transition-colors"
                        >
                          <Copy className="w-4 h-4" />
                          <span>复制提示词</span>
                        </button>
                        <button
                          onClick={() => setDetailModal(prev => ({ ...prev, mode: 'upload' }))}
                          className="flex-1 flex items-center justify-center gap-2 py-2 px-4 bg-[#6c5ce7] text-white rounded-lg hover:shadow-lg hover:shadow-[#6c5ce7]/20 transition-all"
                        >
                          <Upload className="w-4 h-4" />
                          <span>上传图片</span>
                        </button>
                      </div>
                    </div>

                    {/* 右侧：提示词详情 */}
                    <div>
                      <h4 className="text-sm font-medium text-[#e8e6f0] mb-3">Midjourney提示词</h4>
                      <div className="bg-[#232640] rounded-lg p-4 border border-[#232640] h-64 overflow-auto">
                        <pre className="text-sm text-[#e8e6f0] whitespace-pre-wrap font-mono">
                          {detailModal.panel.mj_prompt}
                        </pre>
                      </div>

                      {/* 状态和角色引用 */}
                      <div className="mt-4 space-y-3">
                        <div>
                          <h5 className="text-sm font-medium text-[#e8e6f0] mb-2">角色引用</h5>
                          <div className="flex flex-wrap gap-2">
                            {detailModal.panel.characters_in_frame?.map((ref, idx) => (
                              <span key={idx} className="px-2 py-1 bg-[#a29bfe]/10 text-[#a29bfe] text-xs rounded border border-[#a29bfe]/20">
                                {ref}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <button
                            onClick={() => handlePanelAction(detailModal.panel!.id, 'approve')}
                            disabled={detailModal.panel?.is_approved}
                            className={`flex-1 py-2 px-4 rounded-lg text-sm transition-colors ${
                              detailModal.panel?.is_approved
                                ? 'bg-[#55efc4]/20 text-[#55efc4] cursor-not-allowed'
                                : 'bg-[#55efc4]/10 text-[#55efc4] hover:bg-[#55efc4]/20'
                            }`}
                          >
                            批准此分镜
                          </button>

                          <button
                            onClick={() => handlePanelAction(detailModal.panel!.id, 'reject')}
                            disabled={false} /* Reject button always enabled since we don't store reject state separately */
                            className={`flex-1 py-2 px-4 rounded-lg text-sm transition-colors ${
                              'bg-[#ff7675]/10 text-[#ff7675] hover:bg-[#ff7675]/20'
                            }`}
                          >
                            拒绝此分镜
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  // 上传模式
                  <div className="space-y-6">
                    <h4 className="text-lg font-medium text-[#e8e6f0]">上传分镜图片</h4>

                    <div>
                      <label className="block text-sm font-medium text-[#e8e6f0] mb-2">图片URL</label>
                      <input
                        type="text"
                        value={uploadUrl}
                        onChange={(e) => setUploadUrl(e.target.value)}
                        placeholder="输入图片URL..."
                        className="w-full px-4 py-3 bg-[#232640] border border-[#232640] rounded-lg text-[#e8e6f0] placeholder-[#5c5a6e] focus:outline-none focus:ring-2 focus:ring-[#6c5ce7] focus:border-transparent"
                      />
                      <p className="text-xs text-[#9694a8] mt-2">支持直接输入MJ生成的图片URL</p>
                    </div>

                    <div className="border-2 border-dashed border-[#232640] rounded-lg p-8 text-center">
                      <Upload className="w-12 h-12 text-[#9694a8] mx-auto mb-4" />
                      <p className="text-[#e8e6f0] mb-2">拖拽图片到这里或点击上传</p>
                      <p className="text-sm text-[#9694a8]">支持PNG, JPG格式，最大10MB</p>
                    </div>

                    <div className="flex gap-3 pt-4">
                      <button
                        onClick={() => setDetailModal({ open: false, mode: 'view' })}
                        className="flex-1 py-3 px-4 bg-[#232640] text-[#e8e6f0] rounded-lg hover:bg-[#2d2f45] transition-colors"
                      >
                        取消
                      </button>
                      <button
                        onClick={async () => {
                          if (!uploadUrl.trim() || !detailModal.panel || !id) return
                          try {
                            await uploadStoryboardImage(id, detailModal.panel.id, uploadUrl.trim())
                            addToast('success', '图片上传成功')
                            setUploadUrl('')
                            setDetailModal({ open: false, mode: 'view' })
                            fetchProject(id)
                          } catch (error) {
                            addToast('error', '上传失败')
                          }
                        }}
                        className="flex-1 py-3 px-4 bg-gradient-to-r from-[#6c5ce7] to-[#00cec9] text-white rounded-lg hover:shadow-lg hover:shadow-[#6c5ce7]/20 transition-all"
                      >
                        上传并保存
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
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
          to={`/project/${id}/story`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#232640] text-[#e8e6f0] rounded-lg hover:bg-[#2d2f45] transition-colors"
        >
          <BookOpen className="w-5 h-5" />
          <span>故事大纲</span>
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

export default Storyboard