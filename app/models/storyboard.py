"""分镜数据模型"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
import uuid

class ShotType(str, Enum):
    """镜头类型"""
    EXTREME_WIDE = "extreme wide shot"       # 超远景
    WIDE = "wide shot"                        # 远景
    MEDIUM = "medium shot"                    # 中景
    MEDIUM_CLOSE = "medium close-up"          # 中近景
    CLOSE_UP = "close-up"                     # 特写
    EXTREME_CLOSE_UP = "extreme close-up"     # 超特写
    OVER_SHOULDER = "over-the-shoulder shot"  # 过肩镜头
    POV = "POV shot"                          # 第一人称视角
    BIRD_EYE = "bird's eye view"             # 鸟瞰
    LOW_ANGLE = "low angle shot"             # 仰拍
    HIGH_ANGLE = "high angle shot"           # 俯拍
    DUTCH_ANGLE = "dutch angle"              # 斜角

class StoryboardPanel(BaseModel):
    """单个分镜面板"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    panel_number: int = Field(description="分镜序号")
    chapter_number: int = Field(description="所属章节序号")
    scene_number: int = Field(description="所属场景序号")

    # 画面内容描述
    shot_type: ShotType = Field(description="镜头类型")
    visual_description: str = Field(description="画面内容的详细文字描述")
    characters_in_frame: list[str] = Field(default_factory=list, description="画面中出现的角色名列表")
    character_actions: dict[str, str] = Field(default_factory=dict, description="角色动作，key为角色名，value为动作描述")
    background: str = Field(description="背景环境描述")
    lighting: str = Field(default="", description="光照描述，如'逆光'、'暖色调黄昏光'")
    mood: str = Field(default="", description="画面情绪")
    dialogue_overlay: str = Field(default="", description="画面上叠加的对话文字")
    sound_effect: str = Field(default="", description="音效提示")
    duration_seconds: float = Field(default=3.0, description="建议持续时间（秒）")

    # Midjourney 提示词
    mj_prompt: str = Field(default="", description="最终的Midjourney提示词（含 --cref URL）")
    mj_parameters: str = Field(default="--ar 16:9 --style raw --v 6.1", description="MJ参数")

    # 生成后的资产
    generated_image_url: str = Field(default="", description="MJ生成后上传回来的图片URL")
    is_approved: bool = Field(default=False, description="是否已审核通过")

    created_at: datetime = Field(default_factory=datetime.now)