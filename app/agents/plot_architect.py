"""
故事大纲编排Agent。
根据世界观设定和用户要求，生成完整的故事大纲和各章节大纲。
"""
from app.agents.base_agent import BaseAgent
from app.models.story import StoryOutline
from app.models.world import WorldSetting

class PlotArchitectAgent(BaseAgent):
    """故事大纲编排Agent"""

    def __init__(self):
        super().__init__(
            prompt_template_file="plot_architect.txt",
            output_model=StoryOutline,
            temperature=0.8
        )

    async def generate_outline(
        self,
        world_setting: WorldSetting,
        user_requirements: str,
        total_chapters: int = 12
    ) -> StoryOutline:
        """
        根据世界观和用户要求生成故事大纲。

        参数:
            world_setting: 已生成的世界观设定
            user_requirements: 用户的故事要求，如 "我想要一个复仇主题的故事，主角从底层逆袭"
            total_chapters: 总章节数
        返回:
            StoryOutline 对象
        """
        system_msg = self.prompt_text if self.prompt_text else self._default_system_prompt()

        # 将世界观序列化为字符串传入
        world_json = world_setting.model_dump_json(indent=2)

        human_msg = (
            "## 世界观设定\n{world_json}\n\n"
            "## 用户故事要求\n{user_requirements}\n\n"
            "## 章节数量要求\n总共 {total_chapters} 章\n\n"
            "请基于以上世界观设定，生成一个完整的故事大纲，包含每个章节的大纲。\n"
            "注意：每个章节大纲的 characters_involved 字段中的角色名，需要是你在故事中设计的角色名（后续会为每个角色创建详细设定）。\n\n"
            "输出格式要求：\n{format_instructions}"
        )

        chain = self._build_chain(system_msg, human_msg)
        result = await self._invoke(
            chain,
            world_json=world_json,
            user_requirements=user_requirements,
            total_chapters=str(total_chapters),
            format_instructions=self.format_instructions
        )

        return StoryOutline(**result)

    def _default_system_prompt(self) -> str:
        return """你是一个专业的动漫故事架构师。你的任务是在已有的世界观框架下，设计一个引人入胜的长篇故事大纲。

要求：
1. 故事必须与世界观设定完全吻合，不能出现与世界观矛盾的情节
2. 故事弧线要完整：开端→发展→高潮→结局
3. 每个章节都要有明确的叙事目标和推进点
4. 章节之间要有因果联系和悬念衔接
5. 角色出场要合理安排，主要角色在前3章内全部登场
6. mood字段要准确反映每章的情绪基调
7. key_events 每章至少3个关键事件

你必须以JSON格式输出，严格遵循指定的schema。不要输出JSON以外的任何内容。"""