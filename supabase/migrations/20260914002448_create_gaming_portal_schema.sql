/*
# Gaming Portal — Full Schema

## Overview
Creates the complete database schema for a dark-themed gaming portal for visual novels
and short story games. Supports public browsing, user accounts with favorites, an
exclusive admin role, game publishing with download links, ratings, and comments.

## Tables
1. site_settings — single row, site title and logo
2. games — title, synopsis, platform, cover, tags, download links
3. favorites — user-game pairs (owner-scoped)
4. ratings — 1-5 star scores (public read, owner-scoped write)
5. comments — user comments on games (public read, owner-scoped write)
6. subscribers — email list for notifications (anyone insert, admin read)

## Security
- is_admin() SECURITY DEFINER function checks raw_app_meta_data->>'role' = 'admin'
- site_settings: public read, admin write
- games: public read, admin write
- favorites/ratings/comments: owner-scoped via auth.uid()
- subscribers: anyone can insert, admin-only read
*/

-- ============================================================
-- IS_ADMIN helper function (SECURITY DEFINER) — created FIRST
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT raw_app_meta_data->>'role' = 'admin'
     FROM auth.users
     WHERE id = auth.uid()),
    false
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ============================================================
-- SITE SETTINGS (single row, id=1)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  title text NOT NULL DEFAULT 'VN Portal',
  logo_url text NOT NULL DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

INSERT INTO site_settings (id, title, logo_url)
VALUES (1, 'VN Portal', '')
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_site_settings" ON site_settings;
CREATE POLICY "public_read_site_settings"
  ON site_settings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_update_site_settings" ON site_settings;
CREATE POLICY "admin_update_site_settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- ============================================================
-- GAMES
-- ============================================================
CREATE TABLE IF NOT EXISTS games (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  synopsis text NOT NULL,
  platform text NOT NULL DEFAULT 'PC' CHECK (platform IN ('PC', 'Android', 'Both')),
  cover_url text NOT NULL,
  tags text[] NOT NULL DEFAULT '{}',
  download_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_by uuid,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE games ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_games" ON games;
CREATE POLICY "public_read_games"
  ON games FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "admin_insert_games" ON games;
CREATE POLICY "admin_insert_games"
  ON games FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_update_games" ON games;
CREATE POLICY "admin_update_games"
  ON games FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "admin_delete_games" ON games;
CREATE POLICY "admin_delete_games"
  ON games FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- ============================================================
-- FAVORITES (owner-scoped)
-- ============================================================
CREATE TABLE IF NOT EXISTS favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, game_id)
);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_favorites" ON favorites;
CREATE POLICY "select_own_favorites"
  ON favorites FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_favorites" ON favorites;
CREATE POLICY "insert_own_favorites"
  ON favorites FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_favorites" ON favorites;
CREATE POLICY "delete_own_favorites"
  ON favorites FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- RATINGS (public reads, owner-scoped writes)
-- ============================================================
CREATE TABLE IF NOT EXISTS ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  score integer NOT NULL CHECK (score >= 1 AND score <= 5),
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, game_id)
);

ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_ratings" ON ratings;
CREATE POLICY "public_read_ratings"
  ON ratings FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_ratings" ON ratings;
CREATE POLICY "insert_own_ratings"
  ON ratings FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_ratings" ON ratings;
CREATE POLICY "update_own_ratings"
  ON ratings FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_ratings" ON ratings;
CREATE POLICY "delete_own_ratings"
  ON ratings FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- COMMENTS (public reads, owner-scoped writes)
