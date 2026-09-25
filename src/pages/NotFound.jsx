import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <div className="text-6xl font-extrabold text-brand-600">404</div>
        <h1 className="mt-4 text-xl font-semibold">Page not found</h1>
        <p className="mt-2 text-sm text-ink-500">
          The page you are looking for does not exist.
        </p>
        <Link to="/" className="btn-primary mt-6">
          Back to Home
        </Link>
      </div>
    </div>
  );
}
