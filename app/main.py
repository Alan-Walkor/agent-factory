"""
FastAPI 应用入口。
挂载所有路由，配置 CORS。
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="AI动漫剧场工厂",
    description="多Agent架构的动漫剧场自动化生产系统",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
async def health_check():
    return {"status": "ok", "message": "AI动漫剧场工厂运行中"}

from app.api import projects, agents, assets

app.include_router(projects.router, prefix="/api/projects", tags=["项目管理"])
app.include_router(agents.router, prefix="/api/agents", tags=["Agent调用"])
app.include_router(assets.router, prefix="/api/assets", tags=["资产管理"])