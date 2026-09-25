import { useEffect, useState } from 'react';
import {
  Sparkles, Brain, ListChecks, PenLine, Layers, FileText, Lightbulb,
  BookMarked, Loader2, AlertCircle, RefreshCw, History, Play, ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { aiApi } from '../lib/api.js';
import Breadcrumbs from '../components/Breadcrumbs.jsx';

const ACTIONS = [
  { id: 'analyze',    label: 'Analyze Material',    icon: Sparkles,  desc: 'Exam-focused breakdown' },
  { id: 'mcq',        label: 'Generate MCQs',       icon: ListChecks, desc: 'BCS-style MCQs with answers' },
  { id: 'written',    label: 'Written Questions',   icon: PenLine,    desc: 'Short & descriptive questions' },
  { id: 'flashcards', label: 'Flashcards',          icon: Layers,     desc: 'Front/back study cards' },
  { id: 'notes',      label: 'Revision Notes',      icon: FileText,   desc: 'Condensed revision sheet' },
  { id: 'facts',      label: 'Important Facts',     icon: Lightbulb,  desc: 'Key facts to memorize' },
  { id: 'memorize',   label: 'What to Memorize',    icon: BookMarked, desc: 'Must-remember items' },
];

export default function AIStudyLab() {
  const [material, setMaterial] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [mcqCount, setMcqCount] = useState(5);

  const [loading, setLoading] = useState(false);
  const [loadingKind, setLoadingKind] = useState(null);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null); // { kind, data }
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  const charCount = material.length;
  const tooShort = charCount > 0 && charCount < 50;
  const tooLong = charCount > 20000;
  const canRun = charCount >= 50 && !tooLong && !loading;

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setHistoryLoading(true);
    try {
      const data = await aiApi.history();
      setHistory(data.items || []);
    } catch {
      // silently ignore — history is optional
    } finally {
      setHistoryLoading(false);
    }
  }

  async function run(kind) {
    setError('');
    setResult(null);
    setLoading(true);
    setLoadingKind(kind);
    try {
      let payload = { material };
      if (kind === 'mcq') {
        payload = { material, count: mcqCount, difficulty };
      }

      let data;
      switch (kind) {
        case 'analyze':    data = await aiApi.analyze(payload);    break;
        case 'mcq':        data = await aiApi.mcq(payload);        break;
        case 'written':    data = await aiApi.written(payload);    break;
        case 'flashcards': data = await aiApi.flashcards(payload); break;
        case 'notes':      data = await aiApi.notes(payload);      break;
        case 'facts':      data = await aiApi.facts(payload);      break;
        case 'memorize':   data = await aiApi.memorize(payload);   break;
        default: throw new Error('Unknown action');
      }

      setResult({ kind, data: data.result });
      loadHistory();
    } catch (err) {
      setError(err.message || 'AI generation failed. Please try again.');
    } finally {
      setLoading(false);
      setLoadingKind(null);
    }
  }

  function clearAll() {
    setMaterial('');
    setResult(null);
    setError('');
  }

  function loadSample() {
    setMaterial(
      'The Constitution of Bangladesh was adopted on 4 November 1972 and came into effect on 16 December 1972. ' +
      'It originally had 153 articles, 11 parts, and 7 schedules. The Constitution declares Bangladesh a unitary, ' +
      'independent, sovereign republic. Fundamental rights are guaranteed in Part III. The Prime Minister is the ' +
      'head of government and the President is the head of state. Article 7 declares the Constitution the supreme law of the republic.'
    );
  }

  return (
    <div className="container-page py-10 md:py-14">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'AI Study Lab' },
        ]}
      />

      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-brand-50 flex items-center justify-center">
            <Brain className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">AI Study Lab</h1>
            <p className="text-sm text-ink-500">
              Paste study material. Generate exam-focused content in seconds.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* LEFT: input + actions */}
        <div className="space-y-6">
          {/* Textarea */}
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="material" className="block text-sm font-medium">
                Study Material
              </label>
              <button
                type="button"
                onClick={loadSample}
                className="text-xs text-brand-600 hover:underline"
              >
                Load sample
              </button>
            </div>
            <textarea
              id="material"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              placeholder="Paste your notes, a chapter, an article, or any study material here..."
              rows={12}
              className="input resize-y font-mono text-sm leading-relaxed"
            />
            <div className="flex items-center justify-between mt-2 text-xs">
              <span className={tooLong ? 'text-red-600' : 'text-ink-500'}>
                {charCount.toLocaleString()} / 20,000 characters
              </span>
              {tooShort && <span className="text-amber-600">Minimum 50 characters</span>}
              {tooLong && <span className="text-red-600">Too long — shorten it</span>}
            </div>

            {material && (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={clearAll}
                  className="btn-ghost text-sm"
                >
                  Clear
                </button>
              </div>
            )}
          </div>

          {/* Options */}
          <div className="card p-6">
            <h2 className="font-semibold text-sm mb-4">MCQ Options</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs text-ink-500 mb-1.5">Difficulty</label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                  className="input text-sm"
                >
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-ink-500 mb-1.5">How many MCQs</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={mcqCount}
                  onChange={(e) =>
                    setMcqCount(Math.min(20, Math.max(1, Number(e.target.value) || 1)))
                  }
                  className="input text-sm"
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="card p-6">
            <h2 className="font-semibold text-sm mb-4">Generate</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {ACTIONS.map((a) => {
                const Icon = a.icon;
                const isRunning = loadingKind === a.id;
                return (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => run(a.id)}
                    disabled={!canRun}
                    className={`text-left p-4 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                      isRunning
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-ink-200 bg-white hover:border-brand-400 hover:bg-brand-50/40'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {isRunning ? (
                        <Loader2 className="h-4 w-4 text-brand-600 animate-spin" />
                      ) : (
                        <Icon className="h-4 w-4 text-brand-600" />
                      )}
                      <span className="font-medium text-sm">{a.label}</span>
                    </div>
                    <div className="text-xs text-ink-500">{a.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT: history */}
        <aside className="space-y-6">
          <div className="card p-5 h-fit">
            <div className="flex items-center gap-2 mb-3">
              <History className="h-4 w-4 text-ink-500" />
              <h3 className="font-semibold text-sm">Recent generations</h3>
            </div>
            {historyLoading ? (
              <div className="text-xs text-ink-500 flex items-center gap-2">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Loading…
              </div>
            ) : history.length === 0 ? (
              <p className="text-xs text-ink-500">
                Your AI generations will appear here.
              </p>
            ) : (
              <ul className="space-y-2">
                {history.slice(0, 6).map((h) => (
                  <li
                    key={h._id}
                    className="text-xs border-b border-ink-100 last:border-0 pb-2 last:pb-0"
                  >
                    <div className="flex justify-between items-center gap-2">
                      <span className="font-medium capitalize">{h.kind}</span>
                      <span
                        className={`badge ${
                          h.status === 'success'
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-700'
                        }`}
                      >
                        {h.status}
                      </span>
                    </div>
                    <div className="text-ink-500 mt-0.5 truncate">
                      {h.materialPreview}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 card p-4 border-red-200 bg-red-50 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-medium text-red-900 text-sm">Generation failed</div>
            <div className="text-sm text-red-800 mt-1">{error}</div>
            <button
              type="button"
              onClick={() => setError('')}
              className="text-xs text-red-700 hover:underline mt-2"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold capitalize">{result.kind} results</h2>
            <button
              type="button"
              onClick={() => setResult(null)}
              className="text-sm text-ink-500 hover:text-brand-600 inline-flex items-center gap-1"
            >
              <RefreshCw className="h-3.5 w-3.5" /> Clear result
            </button>
          </div>

          <ResultView kind={result.kind} data={result.data} />
        </div>
      )}

      {/* Footer note */}
      <div className="mt-12 card p-5 text-xs text-ink-500 flex items-start gap-2">
        <Sparkles className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
        <div>
          AI-generated content is a study aid — always cross-check important facts with
          reliable sources. AI output is not an official BCS question paper.
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Result renderer                                                   */
/* ------------------------------------------------------------------ */

function ResultView({ kind, data }) {
  if (!data) return <div className="text-sm text-ink-500">No data.</div>;

  switch (kind) {
    case 'analyze':
      return <AnalyzeView data={data} />;
    case 'mcq':
      return <McqView data={data} />;
    case 'written':
      return <WrittenView data={data} />;
    case 'flashcards':
      return <FlashcardsView data={data} />;
    case 'notes':
      return <NotesView data={data} />;
    case 'facts':
      return <FactsView data={data} />;
    case 'memorize':
      return <MemorizeView data={data} />;
    default:
      return <pre className="text-xs">{JSON.stringify(data, null, 2)}</pre>;
  }
}

function Section({ title, children }) {
  return (
    <div className="card p-5">
      <h3 className="font-semibold text-sm mb-3">{title}</h3>
      {children}
    </div>
  );
}

function BulletList({ items }) {
  if (!items?.length) return <p className="text-sm text-ink-500">—</p>;
  return (
    <ul className="space-y-1.5 text-sm">
      {items.map((item, i) => (
        <li key={i} className="flex gap-2">
          <span className="text-brand-500 shrink-0">•</span>
          <span>{typeof item === 'string' ? item : JSON.stringify(item)}</span>
        </li>
      ))}
    </ul>
  );
}

function PairList({ items, keyA = 'name', keyB = 'explanation' }) {
  if (!items?.length) return <p className="text-sm text-ink-500">—</p>;
  return (
    <ul className="space-y-2 text-sm">
      {items.map((item, i) => (
        <li key={i}>
          <div className="font-medium">{item[keyA]}</div>
          <div className="text-ink-500">{item[keyB]}</div>
        </li>
      ))}
    </ul>
  );
}

function AnalyzeView({ data }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      {data.summary && (
        <div className="md:col-span-2">
          <Section title="Summary">
            <p className="text-sm">{data.summary}</p>
          </Section>
        </div>
      )}
      <Section title="Important Facts">
        <BulletList items={data.importantFacts} />
      </Section>
      <Section title="Key Concepts">
        <PairList items={data.keyConcepts} />
      </Section>
      <Section title="Important Dates">
        <PairList items={data.importantDates} keyA="date" keyB="event" />
      </Section>
      <Section title="Important Names">
        <PairList items={data.importantNames} keyA="name" keyB="role" />
      </Section>
      <Section title="Definitions">
        <PairList items={data.definitions} keyA="term" keyB="definition" />
      </Section>
      <Section title="Potential Exam Points">
        <BulletList items={data.potentialExamPoints} />
      </Section>
      <Section title="Things to Memorize">
        <BulletList items={data.thingsToMemorize} />
      </Section>
      <Section title="Confusing Areas">
        <BulletList items={data.confusingAreas} />
      </Section>
    </div>
  );
}

function McqView({ data }) {
  const questions = data.questions || [];
  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <div key={i} className="card p-5">
          <div className="flex items-center justify-between text-xs text-ink-500 mb-2">
            <span>Question {i + 1}</span>
            <div className="flex gap-2">
              {q.difficulty && (
                <span className="badge bg-ink-100 text-ink-700">{q.difficulty}</span>
              )}
              {q.topic && (
                <span className="badge bg-brand-50 text-brand-700">{q.topic}</span>
              )}
            </div>
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
  );
}

function WrittenView({ data }) {
  const questions = data.questions || [];
  return (
    <div className="space-y-4">
      {questions.map((q, i) => (
        <div key={i} className="card p-5">
          <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
            <span className="text-ink-500">Question {i + 1}</span>
            {q.type && <span className="badge bg-brand-50 text-brand-700">{q.type}</span>}
            {q.difficulty && <span className="badge bg-ink-100 text-ink-700">{q.difficulty}</span>}
            {q.topic && <span className="badge bg-ink-100 text-ink-700">{q.topic}</span>}
          </div>
          <p className="font-medium text-sm">{q.question}</p>
          {q.expectedPoints?.length > 0 && (
            <div className="mt-3">
              <div className="text-xs font-semibold text-ink-500 mb-1">
                Expected points:
              </div>
              <BulletList items={q.expectedPoints} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function FlashcardsView({ data }) {
  const cards = data.flashcards || [];
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {cards.map((c, i) => (
        <div key={i} className="card p-5">
          <div className="text-xs text-ink-500 mb-2">Card {i + 1}{c.topic ? ` · ${c.topic}` : ''}</div>
          <div className="font-medium text-sm">{c.front}</div>
          <div className="mt-3 pt-3 border-t border-ink-100 text-sm text-ink-700">
            {c.back}
          </div>
        </div>
      ))}
    </div>
  );
}

function NotesView({ data }) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Section title="Key Facts"><BulletList items={data.keyFacts} /></Section>
      <Section title="Definitions"><PairList items={data.definitions} keyA="term" keyB="definition" /></Section>
      <Section title="Important Names"><PairList items={data.importantNames} keyA="name" keyB="role" /></Section>
      <Section title="Important Dates"><PairList items={data.importantDates} keyA="date" keyB="event" /></Section>
      <Section title="Important Concepts"><PairList items={data.importantConcepts} keyA="name" keyB="explanation" /></Section>
      <Section title="Common Confusion"><BulletList items={data.commonConfusion} /></Section>
      <Section title="Quick Revision"><BulletList items={data.quickRevision} /></Section>
    </div>
  );
}

function FactsView({ data }) {
  const facts = data.facts || [];
  return (
    <div className="space-y-3">
      {facts.map((f, i) => (
        <div key={i} className="card p-4 flex items-start gap-3">
          <Lightbulb className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm">{f.fact}</div>
            <div className="mt-1 flex gap-2 text-xs">
              {f.topic && <span className="badge bg-brand-50 text-brand-700">{f.topic}</span>}
              {f.importance && (
                <span
                  className={`badge ${
                    f.importance === 'high'
                      ? 'bg-red-50 text-red-700'
                      : f.importance === 'medium'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-ink-100 text-ink-700'
                  }`}
                >
                  {f.importance}
                </span>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function MemorizeView({ data }) {
  const items = data.items || [];
  return (
    <div className="space-y-3">
      {items.map((it, i) => (
        <div key={i} className="card p-4 flex items-start gap-3">
          <BookMarked className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="text-sm font-medium">{it.value}</div>
            {it.why && <div className="text-xs text-ink-500 mt-1">{it.why}</div>}
            {it.type && (
              <div className="mt-1.5">
                <span className="badge bg-ink-100 text-ink-700">{it.type}</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}