/**
 * 项目状态管理。
 * 管理当前选中的项目、项目列表、加载状态。
 */
import { create } from 'zustand'
import type { Project, ProjectSummary, CharacterMJPrompt, PanelMJPrompt, PendingPanel } from '@/types'
import { projectApi } from '@/api/projectApi'
import { agentApi, type PhaseOneRequest } from '@/api/agentApi'
import { assetApi } from '@/api/assetApi'

interface ProjectState {
  // 数据
  projects: ProjectSummary[]
  currentProject: Project | null
  characterPrompts: CharacterMJPrompt[]
  panelPrompts: PanelMJPrompt[]
  pendingPanels: PendingPanel[]

  // 加载状态
  isLoading: boolean
  isAgentRunning: boolean
  agentProgress: string   // 当前Agent执行的阶段描述

  // 错误
  error: string | null

  // Actions — 项目管理
  fetchProjects: () => Promise<void>
  fetchProject: (id: string) => Promise<void>
  deleteProject: (id: string) => Promise<void>

  // Actions — Agent 调用
  runPhaseOne: (req: PhaseOneRequest) => Promise<string | null>
  generateStoryboardPrompts: (projectId: string) => Promise<void>
  runPhaseTwo: (projectId: string) => Promise<any[]>

  // Actions — 资产管理
  fetchCharacterPrompts: (projectId: string) => Promise<void>
  fetchPanelPrompts: (projectId: string, chapter?: number) => Promise<void>
  fetchPendingPanels: (projectId: string) => Promise<void>
  uploadTurnaround: (projectId: string, characterName: string, urls: string[], prompt: string) => Promise<void>
  setReference: (projectId: string, characterName: string, url: string) => Promise<void>
  uploadStoryboardImage: (projectId: string, panelId: string, url: string) => Promise<void>
  approvePanel: (projectId: string, panelId: string) => Promise<void>
  updateStoryboardStatus: (projectId: string, panelId: string, status: 'pending' | 'approved' | 'rejected') => Promise<void>
  generateStoryboardImages: (projectId: string, panelId: string) => Promise<void>

  // 工具
  clearError: () => void
  setAgentProgress: (msg: string) => void
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  // 初始值
  projects: [],
  currentProject: null,
  characterPrompts: [],
  panelPrompts: [],
  pendingPanels: [],
  isLoading: false,
  isAgentRunning: false,
  agentProgress: '',
  error: null,

  // ==================== 项目管理 ====================

