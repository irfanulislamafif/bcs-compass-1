import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  ListChecks, Loader2, AlertCircle, CheckCircle2, XCircle, Trash2, Eye,
  Search,
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout.jsx';
import { adminApi } from '../../lib/api.js';

const STATUSES = ['', 'pending', 'approved', 'rejected'];

export default function AdminQuestions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});

  const [status, setStatus] = useState(searchParams.get('status') || 'pending');
  const [sourceType, setSourceType] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, sourceType]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const filters = {};
      if (status) filters.status = status;
      if (sourceType) filters.sourceType = sourceType;
      if (q) filters.q = q;
      const data = await adminApi.questions(filters);
      setItems(data.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load questions.');
    } finally {
      setLoading(false);
    }
  }

  async function moderate(id, newStatus) {
    try {
      await adminApi.moderate(id, newStatus);
      setItems((list) =>
        list
          .map((x) => (x._id === id ? { ...x, status: newStatus } : x))
          .filter((x) => !status || x.status === status)
      );
    } catch (err) {
      setError(err.message || 'Action failed.');
    }
  }

  async function remove(id) {
    if (!window.confirm('Permanently delete this question?')) return;
    try {
      await adminApi.deleteQuestion(id);
      setItems((list) => list.filter((x) => x._id !== id));
    } catch (err) {
      setError(err.message || 'Delete failed.');
    }
  }

  function toggleExpand(id) {
    setExpanded((s) => ({ ...s, [id]: !s[id] }));
  }

  function updateStatusFilter(v) {
    setStatus(v);
    const next = new URLSearchParams(searchParams);
    if (v) next.set('status', v);
    else next.delete('status');
    setSearchParams(next, { replace: true });
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center gap-3">
        <div className="h-11 w-11 rounded-lg bg-brand-50 flex items-center justify-center">
          <ListChecks className="h-6 w-6 text-brand-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Questions</h1>
          <p className="text-sm text-ink-500">
            Approve or reject AI-generated questions.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={status}
          onChange={(e) => updateStatusFilter(e.target.value)}
          className="input !w-auto !py-2 text-sm"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s === '' ? 'All statuses' : s}
            </option>
          ))}
        </select>

        <select
          value={sourceType}
          onChange={(e) => setSourceType(e.target.value)}
          className="input !w-auto !py-2 text-sm"
        >
          <option value="">All sources</option>
          <option value="ai">AI</option>
          <option value="previous">Previous</option>
          <option value="user">User</option>
        </select>

        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="Search question…"
            className="input !pl-9 !py-2 text-sm"
          />
        </div>
        <button type="button" onClick={load} className="btn-secondary text-sm">
          Refresh
        </button>
      </div>

      {error && (
        <div className="mt-4 card p-4 bg-red-50 border-red-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="card p-10 flex items-center justify-center text-sm text-ink-500 gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="card p-10 text-center text-sm text-ink-500">
            No questions match the current filters.
          </div>
        ) : (
          items.map((row) => (
            <div key={row._id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex flex-wrap gap-2 text-xs">
                  <StatusBadge status={row.status} />
                  <span className="badge bg-brand-50 text-brand-700">
                    {row.subjectId}
                  </span>
                  <span className="badge bg-ink-100 text-ink-700">
                    {row.difficulty}
                  </span>
                  {row.language === 'bn' && (
                    <span className="badge bg-amber-50 text-amber-700">বাংলা</span>
                  )}
                  <span className="badge bg-ink-100 text-ink-700">
                    {row.sourceType}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleExpand(row._id)}
                    className="btn-secondary text-xs"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {expanded[row._id] ? 'Hide' : 'View'}
                  </button>
                  {row.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => moderate(row._id, 'approved')}
                      className="btn-primary text-xs bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" /> Approve
                    </button>
                  )}
                  {row.status !== 'rejected' && (
                    <button
                      type="button"
                      onClick={() => moderate(row._id, 'rejected')}
                      className="btn-secondary text-xs text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <XCircle className="h-3.5 w-3.5" /> Reject
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(row._id)}
                    className="btn-ghost text-xs text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="font-medium text-sm">{row.question}</p>

              {expanded[row._id] && (
                <>
                  <ul className="mt-3 space-y-1.5">
                    {row.options.map((opt, j) => (
                      <li
                        key={j}
                        className={`px-3 py-2 rounded-md border text-sm flex items-center gap-2 ${
                          j === row.answer
                            ? 'border-green-300 bg-green-50 text-green-900'
                            : 'border-ink-200 bg-white'
                        }`}
                      >
                        <span className="h-5 w-5 rounded-full border border-current/30 flex items-center justify-center text-xs font-semibold">
                          {String.fromCharCode(65 + j)}
                        </span>
                        <span>{opt}</span>
                      </li>
                    ))}
                  </ul>
                  {row.explanation && (
                    <div className="mt-3 text-xs bg-ink-100/60 border border-ink-200 rounded-md p-3">
                      <span className="font-semibold">Explanation: </span>
                      {row.explanation}
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </AdminLayout>
  );
}

function StatusBadge({ status }) {
  const map = {
    pending: 'bg-amber-50 text-amber-700',
    approved: 'bg-green-50 text-green-700',
    rejected: 'bg-red-50 text-red-700',
  };
  return <span className={`badge ${map[status] || 'bg-ink-100 text-ink-700'}`}>
    {status}
  </span>;
}