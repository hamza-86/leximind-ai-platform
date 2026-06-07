# api/v1 package
from fastapi import APIRouter
from app.api.v1 import analyze, chat, health

api_router = APIRouter()

api_router.include_router(health.router, tags=["health"])
api_router.include_router(analyze.router, tags=["analyze"])
api_router.include_router(chat.router, tags=["chat"])
