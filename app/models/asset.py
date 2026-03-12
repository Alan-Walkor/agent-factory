"""资产管理数据模型"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum
import uuid

class AssetType(str, Enum):
    CHARACTER_TURNAROUND = "character_turnaround"  # 角色三视图
    CHARACTER_REFERENCE = "character_reference"     # 角色参考图
    STORYBOARD_IMAGE = "storyboard_image"          # 分镜图片
    BACKGROUND = "background"                       # 背景图
    PROP = "prop"                                   # 道具图
    FINAL_FRAME = "final_frame"                    # 最终合成帧

class Asset(BaseModel):
    """资产模型"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    project_id: str = Field(description="所属项目ID")
    asset_type: AssetType = Field(description="资产类型")
    name: str = Field(description="资产名称")
    description: str = Field(default="", description="资产描述")

    # 关联信息
    character_id: Optional[str] = Field(default=None, description="关联角色ID（如果是角色相关资产）")
    panel_id: Optional[str] = Field(default=None, description="关联分镜ID（如果是分镜图片）")

    # 文件信息
    url: str = Field(description="图片URL（可以是MJ生成的URL或本地路径）")
    local_path: Optional[str] = Field(default=None, description="本地文件路径")
    file_format: str = Field(default="png", description="文件格式")
    width: Optional[int] = Field(default=None, description="图片宽度")
    height: Optional[int] = Field(default=None, description="图片高度")

    # MJ相关
    mj_prompt_used: str = Field(default="", description="生成此资产所用的MJ提示词")
    mj_job_id: str = Field(default="", description="MJ任务ID（手动记录）")

    created_at: datetime = Field(default_factory=datetime.now)