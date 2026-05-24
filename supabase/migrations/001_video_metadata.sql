-- Migration: cache oEmbed metadata (title, author, thumbnail) on tricks so
-- the UI can credit the source channel without hitting YouTube every render.
-- Run once in the Supabase SQL editor.
alter table tricks
  add column if not exists video_title         text,
  add column if not exists video_author        text,
  add column if not exists video_author_url    text,
  add column if not exists video_thumbnail_url text;
