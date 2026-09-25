import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarClock, CheckCircle2, Clock, RotateCcw, Trash2, BookOpen,
  ArrowRight, Sparkles,
} from 'lucide-react';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import EmptyState from '../components/EmptyState.jsx';
import {
  getDueToday,
  getUpcoming,
  getCompletedRevisions,
  getRevisionCounts,
  markRevisionComplete,
  unmarkRevision,
  rescheduleRevision,
  removeRevision,
} from '../lib/revisionStore.js';

const TABS = [
  { id: 'due', label: 'Due Today' },
  { id: 'upcoming', label: 'Upcoming' },
  { id: 'completed', label: 'Completed' },
];

function fmtDate(ts) {
  const d = new Date(ts);
  const today = new Date();
  const tomorrow = new Date();
  tomorrow.setDate(today.getDate() + 1);
  const sameDay = (a, b) => a.toDateString() === b.toDateString();

  if (sameDay(d, today)) return 'Today';
  if (sameDay(d, tomorrow)) return 'Tomorrow';
  return d.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() === today.getFullYear() ? undefined : 'numeric',
  });
}

function daysBetween(a, b) {
  return Math.round((a - b) / (24 * 60 * 60 * 1000));
}

export default function Revision() {
  const [tab, setTab] = useState('due');
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
    if (!window.confirm('Remove this revision item?')) return;
    removeRevision(id);
    refresh();
  }

  const list =
    tab === 'due' ? due : tab === 'upcoming' ? upcoming : completed;

  return (
    <div className="container-page py-10 md:py-14">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'Revision' },
        ]}
      />

      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-brand-50 flex items-center justify-center">
            <CalendarClock className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Revision
            </h1>
            <p className="text-sm text-ink-500">
              Spaced revision using Day 0, 1, 3, 7, 14, and 30 intervals.
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="card p-5">
          <div className="text-xs text-ink-500 flex items-center gap-1">
            <Clock className="h-3 w-3" /> Due today
          </div>
          <div className="mt-2 text-2xl font-bold text-brand-600">
            {counts.due}
          </div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-ink-500 flex items-center gap-1">
            <CalendarClock className="h-3 w-3" /> Upcoming
          </div>
          <div className="mt-2 text-2xl font-bold">{counts.upcoming}</div>
        </div>
        <div className="card p-5">
          <div className="text-xs text-ink-500 flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-600" /> Completed
          </div>
          <div className="mt-2 text-2xl font-bold text-green-600">
            {counts.completed}
          </div>
        </div>
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
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-ink-500 hover:text-ink-900'
              }`}
            >
              {t.label}
              {t.id === 'due' && counts.due > 0 && (
                <span className="ml-2 badge bg-brand-600 text-white">
                  {counts.due}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="mt-6 space-y-3">
        {list.length === 0 ? (
          <EmptyState
            icon={
              tab === 'completed'
                ? CheckCircle2
                : tab === 'upcoming'
                ? CalendarClock
                : Clock
            }
            title={
              tab === 'due'
                ? 'Nothing due today'
                : tab === 'upcoming'
                ? 'No upcoming revisions'
                : 'No completed revisions yet'
            }
            description={
              tab === 'due'
                ? 'When you get questions wrong in practice or exams, their topics are automatically scheduled for revision.'
                : tab === 'upcoming'
                ? 'Topics you schedule will appear here on their due dates.'
                : 'Complete a revision session to see it recorded here.'
            }
            action={
              tab === 'due' ? (
                <div className="flex flex-wrap gap-2 justify-center">
                  <Link to="/subjects" className="btn-primary">
                    Practice Topics
                  </Link>
                  <Link to="/exam" className="btn-secondary">
                    Take an Exam
                  </Link>
                </div>
              ) : null
            }
          />
        ) : (
          list.map((item) => {
            const dueIn = daysBetween(item.dueAt, Date.now());
            const isOverdue = tab === 'due' && dueIn < 0;

            return (
              <div key={item.id} className="card p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                        tab === 'completed'
                          ? 'bg-green-50 text-green-600'
                          : isOverdue
                          ? 'bg-red-50 text-red-600'
                          : 'bg-brand-50 text-brand-600'
                      }`}
                    >
                      {tab === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Clock className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs text-ink-500">
                        {item.subjectName} · Day {item.intervalDays}
                      </div>
                      <div className="font-medium truncate">
                        {item.topicName}
                      </div>
                      <div className="text-xs text-ink-500 mt-0.5">
                        {tab === 'completed'
                          ? `Completed ${fmtDate(item.completedAt)}`
                          : `Due ${fmtDate(item.dueAt)}${
                              isOverdue ? ` · ${Math.abs(dueIn)}d overdue` : ''
                            }`}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link
                      to={`/practice/topic/${item.subjectId}/${item.topicId}`}
                      className="btn-primary text-sm"
                    >
                      <BookOpen className="h-3.5 w-3.5" /> Practice
                    </Link>

                    {tab === 'due' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleComplete(item.id)}
                          className="btn-secondary text-sm"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5" /> Complete
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReschedule(item.id, 1)}
                          className="btn-secondary text-sm"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> +1 day
                        </button>
                      </>
                    )}

                    {tab === 'upcoming' && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleComplete(item.id)}
                          className="btn-secondary text-sm"
                        >
                          Complete now
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReschedule(item.id, 1)}
                          className="btn-secondary text-sm"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> +1 day
                        </button>
                      </>
                    )}

                    {tab === 'completed' && (
                      <button
                        type="button"
                        onClick={() => handleUnmark(item.id)}
                        className="btn-secondary text-sm"
                      >
                        <RotateCcw className="h-3.5 w-3.5" /> Unmark
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemove(item.id)}
                      className="btn-ghost text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Coming soon */}
      <div className="mt-12 card p-6 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-brand-600 shrink-0 mt-0.5" />
        <div>
          <h3 className="font-semibold">Adaptive revision</h3>
          <p className="mt-1.5 text-sm text-ink-500">
            Currently revision intervals follow a fixed Day 0 / 1 / 3 / 7 / 14 / 30
            schedule. In a future stage, the system will adapt intervals based on
            your accuracy on each topic.
          </p>
        </div>
      </div>
    </div>
  );
}