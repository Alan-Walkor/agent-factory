"""
世界观构建Agent。
根据用户的创意输入，生成完整的世界观设定。
"""
from app.agents.base_agent import BaseAgent
from app.models.world import WorldSetting

class WorldbuildingAgent(BaseAgent):
    """世界观构建Agent"""

    def __init__(self):
        super().__init__(
            prompt_template_file="worldbuilding.txt",
            output_model=WorldSetting,
            temperature=0.8  # 创意类任务用较高温度
        )

    async def generate_world(self, user_idea: str) -> WorldSetting:
        """
        根据用户创意生成世界观设定。

        参数:
            user_idea: 用户的创意描述，如 "一个蒸汽朋克与东方仙侠结合的世界"
        返回:
            WorldSetting 对象
        """
        system_msg = self.prompt_text if self.prompt_text else self._default_system_prompt()
        human_msg = (
            "用户的创意输入：{user_idea}\n\n"
            "请根据以上创意，生成完整的世界观设定。\n"
            "输出格式要求：\n{format_instructions}"
        )

        chain = self._build_chain(system_msg, human_msg)
        result = await self._invoke(
            chain,
            user_idea=user_idea,
            format_instructions=self.format_instructions
        )

        # result 已经是 dict（JsonOutputParser 解析过），转为模型
        return WorldSetting(**result)

    def _default_system_prompt(self) -> str:
        return """你是一个专业的动漫世界观架构师。你的任务是根据用户的创意，设计出完整、自洽、富有想象力的世界观设定。

要求：
1. 世界观必须内部逻辑自洽，没有自相矛盾的设定
2. 视觉风格描述要具体到可以指导 Midjourney 生成图片的程度
3. 色彩方案要用具体的十六进制色值
4. 关键地点至少包含5个，每个要有独特的视觉特征
5. 如果用户提到了魔法/超能力/科技体系，必须设计完整的能力体系
6. 社会结构要包含至少2个对立或竞争的阵营

你必须以JSON格式输出，严格遵循指定的schema。不要输出JSON以外的任何内容。"""