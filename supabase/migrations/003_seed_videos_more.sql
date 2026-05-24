-- Migration: backfill 3 more canonical tricks from Bali Tube + Squid Industries.
-- Idempotent — only touches the named slugs.

with v(slug, url, title, author, author_url, thumb) as (
  values
    ('y2',            'https://www.youtube.com/watch?v=7wTDQhDI71M', 'Y2K Butterfly Knife Tutorial Beginner! Learn The Y2K Balisong Trick How To Flip',                  'Bali Tube',        'https://www.youtube.com/@BaliTube',         'https://i.ytimg.com/vi/7wTDQhDI71M/hqdefault.jpg'),
    ('y2-12',         'https://www.youtube.com/watch?v=C56wm0Wh7EA', 'How to do the Reverse and 0G/Zero Gravity Chaplin │Beginner Balisong/Butterfly Knife Tutorial',   'Squid Industries', 'https://www.youtube.com/@SquidIndustriesco', 'https://i.ytimg.com/vi/C56wm0Wh7EA/hqdefault.jpg'),
    ('basic-closing', 'https://www.youtube.com/watch?v=QapXHENfUsk', 'Closing #1 Balisong Tutorial | EASY BUTTERFLY KNIFE TRICKS',                                       'Bali Tube',        'https://www.youtube.com/@BaliTube',         'https://i.ytimg.com/vi/QapXHENfUsk/hqdefault.jpg')
)
update tricks t
   set video_url           = v.url,
       video_title         = v.title,
       video_author        = v.author,
       video_author_url    = v.author_url,
       video_thumbnail_url = v.thumb
  from v
 where t.slug = v.slug;
