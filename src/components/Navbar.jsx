import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Compass, Menu, X } from "lucide-react";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/features", label: "Features" },
  { to: "/how-it-works", label: "How It Works" },
  { to: "/subjects", label: "Subjects" },
  { to: "/exam", label: "Exams" },
  { to: "/progress", label: "Progress" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-ink-100">
      <div className="container-page">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <Compass className="h-7 w-7 text-brand-600" strokeWidth={2.2} />
            <span className="text-lg font-bold tracking-tight">
              BCS Compass
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {publicLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-brand-700 bg-brand-50"
                      : "text-ink-700 hover:text-ink-900 hover:bg-ink-100"
                  }`
                }>
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            <Link to="/login" className="btn-ghost">
              Login
            </Link>
            <Link to="/register" className="btn-primary">
              Start Preparing
            </Link>
          </div>

          <button
            className="md:hidden p-2 rounded-lg hover:bg-ink-100"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <nav className="md:hidden border-t border-ink-100 py-3 space-y-1">
            {publicLinks.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? "bg-brand-50 text-brand-700"
                      : "text-ink-700 hover:bg-ink-100"
                  }`
                }>
                {l.label}
              </NavLink>
            ))}
            <div className="pt-2 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="btn-secondary">
                Login
              </Link>
              <Link
                to="/register"
                onClick={() => setOpen(false)}
                className="btn-primary">
                Start Preparing
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
