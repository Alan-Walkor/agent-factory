export type ShotType =
  | 'extreme wide shot'
  | 'wide shot'
  | 'medium shot'
  | 'medium close-up'
  | 'close-up'
  | 'extreme close-up'
  | 'over-the-shoulder shot'
  | 'POV shot'
  | "bird's eye view"
  | 'low angle shot'
  | 'high angle shot'
  | 'dutch angle'

export interface StoryboardPanel {
  id: string
  panel_number: number
  chapter_number: number
  scene_number: number
  shot_type: ShotType
  visual_description: string
  characters_in_frame: string[]
  character_actions: Record<string, string>
  background: string
  lighting: string
  mood: string
  dialogue_overlay: string
  sound_effect: string
  duration_seconds: number
  mj_prompt: string
  mj_parameters: string
  generated_image_url: string
  is_approved: boolean
  created_at: string
}

/** 分镜MJ提示词摘要（API返回） */
export interface PanelMJPrompt {
  panel_id: string
  panel_number: number
  chapter_number: number
  scene_number: number
  visual_description: string
  mj_prompt: string
  generated_image_url: string
  is_approved: boolean
}

/** 待上传分镜（API返回） */
export interface PendingPanel {
  panel_id: string
  panel_number: number
  chapter_number: number
  scene_number: number
  mj_prompt: string
  visual_description: string
}