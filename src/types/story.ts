export type StoryGenre = 'fantasy' | 'sci-fi' | 'romance' | 'action' | 'mystery' | 'horror' | 'slice_of_life' | 'mecha'

export interface ChapterOutline {
  chapter_number: number
  title: string
  summary: string
  key_events: string[]
  characters_involved: string[]
  location: string
  mood: string
  time_of_day: string
}

export interface StoryOutline {
  id: string
  title: string
  genre: StoryGenre
  logline: string
  synopsis: string
  themes: string[]
  total_chapters: number
  chapter_outlines: ChapterOutline[]
  story_arc: string
  created_at: string
}

export interface SceneDescription {
  scene_number: number
  location: string
  time: string
  description: string
  dialogue: Array<{ character: string; line: string }>
  action: string
  emotion: string
  camera_note: string
}

export interface ChapterScript {
  id: string
  chapter_number: number
  title: string
  scenes: SceneDescription[]
  narrator_text: string
  created_at: string
}