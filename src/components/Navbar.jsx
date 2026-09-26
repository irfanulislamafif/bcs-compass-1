import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Compass, Menu, X, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "../contexts/AuthContext.jsx";

const publicLinks = [
  { to: "/", label: "Home" },
  { to: "/subjects", label: "Subjects" },
];

const authedLinks = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/exam", label: "Exams" },
  { to: "/ai-lab", label: "AI Lab" },
  { to: "/question-bank", label: "AI Bank" },
  { to: "/written-practice", label: "Written" },
  { to: "/revision", label: "Revision" },
  { to: "/mistakes", label: "Mistake Book" },
  { to: "/progress", label: "Progress" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const links = [...publicLinks, ...(isAuthenticated ? authedLinks : [])];

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-ink-100">
      <div className="container-page">
        <div className="flex h-16 items-center justify-between">
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center gap-2">
            <Compass className="h-7 w-7 text-brand-600" strokeWidth={2.2} />
            <span className="text-lg font-bold tracking-tight">
              BCS Compass
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
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

          <div className="hidden lg:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <span className="inline-flex items-center gap-2 px-3 py-2 text-sm text-ink-700">
                  <UserIcon className="h-4 w-4 text-ink-500" />
                  <span className="font-medium truncate max-w-[140px]">
                    {user?.name}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-secondary">
                  <LogOut className="h-4 w-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">
                  Login
                </Link>
                <Link to="/register" className="btn-primary">
                  Start Preparing
                </Link>
              </>
            )}
          </div>

          <button
            className="lg:hidden p-2 rounded-lg hover:bg-ink-100"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
            aria-expanded={open}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <nav className="lg:hidden border-t border-ink-100 py-3 space-y-1">
            {links.map((l) => (
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

            <div className="pt-3 border-t border-ink-100 mt-3">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 text-sm text-ink-700 inline-flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-ink-500" />
                    <span className="font-medium">{user?.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn-secondary w-full">
                    <LogOut className="h-4 w-4" /> Logout
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
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
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
