import apiClient from './client'
import type { ProjectSummary, Project, CharacterMJPrompt, PanelMJPrompt, PendingPanel } from '@/types'

export const projectApi = {
  /** 创建项目 */
  create: (name: string) =>
    apiClient.post<{ project_id: string; name: string; status: string }>('/projects/', { name }),

  /** 获取项目列表 */
  list: () =>
    apiClient.get<ProjectSummary[]>('/projects/'),

  /** 获取项目详情 */
  get: (id: string) =>
    apiClient.get<Project>(`/projects/${id}`),

  /** 删除项目 */
  delete: (id: string) =>
    apiClient.delete(`/projects/${id}`),

  /** 获取角色MJ提示词列表 */
  getCharacterMJPrompts: (id: string) =>
    apiClient.get<CharacterMJPrompt[]>(`/projects/${id}/characters/mj-prompts`),

  /** 获取分镜MJ提示词列表 */
  getPanelMJPrompts: (id: string, chapter?: number) =>
    apiClient.get<PanelMJPrompt[]>(`/projects/${id}/panels/mj-prompts`, {
      params: chapter ? { chapter } : {},
    }),

  /** 获取待上传分镜 */
  getPendingPanels: (id: string) =>
    apiClient.get<PendingPanel[]>(`/projects/${id}/panels/pending`),

  /** 获取所有分镜 */
  getStoryboards: (id: string) =>
    apiClient.get(`/projects/${id}/storyboards`),
}