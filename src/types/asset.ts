export type AssetType =
  | 'character_turnaround'
  | 'character_reference'
  | 'storyboard_image'
  | 'background'
  | 'prop'
  | 'final_frame'

export interface Asset {
  id: string
  project_id: string
  asset_type: AssetType
  name: string
  description: string
  character_id: string | null
  panel_id: string | null
  url: string
  local_path: string | null
  file_format: string
  width: number | null
  height: number | null
  mj_prompt_used: string
  mj_job_id: string
  created_at: string
}