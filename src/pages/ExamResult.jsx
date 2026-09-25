import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  Trophy,
  Target,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ArrowRight,
  Clock,
  AlertTriangle,
  Layers,
  Percent,
} from "lucide-react";
import { getSubjectById, getTopicById } from "../data/demoData.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import ProgressBar from "../components/ProgressBar.jsx";

function fmtDuration(ms) {
  const totalSec = Math.round(ms / 1000);
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}m ${s.toString().padStart(2, "0")}s`;
}

export default function ExamResult() {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state;

  if (!state || !state.results) {
    return <Navigate to="/exam" replace />;
  }

  const { results, timeSpentMs, autoSubmitted, config } = state;

  const total = results.length;
  const correct = results.filter((r) => r.isCorrect).length;
  const wrong = results.filter(
    (r) => !r.isCorrect && r.selected != null,
  ).length;
  const unanswered = total - correct - wrong;
  const accuracy = total ? Math.round((correct / total) * 100) : 0;

  /* ---------- Topic-level aggregation ---------- */
  const byTopic = {};
  for (const r of results) {
    const key = `${r.subjectId}::${r.topicId}`;
    if (!byTopic[key]) {
      byTopic[key] = {
        subjectId: r.subjectId,
        topicId: r.topicId,
        total: 0,
        correct: 0,
      };
    }
    byTopic[key].total += 1;
    if (r.isCorrect) byTopic[key].correct += 1;
  }

  const topicStats = Object.values(byTopic).map((t) => ({
    ...t,
    accuracy: t.total ? Math.round((t.correct / t.total) * 100) : 0,
  }));

  const weakTopics = topicStats
    .filter((t) => t.accuracy < 60)
    .sort((a, b) => a.accuracy - b.accuracy);

  /* ---------- Subject-level aggregation ---------- */
  const bySubject = {};
  for (const r of results) {
    if (!bySubject[r.subjectId]) {
      bySubject[r.subjectId] = { subjectId: r.subjectId, total: 0, correct: 0 };
    }
    bySubject[r.subjectId].total += 1;
    if (r.isCorrect) bySubject[r.subjectId].correct += 1;
  }
  const subjectStats = Object.values(bySubject).map((s) => ({
    ...s,
    accuracy: s.total ? Math.round((s.correct / s.total) * 100) : 0,
  }));

  /* ---------- Helpers ---------- */
  function topicName(subjId, topId) {
    return getTopicById(subjId, topId)?.topic?.name || topId;
  }
  function subjectName(subjId) {
    return getSubjectById(subjId)?.name || subjId;
  }

  function retake() {
    if (!config) return navigate("/exam");
    const params = new URLSearchParams();
    if (config.subjectId) params.set("subjectId", config.subjectId);
    if (config.topicIds?.length)
      params.set("topicIds", config.topicIds.join(","));
    if (config.difficulty) params.set("difficulty", config.difficulty);
    params.set("count", String(config.count));
    params.set("duration", String(Math.round(config.durationSec / 60)));
    navigate(`/exam/run?${params.toString()}`);
  }

  return (
    <div className="container-page py-10 md:py-14">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Exams", to: "/exam" },
          { label: "Result" },
        ]}
      />

      {/* Auto-submit banner */}
      {autoSubmitted && (
        <div className="mb-6 flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
          <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
          <div className="text-sm">
            Time was up — your exam was submitted automatically. Unanswered
            questions were marked as incorrect.
          </div>
        </div>
      )}

      {/* Hero */}
      <div className="card p-6 md:p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-11 w-11 rounded-lg bg-brand-50 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold tracking-tight">
              Exam Result
            </h1>
            <p className="text-sm text-ink-500">
              {config?.subjectId
                ? `${subjectName(config.subjectId)} Exam`
                : "Mixed Exam"}{" "}
              · {total} questions
            </p>
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-4">
          <div>
            <div className="text-xs text-ink-500">Score</div>
            <div className="mt-1 text-2xl font-bold">
              {correct}
              <span className="text-ink-500 text-base font-normal">
                {" "}
                / {total}
              </span>
            </div>
          </div>
          <div>
            <div className="text-xs text-ink-500 inline-flex items-center gap-1">
              <Percent className="h-3 w-3" /> Accuracy
            </div>
            <div className="mt-1 text-2xl font-bold">{accuracy}%</div>
            <ProgressBar value={accuracy} className="mt-2" />
          </div>
          <div>
            <div className="text-xs text-ink-500 inline-flex items-center gap-1">
              <Clock className="h-3 w-3" /> Time Spent
            </div>
            <div className="mt-1 text-2xl font-bold">
              {fmtDuration(timeSpentMs)}
            </div>
          </div>
          <div>
            <div className="text-xs text-ink-500">Breakdown</div>
            <div className="mt-1 text-sm space-y-0.5">
              <div className="text-green-700">
                Correct: <span className="font-semibold">{correct}</span>
              </div>
              <div className="text-red-700">
                Wrong: <span className="font-semibold">{wrong}</span>
              </div>
              <div className="text-ink-500">
                Unanswered: <span className="font-semibold">{unanswered}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-6 flex flex-wrap gap-3">
        <button onClick={retake} className="btn-primary">
          <RotateCcw className="h-4 w-4" /> Retake Exam
        </button>
        <Link to="/exam" className="btn-secondary">
          Create New Exam <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {/* Subject-wise */}
      {subjectStats.length > 1 && (
        <div className="mt-10 card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="h-5 w-5 text-ink-500" />
            <h2 className="font-semibold">Subject-wise performance</h2>
          </div>
          <ul className="space-y-3">
            {subjectStats.map((s) => (
              <li key={s.subjectId}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium">
                    {subjectName(s.subjectId)}
                  </span>
                  <span className="text-ink-500">
                    {s.correct}/{s.total} · {s.accuracy}%
                  </span>
                </div>
                <ProgressBar value={s.accuracy} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Weak topics */}
      {weakTopics.length > 0 && (
        <div className="mt-10 card p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="font-semibold">Recommended next actions</h2>
          </div>
          <p className="text-sm text-ink-500 mb-4">
            These topics are below your overall average. Practicing them will
            improve your exam performance the fastest.
          </p>
          <ul className="space-y-3">
            {weakTopics.map((t) => (
              <li
                key={`${t.subjectId}-${t.topicId}`}
                className="flex flex-wrap items-center justify-between gap-3 py-3 border-b border-ink-100 last:border-0">
                <div>
                  <div className="font-medium text-sm">
                    {subjectName(t.subjectId)} →{" "}
                    {topicName(t.subjectId, t.topicId)}
                  </div>
                  <div className="text-xs text-ink-500">
                    {t.correct}/{t.total} correct
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="badge bg-red-50 text-red-700">
                    <Target className="h-3 w-3" /> {t.accuracy}% accuracy
                  </span>
                  <Link
                    to={`/practice/topic/${t.subjectId}/${t.topicId}`}
                    className="btn-secondary text-sm">
                    Practice
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Full review */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Review all questions</h2>
        <ul className="space-y-3">
          {results.map((r, i) => {
            const q = r.question;
            return (
              <li key={q.id} className="card p-5">
                <div className="flex items-start gap-3">
                  <div className="shrink-0 mt-0.5">
                    {r.selected == null ? (
                      <span className="inline-block h-5 w-5 rounded-full bg-ink-200" />
                    ) : r.isCorrect ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-ink-500 mb-1">
                      Question {i + 1} · {subjectName(r.subjectId)} ·{" "}
                      {topicName(r.subjectId, r.topicId)}
                    </div>
                    <div className="font-medium text-sm">{q.question}</div>

                    <div className="mt-3 grid gap-1.5 text-sm">
                      <div>
                        <span className="text-ink-500">Your answer: </span>
                        {r.selected == null ? (
                          <span className="text-ink-500 italic">
                            Not answered
                          </span>
                        ) : (
                          <span
                            className={
                              r.isCorrect ? "text-green-700" : "text-red-700"
                            }>
                            {String.fromCharCode(65 + r.selected)}.{" "}
                            {q.options[r.selected]}
                          </span>
                        )}
                      </div>
                      {!r.isCorrect && (
                        <div>
                          <span className="text-ink-500">Correct: </span>
                          <span className="text-green-700">
                            {String.fromCharCode(65 + q.answer)}.{" "}
                            {q.options[q.answer]}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 text-xs text-ink-600 bg-ink-100/60 border border-ink-200 rounded-md p-3">
                      <span className="font-semibold">Explanation: </span>
                      {q.explanation}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
