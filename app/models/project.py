"""项目总模型"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
import uuid

from app.models.world import WorldSetting
from app.models.character import Character
from app.models.story import StoryOutline, ChapterScript
from app.models.storyboard import StoryboardPanel
from app.models.asset import Asset

class ProjectStatus(str, Enum):
    INIT = "init"                              # 初始化
    WORLDBUILDING = "worldbuilding"            # 世界观构建中
    OUTLINING = "outlining"                    # 大纲编排中
    SCRIPTING = "scripting"                    # 剧本编写中
    STORYBOARDING = "storyboarding"            # 分镜设计中
    CHARACTER_DESIGN = "character_design"       # 角色设计中
    MJ_PROMPT_READY = "mj_prompt_ready"        # MJ提示词已就绪，等待人工生成
    ASSET_COLLECTING = "asset_collecting"       # 资产回收中
    POST_PRODUCTION = "post_production"         # 后期制作中
    COMPLETED = "completed"                     # 完成

class Project(BaseModel):
    """项目总模型 — 一个完整的动漫作品"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(description="项目名称")
    status: ProjectStatus = Field(default=ProjectStatus.INIT, description="项目当前状态")

    # 世界观
    world_setting: Optional[WorldSetting] = Field(default=None)

    # 角色
    characters: list[Character] = Field(default_factory=list)

    # 故事
    story_outline: Optional[StoryOutline] = Field(default=None)
    chapter_scripts: list[ChapterScript] = Field(default_factory=list)

    # 分镜
    storyboard_panels: list[StoryboardPanel] = Field(default_factory=list)

    # 资产
    assets: list[Asset] = Field(default_factory=list)

    # 元信息
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    notes: str = Field(default="", description="项目备注")

    def get_character_by_name(self, name: str) -> Optional[Character]:
        """根据名称查找角色"""
        for c in self.characters:
            if c.name == name:
                return c
        return None

    def get_chapter_script(self, chapter_number: int) -> Optional[ChapterScript]:
        """根据章节号查找剧本"""
        for s in self.chapter_scripts:
            if s.chapter_number == chapter_number:
                return s
        return None

    def get_panels_by_chapter(self, chapter_number: int) -> list[StoryboardPanel]:
        """获取指定章节的所有分镜"""
        return [p for p in self.storyboard_panels if p.chapter_number == chapter_number]