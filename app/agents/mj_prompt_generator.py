"""
Midjourney分镜提示词生成Agent。
为每个分镜面板生成包含角色参考图（--cref）的MJ提示词。
"""
from app.agents.base_agent import BaseAgent
from app.models.storyboard import StoryboardPanel
from app.models.character import Character
from app.models.world import WorldSetting
from pydantic import BaseModel, Field

class MJPromptOutput(BaseModel):
    """单个分镜的MJ提示词输出"""
    mj_prompt: str = Field(description="完整的Midjourney提示词，包含画面描述和所有参数")

class MJPromptGeneratorAgent(BaseAgent):
    """Midjourney提示词生成Agent"""

    def __init__(self):
        super().__init__(
            prompt_template_file="mj_prompt_generator.txt",
            output_model=MJPromptOutput,
            temperature=0.5  # 提示词需要精确
        )

    async def generate_prompts_for_chapter(
        self,
        panels: list[StoryboardPanel],
        characters: list[Character],
        world_setting: WorldSetting
    ) -> list[StoryboardPanel]:
        """
        为一个章节的所有分镜面板生成MJ提示词。

        参数:
            panels: 该章节的分镜面板列表
            characters: 所有角色列表（需要其 reference_image_url）
            world_setting: 世界观设定（需要 visual_style）
        返回:
            更新了 mj_prompt 字段的 StoryboardPanel 列表
        """
        updated_panels = []
        for panel in panels:
            updated = await self._generate_single_prompt(panel, characters, world_setting)
            updated_panels.append(updated)
        return updated_panels

    async def _generate_single_prompt(
        self,
        panel: StoryboardPanel,
        characters: list[Character],
        world_setting: WorldSetting
    ) -> StoryboardPanel:
        """为单个分镜生成MJ提示词"""

        # 查找画面中角色的参考图URL
        cref_parts = []
        char_descriptions = []
        for char_name in panel.characters_in_frame:
            char = next((c for c in characters if c.name == char_name), None)
            if char:
                # 角色外貌描述（英文）
                char_descriptions.append(
                    f"{char_name}: {char.appearance.hair}, {char.appearance.eyes}, "
                    f"{char.appearance.outfit}"
                )
                # 如果有参考图URL，添加 --cref
                if char.reference_image_url:
                    cref_parts.append(f"--cref {char.reference_image_url}")

        cref_string = " ".join(cref_parts) if cref_parts else ""
        char_desc_string = "; ".join(char_descriptions) if char_descriptions else "no characters"

        system_msg = self.prompt_text if self.prompt_text else self._default_system_prompt()

        human_msg = (
            "## 视觉风格\n{visual_style}\n\n"
            "## 分镜信息\n"
            "镜头类型：{shot_type}\n"
            "画面描述：{visual_description}\n"
            "角色及动作：{character_actions}\n"
            "背景：{background}\n"
            "光照：{lighting}\n"
            "情绪：{mood}\n\n"
            "## 角色外貌参考（英文）\n{char_descriptions}\n\n"
            "## 已有的 --cref 参数\n{cref_string}\n\n"
            "请生成完整的Midjourney提示词。\n"
            "注意：\n"
            "- 提示词主体必须全部使用英文\n"
            "- 提示词结尾必须包含提供的 --cref 参数（如果有的话）\n"
            "- 如果有 --cref，还要加 --cw 100\n"
            "- 最后附加 --ar 16:9 --style raw --v 6.1\n\n"
            "输出格式要求：\n{format_instructions}"
        )

        chain = self._build_chain(system_msg, human_msg)

        # 格式化角色动作
        actions_str = ", ".join([
            f"{k}: {v}" for k, v in panel.character_actions.items()
        ]) if panel.character_actions else "无"

        result = await self._invoke(
            chain,
            visual_style=world_setting.visual_style,
            shot_type=panel.shot_type.value,
            visual_description=panel.visual_description,
            character_actions=actions_str,
            background=panel.background,
            lighting=panel.lighting if panel.lighting else "natural lighting",
            mood=panel.mood if panel.mood else "neutral",
            char_descriptions=char_desc_string,
            cref_string=cref_string if cref_string else "无角色参考图（不需要添加 --cref）",
            format_instructions=self.format_instructions
        )

        # 更新 panel 的 mj_prompt
        panel.mj_prompt = result.get("mj_prompt", "")
        return panel

    def _default_system_prompt(self) -> str:
        return """你是一个Midjourney提示词专家，专门为动漫分镜生成高质量的MJ提示词。

## 提示词结构
[镜头类型], [角色描述和动作], [环境背景], [光照], [情绪氛围], [视觉风格], [附加品质词] [--cref URL(如果有)] [--cw 100(如果有cref)] --ar 16:9 --style raw --v 6.1

## 关键规则
1. 全部使用英文
2. 不要使用引号
3. 用逗号分隔描述元素
4. 角色描述要包含外貌特征（发色、瞳色、服装），确保与参考图一致
5. 如果提供了 --cref URL，必须原样附加在提示词末尾（在 --ar 之前）
6. 如果有 --cref，必须同时添加 --cw 100
7. 提示词长度控制在 100-200 词之间
8. 添加品质提升词：masterpiece, best quality, highly detailed, anime screencap

## 输出格式
只输出 mj_prompt 字段，值为完整的提示词字符串。

你必须以JSON格式输出，严格遵循指定的schema。不要输出JSON以外的任何内容。"""