  fetchProjects: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await projectApi.list()
      set({ projects: res.data, isLoading: false })
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
    }
  },

  fetchProject: async (id: string) => {
    set({ isLoading: true, error: null })
    try {
      const res = await projectApi.get(id)
      set({ currentProject: res.data, isLoading: false })
    } catch (e: any) {
      set({ error: e.message, isLoading: false })
    }
  },

  deleteProject: async (id: string) => {
    try {
      await projectApi.delete(id)
      set((state) => ({
        projects: state.projects.filter((p) => p.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
      }))
    } catch (e: any) {
      set({ error: e.message })
    }
  },

  // ==================== Agent 调用 ====================

  runPhaseOne: async (req: PhaseOneRequest) => {
    set({ isAgentRunning: true, agentProgress: '正在初始化项目...', error: null })
    try {
      set({ agentProgress: '正在构建世界观 → 编排大纲 → 设计角色 → 编写剧本 → 拆解分镜...' })
      const res = await agentApi.runPhaseOne(req)
      set({
        isAgentRunning: false,
        agentProgress: `阶段一完成！角色${res.data.character_count}个，章节${res.data.chapter_count}个，分镜${res.data.panel_count}个`,
      })
      // 刷新项目列表
      await get().fetchProjects()
      return res.data.project_id
    } catch (e: any) {
      set({ error: e.message, isAgentRunning: false, agentProgress: '' })
      return null
    }
  },

  generateStoryboardPrompts: async (projectId: string) => {
    set({ isAgentRunning: true, agentProgress: '正在为分镜生成MJ提示词（含角色参考图）...', error: null })
    try {
      const res = await agentApi.generateStoryboardPrompts(projectId)
      set({
        isAgentRunning: false,
        agentProgress: `提示词生成完成！共${res.data.panel_count}个分镜`,
      })
      await get().fetchProject(projectId)
    } catch (e: any) {
      set({ error: e.message, isAgentRunning: false, agentProgress: '' })
    }
  },

  runPhaseTwo: async (projectId: string) => {
    set({ isAgentRunning: true, agentProgress: '正在生成剪辑脚本...', error: null })
    try {
      const res = await agentApi.runPhaseTwo(projectId)
      set({ isAgentRunning: false, agentProgress: '阶段二完成！' })
      await get().fetchProject(projectId)
      return res.data.editing_scripts
    } catch (e: any) {
      set({ error: e.message, isAgentRunning: false, agentProgress: '' })
      return []
    }
  },

  // ==================== 资产管理 ====================

  fetchCharacterPrompts: async (projectId: string) => {
    try {
      const res = await projectApi.getCharacterMJPrompts(projectId)
      set({ characterPrompts: res.data })
    } catch (e: any) {
      set({ error: e.message })
    }
  },

  fetchPanelPrompts: async (projectId: string, chapter?: number) => {
    try {
      const res = await projectApi.getPanelMJPrompts(projectId, chapter)
      set({ panelPrompts: res.data })
    } catch (e: any) {
      set({ error: e.message })
    }
  },

  fetchPendingPanels: async (projectId: string) => {
    try {
      const res = await projectApi.getPendingPanels(projectId)
      set({ pendingPanels: res.data })
    } catch (e: any) {
      set({ error: e.message })
    }
  },

  uploadTurnaround: async (projectId, characterName, urls, prompt) => {
    try {
      await assetApi.addCharacterTurnaround(projectId, {
        character_name: characterName,
        image_urls: urls,
        mj_prompt_used: prompt,
      })
      await get().fetchCharacterPrompts(projectId)
      await get().fetchProject(projectId)
    } catch (e: any) {
      set({ error: e.message })
    }
  },

  setReference: async (projectId, characterName, url) => {
    try {
      await assetApi.setCharacterReference(projectId, {
        character_name: characterName,
        reference_url: url,
      })
      await get().fetchCharacterPrompts(projectId)
      await get().fetchProject(projectId)
    } catch (e: any) {
      set({ error: e.message })
    }
  },

  uploadStoryboardImage: async (projectId, panelId, url) => {
    try {
      await assetApi.addStoryboardImage(projectId, { panel_id: panelId, image_url: url })
      await get().fetchPendingPanels(projectId)
      await get().fetchProject(projectId)
    } catch (e: any) {
      set({ error: e.message })
    }
  },

  approvePanel: async (projectId, panelId) => {
    try {
      await assetApi.approvePanel(projectId, panelId)
      await get().fetchProject(projectId)
    } catch (e: any) {
      set({ error: e.message })
    }
  },

  updateStoryboardStatus: async (projectId, panelId, status) => {
    try {
      await assetApi.updatePanelStatus(projectId, { panel_id: panelId, status })
      await get().fetchProject(projectId)
    } catch (e: any) {
      set({ error: e.message })
    }
  },

  generateStoryboardImages: async (projectId, panelId) => {
    set({ isAgentRunning: true, agentProgress: '正在生成分镜图片...', error: null })
    try {
      const res = await agentApi.generateStoryboardImages(projectId, panelId)
      set({
        isAgentRunning: false,
        agentProgress: '分镜图片生成完成！',
      })
      await get().fetchProject(projectId)
    } catch (e: any) {
      set({ error: e.message, isAgentRunning: false, agentProgress: '' })
    }
  },

  // ==================== 工具 ====================
  clearError: () => set({ error: null }),
  setAgentProgress: (msg: string) => set({ agentProgress: msg }),
}))