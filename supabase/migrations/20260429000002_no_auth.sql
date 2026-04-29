-- Migration: remove user auth, use session_id instead
-- This replaces user_id FK on conversations with a plain session_id text column.

-- Drop users table dependency
alter table conversations drop constraint if exists conversations_user_id_fkey;
alter table conversations drop column if exists user_id;

-- Add session_id
alter table conversations add column if not exists session_id text not null default '';

-- Index for fast session lookups
create index if not exists conversations_session_id_idx on conversations(session_id);

-- Users table is no longer needed
drop table if exists users cascade;

-- Drop unused triggers
drop trigger if exists users_updated_at on users;
