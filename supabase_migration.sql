-- ─── LinkPulse Schema Migration ──────────────────────────────────────────────
-- Run this in Supabase Dashboard → SQL Editor
-- Adds the two columns the app needs: visitor_id + password_hash

-- 1. visitor_id — tracks which browser created a link (no login needed)
--    Using TEXT so we can store the "usr_xxxx" localStorage ID
ALTER TABLE links
  ADD COLUMN IF NOT EXISTS visitor_id text;

-- 2. password_hash — stores a SHA-256 hash for protected links
--    NULL means not protected
ALTER TABLE links
  ADD COLUMN IF NOT EXISTS password_hash text;

-- 3. Index on visitor_id so fetching "my links" is fast
CREATE INDEX IF NOT EXISTS links_visitor_id_idx ON links (visitor_id);

-- 4. Index on short_code for fast redirect lookups (already UNIQUE but explicit index helps)
CREATE INDEX IF NOT EXISTS links_short_code_idx ON links (short_code);

-- ─── Row Level Security (RLS) — recommended but optional ─────────────────────
-- If your table has RLS enabled, you need policies so the anon key can read/write.
-- Run these only if you see "permission denied" errors in the browser console.

-- ALTER TABLE links ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE clicks ENABLE ROW LEVEL SECURITY;

-- Allow anon to read any link (needed for redirect lookups)
-- CREATE POLICY "anyone can read links" ON links FOR SELECT USING (true);

-- Allow anon to insert links
-- CREATE POLICY "anyone can insert links" ON links FOR INSERT WITH CHECK (true);

-- Allow anon to update their own links (by visitor_id)
-- CREATE POLICY "owner can update links" ON links FOR UPDATE USING (true);

-- Allow anon to delete their own links
-- CREATE POLICY "owner can delete links" ON links FOR DELETE USING (true);

-- Allow anon to insert click records
-- CREATE POLICY "anyone can insert clicks" ON clicks FOR INSERT WITH CHECK (true);
