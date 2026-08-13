import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Sparkles, Clock, ChevronRight, CheckCircle2, XCircle, Trophy,
  RotateCcw, Loader2, FileText, AlertCircle, ClipboardPaste, Upload,
} from 'lucide-react';
import { generateQuiz, type QuizQuestion } from '@/lib/ai';
import { extractPdfText } from '@/lib/pdf';
import { PROGRAMMING_QUIZZES, type ProgrammingQuiz } from '@/lib/programmingQuizzes';

type Difficulty = 'easy' | 'medium' | 'hard';
type Phase = 'setup' | 'taking' | 'results';

export function QuizPage() {
  const [phase, setPhase] = useState<Phase>('setup');
  const [inputText, setInputText] = useState('');
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeQuizName, setActiveQuizName] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalTime = difficulty === 'easy' ? 60 : difficulty === 'medium' ? 120 : 180;

  // Timer
  useEffect(() => {
    if (phase === 'taking' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setPhase('results');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }
  }, [phase, timeLeft]);

  const handleStart = useCallback(async () => {
    if (inputText.trim().length < 100) {
      setError('Please provide at least a few sentences to generate quiz questions.');
      return;
    }
    setError(null);
    setLoading(true);
    setActiveQuizName('Custom Quiz');
    await new Promise((r) => setTimeout(r, 700));
    const generated = generateQuiz(inputText, difficulty, 5);
    if (generated.length === 0) {
      setError('Could not generate quiz questions from this text. Try providing more detailed content.');
      setLoading(false);
      return;
    }
    startQuiz(generated);
  }, [inputText, difficulty]);

  const startQuiz = (qs: QuizQuestion[]) => {
    setQuestions(qs);
    setAnswers(new Array(qs.length).fill(null));
    setCurrentQ(0);
    setTimeLeft(totalTime);
    setPhase('taking');
    setLoading(false);
  };

  const handleStartProgrammingQuiz = (quiz: ProgrammingQuiz) => {
    setError(null);
    setLoading(true);
    setActiveQuizName(quiz.name);
    // Shuffle questions based on difficulty (easy: fewer, hard: all)
    const questionPool = [...quiz.questions];
    const count = difficulty === 'easy' ? 5 : difficulty === 'medium' ? 6 : quiz.questions.length;
    // Shuffle and pick
    const shuffled = questionPool.sort(() => Math.random() - 0.5).slice(0, count);
    // Shuffle options within each question too
    const processed = shuffled.map((q) => {
      const correctAnswer = q.options[q.correctIndex];
      const shuffledOptions = [...q.options].sort(() => Math.random() - 0.5);
      return {
        ...q,
        options: shuffledOptions,
        correctIndex: shuffledOptions.indexOf(correctAnswer),
      };
    });
    setTimeout(() => startQuiz(processed), 500);
  };

  const handleAnswer = (optionIndex: number) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQ] = optionIndex;
      return next;
    });
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setPhase('results');
    }
  };

  const handleRestart = () => {
    setPhase('setup');
    setQuestions([]);
    setAnswers([]);
    setCurrentQ(0);
    setTimeLeft(0);
    setActiveQuizName(null);
  };

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

  if (phase === 'setup') {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-3xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
          <div className="mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 rounded-full text-xs font-medium text-primary-600 dark:text-primary-400 mb-3">
              <Sparkles className="w-3 h-3" />
              AI Quiz Generator
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-2">
              Test Your Knowledge
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Choose a pre-built programming quiz or generate one from your own material.
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg text-error-600 dark:text-error-400 text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Programming language quizzes */}
          <div className="mb-6">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
              <span className="w-1 h-4 bg-primary-500 rounded-full"></span>
              Programming Language Quizzes
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {PROGRAMMING_QUIZZES.map((quiz) => (
                <button
                  key={quiz.id}
                  onClick={() => handleStartProgrammingQuiz(quiz)}
                  disabled={loading}
                  className="group relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 text-left hover:shadow-lg hover:border-primary-300 dark:hover:border-primary-700 transition-all disabled:opacity-50"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${quiz.color}`} />
                  <div className="flex items-center gap-2.5 mb-2">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${quiz.color} flex items-center justify-center text-white text-xs font-bold shadow-sm`}>
                      {quiz.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{quiz.name}</h3>
                      <p className="text-[10px] text-slate-400">{quiz.questions.length} questions</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed line-clamp-2">
                    {quiz.description}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
            <span className="text-xs text-slate-400 dark:text-slate-500 font-medium">OR generate from your text</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
          </div>

          {/* Custom quiz text input */}
          <div className="mb-5">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                const file = e.dataTransfer.files[0];
                if (file) handlePdfUpload(file);
              }}
              className={`relative border-2 border-dashed rounded-xl transition-all mb-3 ${
                dragOver ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20' : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <input type="file" accept=".pdf" id="quiz-pdf" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handlePdfUpload(f); }}
              />
              <label htmlFor="quiz-pdf" className="cursor-pointer flex items-center justify-center gap-2 py-3 text-sm text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <Upload className="w-4 h-4" />
                Upload PDF for quiz content
              </label>
            </div>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your study material here..."
              className="w-full h-40 p-4 text-sm text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none placeholder-slate-400 dark:placeholder-slate-600"
            />
            <div className="flex justify-between items-center mt-2">
              <button
                onClick={async () => {
                  try { const t = await navigator.clipboard.readText(); if (t) setInputText(t); } catch {}
                }}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
              >
                <ClipboardPaste className="w-3 h-3" />
                Paste from clipboard
              </button>
              <span className="text-xs text-slate-400">{inputText.length} characters</span>
            </div>
          </div>

          {/* Difficulty selector */}
          <div className="mb-6">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 block">
              Difficulty Level
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['easy', 'medium', 'hard'] as Difficulty[]).map((diff) => (
                <button
                  key={diff}
                  onClick={() => setDifficulty(diff)}
                  className={`px-4 py-3 rounded-xl text-sm font-medium capitalize transition-all border-2 ${
                    difficulty === diff
                      ? diff === 'easy'
                        ? 'border-accent-400 bg-accent-50 dark:bg-accent-900/20 text-accent-700 dark:text-accent-300'
                        : diff === 'medium'
                        ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-error-400 bg-error-50 dark:bg-error-900/20 text-error-700 dark:text-error-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                  }`}
                >
                  {diff}
                  <span className="block text-[10px] opacity-70 mt-0.5">
                    {diff === 'easy' ? '60s' : diff === 'medium' ? '120s' : '180s'}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleStart}
            disabled={loading || !inputText.trim()}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-lg shadow-primary-500/20 transition-all"
          >
            {loading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Generating Quiz...</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Start Quiz</>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'taking') {
    const q = questions[currentQ];
    const progress = ((currentQ + 1) / questions.length) * 100;
    const timeProgress = (timeLeft / totalTime) * 100;
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const lowTime = timeLeft <= 15;

    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
          {/* Header: timer + progress */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-400">Question</span>
              <span className="font-bold text-slate-900 dark:text-white">{currentQ + 1}</span>
              <span className="text-slate-400">/ {questions.length}</span>
            </div>
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-mono font-bold ${
              lowTime ? 'bg-error-50 dark:bg-error-900/20 text-error-600 dark:text-error-400 animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
            }`}>
              <Clock className="w-4 h-4" />
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden mb-2">
            <div className="h-full bg-gradient-to-r from-primary-500 to-accent-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <div className="h-1 bg-slate-100 dark:bg-slate-900 rounded-full overflow-hidden mb-6">
            <div className={`h-full rounded-full transition-all duration-1000 linear ${lowTime ? 'bg-error-500' : 'bg-accent-500'}`} style={{ width: `${timeProgress}%` }} />
          </div>

          {/* Question card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 mb-4 animate-fade-in" key={currentQ}>
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-xs font-bold">
                {currentQ + 1}
              </span>
              <span className="text-xs text-slate-400 capitalize">{difficulty} difficulty</span>
              {activeQuizName && <span className="text-xs text-primary-500 font-medium">· {activeQuizName}</span>}
            </div>
            <p className="text-base font-medium text-slate-900 dark:text-white leading-relaxed mb-5">
              {q.question}
            </p>

            <div className="space-y-2">
              {q.options.map((option, i) => {
                const isSelected = answers[currentQ] === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleAnswer(i)}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-xl text-sm text-left transition-all border-2 ${
                      isSelected
                        ? 'border-primary-400 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className={`flex items-center justify-center w-6 h-6 rounded-md text-xs font-bold shrink-0 ${
                      isSelected ? 'bg-primary-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                    }`}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className="flex-1">{option}</span>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-primary-500 shrink-0" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Next button */}
          <button
            onClick={handleNext}
            disabled={answers[currentQ] === null}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:opacity-30 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-colors"
          >
            {currentQ < questions.length - 1 ? (
              <>Next Question <ChevronRight className="w-5 h-5" /></>
            ) : (
              <>Finish Quiz <Trophy className="w-5 h-5" /></>
            )}
          </button>
        </div>
      </div>
    );
  }

  // Results phase
  const correctCount = answers.filter((a, i) => a === questions[i]?.correctIndex).length;
  const score = Math.round((correctCount / questions.length) * 100);
  const minutes = Math.floor((totalTime - timeLeft) / 60);
  const seconds = (totalTime - timeLeft) % 60;
  const grade = score >= 90 ? 'Excellent' : score >= 70 ? 'Good' : score >= 50 ? 'Fair' : 'Keep Practicing';

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 lg:p-8 animate-fade-in">
        {/* Score header */}
        <div className="text-center mb-8">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg ${
            score >= 70 ? 'bg-gradient-to-br from-accent-400 to-accent-600 shadow-accent-500/20' : 'bg-gradient-to-br from-warning-400 to-warning-600 shadow-warning-500/20'
          }`}>
            <Trophy className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{score}%</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {correctCount} out of {questions.length} correct · {grade}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Completed in {minutes}:{seconds.toString().padStart(2, '0')}
          </p>
        </div>

        {/* Score breakdown bar */}
        <div className="flex gap-1.5 mb-6">
          {questions.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-2 rounded-full ${
                answers[i] === questions[i].correctIndex ? 'bg-accent-500' : 'bg-error-400'
              }`}
            />
          ))}
        </div>

        {/* Review questions */}
        <div className="space-y-3 mb-6">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Review Answers
          </h2>
          {questions.map((q, i) => {
            const userAnswer = answers[i];
            const isCorrect = userAnswer === q.correctIndex;
            return (
              <div key={i} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex items-start gap-2.5 mb-2">
                  {isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-accent-500 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-error-500 shrink-0 mt-0.5" />
                  )}
                  <p className="text-sm font-medium text-slate-900 dark:text-white flex-1">
                    {q.question}
                  </p>
                </div>
                <div className="ml-7.5 space-y-1.5">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-xs text-slate-400">Your answer:</span>
                    <span className={isCorrect ? 'text-accent-600 dark:text-accent-400 font-medium' : 'text-error-600 dark:text-error-400 font-medium'}>
                      {userAnswer !== null ? q.options[userAnswer] : 'Not answered'}
                    </span>
                  </div>
                  {!isCorrect && (
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xs text-slate-400">Correct:</span>
                      <span className="text-accent-600 dark:text-accent-400 font-medium">{q.options[q.correctIndex]}</span>
                    </div>
                  )}
                  <p className="text-xs text-slate-500 dark:text-slate-400 italic mt-1.5">
                    {q.explanation}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <button
          onClick={handleRestart}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium rounded-xl transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
          Take New Quiz
        </button>
      </div>
    </div>
  );
}
