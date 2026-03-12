"""世界观设定数据模型"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
import uuid

class MagicSystem(BaseModel):
    """魔法/能力体系"""
    name: str = Field(description="体系名称")
    rules: str = Field(description="核心规则描述")
    levels: list[str] = Field(default_factory=list, description="等级划分")
    limitations: str = Field(default="", description="限制与代价")

class SocialStructure(BaseModel):
    """社会结构"""
    government: str = Field(description="政治体制")
    factions: list[str] = Field(default_factory=list, description="主要势力/阵营")
    economy: str = Field(default="", description="经济体系")
    culture: str = Field(default="", description="文化特征")

class WorldSetting(BaseModel):
    """世界观设定"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str = Field(description="世界名称")
    era: str = Field(description="时代背景，如'中世纪奇幻'、'赛博朋克2077'")
    description: str = Field(description="世界观总体描述，500字以内")
    geography: str = Field(default="", description="地理环境描述")
    magic_system: Optional[MagicSystem] = Field(default=None, description="魔法/能力体系")
    social_structure: Optional[SocialStructure] = Field(default=None, description="社会结构")
    key_locations: list[str] = Field(default_factory=list, description="关键地点列表")
    visual_style: str = Field(description="视觉风格描述，如'日系赛璐璐风'、'新海诚水彩风'")
    color_palette: list[str] = Field(default_factory=list, description="主色调列表，如['#1a1a2e','#16213e']")
    created_at: datetime = Field(default_factory=datetime.now)