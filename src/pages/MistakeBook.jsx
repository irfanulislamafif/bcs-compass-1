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
import { useTranslation } from "react-i18next";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import EmptyState from "../components/EmptyState.jsx";
import { demoSubjects } from "../data/demoData.jsx";
import { getMistakeEntries, getMistakeCounts } from "../lib/progress.js";
import {
  removeMistake,
  markMistakeUnderstood,
  unmarkMistakeUnderstood,
} from "../lib/sessionStore.js";

export default function MistakeBook() {
  const { t } = useTranslation();
  const [status, setStatus] = useState("active");
  const [subjectId, setSubjectId] = useState("");
  const [topicId, setTopicId] = useState("");
  const [expanded, setExpanded] = useState({});
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
    if (!window.confirm(t("mistakes.removeConfirm"))) return;
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

  const STATUS_TABS = [
    { id: "active", label: t("mistakes.tabActive") },
    { id: "understood", label: t("mistakes.tabUnderstood") },
    { id: "all", label: t("mistakes.tabAll") },
  ];

  return (
    <div className="container-page py-10 md:py-14">
      <Breadcrumbs
        items={[
          { label: t("nav.home"), to: "/" },
          { label: t("mistakes.title") },
        ]}
      />

      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-red-50 dark:bg-red-950/40 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t("mistakes.title")}
            </h1>
            <p className="text-sm text-ink-500">{t("mistakes.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="text-xs text-ink-500">
            {t("mistakes.totalMistakes")}
          </div>
          <div className="mt-2 text-2xl font-bold">{counts.total}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-ink-500 flex items-center gap-1">
            <XCircle className="h-3 w-3 text-red-500" /> {t("mistakes.active")}
          </div>
          <div className="mt-2 text-2xl font-bold text-red-600 dark:text-red-400">
            {counts.active}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-ink-500 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-600" />{" "}
            {t("mistakes.understood")}
          </div>
          <div className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
            {counts.understood}
          </div>
        </div>
      </div>

      {counts.active > 0 && (
        <div className="mt-6 card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center shrink-0">
              <RotateCcw className="h-5 w-5 text-brand-600 dark:text-brand-400" />
            </div>
            <div>
              <h3 className="font-semibold">
                {t("mistakes.practiceMyMistakes")}
              </h3>
              <p className="text-sm text-ink-500 mt-0.5">
                {t("mistakes.practiceMyMistakesDesc", {
                  count: counts.active,
                })}
              </p>
            </div>
          </div>
          <Link
            to="/practice?mode=mistakes"
            className="btn-primary whitespace-nowrap">
            {t("mistakes.practiceNow")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      <div className="mt-10 border-b border-ink-100 dark:border-ink-800">
        <div className="flex gap-1 overflow-x-auto">
          {STATUS_TABS.map((tb) => (
            <button
              key={tb.id}
              type="button"
              onClick={() => setStatus(tb.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                status === tb.id
                  ? "border-brand-600 text-brand-700 dark:text-brand-300"
                  : "border-transparent text-ink-500 hover:text-ink-900 dark:hover:text-white"
              }`}>
              {tb.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-sm text-ink-500">
          <Filter className="h-4 w-4" /> {t("questionBank.filter")}
        </div>

        <select
          value={subjectId}
          onChange={(e) => {
            setSubjectId(e.target.value);
            setTopicId("");
          }}
          className="input !w-auto !py-2 text-sm">
          <option value="">{t("mistakes.allSubjects")}</option>
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
            <option value="">{t("mistakes.allTopics")}</option>
            {subject.topics.map((tt) => (
              <option key={tt.id} value={tt.id}>
                {tt.name}
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
            {t("mistakes.clearFilters")}
          </button>
        )}
      </div>

      <div className="mt-6 space-y-4">
        {entries.length === 0 ? (
          <EmptyState
            icon={status === "understood" ? Trophy : BookMarked}
            title={
              status === "understood"
                ? t("mistakes.noUnderstood")
                : status === "all"
                  ? t("mistakes.noMistakes")
                  : t("mistakes.noActive")
            }
            description={
              status === "active"
                ? t("mistakes.noActiveSub")
                : t("mistakes.noUnderstoodSub")
            }
            action={
              status === "active" ? (
                <div className="flex flex-wrap gap-2 justify-center">
                  <Link to="/subjects" className="btn-primary">
                    {t("mistakes.startPracticing")}
                  </Link>
                  <Link to="/exam" className="btn-secondary">
                    {t("mistakes.takeAnExam")}
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
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                        isUnderstood
                          ? "bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400"
                          : "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400"
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
                    <span className="badge bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                      {t("mistakes.missedTimes", { count: entry.count })}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleExpand(entry.questionId)}
                    className="btn-secondary text-sm">
                    <Eye className="h-4 w-4" />
                    {isOpen
                      ? t("questionBank.hideAnswer")
                      : t("questionBank.showAnswer")}
                  </button>

                  {!isUnderstood ? (
                    <button
                      type="button"
                      onClick={() => handleUnderstood(entry.questionId)}
                      className="btn-secondary text-sm">
                      <CheckCircle2 className="h-4 w-4" />{" "}
                      {t("mistakes.markUnderstood")}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleUnmark(entry.questionId)}
                      className="btn-secondary text-sm">
                      <RotateCcw className="h-4 w-4" />{" "}
                      {t("mistakes.markActive")}
                    </button>
                  )}

                  <Link
                    to={`/practice/topic/${entry.subjectId}/${entry.topicId}`}
                    className="btn-secondary text-sm">
                    <Layers className="h-4 w-4" /> {t("mistakes.practiceTopic")}
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleRemove(entry.questionId)}
                    className="btn-ghost text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40">
                    <Trash2 className="h-4 w-4" /> {t("mistakes.remove")}
                  </button>
                </div>

                {isOpen && (
                  <div className="mt-5 pt-5 border-t border-ink-100 dark:border-ink-800 space-y-3">
                    <ul className="space-y-1.5 text-sm">
                      {q.options.map((opt, i) => {
                        const isCorrect = i === q.answer;
                        return (
                          <li
                            key={i}
                            className={`px-3 py-2 rounded-md border flex items-center gap-2 ${
                              isCorrect
                                ? "border-green-300 bg-green-50 dark:bg-green-950/40 text-green-900 dark:text-green-300"
                                : "border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-700 dark:text-ink-300"
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

                    <div className="text-sm bg-ink-100/60 dark:bg-ink-800/60 border border-ink-200 dark:border-ink-700 rounded-md p-3">
                      <span className="font-semibold">
                        {t("mistakes.explanation")}:{" "}
                      </span>
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
