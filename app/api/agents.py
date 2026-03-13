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

class WorldBuildRequest(BaseModel):
    project_id: str = Field(description="项目ID")
    world_idea: str = Field(description="世界观创意描述")

@router.post("/worldbuild", summary="单独执行：生成世界观")
async def run_worldbuild(req: WorldBuildRequest):
    """根据创意生成世界观设定"""
    try:
        from app.services.project_service import project_service
        from app.agents.worldbuilding import WorldbuildingAgent

        project = await project_service.get_project(req.project_id)
        if not project:
            raise HTTPException(status_code=404, detail="项目不存在")

        from app.models.project import ProjectStatus
        project.status = ProjectStatus.WORLDBUILDING
        agent = WorldbuildingAgent()
        project.world_setting = await agent.generate_world(req.world_idea)
        await project_service.update_project(project)

        return {
            "project_id": project.id,
            "status": project.status.value,
            "message": "世界观生成完成",
            "world_setting": project.world_setting.model_dump(mode="json")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class OutlineRequest(BaseModel):
    project_id: str = Field(description="项目ID")
    story_requirements: str = Field(description="故事需求描述")
    total_chapters: int = Field(default=12, description="总章节数")

@router.post("/outline", summary="单独执行：生成故事大纲")
async def run_outline(req: OutlineRequest):
    """根据世界观生成故事大纲"""
    try:
        from app.services.project_service import project_service
        from app.agents.plot_architect import PlotArchitectAgent
        from app.models.project import ProjectStatus

        project = await project_service.get_project(req.project_id)
        if not project:
            raise HTTPException(status_code=404, detail="项目不存在")
        if not project.world_setting:
            raise HTTPException(status_code=400, detail="请先生成世界观")

        project.status = ProjectStatus.OUTLINING
        agent = PlotArchitectAgent()
        project.story_outline = await agent.generate_outline(
            world_setting=project.world_setting,
            user_requirements=req.story_requirements,
            total_chapters=req.total_chapters
        )
        await project_service.update_project(project)

        return {
            "project_id": project.id,
            "status": project.status.value,
            "message": "故事大纲生成完成",
            "story_outline": project.story_outline.model_dump(mode="json")
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class CharacterDesignRequest(BaseModel):
    project_id: str = Field(description="项目ID")

@router.post("/design-characters", summary="单独执行：设计角色")
async def run_character_design(req: CharacterDesignRequest):
    """根据世界观和大纲设计角色"""
    try:
        from app.services.project_service import project_service
        from app.agents.character_designer import CharacterDesignerAgent
        from app.models.project import ProjectStatus

        project = await project_service.get_project(req.project_id)
        if not project:
            raise HTTPException(status_code=404, detail="项目不存在")
        if not project.world_setting:
            raise HTTPException(status_code=400, detail="请先生成世界观")
        if not project.story_outline:
            raise HTTPException(status_code=400, detail="请先生成故事大纲")

        project.status = ProjectStatus.CHARACTER_DESIGN
        agent = CharacterDesignerAgent()
        project.characters = await agent.design_characters(
            world_setting=project.world_setting,
            story_outline=project.story_outline
        )
        await project_service.update_project(project)

        return {
            "project_id": project.id,
            "status": project.status.value,
            "message": f"角色设计完成，共{len(project.characters)}个角色",
            "character_count": len(project.characters),
            "characters": [c.model_dump(mode="json") for c in project.characters]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ScriptAndStoryboardRequest(BaseModel):
    project_id: str = Field(description="项目ID")

@router.post("/script-and-storyboard", summary="单独执行：生成剧本+分镜")
async def run_script_and_storyboard(req: ScriptAndStoryboardRequest):
    """生成所有章节剧本并拆解分镜"""
    try:
        from app.services.project_service import project_service
        from app.agents.chapter_writer import ChapterWriterAgent
        from app.agents.storyboard_designer import StoryboardDesignerAgent
        from app.models.project import ProjectStatus

        project = await project_service.get_project(req.project_id)
        if not project:
            raise HTTPException(status_code=404, detail="项目不存在")
        if not project.world_setting or not project.story_outline or not project.characters:
            raise HTTPException(status_code=400, detail="请先完成世界观、大纲、角色设计")

        # 生成剧本
        project.status = ProjectStatus.SCRIPTING
        writer = ChapterWriterAgent()
        project.chapter_scripts = []
        previous_summary = ""
        for ch_outline in project.story_outline.chapter_outlines:
            script = await writer.write_chapter(
                world_setting=project.world_setting,
                characters=project.characters,
                story_outline=project.story_outline,
                chapter_outline=ch_outline,
                previous_chapter_summary=previous_summary
            )
            project.chapter_scripts.append(script)
            previous_summary = ch_outline.summary
        await project_service.update_project(project)

        # 拆解分镜
        project.status = ProjectStatus.STORYBOARDING
        storyboard_agent = StoryboardDesignerAgent()
        project.storyboard_panels = []
        for script in project.chapter_scripts:
            panels = await storyboard_agent.design_storyboard(
                chapter_script=script,
                visual_style=project.world_setting.visual_style
            )
            project.storyboard_panels.extend(panels)

        project.status = ProjectStatus.MJ_PROMPT_READY
        await project_service.update_project(project)

        return {
            "project_id": project.id,
            "status": project.status.value,
            "message": "剧本和分镜生成完成",
            "chapter_count": len(project.chapter_scripts),
            "panel_count": len(project.storyboard_panels)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
            "status": "not_implemented",
            "message": "TODO: 此功能待实现，当前为占位端点"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))