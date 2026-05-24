-- Migration: 2 more canonical tricks get reference videos from new creators.
-- - fan-pass → "Basic Fan Transfers" by lqkii_alt (fan transfer = fan pass)
-- - magic-drop → "Suicide Drop" by Calvin Van Arragon (industry term overlap)
-- The remaining 7 (icepick-fan, tsunami, frantic-aerial, whirly-bird,
-- helicopter, roller-coaster, atomic) still have no confident tutorial match.
-- Idempotent.

with v(slug, url, title, author, author_url, thumb) as (
  values
    ('fan-pass',   'https://www.youtube.com/watch?v=HbpKt8YqItk', 'BASIC FAN TRANSFERS | BALISONG TUTORIAL',                       'lqkii_alt',          'https://www.youtube.com/@lqkii_alt',   'https://i.ytimg.com/vi/HbpKt8YqItk/hqdefault.jpg'),
    ('magic-drop', 'https://www.youtube.com/watch?v=OhAUwYA5fFI', 'Suicide Drop + Tutorial 22 - Intermediate Balisong Move',       'Calvin Van Arragon', 'https://www.youtube.com/@CalviNNation', 'https://i.ytimg.com/vi/OhAUwYA5fFI/hqdefault.jpg')
)
update tricks t
   set video_url           = v.url,
       video_title         = v.title,
       video_author        = v.author,
       video_author_url    = v.author_url,
       video_thumbnail_url = v.thumb
  from v
 where t.slug = v.slug;
