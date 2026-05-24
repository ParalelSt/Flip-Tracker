-- Run this in the Supabase SQL editor.

create extension if not exists pgcrypto;

-- TRICKS ---------------------------------------------------------------
-- Shared catalog. Seeded tricks have created_by = null and is_public = true.
-- User-added tricks have created_by = user.id. They can flip is_public on
-- their own creations to share with the community.
create table if not exists tricks (
  id          uuid primary key default gen_random_uuid(),
  slug        text unique not null,
  name        text not null,
  description text,
  difficulty  smallint not null check (difficulty between 1 and 5),
  category    text not null,
  video_url   text,
  -- Cached oEmbed metadata (filled server-side on insert/update). Lets the UI
  -- credit the source channel without re-hitting YouTube on every render.
  video_title         text,
  video_author        text,
  video_author_url    text,
  video_thumbnail_url text,
  created_by  uuid references auth.users(id) on delete cascade,
  is_public   boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists tricks_category_idx on tricks(category);
create index if not exists tricks_created_by_idx on tricks(created_by);

-- USER_TRICK_STATUS ----------------------------------------------------
-- Per-user progress against a trick. Default state if no row = 'not_started'.
do $$ begin
  create type trick_status as enum ('not_started', 'learning', 'clean', 'mastered');
exception when duplicate_object then null; end $$;

create table if not exists user_trick_status (
  user_id    uuid not null references auth.users(id) on delete cascade,
  trick_id   uuid not null references tricks(id) on delete cascade,
  status     trick_status not null default 'learning',
  notes      text,
  updated_at timestamptz not null default now(),
  primary key (user_id, trick_id)
);
create index if not exists uts_user_status_idx on user_trick_status(user_id, status);

-- SESSIONS -------------------------------------------------------------
create table if not exists sessions (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  started_at   timestamptz not null default now(),
  duration_min integer not null check (duration_min >= 0),
  notes        text,
  created_at   timestamptz not null default now()
);
create index if not exists sessions_user_started_idx on sessions(user_id, started_at desc);

create table if not exists session_tricks (
  session_id uuid not null references sessions(id) on delete cascade,
  trick_id   uuid not null references tricks(id) on delete cascade,
  primary key (session_id, trick_id)
);

-- COMBOS ---------------------------------------------------------------
create table if not exists combos (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  name       text not null,
  notes      text,
  created_at timestamptz not null default now()
);
create index if not exists combos_user_idx on combos(user_id);

create table if not exists combo_tricks (
  combo_id uuid not null references combos(id) on delete cascade,
  position smallint not null,
  trick_id uuid not null references tricks(id) on delete cascade,
  primary key (combo_id, position)
);
create index if not exists combo_tricks_combo_idx on combo_tricks(combo_id, position);

-- RLS ------------------------------------------------------------------
alter table tricks              enable row level security;
alter table user_trick_status   enable row level security;
alter table sessions            enable row level security;
alter table session_tricks      enable row level security;
alter table combos              enable row level security;
alter table combo_tricks        enable row level security;

-- tricks: visible to anyone authenticated if public, or if they created it.
create policy "tricks visible" on tricks
  for select to authenticated
  using (is_public or created_by = auth.uid());
create policy "tricks insertable by self" on tricks
  for insert to authenticated
  with check (created_by = auth.uid());
create policy "tricks updatable by author" on tricks
  for update to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());
create policy "tricks deletable by author" on tricks
  for delete to authenticated
  using (created_by = auth.uid());

-- user_trick_status: own data only.
create policy "own trick status" on user_trick_status
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- sessions: own data only.
create policy "own sessions" on sessions
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "own session tricks readable" on session_tricks
  for select to authenticated
  using (exists (select 1 from sessions s where s.id = session_id and s.user_id = auth.uid()));
create policy "own session tricks writable" on session_tricks
  for all to authenticated
  using (exists (select 1 from sessions s where s.id = session_id and s.user_id = auth.uid()))
  with check (exists (select 1 from sessions s where s.id = session_id and s.user_id = auth.uid()));

-- combos: own data only.
create policy "own combos" on combos
  for all to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "own combo tricks readable" on combo_tricks
  for select to authenticated
  using (exists (select 1 from combos c where c.id = combo_id and c.user_id = auth.uid()));
create policy "own combo tricks writable" on combo_tricks
  for all to authenticated
  using (exists (select 1 from combos c where c.id = combo_id and c.user_id = auth.uid()))
  with check (exists (select 1 from combos c where c.id = combo_id and c.user_id = auth.uid()));
