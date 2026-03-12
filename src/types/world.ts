export interface MagicSystem {
  name: string
  rules: string
  levels: string[]
  limitations: string
}

export interface SocialStructure {
  government: string
  factions: string[]
  economy: string
  culture: string
}

export interface WorldSetting {
  id: string
  name: string
  era: string
  description: string
  geography: string
  magic_system: MagicSystem | null
  social_structure: SocialStructure | null
  key_locations: string[]
  visual_style: string
  color_palette: string[]
  created_at: string
}