import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Search, Plus, Pin, PinOff, Trash2, Tag, Folder, Sparkles, FileText,
  Clock, Hash, TrendingUp, Sun, Moon, Menu, X, Lightbulb, Link2,
  BookOpen, PenLine, Eye, Check, ChevronRight, BarChart3, Zap,
  MessageSquare, GraduationCap, Layers, Code2, Languages,
  Flame, Target, CheckSquare,
} from 'lucide-react';
import { supabase, type Note, CATEGORIES } from '@/lib/supabase';
import {
  generateSummary, suggestTags, predictCategory, findRelatedNotes,
  readingTime, translateNoteContent, TRANSLATION_LANGUAGES, type TranslationLang,
} from '@/lib/ai';
import { Markdown } from '@/components/Markdown';
import { SummaryPage } from '@/pages/SummaryPage';
import { ChatPage } from '@/pages/ChatPage';
import { QuizPage } from '@/pages/QuizPage';
import { FlashcardsPage } from '@/pages/FlashcardsPage';
import { StorePage } from '@/pages/StorePage';
import { CodeExplainerPage } from '@/pages/CodeExplainerPage';

type View = 'dashboard' | 'notes' | 'editor' | 'summary' | 'chat' | 'quiz' | 'flashcards' | 'store' | 'explainer';
type SortMode = 'updated' | 'created' | 'title';

