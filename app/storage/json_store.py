"""
JSON 文件存储层。
每个项目存储为一个独立的JSON文件：data/projects/{project_id}.json
"""
import json
import aiofiles
from pathlib import Path
from app.config import settings
from app.models.project import Project
from typing import Optional

class JsonProjectStore:
    """基于JSON文件的项目存储"""

    def __init__(self):
        self.base_dir = settings.DATA_DIR
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def _project_path(self, project_id: str) -> Path:
        """获取项目JSON文件路径"""
        return self.base_dir / f"{project_id}.json"

    async def save_project(self, project: Project) -> None:
        """保存项目到JSON文件"""
        from datetime import datetime
        project.updated_at = datetime.now()
        path = self._project_path(project.id)
        data = project.model_dump(mode="json")
        async with aiofiles.open(path, 'w', encoding='utf-8') as f:
            await f.write(json.dumps(data, ensure_ascii=False, indent=2))

    async def load_project(self, project_id: str) -> Optional[Project]:
        """从JSON文件加载项目"""
        path = self._project_path(project_id)
        if not path.exists():
            return None
        async with aiofiles.open(path, 'r', encoding='utf-8') as f:
            data = json.loads(await f.read())
        return Project(**data)

    async def list_projects(self) -> list[dict]:
        """列出所有项目的摘要信息"""
        projects = []
        for path in self.base_dir.glob("*.json"):
            try:
                async with aiofiles.open(path, 'r', encoding='utf-8') as f:
                    data = json.loads(await f.read())
                projects.append({
                    "id": data["id"],
                    "name": data["name"],
                    "status": data["status"],
                    "created_at": data.get("created_at", ""),
                    "updated_at": data.get("updated_at", "")
                })
            except Exception:
                continue
        return projects

    async def delete_project(self, project_id: str) -> bool:
        """删除项目"""
        path = self._project_path(project_id)
        if path.exists():
            path.unlink()
            return True
        return False

# 全局单例
project_store = JsonProjectStore()