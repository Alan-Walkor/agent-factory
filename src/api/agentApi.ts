import apiClient from './client'

export interface PhaseOneRequest {
  project_name: string
  world_idea: string
  story_requirements: string
  total_chapters: number
}

export interface PhaseOneResponse {
  project_id: string
  status: string
  message: string
  next_step: string
  character_count: number
  chapter_count: number
  panel_count: number
}

export const agentApi = {
  /** 执行阶段一 */
  runPhaseOne: (req: PhaseOneRequest) =>
    apiClient.post<PhaseOneResponse>('/agents/phase-one', req),

  /** 生成分镜MJ提示词（角色参考图设置完成后调用） */
  generateStoryboardPrompts: (projectId: string) =>
    apiClient.post<{ project_id: string; status: string; message: string; panel_count: number }>(
      `/agents/${projectId}/generate-storyboard-prompts`
    ),

  /** 执行阶段二 */
  runPhaseTwo: (projectId: string) =>
    apiClient.post<{ project_id: string; message: string; chapters_processed: number; editing_scripts: any[] }>(
      `/agents/${projectId}/phase-two`
    ),

  /** 生成分镜图片 */
  generateStoryboardImages: (projectId: string, panelId: string) =>
    apiClient.post<{ project_id: string; panel_id: string; status: string; message: string }>(
      `/agents/${projectId}/panels/${panelId}/generate-images`
    ),
}