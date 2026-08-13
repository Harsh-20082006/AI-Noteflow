import { useState, useMemo } from 'react';
import {
  Search, Download, Eye, X, Sparkles, BookOpen, Tag, Folder,
  TrendingUp, Check, ArrowLeft, Clock,
} from 'lucide-react';
import {
  STORE_NOTES, STORE_CATEGORIES, STORE_DIFFICULTIES,
  type StoreNote,
} from '@/lib/storeNotes';
import { supabase, type Note } from '@/lib/supabase';
import { Markdown } from '@/components/Markdown';
import { readingTime } from '@/lib/ai';

interface StorePageProps {
  onImported: (note: Note) => void;
}

export function StorePage({ onImported }: StorePageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeDifficulty, setActiveDifficulty] = useState<string>('All');
  const [previewNote, setPreviewNote] = useState<StoreNote | null>(null);
  const [importing, setImporting] = useState<string | null>(null);
  const [importedIds, setImportedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const filteredNotes = useMemo(() => {
    let result = [...STORE_NOTES];
    if (activeCategory !== 'All') {
      result = result.filter((n) => n.category === activeCategory);
    }
    if (activeDifficulty !== 'All') {
      result = result.filter((n) => n.difficulty === activeDifficulty);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.summary.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [searchQuery, activeCategory, activeDifficulty]);

  const handleImport = async (storeNote: StoreNote) => {
    setError(null);
    setImporting(storeNote.id);
    const wordCount = storeNote.content.trim().split(/\s+/).length;
    const payload = {
      title: storeNote.title,
      content: storeNote.content,
      tags: [...storeNote.tags],
      category: storeNote.category,
      summary: storeNote.summary,
      is_pinned: false,
      word_count: wordCount,
    };
    const { data, error } = await supabase
      .from('engineering_notes')
      .insert(payload)
      .select()
      .single();
    setImporting(null);
    if (error) {
      setError('Could not import this note. Please try again.');
      return;
    }
    const created = data as Note;
    setImportedIds((prev) => new Set([...prev, storeNote.id]));
    onImported(created);
  };

  const difficultyColors: Record<string, string> = {
    Beginner: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    Intermediate: 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    Advanced: 'bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400',
  };

  if (previewNote) {
    const wordCount = previewNote.content.trim().split(/\s+/).length;
    const alreadyImported = importedIds.has(previewNote.id);
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
          {/* Back button */}
          <button
            onClick={() => setPreviewNote(null)}
            className="inline-flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Store
          </button>

          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-md ${difficultyColors[previewNote.difficulty]}`}>
                {previewNote.difficulty}
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs rounded-md">
                <Folder className="w-3 h-3" />
                {previewNote.category}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-slate-400">
                <Clock className="w-3 h-3" />
                {readingTime(wordCount)} min read
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              {previewNote.title}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm sm:text-base">
              {previewNote.summary}
            </p>
            <div className="flex items-center gap-1.5 flex-wrap mt-3">
              {previewNote.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-0.5 px-2 py-0.5 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs rounded-md"
                >
                  <Tag className="w-2.5 h-2.5" />
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* Import button */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => handleImport(previewNote)}
              disabled={importing === previewNote.id || alreadyImported}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl shadow-md shadow-primary-500/20 transition-all"
            >
              {alreadyImported ? (
                <>
                  <Check className="w-4 h-4" />
                  Imported
                </>
              ) : importing === previewNote.id ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  Import to My Notes
                </>
              )}
            </button>
            <button
              onClick={() => setPreviewNote(null)}
              className="px-4 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-medium rounded-xl transition-colors"
            >
              Close
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg text-error-600 dark:text-error-400 text-sm flex items-center gap-2">
              <X className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Content */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8">
            <Markdown content={previewNote.content} className="markdown-body" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 rounded-full text-xs font-medium text-primary-600 dark:text-primary-400 mb-3">
            <BookOpen className="w-3 h-3" />
            Notes Library
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            Notes Store
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Browse pre-built study notes and import any of them into your collection with one click.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg text-error-600 dark:text-error-400 text-sm flex items-center gap-2">
            <X className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by title, summary, or tag..."
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl ring-1 ring-slate-200 dark:ring-slate-800 focus:ring-2 focus:ring-primary-500 transition-all"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-slate-400 mr-1">Category:</span>
            {STORE_CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                  activeCategory === cat
                    ? 'bg-primary-500 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-primary-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap sm:ml-auto">
            <span className="text-xs text-slate-400 mr-1">Level:</span>
            {STORE_DIFFICULTIES.map((diff) => (
              <button
                key={diff}
                onClick={() => setActiveDifficulty(diff)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                  activeDifficulty === diff
                    ? 'bg-accent-500 text-white'
                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-accent-300'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs text-slate-400 mb-4">
          {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'} available
        </p>

        {/* Notes grid */}
        {filteredNotes.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
            <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No notes match your search. Try different filters.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {filteredNotes.map((note) => {
              const alreadyImported = importedIds.has(note.id);
              return (
                <div
                  key={note.id}
                  className="group bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg transition-all overflow-hidden flex flex-col"
                >
                  {/* Color accent */}
                  <div className="h-1 bg-gradient-to-r from-primary-400 to-accent-400" />

                  <div className="p-5 flex flex-col flex-1">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white leading-snug">
                        {note.title}
                      </h3>
                      <span className={`shrink-0 inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium rounded ${difficultyColors[note.difficulty]}`}>
                        {note.difficulty}
                      </span>
                    </div>

                    {/* Summary */}
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-3 flex-1">
                      {note.summary}
                    </p>

                    {/* Tags */}
                    <div className="flex items-center gap-1 flex-wrap mb-3">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] rounded">
                        <Folder className="w-2.5 h-2.5" />
                        {note.category}
                      </span>
                      {note.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="text-[10px] text-primary-600 dark:text-primary-400">
                          #{tag}
                        </span>
                      ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => setPreviewNote(note)}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Preview
                      </button>
                      <button
                        onClick={() => handleImport(note)}
                        disabled={importing === note.id || alreadyImported}
                        className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium bg-primary-500 hover:bg-primary-600 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                      >
                        {alreadyImported ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            Imported
                          </>
                        ) : importing === note.id ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ...
                          </>
                        ) : (
                          <>
                            <Download className="w-3.5 h-3.5" />
                            Import
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer hint */}
        <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/10 rounded-xl border border-primary-100 dark:border-primary-900/20 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-primary-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
              {STORE_NOTES.length} curated notes available
            </p>
            <p className="text-xs text-primary-600/70 dark:text-primary-400/70 mt-0.5">
              Imported notes appear in your sidebar under All Notes. You can edit, tag, pin, and generate AI summaries for them just like any other note.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
