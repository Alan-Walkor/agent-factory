# AI动漫剧场工厂 — CLAUDE.md

## 项目概述

多Agent自动化动漫生产系统。输入世界观创意，通过7个专属AI Agent流水线自动生成世界观、故事大纲、角色设计、章节剧本、分镜脚本、MJ提示词和后期剪辑脚本。

## 技术栈

| 层 | 技术 |
|---|---|
| 后端 | Python 3.11 + FastAPI 0.115 + Uvicorn |
| LLM | LangChain 0.3 + OpenAI GPT-4o |
| 前端 | React 18 + TypeScript 5.6 + Vite 5 |
| 路由 | React Router DOM 6 |
| 状态 | Zustand 4 |
| 样式 | Tailwind CSS 3 |
| 动画 | Framer Motion 11 |
| 存储 | JSON 文件（每项目一个文件） |

## 目录结构

```
ai-anime-factory/
├── app/                    # 后端 (Python/FastAPI)
│   ├── main.py             # 入口：挂载 CORS + 3 个路由前缀
│   ├── config.py           # 从 .env 读取配置
│   ├── api/
│   │   ├── projects.py     # /api/projects — 项目 CRUD + 提示词查询
│   │   ├── agents.py       # /api/agents  — Agent 执行端点
│   │   └── assets.py       # /api/assets  — 资产上传/审核
│   ├── agents/             # 7 个专属 Agent
│   │   ├── base_agent.py
│   │   ├── worldbuilding.py
│   │   ├── plot_architect.py
│   │   ├── character_designer.py
│   │   ├── chapter_writer.py
│   │   ├── storyboard_designer.py
│   │   ├── mj_prompt_generator.py
│   │   └── post_production.py
│   ├── models/             # Pydantic 数据模型
│   ├── services/
│   │   ├── project_service.py
│   │   └── asset_service.py
│   ├── orchestrator/
│   │   └── pipeline.py     # AnimePipeline — 串联全流程
│   ├── storage/
│   │   └── json_store.py   # 读写 data/projects/{id}.json
│   └── prompts/            # 7 个 LLM 提示词模板文件
├── src/                    # 前端 (React/TS)
│   ├── main.tsx            # BrowserRouter + StrictMode
│   ├── App.tsx             # Routes 定义（包在 AppShell 内）
│   ├── components/layout/
│   │   ├── AppShell.tsx    # 布局容器 + Toast 通知
│   │   ├── Sidebar.tsx     # 侧边导航（⚠ 见关键注意事项）
│   │   └── Header.tsx      # 顶部面包屑 + Agent 状态
│   ├── pages/              # 8 个页面
│   ├── api/                # Axios 封装（client.ts + 3 个 API 模块）
│   ├── store/
│   │   ├── useProjectStore.ts  # 项目数据 + Agent 调用
│   │   └── useUIStore.ts       # sidebar/toast/modal
│   └── types/              # TS 类型定义
└── data/projects/          # 运行时 JSON 存储
```

## 启动方式

```bash
# 后端（端口 8000）
pip install -r requirements.txt
cp .env.example .env  # 填写 OPENAI_API_KEY
uvicorn app.main:app --reload

# 前端（端口 3000，代理 /api → :8000）
npm install
npm run dev
```

## 生产流水线

### 阶段一（全自动）
```
用户输入 → WorldbuildingAgent → PlotArchitectAgent → CharacterDesignerAgent
→ ChapterWriterAgent（逐章）→ StoryboardDesignerAgent（逐章）
→ 状态: mj_prompt_ready
```

### 用户手动步骤
1. 用MJ生成角色三视图 → 在 AssetManager 上传 URL → 选择参考图
2. 调用 MJPromptGeneratorAgent 生成含 `--cref` 的分镜提示词
3. 用MJ生成分镜图片 → 上传 → 审核通过

### 阶段二
```
PostProductionAgent → 生成剪辑脚本 → 状态: completed
```

## API 端点速查

| 方法 | 路径 | 说明 |
|---|---|---|
| POST | /api/projects/ | 创建项目 |
| GET | /api/projects/ | 项目列表 |
| GET | /api/projects/{id} | 项目详情 |
| DELETE | /api/projects/{id} | 删除项目 |
| POST | /api/agents/phase-one | 执行阶段一全流程 |
| POST | /api/agents/worldbuild | 单独生成世界观 |
| POST | /api/agents/outline | 单独生成大纲 |
| POST | /api/agents/design-characters | 单独设计角色 |
| POST | /api/agents/script-and-storyboard | 生成剧本+分镜 |
| POST | /api/agents/{id}/generate-storyboard-prompts | 生成分镜MJ提示词 |
| POST | /api/agents/{id}/phase-two | 执行阶段二 |
| POST | /api/assets/{id}/character-turnaround | 上传角色三视图 |
| POST | /api/assets/{id}/character-reference | 设置参考图 |
| PUT  | /api/assets/{id}/panels/{panelId}/status | 更新分镜状态 |

## 关键注意事项 ⚠

### Sidebar/Header 在 Routes 外部渲染
`AppShell`（包含 `Sidebar` 和 `Header`）包裹了 `<Routes>`，导致这两个组件处于 React Router 的路由上下文之外。

**后果**：`useParams()` 在这两个组件中永远返回 `{}`。

**解决方案（已实施）**：`Sidebar.tsx` 改用 `useLocation()` + 正则提取项目ID：
```ts
const projectIdMatch = location.pathname.match(/^\/project\/([^/]+)/)
const projectId = projectIdMatch ? projectIdMatch[1] : undefined
```
`Header.tsx` 的面包屑也是通过 `location.pathname` 解析，不依赖 `useParams()`。

**绝对不要**在 `AppShell`、`Sidebar` 或 `Header` 中使用 `useParams()` 获取路由参数。

### 数据存储
- 每个项目存为一个 JSON 文件：`data/projects/{uuid}.json`
- 所有字段（世界观、角色、剧本、分镜、资产）序列化在同一文件
- 读写使用 `aiofiles` 异步操作

### 前端状态
- `currentProject`（来自 `useProjectStore`）在页面组件 `useEffect` 中通过 `fetchProject(id)` 加载
- 页面间导航时 `currentProject` 不会自动清除（返回仪表盘时仍保留上一个项目数据）

### API 超时
前端 Axios 客户端超时设置为 **300秒**（5分钟），以容纳 Agent LLM 调用的长时延迟。

### 环境变量
```
OPENAI_API_KEY=          # 必填
OPENAI_BASE_URL=         # 可选，默认 https://api.openai.com/v1
LLM_MODEL_NAME=gpt-4o   # 默认
LLM_TEMPERATURE=0.7      # 默认
```

## 项目状态枚举

```
init → worldbuilding → outlining → scripting → storyboarding
→ character_design → mj_prompt_ready → asset_collecting
→ post_production → completed
```
