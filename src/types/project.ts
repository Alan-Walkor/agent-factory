/** 项目状态枚举 */
export type ProjectStatus =
  | 'init'
  | 'worldbuilding'
  | 'outlining'
  | 'scripting'
  | 'storyboarding'
  | 'character_design'
  | 'mj_prompt_ready'
  | 'asset_collecting'
  | 'post_production'
  | 'completed'

/** 项目摘要（列表用） */
export interface ProjectSummary {
  id: string
  name: string
  status: ProjectStatus
  created_at: string
  updated_at: string
}

/** 项目完整数据 */
export interface Project {
  id: string
  name: string
  status: ProjectStatus
  world_setting: WorldSetting | null
  characters: Character[]
  story_outline: StoryOutline | null
  chapter_scripts: ChapterScript[]
  storyboard_panels: StoryboardPanel[]
  assets: Asset[]
  created_at: string
  updated_at: string
  notes: string
}