import { useState, useEffect, useCallback } from 'react';
import {
  Sparkles, Plus, Layers, Trash2, ChevronLeft, ChevronRight, RotateCw,
  Loader2, X, Upload, ClipboardPaste, AlertCircle, BookOpen, Folder,
  ArrowLeft,
} from 'lucide-react';
import { supabase, type FlashcardDeck, type Flashcard } from '@/lib/supabase';
import { generateFlashcards, type GeneratedFlashcard } from '@/lib/ai';
import { extractPdfText } from '@/lib/pdf';

export function FlashcardsPage() {
  const [decks, setDecks] = useState<FlashcardDeck[]>([]);
  const [activeDeck, setActiveDeck] = useState<FlashcardDeck | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [showGenerator, setShowGenerator] = useState(false);
  const [loading, setLoading] = useState(false);

  // Generator state
  const [inputText, setInputText] = useState('');
  const [genCount, setGenCount] = useState(10);
  const [deckName, setDeckName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [previewCards, setPreviewCards] = useState<GeneratedFlashcard[]>([]);

  // Study state
  const [studyMode, setStudyMode] = useState(false);
  const [studyIndex, setStudyIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [knownCount, setKnownCount] = useState(0);

  // Load decks
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('flashcard_decks')
        .select('*')
        .order('updated_at', { ascending: false });
      if (data) setDecks(data as FlashcardDeck[]);
    })();
  }, []);

  // Load cards when deck selected
  useEffect(() => {
    if (!activeDeck) {
      setCards([]);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('flashcards')
        .select('*')
        .eq('deck_id', activeDeck.id)
        .order('created_at', { ascending: true });
      if (data) setCards(data as Flashcard[]);
    })();
  }, [activeDeck]);

  const handleGenerate = useCallback(async () => {
    if (inputText.trim().length < 100) {
      setError('Please provide at least a few sentences to generate flashcards.');
      return;
    }
    setError(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 700));
    const generated = generateFlashcards(inputText, genCount);
    if (generated.length === 0) {
      setError('Could not generate flashcards from this text. Try providing more detailed content.');
      setLoading(false);
      return;
    }
    setPreviewCards(generated);
    if (!deckName) {
      setDeckName(inputText.slice(0, 40).trim() || 'New Deck');
    }
    setLoading(false);
  }, [inputText, genCount, deckName]);

  const handleSaveDeck = useCallback(async () => {
    if (!deckName.trim() || previewCards.length === 0) return;
    setLoading(true);

    const { data: deckData } = await supabase
      .from('flashcard_decks')
      .insert({ name: deckName.trim(), category: 'General' })
      .select()
      .single();

    if (!deckData) {
      setError('Failed to create deck.');
      setLoading(false);
      return;
    }

    const deck = deckData as FlashcardDeck;
    const cardInserts = previewCards.map((c) => ({
      deck_id: deck.id,
      front: c.front,
      back: c.back,
      difficulty: 'medium' as const,
    }));

    const { data: savedCards } = await supabase
      .from('flashcards')
      .insert(cardInserts)
      .select();

    setDecks((prev) => [deck, ...prev]);
    setActiveDeck(deck);
    setCards((savedCards as Flashcard[]) || []);
    setShowGenerator(false);
    setPreviewCards([]);
    setInputText('');
    setDeckName('');
    setError(null);
    setLoading(false);
  }, [deckName, previewCards]);

  const handleDeleteDeck = useCallback(async (id: string) => {
    await supabase.from('flashcard_decks').delete().eq('id', id);
    setDecks((prev) => prev.filter((d) => d.id !== id));
    if (activeDeck?.id === id) {
      setActiveDeck(null);
      setCards([]);
    }
  }, [activeDeck]);

  const handlePdfUpload = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const text = await extractPdfText(file);
      if (text.trim().length < 50) {
        setError('Could not extract enough text from this PDF.');
        setLoading(false);
        return;
      }
      setInputText(text);
      setLoading(false);
    } catch {
      setError('Failed to read the PDF.');
      setLoading(false);
    }
  };

  const startStudy = () => {
    setStudyMode(true);
    setStudyIndex(0);
    setFlipped(false);
    setKnownCount(0);
  };

  const nextCard = (known: boolean) => {
    if (known) setKnownCount((c) => c + 1);
    if (studyIndex < cards.length - 1) {
      setStudyIndex((i) => i + 1);
      setFlipped(false);
    } else {
      setStudyMode(false);
    }
  };

  // Study mode view
  if (studyMode && activeDeck) {
    const card = cards[studyIndex];
    const progress = ((studyIndex + 1) / cards.length) * 100;
    return (
      <div className="h-full flex flex-col overflow-hidden">
        {/* Study header */}
        <div className="px-4 sm:px-6 py-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between">
          <button
            onClick={() => setStudyMode(false)}
            className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Exit Study
          </button>
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {studyIndex + 1} / {cards.length}
          </span>
        </div>

        {/* Progress bar */}
        <div className="h-1.5 bg-slate-200 dark:bg-slate-800">
          <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>

        {/* Flashcard */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div
            className="relative w-full max-w-lg cursor-pointer animate-fade-in"
            style={{ perspective: '1000px' }}
            onClick={() => setFlipped(!flipped)}
            key={studyIndex}
          >
            <div
              className="relative w-full transition-transform duration-500"
              style={{
                transformStyle: 'preserve-3d',
                transform: flipped ? 'rotateY(180deg)' : '',
              }}
            >
              {/* Front */}
              <div
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 sm:p-12 min-h-[280px] flex flex-col items-center justify-center"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <span className="text-xs font-semibold text-primary-500 uppercase tracking-wider mb-4">Question</span>
                <p className="text-lg sm:text-xl font-medium text-slate-900 dark:text-white text-center leading-relaxed">
                  {card.front}
                </p>
                <span className="absolute bottom-4 text-xs text-slate-400 flex items-center gap-1">
                  <RotateCw className="w-3 h-3" /> Click to flip
                </span>
              </div>

              {/* Back */}
              <div
                className="absolute inset-0 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-xl p-8 sm:p-12 min-h-[280px] flex flex-col items-center justify-center"
                style={{
                  backfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                <span className="text-xs font-semibold text-primary-200 uppercase tracking-wider mb-4">Answer</span>
                <p className="text-base sm:text-lg text-white text-center leading-relaxed">
                  {card.back}
                </p>
                <span className="absolute bottom-4 text-xs text-primary-200 flex items-center gap-1">
                  <RotateCw className="w-3 h-3" /> Click to flip back
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="px-4 sm:px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="max-w-lg mx-auto flex gap-3">
            <button
              onClick={() => nextCard(false)}
              className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm font-medium rounded-xl transition-colors"
            >
              Need Review
            </button>
            <button
              onClick={() => nextCard(true)}
              className="flex-1 px-4 py-2.5 bg-accent-500 hover:bg-accent-600 text-white text-sm font-medium rounded-xl transition-colors"
            >
              I Know This
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Deck detail view
  if (activeDeck) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
          <button
            onClick={() => setActiveDeck(null)}
            className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            All Decks
          </button>

          <div className="flex items-start justify-between mb-6 gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">{activeDeck.name}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {cards.length} flashcards
              </p>
            </div>
            <div className="flex items-center gap-2">
              {cards.length > 0 && (
                <button
                  onClick={startStudy}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm font-medium rounded-lg transition-all shadow-md shadow-primary-500/20"
                >
                  <BookOpen className="w-4 h-4" />
                  Study
                </button>
              )}
              <button
                onClick={() => handleDeleteDeck(activeDeck.id)}
                className="p-2 text-slate-400 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {cards.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              This deck has no cards yet.
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {cards.map((card, i) => (
                <div key={card.id} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-md transition-all">
                  <div className="text-xs text-primary-500 font-semibold mb-1.5">Card {i + 1}</div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white mb-2 line-clamp-2">{card.front}</p>
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-2">
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3">{card.back}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Generator modal/view
  if (showGenerator) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
          <button
            onClick={() => { setShowGenerator(false); setPreviewCards([]); setError(null); }}
            className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Decks
          </button>

          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 rounded-full text-xs font-medium text-primary-600 dark:text-primary-400 mb-3">
              <Sparkles className="w-3 h-3" />
              AI Flashcard Generator
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              Create a New Deck
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Paste study material and let AI generate flashcards for you.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg text-error-600 dark:text-error-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Deck name */}
          <div className="mb-4">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block">Deck Name</label>
            <input
              type="text"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              placeholder="e.g. Data Structures Basics"
              className="w-full px-4 py-2.5 text-sm text-slate-900 dark:text-white bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder-slate-400 dark:placeholder-slate-600"
            />
          </div>

          {/* PDF upload */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handlePdfUpload(f); }}
            className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl mb-3"
          >
            <input type="file" accept=".pdf" id="flashcard-pdf" className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePdfUpload(f); }}
            />
            <label htmlFor="flashcard-pdf" className="cursor-pointer flex items-center justify-center gap-2 py-3 text-sm text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
              <Upload className="w-4 h-4" />
              Upload PDF
            </label>
          </div>

          {/* Text input */}
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Paste your study material here..."
            className="w-full h-32 p-4 text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none placeholder-slate-400 dark:placeholder-slate-600 mb-3"
          />

          <div className="flex items-center justify-between mb-4">
            <button
              onClick={async () => { try { const t = await navigator.clipboard.readText(); if (t) setInputText(t); } catch {} }}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
            >
              <ClipboardPaste className="w-3 h-3" /> Paste
            </button>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500">Cards:</label>
              <select
                value={genCount}
                onChange={(e) => setGenCount(Number(e.target.value))}
                className="text-sm px-2 py-1 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading || !inputText.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-primary-500/20 transition-all mb-4"
          >
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</> : <><Sparkles className="w-5 h-5" /> Generate Flashcards</>}
          </button>

          {/* Preview cards */}
          {previewCards.length > 0 && (
            <div className="animate-fade-in">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-3">
                Preview ({previewCards.length} cards)
              </h3>
              <div className="space-y-2 mb-4 max-h-60 overflow-y-auto">
                {previewCards.map((card, i) => (
                  <div key={i} className="bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 p-3">
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{card.front}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{card.back}</p>
                  </div>
                ))}
              </div>
              <button
                onClick={handleSaveDeck}
                disabled={loading || !deckName.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent-500 hover:bg-accent-600 disabled:opacity-50 text-white font-medium rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5" /> Save Deck
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Decks list view (default)
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
        <div className="flex items-start justify-between mb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 rounded-full text-xs font-medium text-primary-600 dark:text-primary-400 mb-3">
              <Layers className="w-3 h-3" />
              Study Tools
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-1">
              Flashcard Decks
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {decks.length} {decks.length === 1 ? 'deck' : 'decks'} · AI-generated study cards
            </p>
          </div>
          <button
            onClick={() => setShowGenerator(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white text-sm font-medium rounded-xl shadow-lg shadow-primary-500/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">New Deck</span>
          </button>
        </div>

        {decks.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8 text-slate-400" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-1">
              No flashcard decks yet
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Create your first deck with AI-generated flashcards from any study material.
            </p>
            <button
              onClick={() => setShowGenerator(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Deck
            </button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {decks.map((deck) => (
              <DeckCard key={deck.id} deck={deck} cardCount={cards.filter(c => c.deck_id === deck.id).length} onClick={() => setActiveDeck(deck)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DeckCard({ deck, cardCount, onClick }: { deck: FlashcardDeck; cardCount: number; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group text-left bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-lg transition-all p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 flex items-center justify-center">
          <Layers className="w-5 h-5 text-primary-600 dark:text-primary-400" />
        </div>
        <Folder className="w-4 h-4 text-slate-300 dark:text-slate-700" />
      </div>
      <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1 line-clamp-1 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
        {deck.name}
      </h3>
      <p className="text-xs text-slate-400 dark:text-slate-500">
        {cardCount || '—'} cards · {new Date(deck.updated_at).toLocaleDateString()}
      </p>
    </button>
  );
}
