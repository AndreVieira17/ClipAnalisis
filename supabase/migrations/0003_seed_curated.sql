-- ============================================================================
-- Seed curated tables. Replace/extend with real, current data per niche.
-- These are starting points so the engine always has real rows to recommend.
-- ============================================================================

insert into public.trending_audios (niche, platform, title, artist, url, active) values
  ('humor',     'tiktok', 'Oh No (sped up)',            'Kreepa',        'https://www.tiktok.com/music/Oh-No-6712362814280124417', true),
  ('humor',     'reels',  'Funny Meme Beat',            'Various',       'https://www.instagram.com/reels/audio/',                 true),
  ('gameplay',  'shorts', 'Phonk Drift Beat',           'Phonk',         'https://www.youtube.com/results?search_query=phonk+drift', true),
  ('gameplay',  'tiktok', 'Sigma Rule Phonk',           'Phonk',         'https://www.tiktok.com/music/',                          true),
  ('reacao',    'tiktok', 'Suspense Riser',             'SFX',           'https://www.tiktok.com/music/',                          true),
  ('podcast',   'reels',  'Lo-fi Talk Bed',             'Lofi',          'https://www.instagram.com/reels/audio/',                 true),
  ('lifestyle', 'reels',  'Aesthetic Vibe',             'Various',       'https://www.instagram.com/reels/audio/',                 true),
  ('futebol',   'tiktok', 'Estadio Hype Beat',          'Various',       'https://www.tiktok.com/music/',                          true)
on conflict do nothing;

insert into public.resources (topic, kind, title, url, niche, active) values
  ('legenda',  'tutorial', 'Legendas estilo CapCut palavra-a-palavra', 'https://www.capcut.com/', 'humor',     true),
  ('legenda',  'fonte',    'Fontes bold pra legenda (Montserrat/Anton)', 'https://fonts.google.com/', null,    true),
  ('headline', 'tutorial', 'Hook nos 3 primeiros segundos',            'https://www.youtube.com/results?search_query=hook+3+segundos', null, true),
  ('ritmo',    'tutorial', 'Cortes no ritmo da música (beat sync)',    'https://www.youtube.com/results?search_query=beat+sync+edit',  'gameplay', true),
  ('efeitos',  'template', 'Pack de transições/zoom punch',            'https://www.capcut.com/', 'reacao',    true),
  ('audio',    'tutorial', 'Como achar áudio em trend',                'https://www.tiktok.com/', null,        true),
  ('final',    'tutorial', 'Finais em loop que seguram replay',        'https://www.youtube.com/results?search_query=loop+ending+short', null, true)
on conflict do nothing;
