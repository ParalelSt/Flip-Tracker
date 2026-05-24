-- Migration: align trick names with the best-fit videos linked in 007.
-- Slugs stay the same so existing URLs / user_trick_status / combos don't
-- break — only the displayed name + description change.
-- Run AFTER 007. Idempotent.

update tricks set
  name        = 'Twirl Aerial',
  description = 'Horizontal spinning aerial — launch with a twirl, catch by the bite handle.'
where slug = 'helicopter';

update tricks set
  name        = 'Hyper Aerial',
  description = 'Fast, aggressive aerial recovery — common name for high-speed multi-rotation tosses.'
where slug = 'frantic-aerial';

update tricks set
  name        = 'Flow Combo',
  description = 'A continuous, smooth combo string — practice for transitions and flow over individual tricks.'
where slug = 'roller-coaster';
