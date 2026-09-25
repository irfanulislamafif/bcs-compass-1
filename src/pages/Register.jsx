import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Compass, ArrowRight, AlertCircle, UserPlus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

export default function Register() {
  const { register, isAuthenticated, booting } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    targetExam: 'BCS',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (booting) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-ink-500">
        Loading…
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  function onChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      await register(form);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
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

        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="mt-1.5 text-sm text-ink-500">
          Free to start. Track your progress from day one.
        </p>

        {error && (
          <div className="mt-5 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1.5">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              maxLength={80}
              value={form.name}
              onChange={onChange}
              className="input"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={onChange}
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
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={form.password}
              onChange={onChange}
              className="input"
              placeholder="At least 8 characters"
            />
          </div>

          <div>
            <label htmlFor="targetExam" className="block text-sm font-medium mb-1.5">
              Preparation target
            </label>
            <select
              id="targetExam"
              name="targetExam"
              value={form.targetExam}
              onChange={onChange}
              className="input"
            >
              <option value="BCS">BCS</option>
              <option value="Bank">Bank</option>
              <option value="Primary">Primary</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full"
          >
            {submitting ? 'Creating account…' : 'Create Account'}
            {!submitting && <UserPlus className="h-4 w-4" />}
          </button>
        </form>

        <p className="mt-6 text-sm text-ink-500 text-center">
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-brand-600 font-medium hover:underline inline-flex items-center gap-1"
          >
            Log in <ArrowRight className="h-3.5 w-3.5" />
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