import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarClock,
  CheckCircle2,
  Clock,
  RotateCcw,
  Trash2,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import EmptyState from "../components/EmptyState.jsx";
import {
  getDueToday,
  getUpcoming,
  getCompletedRevisions,
  getRevisionCounts,
  markRevisionComplete,
  unmarkRevision,
  rescheduleRevision,
  removeRevision,
} from "../lib/revisionStore.js";

function daysBetween(a, b) {
  return Math.round((a - b) / (24 * 60 * 60 * 1000));
}

export default function Revision() {
  const { t } = useTranslation();
  const [tab, setTab] = useState("due");
  const [refreshKey, setRefreshKey] = useState(0);

  const due = useMemo(getDueToday, [refreshKey]);
  const upcoming = useMemo(getUpcoming, [refreshKey]);
  const completed = useMemo(getCompletedRevisions, [refreshKey]);
  const counts = useMemo(getRevisionCounts, [refreshKey]);

  function refresh() {
    setRefreshKey((k) => k + 1);
  }

  function handleComplete(id) {
    markRevisionComplete(id);
    refresh();
  }
  function handleUnmark(id) {
    unmarkRevision(id);
    refresh();
  }
  function handleReschedule(id, days) {
    rescheduleRevision(id, days);
    refresh();
  }
  function handleRemove(id) {
    if (!window.confirm(t("revision.removeConfirm"))) return;
    removeRevision(id);
    refresh();
  }

  function fmtDate(ts) {
    const d = new Date(ts);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const sameDay = (a, b) => a.toDateString() === b.toDateString();

    if (sameDay(d, today)) return t("revision.today");
    if (sameDay(d, tomorrow)) return t("revision.tomorrow");
    return d.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: d.getFullYear() === today.getFullYear() ? undefined : "numeric",
    });
  }

  const list = tab === "due" ? due : tab === "upcoming" ? upcoming : completed;

  const TABS = [
    { id: "due", label: t("revision.tabDue") },
    { id: "upcoming", label: t("revision.tabUpcoming") },
    { id: "completed", label: t("revision.tabCompleted") },
  ];

  return (
    <div className="container-page py-10 md:py-14">
      <Breadcrumbs
        items={[
          { label: t("nav.home"), to: "/" },
          { label: t("revision.title") },
        ]}
      />

      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center">
            <CalendarClock className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t("revision.title")}
            </h1>
            <p className="text-sm text-ink-500">{t("revision.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="text-xs text-ink-500 flex items-center gap-1">
            <Clock className="h-3 w-3" /> {t("revision.dueToday")}
          </div>
          <div className="mt-2 text-2xl font-bold text-brand-600 dark:text-brand-400">
            {counts.due}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-ink-500 flex items-center gap-1">
            <CalendarClock className="h-3 w-3" /> {t("revision.upcoming")}
          </div>
          <div className="mt-2 text-2xl font-bold">{counts.upcoming}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-ink-500 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-600" />{" "}
            {t("revision.completed")}
          </div>
          <div className="mt-2 text-2xl font-bold text-green-600 dark:text-green-400">
            {counts.completed}
          </div>
        </div>
      </div>

      <div className="mt-10 border-b border-ink-100 dark:border-ink-800">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tbb) => (
            <button
              key={tbb.id}
              type="button"
              onClick={() => setTab(tbb.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                tab === tbb.id
                  ? "border-brand-600 text-brand-700 dark:text-brand-300"
                  : "border-transparent text-ink-500 hover:text-ink-900 dark:hover:text-white"
              }`}>
              {tbb.label}
              {tbb.id === "due" && counts.due > 0 && (
                <span className="ml-2 badge bg-brand-600 text-white">
                  {counts.due}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {list.length === 0 ? (
          <EmptyState
            icon={
              tab === "completed"
                ? CheckCircle2
                : tab === "upcoming"
                  ? CalendarClock
                  : Clock
            }
            title={
              tab === "due"
                ? t("revision.nothingDue")
                : tab === "upcoming"
                  ? t("revision.noUpcoming")
                  : t("revision.noCompleted")
            }
            description={
              tab === "due"
                ? t("revision.nothingDueSub")
                : tab === "upcoming"
                  ? t("revision.noUpcomingSub")
                  : t("revision.noCompletedSub")
            }
            action={
              tab === "due" ? (
                <div className="flex flex-wrap gap-2 justify-center">
                  <Link to="/subjects" className="btn-primary">
                    {t("revision.practiceTopics")}
                  </Link>
                  <Link to="/exam" className="btn-secondary">
                    {t("revision.takeExam")}
                  </Link>
                </div>
              ) : null
            }
          />
        ) : (
          list.map((item) => {
            const dueIn = daysBetween(item.dueAt, Date.now());
            const isOverdue = tab === "due" && dueIn < 0;

            return (
              <div key={item.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                        tab === "completed"
                          ? "bg-green-50 dark:bg-green-950/40 text-green-600 dark:text-green-400"
                          : isOverdue
                            ? "bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400"
                            : "bg-brand-50 dark:bg-brand-950/40 text-brand-600 dark:text-brand-400"
                      }`}>
                      {tab === "completed" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Clock className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-ink-500">
                        {t("revision.subjectDay", {
                          subject: item.subjectName,
                          day: item.intervalDays,
                        })}
                      </div>
                      <div className="font-medium truncate">
                        {item.topicName}
                      </div>
                      <div className="text-xs text-ink-500 mt-0.5">
                        {tab === "completed"
                          ? t("revision.completedLabel", {
                              date: fmtDate(item.completedAt),
                            })
                          : t("revision.due", { date: fmtDate(item.dueAt) }) +
                            (isOverdue
                              ? t("revision.overdue", {
                                  days: Math.abs(dueIn),
                                })
                              : "")}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/practice/topic/${item.subjectId}/${item.topicId}`}
                      className="btn-primary text-sm">
                      <BookOpen className="h-3.5 w-3.5" />{" "}
                      {t("revision.practice")}
                    </Link>

                    {tab === "due" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleComplete(item.id)}
                          className="btn-secondary text-sm">
                          <CheckCircle2 className="h-3.5 w-3.5" />{" "}
                          {t("revision.complete")}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReschedule(item.id, 1)}
                          className="btn-secondary text-sm">
                          <RotateCcw className="h-3.5 w-3.5" />{" "}
                          {t("revision.plusOneDay")}
                        </button>
                      </>
                    )}

                    {tab === "upcoming" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleComplete(item.id)}
                          className="btn-secondary text-sm">
                          {t("revision.completeNow")}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReschedule(item.id, 1)}
                          className="btn-secondary text-sm">
                          <RotateCcw className="h-3.5 w-3.5" />{" "}
                          {t("revision.plusOneDay")}
                        </button>
                      </>
                    )}

                    {tab === "completed" && (
                      <button
                        type="button"
                        onClick={() => handleUnmark(item.id)}
                        className="btn-secondary text-sm">
                        <RotateCcw className="h-3.5 w-3.5" />{" "}
                        {t("revision.unmark")}
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="btn-ghost text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="mt-12 card p-6 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold">{t("revision.adaptiveTitle")}</h3>
          <p className="mt-1.5 text-sm text-ink-500">
            {t("revision.adaptiveText")}
          </p>
        </div>
      </div>
    </div>
  );
}
