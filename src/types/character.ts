export type CharacterRole = 'protagonist' | 'antagonist' | 'supporting' | 'minor'

export interface CharacterAppearance {
  gender: string
  age_appearance: string
  height: string
  build: string
  hair: string
  eyes: string
  skin: string
  facial_features: string
  outfit: string
  accessories: string[]
  special_features: string
}

export interface Character {
  id: string
  name: string
  role: CharacterRole
  appearance: CharacterAppearance
  personality: string
  background: string
  abilities: string[]
  relationships: Record<string, string>
  mj_character_prompt: string
  turnaround_image_urls: string[]
  reference_image_url: string
  created_at: string
}

/** 角色MJ提示词摘要（API返回） */
export interface CharacterMJPrompt {
  character_name: string
  role: CharacterRole
  mj_character_prompt: string
  turnaround_image_urls: string[]
  reference_image_url: string
}