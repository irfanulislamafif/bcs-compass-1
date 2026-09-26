import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  BarChart3,
  Target,
  ListChecks,
  Clock,
  Trophy,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  History,
  Sparkles,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import StatCard from "../components/StatCard.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import SubjectAccuracyChart from "../components/charts/SubjectAccuracyChart.jsx";
import ExamScoreTrendChart from "../components/charts/ExamScoreTrendChart.jsx";
import ActivityChart from "../components/charts/ActivityChart.jsx";
import EmptyState from "../components/EmptyState.jsx";
import {
  getOverallStats,
  getSubjectStats,
  getTopicStats,
  getWeakTopics,
  getStrongTopics,
  getRecentActivity,
  getExamHistory,
  getMistakesSummary,
} from "../lib/progress.js";

function fmtDuration(ms) {
  const totalMin = Math.round(ms / 60000);
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function fmtDate(ts) {
  return new Date(ts).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function Progress() {
  const { t } = useTranslation();
  const [tab, setTab] = useState("overview");

  const overall = useMemo(getOverallStats, []);
  const subjectStats = useMemo(getSubjectStats, []);
  const topicStats = useMemo(getTopicStats, []);
  const weakTopics = useMemo(() => getWeakTopics(), []);
  const strongTopics = useMemo(() => getStrongTopics(), []);
  const activity = useMemo(() => getRecentActivity({ days: 14 }), []);
  const examHistory = useMemo(getExamHistory, []);
  const mistakes = useMemo(getMistakesSummary, []);

  const hasAnyData = overall.totalAttempts > 0 || overall.examsCompleted > 0;

  const TABS = [
    { id: "overview", label: t("progress.tabOverview") },
    { id: "subjects", label: t("progress.tabSubjects") },
    { id: "topics", label: t("progress.tabTopics") },
    { id: "exams", label: t("progress.tabExams") },
  ];

  return (
    <div className="container-page py-10 md:py-14">
      <Breadcrumbs
        items={[
          { label: t("nav.home"), to: "/" },
          { label: t("progress.title") },
        ]}
      />

      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t("progress.title")}
            </h1>
            <p className="text-sm text-ink-500">{t("progress.subtitle")}</p>
          </div>
        </div>
      </div>

      {!hasAnyData ? (
        <div className="mt-10">
          <EmptyState
            icon={TrendingUp}
            title={t("progress.noData")}
            description={t("progress.noDataSub")}
            action={
              <div className="flex flex-wrap gap-2 justify-center">
                <Link to="/subjects" className="btn-primary">
                  {t("progress.startPracticing")}{" "}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/exam" className="btn-secondary">
                  {t("progress.takeExam")}
                </Link>
              </div>
            }
          />
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Target}
              label={t("dashboard.overallAccuracy")}
              value={`${overall.accuracy}%`}
              sub={`${overall.totalCorrect} / ${overall.totalAttempts}`}
            />
            <StatCard
              icon={ListChecks}
              label={t("dashboard.questionsAttempted")}
              value={overall.totalAttempts}
              sub={t("dashboard.allTime")}
            />
            <StatCard
              icon={Trophy}
              label={t("dashboard.examsCompleted")}
              value={overall.examsCompleted}
              sub={
                examHistory[0]
                  ? `${t("dashboard.last")}: ${examHistory[0].accuracy}%`
                  : t("dashboard.noExams")
              }
            />
            <StatCard
              icon={Clock}
              label={t("dashboard.studyTime")}
              value={fmtDuration(overall.studyTimeMs)}
              sub={t("dashboard.estimated")}
            />
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
                </button>
              ))}
            </div>
          </div>

          {tab === "overview" && (
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <div className="card p-6">
                  <h2 className="font-semibold mb-4">
                    {t("progress.subjectAccuracy")}
                  </h2>
                  <SubjectAccuracyChart data={subjectStats} />
                </div>

                <div className="card p-6">
                  <h2 className="font-semibold mb-4">
                    {t("progress.examScoreTrend")}
                  </h2>
                  <ExamScoreTrendChart data={examHistory} />
                </div>

                <div className="card p-6">
                  <h2 className="font-semibold mb-4">
                    {t("progress.activityLast14")}
                  </h2>
                  <ActivityChart data={activity} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <h2 className="font-semibold text-sm">
                      {t("progress.weakTopics")}
                    </h2>
                  </div>
                  {weakTopics.length === 0 ? (
                    <p className="text-sm text-ink-500">
                      {t("progress.noWeak")}
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {weakTopics.slice(0, 5).map((tt) => (
                        <li key={`${tt.subjectId}-${tt.topicId}`}>
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">
                                {tt.topicName}
                              </div>
                              <div className="text-xs text-ink-500 truncate">
                                {tt.subjectName}
                              </div>
                            </div>
                            <span className="badge bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 shrink-0">
                              {tt.accuracy}%
                            </span>
                          </div>
                          <ProgressBar value={tt.accuracy} className="mt-2" />
                        </li>
                      ))}
                    </ul>
                  )}
                  {weakTopics.length > 0 && (
                    <Link
                      to="/practice"
                      className="btn-secondary mt-4 w-full text-sm">
                      {t("progress.practiceWeak")}
                    </Link>
                  )}
                </div>

                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-green-600" />
                    <h2 className="font-semibold text-sm">
                      {t("progress.strongTopics")}
                    </h2>
                  </div>
                  {strongTopics.length === 0 ? (
                    <p className="text-sm text-ink-500">
                      {t("progress.noStrong")}
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {strongTopics.slice(0, 5).map((tt) => (
                        <li
                          key={`${tt.subjectId}-${tt.topicId}`}
                          className="flex justify-between text-sm">
                          <span className="truncate">{tt.topicName}</span>
                          <span className="text-green-700 dark:text-green-400 font-medium">
                            {tt.accuracy}%
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-4 w-4 text-ink-500" />
                    <h2 className="font-semibold text-sm">
                      {t("progress.mistakeBook")}
                    </h2>
                  </div>
                  <div className="text-2xl font-bold">{mistakes.total}</div>
                  <p className="text-xs text-ink-500 mt-1">
                    {t("progress.questionsRecorded")}
                  </p>
                  <Link
                    to="/mistakes"
                    className="btn-secondary mt-4 w-full text-sm">
                    {t("progress.openMistakeBook")}
                  </Link>
                </div>
              </div>
            </div>
          )}

          {tab === "subjects" && (
            <div className="mt-8 space-y-4">
              {subjectStats.map((s) => (
                <div key={s.subjectId} className="card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-xs text-ink-500">
                        {s.total} {t("progress.attempted")} · {s.correct}{" "}
                        {t("progress.correctCount")}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`badge ${
                          s.accuracy >= 70
                            ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400"
                            : s.accuracy >= 55
                              ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
                              : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400"
                        }`}>
                        {s.accuracy}% {t("dashboard.accuracy")}
                      </span>
                      <Link
                        to={`/subjects/${s.subjectId}`}
                        className="btn-secondary text-sm">
                        {t("dashboard.viewAll")}{" "}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                  <ProgressBar value={s.accuracy} className="mt-3" />
                </div>
              ))}
            </div>
          )}

          {tab === "topics" && (
            <div className="mt-8">
              {topicStats.length === 0 ? (
                <EmptyState
                  icon={Target}
                  title={t("progress.noTopicData")}
                  description={t("progress.noTopicDataSub")}
                />
              ) : (
                <div className="card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-ink-100/60 dark:bg-ink-800/60 text-ink-500 text-xs uppercase tracking-wide">
                        <tr>
                          <th className="text-left px-4 py-3">
                            {t("progress.topic")}
                          </th>
                          <th className="text-left px-4 py-3 hidden md:table-cell">
                            {t("progress.subject")}
                          </th>
                          <th className="text-right px-4 py-3">
                            {t("progress.attemptedCol")}
                          </th>
                          <th className="text-right px-4 py-3">
                            {t("progress.accuracyCol")}
                          </th>
                          <th className="px-4 py-3"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {topicStats
                          .slice()
                          .sort((a, b) => a.accuracy - b.accuracy)
                          .map((tt) => (
                            <tr
                              key={`${tt.subjectId}-${tt.topicId}`}
                              className="border-t border-ink-100 dark:border-ink-800">
                              <td className="px-4 py-3 font-medium">
                                {tt.topicName}
                              </td>
                              <td className="px-4 py-3 text-ink-500 hidden md:table-cell">
                                {tt.subjectName}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {tt.total}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span
                                  className={`badge ${
                                    tt.accuracy >= 70
                                      ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400"
                                      : tt.accuracy >= 55
                                        ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
                                        : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400"
                                  }`}>
                                  {tt.accuracy}%
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                <Link
                                  to={`/practice/topic/${tt.subjectId}/${tt.topicId}`}
                                  className="text-brand-600 text-sm hover:underline">
                                  {t("progress.practice")}
                                </Link>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {tab === "exams" && (
            <div className="mt-8">
              {examHistory.length === 0 ? (
                <EmptyState
                  icon={History}
                  title={t("progress.noExams")}
                  description={t("progress.noExamsSub")}
                  action={
                    <Link to="/exam" className="btn-primary">
                      {t("progress.takeExam")}
                    </Link>
                  }
                />
              ) : (
                <>
                  <div className="card p-6 mb-6">
                    <h2 className="font-semibold mb-4">
                      {t("progress.examScoreTrend")}
                    </h2>
                    <ExamScoreTrendChart data={examHistory} />
                  </div>

                  <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead className="bg-ink-100/60 dark:bg-ink-800/60 text-ink-500 text-xs uppercase tracking-wide">
                          <tr>
                            <th className="text-left px-4 py-3">
                              {t("progress.date")}
                            </th>
                            <th className="text-left px-4 py-3">
                              {t("progress.exam")}
                            </th>
                            <th className="text-right px-4 py-3">
                              {t("progress.scoreCol")}
                            </th>
                            <th className="text-right px-4 py-3">
                              {t("progress.accuracyCol")}
                            </th>
                            <th className="text-right px-4 py-3 hidden md:table-cell">
                              {t("progress.time")}
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {examHistory.map((e) => (
                            <tr
                              key={e.id}
                              className="border-t border-ink-100 dark:border-ink-800">
                              <td className="px-4 py-3 text-ink-500">
                                {fmtDate(e.completedAt)}
                              </td>
                              <td className="px-4 py-3 font-medium">
                                {e.title}
                                {e.autoSubmitted && (
                                  <span className="ml-2 badge bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                                    {t("progress.auto")}
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3 text-right">
                                {e.score}/{e.total}
                              </td>
                              <td className="px-4 py-3 text-right">
                                <span
                                  className={`badge ${
                                    e.accuracy >= 70
                                      ? "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400"
                                      : e.accuracy >= 55
                                        ? "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
                                        : "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400"
                                  }`}>
                                  {e.accuracy}%
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right text-ink-500 hidden md:table-cell">
                                {fmtDuration(e.timeSpentMs)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
