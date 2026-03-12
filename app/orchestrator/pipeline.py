"""
主控编排器。
串联所有Agent，控制动漫工厂的生产流水线。
"""
from app.agents.worldbuilding import WorldbuildingAgent
from app.agents.plot_architect import PlotArchitectAgent
from app.agents.character_designer import CharacterDesignerAgent
from app.agents.chapter_writer import ChapterWriterAgent
from app.agents.storyboard_designer import StoryboardDesignerAgent
from app.agents.mj_prompt_generator import MJPromptGeneratorAgent
from app.agents.post_production import PostProductionAgent, EditingScript
from app.services.project_service import project_service
from app.models.project import Project, ProjectStatus
from typing import Optional
import logging

logger = logging.getLogger(__name__)

class AnimePipeline:
    """动漫工厂生产流水线"""

    def __init__(self):
        self.worldbuilding_agent = WorldbuildingAgent()
        self.plot_agent = PlotArchitectAgent()
        self.character_agent = CharacterDesignerAgent()
        self.chapter_writer = ChapterWriterAgent()
        self.storyboard_agent = StoryboardDesignerAgent()
        self.mj_prompt_agent = MJPromptGeneratorAgent()
        self.post_production_agent = PostProductionAgent()

    async def run_phase_one(
        self,
        project_name: str,
        world_idea: str,
        story_requirements: str,
        total_chapters: int = 12
    ) -> Project:
        """
        执行阶段一：从创意到MJ角色三视图提示词。

        参数:
            project_name: 项目名称
            world_idea: 世界观创意
            story_requirements: 故事要求
            total_chapters: 章节数
        返回:
            Project 对象（包含世界观、大纲、角色、剧本、分镜，角色带有三视图MJ提示词）
        """
        # 1. 创建项目
        logger.info(f"[阶段一] 创建项目: {project_name}")
        project = await project_service.create_project(project_name)

        try:
            # 2. 生成世界观
            logger.info("[阶段一] 生成世界观...")
            project.status = ProjectStatus.WORLDBUILDING
            project.world_setting = await self.worldbuilding_agent.generate_world(world_idea)
            await project_service.update_project(project)

            # 3. 生成故事大纲
            logger.info("[阶段一] 生成故事大纲...")
            project.status = ProjectStatus.OUTLINING
            project.story_outline = await self.plot_agent.generate_outline(
                world_setting=project.world_setting,
                user_requirements=story_requirements,
                total_chapters=total_chapters
            )
            await project_service.update_project(project)

            # 4. 设计角色（含三视图MJ提示词）
            logger.info("[阶段一] 设计角色...")
            project.status = ProjectStatus.CHARACTER_DESIGN
            project.characters = await self.character_agent.design_characters(
                world_setting=project.world_setting,
                story_outline=project.story_outline
            )
            await project_service.update_project(project)

            # 5. 逐章编写剧本
            logger.info("[阶段一] 编写章节剧本...")
            project.status = ProjectStatus.SCRIPTING
            previous_summary = ""
            for ch_outline in project.story_outline.chapter_outlines:
                logger.info(f"  编写第{ch_outline.chapter_number}章...")
                script = await self.chapter_writer.write_chapter(
                    world_setting=project.world_setting,
                    characters=project.characters,
                    story_outline=project.story_outline,
                    chapter_outline=ch_outline,
                    previous_chapter_summary=previous_summary
                )
                project.chapter_scripts.append(script)
                # 更新摘要用于下一章衔接
                previous_summary = ch_outline.summary
                await project_service.update_project(project)

            # 6. 逐章拆解分镜
            logger.info("[阶段一] 拆解分镜...")
            project.status = ProjectStatus.STORYBOARDING
            for script in project.chapter_scripts:
                logger.info(f"  拆解第{script.chapter_number}章分镜...")
                panels = await self.storyboard_agent.design_storyboard(
                    chapter_script=script,
                    visual_style=project.world_setting.visual_style
                )
                project.storyboard_panels.extend(panels)
                await project_service.update_project(project)

            # 7. 此时角色的 mj_character_prompt 已在步骤4中生成
            # 状态更新为等待用户操作
            project.status = ProjectStatus.MJ_PROMPT_READY
            await project_service.update_project(project)

            logger.info("[阶段一] 完成！等待用户上传角色三视图...")
            return project

        except Exception as e:
            logger.error(f"[阶段一] 出错: {str(e)}")
            project.notes = f"阶段一出错: {str(e)}"
            await project_service.update_project(project)
            raise

    async def generate_storyboard_mj_prompts(self, project_id: str) -> Project:
        """
        在用户设置好角色参考图后，生成所有分镜的MJ提示词。

        前提条件：所有主要角色的 reference_image_url 已设置。

        参数:
            project_id: 项目ID
        返回:
            更新后的 Project
        """
        project = await project_service.get_project(project_id)
        if not project:
            raise ValueError(f"项目不存在: {project_id}")

        # 检查角色参考图是否就绪
        chars_without_ref = [
            c.name for c in project.characters
            if c.role.value in ("protagonist", "antagonist", "supporting")
            and not c.reference_image_url
        ]
        if chars_without_ref:
            raise ValueError(f"以下角色尚未设置参考图: {', '.join(chars_without_ref)}")

        logger.info("[继续阶段一] 生成分镜MJ提示词...")

        # 按章节逐章生成
        for script in project.chapter_scripts:
            chapter_panels = project.get_panels_by_chapter(script.chapter_number)
            if not chapter_panels:
                continue

            updated_panels = await self.mj_prompt_agent.generate_prompts_for_chapter(
                panels=chapter_panels,
                characters=project.characters,
                world_setting=project.world_setting
            )

            # 替换更新后的面板
            other_panels = [p for p in project.storyboard_panels if p.chapter_number != script.chapter_number]
            project.storyboard_panels = other_panels + updated_panels

        project.status = ProjectStatus.MJ_PROMPT_READY
        await project_service.update_project(project)

        logger.info("[继续阶段一] 分镜MJ提示词生成完成！等待用户生成图片...")
        return project

    async def run_phase_two(self, project_id: str) -> list[EditingScript]:
        """
        执行阶段二：生成剪辑脚本。

        前提条件：所有分镜面板都已上传图片并审核通过。

        参数:
            project_id: 项目ID
        返回:
            各章的 EditingScript 列表
        """
        project = await project_service.get_project(project_id)
        if not project:
            raise ValueError(f"项目不存在: {project_id}")

        logger.info("[阶段二] 生成剪辑脚本...")
        project.status = ProjectStatus.POST_PRODUCTION

        editing_scripts = []
        for script in project.chapter_scripts:
            chapter_panels = project.get_panels_by_chapter(script.chapter_number)
            approved = [p for p in chapter_panels if p.is_approved and p.generated_image_url]

            if not approved:
                logger.warning(f"  第{script.chapter_number}章没有已审核的面板，跳过")
                continue

            # 按面板号排序
            approved.sort(key=lambda p: p.panel_number)

            logger.info(f"  生成第{script.chapter_number}章剪辑脚本...")
            editing_script = await self.post_production_agent.create_editing_script(
                chapter_script=script,
                approved_panels=approved
            )
            editing_scripts.append(editing_script)

        project.status = ProjectStatus.COMPLETED
        await project_service.update_project(project)

        logger.info("[阶段二] 完成！")
        return editing_scripts

# 全局单例
anime_pipeline = AnimePipeline()