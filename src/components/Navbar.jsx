import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  Compass,
  Menu,
  X,
  LogOut,
  User as UserIcon,
  ShieldAlert,
  Sun,
  Moon,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useTheme } from "../contexts/ThemeContext.jsx";
import LanguageSwitcher from "./LanguageSwitcher.jsx";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const publicLinks = [
    { to: "/", label: t("nav.home") },
    { to: "/subjects", label: t("nav.subjects") },
  ];

  const authedLinks = [
    { to: "/dashboard", label: t("nav.dashboard") },
    { to: "/exam", label: t("nav.exams") },
    { to: "/ai-lab", label: t("nav.aiLab") },
    { to: "/question-bank", label: t("nav.questionBank") },
    { to: "/written-practice", label: t("nav.written") },
    { to: "/my-pdfs", label: t("nav.pdfs") },
    { to: "/revision", label: t("nav.revision") },
    { to: "/mistakes", label: t("nav.mistakes") },
    { to: "/progress", label: t("nav.progress") },
  ];

  const adminLink = { to: "/admin", label: t("nav.admin") };

  const links = [
    ...publicLinks,
    ...(isAuthenticated ? authedLinks : []),
    ...(isAuthenticated && user?.role === "admin" ? [adminLink] : []),
  ];

  function handleLogout() {
    logout();
    setOpen(false);
    navigate("/");
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-ink-950/80 backdrop-blur-md border-b border-ink-200/70 dark:border-ink-800/70">
      <div className="container-page">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center gap-2 group">
            <Compass
              className="h-7 w-7 text-brand-600 transition-transform group-hover:rotate-12"
              strokeWidth={2.2}
            />
            <span className="text-lg font-bold tracking-tight">
              BCS Compass
            </span>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center gap-1.5 ${
                    isActive
                      ? "text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/40"
                      : "text-ink-600 dark:text-ink-300 hover:text-ink-900 dark:hover:text-white hover:bg-ink-100 dark:hover:bg-ink-800"
                  }`
                }>
                {l.to === "/admin" && <ShieldAlert className="h-3.5 w-3.5" />}
                {l.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden lg:flex items-center gap-1">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={toggle}
              className="p-2 rounded-lg text-ink-500 dark:text-ink-400 hover:bg-ink-100 dark:hover:bg-ink-800 transition-colors"
              aria-label="Toggle theme">
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </button>

            {isAuthenticated ? (
              <>
                <span className="inline-flex items-center gap-2 px-3 py-1.5 text-sm text-ink-600 dark:text-ink-300">
                  <UserIcon className="h-4 w-4" />
                  <span className="font-medium truncate max-w-[120px]">
                    {user?.name}
                  </span>
                </span>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="btn-secondary">
                  <LogOut className="h-4 w-4" /> {t("nav.logout")}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">
                  {t("nav.login")}
                </Link>
                <Link to="/register" className="btn-primary">
                  {t("nav.startPreparing")}
                </Link>
              </>
            )}
          </div>

          <div className="lg:hidden flex items-center gap-1">
            <LanguageSwitcher />
            <button
              type="button"
              onClick={toggle}
              className="p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800"
              aria-label="Toggle theme">
              {theme === "dark" ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <button
              className="p-2 rounded-lg hover:bg-ink-100 dark:hover:bg-ink-800"
              onClick={() => setOpen(!open)}
              aria-label="Toggle menu"
              aria-expanded={open}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        {open && (
          <nav className="lg:hidden border-t border-ink-200/70 dark:border-ink-800/70 py-3 space-y-1 animate-fade-in">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.to === "/"}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                    isActive
                      ? "bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300"
                      : "text-ink-700 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800"
                  }`
                }>
                {l.to === "/admin" && <ShieldAlert className="h-3.5 w-3.5" />}
                {l.label}
              </NavLink>
            ))}

            <div className="pt-3 border-t border-ink-200/70 dark:border-ink-800/70 mt-3">
              {isAuthenticated ? (
                <div className="space-y-2">
                  <div className="px-3 py-2 text-sm inline-flex items-center gap-2">
                    <UserIcon className="h-4 w-4 text-ink-500" />
                    <span className="font-medium">{user?.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="btn-secondary w-full">
                    <LogOut className="h-4 w-4" /> {t("nav.logout")}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="btn-secondary">
                    {t("nav.login")}
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setOpen(false)}
                    className="btn-primary">
                    {t("nav.startPreparing")}
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
