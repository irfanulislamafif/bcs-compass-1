import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Compass, Loader2, AlertCircle, CheckCircle2, KeyRound,
} from 'lucide-react';
import { authApi } from '../lib/api.js';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setError(err.message || 'Reset failed. The link may have expired.');
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-ink-100/40 dark:bg-ink-950">
        <div className="card p-8 w-full max-w-md">
          <div className="flex items-center gap-2 mb-6">
            <Compass className="h-6 w-6 text-brand-600" />
            <span className="font-bold">BCS Compass</span>
          </div>
          <div className="flex items-start gap-3 p-4 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-800 dark:text-red-300">
              No reset token found. Use the link from your email.
            </div>
          </div>
          <Link to="/forgot-password" className="btn-secondary mt-6 w-full">
            Request a new link
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-ink-100/40 dark:bg-ink-950">
        <div className="card p-8 w-full max-w-md text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-green-50 dark:bg-green-950/40 flex items-center justify-center mb-4">
            <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Password updated</h1>
          <p className="mt-2 text-sm text-ink-500">
            Redirecting you to login…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-ink-100/40 dark:bg-ink-950">
      <div className="card p-8 w-full max-w-md">
        <div className="flex items-center gap-2 mb-6">
          <Compass className="h-6 w-6 text-brand-600" />
          <span className="font-bold">BCS Compass</span>
        </div>

        <div className="h-12 w-12 rounded-full bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center mb-4">
          <KeyRound className="h-6 w-6 text-brand-600 dark:text-brand-400" />
        </div>

        <h1 className="text-2xl font-bold tracking-tight">Choose a new password</h1>
        <p className="mt-1.5 text-sm text-ink-500">
          Enter a new password for your account.
        </p>

        {error && (
          <div className="mt-5 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5">
              New Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="At least 8 characters"
            />
          </div>
          <div>
            <label htmlFor="confirm" className="block text-sm font-medium mb-1.5">
              Confirm Password
            </label>
            <input
              id="confirm"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="input"
              placeholder="Re-enter the password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Updating…
              </>
            ) : (
              'Update Password'
            )}
          </button>
        </form>

        <Link
          to="/login"
          className="mt-6 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600"
        >
          Back to Login
        </Link>
      </div>
    </div>
  );
}