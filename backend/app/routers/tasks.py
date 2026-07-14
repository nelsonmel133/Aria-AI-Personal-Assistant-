import uuid
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.db import get_db
from app.core.security import get_current_user_id

router = APIRouter()


class TaskCreate(BaseModel):
    title: str
    notes: Optional[str] = None
    priority: str = "normal"
    due_at: Optional[str] = None
    remind_at: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    notes: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_at: Optional[str] = None
    remind_at: Optional[str] = None


@router.get("")
async def list_tasks(
    status: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    query = "select * from tasks where user_id = :uid"
    params = {"uid": user_id}
    if status:
        query += " and status = :status"
        params["status"] = status
    query += " order by coalesce(due_at, 'infinity'::timestamptz) asc, priority desc"
    result = await db.execute(text(query), params)
    return [dict(row._mapping) for row in result]


@router.post("")
async def create_task(
    payload: TaskCreate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    task_id = str(uuid.uuid4())
    await db.execute(
        text(
            """
            insert into tasks (id, user_id, title, notes, priority, due_at, remind_at)
            values (:id, :uid, :title, :notes, :priority, :due_at, :remind_at)
            """
        ),
        {"id": task_id, "uid": user_id, **payload.model_dump()},
    )
    await db.commit()
    return {"id": task_id, **payload.model_dump()}


@router.patch("/{task_id}")
async def update_task(
    task_id: str,
    payload: TaskUpdate,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    fields = {k: v for k, v in payload.model_dump().items() if v is not None}
    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    set_clause = ", ".join(f"{k} = :{k}" for k in fields)
    fields.update({"id": task_id, "uid": user_id, "updated_at": "now()"})
    await db.execute(
        text(
            f"""
            update tasks set {set_clause}, updated_at = now()
            where id = :id and user_id = :uid
            """
        ),
        fields,
    )
    await db.commit()
    return {"ok": True}


@router.delete("/{task_id}")
async def delete_task(
    task_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    await db.execute(
        text("delete from tasks where id = :id and user_id = :uid"),
        {"id": task_id, "uid": user_id},
    )
    await db.commit()
    return {"ok": True}
