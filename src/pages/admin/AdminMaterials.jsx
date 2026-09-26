import { useEffect, useState } from 'react';
import {
  FileText, Loader2, AlertCircle, Search,
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout.jsx';
import { adminApi } from '../../lib/api.js';

export default function AdminMaterials() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const filters = {};
      if (q) filters.q = q;
      const data = await adminApi.materials(filters);
      setItems(data.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load materials.');
    } finally {
      setLoading(false);
    }
  }

  function fmtSize(bytes) {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  return (
    <AdminLayout>
      <div className="mb-6 flex items-center gap-3">
        <div className="h-11 w-11 rounded-lg bg-brand-50 flex items-center justify-center">
          <FileText className="h-6 w-6 text-brand-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Study Materials</h1>
          <p className="text-sm text-ink-500">
            PDFs uploaded across the platform.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && load()}
            placeholder="Search title…"
            className="input !pl-9 !py-2 text-sm"
          />
        </div>
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
            No materials yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ink-100/60 text-ink-500 text-xs uppercase tracking-wide">
                <tr>
                  <th className="text-left px-4 py-3">Title</th>
                  <th className="text-left px-4 py-3">Uploaded By</th>
                  <th className="text-right px-4 py-3">Size</th>
                  <th className="text-right px-4 py-3">Chars</th>
                  <th className="text-right px-4 py-3">Pages</th>
                  <th className="text-left px-4 py-3">Lang</th>
                  <th className="text-left px-4 py-3">When</th>
                </tr>
              </thead>
              <tbody>
                {items.map((m) => (
                  <tr key={m._id} className="border-t border-ink-100">
                    <td className="px-4 py-3 font-medium max-w-xs truncate">
                      {m.title}
                    </td>
                    <td className="px-4 py-3">
                      <div>{m.userId?.name || '—'}</div>
                      <div className="text-xs text-ink-500">
                        {m.userId?.email}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {fmtSize(m.sizeBytes)}
                    </td>
                    <td className="px-4 py-3 text-right">{m.textLength}</td>
                    <td className="px-4 py-3 text-right">{m.pageCount}</td>
                    <td className="px-4 py-3">
                      <span className="badge bg-ink-100 text-ink-700">
                        {m.language}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-ink-500 whitespace-nowrap">
                      {new Date(m.createdAt).toLocaleDateString()}
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