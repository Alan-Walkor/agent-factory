# AI动漫剧场工厂

AI动漫剧场工厂是一个基于多Agent架构的动漫剧场自动化生产系统，使用 FastAPI + LangChain 技术栈构建。

## 项目结构

```
ai-anime-factory/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI 应用入口
│   ├── config.py        # 配置管理
│   ├── models/          # 数据模型
│   ├── agents/          # AI Agent 实现
│   ├── orchestrator/    # 流程编排器
│   ├── services/        # 业务服务层
│   ├── storage/         # 存储相关组件
│   ├── api/             # API 路由定义
│   └── prompts/         # Prompt 模板
├── data/
│   └── projects/        # 运行时项目数据
├── requirements.txt
├── .env.example
└── README.md
```

## 快速开始

1. 安装依赖:
   ```bash
   pip install -r requirements.txt
   ```

2. 配置环境变量:
   ```bash
   cp .env.example .env
   # 编辑 .env 文件，填入你的 API 密钥
   ```

3. 启动应用:
   ```bash
   uvicorn app.main:app --reload
   ```