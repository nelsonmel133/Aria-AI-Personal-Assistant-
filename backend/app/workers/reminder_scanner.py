"""
Aria reminder scanner worker.

Runs as a separate process (same Docker image, different CMD):
    python -m app.workers.reminder_scanner

Polls every 60 seconds for tasks whose remind_at has passed and
whose status is still 'open'. Pushes via Expo Push Notifications API.

Deploy as a second Fly machine or Railway service:
    fly machine run . --app aria-backend --env WORKER=true \
        --command "python -m app.workers.reminder_scanner"
"""

import asyncio
import logging
from datetime import datetime, timezone

import httpx
from sqlalchemy import text

from app.core.db import SessionLocal

logger = logging.getLogger("aria.reminder_scanner")
logging.basicConfig(level=logging.INFO)

EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send"
POLL_INTERVAL = 60  # seconds


async def get_due_reminders(db):
    """Return tasks whose remind_at <= now and not yet notified."""
    result = await db.execute(
        text(
            """
            select t.id, t.title, t.due_at, t.remind_at,
                   u.id as user_id, u.display_name
            from tasks t
            join users u on u.id = t.user_id
            where t.remind_at <= :now
              and t.status = 'open'
              and (t.metadata->>'reminded_at') is null
            """
        ),
        {"now": datetime.now(timezone.utc)},
    )
    return result.fetchall()


async def mark_reminded(db, task_id: str):
    """Stamp the task so we don't re-notify."""
    await db.execute(
        text(
            """
            update tasks
            set metadata = jsonb_set(
                coalesce(metadata, '{}'),
                '{reminded_at}',
                to_jsonb(now()::text)
            )
            where id = :id
            """
        ),
        {"id": task_id},
    )
    await db.commit()


async def get_push_tokens(db, user_id: str) -> list[str]:
    """
    Look up stored Expo push tokens for a user.
    Add a `push_tokens` table to schema.sql if you want persistent tokens:

        create table push_tokens (
            id uuid primary key default gen_random_uuid(),
            user_id uuid not null references users(id) on delete cascade,
            token text not null unique,
            created_at timestamptz not null default now()
        );

    For now this is a stub returning an empty list — wire up token
    registration from the mobile app via a POST /push-tokens endpoint.
    """
    return []


async def send_push(tokens: list[str], title: str, body: str):
    if not tokens:
        return
    messages = [
        {"to": token, "title": title, "body": body, "sound": "default"}
        for token in tokens
    ]
    async with httpx.AsyncClient() as client:
        try:
            resp = await client.post(EXPO_PUSH_URL, json=messages, timeout=10)
            resp.raise_for_status()
            logger.info("Push sent to %d token(s): %s", len(tokens), title)
        except httpx.HTTPError as e:
            logger.error("Push failed: %s", e)


async def scan_loop():
    logger.info("Reminder scanner started — polling every %ds", POLL_INTERVAL)
    while True:
        try:
            async with SessionLocal() as db:
                reminders = await get_due_reminders(db)
                for row in reminders:
                    tokens = await get_push_tokens(db, str(row.user_id))
                    due_str = (
                        row.due_at.strftime("%-I:%M %p") if row.due_at else "soon"
                    )
                    await send_push(
                        tokens,
                        title=f"Reminder: {row.title}",
                        body=f"Due {due_str}",
                    )
                    await mark_reminded(db, str(row.id))
                    logger.info("Reminded task %s for user %s", row.id, row.user_id)
        except Exception as e:
            logger.error("Scanner error: %s", e)

        await asyncio.sleep(POLL_INTERVAL)


if __name__ == "__main__":
    asyncio.run(scan_loop())
