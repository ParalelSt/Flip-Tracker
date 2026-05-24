-- Migration: kill the last 4 videoless slugs by replacing them with named
-- tricks that DO have tutorials. Slugs are kept so existing references
-- (status / combos / URLs) survive — only display name, description, and
-- video metadata change. Idempotent.
--
-- icepick-fan  → Choker Fan (Squid Industries) — fan from icepick grip
-- tsunami      → Snap Aerial (Calvin Van Arragon) — fast vertical aerial
-- whirly-bird  → Backhand Catch Aerial (Squid Industries) — spinning catch
-- atomic       → Helix Aerial (Squid Industries) — compound aerial

update tricks set
  name        = 'Choker Fan',
  description = 'Fanning while holding the bali in choker / icepick grip — closes back into the hand.',
  video_url           = 'https://www.youtube.com/watch?v=khyeXXRBGWU',
  video_title         = 'How to do the Choker Fan | Intermediate Balisong/Butterfly Knife Tutorial',
  video_author        = 'Squid Industries',
  video_author_url    = 'https://www.youtube.com/@SquidIndustriesco',
  video_thumbnail_url = 'https://i.ytimg.com/vi/khyeXXRBGWU/hqdefault.jpg'
where slug = 'icepick-fan';

update tricks set
  name        = 'Snap Aerial',
  description = 'A short, sharp single-rotation aerial — quick toss, fast recovery.',
  video_url           = 'https://www.youtube.com/watch?v=argoMLJlvXA',
  video_title         = 'Snap Aerial + Tutorial 44 - Intermediate Balisong Move',
  video_author        = 'Calvin Van Arragon',
  video_author_url    = 'https://www.youtube.com/@CalviNNation',
  video_thumbnail_url = 'https://i.ytimg.com/vi/argoMLJlvXA/hqdefault.jpg'
where slug = 'tsunami';

update tricks set
  name        = 'Backhand Catch Aerial',
  description = 'Toss into a spin and catch on the back of the hand — recovery into a backhand grip.',
  video_url           = 'https://www.youtube.com/watch?v=jkAXN5ILfmI',
  video_title         = 'Tutorial - Backhand Catch Aerial (Intermediate)',
  video_author        = 'Squid Industries',
  video_author_url    = 'https://www.youtube.com/@SquidIndustriesco',
  video_thumbnail_url = 'https://i.ytimg.com/vi/jkAXN5ILfmI/hqdefault.jpg'
where slug = 'whirly-bird';

update tricks set
  name        = 'Helix Aerial',
  description = 'Helix-style rotation launched mid-air — compound aerial with a corkscrew catch.',
  video_url           = 'https://www.youtube.com/watch?v=f6ScjhrLo5A',
  video_title         = 'How to do the Helix Aerial | Beginner/Intermediate Balisong/Butterfly Knife Tutorial',
  video_author        = 'Squid Industries',
  video_author_url    = 'https://www.youtube.com/@SquidIndustriesco',
  video_thumbnail_url = 'https://i.ytimg.com/vi/f6ScjhrLo5A/hqdefault.jpg'
where slug = 'atomic';
