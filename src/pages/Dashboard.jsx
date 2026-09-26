import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Target,
  ListChecks,
  AlertTriangle,
  Trophy,
  Clock,
  CalendarClock,
  ArrowRight,
  BookOpen,
  Brain,
  KeyRound,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext.jsx";
import ProgressBar from "../components/ProgressBar.jsx";
import StatCard from "../components/StatCard.jsx";
import {
  getOverallStats,
  getSubjectStats,
  getWeakTopics,
  getExamHistory,
  getMistakeCounts,
} from "../lib/progress.js";
import { getDueToday, getRevisionCounts } from "../lib/revisionStore.js";

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useTranslation();

  const overall = useMemo(getOverallStats, []);
  const subjects = useMemo(getSubjectStats, []);
  const weak = useMemo(() => getWeakTopics({ minAttempts: 2 }), []);
  const exams = useMemo(getExamHistory, []);
  const dueRevisions = useMemo(getDueToday, []);
  const revisionCounts = useMemo(getRevisionCounts, []);
  const mistakeCounts = useMemo(getMistakeCounts, []);

  const recentExams = exams.slice(0, 4);
  const topSubjects = subjects.filter((s) => s.total > 0).slice(0, 5);
  const firstName = (user?.name || "aspirant").split(" ")[0];

  const hour = new Date().getHours();
  const greeting =
    hour < 12
      ? t("dashboard.greeting_morning")
      : hour < 18
        ? t("dashboard.greeting_afternoon")
        : t("dashboard.greeting_evening");

  return (
    <div className="container-page py-10 md:py-14">
      <div className="max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {greeting}, {firstName}!
        </h1>
        <p className="mt-2 text-ink-500">{t("dashboard.ready")}</p>
      </div>

      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Link
          to="/subjects"
          className="card p-4 flex items-center gap-3 card-hover">
          <div className="h-10 w-10 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm">
              {t("dashboard.startPractice")}
            </div>
            <div className="text-xs text-ink-500">
              {t("dashboard.browseSubjects")}
            </div>
          </div>
        </Link>

        <Link
          to="/exam"
          className="card p-4 flex items-center gap-3 card-hover">
          <div className="h-10 w-10 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center shrink-0">
            <Trophy className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm">
              {t("dashboard.takeExam")}
            </div>
            <div className="text-xs text-ink-500">
              {t("dashboard.timedTest")}
            </div>
          </div>
        </Link>

        <Link
          to="/mistakes"
          className="card p-4 flex items-center gap-3 card-hover">
          <div className="h-10 w-10 rounded-lg bg-red-50 dark:bg-red-950/40 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm">
              {t("dashboard.reviewMistakes")}
            </div>
            <div className="text-xs text-ink-500">
              {mistakeCounts.active} {t("dashboard.active")}
            </div>
          </div>
        </Link>

        <Link
          to="/ai-lab"
          className="card p-4 flex items-center gap-3 card-hover">
          <div className="h-10 w-10 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center shrink-0">
            <Brain className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm">
              {t("dashboard.aiStudyLab")}
            </div>
            <div className="text-xs text-ink-500">
              {t("dashboard.generateFromNotes")}
            </div>
          </div>
        </Link>

        <Link
          to="/settings"
          className="card p-4 flex items-center gap-3 card-hover">
          <div className="h-10 w-10 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center shrink-0">
            <KeyRound className="h-5 w-5 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm">
              {t("dashboard.settings")}
            </div>
            <div className="text-xs text-ink-500">
              {t("dashboard.passwordAccount")}
            </div>
          </div>
        </Link>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">
          {t("dashboard.todaysTarget")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <ListChecks className="h-4 w-4 text-brand-600" />
              <span className="text-sm font-medium">
                {t("dashboard.practice")}
              </span>
            </div>
            <p className="text-sm text-ink-500">
              {t("dashboard.practiceGoal")}
            </p>
            <Link to="/subjects" className="btn-secondary mt-4 w-full text-sm">
              {t("dashboard.startPractice")}
            </Link>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <CalendarClock className="h-4 w-4 text-brand-600" />
              <span className="text-sm font-medium">
                {t("dashboard.revision")}
              </span>
            </div>
            <p className="text-sm text-ink-500">
              {revisionCounts.due > 0
                ? t("dashboard.revisionDue", { count: revisionCounts.due })
                : t("dashboard.revisionNone")}
            </p>
            <Link to="/revision" className="btn-secondary mt-4 w-full text-sm">
              {t("dashboard.openRevision")}
            </Link>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-brand-600" />
              <span className="text-sm font-medium">
                {t("dashboard.weakAreas")}
              </span>
            </div>
            <p className="text-sm text-ink-500">
              {weak.length > 0
                ? t("dashboard.weakDetected", { count: weak.length })
                : t("dashboard.noWeak")}
            </p>
            <Link to="/progress" className="btn-secondary mt-4 w-full text-sm">
              {t("dashboard.viewProgress")}
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">
          {t("dashboard.overallProgress")}
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              recentExams[0]
                ? `${t("dashboard.last")}: ${recentExams[0].accuracy}%`
                : t("dashboard.noExams")
            }
          />
          <StatCard
            icon={Clock}
            label={t("dashboard.studyTime")}
            value={`${Math.round(overall.studyTimeMs / 60000)}${t("examBuilder.mins")}`}
            sub={t("dashboard.estimated")}
          />
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">{t("dashboard.subjectProgress")}</h2>
            <Link
              to="/subjects"
              className="text-sm text-brand-600 hover:underline inline-flex items-center gap-1">
              {t("dashboard.allSubjects")}{" "}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {topSubjects.length === 0 ? (
            <p className="text-sm text-ink-500">
              {t("dashboard.practicePrompt")}
            </p>
          ) : (
            <ul className="space-y-4">
              {topSubjects.map((s) => (
                <li key={s.subjectId}>
                  <div className="flex items-center justify-between text-sm mb-1.5">
                    <Link
                      to={`/subjects/${s.subjectId}`}
                      className="font-medium hover:text-brand-600">
                      {s.name}
                    </Link>
                    <span className="text-ink-500">
                      {s.correct}/{s.total} · {s.accuracy}%
                    </span>
                  </div>
                  <ProgressBar value={s.accuracy} />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h2 className="font-semibold text-sm">
                {t("dashboard.weakAreas")}
              </h2>
            </div>
            {weak.length === 0 ? (
              <p className="text-sm text-ink-500">{t("dashboard.noWeak")}</p>
            ) : (
              <ul className="space-y-3">
                {weak.slice(0, 4).map((tt) => (
                  <li key={`${tt.subjectId}-${tt.topicId}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
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
                    <ProgressBar value={tt.accuracy} className="mt-1.5" />
                    <Link
                      to={`/practice/topic/${tt.subjectId}/${tt.topicId}`}
                      className="text-xs text-brand-600 hover:underline inline-flex items-center gap-1 mt-2">
                      {t("dashboard.practiceNow")}{" "}
                      <ArrowRight className="h-3 w-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarClock className="h-4 w-4 text-brand-600" />
              <h2 className="font-semibold text-sm">
                {t("dashboard.dueRevision")}
              </h2>
            </div>
            {dueRevisions.length === 0 ? (
              <p className="text-sm text-ink-500">
                {t("dashboard.noRevision")}
              </p>
            ) : (
              <ul className="space-y-2">
                {dueRevisions.slice(0, 4).map((r) => (
                  <li key={r.id} className="flex justify-between text-sm gap-2">
                    <span className="truncate">{r.topicName}</span>
                    <span className="text-brand-600 shrink-0">
                      Day {r.intervalDays}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <Link to="/revision" className="btn-secondary mt-4 w-full text-sm">
              {t("dashboard.openRevision")}
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            {t("dashboard.recentExams")}
          </h2>
          <Link
            to="/progress"
            className="text-sm text-brand-600 hover:underline inline-flex items-center gap-1">
            {t("dashboard.viewAll")} <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentExams.length === 0 ? (
          <div className="card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium">{t("dashboard.noExamsYet")}</p>
              <p className="text-sm text-ink-500 mt-1">
                {t("dashboard.noExamsSub")}
              </p>
            </div>
            <Link to="/exam" className="btn-primary">
              {t("dashboard.takeExam")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-ink-100/60 dark:bg-ink-800/60 text-ink-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">{t("dashboard.exam")}</th>
                  <th className="text-right px-4 py-3">
                    {t("dashboard.score")}
                  </th>
                  <th className="text-right px-4 py-3">
                    {t("dashboard.accuracy")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {recentExams.map((e) => (
                  <tr
                    key={e.id}
                    className="border-t border-ink-100 dark:border-ink-800">
                    <td className="px-4 py-3 font-medium">{e.title}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
