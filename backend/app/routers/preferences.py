from typing import Optional
from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user_id

router = APIRouter()


class PreferencesUpdate(BaseModel):
    theme: Optional[str] = None
    voice_enabled: Optional[bool] = None
    voice_id: Optional[str] = None
    assistant_name: Optional[str] = None
    wake_style: Optional[str] = None


@router.get("")
async def get_preferences(
    user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        text("select * from user_preferences where user_id = :uid"), {"uid": user_id}
    )
    row = result.first()
    return dict(row._mapping) if row else {}


@router.patch("")
async def update_preferences(
    payload: PreferencesUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    fields = {k: v for k, v in payload.model_dump().items() if v is not None}
    if fields:
        set_clause = ", ".join(f"{k} = :{k}" for k in fields)
        fields["uid"] = user_id
        await db.execute(
            text(f"update user_preferences set {set_clause}, updated_at = now() where user_id = :uid"),
            fields,
        )
        await db.commit()
    return {"ok": True}
