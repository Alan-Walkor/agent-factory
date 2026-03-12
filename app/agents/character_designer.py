"""
角色设计Agent。
根据世界观和故事需求，设计角色外貌并生成MJ三视图提示词。
"""
from app.agents.base_agent import BaseAgent
from app.models.character import Character
from app.models.world import WorldSetting
from app.models.story import StoryOutline
from pydantic import BaseModel, Field

class CharacterListOutput(BaseModel):
    """角色列表输出"""
    characters: list[Character] = Field(description="角色列表")

class CharacterDesignerAgent(BaseAgent):
    """角色设计Agent"""

    def __init__(self):
        super().__init__(
            prompt_template_file="character_designer.txt",
            output_model=CharacterListOutput,
            temperature=0.8
        )

    async def design_characters(
        self,
        world_setting: WorldSetting,
        story_outline: StoryOutline
    ) -> list[Character]:
        """
        根据世界观和故事大纲，设计所有角色。

        参数:
            world_setting: 世界观设定
            story_outline: 故事大纲
        返回:
            Character 列表（包含外貌、性格、MJ三视图提示词）
        """
        system_msg = self.prompt_text if self.prompt_text else self._default_system_prompt()

        # 提取所有角色名（去重）
        all_character_names = set()
        for ch in story_outline.chapter_outlines:
            for name in ch.characters_involved:
                all_character_names.add(name)

        human_msg = (
            "## 世界观\n"
            "世界名称：{world_name}\n"
            "时代：{era}\n"
            "视觉风格：{visual_style}\n"
            "主色调：{color_palette}\n\n"
            "## 故事信息\n"
            "标题：{story_title}\n"
            "梗概：{logline}\n"
            "故事弧线：{story_arc}\n\n"
            "## 需要设计的角色名单\n{character_names}\n\n"
            "请为以上每个角色设计完整的外貌、性格、背景，并生成Midjourney角色三视图提示词。\n\n"
            "### 关于 mj_character_prompt 字段的特殊要求\n"
            "这个字段是用于在Midjourney中生成角色三视图（character turnaround sheet）的提示词，必须遵循以下格式：\n"
            "```\n"
            "character turnaround sheet of [角色外貌描述], [服装描述], [配饰], "
            "[视觉风格], white background, multiple views, front view, side view, back view, "
            "full body, anime style, character design reference sheet --ar 16:9 --style raw --v 6.1\n"
            "```\n"
            "注意：\n"
            "- 提示词必须全部用英文\n"
            "- 外貌描述要非常具体（发色发型、瞳色、体型、标志性服装每个细节都要写）\n"
            "- 不要包含动作描述，三视图是静态站姿\n"
            "- 必须包含 'white background' 和 'multiple views'\n\n"
            "输出格式要求：\n{format_instructions}"
        )

        chain = self._build_chain(system_msg, human_msg)
        result = await self._invoke(
            chain,
            world_name=world_setting.name,
            era=world_setting.era,
            visual_style=world_setting.visual_style,
            color_palette=", ".join(world_setting.color_palette) if world_setting.color_palette else "未指定",
            story_title=story_outline.title,
            logline=story_outline.logline,
            story_arc=story_outline.story_arc,
            character_names="\n".join([f"- {name}" for name in sorted(all_character_names)]),
            format_instructions=self.format_instructions
        )

        return [Character(**c) for c in result.get("characters", [])]

    def _default_system_prompt(self) -> str:
        return """你是一个专业的动漫角色设计师。你的任务是为动漫作品设计角色的外貌、性格，并生成Midjourney角色三视图提示词。

要求：
1. 每个角色的外貌设计必须有高辨识度，避免同质化
2. 角色外貌要与世界观风格匹配
3. 主角和反派的设计要形成视觉对比
4. mj_character_prompt 必须是英文，格式严格遵循三视图模板
5. 性格描述要简洁有力，100字以内
6. 背景故事200字以内

你必须以JSON格式输出，严格遵循指定的schema。不要输出JSON以外的任何内容。"""