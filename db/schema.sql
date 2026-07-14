-- Aria — Personal AI Assistant
-- PostgreSQL 15+
-- Run: psql $DATABASE_URL -f schema.sql

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

create or replace function trigger_set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ── Users & auth ────────────────────────────────────────────
create table users (
    id              uuid primary key default gen_random_uuid(),
    email           text unique not null,
    password_hash   text not null,
    display_name    text not null,
    avatar_url      text,
    timezone        text not null default 'UTC',
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);

create table user_preferences (
    user_id         uuid primary key references users(id) on delete cascade,
    theme           text not null default 'dusk',       -- dusk | dawn | mono | reef
    voice_enabled   boolean not null default true,
    voice_id        text default 'aria-warm',
    assistant_name  text not null default 'Aria',
    wake_style      text not null default 'tap',          -- tap | wake-word
    notification_prefs jsonb not null default '{"reminders": true, "digest": true}',
    updated_at      timestamptz not null default now()
);

create table refresh_tokens (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid not null references users(id) on delete cascade,
    token_hash      text not null,
    expires_at      timestamptz not null,
    created_at      timestamptz not null default now(),
    revoked         boolean not null default false
);

-- ── Conversations ───────────────────────────────────────────
create table conversations (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid not null references users(id) on delete cascade,
    title           text not null default 'New conversation',
    pinned          boolean not null default false,
    archived        boolean not null default false,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);
create index idx_conversations_user on conversations(user_id, updated_at desc);

create table messages (
    id              uuid primary key default gen_random_uuid(),
    conversation_id uuid not null references conversations(id) on delete cascade,
    role            text not null check (role in ('user','assistant','system')),
    content         text not null,
    audio_url       text,                                 -- for voice messages
    metadata        jsonb not null default '{}',           -- tool calls, tokens, etc.
    created_at      timestamptz not null default now()
);
create index idx_messages_conversation on messages(conversation_id, created_at);

-- ── Tasks, reminders, notes ─────────────────────────────────
create table tasks (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid not null references users(id) on delete cascade,
    title           text not null,
    notes           text,
    status          text not null default 'open' check (status in ('open','doing','done','cancelled')),
    priority        text not null default 'normal' check (priority in ('low','normal','high','urgent')),
    due_at          timestamptz,
    remind_at       timestamptz,
    recurrence_rule text,                                  -- iCal RRULE string, nullable
    source_message_id uuid references messages(id),        -- task created from chat
    calendar_event_id text,                                -- external calendar sync ref
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);
create index idx_tasks_user_status on tasks(user_id, status, due_at);

create table notes (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid not null references users(id) on delete cascade,
    title           text,
    body            text not null,
    tags            text[] not null default '{}',
    pinned          boolean not null default false,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now()
);
create index idx_notes_user on notes(user_id, updated_at desc);

-- ── Calendar sync (external providers) ──────────────────────
create table calendar_connections (
    id              uuid primary key default gen_random_uuid(),
    user_id         uuid not null references users(id) on delete cascade,
    provider        text not null check (provider in ('google','microsoft','apple')),
    access_token    text not null,        -- encrypt at rest in app layer (see backend/app/core/crypto.py)
    refresh_token   text,
    expires_at      timestamptz,
    external_account_email text,
    created_at      timestamptz not null default now()
);

create trigger trg_users_updated before update on users
    for each row execute procedure trigger_set_updated_at();
