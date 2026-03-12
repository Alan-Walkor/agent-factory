"""
章节剧本编写Agent。
根据世界观、角色、大纲，为指定章节编写完整剧本。
"""
from app.agents.base_agent import BaseAgent
from app.models.story import ChapterScript, StoryOutline, ChapterOutline
from app.models.world import WorldSetting
from app.models.character import Character

class ChapterWriterAgent(BaseAgent):
    """章节剧本编写Agent"""

    def __init__(self):
        super().__init__(
            prompt_template_file="chapter_writer.txt",
            output_model=ChapterScript,
            temperature=0.7
        )

    async def write_chapter(
        self,
        world_setting: WorldSetting,
        characters: list[Character],
        story_outline: StoryOutline,
        chapter_outline: ChapterOutline,
        previous_chapter_summary: str = ""
    ) -> ChapterScript:
        """
        为指定章节编写完整剧本。

        参数:
            world_setting: 世界观设定
            characters: 项目中的所有角色列表
            story_outline: 完整故事大纲（让Agent了解全局走向）
            chapter_outline: 当前要编写的章节大纲
            previous_chapter_summary: 上一章的摘要（用于衔接）
        返回:
            ChapterScript 对象
        """
        system_msg = self.prompt_text if self.prompt_text else self._default_system_prompt()

        # 构建角色信息摘要（只传递本章涉及的角色的详细信息）
        involved_names = chapter_outline.characters_involved
        involved_chars = [c for c in characters if c.name in involved_names]
        chars_info = "\n".join([
            f"- {c.name}（{c.role.value}）：{c.personality}，外貌：{c.appearance.hair}，{c.appearance.eyes}，{c.appearance.outfit}"
            for c in involved_chars
        ])

        # 构建角色关系信息
        relationships_info = "\n".join([
            f"- {c.name} 的关系：{', '.join([f'{k}({v})' for k, v in c.relationships.items()])}"
            for c in involved_chars if c.relationships
        ])

        human_msg = (
            "## 世界观概要\n"
            "世界名称：{world_name}\n"
            "时代：{world_era}\n"
            "视觉风格：{visual_style}\n\n"
            "## 本章涉及角色\n{chars_info}\n\n"
            "## 角色关系\n{relationships_info}\n\n"
            "## 故事总纲\n{story_logline}\n"
            "故事弧线：{story_arc}\n\n"
            "## 上一章摘要\n{previous_summary}\n\n"
            "## 当前章节大纲\n"
            "第{chapter_number}章：{chapter_title}\n"
            "概要：{chapter_summary}\n"
            "关键事件：{key_events}\n"
            "地点：{location}\n"
            "情绪基调：{mood}\n"
            "时间：{time_of_day}\n\n"
            "请根据以上信息，编写本章的完整剧本。\n"
            "输出格式要求：\n{format_instructions}"
        )

        chain = self._build_chain(system_msg, human_msg)
        result = await self._invoke(
            chain,
            world_name=world_setting.name,
            world_era=world_setting.era,
            visual_style=world_setting.visual_style,
            chars_info=chars_info if chars_info else "无",
            relationships_info=relationships_info if relationships_info else "无",
            story_logline=story_outline.logline,
            story_arc=story_outline.story_arc,
            previous_summary=previous_chapter_summary if previous_chapter_summary else "这是第一章，无前情提要",
            chapter_number=str(chapter_outline.chapter_number),
            chapter_title=chapter_outline.title,
            chapter_summary=chapter_outline.summary,
            key_events="、".join(chapter_outline.key_events),
            location=chapter_outline.location,
            mood=chapter_outline.mood,
            time_of_day=chapter_outline.time_of_day if chapter_outline.time_of_day else "未指定",
            format_instructions=self.format_instructions
        )

        return ChapterScript(**result)

    def _default_system_prompt(self) -> str:
        return """你是一个专业的动漫剧本作家。你的任务是将章节大纲扩展为完整的、可用于分镜拆解的剧本。

要求：
1. 每个章节包含3-6个场景
2. 每个场景必须有明确的地点、时间、镜头提示
3. 对话要符合角色性格，自然不做作
4. action字段描述画面中的动作，要具体到可以画出来
5. camera_note字段给出镜头建议（特写、远景、俯拍等）
6. 保持与上一章的情节连贯性
7. dialogue列表中每项格式为 {"character": "角色名", "line": "台词内容"}

你必须以JSON格式输出，严格遵循指定的schema。不要输出JSON以外的任何内容。"""