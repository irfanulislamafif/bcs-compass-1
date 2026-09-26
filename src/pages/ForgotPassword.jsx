import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Compass,
  ArrowLeft,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { authApi } from "../lib/api.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.message || "Failed to send reset email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-ink-100/40 dark:bg-ink-950">
      <div className="card p-8 w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <Compass className="h-6 w-6 text-brand-600" />
          <span className="font-bold">BCS Compass</span>
        </Link>

        {sent ? (
          <>
            <div className="h-12 w-12 rounded-full bg-green-50 dark:bg-green-950/40 flex items-center justify-center mb-4">
              <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">
              Check your email
            </h1>
            <p className="mt-2 text-sm text-ink-500">
              If <strong>{email}</strong> is registered, we've sent a password
              reset link. It expires in 30 minutes.
            </p>
            <p className="mt-4 text-xs text-ink-500">
              Didn't receive it? Check spam, or{" "}
              <button
                type="button"
                onClick={() => setSent(false)}
                className="text-brand-600 hover:underline">
                try again
              </button>
              .
            </p>
            <Link to="/login" className="btn-secondary mt-6 w-full">
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </>
        ) : (
          <>
            <h1 className="text-2xl font-bold tracking-tight">
              Forgot password?
            </h1>
            <p className="mt-1.5 text-sm text-ink-500">
              Enter your email. We'll send you a link to choose a new password.
            </p>

            {error && (
              <div className="mt-5 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1.5">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input"
                  placeholder="you@example.com"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending…
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </button>
            </form>

            <Link
              to="/login"
              className="mt-6 inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600">
              <ArrowLeft className="h-4 w-4" /> Back to Login
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
