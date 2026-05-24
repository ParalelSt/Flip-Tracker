-- Migration: training notes journal. Each user owns their own notes.
-- Run once in the Supabase SQL editor.

create table if not exists notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  body       text not null check (length(body) > 0),
  created_at timestamptz not null default now()
);
create index if not exists notes_user_created_idx on notes(user_id, created_at desc);

alter table notes enable row level security;

create policy "own notes" on notes
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());