export default function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>('dashboard');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>('updated');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'edit' | 'preview' | 'split'>('split');
  const [aiSuggestedTags, setAiSuggestedTags] = useState<string[]>([]);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiCategory, setAiCategory] = useState<string | null>(null);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [relatedIds, setRelatedIds] = useState<string[]>([]);

  // Load notes
  const loadNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase
      .from('engineering_notes')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) {
      setError('Could not load notes. Please try again.');
    } else {
      setNotes(data as Note[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  // Dark mode toggle
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Compute related notes when a note is selected
  useEffect(() => {
    if (selectedNote) {
      const related = findRelatedNotes(
        { id: selectedNote.id, tags: selectedNote.tags, content: selectedNote.content },
        notes.map((n) => ({ id: n.id, tags: n.tags, content: n.content }))
      );
      setRelatedIds(related.map((r: { id: string; score: number }) => r.id));
    } else {
      setRelatedIds([]);
    }
  }, [selectedNote, notes]);

  // Filtered + sorted notes for sidebar list
  const filteredNotes = useMemo(() => {
    let result = [...notes];
    if (activeCategory) {
      result = result.filter((n) => n.category === activeCategory);
    }
    if (activeTag) {
      result = result.filter((n) => n.tags.includes(activeTag));
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.content.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q)) ||
          (n.summary?.toLowerCase().includes(q) ?? false)
      );
    }
    // Sort: pinned first, then by sort mode
    result.sort((a, b) => {
      if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
      switch (sortMode) {
        case 'created':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
      }
    });
    return result;
  }, [notes, activeCategory, activeTag, searchQuery, sortMode]);

  // Stats for dashboard
  const stats = useMemo(() => {
    const totalWords = notes.reduce((sum, n) => sum + n.word_count, 0);
    const categoryCount = new Set(notes.map((n) => n.category)).size;
    const tagCount = new Set(notes.flatMap((n) => n.tags)).size;
    const pinnedCount = notes.filter((n) => n.is_pinned).length;
    return { total: notes.length, totalWords, categoryCount, tagCount, pinnedCount };
  }, [notes]);

  // All tags with frequency
  const allTags = useMemo(() => {
    const freq = new Map<string, number>();
    notes.forEach((n) => n.tags.forEach((t) => freq.set(t, (freq.get(t) || 0) + 1)));
    return Array.from(freq.entries()).sort((a, b) => b[1] - a[1]);
  }, [notes]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    notes.forEach((n) => {
      counts[n.category] = (counts[n.category] || 0) + 1;
    });
    return counts;
  }, [notes]);

  const handleNewNote = () => {
    const newNote: Note = {
      id: '',
      title: 'Untitled Note',
      content: '',
      tags: [],
      category: 'General',
      summary: null,
      is_pinned: false,
      word_count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    setSelectedNote(newNote);
    setView('editor');
    setAiSuggestedTags([]);
    setAiSummary(null);
    setAiCategory(null);
    setSidebarOpen(false);
  };

  const handleSelectNote = (note: Note) => {
    setSelectedNote(note);
    setView('editor');
    setAiSuggestedTags([]);
    setAiSummary(note.summary);
    setAiCategory(null);
    setSidebarOpen(false);
  };

  const handleSaveNote = async (note: Note) => {
    setError(null);
    const wordCount = note.content.trim() ? note.content.trim().split(/\s+/).length : 0;
    const payload = {
      title: note.title,
      content: note.content,
      tags: note.tags,
      category: note.category,
      summary: note.summary,
      is_pinned: note.is_pinned,
      word_count: wordCount,
    };

    if (note.id) {
      const { data, error } = await supabase
        .from('engineering_notes')
        .update(payload)
        .eq('id', note.id)
        .select()
        .single();
      if (error) {
        setError('Could not save changes.');
        return;
      }
      const updated = data as Note;
      setSelectedNote(updated);
      setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    } else {
      const { data, error } = await supabase
        .from('engineering_notes')
        .insert(payload)
        .select()
        .single();
      if (error) {
        setError('Could not create note.');
        return;
      }
      const created = data as Note;
      setSelectedNote(created);
      setNotes((prev) => [created, ...prev]);
    }
  };

  const handleDeleteNote = async (id: string) => {
    const { error } = await supabase.from('engineering_notes').delete().eq('id', id);
    if (error) {
      setError('Could not delete note.');
      return;
    }
    setNotes((prev) => prev.filter((n) => n.id !== id));
    if (selectedNote?.id === id) {
      setSelectedNote(null);
      setView('notes');
    }
  };

  const handleTogglePin = async (id: string) => {
    const note = notes.find((n) => n.id === id);
    if (!note) return;
    const { error } = await supabase
      .from('engineering_notes')
      .update({ is_pinned: !note.is_pinned })
      .eq('id', id);
    if (error) {
      setError('Could not update pin status.');
      return;
    }
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_pinned: !n.is_pinned } : n))
    );
    if (selectedNote?.id === id) {
      setSelectedNote({ ...selectedNote, is_pinned: !note.is_pinned });
    }
  };

  const runAIAnalysis = (content: string, currentTags: string[], currentCategory: string) => {
    setGeneratingAI(true);
    // Simulate AI processing with a brief delay for UX feedback
    setTimeout(() => {
      const summary = generateSummary(content);
      const tags = suggestTags(content, currentTags);
      const category = predictCategory(content, currentCategory);
      setAiSummary(summary);
      setAiSuggestedTags(tags);
      setAiCategory(category);
      setGeneratingAI(false);
    }, 600);
  };

  const applyAISummary = async () => {
    if (!selectedNote || !aiSummary) return;
    const updated = { ...selectedNote, summary: aiSummary };
    setSelectedNote(updated);
    await handleSaveNote(updated);
  };

  const applyAITag = async (tag: string) => {
    if (!selectedNote || selectedNote.tags.includes(tag)) return;
    const updated = { ...selectedNote, tags: [...selectedNote.tags, tag] };
    setSelectedNote(updated);
    setAiSuggestedTags((prev) => prev.filter((t) => t !== tag));
    await handleSaveNote(updated);
  };

  const applyAICategory = async () => {
    if (!selectedNote || !aiCategory) return;
    const updated = { ...selectedNote, category: aiCategory };
    setSelectedNote(updated);
    setAiCategory(null);
    await handleSaveNote(updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar
        notes={notes}
        view={view}
        activeCategory={activeCategory}
        activeTag={activeTag}
        searchQuery={searchQuery}
        categoryCounts={categoryCounts}
        allTags={allTags}
        sidebarOpen={sidebarOpen}
        onNewNote={handleNewNote}
        onNavigate={(v) => {
          setView(v);
          setSidebarOpen(false);
          if (v !== 'editor') setSelectedNote(null);
        }}
        onSearch={setSearchQuery}
        onCategoryClick={(cat) => {
          setActiveCategory(activeCategory === cat ? null : cat);
          setActiveTag(null);
          setView('notes');
        }}
        onTagClick={(tag) => {
          setActiveTag(activeTag === tag ? null : tag);
          setActiveCategory(null);
          setView('notes');
        }}
        onClearFilters={() => {
          setActiveCategory(null);
          setActiveTag(null);
          setSearchQuery('');
        }}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 lg:ml-72">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3 flex items-center gap-3">
          <button
            className="lg:hidden p-2 -ml-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
          </button>

          {view === 'editor' && selectedNote ? (
            <EditorToolbar
              note={selectedNote}
              editorMode={editorMode}
              onChangeMode={setEditorMode}
              onSave={() => handleSaveNote(selectedNote)}
              onTogglePin={() => handleTogglePin(selectedNote.id)}
              onDelete={() => handleDeleteNote(selectedNote.id)}
            />
          ) : (
            <div className="flex-1 flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                    EngNotes
                  </h1>
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-1 text-xs text-slate-400 dark:text-slate-500 ml-2">
                <ChevronRight className="w-3 h-3" />
                <span className="capitalize">{view}</span>
                {(activeCategory || activeTag) && (
                  <>
                    <ChevronRight className="w-3 h-3" />
                    <span className="text-primary-600 dark:text-primary-400 font-medium">
                      {activeCategory || `#${activeTag}`}
                    </span>
                  </>
                )}
              </div>
            </div>
          )}

          <button
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle theme"
          >
            {darkMode ? (
              <Sun className="w-5 h-5 text-slate-300" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-hidden">
          {error && (
            <div className="mx-4 sm:mx-6 mt-4 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg text-error-600 dark:text-error-400 text-sm flex items-center gap-2">
              <X className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {loading ? (
            <LoadingState />
          ) : view === 'dashboard' ? (
            <Dashboard
              stats={stats}
              notes={notes}
              categoryCounts={categoryCounts}
              allTags={allTags}
              onNewNote={handleNewNote}
              onSelectNote={handleSelectNote}
              onNavigate={setView}
            />
          ) : view === 'notes' ? (
            <NoteListView
              notes={filteredNotes}
              sortMode={sortMode}
              onSortChange={setSortMode}
              onSelectNote={handleSelectNote}
              onTogglePin={handleTogglePin}
              onDeleteNote={handleDeleteNote}
              onNewNote={handleNewNote}
              activeCategory={activeCategory}
              activeTag={activeTag}
              onClearFilters={() => {
                setActiveCategory(null);
                setActiveTag(null);
              }}
              searchQuery={searchQuery}
            />
          ) : view === 'editor' && selectedNote ? (
            <EditorView
              note={selectedNote}
              editorMode={editorMode}
              onChange={(updated) => setSelectedNote(updated)}
              onSave={() => handleSaveNote(selectedNote)}
              aiSummary={aiSummary}
              aiSuggestedTags={aiSuggestedTags}
              aiCategory={aiCategory}
              generatingAI={generatingAI}
              onRunAI={() =>
                runAIAnalysis(selectedNote.content, selectedNote.tags, selectedNote.category)
              }
              onApplySummary={applyAISummary}
              onApplyTag={applyAITag}
              onApplyCategory={applyAICategory}
              relatedNotes={notes.filter((n) => relatedIds.includes(n.id))}
              onSelectRelated={handleSelectNote}
            />
          ) : view === 'summary' ? (
            <SummaryPage />
          ) : view === 'chat' ? (
            <ChatPage />
          ) : view === 'quiz' ? (
            <QuizPage />
          ) : view === 'flashcards' ? (
            <FlashcardsPage />
          ) : view === 'store' ? (
            <StorePage onImported={(importedNote) => {
              setNotes((prev) => [importedNote, ...prev]);
            }} />
          ) : view === 'explainer' ? (
            <CodeExplainerPage onSavedNote={(savedNote) => {
              setNotes((prev) => [savedNote, ...prev]);
            }} />
          ) : (
            <EmptyState onNewNote={handleNewNote} />
          )}
        </main>
      </div>
    </div>
  );
}

/* ---------- Sidebar ---------- */

interface SidebarProps {
  notes: Note[];
  view: View;
  activeCategory: string | null;
  activeTag: string | null;
  searchQuery: string;
  categoryCounts: Record<string, number>;
  allTags: [string, number][];
  sidebarOpen: boolean;
  onNewNote: () => void;
  onNavigate: (view: View) => void;
  onSearch: (q: string) => void;
  onCategoryClick: (cat: string) => void;
  onTagClick: (tag: string) => void;
  onClearFilters: () => void;
}

function Sidebar({
  notes, view, activeCategory, activeTag, searchQuery,
  categoryCounts, allTags, sidebarOpen, onNewNote, onNavigate,
  onSearch, onCategoryClick, onTagClick, onClearFilters,
}: SidebarProps) {
  return (
    <aside
      className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-40 flex flex-col transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      {/* Logo */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
              EngNotes
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              AI Engineering Notes
            </p>
          </div>
        </div>
      </div>

      {/* New Note button */}
      <div className="px-4 pt-4">
        <button
          onClick={onNewNote}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-medium text-sm rounded-xl shadow-md shadow-primary-500/20 transition-all hover:shadow-lg hover:shadow-primary-500/30"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>

      {/* Search */}
      <div className="px-4 pt-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search notes..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-lg border-0 ring-1 ring-slate-200 dark:ring-slate-700 focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="px-3 pt-4 space-y-0.5">
        <NavSection label="Workspace" />
        <NavItem
          icon={<BarChart3 className="w-4 h-4" />}
          label="Dashboard"
          active={view === 'dashboard'}
          onClick={() => onNavigate('dashboard')}
        />
        <NavItem
          icon={<FileText className="w-4 h-4" />}
          label="All Notes"
          badge={notes.length}
          active={view === 'notes' && !activeCategory && !activeTag}
          onClick={() => onNavigate('notes')}
        />
        <NavSection label="AI Tools" />
        <NavItem
          icon={<Sparkles className="w-4 h-4" />}
          label="AI Summary"
          active={view === 'summary'}
          onClick={() => onNavigate('summary')}
        />
        <NavItem
          icon={<MessageSquare className="w-4 h-4" />}
          label="AI Chat"
          active={view === 'chat'}
          onClick={() => onNavigate('chat')}
        />
        <NavItem
          icon={<GraduationCap className="w-4 h-4" />}
          label="AI Quiz"
          active={view === 'quiz'}
          onClick={() => onNavigate('quiz')}
        />
        <NavItem
          icon={<Layers className="w-4 h-4" />}
          label="Flashcards"
          active={view === 'flashcards'}
          onClick={() => onNavigate('flashcards')}
        />
        <NavItem
          icon={<BookOpen className="w-4 h-4" />}
          label="Notes Store"
          active={view === 'store'}
          onClick={() => onNavigate('store')}
        />
        <NavItem
          icon={<Code2 className="w-4 h-4" />}
          label="Code Explainer"
          active={view === 'explainer'}
          onClick={() => onNavigate('explainer')}
        />
      </nav>

      {/* Categories */}
      <div className="px-3 pt-5 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between px-2 mb-1.5">
          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Categories
          </span>
        </div>
        <div className="space-y-0.5">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => onCategoryClick(cat)}
              className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 text-sm rounded-lg transition-colors ${
                activeCategory === cat
                  ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Folder className={`w-4 h-4 ${activeCategory === cat ? 'text-primary-500' : 'text-slate-400'}`} />
              <span className="flex-1 text-left truncate">{cat}</span>
              {categoryCounts[cat] > 0 && (
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {categoryCounts[cat]}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tags */}
        {allTags.length > 0 && (
          <div className="pt-5">
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1.5 block">
              Tags
            </span>
            <div className="flex flex-wrap gap-1.5 px-2">
              {allTags.slice(0, 15).map(([tag, count]) => (
                <button
                  key={tag}
                  onClick={() => onTagClick(tag)}
                  className={`flex items-center gap-1 px-2 py-0.5 text-xs rounded-md transition-colors ${
                    activeTag === tag
                      ? 'bg-primary-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <Hash className="w-2.5 h-2.5" />
                  {tag}
                  <span className="opacity-60">{count}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800">
        <button
          onClick={onClearFilters}
          className="text-xs text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
        >
          Clear all filters
        </button>
      </div>
    </aside>
  );
}

function NavSection({ label }: { label: string }) {
  return (
    <div className="px-2.5 pt-4 pb-1 first:pt-2">
      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
        {label}
      </span>
    </div>
  );
}

function NavItem({
  icon, label, active, badge, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  badge?: number;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2.5 py-2 text-sm rounded-lg transition-colors ${
        active
          ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 font-medium'
          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      {icon}
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="text-xs text-slate-400 dark:text-slate-500">{badge}</span>
      )}
    </button>
  );
}

/* ---------- Editor Toolbar ---------- */

function EditorToolbar({
  note, editorMode, onChangeMode, onSave, onTogglePin, onDelete,
}: {
  note: Note;
  editorMode: 'edit' | 'preview' | 'split';
  onChangeMode: (m: 'edit' | 'preview' | 'split') => void;
  onSave: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}) {
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave();
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <div className="flex-1 flex items-center gap-1 sm:gap-2">
      <input
        type="text"
        value={note.title}
        onChange={(e) => {
          // Title editing handled in editor view, but we allow quick rename here
        }}
        className="hidden sm:block flex-1 min-w-0 text-sm font-medium text-slate-900 dark:text-white bg-transparent border-0 focus:outline-none truncate"
        readOnly
      />

      {/* Editor mode toggle */}
      <div className="hidden sm:flex items-center gap-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
        <ModeButton icon={<PenLine className="w-3.5 h-3.5" />} label="Edit" active={editorMode === 'edit'} onClick={() => onChangeMode('edit')} />
        <ModeButton icon={<Eye className="w-3.5 h-3.5" />} label="Split" active={editorMode === 'split'} onClick={() => onChangeMode('split')} />
        <ModeButton icon={<BookOpen className="w-3.5 h-3.5" />} label="Preview" active={editorMode === 'preview'} onClick={() => onChangeMode('preview')} />
      </div>

      <button
        onClick={onTogglePin}
        className={`p-2 rounded-lg transition-colors ${
          note.is_pinned
            ? 'text-warning-500 bg-warning-50 dark:bg-warning-900/20'
            : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title={note.is_pinned ? 'Unpin' : 'Pin'}
      >
        <Pin className="w-4 h-4" fill={note.is_pinned ? 'currentColor' : 'none'} />
      </button>

      <button
        onClick={onDelete}
        className="p-2 rounded-lg text-slate-500 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 transition-colors"
        title="Delete"
      >
        <Trash2 className="w-4 h-4" />
      </button>

      <button
        onClick={handleSave}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
      >
        {saved ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5 rotate-45" />}
        <span className="hidden sm:inline">{saved ? 'Saved' : 'Save'}</span>
      </button>
    </div>
  );
}

function ModeButton({
  icon, label, active, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1 px-2 py-1 text-xs rounded-md transition-colors ${
        active
          ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
          : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
      }`}
    >
      {icon}
      <span className="hidden md:inline">{label}</span>
    </button>
  );
}

/* ---------- Dashboard ---------- */

function Dashboard({
  stats, notes, categoryCounts, allTags, onNewNote, onSelectNote, onNavigate,
}: {
  stats: { total: number; totalWords: number; categoryCount: number; tagCount: number; pinnedCount: number };
  notes: Note[];
  categoryCounts: Record<string, number>;
  allTags: [string, number][];
  onNewNote: () => void;
  onSelectNote: (n: Note) => void;
  onNavigate: (v: View) => void;
}) {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good Morning' : hour < 17 ? 'Good Afternoon' : 'Good Evening';

  const recentNotes = [...notes]
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    .slice(0, 3);

  const planItems = notes.filter((n) => n.is_pinned).slice(0, 4);

  const weakTopics = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => a - b)
    .slice(0, 3);

  const aiTools: { icon: React.ReactNode; label: string; desc: string; view: View; gradient: string }[] = [
    { icon: <Sparkles className="w-5 h-5" />, label: 'AI Summary', desc: 'Condense notes', view: 'summary', gradient: 'from-blue-500 to-blue-600' },
    { icon: <MessageSquare className="w-5 h-5" />, label: 'AI Chat', desc: 'Ask questions', view: 'chat', gradient: 'from-emerald-500 to-emerald-600' },
    { icon: <GraduationCap className="w-5 h-5" />, label: 'AI Quiz', desc: 'Test yourself', view: 'quiz', gradient: 'from-amber-500 to-amber-600' },
    { icon: <Code2 className="w-5 h-5" />, label: 'Code Explainer', desc: 'Understand code', view: 'explainer', gradient: 'from-rose-500 to-rose-600' },
    { icon: <Layers className="w-5 h-5" />, label: 'Flashcards', desc: 'Spaced review', view: 'flashcards', gradient: 'from-cyan-500 to-cyan-600' },
    { icon: <BookOpen className="w-5 h-5" />, label: 'Notes Store', desc: 'Browse library', view: 'store', gradient: 'from-teal-500 to-teal-600' },
  ];

  const maxCount = Math.max(...Object.values(categoryCounts), 1);
  const categoryEntries = Object.entries(categoryCounts).sort(([, a], [, b]) => b - a).slice(0, 5);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto animate-fade-in overflow-y-auto h-full">
      {/* Greeting */}
      <div className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
          {greeting}! 👋
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
          Ready to learn? You have {stats.total} notes across {stats.categoryCount} subjects.
        </p>
      </div>

      {/* Quick stat pills */}
      <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
        <QuickPill icon={<FileText className="w-4 h-4" />} label="Notes" value={stats.total} active />
        <QuickPill icon={<MessageSquare className="w-4 h-4" />} label="AI Chats" value={0} />
        <QuickPill icon={<GraduationCap className="w-4 h-4" />} label="Quizzes" value={0} />
        <QuickPill icon={<Flame className="w-4 h-4" />} label="Streak" value={1} />
      </div>

      {/* Continue Learning */}
      {recentNotes.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-slate-400" />
              Continue Learning
            </h2>
            <button onClick={() => onNavigate('notes')} className="text-sm text-primary-600 dark:text-primary-400 hover:underline">
              View all
            </button>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {recentNotes.map((note) => (
              <button
                key={note.id}
                onClick={() => onSelectNote(note)}
                className="group text-left p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center mb-3 shadow-sm shadow-primary-500/20">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                  {note.title}
                </h3>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 line-clamp-2">
                  {note.summary || note.content.slice(0, 80)}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded">
                    {note.category}
                  </span>
                  <span className="text-[10px] text-slate-400">{readingTime(note.word_count)} min</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* AI Tools */}
      <div className="mb-6">
        <h2 className="text-base font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <Zap className="w-4 h-4 text-accent-500" />
          AI Tools
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {aiTools.map((tool) => (
            <button
              key={tool.label}
              onClick={() => onNavigate(tool.view)}
              className="group flex items-start gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all text-left"
            >
              <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${tool.gradient} flex items-center justify-center shrink-0 shadow-sm`}>
                {tool.icon}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{tool.label}</p>
                <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{tool.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Today's Plan + AI Recommendation */}
      <div className="grid sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-primary-500" />
            Today's Plan
          </h3>
          {planItems.length > 0 ? (
            <div className="space-y-2">
              {planItems.map((note) => (
                <button
                  key={note.id}
                  onClick={() => onSelectNote(note)}
                  className="w-full flex items-center gap-2.5 text-left group"
                >
                  <div className="w-4 h-4 rounded border-2 border-slate-300 dark:border-slate-600 group-hover:border-primary-500 transition-colors shrink-0" />
                  <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors truncate">
                    {note.title}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mb-2">
                Pin notes to add them to your study plan.
              </p>
              <button
                onClick={onNewNote}
                className="text-xs text-primary-600 dark:text-primary-400 hover:underline font-medium"
              >
                Create a note to pin →
              </button>
            </div>
          )}
        </div>

        <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-4 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
          <h3 className="text-sm font-bold mb-1 flex items-center gap-2 relative">
            <Target className="w-4 h-4" />
            AI Recommendation
          </h3>
          {weakTopics.length > 0 ? (
            <>
              <p className="text-xs text-white/80 mb-3 relative">
                You have fewer notes in these topics. Focus here to improve.
              </p>
              <div className="space-y-2 relative">
                {weakTopics.map(([cat, count]) => (
                  <button
                    key={cat}
                    onClick={() => onNavigate('notes')}
                    className="w-full flex items-center justify-between bg-white/15 hover:bg-white/25 rounded-lg px-3 py-2 transition-colors"
                  >
                    <span className="text-xs font-medium">{cat}</span>
                    <span className="text-[10px] text-white/70">{count} notes</span>
                  </button>
                ))}
              </div>
            </>
          ) : (
            <p className="text-xs text-white/80 relative">
              Start creating notes to get personalized recommendations.
            </p>
          )}
        </div>
      </div>

      {/* Study Analytics + Popular Tags */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-accent-500" />
            Study Analytics
          </h3>
          {categoryEntries.length > 0 ? (
            <div className="space-y-2.5">
              {categoryEntries.map(([cat, count]) => (
                <div key={cat}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600 dark:text-slate-400 truncate">{cat}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">{count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Create notes to see your study distribution.
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Hash className="w-4 h-4 text-slate-400" />
            Popular Tags
          </h3>
          {allTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {allTags.slice(0, 12).map(([tag, count]) => (
                <span
                  key={tag}
                  className="flex items-center gap-1 px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-lg"
                >
                  <span className="text-slate-400">#</span>
                  {tag}
                  <span className="text-slate-300 dark:text-slate-600 ml-0.5">{count}</span>
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Tags will appear as you add them to notes.
            </p>
          )}
        </div>
      </div>

      {/* Empty state */}
      {notes.length === 0 && (
        <div className="mt-6 p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <p className="text-slate-400 text-sm mb-3">No notes yet</p>
          <button
            onClick={onNewNote}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create your first note
          </button>
        </div>
      )}
    </div>
  );
}

function QuickPill({
  icon, label, value, active,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
        active
          ? 'bg-primary-500 text-white shadow-sm shadow-primary-500/20'
          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
      }`}
    >
      {icon}
      <span>{label}</span>
      <span className={`text-xs ${active ? 'text-white/80' : 'text-slate-400'}`}>{value}</span>
    </div>
  );
}

/* ---------- Note List View ---------- */

function NoteListView({
  notes, sortMode, onSortChange, onSelectNote, onTogglePin, onDeleteNote,
  onNewNote, activeCategory, activeTag, onClearFilters, searchQuery,
}: {
  notes: Note[];
  sortMode: SortMode;
  onSortChange: (m: SortMode) => void;
  onSelectNote: (n: Note) => void;
  onTogglePin: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onNewNote: () => void;
  activeCategory: string | null;
  activeTag: string | null;
  onClearFilters: () => void;
  searchQuery: string;
}) {
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto animate-fade-in overflow-y-auto h-full">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            {activeCategory || (activeTag ? `#${activeTag}` : 'All Notes')}
          </h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-0.5">
            {notes.length} {notes.length === 1 ? 'note' : 'notes'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortMode}
            onChange={(e) => onSortChange(e.target.value as SortMode)}
            className="text-sm px-3 py-1.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="updated">Recently updated</option>
            <option value="created">Recently created</option>
            <option value="title">Title (A-Z)</option>
          </select>
        </div>
      </div>

      {(activeCategory || activeTag) && (
        <button
          onClick={onClearFilters}
          className="mb-4 inline-flex items-center gap-1 text-sm text-primary-600 dark:text-primary-400 hover:underline"
        >
          <X className="w-3.5 h-3.5" />
          Clear filter
        </button>
      )}

      {notes.length === 0 ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
          <FileText className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
          <p className="text-slate-500 dark:text-slate-400 mb-1">
            {searchQuery ? 'No notes match your search' : 'No notes in this category'}
          </p>
          <button
            onClick={onNewNote}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Note
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {notes.map((note) => (
            <NoteCard
              key={note.id}
              note={note}
              onClick={() => onSelectNote(note)}
              onTogglePin={() => onTogglePin(note.id)}
              onDelete={() => onDeleteNote(note.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function NoteCard({
  note, onClick, onTogglePin, onDelete, compact,
}: {
  note: Note;
  onClick: () => void;
  onTogglePin?: () => void;
  onDelete?: () => void;
  compact?: boolean;
}) {
  const [showActions, setShowActions] = useState(false);

  return (
    <div
      className="group relative bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg transition-all cursor-pointer overflow-hidden animate-fade-in"
      onClick={onClick}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      {note.is_pinned && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-warning-400 to-warning-500" />
      )}

      <div className={`p-${compact ? '4' : '5'}`}>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 leading-snug">
            {note.title}
          </h3>
          {showActions && (onTogglePin || onDelete) && (
            <div className="flex items-center gap-1 -mt-1 -mr-1">
              {onTogglePin && (
                <button
                  onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
                  className={`p-1 rounded transition-colors ${
                    note.is_pinned
                      ? 'text-warning-500'
                      : 'text-slate-400 hover:text-warning-500'
                  }`}
                >
                  <Pin className="w-3.5 h-3.5" fill={note.is_pinned ? 'currentColor' : 'none'} />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={(e) => { e.stopPropagation(); onDelete(); }}
                  className="p-1 rounded text-slate-400 hover:text-error-500 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>

        {note.summary ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-3">
            {note.summary}
          </p>
        ) : (
          <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 mb-3 italic">
            No AI summary yet
          </p>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] rounded">
            <Folder className="w-2.5 h-2.5" />
            {note.category}
          </span>
          {note.tags.slice(0, 2).map((tag) => (
            <span key={tag} className="inline-flex items-center text-[10px] text-primary-600 dark:text-primary-400">
              #{tag}
            </span>
          ))}
          {note.tags.length > 2 && (
            <span className="text-[10px] text-slate-400">+{note.tags.length - 2}</span>
          )}
          <span className="ml-auto text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <Clock className="w-2.5 h-2.5" />
            {readingTime(note.word_count)}m
          </span>
        </div>
      </div>
    </div>
  );
}

/* ---------- Editor View ---------- */

function EditorView({
  note, editorMode, onChange, onSave, aiSummary, aiSuggestedTags, aiCategory,
  generatingAI, onRunAI, onApplySummary, onApplyTag, onApplyCategory,
  relatedNotes, onSelectRelated,
}: {
  note: Note;
  editorMode: 'edit' | 'preview' | 'split';
  onChange: (n: Note) => void;
  onSave: () => void;
  aiSummary: string | null;
  aiSuggestedTags: string[];
  aiCategory: string | null;
  generatingAI: boolean;
  onRunAI: () => void;
  onApplySummary: () => void;
  onApplyTag: (tag: string) => void;
  onApplyCategory: () => void;
  relatedNotes: Note[];
  onSelectRelated: (n: Note) => void;
}) {
  const [tagInput, setTagInput] = useState('');
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);
  const [translateLang, setTranslateLang] = useState<TranslationLang>('hi');

  const handleTranslate = async () => {
    if (!note.content.trim()) return;
    setTranslateError(null);
    setTranslating(true);
    try {
      const translated = await translateNoteContent(note.content, translateLang);
      onChange({ ...note, content: translated });
    } catch {
      setTranslateError('Translation failed. Please try again.');
    } finally {
      setTranslating(false);
    }
  };

  const addTag = (tag: string) => {
    const clean = tag.trim().toLowerCase().replace(/\s+/g, '-');
    if (clean && !note.tags.includes(clean)) {
      onChange({ ...note, tags: [...note.tags, clean] });
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    onChange({ ...note, tags: note.tags.filter((t) => t !== tag) });
  };

  const showEditor = editorMode === 'edit' || editorMode === 'split';
  const showPreview = editorMode === 'preview' || editorMode === 'split';

  return (
    <div className="h-full flex overflow-hidden">
      {/* Editor + Preview */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Title bar */}
        <div className="px-4 sm:px-6 pt-4 pb-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <input
            type="text"
            value={note.title}
            onChange={(e) => onChange({ ...note, title: e.target.value })}
            placeholder="Note title..."
            className="w-full text-xl sm:text-2xl font-bold text-slate-900 dark:text-white bg-transparent border-0 focus:outline-none placeholder-slate-300 dark:placeholder-slate-700"
          />
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            {/* Category selector */}
            <select
              value={note.category}
              onChange={(e) => onChange({ ...note, category: e.target.value })}
              className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>

            {/* Tags */}
            <div className="flex items-center gap-1.5 flex-wrap">
              {note.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs rounded-md group"
                >
                  #{tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(tagInput);
                  }
                }}
                placeholder="add tag..."
                className="text-xs bg-transparent text-slate-600 dark:text-slate-400 border-0 focus:outline-none w-20 placeholder-slate-300 dark:placeholder-slate-600"
              />
            </div>

            <span className="ml-auto text-xs text-slate-400 dark:text-slate-500">
              {note.content.trim() ? note.content.trim().split(/\s+/).length : 0} words · {readingTime(note.content.trim() ? note.content.trim().split(/\s+/).length : 0)} min
            </span>
          </div>
        </div>

        {/* Editor / Preview panes */}
        <div className="flex-1 flex overflow-hidden">
          {showEditor && (
            <div className={`${showPreview ? 'w-1/2 border-r border-slate-200 dark:border-slate-800' : 'w-full'} h-full overflow-hidden`}>
              <textarea
                value={note.content}
                onChange={(e) => onChange({ ...note, content: e.target.value })}
                placeholder="# Start writing your engineering note...\n\nUse markdown for formatting:\n- **bold** and *italic*\n- `inline code` and ```code blocks```\n- Lists, headings, links, and more"
                className="w-full h-full p-4 sm:p-6 text-sm font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 border-0 focus:outline-none resize-none leading-relaxed"
                spellCheck={true}
              />
            </div>
          )}
          {showPreview && (
            <div className={`${showEditor ? 'w-1/2' : 'w-full'} h-full overflow-y-auto bg-white dark:bg-slate-900`}>
              <div className="p-4 sm:p-6 max-w-3xl mx-auto">
                <Markdown content={note.content} className="markdown-body" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* AI Panel */}
      <div className="hidden xl:flex w-80 shrink-0 border-l border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex-col overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Assistant</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Run AI button */}
          <button
            onClick={onRunAI}
            disabled={generatingAI || !note.content.trim()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl shadow-md transition-all"
          >
            {generatingAI ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                Analyze Note
              </>
            )}
          </button>

          {/* AI Translation */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Languages className="w-3.5 h-3.5 text-accent-500" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Translate Note</span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-2">
              Convert this note's content to another language. Code blocks stay untranslated.
            </p>
            <div className="flex items-center gap-1.5 mb-2">
              {TRANSLATION_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setTranslateLang(lang.code)}
                  className={`px-2 py-1 text-[11px] font-medium rounded-lg transition-colors ${
                    translateLang === lang.code
                      ? 'bg-accent-500 text-white'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:ring-1 hover:ring-accent-300'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
            <button
              onClick={handleTranslate}
              disabled={translating || !note.content.trim()}
              className="w-full flex items-center justify-center gap-1.5 px-3 py-2 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-medium rounded-lg transition-colors"
            >
              {translating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages className="w-3.5 h-3.5" />
                  Translate to {TRANSLATION_LANGUAGES.find((l) => l.code === translateLang)?.label}
                </>
              )}
            </button>
            {translateError && (
              <p className="text-[11px] text-error-500 mt-2">{translateError}</p>
            )}
          </div>

          {/* AI Summary */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Lightbulb className="w-3.5 h-3.5 text-warning-500" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">AI Summary</span>
            </div>
            {aiSummary ? (
              <div className="animate-fade-in">
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-2">
                  {aiSummary}
                </p>
                {note.summary !== aiSummary && (
                  <button
                    onClick={onApplySummary}
                    className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Apply to note
                  </button>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 dark:text-slate-500 italic">
                Click "Analyze Note" to generate a summary
              </p>
            )}
          </div>

          {/* AI Category suggestion */}
          {aiCategory && aiCategory !== note.category && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 animate-fade-in">
              <div className="flex items-center gap-1.5 mb-2">
                <Folder className="w-3.5 h-3.5 text-accent-500" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Suggested Category</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-600 dark:text-slate-400">{aiCategory}</span>
                <button
                  onClick={onApplyCategory}
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-0.5"
                >
                  Apply
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* AI Tag suggestions */}
          {aiSuggestedTags.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 animate-fade-in">
              <div className="flex items-center gap-1.5 mb-2">
                <Tag className="w-3.5 h-3.5 text-primary-500" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Suggested Tags</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {aiSuggestedTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => onApplyTag(tag)}
                    className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-primary-600 dark:text-primary-400 text-xs rounded-md transition-colors"
                  >
                    + #{tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Related notes */}
          {relatedNotes.length > 0 && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <Link2 className="w-3.5 h-3.5 text-accent-500" />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Related Notes</span>
              </div>
              <div className="space-y-1.5">
                {relatedNotes.map((rn) => (
                  <button
                    key={rn.id}
                    onClick={() => onSelectRelated(rn)}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors group"
                  >
                    <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {rn.title}
                    </p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] text-slate-400">{rn.category}</span>
                      {rn.tags.slice(0, 2).map((t) => (
                        <span key={t} className="text-[10px] text-primary-500">#{t}</span>
                      ))}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Note metadata */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Metadata</span>
            </div>
            <div className="space-y-1 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Created</span>
                <span>{new Date(note.created_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Updated</span>
                <span>{new Date(note.updated_at).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Words</span>
                <span>{note.word_count || (note.content.trim() ? note.content.trim().split(/\s+/).length : 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Loading / Empty States ---------- */

function LoadingState() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-sm text-slate-400">Loading notes...</p>
      </div>
    </div>
  );
}

function EmptyState({ onNewNote }: { onNewNote: () => void }) {
  return (
    <div className="flex items-center justify-center h-full p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-primary-500" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          No note selected
        </h2>
        <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">
          Select a note from the sidebar or create a new one to get started.
        </p>
        <button
          onClick={onNewNote}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Note
        </button>
      </div>
    </div>
  );
}
