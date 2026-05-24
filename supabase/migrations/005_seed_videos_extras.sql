-- Migration: one more canonical trick gets a reference video (pinwheel via
-- Andux Balisong). The remaining 9 (icepick-fan, fan-pass, tsunami,
-- frantic-aerial, whirly-bird, helicopter, roller-coaster, magic-drop, atomic)
-- have no widely-named tutorial under those slugs; leave them video-less.
-- Idempotent.

with v(slug, url, title, author, author_url, thumb) as (
  values
    ('pinwheel', 'https://www.youtube.com/watch?v=-3poVvQorQA', 'Bailsong Flipping Tutorials - Forehand ''pinwheel'' and Backhand ''pinwheel''', 'Andux Balisong', 'https://www.youtube.com/@anduxbalisong987', 'https://i.ytimg.com/vi/-3poVvQorQA/hqdefault.jpg')
)
update tricks t
   set video_url           = v.url,
       video_title         = v.title,
       video_author        = v.author,
       video_author_url    = v.author_url,
       video_thumbnail_url = v.thumb
  from v
 where t.slug = v.slug;
