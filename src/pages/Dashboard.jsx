import { useMemo } from "react";
import { Link } from "react-router-dom";
import {
  Sparkles,
  Target,
  ListChecks,
  AlertTriangle,
  Trophy,
  Clock,
  CalendarClock,
  ArrowRight,
  BookOpen,
  Brain,
} from "lucide-react";
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

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default function Dashboard() {
  const { user } = useAuth();

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

  return (
    <div className="container-page py-10 md:py-14">
      {/* Welcome */}
      <div className="max-w-2xl">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          {greeting()}, {firstName}!
        </h1>
        <p className="mt-2 text-ink-500">Ready for today&apos;s preparation?</p>
      </div>

      {/* Quick actions */}
      <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Link
          to="/subjects"
          className="card p-4 flex items-center gap-3 hover:shadow-card-hover transition-shadow">
          <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
            <BookOpen className="h-5 w-5 text-brand-600" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm">Start Practice</div>
            <div className="text-xs text-ink-500">
              Browse subjects &amp; topics
            </div>
          </div>
        </Link>

        <Link
          to="/exam"
          className="card p-4 flex items-center gap-3 hover:shadow-card-hover transition-shadow">
          <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
            <Trophy className="h-5 w-5 text-brand-600" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm">Take Exam</div>
            <div className="text-xs text-ink-500">Timed, exam-style test</div>
          </div>
        </Link>

        <Link
          to="/mistakes"
          className="card p-4 flex items-center gap-3 hover:shadow-card-hover transition-shadow">
          <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm">Review Mistakes</div>
            <div className="text-xs text-ink-500">
              {mistakeCounts.active} active
            </div>
          </div>
        </Link>

        <Link
          to="/ai-lab"
          className="card p-4 flex items-center gap-3 hover:shadow-card-hover transition-shadow">
          <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
            <Brain className="h-5 w-5 text-brand-600" />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-sm">AI Study Lab</div>
            <div className="text-xs text-ink-500">Generate from your notes</div>
          </div>
        </Link>
      </div>

      {/* Today's target */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Today&apos;s Target</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <ListChecks className="h-4 w-4 text-brand-600" />
              <span className="text-sm font-medium">Practice</span>
            </div>
            <p className="text-sm text-ink-500">
              Answer at least <strong>20 questions</strong> in practice mode to
              keep momentum.
            </p>
            <Link to="/subjects" className="btn-secondary mt-4 w-full text-sm">
              Start Practice
            </Link>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <CalendarClock className="h-4 w-4 text-brand-600" />
              <span className="text-sm font-medium">Revision</span>
            </div>
            <p className="text-sm text-ink-500">
              {revisionCounts.due > 0
                ? `${revisionCounts.due} topic${
                    revisionCounts.due === 1 ? "" : "s"
                  } due today.`
                : "Nothing due today — great job!"}
            </p>
            <Link to="/revision" className="btn-secondary mt-4 w-full text-sm">
              Open Revision
            </Link>
          </div>

          <div className="card p-5">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-brand-600" />
              <span className="text-sm font-medium">Weak Areas</span>
            </div>
            <p className="text-sm text-ink-500">
              {weak.length > 0
                ? `${weak.length} weak topic${
                    weak.length === 1 ? "" : "s"
                  } detected.`
                : "No weak topics detected yet."}
            </p>
            <Link to="/progress" className="btn-secondary mt-4 w-full text-sm">
              View Progress
            </Link>
          </div>
        </div>
      </div>

      {/* Overall stats */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">Overall Progress</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={Target}
            label="Overall Accuracy"
            value={`${overall.accuracy}%`}
            sub={`${overall.totalCorrect} / ${overall.totalAttempts}`}
          />
          <StatCard
            icon={ListChecks}
            label="Questions Attempted"
            value={overall.totalAttempts}
            sub="All time"
          />
          <StatCard
            icon={Trophy}
            label="Exams Completed"
            value={overall.examsCompleted}
            sub={
              recentExams[0]
                ? `Last: ${recentExams[0].accuracy}%`
                : "No exams yet"
            }
          />
          <StatCard
            icon={Clock}
            label="Study Time"
            value={`${Math.round(overall.studyTimeMs / 60000)}m`}
            sub="Estimated"
          />
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {/* Subject progress */}
        <div className="lg:col-span-2 card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Subject Progress</h2>
            <Link
              to="/subjects"
              className="text-sm text-brand-600 hover:underline inline-flex items-center gap-1">
              All subjects <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {topSubjects.length === 0 ? (
            <p className="text-sm text-ink-500">
              Practice questions in any subject to see progress here.
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

        {/* Right column */}
        <div className="space-y-6">
          {/* Weak areas */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <h2 className="font-semibold text-sm">Weak Areas</h2>
            </div>
            {weak.length === 0 ? (
              <p className="text-sm text-ink-500">
                No weak topics detected yet. Keep practicing!
              </p>
            ) : (
              <ul className="space-y-3">
                {weak.slice(0, 4).map((t) => (
                  <li key={`${t.subjectId}-${t.topicId}`}>
                    <div className="flex items-start justify-between gap-2 mb-1">
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
                    <ProgressBar value={t.accuracy} className="mt-1.5" />
                    <Link
                      to={`/practice/topic/${t.subjectId}/${t.topicId}`}
                      className="text-xs text-brand-600 hover:underline inline-flex items-center gap-1 mt-2">
                      Practice now <ArrowRight className="h-3 w-3" />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Upcoming revision */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarClock className="h-4 w-4 text-brand-600" />
              <h2 className="font-semibold text-sm">Due Revision</h2>
            </div>
            {dueRevisions.length === 0 ? (
              <p className="text-sm text-ink-500">
                No revision items due right now.
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
              Open Revision
            </Link>
          </div>
        </div>
      </div>

      {/* Recent exams */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Recent Exams</h2>
          <Link
            to="/progress"
            className="text-sm text-brand-600 hover:underline inline-flex items-center gap-1">
            View all <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {recentExams.length === 0 ? (
          <div className="card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="font-medium">No exams taken yet</p>
              <p className="text-sm text-ink-500 mt-1">
                Take your first exam to see results and trends here.
              </p>
            </div>
            <Link to="/exam" className="btn-primary">
              Take Exam <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-ink-100/60 text-ink-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Exam</th>
                  <th className="text-right px-4 py-3">Score</th>
                  <th className="text-right px-4 py-3">Accuracy</th>
                </tr>
              </thead>
              <tbody>
                {recentExams.map((e) => (
                  <tr key={e.id} className="border-t border-ink-100">
                    <td className="px-4 py-3 font-medium">{e.title}</td>
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
