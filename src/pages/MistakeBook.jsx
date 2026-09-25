import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  Trash2,
  Eye,
  RotateCcw,
  BookMarked,
  ArrowRight,
  Trophy,
  Layers,
} from "lucide-react";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { demoSubjects } from "../data/demoData.jsx";
import { getMistakeEntries, getMistakeCounts } from "../lib/progress.js";
import {
  removeMistake,
  markMistakeUnderstood,
  unmarkMistakeUnderstood,
} from "../lib/sessionStore.js";

const STATUS_TABS = [
  { id: "active", label: "Active mistakes" },
  { id: "understood", label: "Marked as understood" },
  { id: "all", label: "All" },
];

export default function MistakeBook() {
  const [status, setStatus] = useState("active");
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [expanded, setExpanded] = useState({}); // { [questionId]: true }
  const [refreshKey, setRefreshKey] = useState(0);

  const subject = demoSubjects.find((s) => s.id === subjectId) || null;

  const entries = useMemo(
    () =>
      getMistakeEntries({
        status,
        subjectId: subjectId || undefined,
        topicId: topicId || undefined,
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [status, subjectId, topicId, refreshKey],
  );

  const counts = useMemo(getMistakeCounts, [refreshKey]);

  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  function handleRemove(questionId) {
    if (!window.confirm("Remove this mistake from your Mistake Book?")) return;
    removeMistake(questionId);
    refresh();
  }

  function handleUnderstood(questionId) {
    markMistakeUnderstood(questionId);
    refresh();
  }

  function handleUnmark(questionId) {
    unmarkMistakeUnderstood(questionId);
    refresh();
  }

  function toggleExpand(questionId) {
    setExpanded((prev) => ({ ...prev, [questionId]: !prev[questionId] }));
  }

  return (
    <div className="container-page py-10 md:py-14">
      <Breadcrumbs
        items={[{ label: "Home", to: "/" }, { label: "Mistake Book" }]}
      />

      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-red-50 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Mistake Book
            </h1>
            <p className="text-sm text-ink-500">
              Every question you got wrong — review, understand, and
              re-practice.
            </p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="text-xs text-ink-500">Total mistakes</div>
          <div className="mt-2 text-2xl font-bold">{counts.total}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-ink-500 flex items-center gap-1">
            <XCircle className="h-3 w-3 text-red-500" /> Active
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600">
            {counts.active}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-ink-500 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-600" /> Understood
          </div>
          <div className="mt-2 text-2xl font-bold text-green-600">
            {counts.understood}
          </div>
        </div>
      </div>

      {/* Practice my mistakes CTA */}
      {counts.active > 0 && (
        <div className="mt-6 card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
              <RotateCcw className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <h3 className="font-semibold">Practice My Mistakes</h3>
              <p className="text-sm text-ink-500 mt-0.5">
                Generate a fresh practice session from your {counts.active}{" "}
                active mistake{counts.active !== 1 ? "s" : ""}.
              </p>
            </div>
          </div>
          <Link
            to="/practice?mode=mistakes"
            className="btn-primary whitespace-nowrap">
            Practice Now <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Tabs + filters */}
      <div className="mt-10 border-b border-ink-100">
        <div className="flex gap-1 overflow-x-auto">
          {STATUS_TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setStatus(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                status === t.id
                  ? "border-brand-600 text-brand-700"
                  : "border-transparent text-ink-500 hover:text-ink-900"
              }`}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-sm text-ink-500">
          <Filter className="h-4 w-4" /> Filter:
        </div>

        <select
          value={subjectId}
          onChange={(e) => {
            setSubjectId(e.target.value);
            setTopicId("");
          }}
          className="input !w-auto !py-2 text-sm">
          <option value="">All subjects</option>
          {demoSubjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>

        {subject && (
          <select
            value={topicId}
            onChange={(e) => setTopicId(e.target.value)}
            className="input !w-auto !py-2 text-sm">
            <option value="">All topics</option>
            {subject.topics.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        )}

        {(subjectId || topicId) && (
          <button
            type="button"
            onClick={() => {
              setSubjectId("");
              setTopicId("");
            }}
            className="text-sm text-ink-500 hover:text-brand-600 underline underline-offset-2">
            Clear filters
          </button>
        )}
      </div>

      {/* List */}
      <div className="mt-6 space-y-4">
        {entries.length === 0 ? (
          <EmptyState
            icon={status === "understood" ? Trophy : BookMarked}
            title={
              status === "understood"
                ? "Nothing marked as understood yet"
                : status === "all"
                  ? "No mistakes recorded"
                  : "No active mistakes"
            }
            description={
              status === "active"
                ? "Take a practice session or exam, and questions you miss will appear here automatically."
                : "As you review your Mistake Book and mark questions as understood, they will appear here."
            }
            action={
              status === "active" ? (
                <div className="flex flex-wrap gap-2 justify-center">
                  <Link to="/subjects" className="btn-primary">
                    Start Practicing
                  </Link>
                  <Link to="/exam" className="btn-secondary">
                    Take an Exam
                  </Link>
                </div>
              ) : null
            }
          />
        ) : (
          entries.map((entry) => {
            const q = entry.question;
            const isUnderstood = !!entry.understoodAt;
            const isOpen = !!expanded[entry.questionId];

            return (
              <div key={entry.questionId} className="card p-5">
                {/* Header row */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isUnderstood
                          ? "bg-green-50 text-green-600"
                          : "bg-red-50 text-red-600"
                      }`}>
                      {isUnderstood ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <XCircle className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-ink-500">
                        {entry.subjectName} · {entry.topicName}
                      </div>
                      <div className="text-sm font-medium truncate">
                        {q.question}
                      </div>
                    </div>
                  </div>

                  {entry.count > 1 && (
                    <span className="badge bg-amber-50 text-amber-700">
                      Missed {entry.count}×
                    </span>
                  )}
                </div>

                {/* Toggle review */}
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleExpand(entry.questionId)}
                    className="btn-secondary text-sm">
                    <Eye className="h-4 w-4" />
                    {isOpen ? "Hide answer" : "Show answer"}
                  </button>

                  {!isUnderstood ? (
                    <button
                      type="button"
                      onClick={() => handleUnderstood(entry.questionId)}
                      className="btn-secondary text-sm">
                      <CheckCircle2 className="h-4 w-4" /> Mark as Understood
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUnmark(entry.questionId)}
                      className="btn-secondary text-sm">
                      <RotateCcw className="h-4 w-4" /> Mark as Active
                    </button>
                  )}

                  <Link
                    to={`/practice/topic/${entry.subjectId}/${entry.topicId}`}
                    className="btn-secondary text-sm">
                    <Layers className="h-4 w-4" /> Practice topic
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleRemove(entry.questionId)}
                    className="btn-ghost text-sm text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" /> Remove
                  </button>
                </div>

                {/* Expanded answer */}
                {isOpen && (
                  <div className="mt-5 pt-5 border-t border-ink-100 space-y-3">
                    <ul className="space-y-1.5 text-sm">
                      {q.options.map((opt, i) => {
                        const isCorrect = i === q.answer;
                        return (
                          <li
                            key={i}
                            className={`px-3 py-2 rounded-md border flex items-center gap-2 ${
                              isCorrect
                                ? "border-green-300 bg-green-50 text-green-900"
                                : "border-ink-200 bg-white text-ink-700"
                            }`}>
                            <span className="h-5 w-5 rounded-full border border-current/30 flex items-center justify-center text-xs font-semibold shrink-0">
                              {String.fromCharCode(65 + i)}
                            </span>
                            <span>{opt}</span>
                            {isCorrect && (
                              <CheckCircle2 className="h-4 w-4 text-green-600 ml-auto shrink-0" />
                            )}
                          </li>
                        );
                      })}
                    </ul>

                    <div className="text-sm bg-ink-100/60 border border-ink-200 rounded-md p-3">
                      <span className="font-semibold">Explanation: </span>
                      {q.explanation}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
