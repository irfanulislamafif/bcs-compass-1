import { useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Compass, ArrowRight, AlertCircle, LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Login() {
  const { login, isAuthenticated, booting } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const redirectTo = location.state?.from?.pathname || '/progress';

  if (booting) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-ink-500">
        Loading…
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login({ email, password });
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-ink-100/40">
      <div className="card p-8 w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <Compass className="h-6 w-6 text-brand-600" />
          <span className="font-bold">BCS Compass</span>
        </Link>

        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="mt-1.5 text-sm text-ink-500">
          Log in to continue your preparation.
        </p>

        {error && (
          <div className="mt-5 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? 'Logging in…' : 'Log In'}
            {!submitting && <LogIn className="h-4 w-4" />}
          </button>
        </form>

        <p className="mt-6 text-sm text-ink-500 text-center">
          Don&apos;t have an account?{' '}
          <Link
            to="/register"
            className="text-brand-600 font-medium hover:underline inline-flex items-center gap-1"
          >
            Register <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </p>

        <Link
          to="/"
          className="mt-4 block text-center text-xs text-ink-500 hover:text-ink-900"
        >
          ← Back to Home
        </Link>
      </div>
    </div>
  );
}