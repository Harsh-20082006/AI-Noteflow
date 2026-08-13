/*
# Create chat and flashcard tables (single-tenant, no auth)

1. New Tables
- `chat_conversations`
  - `id` (uuid, primary key)
  - `title` (text, not null — derived from first message)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz, auto-updated via trigger)

- `chat_messages`
  - `id` (uuid, primary key)
  - `conversation_id` (uuid, FK to chat_conversations, ON DELETE CASCADE)
  - `role` (text, 'user' or 'assistant')
  - `content` (text, not null)
  - `created_at` (timestamptz)

- `flashcard_decks`
  - `id` (uuid, primary key)
  - `name` (text, not null)
  - `description` (text, nullable)
  - `category` (text, defaults to 'General')
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz, auto-updated via trigger)

- `flashcards`
  - `id` (uuid, primary key)
  - `deck_id` (uuid, FK to flashcard_decks, ON DELETE CASCADE)
  - `front` (text, not null — question/prompt)
  - `back` (text, not null — answer/definition)
  - `difficulty` (text, 'easy' | 'medium' | 'hard', defaults to 'medium')
  - `created_at` (timestamptz)

2. Indexes
- `chat_messages_conversation_id` for message lookup by conversation
- `flashcards_deck_id` for card lookup by deck
- `chat_conversations_updated` for sorting recent conversations
- `flashcard_decks_updated` for sorting recent decks

3. Security
- Enable RLS on all tables.
- Allow anon + authenticated CRUD (single-tenant app, no sign-in).
- `USING (true)` is intentional and documented — data is shared/public.

4. Notes
- `updated_at` triggers on chat_conversations and flashcard_decks.
- Cascade deletes: deleting a conversation removes its messages; deleting a deck removes its cards.
*/

CREATE TABLE IF NOT EXISTS chat_conversations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL DEFAULT 'New Conversation',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS flashcard_decks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'General',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deck_id uuid NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
  front text NOT NULL,
  back text NOT NULL,
  difficulty text NOT NULL DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcard_decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

-- chat_conversations policies
DROP POLICY IF EXISTS "anon_select_chat_conv" ON chat_conversations;
CREATE POLICY "anon_select_chat_conv" ON chat_conversations FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_chat_conv" ON chat_conversations;
CREATE POLICY "anon_insert_chat_conv" ON chat_conversations FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_chat_conv" ON chat_conversations;
CREATE POLICY "anon_update_chat_conv" ON chat_conversations FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_chat_conv" ON chat_conversations;
CREATE POLICY "anon_delete_chat_conv" ON chat_conversations FOR DELETE
  TO anon, authenticated USING (true);

-- chat_messages policies
DROP POLICY IF EXISTS "anon_select_chat_msg" ON chat_messages;
CREATE POLICY "anon_select_chat_msg" ON chat_messages FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_chat_msg" ON chat_messages;
CREATE POLICY "anon_insert_chat_msg" ON chat_messages FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_chat_msg" ON chat_messages;
CREATE POLICY "anon_delete_chat_msg" ON chat_messages FOR DELETE
  TO anon, authenticated USING (true);

-- flashcard_decks policies
DROP POLICY IF EXISTS "anon_select_decks" ON flashcard_decks;
CREATE POLICY "anon_select_decks" ON flashcard_decks FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_decks" ON flashcard_decks;
CREATE POLICY "anon_insert_decks" ON flashcard_decks FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_update_decks" ON flashcard_decks;
CREATE POLICY "anon_update_decks" ON flashcard_decks FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_decks" ON flashcard_decks;
CREATE POLICY "anon_delete_decks" ON flashcard_decks FOR DELETE
  TO anon, authenticated USING (true);

-- flashcards policies
DROP POLICY IF EXISTS "anon_select_cards" ON flashcards;
CREATE POLICY "anon_select_cards" ON flashcards FOR SELECT
  TO anon, authenticated USING (true);
DROP POLICY IF EXISTS "anon_insert_cards" ON flashcards;
CREATE POLICY "anon_insert_cards" ON flashcards FOR INSERT
  TO anon, authenticated WITH CHECK (true);
DROP POLICY IF EXISTS "anon_delete_cards" ON flashcards;
CREATE POLICY "anon_delete_cards" ON flashcards FOR DELETE
  TO anon, authenticated USING (true);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_updated ON chat_conversations (updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_flashcards_deck ON flashcards (deck_id);
CREATE INDEX IF NOT EXISTS idx_flashcard_decks_updated ON flashcard_decks (updated_at DESC);

-- updated_at trigger for chat_conversations
CREATE OR REPLACE FUNCTION update_chat_conv_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_chat_conv_updated ON chat_conversations;
CREATE TRIGGER trg_chat_conv_updated
  BEFORE UPDATE ON chat_conversations
  FOR EACH ROW
  EXECUTE FUNCTION update_chat_conv_updated_at();

-- updated_at trigger for flashcard_decks
CREATE OR REPLACE FUNCTION update_deck_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_deck_updated ON flashcard_decks;
CREATE TRIGGER trg_deck_updated
  BEFORE UPDATE ON flashcard_decks
  FOR EACH ROW
  EXECUTE FUNCTION update_deck_updated_at();