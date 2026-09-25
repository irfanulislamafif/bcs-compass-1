import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Trophy, Target, CheckCircle2, XCircle, RotateCcw, ArrowRight,
  AlertTriangle, Home,
} from 'lucide-react';
import { getSubjectById, getTopicById } from '../data/demoData.jsx';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import ProgressBar from '../components/ProgressBar.jsx';

function fmtDuration(ms) {
  const totalSec = Math.round(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

export default function PracticeResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  if (!state || !state.results) {
    return <Navigate to="/subjects" replace />;
  }

  const { results, timeSpentMs, subjectId, topicId } = state;

  const total = results.length;
  const correct = results.filter((r) => r.isCorrect).length;
  const wrong = total - correct;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;

  // Aggregate by topic for weak-area detection
  const byTopic = {};
  for (const r of results) {
    const key = r.question.topicId;
    if (!byTopic[key]) byTopic[key] = { total: 0, correct: 0, subjectId: r.question.subjectId };
    byTopic[key].total += 1;
    if (r.isCorrect) byTopic[key].correct += 1;
  }

  const weakTopics = Object.entries(byTopic)
    .map(([topicIdKey, v]) => ({
      topicId: topicIdKey,
      subjectId: v.subjectId,
      accuracy: Math.round((v.correct / v.total) * 100),
      total: v.total,
    }))
    .filter((t) => t.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy);

  // Look up names
  function topicName(subjId, topId) {
    const found = getTopicById(subjId, topId);
    return found?.topic?.name || topId;
  }
  function subjectName(subjId) {
    return getSubjectById(subjId)?.name || subjId;
  }

  const subjectObj = subjectId ? getSubjectById(subjectId) : null;
  const topicObj = subjectId && topicId ? getTopicById(subjectId, topicId)?.topic : null;

  function retake() {
    if (topicId && subjectId) {
      navigate(`/practice/topic/${subjectId}/${topicId}`);
    } else if (subjectId) {
      navigate(`/practice/subject/${subjectId}`);
    } else {
      navigate('/subjects');
    }
  }

  return (
    <div className="container-page py-10 md:py-14">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Subjects', to: '/subjects' },
          subjectObj ? { label: subjectObj.name, to: `/subjects/${subjectObj.id}` } : null,
          topicObj
            ? { label: topicObj.name, to: `/topics/${subjectObj.id}/${topicObj.id}` }
            : null,
          { label: 'Result' },
        ].filter(Boolean)}
      />

      {/* Hero result card */}
      <div className="card p-6 md:p-8">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-brand-50 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Practice Complete
            </h1>
            <p className="text-sm text-ink-500">
              {topicObj
                ? `${subjectObj.name} · ${topicObj.name}`
                : subjectObj
                ? subjectObj.name
                : 'Mixed practice'}
            </p>
          </div>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-4">
          <div>
            <div className="text-xs text-ink-500">Score</div>
            <div className="mt-1 text-2xl font-bold">
              {correct}
              <span className="text-ink-500 text-base font-normal"> / {total}</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-ink-500">Accuracy</div>
            <div className="mt-1 text-2xl font-bold">{accuracy}%</div>
            <ProgressBar value={accuracy} className="mt-2" />
          </div>
          <div>
            <div className="text-xs text-ink-500">Time Spent</div>
            <div className="mt-1 text-2xl font-bold">{fmtDuration(timeSpentMs)}</div>
          </div>
          <div>
            <div className="text-xs text-ink-500">Correct / Wrong</div>
            <div className="mt-1 text-2xl font-bold">
              <span className="text-green-600">{correct}</span>
              <span className="text-ink-300"> / </span>
              <span className="text-red-600">{wrong}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={retake} className="btn-primary">
          <RotateCcw className="h-4 w-4" /> Retake Practice
        </button>
        <Link to="/mistakes" className="btn-secondary">
          Review My Mistakes <ArrowRight className="h-4 w-4" />
        </Link>
        <Link to="/subjects" className="btn-ghost">
          <Home className="h-4 w-4" /> Back to Subjects
        </Link>
      </div>

      {/* Weak topics */}
      {weakTopics.length > 0 && (
        <div className="mt-10 card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="font-semibold">Topics you should revisit</h2>
          </div>
          <ul className="space-y-3">
            {weakTopics.map((t) => (
              <li
                key={t.topicId}
                className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-ink-100 last:border-0"
              >
                <div>
                  <div className="font-medium text-sm">
                    {topicName(t.subjectId, t.topicId)}
                  </div>
                  <div className="text-xs text-ink-500">
                    {subjectName(t.subjectId)} · {t.total} questions
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="badge bg-red-50 text-red-700">
                    <Target className="h-3 w-3" /> {t.accuracy}% accuracy
                  </span>
                  <Link
                    to={`/practice/topic/${t.subjectId}/${t.topicId}`}
                    className="btn-secondary text-sm"
                  >
                    Practice
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Question review */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Review your answers</h2>
        <ul className="space-y-3">
          {results.map((r, i) => (
            <li key={r.question.id} className="card p-5">
              <div className="flex items-start gap-3">
                <div className="shrink-0 mt-0.5">
                  {r.isCorrect ? (
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="text-xs text-ink-500 mb-1">
                    Question {i + 1} · {subjectName(r.question.subjectId)} ·{' '}
                    {topicName(r.question.subjectId, r.question.topicId)}
                  </div>
                  <div className="font-medium text-sm">{r.question.question}</div>

                  <div className="mt-3 grid gap-1.5 text-sm">
                    <div>
                      <span className="text-ink-500">Your answer: </span>
                      {r.selected == null ? (
                        <span className="text-ink-500 italic">Not answered</span>
                      ) : (
                        <span
                          className={
                            r.isCorrect ? 'text-green-700' : 'text-red-700'
                          }
                        >
                          {String.fromCharCode(65 + r.selected)}.{' '}
                          {r.question.options[r.selected]}
                        </span>
                      )}
                    </div>
                    {!r.isCorrect && (
                      <div>
                        <span className="text-ink-500">Correct: </span>
                        <span className="text-green-700">
                          {String.fromCharCode(65 + r.question.answer)}.{' '}
                          {r.question.options[r.question.answer]}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="mt-3 text-xs text-ink-600 bg-ink-100/60 border border-ink-200 rounded-md p-3">
                    <span className="font-semibold">Explanation: </span>
                    {r.question.explanation}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}