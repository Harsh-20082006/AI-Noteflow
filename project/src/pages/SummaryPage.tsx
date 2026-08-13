import { useState, useCallback } from 'react';
import {
  Upload, FileText, Sparkles, Lightbulb, Tag, Calculator, GraduationCap,
  Loader2, X, FileUp, ClipboardPaste, AlertCircle, CheckCircle2,
} from 'lucide-react';
import { generateStructuredSummary, type SummaryResult } from '@/lib/ai';
import { extractPdfText } from '@/lib/pdf';

export function SummaryPage() {
  const [inputText, setInputText] = useState('');
  const [summary, setSummary] = useState<SummaryResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeCard, setActiveCard] = useState<number | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!inputText.trim()) {
      setError('Please enter some text or upload a PDF first.');
      return;
    }
    if (inputText.trim().length < 100) {
      setError('Please provide at least a few sentences for a meaningful summary.');
      return;
    }
    setError(null);
    setLoading(true);
    setSummary(null);

    // Simulate AI processing delay for UX
    await new Promise((r) => setTimeout(r, 800));
    const result = generateStructuredSummary(inputText);
    setSummary(result);
    setLoading(false);
  }, [inputText]);

  const handlePdfUpload = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF file.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('PDF file must be under 10MB.');
      return;
    }
    setError(null);
    setFileName(file.name);
    setLoading(true);
    try {
      const text = await extractPdfText(file);
      if (text.trim().length < 50) {
        setError('Could not extract enough text from this PDF. It may be a scanned image.');
        setLoading(false);
        return;
      }
      setInputText(text);
      setLoading(false);
    } catch {
      setError('Failed to read the PDF. Please try a different file.');
      setLoading(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handlePdfUpload(file);
  }, [handlePdfUpload]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setInputText(text);
        setError(null);
      }
    } catch {
      setError('Could not access clipboard. Please paste text manually.');
    }
  }, []);

  const handleClear = () => {
    setInputText('');
    setSummary(null);
    setFileName(null);
    setError(null);
    setActiveCard(null);
  };

  const cards = summary ? [
    { icon: <Lightbulb className="w-5 h-5" />, title: 'Key Points', items: summary.keyPoints, color: 'primary', index: 0 },
    { icon: <Tag className="w-5 h-5" />, title: 'Important Topics', items: summary.importantTopics, color: 'accent', color2: true, index: 1 },
    { icon: <Calculator className="w-5 h-5" />, title: 'Formulas', items: summary.formulas, color: 'warning', index: 2 },
    { icon: <GraduationCap className="w-5 h-5" />, title: 'Exam Tips', items: summary.examTips, color: 'error', index: 3 },
  ] : [];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 rounded-full text-xs font-medium text-primary-600 dark:text-primary-400 mb-3">
            <Sparkles className="w-3 h-3" />
            AI-Powered Study Tool
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            AI Summary Generator
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Paste text or upload a PDF to extract key points, topics, formulas, and exam tips.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg text-error-600 dark:text-error-400 text-sm flex items-center gap-2 animate-fade-in">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
          </div>
        )}

        {/* Input section */}
        <div className="grid lg:grid-cols-2 gap-4 mb-6">
          {/* PDF Upload */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${
              dragOver
                ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20'
                : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
            }`}
          >
            <input
              type="file"
              accept=".pdf"
              id="pdf-upload"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handlePdfUpload(file);
              }}
            />
            <label htmlFor="pdf-upload" className="cursor-pointer flex flex-col items-center text-center">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
                dragOver ? 'bg-primary-100 dark:bg-primary-800' : 'bg-slate-100 dark:bg-slate-800'
              }`}>
                {fileName ? <FileText className="w-7 h-7 text-primary-500" /> : <FileUp className="w-7 h-7 text-slate-400" />}
              </div>
              {fileName ? (
                <>
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate max-w-full">{fileName}</p>
                  <p className="text-xs text-accent-600 dark:text-accent-400 mt-1">Click to replace</p>
                </>
              ) : (
                <>
                  <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Upload PDF</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Drag & drop or click to browse</p>
                </>
              )}
            </label>
          </div>

          {/* Text input */}
          <div className="relative">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Or paste your text here..."
              className="w-full h-full min-h-[140px] p-4 text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none placeholder-slate-400 dark:placeholder-slate-600"
            />
            <div className="absolute bottom-3 right-3 flex items-center gap-2">
              <button
                onClick={handlePaste}
                className="flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
              >
                <ClipboardPaste className="w-3 h-3" />
                Paste
              </button>
              {inputText && (
                <button
                  onClick={handleClear}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-error-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Generate button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleGenerate}
            disabled={loading || !inputText.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-primary-500/20 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Summary
              </>
            )}
          </button>
        </div>

        {/* Output cards */}
        {summary && (
          <div className="grid sm:grid-cols-2 gap-4 animate-fade-in">
            {cards.map((card) => (
              <OutputCard
                key={card.title}
                icon={card.icon}
                title={card.title}
                items={card.items}
                color={card.color}
                expanded={activeCard === card.index}
                onToggle={() => setActiveCard(activeCard === card.index ? null : card.index)}
                isTopics={card.color2}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function OutputCard({
  icon, title, items, color, expanded, onToggle, isTopics,
}: {
  icon: React.ReactNode;
  title: string;
  items: string[];
  color: string;
  expanded: boolean;
  onToggle: () => void;
  isTopics?: boolean;
}) {
  const colorMap: Record<string, string> = {
    primary: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 border-primary-200 dark:border-primary-800',
    accent: 'bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400 border-accent-200 dark:border-accent-800',
    warning: 'bg-warning-50 dark:bg-warning-900/20 text-warning-600 dark:text-warning-400 border-warning-200 dark:border-warning-800',
    error: 'bg-error-50 dark:bg-error-900/20 text-error-600 dark:text-error-400 border-error-200 dark:border-error-800',
  };

  return (
    <div className={`rounded-xl border p-5 transition-all ${colorMap[color]}`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-2.5 mb-3 text-left"
      >
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[color].split(' ').slice(0, 2).join(' ')}`}>
          {icon}
        </div>
        <h3 className="text-sm font-bold flex-1 text-slate-900 dark:text-white">{title}</h3>
        <span className="text-xs text-slate-400">{items.length}</span>
      </button>

      <div className={expanded ? '' : 'line-clamp-4'}>
        {isTopics ? (
          <div className="flex flex-wrap gap-1.5">
            {items.map((topic, i) => (
              <span key={i} className="inline-flex items-center px-2.5 py-1 bg-white/60 dark:bg-slate-800/60 text-xs font-medium rounded-md">
                {topic}
              </span>
            ))}
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0 opacity-60" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {items.length > 4 && !isTopics && (
        <button
          onClick={onToggle}
          className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 mt-3"
        >
          {expanded ? 'Show less' : 'Show all'}
        </button>
      )}
    </div>
  );
}
