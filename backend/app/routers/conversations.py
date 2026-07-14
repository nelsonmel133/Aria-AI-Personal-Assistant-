import uuid
import json
from typing import AsyncGenerator

from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from anthropic import AsyncAnthropic

from app.core.db import get_db
from app.core.security import get_current_user_id
from app.core.config import settings

router = APIRouter()
client = AsyncAnthropic(api_key=settings.ANTHROPIC_API_KEY)

SYSTEM_PROMPT = (
    "You are Aria, a calm, capable personal assistant. Be concise, warm, and "
    "proactive about turning commitments into tasks or reminders when relevant. "
    "Never use emoji unless the user does first."
)


class SendMessageRequest(BaseModel):
    conversation_id: str | None = None
    content: str


@router.get("")
async def list_conversations(
    user_id: str = Depends(get_current_user_id), db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        text(
            """
            select id, title, pinned, updated_at
            from conversations
            where user_id = :uid and archived = false
            order by pinned desc, updated_at desc
            """
        ),
        {"uid": user_id},
    )
    return [dict(row._mapping) for row in result]


@router.get("/{conversation_id}/messages")
async def get_messages(
    conversation_id: str,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        text(
            """
            select m.id, m.role, m.content, m.created_at
            from messages m
            join conversations c on c.id = m.conversation_id
            where m.conversation_id = :cid and c.user_id = :uid
            order by m.created_at asc
            """
        ),
        {"cid": conversation_id, "uid": user_id},
    )
    return [dict(row._mapping) for row in result]


@router.post("/send")
async def send_message(
    payload: SendMessageRequest,
    user_id: str = Depends(get_current_user_id),
    db: AsyncSession = Depends(get_db),
):
    """Streams the assistant reply as Server-Sent Events while persisting both turns."""
    conversation_id = payload.conversation_id
    if not conversation_id:
        conversation_id = str(uuid.uuid4())
        await db.execute(
            text(
                "insert into conversations (id, user_id, title) values (:id, :uid, :title)"
            ),
            {"id": conversation_id, "uid": user_id, "title": payload.content[:60]},
        )

    await db.execute(
        text(
            """
            insert into messages (id, conversation_id, role, content)
            values (:id, :cid, 'user', :content)
            """
        ),
        {"id": str(uuid.uuid4()), "cid": conversation_id, "content": payload.content},
    )
    await db.commit()

    history_result = await db.execute(
        text(
            """
            select role, content from messages
            where conversation_id = :cid order by created_at asc
            """
        ),
        {"cid": conversation_id},
    )
    history = [{"role": r.role, "content": r.content} for r in history_result]

    async def event_stream() -> AsyncGenerator[str, None]:
        full_text = ""
        async with client.messages.stream(
            model=settings.AI_MODEL,
            max_tokens=1024,
            system=SYSTEM_PROMPT,
            messages=history,
        ) as stream:
            async for chunk in stream.text_stream:
                full_text += chunk
                yield f"data: {json.dumps({'delta': chunk, 'conversation_id': conversation_id})}\n\n"

        async with get_db_context() as save_db:
            await save_db.execute(
                text(
                    """
                    insert into messages (id, conversation_id, role, content)
                    values (:id, :cid, 'assistant', :content)
                    """
                ),
                {"id": str(uuid.uuid4()), "cid": conversation_id, "content": full_text},
            )
            await save_db.execute(
                text("update conversations set updated_at = now() where id = :cid"),
                {"cid": conversation_id},
            )
            await save_db.commit()

        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


def get_db_context():
    """Separate session for the background save after the stream closes."""
    from app.core.db import SessionLocal

    return SessionLocal()
