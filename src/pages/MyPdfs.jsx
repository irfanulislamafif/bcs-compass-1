import { useEffect, useRef, useState } from 'react';
import {
  FileText, Upload, Loader2, AlertCircle, Trash2, ArrowRight, Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { materialApi } from '../lib/api.js';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import EmptyState from '../components/EmptyState.jsx';

export default function MyPdfs() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const data = await materialApi.list();
      setMaterials(data.items || []);
    } catch (err) {
      setError(err.message || 'Failed to load PDFs.');
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setSuccessMsg('');
    setUploading(true);
    try {
      const data = await materialApi.upload(file);
      setSuccessMsg(
        `Uploaded "${data.material.title}" — ${data.material.chunkCount} chunks ready.`
      );
      await load();
    } catch (err) {
      setError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Delete this PDF and all its chunks?')) return;
    try {
      await materialApi.remove(id);
      setMaterials((m) => m.filter((x) => x._id !== id));
    } catch (err) {
      setError(err.message || 'Delete failed.');
    }
  }

  function fmtSize(bytes) {
    if (!bytes) return '—';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  return (
    <div className="container-page py-10 md:py-14">
      <Breadcrumbs
        items={[
          { label: 'Home', to: '/' },
          { label: 'My PDFs' },
        ]}
      />

      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-brand-50 flex items-center justify-center">
            <FileText className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              My PDFs
            </h1>
            <p className="text-sm text-ink-500">
              Upload study PDFs. Then ask questions, generate MCQs, and analyze content.
            </p>
          </div>
        </div>
      </div>

      {/* Upload */}
      <div className="mt-8 card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">Upload a PDF</h2>
            <p className="text-sm text-ink-500 mt-1">
              Maximum 10 MB. Scanned/image PDFs are not supported yet.
            </p>
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              onChange={handleUpload}
              className="hidden"
              id="pdf-upload"
            />
            <label
              htmlFor="pdf-upload"
              className={`btn-primary cursor-pointer ${
                uploading ? 'opacity-60 cursor-wait' : ''
              }`}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Uploading…
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Choose PDF
                </>
              )}
            </label>
          </div>
        </div>

        {successMsg && (
          <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-800 text-sm">
            {successMsg}
          </div>
        )}
        {error && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* List */}
      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="card p-10 text-center text-sm text-ink-500 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : materials.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No PDFs yet"
            description="Upload your first PDF above. You can then ask questions, generate MCQs from it, and get an exam-focused analysis."
          />
        ) : (
          materials.map((m) => (
            <div key={m._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-brand-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{m.title}</div>
                    <div className="text-xs text-ink-500 truncate">
                      {m.originalFilename} · {fmtSize(m.sizeBytes)} ·{' '}
                      {m.pageCount || '?'} pages · {m.textLength} chars ·{' '}
                      {m.language}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/pdf-workspace/${m._id}`}
                    className="btn-primary text-sm"
                  >
                    Open <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(m._id)}
                    className="btn-ghost text-sm text-red-600 hover:bg-red-50"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-12 card p-5 text-xs text-ink-500 flex items-start gap-2">
        <Sparkles className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
        <div>
          Answers are generated from your PDF content only. Always cross-check
          important facts with reliable sources before relying on them.
        </div>
      </div>
    </div>
  );
}