"""
项目管理服务。
处理项目的创建、查询、状态管理。
"""
from app.models.project import Project, ProjectStatus
from app.storage.json_store import project_store
from typing import Optional

class ProjectService:
    """项目管理服务"""

    async def create_project(self, name: str) -> Project:
        """创建新项目"""
        project = Project(name=name)
        await project_store.save_project(project)
        return project

    async def get_project(self, project_id: str) -> Optional[Project]:
        """获取项目"""
        return await project_store.load_project(project_id)

    async def update_project(self, project: Project) -> None:
        """更新项目"""
        await project_store.save_project(project)

    async def list_projects(self) -> list[dict]:
        """列出所有项目"""
        return await project_store.list_projects()

    async def delete_project(self, project_id: str) -> bool:
        """删除项目"""
        return await project_store.delete_project(project_id)

    async def update_status(self, project_id: str, status: ProjectStatus) -> Optional[Project]:
        """更新项目状态"""
        project = await self.get_project(project_id)
        if project:
            project.status = status
            await self.update_project(project)
        return project

project_service = ProjectService()