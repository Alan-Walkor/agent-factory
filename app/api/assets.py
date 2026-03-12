"""资产管理 API 路由"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Literal
from app.services.asset_service import asset_service

router = APIRouter()

class AddTurnaroundRequest(BaseModel):
    character_name: str = Field(description="角色名")
    image_urls: list[str] = Field(description="三视图图片URL列表")
    mj_prompt_used: str = Field(default="", description="使用的MJ提示词")

class SetReferenceRequest(BaseModel):
    character_name: str = Field(description="角色名")
    reference_url: str = Field(description="选定的参考图URL")

class AddStoryboardImageRequest(BaseModel):
    panel_id: str = Field(description="分镜面板ID")
    image_url: str = Field(description="MJ生成的图片URL")

class UpdatePanelStatusRequest(BaseModel):
    status: Literal["pending", "approved", "rejected"] = Field(description="状态: pending/approved/rejected")

@router.post("/{project_id}/character-turnaround", summary="上传角色三视图")
async def add_character_turnaround(project_id: str, req: AddTurnaroundRequest):
    project = await asset_service.add_character_turnaround(
        project_id=project_id,
        character_name=req.character_name,
        image_urls=req.image_urls,
        mj_prompt_used=req.mj_prompt_used
    )
    if not project:
        raise HTTPException(status_code=404, detail="项目或角色不存在")
    return {"message": f"已为 {req.character_name} 添加三视图", "urls": req.image_urls}

@router.post("/{project_id}/character-reference", summary="设置角色参考图")
async def set_character_reference(project_id: str, req: SetReferenceRequest):
    project = await asset_service.set_character_reference(
        project_id=project_id,
        character_name=req.character_name,
        reference_url=req.reference_url
    )
    if not project:
        raise HTTPException(status_code=404, detail="项目或角色不存在")
    return {"message": f"已设置 {req.character_name} 的参考图", "reference_url": req.reference_url}

@router.post("/{project_id}/storyboard-image", summary="上传分镜图片")
async def add_storyboard_image(project_id: str, req: AddStoryboardImageRequest):
    project = await asset_service.add_storyboard_image(
        project_id=project_id,
        panel_id=req.panel_id,
        image_url=req.image_url
    )
    if not project:
        raise HTTPException(status_code=404, detail="项目或面板不存在")
    return {"message": "已添加分镜图片"}

@router.post("/{project_id}/panels/{panel_id}/approve", summary="审核通过分镜")
async def approve_panel(project_id: str, panel_id: str):
    project = await asset_service.approve_panel(project_id, panel_id)
    if not project:
        raise HTTPException(status_code=404, detail="项目或面板不存在")
    return {"message": "已审核通过"}


@router.put("/{project_id}/panels/{panel_id}/status", summary="更新分镜状态")
async def update_panel_status(project_id: str, panel_id: str, req: UpdatePanelStatusRequest):
    status = req.status
    if status not in ["pending", "approved", "rejected"]:
        raise HTTPException(status_code=400, detail="无效的状态值")

    project = await asset_service.update_panel_status(project_id, panel_id, status)
    if not project:
        raise HTTPException(status_code=404, detail="项目或面板不存在")
    return {"message": f"已更新分镜状态为 {status}"}

# 批量操作
class BatchStoryboardRequest(BaseModel):
    images: list[AddStoryboardImageRequest] = Field(description="批量上传列表")

@router.post("/{project_id}/storyboard-images/batch", summary="批量上传分镜图片")
async def batch_add_storyboard_images(project_id: str, req: BatchStoryboardRequest):
    results = []
    for item in req.images:
        project = await asset_service.add_storyboard_image(
            project_id=project_id,
            panel_id=item.panel_id,
            image_url=item.image_url
        )
        results.append({
            "panel_id": item.panel_id,
            "success": project is not None
        })
    return {"results": results}