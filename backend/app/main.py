"""
Aria backend — FastAPI entrypoint.

Run locally:
    uvicorn app.main:app --reload --port 8000

Env vars required (see .env.example):
    DATABASE_URL, JWT_SECRET, ANTHROPIC_API_KEY
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, conversations, tasks, notes, preferences

app = FastAPI(title="Aria API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(conversations.router, prefix="/conversations", tags=["conversations"])
app.include_router(tasks.router, prefix="/tasks", tags=["tasks"])
app.include_router(notes.router, prefix="/notes", tags=["notes"])
app.include_router(preferences.router, prefix="/preferences", tags=["preferences"])


@app.get("/health")
def health():
    return {"status": "ok"}
