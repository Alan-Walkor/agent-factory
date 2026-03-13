"""
资产管理服务。
处理图片资产的上传、关联、查询。
"""
from app.models.asset import Asset, AssetType
from app.models.project import Project
from app.services.project_service import project_service
from typing import Optional

class AssetService:
    """资产管理服务"""

    async def add_character_turnaround(
        self,
        project_id: str,
        character_name: str,
        image_urls: list[str],
        mj_prompt_used: str = ""
    ) -> Optional[Project]:
        """
        为角色添加三视图图片。

        参数:
            project_id: 项目ID
            character_name: 角色名
            image_urls: 三视图图片URL列表
            mj_prompt_used: 使用的MJ提示词
        """
        project = await project_service.get_project(project_id)
        if not project:
            return None

        # 找到角色
        character = project.get_character_by_name(character_name)
        if not character:
            return None

        # 更新角色的三视图URL
        character.turnaround_image_urls = image_urls

        # 移除此角色旧的三视图资产记录，再重新写入
        project.assets = [
            a for a in project.assets
            if not (a.character_id == character.id and a.asset_type == AssetType.CHARACTER_TURNAROUND)
        ]
        for i, url in enumerate(image_urls):
            asset = Asset(
                project_id=project_id,
                asset_type=AssetType.CHARACTER_TURNAROUND,
                name=f"{character_name}_turnaround_{i+1}",
                url=url,
                character_id=character.id,
                mj_prompt_used=mj_prompt_used
            )
            project.assets.append(asset)

        await project_service.update_project(project)
        return project

    async def set_character_reference(
        self,
        project_id: str,
        character_name: str,
        reference_url: str
    ) -> Optional[Project]:
        """
        设置角色的参考图URL（从三视图中选一张，后续分镜会用 --cref 引用）。

        参数:
            project_id: 项目ID
            character_name: 角色名
            reference_url: 选定的参考图URL
        """
        project = await project_service.get_project(project_id)
        if not project:
            return None

        character = project.get_character_by_name(character_name)
        if not character:
            return None

        character.reference_image_url = reference_url

        # 移除此角色旧的参考图记录，再写入新的
        project.assets = [
            a for a in project.assets
            if not (a.character_id == character.id and a.asset_type == AssetType.CHARACTER_REFERENCE)
        ]
        asset = Asset(
            project_id=project_id,
            asset_type=AssetType.CHARACTER_REFERENCE,
            name=f"{character_name}_reference",
            url=reference_url,
            character_id=character.id
        )
        project.assets.append(asset)

        await project_service.update_project(project)
        return project

    async def add_storyboard_image(
        self,
        project_id: str,
        panel_id: str,
        image_url: str
    ) -> Optional[Project]:
        """
        为分镜面板添加MJ生成的图片。

        参数:
            project_id: 项目ID
            panel_id: 分镜面板ID
            image_url: MJ生成的图片URL
        """
        project = await project_service.get_project(project_id)
        if not project:
            return None

        # 找到对应的分镜面板
        panel = next((p for p in project.storyboard_panels if p.id == panel_id), None)
        if not panel:
            return None

        panel.generated_image_url = image_url

        # 创建资产记录
        asset = Asset(
            project_id=project_id,
            asset_type=AssetType.STORYBOARD_IMAGE,
            name=f"panel_{panel.panel_number}",
            url=image_url,
            panel_id=panel_id,
            mj_prompt_used=panel.mj_prompt
        )
        project.assets.append(asset)

        await project_service.update_project(project)
        return project

    async def approve_panel(self, project_id: str, panel_id: str) -> Optional[Project]:
        """审核通过一个分镜面板"""
        project = await project_service.get_project(project_id)
        if not project:
            return None

        panel = next((p for p in project.storyboard_panels if p.id == panel_id), None)
        if not panel:
            return None

        panel.is_approved = True
        await project_service.update_project(project)
        return project

    async def update_panel_status(self, project_id: str, panel_id: str, status: str) -> Optional[Project]:
        """更新分镜面板状态（pending/approved/rejected）"""
        project = await project_service.get_project(project_id)
        if not project:
            return None

        panel = next((p for p in project.storyboard_panels if p.id == panel_id), None)
        if not panel:
            return None

        if status == "approved":
            panel.is_approved = True
        elif status == "rejected":
            panel.is_approved = False  # Consider rejected as not approved
        elif status == "pending":
            panel.is_approved = False  # Reset to pending state

        await project_service.update_project(project)
        return project

    async def get_pending_panels(self, project_id: str) -> list[dict]:
        """获取所有等待上传图片的分镜面板"""
        project = await project_service.get_project(project_id)
        if not project:
            return []

        pending = []
        for panel in project.storyboard_panels:
            if not panel.generated_image_url:
                pending.append({
                    "panel_id": panel.id,
                    "panel_number": panel.panel_number,
                    "chapter_number": panel.chapter_number,
                    "scene_number": panel.scene_number,
                    "mj_prompt": panel.mj_prompt,
                    "visual_description": panel.visual_description
                })
        return pending

asset_service = AssetService()