"""
后期编排Agent。
将已完成的分镜图片编排为视频剪辑脚本。
"""
from app.agents.base_agent import BaseAgent
from app.models.storyboard import StoryboardPanel
from app.models.story import ChapterScript
from pydantic import BaseModel, Field

class EditingClip(BaseModel):
    """单个剪辑片段"""
    clip_number: int = Field(description="片段序号")
    panel_id: str = Field(description="对应的分镜面板ID")
    image_url: str = Field(description="图片URL")
    duration_seconds: float = Field(description="展示时长")
    transition: str = Field(default="cut", description="转场效果：cut/fade/dissolve/wipe/zoom_in/zoom_out")
    subtitle: str = Field(default="", description="字幕文本")
    narrator: str = Field(default="", description="旁白文本")
    sound_effect: str = Field(default="", description="音效指示")
    bgm_note: str = Field(default="", description="背景音乐指示")
    ken_burns_effect: str = Field(default="none", description="Ken Burns效果：none/zoom_in/zoom_out/pan_left/pan_right")

class EditingScript(BaseModel):
    """剪辑脚本"""
    chapter_number: int = Field(description="章节号")
    chapter_title: str = Field(description="章节标题")
    total_duration_seconds: float = Field(description="总时长")
    clips: list[EditingClip] = Field(description="剪辑片段列表")
    opening_title: str = Field(default="", description="开场标题文字")
    ending_text: str = Field(default="", description="结尾文字")

class PostProductionAgent(BaseAgent):
    """后期编排Agent"""

    def __init__(self):
        super().__init__(
            prompt_template_file="post_production.txt",
            output_model=EditingScript,
            temperature=0.5
        )

    async def create_editing_script(
        self,
        chapter_script: ChapterScript,
        approved_panels: list[StoryboardPanel]
    ) -> EditingScript:
        """
        为一个章节创建剪辑脚本。

        参数:
            chapter_script: 章节剧本
            approved_panels: 该章节已审核通过的分镜面板（按panel_number排序）
        返回:
            EditingScript 对象
        """
        system_msg = self.prompt_text if self.prompt_text else self._default_system_prompt()

        # 构建分镜面板信息
        panels_info = "\n".join([
            f"面板{p.panel_number}(ID:{p.id}): "
            f"场景{p.scene_number} | {p.shot_type.value} | "
            f"图片:{p.generated_image_url} | "
            f"对话:「{p.dialogue_overlay}」| "
            f"音效:{p.sound_effect} | "
            f"建议时长:{p.duration_seconds}秒 | "
            f"描述:{p.visual_description[:80]}..."
            for p in approved_panels
        ])

        human_msg = (
            "## 章节信息\n"
            "第{chapter_number}章：{chapter_title}\n"
            "旁白：{narrator_text}\n\n"
            "## 分镜面板列表（按顺序）\n{panels_info}\n\n"
            "请为以上分镜创建剪辑脚本。\n"
            "输出格式要求：\n{format_instructions}"
        )

        chain = self._build_chain(system_msg, human_msg)
        result = await self._invoke(
            chain,
            chapter_number=str(chapter_script.chapter_number),
            chapter_title=chapter_script.title,
            narrator_text=chapter_script.narrator_text if chapter_script.narrator_text else "无旁白",
            panels_info=panels_info,
            format_instructions=self.format_instructions
        )

        return EditingScript(**result)

    def _default_system_prompt(self) -> str:
        return """你是一个专业的动漫后期剪辑师。你的任务是为一系列分镜图片创建剪辑脚本。

要求：
1. 保持分镜的原始顺序
2. 合理安排转场效果（对话场景用cut快切，场景转换用dissolve，高潮用fade）
3. 将对话文字安排为字幕
4. 为静态图片添加 Ken Burns 效果增加动感
5. 总时长要合理（每章 3-8 分钟）

你必须以JSON格式输出，严格遵循指定的schema。不要输出JSON以外的任何内容。"""