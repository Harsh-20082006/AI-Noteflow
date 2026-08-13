import { useState, useCallback } from 'react';
import {
  Code2, Sparkles, Zap, Lightbulb, AlertTriangle, TrendingUp,
  ClipboardPaste, X, Loader2, FileText, Tag, ListTree, Gauge,
  BookOpen, Check, Save, Layers,
} from 'lucide-react';
import { explainCode, type CodeExplanation } from '@/lib/ai';
import { supabase, type Note } from '@/lib/supabase';
import { Markdown } from '@/components/Markdown';

interface CodeExplainerPageProps {
  onSavedNote?: (note: Note) => void;
}

const LANG_COLORS: Record<string, string> = {
  JavaScript: 'from-yellow-400 to-amber-500',
  TypeScript: 'from-sky-400 to-blue-500',
  Python: 'from-blue-400 to-blue-600',
  Java: 'from-orange-400 to-red-500',
  'C++': 'from-indigo-400 to-blue-600',
  C: 'from-slate-400 to-slate-600',
  Go: 'from-cyan-400 to-teal-500',
  Rust: 'from-orange-500 to-red-600',
  SQL: 'from-emerald-400 to-teal-600',
  HTML: 'from-orange-400 to-amber-500',
  CSS: 'from-blue-400 to-indigo-500',
  Bash: 'from-green-400 to-green-600',
  Unknown: 'from-slate-400 to-slate-500',
};

const EXAMPLE_CODE = `function debounce(fn, delay) {
  let timer = null;
  return function(...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, delay);
  };
}`;

