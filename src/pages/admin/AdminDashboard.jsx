import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, ListChecks, AlertTriangle, CheckCircle2, FileText, History,
  ShieldAlert, Loader2, AlertCircle, ArrowRight,
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout.jsx';
import { adminApi } from '../../lib/api.js';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.stats();
      setStats(data.stats);
    } catch (err) {
      setError(err.message || 'Failed to load stats.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center gap-3">
        <div className="h-11 w-11 rounded-lg bg-brand-50 flex items-center justify-center">
          <ShieldAlert className="h-6 w-6 text-brand-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-ink-500">
            Platform overview and moderation queue.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="card p-10 flex items-center justify-center text-sm text-ink-500 gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading stats…
        </div>
      ) : error ? (
        <div className="card p-4 bg-red-50 border-red-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">{error}</div>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={Users}
              label="Total Users"
              value={stats.totalUsers}
            />
            <StatCard
              icon={ListChecks}
              label="Total Questions"
              value={stats.totalQuestions}
              sub={`${stats.aiQuestions} AI-generated`}
            />
            <StatCard
              icon={AlertTriangle}
              label="Pending Review"
              value={stats.pendingQuestions}
              accent={stats.pendingQuestions > 0 ? 'amber' : undefined}
            />
            <StatCard
              icon={CheckCircle2}
              label="Approved"
              value={stats.approvedQuestions}
            />
            <StatCard
              icon={FileText}
              label="PDFs Uploaded"
              value={stats.totalMaterials}
            />
            <StatCard
              icon={History}
              label="AI Generations"
              value={stats.totalGenerations}
              sub={`${stats.generationsToday} today`}
            />
            <StatCard
              icon={AlertTriangle}
              label="Rejected"
              value={stats.rejectedQuestions}
            />
            <StatCard
              icon={CheckCircle2}
              label="Approved Rate"
              value={
                stats.totalQuestions
                  ? `${Math.round(
                      (stats.approvedQuestions / stats.totalQuestions) * 100
                    )}%`
                  : '—'
              }
            />
          </div>

          {/* Quick actions */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Link
              to="/admin/questions?status=pending"
              className="card p-5 flex items-center gap-4 hover:shadow-card-hover transition-shadow"
            >
              <div className="h-10 w-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">Review pending questions</div>
                <div className="text-xs text-ink-500 mt-0.5">
                  {stats.pendingQuestions} awaiting approval
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-ink-400" />
            </Link>

            <Link
              to="/admin/generations"
              className="card p-5 flex items-center gap-4 hover:shadow-card-hover transition-shadow"
            >
              <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center">
                <History className="h-5 w-5 text-brand-600" />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-sm">AI generation log</div>
                <div className="text-xs text-ink-500 mt-0.5">
                  Recent user activity
                </div>
              </div>
              <ArrowRight className="h-4 w-4 text-ink-400" />
            </Link>
          </div>
        </>
      )}
    </AdminLayout>
  );
}

function StatCard({ icon: Icon, label, value, sub, accent }) {
  const accentCls = accent === 'amber' ? 'bg-amber-50 text-amber-600' : 'bg-brand-50 text-brand-600';
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-500">{label}</span>
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${accentCls}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      {sub && <div className="mt-1 text-xs text-ink-500">{sub}</div>}
    </div>
  );
}