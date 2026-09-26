import { useEffect, useState } from "react";
import { History, Loader2, AlertCircle } from "lucide-react";
import AdminLayout from "../../layouts/AdminLayout.jsx";
import { adminApi } from "../../lib/api.js";

const KINDS = [
  "",
  "analyze",
  "mcq",
  "written",
  "flashcards",
  "notes",
  "facts",
  "memorize",
  "evaluate",
  "rag-ask",
  "rag-mcq",
  "rag-analyze",
];

export default function AdminGenerations() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [kind, setKind] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kind, status]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const filters = {};
      if (kind) filters.kind = kind;
      if (status) filters.status = status;
      const data = await adminApi.generations(filters);
      setItems(data.items || []);
    } catch (err) {
      setError(err.message || "Failed to load generations.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center gap-3">
        <div className="h-11 w-11 rounded-lg bg-brand-50 flex items-center justify-center">
          <History className="h-6 w-6 text-brand-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">AI Generations</h1>
          <p className="text-sm text-ink-500">
            Every AI call made by users, newest first.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <select
          value={kind}
          onChange={(e) => setKind(e.target.value)}
          className="input !w-auto !py-2 text-sm">
          {KINDS.map((k) => (
            <option key={k} value={k}>
              {k || "All kinds"}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="input !w-auto !py-2 text-sm">
          <option value="">All statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
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
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : items.length === 0 ? (
          <div className="p-10 text-center text-sm text-ink-500">
            No AI generations match the current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-100/60 text-ink-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">When</th>
                  <th className="text-left px-4 py-3">User</th>
                  <th className="text-left px-4 py-3">Kind</th>
                  <th className="text-left px-4 py-3">Status</th>
                  <th className="text-right px-4 py-3">Chars</th>
                  <th className="text-left px-4 py-3">Preview</th>
                </tr>
              </thead>
              <tbody>
                {items.map((g) => (
                  <tr key={g._id} className="border-t border-ink-100">
                    <td className="px-4 py-3 text-ink-500 whitespace-nowrap">
                      {new Date(g.createdAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      {g.userId?.name || "—"}
                      <div className="text-xs text-ink-500">
                        {g.userId?.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="badge bg-ink-100 text-ink-700">
                        {g.kind}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`badge ${
                          g.status === "success"
                            ? "bg-green-50 text-green-700"
                            : "bg-red-50 text-red-700"
                        }`}>
                        {g.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{g.inputChars}</td>
                    <td className="px-4 py-3 text-ink-500 max-w-md truncate">
                      {g.status === "failed"
                        ? g.errorMessage
                        : g.materialPreview}
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
