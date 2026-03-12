"""
全局配置管理。
使用 pydantic-settings 从 .env 文件加载配置。
"""
from pydantic_settings import BaseSettings
from pathlib import Path

class Settings(BaseSettings):
    # LLM 配置
    OPENAI_API_KEY: str = ""
    OPENAI_BASE_URL: str = "https://api.openai.com/v1"
    LLM_MODEL_NAME: str = "gpt-4o"
    LLM_TEMPERATURE: float = 0.7

    # 项目数据目录
    DATA_DIR: Path = Path("data/projects")

    # 服务配置
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()