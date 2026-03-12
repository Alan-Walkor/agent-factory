"""故事大纲与章节模型"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
import uuid

class StoryGenre(str, Enum):
    FANTASY = "fantasy"
    SCIFI = "sci-fi"
    ROMANCE = "romance"
    ACTION = "action"
    MYSTERY = "mystery"
    HORROR = "horror"
    SLICE_OF_LIFE = "slice_of_life"
    MECHA = "mecha"

class ChapterOutline(BaseModel):
    """章节大纲（属于故事大纲的一部分）"""
    chapter_number: int = Field(description="章节序号，从1开始")
    title: str = Field(description="章节标题")
    summary: str = Field(description="章节概要，200字以内")
    key_events: list[str] = Field(description="关键事件列表")
    characters_involved: list[str] = Field(description="涉及的角色名列表")
    location: str = Field(description="主要场景地点")
    mood: str = Field(description="章节情绪基调，如'紧张'、'温馨'、'悲伤'")
    time_of_day: str = Field(default="", description="时间段，如'黄昏'、'深夜'")

class StoryOutline(BaseModel):
    """故事大纲"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str = Field(description="作品标题")
    genre: StoryGenre = Field(description="作品类型")
    logline: str = Field(description="一句话故事梗概，50字以内")
    synopsis: str = Field(description="故事摘要，500字以内")
    themes: list[str] = Field(description="主题列表，如['友情','成长','牺牲']")
    total_chapters: int = Field(description="总章节数")
    chapter_outlines: list[ChapterOutline] = Field(default_factory=list, description="各章节大纲")
    story_arc: str = Field(description="故事弧线描述，如'英雄之旅：普通人→觉醒→试炼→至暗→决战→新生'")
    created_at: datetime = Field(default_factory=datetime.now)

class SceneDescription(BaseModel):
    """场景描述（章节剧本中的一个场景）"""
    scene_number: int = Field(description="场景序号")
    location: str = Field(description="地点")
    time: str = Field(description="时间")
    description: str = Field(description="场景描述")
    dialogue: list[dict[str, str]] = Field(default_factory=list, description="对话列表，每项为 {'character': '角色名', 'line': '台词'}")
    action: str = Field(default="", description="动作描述")
    emotion: str = Field(default="", description="情绪氛围")
    camera_note: str = Field(default="", description="镜头提示，如'特写'、'俯拍全景'")

class ChapterScript(BaseModel):
    """章节完整剧本"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    chapter_number: int = Field(description="章节序号")
    title: str = Field(description="章节标题")
    scenes: list[SceneDescription] = Field(description="场景列表")
    narrator_text: str = Field(default="", description="旁白文字")
    created_at: datetime = Field(default_factory=datetime.now)