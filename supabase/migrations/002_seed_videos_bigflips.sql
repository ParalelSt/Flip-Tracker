-- Migration: backfill canonical tricks with reference videos from Big Flips
-- (https://www.youtube.com/@BigFlips). Title / author / thumbnail are the
-- exact strings YouTube's oEmbed endpoint returns at migration time, so the
-- UI shows credit without an immediate refetch.
-- Run once in the Supabase SQL editor. Idempotent (matched by slug).

with v(slug, url, title, author, author_url, thumb) as (
  values
    ('basic-opening',     'https://www.youtube.com/watch?v=bqEsxxeZGMY', 'Butterfly Knife Tricks for Beginners #1 (Basic Opens)',                     'Big Flips', 'https://www.youtube.com/@BigFlips', 'https://i.ytimg.com/vi/bqEsxxeZGMY/hqdefault.jpg'),
    ('zen-rollover',      'https://www.youtube.com/watch?v=qwh38qUlvMo', 'Balisong Tricks - (Zen Rollover) - Intermediate #6',                        'Big Flips', 'https://www.youtube.com/@BigFlips', 'https://i.ytimg.com/vi/qwh38qUlvMo/hqdefault.jpg'),
    ('safe-grip-change',  'https://www.youtube.com/watch?v=QgwQIGex0lM', 'Butterfly Knife Tricks for Beginners #12 (Upward Swing Handle Switch)',     'Big Flips', 'https://www.youtube.com/@BigFlips', 'https://i.ytimg.com/vi/QgwQIGex0lM/hqdefault.jpg'),
    ('latent-twirl',      'https://www.youtube.com/watch?v=Viu8ozTyU9w', 'Butterfly Knife Tricks for Beginners #16 (Twirl)',                          'Big Flips', 'https://www.youtube.com/@BigFlips', 'https://i.ytimg.com/vi/Viu8ozTyU9w/hqdefault.jpg'),
    ('thumb-rollover',    'https://www.youtube.com/watch?v=Cb7OKgkGSxA', 'Butterfly Knife Tricks for Beginners #14 (Y2K Thumb Roll)',                 'Big Flips', 'https://www.youtube.com/@BigFlips', 'https://i.ytimg.com/vi/Cb7OKgkGSxA/hqdefault.jpg'),
    ('twirl-pass',        'https://www.youtube.com/watch?v=lSpJpifXIis', 'Balisong Tutorial - (Twirl Transfer) - Intermediate #4.1',                  'Big Flips', 'https://www.youtube.com/@BigFlips', 'https://i.ytimg.com/vi/lSpJpifXIis/hqdefault.jpg'),
    ('y2l',               'https://www.youtube.com/watch?v=xeytGezCOgU', 'Balisong Tricks - (Chaplin) - Intermediate #8',                             'Big Flips', 'https://www.youtube.com/@BigFlips', 'https://i.ytimg.com/vi/xeytGezCOgU/hqdefault.jpg'),
    ('y2-aerial',         'https://www.youtube.com/watch?v=RuA4VEt9_oU', 'Butterfly Knife Tricks for Beginners #17 (Basic Aerial)',                   'Big Flips', 'https://www.youtube.com/@BigFlips', 'https://i.ytimg.com/vi/RuA4VEt9_oU/hqdefault.jpg'),
    ('basic-fan',         'https://www.youtube.com/watch?v=WTDOPMxnyBQ', 'Butterfly Knife Tricks for Beginners #2 (The Fan)',                         'Big Flips', 'https://www.youtube.com/@BigFlips', 'https://i.ytimg.com/vi/WTDOPMxnyBQ/hqdefault.jpg'),
    ('backhand-fan',      'https://www.youtube.com/watch?v=SBHdvcaRjlk', 'Balisong Tricks - (Backhand Fan) - Intermediate #14',                       'Big Flips', 'https://www.youtube.com/@BigFlips', 'https://i.ytimg.com/vi/SBHdvcaRjlk/hqdefault.jpg'),
    ('behind-the-8-ball', 'https://www.youtube.com/watch?v=uZw9nXxllxo', 'Balisong Tricks - (Behind the 8 Ball) - Intermediate #16',                  'Big Flips', 'https://www.youtube.com/@BigFlips', 'https://i.ytimg.com/vi/uZw9nXxllxo/hqdefault.jpg'),
    ('wrist-pass',        'https://www.youtube.com/watch?v=MwOEcJBCOBg', 'Butterfly Knife Tricks for Beginners #10 (Wrist Pass)',                     'Big Flips', 'https://www.youtube.com/@BigFlips', 'https://i.ytimg.com/vi/MwOEcJBCOBg/hqdefault.jpg'),
    ('helix',             'https://www.youtube.com/watch?v=e2ToFBmLUgU', 'Balisong Tutorial -  (Helix) - Advanced #2',                                'Big Flips', 'https://www.youtube.com/@BigFlips', 'https://i.ytimg.com/vi/e2ToFBmLUgU/hqdefault.jpg'),
    ('ladder',            'https://www.youtube.com/watch?v=TChlf81Eekg', 'Balisong Tricks - (Jacob''s Ladder) - Intermediate #10',                    'Big Flips', 'https://www.youtube.com/@BigFlips', 'https://i.ytimg.com/vi/TChlf81Eekg/hqdefault.jpg')
)
update tricks t
   set video_url           = v.url,
       video_title         = v.title,
       video_author        = v.author,
       video_author_url    = v.author_url,
       video_thumbnail_url = v.thumb
  from v
 where t.slug = v.slug;
