"""
分镜脚本拆解Agent。
将章节剧本的每个场景拆解为多个分镜面板。
"""
from app.agents.base_agent import BaseAgent
from app.models.storyboard import StoryboardPanel
from app.models.story import ChapterScript, SceneDescription
from pydantic import BaseModel, Field

class StoryboardListOutput(BaseModel):
    """分镜列表输出模型"""
    panels: list[StoryboardPanel] = Field(description="分镜面板列表")

class StoryboardDesignerAgent(BaseAgent):
    """分镜脚本拆解Agent"""

    def __init__(self):
        super().__init__(
            prompt_template_file="storyboard_designer.txt",
            output_model=StoryboardListOutput,
            temperature=0.6  # 分镜需要更精确
        )

    async def design_storyboard(
        self,
        chapter_script: ChapterScript,
        visual_style: str
    ) -> list[StoryboardPanel]:
        """
        将一个完整章节剧本拆解为分镜面板。

        参数:
            chapter_script: 章节剧本
            visual_style: 视觉风格描述（来自世界观）
        返回:
            StoryboardPanel 列表
        """
        all_panels = []
        panel_counter = 1

        # 逐场景拆解（避免一次性输入过长）
        for scene in chapter_script.scenes:
            panels = await self._design_scene_panels(
                scene=scene,
                chapter_number=chapter_script.chapter_number,
                visual_style=visual_style,
                start_panel_number=panel_counter
            )
            all_panels.extend(panels)
            panel_counter += len(panels)

        return all_panels

    async def _design_scene_panels(
        self,
        scene: SceneDescription,
        chapter_number: int,
        visual_style: str,
        start_panel_number: int
    ) -> list[StoryboardPanel]:
        """拆解单个场景为分镜"""
        system_msg = self.prompt_text if self.prompt_text else self._default_system_prompt()

        # 序列化对话信息
        dialogue_text = "\n".join([
            f"  {d['character']}：「{d['line']}」"
            for d in scene.dialogue
        ]) if scene.dialogue else "（无对话）"

        human_msg = (
            "## 视觉风格\n{visual_style}\n\n"
            "## 场景信息\n"
            "场景序号：{scene_number}\n"
            "地点：{location}\n"
            "时间：{time}\n"
            "画面描述：{description}\n"
            "对话：\n{dialogue_text}\n"
            "动作：{action}\n"
            "情绪：{emotion}\n"
            "镜头提示：{camera_note}\n\n"
            "## 分镜要求\n"
            "- 章节号(chapter_number)：{chapter_number}\n"
            "- 场景号(scene_number)：{scene_number}\n"
            "- 面板起始编号(panel_number从{start_panel_number}开始)\n"
            "- 每个场景拆解为 3-8 个分镜面板\n"
            "- shot_type 必须从以下选项中选择：extreme wide shot, wide shot, medium shot, "
            "medium close-up, close-up, extreme close-up, over-the-shoulder shot, "
            "POV shot, bird's eye view, low angle shot, high angle shot, dutch angle\n\n"
            "请将此场景拆解为分镜面板。\n"
            "输出格式要求：\n{format_instructions}"
        )

        chain = self._build_chain(system_msg, human_msg)
        result = await self._invoke(
            chain,
            visual_style=visual_style,
            scene_number=str(scene.scene_number),
            location=scene.location,
            time=scene.time,
            description=scene.description,
            dialogue_text=dialogue_text,
            action=scene.action if scene.action else "无特殊动作",
            emotion=scene.emotion if scene.emotion else "中性",
            camera_note=scene.camera_note if scene.camera_note else "标准镜头",
            chapter_number=str(chapter_number),
            start_panel_number=str(start_panel_number),
            format_instructions=self.format_instructions
        )

        panels = [StoryboardPanel(**p) for p in result.get("panels", [])]
        return panels

    def _default_system_prompt(self) -> str:
        return """你是一个专业的动漫分镜师。你的任务是将剧本场景拆解为具体的分镜面板。

要求：
1. 每个分镜必须是一个可以独立生成为图片的画面
2. shot_type 必须使用指定的枚举值
3. visual_description 要详细到可以让AI绘图工具直接理解的程度
4. 对话场景用过肩镜头或中景交替展示
5. 动作场景要有节奏感：远景建立→中景交锋→特写细节
6. 不要遗漏对话，每句重要对话应有对应分镜
7. mj_prompt 字段留空（后续由专门的Agent填充）

你必须以JSON格式输出，严格遵循指定的schema。不要输出JSON以外的任何内容。"""