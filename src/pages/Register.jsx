// src/pages/Register.jsx
import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';

export default function Register() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card p-8 w-full max-w-md">
        <Link to="/" className="flex items-center gap-2 mb-6">
          <Compass className="h-6 w-6 text-brand-600" />
          <span className="font-bold">BCS Compass</span>
        </Link>
        <h1 className="text-xl font-semibold">Create account</h1>
        <p className="mt-2 text-sm text-ink-500">
          Authentication is planned for Stage 7. This page is a placeholder.
        </p>
        <Link to="/" className="btn-secondary mt-6 w-full">Back to Home</Link>
      </div>
    </div>
  );
}