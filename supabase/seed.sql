-- Canonical balisong trick seed. Run after schema.sql.
-- created_by = null and is_public = true so every signed-in user sees them.

insert into tricks (slug, name, description, difficulty, category, video_url, is_public, created_by)
values
  -- BASIC (handle/fundamental work)
  ('basic-opening',         'Basic Opening',           'Open the bali from closed using the bite handle.',                   1, 'basic',    null, true, null),
  ('basic-closing',         'Basic Closing',           'Close the bali smoothly back into the safe handle.',                 1, 'basic',    null, true, null),
  ('zen-rollover',          'Zen Rollover',            'Slow rollover from open to closed without any flips.',               1, 'basic',    null, true, null),
  ('safe-grip-change',      'Grip Change',             'Switch grip from chambered to extended without re-opening.',         2, 'basic',    null, true, null),

  -- TWIRLS
  ('latent-twirl',          'Latent Twirl',            'Hold open, twirl the bali around the index finger and recover.',    1, 'twirl',    null, true, null),
  ('thumb-rollover',        'Thumb Rollover',          'Roll the knife over the thumb knuckle between flips.',              3, 'twirl',    null, true, null),
  ('twirl-pass',            'Twirl Pass',              'Pass the bali between hands during a twirl.',                       3, 'twirl',    null, true, null),

  -- Y-SERIES (the classic flips)
  ('y2',                    'Y2 (Basic Flip)',         'Front-hand opening flip — the foundational trick.',                  1, 'flow',     null, true, null),
  ('y2l',                   'Y2L (Chaplin)',           'Y2 from the back of the hand. Also known as Chaplin.',              2, 'flow',     null, true, null),
  ('y2-12',                 'Y2-12 (Reverse Chaplin)', 'Reverse-direction Chaplin from front to back.',                     3, 'flow',     null, true, null),
  ('y2-aerial',             'Y2 Aerial',               'Launch the bali mid-Y2 and catch back into the flip.',              4, 'aerial',   null, true, null),

  -- FANS
  ('basic-fan',             'Basic Fan',               'Fan the handles open and close like a hand fan.',                   1, 'fan',      null, true, null),
  ('icepick-fan',           'Icepick Fan',             'Fan from the icepick grip.',                                        2, 'fan',      null, true, null),
  ('backhand-fan',          'Backhand Fan',            'Fan executed on the back of the hand.',                             3, 'fan',      null, true, null),
  ('fan-pass',              'Fan Pass',                'Pass a live fan between hands.',                                    4, 'fan',      null, true, null),

  -- ROLLOVERS
  ('pinwheel',              'Pinwheel',                'Spin the bali around the index finger, hand stationary.',           2, 'rollover', null, true, null),
  ('behind-the-8-ball',     'Behind the 8-Ball',       'Open the knife behind the hand into a wrist-roll catch.',           2, 'rollover', null, true, null),
  ('wrist-pass',            'Wrist Pass',              'Pass the knife around the wrist mid-flip.',                         3, 'rollover', null, true, null),

  -- AERIALS
  ('tsunami',               'Tsunami',                 'Single-hand vertical toss-and-catch during a Y2.',                  3, 'aerial',   null, true, null),
  ('frantic-aerial',        'Frantic Aerial',          'High-speed aerial recovery after a multi-rotation toss.',           5, 'aerial',   null, true, null),
  ('whirly-bird',           'Whirly Bird',             'Horizontal spinning aerial caught on the bite handle.',             4, 'aerial',   null, true, null),
  ('helicopter',            'Helicopter',              'Multi-rotation horizontal spin between hands.',                     5, 'aerial',   null, true, null),

  -- FLOW / COMBO MOVES
  ('helix',                 'Helix',                   'Double-rotation Y2 variant that corkscrews around the hand.',       4, 'flow',     null, true, null),
  ('ladder',                'Ladder',                  'Repeating up-and-down fan-rollover combo.',                         3, 'flow',     null, true, null),
  ('roller-coaster',        'Roller Coaster',          'Long flowing combo of rollovers across both hands.',                4, 'flow',     null, true, null),
  ('magic-drop',            'Magic Drop',              'Drop-catch trick that re-opens mid-fall.',                          5, 'flow',     null, true, null),
  ('atomic',                'Atomic',                  'Compound aerial with simultaneous fan and rotation.',               5, 'aerial',   null, true, null)
on conflict (slug) do nothing;
