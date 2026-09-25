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

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "subjects", label: "Subjects" },
  { id: "topics", label: "Topics" },
  { id: "exams", label: "Exams" },
];

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

  return (
    <div className="container-page py-10 md:py-14">
      <Breadcrumbs
        items={[{ label: "Home", to: "/" }, { label: "Progress" }]}
      />

      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-brand-50 flex items-center justify-center">
            <BarChart3 className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Progress
            </h1>
            <p className="text-sm text-ink-500">
              See how your accuracy, weak topics, and exam performance are
              trending.
            </p>
          </div>
        </div>
      </div>

      {!hasAnyData ? (
        <div className="mt-10">
          <EmptyState
            icon={TrendingUp}
            title="No progress data yet"
            description="Answer some practice questions or take an exam to start building your progress dashboard."
            action={
              <div className="flex flex-wrap gap-2 justify-center">
                <Link to="/subjects" className="btn-primary">
                  Start Practicing <ArrowRight className="h-4 w-4" />
                </Link>
                <Link to="/exam" className="btn-secondary">
                  Take an Exam
                </Link>
              </div>
            }
          />
        </div>
      ) : (
        <>
          {/* Top stats always visible */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Target}
              label="Overall Accuracy"
              value={`${overall.accuracy}%`}
              sub={`${overall.totalCorrect} of ${overall.totalAttempts} correct`}
            />
            <StatCard
              icon={ListChecks}
              label="Questions Attempted"
              value={overall.totalAttempts}
              sub="Across practice and exams"
            />
            <StatCard
              icon={Trophy}
              label="Exams Completed"
              value={overall.examsCompleted}
              sub={
                examHistory[0]
                  ? `Last: ${examHistory[0].accuracy}%`
                  : "No exams yet"
              }
            />
            <StatCard
              icon={Clock}
              label="Study Time"
              value={fmtDuration(overall.studyTimeMs)}
              sub="Estimated from practice & exams"
            />
          </div>

          {/* Tabs */}
          <div className="mt-10 border-b border-ink-100">
            <div className="flex gap-1 overflow-x-auto">
              {TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    tab === t.id
                      ? "border-brand-600 text-brand-700"
                      : "border-transparent text-ink-500 hover:text-ink-900"
                  }`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Overview tab */}
          {tab === "overview" && (
            <div className="mt-8 grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <div className="card p-6">
                  <h2 className="font-semibold mb-4">Subject Accuracy</h2>
                  <SubjectAccuracyChart data={subjectStats} />
                </div>

                <div className="card p-6">
                  <h2 className="font-semibold mb-4">Exam Score Trend</h2>
                  <ExamScoreTrendChart data={examHistory} />
                </div>

                <div className="card p-6">
                  <h2 className="font-semibold mb-4">
                    Activity — last 14 days
                  </h2>
                  <ActivityChart data={activity} />
                </div>
              </div>

              <div className="space-y-6">
                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <h2 className="font-semibold text-sm">Weak Topics</h2>
                  </div>
                  {weakTopics.length === 0 ? (
                    <p className="text-sm text-ink-500">
                      No weak topics detected yet. Keep practicing to see them
                      here.
                    </p>
                  ) : (
                    <ul className="space-y-3">
                      {weakTopics.slice(0, 5).map((t) => (
                        <li key={`${t.subjectId}-${t.topicId}`}>
                          <div className="flex justify-between items-start gap-2">
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">
                                {t.topicName}
                              </div>
                              <div className="text-xs text-ink-500 truncate">
                                {t.subjectName}
                              </div>
                            </div>
                            <span className="badge bg-red-50 text-red-700 shrink-0">
                              {t.accuracy}%
                            </span>
                          </div>
                          <ProgressBar value={t.accuracy} className="mt-2" />
                        </li>
                      ))}
                    </ul>
                  )}
                  {weakTopics.length > 0 && (
                    <Link
                      to="/practice"
                      className="btn-secondary mt-4 w-full text-sm">
                      Practice Weak Topics
                    </Link>
                  )}
                </div>

                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="h-4 w-4 text-green-600" />
                    <h2 className="font-semibold text-sm">Strong Topics</h2>
                  </div>
                  {strongTopics.length === 0 ? (
                    <p className="text-sm text-ink-500">
                      Topics where you score above 75% will appear here.
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {strongTopics.slice(0, 5).map((t) => (
                        <li
                          key={`${t.subjectId}-${t.topicId}`}
                          className="flex justify-between text-sm">
                          <span className="truncate">{t.topicName}</span>
                          <span className="text-green-700 font-medium">
                            {t.accuracy}%
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="card p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="h-4 w-4 text-ink-500" />
                    <h2 className="font-semibold text-sm">Mistake Book</h2>
                  </div>
                  <div className="text-2xl font-bold">{mistakes.total}</div>
                  <p className="text-xs text-ink-500 mt-1">
                    Questions recorded for review
                  </p>
                  <div className="mt-4 space-y-2">
                    <Link
                      to="/mistakes"
                      className="btn-secondary w-full text-sm">
                      Open Mistake Book
                    </Link>
                    {mistakes.total > 0 && (
                      <Link
                        to="/practice?mode=mistakes"
                        className="btn-primary w-full text-sm">
                        Practice Mistakes
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subjects tab */}
          {tab === "subjects" && (
            <div className="mt-8 space-y-4">
              {subjectStats.map((s) => (
                <div key={s.subjectId} className="card p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <div className="font-semibold">{s.name}</div>
                      <div className="text-xs text-ink-500">
                        {s.total} attempted · {s.correct} correct
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`badge ${
                          s.accuracy >= 70
                            ? "bg-green-50 text-green-700"
                            : s.accuracy >= 55
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-700"
                        }`}>
                        {s.accuracy}% accuracy
                      </span>
                      <Link
                        to={`/subjects/${s.subjectId}`}
                        className="btn-secondary text-sm">
                        View <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                  <ProgressBar value={s.accuracy} className="mt-3" />
                </div>
              ))}
            </div>
          )}

          {/* Topics tab */}
          {tab === "topics" && (
            <div className="mt-8">
              {topicStats.length === 0 ? (
                <EmptyState
                  icon={Target}
                  title="No topic data yet"
                  description="Practice topics from any subject to see topic-level progress here."
                />
              ) : (
                <div className="card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-ink-100/60 text-ink-500 text-xs uppercase tracking-wide">
                      <tr>
                        <th className="text-left px-4 py-3">Topic</th>
                        <th className="text-left px-4 py-3 hidden md:table-cell">
                          Subject
                        </th>
                        <th className="text-right px-4 py-3">Attempted</th>
                        <th className="text-right px-4 py-3">Accuracy</th>
                        <th className="px-4 py-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {topicStats
                        .slice()
                        .sort((a, b) => a.accuracy - b.accuracy)
                        .map((t) => (
                          <tr
                            key={`${t.subjectId}-${t.topicId}`}
                            className="border-t border-ink-100">
                            <td className="px-4 py-3 font-medium">
                              {t.topicName}
                            </td>
                            <td className="px-4 py-3 text-ink-500 hidden md:table-cell">
                              {t.subjectName}
                            </td>
                            <td className="px-4 py-3 text-right">{t.total}</td>
                            <td className="px-4 py-3 text-right">
                              <span
                                className={`badge ${
                                  t.accuracy >= 70
                                    ? "bg-green-50 text-green-700"
                                    : t.accuracy >= 55
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-red-50 text-red-700"
                                }`}>
                                {t.accuracy}%
                              </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                              <Link
                                to={`/practice/topic/${t.subjectId}/${t.topicId}`}
                                className="text-brand-600 text-sm hover:underline">
                                Practice
                              </Link>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Exams tab */}
          {tab === "exams" && (
            <div className="mt-8">
              {examHistory.length === 0 ? (
                <EmptyState
                  icon={History}
                  title="No exams yet"
                  description="Take your first exam to see your history and score trend here."
                  action={
                    <Link to="/exam" className="btn-primary">
                      Take an Exam
                    </Link>
                  }
                />
              ) : (
                <>
                  <div className="card p-6 mb-6">
                    <h2 className="font-semibold mb-4">Score Trend</h2>
                    <ExamScoreTrendChart data={examHistory} />
                  </div>

                  <div className="card overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-ink-100/60 text-ink-500 text-xs uppercase tracking-wide">
                        <tr>
                          <th className="text-left px-4 py-3">Date</th>
                          <th className="text-left px-4 py-3">Exam</th>
                          <th className="text-right px-4 py-3">Score</th>
                          <th className="text-right px-4 py-3">Accuracy</th>
                          <th className="text-right px-4 py-3 hidden md:table-cell">
                            Time
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {examHistory.map((e) => (
                          <tr key={e.id} className="border-t border-ink-100">
                            <td className="px-4 py-3 text-ink-500">
                              {fmtDate(e.completedAt)}
                            </td>
                            <td className="px-4 py-3 font-medium">
                              {e.title}
                              {e.autoSubmitted && (
                                <span className="ml-2 badge bg-amber-50 text-amber-700">
                                  Auto
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
                                    ? "bg-green-50 text-green-700"
                                    : e.accuracy >= 55
                                      ? "bg-amber-50 text-amber-700"
                                      : "bg-red-50 text-red-700"
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
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
