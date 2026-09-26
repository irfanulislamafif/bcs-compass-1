import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  Compass, LayoutDashboard, Users, ListChecks, History, FileText,
  LogOut, ArrowLeft, ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.jsx';

const links = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/users', label: 'Users', icon: Users },
  { to: '/admin/questions', label: 'Questions', icon: ListChecks },
  { to: '/admin/generations', label: 'AI Generations', icon: History },
  { to: '/admin/materials', label: 'Materials', icon: FileText },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/');
  }

  return (
    <div className="min-h-screen bg-ink-100/40">
      {/* Top bar */}
      <header className="bg-ink-900 text-white">
        <div className="container-page">
          <div className="flex items-center justify-between h-14">
            <Link to="/admin" className="flex items-center gap-2">
              <Compass className="h-6 w-6 text-brand-400" />
              <span className="font-bold">BCS Compass</span>
              <span className="badge bg-brand-600 text-white ml-2 inline-flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" /> Admin
              </span>
            </Link>

            <div className="flex items-center gap-3 text-sm">
              <span className="text-ink-300 hidden sm:inline">{user?.email}</span>
              <Link
                to="/dashboard"
                className="text-ink-300 hover:text-white inline-flex items-center gap-1"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Site
              </Link>
              <button
                type="button"
                onClick={handleLogout}
                className="text-ink-300 hover:text-white inline-flex items-center gap-1"
              >
                <LogOut className="h-3.5 w-3.5" /> Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="container-page py-6">
        <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <aside className="card p-3 h-fit lg:sticky lg:top-6">
            <nav className="space-y-1">
              {links.map((l) => {
                const Icon = l.icon;
                return (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.end}
                    className={({ isActive }) =>
                      `flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-50 text-brand-700'
                          : 'text-ink-700 hover:bg-ink-100'
                      }`
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {l.label}
                  </NavLink>
                );
              })}
            </nav>
          </aside>

          {/* Content */}
          <main className="min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}