export function CodeExplainerPage({ onSavedNote }: CodeExplainerPageProps) {
  const [code, setCode] = useState('');
  const [explanation, setExplanation] = useState<CodeExplanation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const handleExplain = useCallback(async () => {
    if (!code.trim()) {
      setError('Please paste some code to explain.');
      return;
    }
    if (code.trim().length < 10) {
      setError('That\'s too short to analyze — paste a more complete code snippet.');
      return;
    }
    setError(null);
    setLoading(true);
    setExplanation(null);
    setSaved(false);
    await new Promise((r) => setTimeout(r, 700));
    const result = explainCode(code);
    setExplanation(result);
    setLoading(false);
  }, [code]);

  const handlePaste = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text.trim()) {
        setCode(text);
        setError(null);
      }
    } catch {
      setError('Could not access clipboard. Please paste code manually.');
    }
  }, []);

  const handleExample = () => {
    setCode(EXAMPLE_CODE);
    setError(null);
  };

  const handleClear = () => {
    setCode('');
    setExplanation(null);
    setError(null);
    setSaved(false);
  };

  const handleSaveAsNote = async () => {
    if (!explanation) return;
    setError(null);

    const noteContent = [
      `# Code Explanation — ${explanation.language}`,
      '',
      '## Summary',
      explanation.summary,
      '',
      '## How It Works',
      explanation.howItWorks.map((s) => `- ${s}`).join('\n'),
      '',
      '## Key Concepts',
      ...explanation.keyConcepts.map((c) => `- **${c.term}**: ${c.explanation}`),
      '',
      '## Line-by-Line',
      ...explanation.lineByLine.map((l) => `- \`${l.line}\` — ${l.explanation}`),
      '',
      '## Complexity Analysis',
      `- **Time**: ${explanation.complexity.time}`,
      `- **Space**: ${explanation.complexity.space}`,
      '',
      '## Edge Cases',
      ...explanation.edgeCases.map((e) => `- ${e}`),
      '',
      '## Suggested Improvements',
      ...explanation.improvements.map((i) => `- ${i}`),
      '',
      '---',
      '',
      '```' + explanation.language.toLowerCase(),
      code,
      '```',
    ].join('\n');

    const wordCount = noteContent.trim().split(/\s+/).length;
    const payload = {
      title: `Code Explanation — ${explanation.language}`,
      content: noteContent,
      tags: ['code-explanation', explanation.language.toLowerCase()],
      category: 'Algorithms',
      summary: explanation.summary,
      is_pinned: false,
      word_count: wordCount,
    };

    const { data, error } = await supabase
      .from('engineering_notes')
      .insert(payload)
      .select()
      .single();

    if (error) {
      setError('Could not save this explanation as a note. Please try again.');
      return;
    }

    setSaved(true);
    onSavedNote?.(data as Note);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
        {/* Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 rounded-full text-xs font-medium text-primary-600 dark:text-primary-400 mb-3">
            <Code2 className="w-3 h-3" />
            AI-Powered Code Analysis
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
            AI Code Explainer
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Paste any code snippet and get a structured plain-English explanation — how it works, key concepts, line-by-line breakdown, complexity, and improvements.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg text-error-600 dark:text-error-400 text-sm flex items-center gap-2 animate-fade-in">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Code input */}
        <div className="mb-4">
          <div className="relative">
            <div className="absolute top-3 left-3 flex items-center gap-1.5 text-xs text-slate-400 z-10 pointer-events-none">
              <Code2 className="w-3.5 h-3.5" />
              <span>Paste code here</span>
            </div>
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="// Paste your code here..."
              className="w-full min-h-[200px] p-4 pt-10 text-sm font-mono text-slate-800 dark:text-slate-200 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-y placeholder-slate-300 dark:placeholder-slate-700 leading-relaxed"
              spellCheck={false}
            />
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <button
                onClick={handlePaste}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <ClipboardPaste className="w-3.5 h-3.5" />
                Paste
              </button>
              <button
                onClick={handleExample}
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Lightbulb className="w-3.5 h-3.5" />
                Try example
              </button>
              {code && (
                <button
                  onClick={handleClear}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-500 hover:text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20 rounded-lg transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                  Clear
                </button>
              )}
            </div>
            <span className="text-xs text-slate-400">
              {code.trim().split(/\n/).filter((l) => l.trim()).length} lines
            </span>
          </div>
        </div>

        {/* Explain button */}
        <div className="flex justify-center mb-8">
          <button
            onClick={handleExplain}
            disabled={loading || !code.trim()}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-primary-500/20 transition-all"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing code...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Explain Code
              </>
            )}
          </button>
        </div>

        {/* Results */}
        {explanation && (
          <div className="space-y-4 animate-fade-in">
            {/* Language badge + summary */}
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 overflow-hidden relative">
              <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${LANG_COLORS[explanation.language] || LANG_COLORS['Unknown']}`} />
              <div className="flex items-start gap-3 mb-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${LANG_COLORS[explanation.language] || LANG_COLORS['Unknown']} flex items-center justify-center text-white font-bold text-xs shadow-md shrink-0`}>
                  {explanation.language.slice(0, 2).toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      {explanation.language}
                    </h3>
                    <span className="text-xs text-slate-400">detected</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                    {explanation.summary}
                  </p>
                </div>
              </div>
              {/* Save button */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={handleSaveAsNote}
                  disabled={saved}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary-500 hover:bg-primary-600 disabled:opacity-60 text-white rounded-lg transition-colors"
                >
                  {saved ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Saved to Notes
                    </>
                  ) : (
                    <>
                      <Save className="w-3.5 h-3.5" />
                      Save as Note
                    </>
                  )}
                </button>
                <span className="text-xs text-slate-400">
                  Saves the full explanation + original code as a new note
                </span>
              </div>
            </div>

            {/* How it works */}
            {explanation.howItWorks.length > 0 && (
              <ExplanationCard
                icon={<ListTree className="w-5 h-5" />}
                title="How It Works"
                color="primary"
              >
                <ol className="space-y-2">
                  {explanation.howItWorks.map((step, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                      <span className="shrink-0 w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </ExplanationCard>
            )}

            {/* Key concepts */}
            {explanation.keyConcepts.length > 0 && (
              <ExplanationCard
                icon={<BookOpen className="w-5 h-5" />}
                title="Key Concepts"
                color="accent"
              >
                <div className="space-y-3">
                  {explanation.keyConcepts.map((c, i) => (
                    <div key={i}>
                      <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-0.5">
                        {c.term}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        {c.explanation}
                      </p>
                    </div>
                  ))}
                </div>
              </ExplanationCard>
            )}

            {/* Line-by-line */}
            {explanation.lineByLine.length > 0 && (
              <ExplanationCard
                icon={<Layers className="w-5 h-5" />}
                title="Line-by-Line Breakdown"
                color="warning"
              >
                <div className="space-y-2">
                  {explanation.lineByLine.map((l, i) => (
                    <div key={i} className="flex items-start gap-3 text-sm">
                      <code className="shrink-0 max-w-[50%] truncate px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs rounded font-mono">
                        {l.line}
                      </code>
                      <span className="text-slate-600 dark:text-slate-400 leading-relaxed text-xs">
                        {l.explanation}
                      </span>
                    </div>
                  ))}
                </div>
              </ExplanationCard>
            )}

            {/* Complexity */}
            <div className="grid sm:grid-cols-2 gap-4">
              <ExplanationCard
                icon={<Gauge className="w-5 h-5" />}
                title="Time Complexity"
                color="primary"
              >
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {explanation.complexity.time}
                </p>
              </ExplanationCard>
              <ExplanationCard
                icon={<Layers className="w-5 h-5" />}
                title="Space Complexity"
                color="accent"
              >
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {explanation.complexity.space}
                </p>
              </ExplanationCard>
            </div>

            {/* Edge cases */}
            {explanation.edgeCases.length > 0 && (
              <ExplanationCard
                icon={<AlertTriangle className="w-5 h-5" />}
                title="Edge Cases & Pitfalls"
                color="error"
              >
                <ul className="space-y-2">
                  {explanation.edgeCases.map((e, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-error-400" />
                      <span className="leading-relaxed">{e}</span>
                    </li>
                  ))}
                </ul>
              </ExplanationCard>
            )}

            {/* Improvements */}
            {explanation.improvements.length > 0 && (
              <ExplanationCard
                icon={<TrendingUp className="w-5 h-5" />}
                title="Suggested Improvements"
                color="success"
              >
                <ul className="space-y-2">
                  {explanation.improvements.map((impr, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
                      <Check className="w-3.5 h-3.5 mt-0.5 shrink-0 text-success-500" />
                      <span className="leading-relaxed">{impr}</span>
                    </li>
                  ))}
                </ul>
              </ExplanationCard>
            )}
          </div>
        )}

        {/* Empty state hint */}
        {!explanation && !loading && !code.trim() && (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 dark:from-primary-900/30 dark:to-accent-900/30 flex items-center justify-center mx-auto mb-4">
              <Code2 className="w-8 h-8 text-primary-500" />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">
              Paste any code snippet above to get started
            </p>
            <p className="text-xs text-slate-400">
              Works with JavaScript, TypeScript, Python, Java, C++, Go, Rust, SQL, and more
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ExplanationCard({
  icon, title, color, children,
}: {
  icon: React.ReactNode;
  title: string;
  color: 'primary' | 'accent' | 'warning' | 'error' | 'success';
  children: React.ReactNode;
}) {
  const colorMap = {
    primary: 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400',
    accent: 'bg-accent-50 dark:bg-accent-900/20 text-accent-600 dark:text-accent-400',
    warning: 'bg-warning-50 dark:bg-warning-900/20 text-warning-600 dark:text-warning-400',
    error: 'bg-error-50 dark:bg-error-900/20 text-error-600 dark:text-error-400',
    success: 'bg-success-50 dark:bg-success-900/20 text-success-600 dark:text-success-400',
  };
  return (
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
      <div className="flex items-center gap-2.5 mb-3">
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${colorMap[color]}`}>
          {icon}
        </div>
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </div>
  );
}
