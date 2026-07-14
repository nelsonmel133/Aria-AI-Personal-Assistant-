import uuid
from typing import Optional, List
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user_id

router = APIRouter()


class NoteCreate(BaseModel):
    title: Optional[str] = None
    body: str
    tags: List[str] = []


@router.get("")
async def list_notes(user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        text("select * from notes where user_id = :uid order by pinned desc, updated_at desc"),
        {"uid": user_id},
    )
    return [dict(row._mapping) for row in result]


@router.post("")
async def create_note(
    payload: NoteCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    note_id = str(uuid.uuid4())
    await db.execute(
        text(
            """
            insert into notes (id, user_id, title, body, tags)
            values (:id, :uid, :title, :body, :tags)
            """
        ),
        {"id": note_id, "uid": user_id, **payload.model_dump()},
    )
    await db.commit()
    return {"id": note_id, **payload.model_dump()}