-- ============================================================
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  game_id uuid NOT NULL REFERENCES games(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_comments" ON comments;
CREATE POLICY "public_read_comments"
  ON comments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_comments" ON comments;
CREATE POLICY "insert_own_comments"
  ON comments FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_comments" ON comments;
CREATE POLICY "delete_own_comments"
  ON comments FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- SUBSCRIBERS (anyone insert, admin-only read)
-- ============================================================
CREATE TABLE IF NOT EXISTS subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE subscribers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone_insert_subscribers" ON subscribers;
CREATE POLICY "anyone_insert_subscribers"
  ON subscribers FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_subscribers" ON subscribers;
CREATE POLICY "admin_read_subscribers"
  ON subscribers FOR SELECT
  TO authenticated USING (public.is_admin());

-- ============================================================
-- INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_game_id ON favorites(game_id);
CREATE INDEX IF NOT EXISTS idx_ratings_game_id ON ratings(game_id);
CREATE INDEX IF NOT EXISTS idx_comments_game_id ON comments(game_id);
CREATE INDEX IF NOT EXISTS idx_games_tags ON games USING GIN(tags);

-- ============================================================
-- SEED DATA — Sample games
-- ============================================================
INSERT INTO games (title, synopsis, platform, cover_url, tags, download_links, created_by)
SELECT
  'Whispers of the Forgotten',
  'A psychological visual novel where you unravel the mysteries of an abandoned mansion. Every choice leads you deeper into the unknown.',
  'PC',
  'https://images.pexels.com/photos/15827314/pexels-photo-15827314.jpeg',
  ARRAY['Terror', 'Anime', 'Misterio'],
  '[{"server":"Mega","url":"https://mega.nz/file/example1"},{"server":"Google Drive","url":"https://drive.google.com/file/d/example1"}]'::jsonb,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM games LIMIT 1);

INSERT INTO games (title, synopsis, platform, cover_url, tags, download_links, created_by)
SELECT
  'Crimson Heart',
  'A romance visual novel set in a futuristic city where love and duty collide. Will you follow your heart or your mission?',
  'Both',
  'https://images.pexels.com/photos/3747139/pexels-photo-3747139.jpeg',
  ARRAY['Anime', 'Romance', 'Sci-Fi'],
  '[{"server":"Mega","url":"https://mega.nz/file/example2"},{"server":"MediaFire","url":"https://mediafire.com/file/example2"}]'::jsonb,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM games WHERE title = 'Crimson Heart');

INSERT INTO games (title, synopsis, platform, cover_url, tags, download_links, created_by)
SELECT
  'Shadow Realm Chronicles',
  'An epic 3D adventure visual novel with branching storylines. Explore dark realms and forge alliances in a war-torn world.',
  'PC',
  'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg',
  ARRAY['3D', 'Aventura', 'Fantasia'],
  '[{"server":"Mega","url":"https://mega.nz/file/example3"},{"server":"Google Drive","url":"https://drive.google.com/file/d/example3"},{"server":"MediaFire","url":"https://mediafire.com/file/example3"}]'::jsonb,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM games WHERE title = 'Shadow Realm Chronicles');

INSERT INTO games (title, synopsis, platform, cover_url, tags, download_links, created_by)
SELECT
  'Eternal Bond',
  'A slice-of-life visual novel about friendship, dreams, and the bonds that shape us. Multiple endings await.',
  'Android',
  'https://images.pexels.com/photos/11930323/pexels-photo-11930323.jpeg',
  ARRAY['Anime', 'Romance', 'Vida Cotidiana'],
  '[{"server":"Mega","url":"https://mega.nz/file/example4"},{"server":"MediaFire","url":"https://mediafire.com/file/example4"}]'::jsonb,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM games WHERE title = 'Eternal Bond');

INSERT INTO games (title, synopsis, platform, cover_url, tags, download_links, created_by)
SELECT
  'Nightfall Academy',
  'A mystery visual novel set in an elite academy where students disappear at night. Uncover the truth before it''s too late.',
  'Both',
  'https://images.pexels.com/photos/2588814/pexels-photo-2588814.jpeg',
  ARRAY['Anime', 'Misterio', 'Terror'],
  '[{"server":"Mega","url":"https://mega.nz/file/example5"},{"server":"Google Drive","url":"https://drive.google.com/file/d/example5"}]'::jsonb,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM games WHERE title = 'Nightfall Academy');

INSERT INTO games (title, synopsis, platform, cover_url, tags, download_links, created_by)
SELECT
  'Starlight Odyssey',
  'A sci-fi visual novel spanning galaxies. Command your ship, navigate diplomacy, and discover the secret of the starlight.',
  'PC',
  'https://images.pexels.com/photos/2693208/pexels-photo-2693208.jpeg',
  ARRAY['Sci-Fi', 'Aventura', '3D'],
  '[{"server":"Mega","url":"https://mega.nz/file/example6"},{"server":"Google Drive","url":"https://drive.google.com/file/d/example6"},{"server":"MediaFire","url":"https://mediafire.com/file/example6"}]'::jsonb,
  NULL
WHERE NOT EXISTS (SELECT 1 FROM games WHERE title = 'Starlight Odyssey');
