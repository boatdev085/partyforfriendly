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

-- Dev / test users for local development (matches DevUserSwitcher.tsx)
insert into public.users (id, discord_id, username, display_name) values
  ('6141de95-a2b7-4675-914e-92cdbd734296', 'dev_user_1',   'devuser1',   'Dev User 1 🎮'),
  ('aaaaaaaa-0000-0000-0000-000000000001', 'test_user_2',  'testuser2',  'Test User 2 🕹️'),
  ('aaaaaaaa-0000-0000-0000-000000000002', 'test_user_3',  'testuser3',  'Test User 3 🎯'),
  ('aaaaaaaa-0000-0000-0000-000000000003', 'test_user_4',  'testuser4',  'Test User 4 🏆')
on conflict (id) do nothing;
