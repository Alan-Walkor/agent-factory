"""
Agent 基类。
所有Agent继承此基类，统一LLM初始化和输出解析逻辑。
"""
from langchain_openai import ChatOpenAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser
from pydantic import BaseModel
from pathlib import Path
from app.config import settings
from typing import Type, Optional

class BaseAgent:
    """Agent 基类"""

    def __init__(
        self,
        prompt_template_file: str,
        output_model: Optional[Type[BaseModel]] = None,
        temperature: Optional[float] = None
    ):
        """
        初始化Agent。

        参数:
            prompt_template_file: prompt模板文件名（在 app/prompts/ 目录下）
            output_model: 输出的Pydantic模型类型（用于JsonOutputParser）
            temperature: LLM温度，为None时使用全局配置
        """
        self.llm = ChatOpenAI(
            model=settings.LLM_MODEL_NAME,
            api_key=settings.OPENAI_API_KEY,
            base_url=settings.OPENAI_BASE_URL,
            temperature=temperature if temperature is not None else settings.LLM_TEMPERATURE
        )

        # 加载 prompt 模板
        prompt_path = Path(__file__).parent.parent / "prompts" / prompt_template_file
        if prompt_path.exists():
            self.prompt_text = prompt_path.read_text(encoding="utf-8")
        else:
            self.prompt_text = ""

        # 输出解析器
        self.output_model = output_model
        if output_model:
            self.parser = JsonOutputParser(pydantic_object=output_model)
            self.format_instructions = self.parser.get_format_instructions()
        else:
            self.parser = None
            self.format_instructions = ""

    def _build_chain(self, system_message: str, human_message: str):
        """
        构建一个简单的 LLM Chain。

        参数:
            system_message: 系统提示词
            human_message: 用户消息模板（可包含变量占位符）
        返回:
            LangChain chain 对象
        """
        prompt = ChatPromptTemplate.from_messages([
            ("system", system_message),
            ("human", human_message)
        ])
        if self.parser:
            return prompt | self.llm | self.parser
        return prompt | self.llm

    async def _invoke(self, chain, **kwargs) -> dict:
        """
        异步调用chain。

        参数:
            chain: LangChain chain 对象
            **kwargs: 传递给chain的变量
        返回:
            dict 或 str
        """
        result = await chain.ainvoke(kwargs)
        if hasattr(result, 'content'):
            return result.content
        return result