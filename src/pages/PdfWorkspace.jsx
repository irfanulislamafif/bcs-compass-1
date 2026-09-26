import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  FileText, Loader2, AlertCircle, Sparkles, ArrowLeft, MessageSquare,
  ListChecks, Brain, Send,
} from 'lucide-react';
import { materialApi, ragApi } from '../lib/api.js';
import Breadcrumbs from '../components/Breadcrumbs.jsx';

const TABS = [
  { id: 'ask',     label: 'Ask',      icon: MessageSquare },
  { id: 'mcq',     label: 'Generate MCQs', icon: ListChecks },
  { id: 'analyze', label: 'Analyze',  icon: Brain },
];

const LANGS = [
  { value: 'auto', label: 'Auto' },
  { value: 'bn', label: 'বাংলা' },
  { value: 'en', label: 'English' },
];

export default function PdfWorkspace() {
  const { id } = useParams();

  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('ask');

  /* Ask tab state */
  const [question, setQuestion] = useState('');
  const [askLoading, setAskLoading] = useState(false);
  const [askResult, setAskResult] = useState(null);

  /* MCQ tab state */
  const [mcqCount, setMcqCount] = useState(10);
  const [mcqDifficulty, setMcqDifficulty] = useState('medium');
  const [mcqLoading, setMcqLoading] = useState(false);
  const [mcqResult, setMcqResult] = useState(null);

  /* Analyze tab state */
  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState(null);

  const [outputLanguage, setOutputLanguage] = useState('auto');

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await materialApi.get(id);
      setMaterial(data.material);
    } catch (err) {
      setError(err.message || 'Failed to load PDF.');
    } finally {
      setLoading(false);
    }
  }

  async function handleAsk() {
    if (question.trim().length < 5) {
      setError('Please write a longer question.');
      return;
    }
    setError('');
    setAskLoading(true);
    setAskResult(null);
    try {
      const data = await ragApi.ask({
        question: question.trim(),
        materialId: id,
        outputLanguage,
        topK: 5,
      });
      setAskResult(data.result);
    } catch (err) {
      setError(err.message || 'Ask failed.');
    } finally {
      setAskLoading(false);
    }
  }

  async function handleMcq() {
    setError('');
    setMcqLoading(true);
    setMcqResult(null);
    try {
      const data = await ragApi.mcq({
        materialId: id,
        count: mcqCount,
        difficulty: mcqDifficulty,
        outputLanguage,
      });
      setMcqResult(data.result);
    } catch (err) {
      setError(err.message || 'MCQ generation failed.');
    } finally {
      setMcqLoading(false);
    }
  }

  async function handleAnalyze() {
    setError('');
    setAnalyzeLoading(true);
    setAnalyzeResult(null);
    try {
      const data = await ragApi.analyze({
        materialId: id,
        outputLanguage,
      });
      setAnalyzeResult(data.result);
    } catch (err) {
      setError(err.message || 'Analyze failed.');
    } finally {
      setAnalyzeLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container-page py-12 flex items-center justify-center text-sm text-ink-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading…
      </div>
    );
  }

  if (error && !material) {
    return (
      <div className="container-page py-12 max-w-2xl">
        <div className="card p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">{error}</div>
        </div>
        <Link to="/my-pdfs" className="btn-secondary mt-4">
          Back to My PDFs
        </Link>
      </div>
    );
  }

  return (
    <div className="container-page py-10 md:py-14">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'My PDFs', to: '/my-pdfs' },
          { label: material.title },
        ]}
      />

      <Link
        to="/my-pdfs"
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600 mb-6"
      >
        <ArrowLeft className="h-4 w-4" /> Back to My PDFs
      </Link>

      {/* Header */}
      <div className="card p-6">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
            <FileText className="h-6 w-6 text-brand-600" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">
              {material.title}
            </h1>
            <p className="text-xs text-ink-500 mt-1">
              {material.pageCount || '?'} pages · {material.chunkCount} chunks ·{' '}
              {material.language}
            </p>
          </div>
          <select
            value={outputLanguage}
            onChange={(e) => setOutputLanguage(e.target.value)}
            className="input !w-auto !py-2 text-sm"
          >
            {LANGS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 border-b border-ink-100">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap inline-flex items-center gap-2 ${
                  tab === t.id
                    ? 'border-brand-600 text-brand-700'
                    : 'border-transparent text-ink-500 hover:text-ink-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mt-6 card p-4 bg-red-50 border-red-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-red-800">{error}</div>
        </div>
      )}

      {/* Ask */}
      {tab === 'ask' && (
        <div className="mt-6 space-y-4">
          <div className="card p-6">
            <label className="block text-sm font-medium mb-2">
              Ask a question about this PDF
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              placeholder="e.g. What does this chapter say about fundamental rights?"
              className="input resize-y text-sm"
            />
            <button
              type="button"
              onClick={handleAsk}
              disabled={askLoading}
              className="btn-primary mt-4"
            >
              {askLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> Ask
                </>
              )}
            </button>
          </div>

          {askResult && (
            <div className="space-y-4">
              <div className="card p-6">
                <div className="text-xs font-semibold text-ink-500 mb-2">
                  Answer
                </div>
                <p className="text-sm whitespace-pre-wrap">
                  {askResult.answer}
                </p>
                {askResult.confidence && (
                  <div className="mt-3 text-xs text-ink-500">
                    Confidence: <strong>{askResult.confidence}</strong>
                  </div>
                )}
              </div>

              {askResult.keyPoints?.length > 0 && (
                <div className="card p-5">
                  <div className="text-xs font-semibold text-ink-500 mb-2">
                    Key points
                  </div>
                  <ul className="space-y-1.5 text-sm">
                    {askResult.keyPoints.map((p, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-brand-500">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {askResult.sources?.length > 0 && (
                <div className="card p-5">
                  <div className="text-xs font-semibold text-ink-500 mb-3">
                    Sources
                  </div>
                  <ul className="space-y-3 text-sm">
                    {askResult.sources.map((s, i) => (
                      <li key={i}>
                        <div className="font-medium">
                          Source {s.sourceNumber}: {s.materialTitle}
                        </div>
                        <div className="text-ink-600 mt-1 text-xs">
                          {s.preview}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MCQ */}
      {tab === 'mcq' && (
        <div className="mt-6 space-y-4">
          <div className="card p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs text-ink-500 mb-1.5">
                  How many
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={mcqCount}
                  onChange={(e) =>
                    setMcqCount(
                      Math.min(20, Math.max(1, Number(e.target.value) || 1))
                    )
                  }
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-ink-500 mb-1.5">
                  Difficulty
                </label>
                <select
                  value={mcqDifficulty}
                  onChange={(e) => setMcqDifficulty(e.target.value)}
                  className="input text-sm"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>
            <button
              type="button"
              onClick={handleMcq}
              disabled={mcqLoading}
              className="btn-primary mt-4"
            >
              {mcqLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Generating…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Generate MCQs from PDF
                </>
              )}
            </button>
          </div>

          {mcqResult?.questions?.map((q, i) => (
            <div key={i} className="card p-5">
              <div className="flex items-center justify-between text-xs text-ink-500 mb-2">
                <span>Question {i + 1}</span>
                {q.difficulty && (
                  <span className="badge bg-ink-100 text-ink-700">
                    {q.difficulty}
                  </span>
                )}
              </div>
              <p className="font-medium text-sm">{q.question}</p>
              <ul className="mt-3 space-y-1.5">
                {q.options?.map((opt, j) => (
                  <li
                    key={j}
                    className={`px-3 py-2 rounded-md border text-sm flex items-center gap-2 ${
                      j === q.answer
                        ? 'border-green-300 bg-green-50 text-green-900'
                        : 'border-ink-200 bg-white'
                    }`}
                  >
                    <span className="h-5 w-5 rounded-full border border-current/30 flex items-center justify-center text-xs font-semibold">
                      {String.fromCharCode(65 + j)}
                    </span>
                    <span>{opt}</span>
                  </li>
                ))}
              </ul>
              {q.explanation && (
                <div className="mt-3 text-xs bg-ink-100/60 border border-ink-200 rounded-md p-3">
                  <span className="font-semibold">Explanation: </span>
                  {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Analyze */}
      {tab === 'analyze' && (
        <div className="mt-6 space-y-4">
          <div className="card p-6">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzeLoading}
              className="btn-primary"
            >
              {analyzeLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Analyzing…
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" /> Analyze This PDF
                </>
              )}
            </button>
          </div>

          {analyzeResult && (
            <div className="grid gap-4 md:grid-cols-2">
              {analyzeResult.summary && (
                <div className="md:col-span-2 card p-5">
                  <div className="text-xs font-semibold text-ink-500 mb-2">
                    Summary
                  </div>
                  <p className="text-sm">{analyzeResult.summary}</p>
                </div>
              )}
              {[
                ['Important Facts', analyzeResult.importantFacts],
                ['Potential Exam Points', analyzeResult.potentialExamPoints],
                ['Things to Memorize', analyzeResult.thingsToMemorize],
                ['Confusing Areas', analyzeResult.confusingAreas],
              ].map(
                ([title, items]) =>
                  items?.length > 0 && (
                    <div key={title} className="card p-5">
                      <div className="text-xs font-semibold text-ink-500 mb-2">
                        {title}
                      </div>
                      <ul className="space-y-1.5 text-sm">
                        {items.map((x, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-brand-500">•</span>
                            <span>{typeof x === 'string' ? x : JSON.stringify(x)}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}