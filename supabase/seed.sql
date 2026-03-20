insert into public.games (name, slug) values
  ('Valorant', 'valorant'),
  ('League of Legends', 'league-of-legends'),
  ('Genshin Impact', 'genshin-impact'),
  ('PUBG', 'pubg'),
  ('Minecraft', 'minecraft'),
  ('Overwatch 2', 'overwatch-2'),
  ('Apex Legends', 'apex-legends'),
  ('CS2', 'cs2')
on conflict (slug) do nothing;
