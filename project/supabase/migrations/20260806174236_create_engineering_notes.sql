/*
# Create engineering_notes table (single-tenant, no auth)

1. New Tables
- `engineering_notes`
  - `id` (uuid, primary key)
  - `title` (text, not null)
  - `content` (text, markdown body, not null, defaults to empty string)
  - `tags` (text[], engineering tags, defaults to empty array)
  - `category` (text, engineering discipline, defaults to 'General')
  - `summary` (text, AI-generated summary, nullable)
  - `is_pinned` (boolean, pinned/favorite flag, defaults to false)
  - `word_count` (integer, cached word count, defaults to 0)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz, auto-updated on change)
2. Indexes
- GIN index on `tags` for fast tag filtering
- B-tree index on `category` for category filtering
- B-tree index on `is_pinned` for pinned sorting
- B-tree index on `updated_at` for recent sorting
- B-tree index on `created_at`
3. Security
- Enable RLS on `engineering_notes`.
- Allow anon + authenticated CRUD because the data is intentionally shared/public (single-tenant app, no sign-in).
4. Notes
- This is a single-tenant app with no sign-in screen, so `USING (true)` is intentional and documented here.
- `updated_at` auto-updates via trigger on every row change.
*/

CREATE TABLE IF NOT EXISTS engineering_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL DEFAULT '',
  tags text[] NOT NULL DEFAULT '{}',
  category text NOT NULL DEFAULT 'General',
  summary text,
  is_pinned boolean NOT NULL DEFAULT false,
  word_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE engineering_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_notes" ON engineering_notes;
CREATE POLICY "anon_select_notes" ON engineering_notes FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_notes" ON engineering_notes;
CREATE POLICY "anon_insert_notes" ON engineering_notes FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_notes" ON engineering_notes;
CREATE POLICY "anon_update_notes" ON engineering_notes FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_notes" ON engineering_notes;
CREATE POLICY "anon_delete_notes" ON engineering_notes FOR DELETE
  TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_engineering_notes_tags ON engineering_notes USING GIN (tags);
CREATE INDEX IF NOT EXISTS idx_engineering_notes_category ON engineering_notes (category);
CREATE INDEX IF NOT EXISTS idx_engineering_notes_pinned ON engineering_notes (is_pinned);
CREATE INDEX IF NOT EXISTS idx_engineering_notes_updated ON engineering_notes (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_engineering_notes_created ON engineering_notes (created_at DESC);

-- Auto-update updated_at on row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  NEW.word_count = array_length(string_to_array(trim(NEW.content), ' '), 1) OR 0;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_notes_updated_at ON engineering_notes;
CREATE TRIGGER trg_notes_updated_at
  BEFORE UPDATE ON engineering_notes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();