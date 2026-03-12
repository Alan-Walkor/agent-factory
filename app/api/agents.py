"""Agent 调用 API 路由"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from app.orchestrator.pipeline import anime_pipeline

router = APIRouter()

class PhaseOneRequest(BaseModel):
    project_name: str = Field(description="项目名称")
    world_idea: str = Field(description="世界观创意描述")
    story_requirements: str = Field(description="故事需求描述")
    total_chapters: int = Field(default=12, description="总章节数")

@router.post("/phase-one", summary="执行阶段一：从创意到分镜")
async def run_phase_one(req: PhaseOneRequest):
    """
    自动执行：世界观→大纲→角色设计→剧本→分镜
    完成后返回角色三视图MJ提示词，等待用户手动生成。
    """
    try:
        project = await anime_pipeline.run_phase_one(
            project_name=req.project_name,
            world_idea=req.world_idea,
            story_requirements=req.story_requirements,
            total_chapters=req.total_chapters
        )
        return {
            "project_id": project.id,
            "status": project.status.value,
            "message": "阶段一完成！请获取角色MJ提示词并在Midjourney中生成三视图。",
            "next_step": f"GET /api/projects/{project.id}/characters/mj-prompts",
            "character_count": len(project.characters),
            "chapter_count": len(project.chapter_scripts),
            "panel_count": len(project.storyboard_panels)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{project_id}/generate-storyboard-prompts", summary="生成分镜MJ提示词")
async def generate_storyboard_prompts(project_id: str):
    """
    在用户设置好角色参考图后调用。
    为所有分镜生成包含 --cref 的MJ提示词。
    """
    try:
        project = await anime_pipeline.generate_storyboard_mj_prompts(project_id)
        return {
            "project_id": project.id,
            "status": project.status.value,
            "message": "分镜MJ提示词已生成！请获取提示词并在Midjourney中生成图片。",
            "next_step": f"GET /api/projects/{project.id}/panels/mj-prompts",
            "panel_count": len(project.storyboard_panels)
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/{project_id}/phase-two", summary="执行阶段二：生成剪辑脚本")
async def run_phase_two(project_id: str):
    """
    在所有分镜图片上传并审核通过后调用。
    生成剪辑脚本。
    """
    try:
        editing_scripts = await anime_pipeline.run_phase_two(project_id)
        return {
            "project_id": project_id,
            "message": "阶段二完成！剪辑脚本已生成。",
            "chapters_processed": len(editing_scripts),
            "editing_scripts": [es.model_dump() for es in editing_scripts]
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{project_id}/panels/{panel_id}/generate-images", summary="生成分镜图片")
async def generate_storyboard_images(project_id: str, panel_id: str):
    """
    重新生成指定分镜面板的图片
    """
    try:
        # 这里需要实际的实现来重新生成图片
        # 目前只是模拟返回
        return {
            "project_id": project_id,
            "panel_id": panel_id,
            "status": "success",
            "message": "分镜图片生成任务已提交"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))