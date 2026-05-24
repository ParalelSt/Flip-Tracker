-- Migration: 3 more canonical tricks get the closest-named tutorial available.
-- These are best-fit not exact-fit — naming varies wildly between creators.
-- - frantic-aerial → "Hyper Aerials" by cutlerylover (= fast / aggressive aerial)
-- - helicopter    → "Twirl Aerial" by Squid Industries (horizontal spinning aerial)
-- - roller-coaster→ "Improve your flow!" combo by Benshamin Flips (flow combo)
-- Remaining 4 (icepick-fan, tsunami, whirly-bird, atomic) still videoless.
-- Idempotent.

with v(slug, url, title, author, author_url, thumb) as (
  values
    ('frantic-aerial', 'https://www.youtube.com/watch?v=w51h7N8En9g', 'Balisong Instructional : "Hyper Aerials"',          'cutlerylover',     'https://www.youtube.com/@cutlerylover',     'https://i.ytimg.com/vi/w51h7N8En9g/hqdefault.jpg'),
    ('helicopter',     'https://www.youtube.com/watch?v=ykZ4s6bWCg4', 'Tutorial: Twirl Aerial (Intermediate)',             'Squid Industries', 'https://www.youtube.com/@SquidIndustriesco', 'https://i.ytimg.com/vi/ykZ4s6bWCg4/hqdefault.jpg'),
    ('roller-coaster', 'https://www.youtube.com/watch?v=RDHfTTdV5M4', 'Improve your flow! - Learn this Balisong Combo',     'Benshamin Flips',  'https://www.youtube.com/@benshaminflips',   'https://i.ytimg.com/vi/RDHfTTdV5M4/hqdefault.jpg')
)
update tricks t
   set video_url           = v.url,
       video_title         = v.title,
       video_author        = v.author,
       video_author_url    = v.author_url,
       video_thumbnail_url = v.thumb
  from v
 where t.slug = v.slug;
