"""项目管理 API 路由"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.services.project_service import project_service

router = APIRouter()

class CreateProjectRequest(BaseModel):
    name: str = Field(description="项目名称")

@router.post("/", summary="创建项目")
async def create_project(req: CreateProjectRequest):
    project = await project_service.create_project(req.name)
    return {"project_id": project.id, "name": project.name, "status": project.status.value}

@router.get("/", summary="列出所有项目")
async def list_projects():
    return await project_service.list_projects()

@router.get("/{project_id}", summary="获取项目详情")
async def get_project(project_id: str):
    project = await project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    return project.model_dump(mode="json")

@router.delete("/{project_id}", summary="删除项目")
async def delete_project(project_id: str):
    success = await project_service.delete_project(project_id)
    if not success:
        raise HTTPException(status_code=404, detail="项目不存在")
    return {"message": "已删除"}

@router.get("/{project_id}/characters/mj-prompts", summary="获取所有角色的MJ三视图提示词")
async def get_character_mj_prompts(project_id: str):
    """获取角色三视图提示词列表，方便用户逐一复制到MJ"""
    project = await project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")
    return [
        {
            "character_name": c.name,
            "role": c.role.value,
            "mj_character_prompt": c.mj_character_prompt,
            "turnaround_image_urls": c.turnaround_image_urls,
            "reference_image_url": c.reference_image_url
        }
        for c in project.characters
    ]

@router.get("/{project_id}/panels/mj-prompts", summary="获取所有分镜的MJ提示词")
async def get_panel_mj_prompts(project_id: str, chapter: int = None):
    """获取分镜MJ提示词列表，方便用户逐一复制到MJ"""
    project = await project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")

    panels = project.storyboard_panels
    if chapter is not None:
        panels = [p for p in panels if p.chapter_number == chapter]

    return [
        {
            "panel_id": p.id,
            "panel_number": p.panel_number,
            "chapter_number": p.chapter_number,
            "scene_number": p.scene_number,
            "visual_description": p.visual_description,
            "mj_prompt": p.mj_prompt,
            "generated_image_url": p.generated_image_url,
            "is_approved": p.is_approved
        }
        for p in sorted(panels, key=lambda x: x.panel_number)
    ]

@router.get("/{project_id}/panels/pending", summary="获取待上传图片的分镜")
async def get_pending_panels(project_id: str):
    from app.services.asset_service import asset_service
    return await asset_service.get_pending_panels(project_id)


@router.get("/{project_id}/storyboards", summary="获取所有分镜数据")
async def get_storyboards(project_id: str):
    """获取所有分镜面板数据，用于前端展示和管理"""
    project = await project_service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="项目不存在")

    return [
        {
            "id": p.id,
            "chapter_number": p.chapter_number,
            "scene_number": p.scene_number,
            "panel_number": p.panel_number,
            "visual_description": p.visual_description,
            "mj_prompt": p.mj_prompt,
            "characters_in_frame": p.characters_in_frame,
            "character_actions": p.character_actions,
            "background": p.background,
            "lighting": p.lighting,
            "mood": p.mood,
            "dialogue_overlay": p.dialogue_overlay,
            "shot_type": p.shot_type.value if p.shot_type else "",
            "duration_seconds": p.duration_seconds,
            "image_url": p.generated_image_url,
            "status": "approved" if p.is_approved else "pending",
            "is_approved": p.is_approved,
            "created_at": p.created_at.isoformat() if hasattr(p.created_at, 'isoformat') else str(p.created_at) if p.created_at else None
        }
        for p in sorted(project.storyboard_panels, key=lambda x: (x.chapter_number, x.panel_number))
    ]