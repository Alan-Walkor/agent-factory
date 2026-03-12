"""角色数据模型"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
import uuid

class CharacterRole(str, Enum):
    PROTAGONIST = "protagonist"      # 主角
    ANTAGONIST = "antagonist"        # 反派
    SUPPORTING = "supporting"        # 配角
    MINOR = "minor"                  # 路人角色

class CharacterAppearance(BaseModel):
    """角色外貌描述 — 这些字段会被用于生成MJ提示词"""
    gender: str = Field(description="性别")
    age_appearance: str = Field(description="外表年龄，如'20岁左右的青年'")
    height: str = Field(default="", description="身高描述，如'高挑'")
    build: str = Field(default="", description="体型，如'纤细'、'健壮'")
    hair: str = Field(description="发型发色，如'银白色长发，扎成高马尾'")
    eyes: str = Field(description="瞳色与眼型，如'猩红色锐利双瞳'")
    skin: str = Field(default="", description="肤色")
    facial_features: str = Field(default="", description="面部特征，如'左脸有刀疤'")
    outfit: str = Field(description="标志性服装，如'黑色长风衣内搭白衬衫'")
    accessories: list[str] = Field(default_factory=list, description="配饰道具，如['银色十字架项链','黑色皮手套']")
    special_features: str = Field(default="", description="特殊视觉特征，如'背部有发光纹身'")

class Character(BaseModel):
    """角色完整模型"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(description="角色名")
    role: CharacterRole = Field(description="角色定位")
    appearance: CharacterAppearance = Field(description="外貌描述")
    personality: str = Field(description="性格描述，100字以内")
    background: str = Field(description="背景故事，200字以内")
    abilities: list[str] = Field(default_factory=list, description="能力列表")
    relationships: dict[str, str] = Field(default_factory=dict, description="与其他角色的关系，key为角色名，value为关系描述")

    # Midjourney 相关
    mj_character_prompt: str = Field(default="", description="用于MJ生成角色三视图的提示词")
    turnaround_image_urls: list[str] = Field(default_factory=list, description="角色三视图图片URL列表（正面/侧面/背面）")
    reference_image_url: str = Field(default="", description="最终选定的角色参考图URL，后续分镜会用 --cref 引用此URL")

    created_at: datetime = Field(default_factory=datetime.now)