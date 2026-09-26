import { useEffect, useState } from "react";
import { Users, Loader2, AlertCircle, Search, ShieldAlert } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import { adminApi } from "../../lib/api.js";
import { useAuth } from "../../contexts/AuthContext.jsx";

export default function AdminUsers() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const filters = {};
      if (q) filters.q = q;
      if (role) filters.role = role;
      const data = await adminApi.users(filters);
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || "Failed to load users.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleRole(u) {
    const nextRole = u.role === "admin" ? "user" : "admin";
    if (
      !window.confirm(
        `Change ${u.email} role from "${u.role}" to "${nextRole}"?`,
      )
    )
      return;
    try {
      const data = await adminApi.updateRole(u._id, nextRole);
      setUsers((list) =>
        list.map((x) => (x._id === data.user._id ? data.user : x)),
      );
    } catch (err) {
      setError(err.message || "Failed to update role.");
    }
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center gap-3">
        <div className="h-11 w-11 rounded-lg bg-brand-50 flex items-center justify-center">
          <Users className="h-6 w-6 text-brand-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Users</h1>
          <p className="text-sm text-ink-500">Manage accounts and roles.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load()}
            placeholder="Search name or email…"
            className="input !pl-9 !py-2 text-sm"
          />
        </div>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="input !w-auto !py-2 text-sm">
          <option value="">All roles</option>
          <option value="user">User</option>
          <option value="admin">Admin</option>
        </select>
        <button type="button" onClick={load} className="btn-secondary text-sm">
          Refresh
        </button>
      </div>

      {error && (
        <div className="mt-4 card p-4 bg-red-50 border-red-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      <div className="mt-6 card overflow-hidden">
        {loading ? (
          <div className="p-10 flex items-center justify-center text-sm text-ink-500 gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading users…
          </div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-500">
            No users match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-100/60 text-ink-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Name</th>
                  <th className="text-left px-4 py-3">Email</th>
                  <th className="text-left px-4 py-3">Target</th>
                  <th className="text-left px-4 py-3">Role</th>
                  <th className="text-left px-4 py-3">Joined</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u._id} className="border-t border-ink-100">
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-ink-500">{u.email}</td>
                    <td className="px-4 py-3 text-ink-500">{u.targetExam}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${
                          u.role === "admin"
                            ? "bg-brand-50 text-brand-700"
                            : "bg-ink-100 text-ink-700"
                        }`}>
                        {u.role === "admin" && (
                          <ShieldAlert className="h-3 w-3 mr-1" />
                        )}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {String(u._id) === String(me?._id) ? (
                        <span className="text-xs text-ink-400">you</span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => toggleRole(u)}
                          className="btn-secondary text-xs">
                          {u.role === "admin" ? "Demote" : "Promote"}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
