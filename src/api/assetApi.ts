import apiClient from './client'

export const assetApi = {
  /** 上传角色三视图 */
  addCharacterTurnaround: (projectId: string, data: {
    character_name: string
    image_urls: string[]
    mj_prompt_used?: string
  }) =>
    apiClient.post(`/assets/${projectId}/character-turnaround`, data),

  /** 设置角色参考图 */
  setCharacterReference: (projectId: string, data: {
    character_name: string
    reference_url: string
  }) =>
    apiClient.post(`/assets/${projectId}/character-reference`, data),

  /** 上传分镜图片 */
  addStoryboardImage: (projectId: string, data: {
    panel_id: string
    image_url: string
  }) =>
    apiClient.post(`/assets/${projectId}/storyboard-image`, data),

  /** 审核分镜 */
  approvePanel: (projectId: string, panelId: string) =>
    apiClient.post(`/assets/${projectId}/panels/${panelId}/approve`),

  /** 更新分镜状态 */
  updatePanelStatus: (projectId: string, data: {
    panel_id: string
    status: 'pending' | 'approved' | 'rejected'
  }) =>
    apiClient.put(`/assets/${projectId}/panels/${data.panel_id}/status`, { status: data.status }),

  /** 批量上传分镜图片 */
  batchAddStoryboardImages: (projectId: string, images: Array<{
    panel_id: string
    image_url: string
  }>) =>
    apiClient.post(`/assets/${projectId}/storyboard-images/batch`, { images }),
}