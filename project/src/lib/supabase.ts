import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  category: string;
  summary: string | null;
  is_pinned: boolean;
  word_count: number;
  created_at: string;
  updated_at: string;
}

export type NoteInput = Omit<Note, 'id' | 'created_at' | 'updated_at' | 'word_count'>;

export const CATEGORIES = [
  'General',
  'Frontend',
  'Backend',
  'DevOps',
  'Database',
  'Machine Learning',
  'Security',
  'Algorithms',
  'Systems',
  'Mobile',
] as const;

export interface ChatConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export interface FlashcardDeck {
  id: string;
  name: string;
  description: string | null;
  category: string;
  created_at: string;
  updated_at: string;
}

export interface Flashcard {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
}
