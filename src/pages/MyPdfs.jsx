import { useEffect, useRef, useState } from "react";
import {
  FileText,
  Upload,
  Loader2,
  AlertCircle,
  Trash2,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { materialApi } from "../lib/api.js";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function MyPdfs() {
  const { t } = useTranslation();
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await materialApi.list();
      setMaterials(data.items || []);
    } catch (err) {
      setError(err.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  async function handleUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");
    setSuccessMsg("");
    setUploading(true);
    try {
      const data = await materialApi.upload(file);
      setSuccessMsg(
        t("pdfs.uploaded", {
          title: data.material.title,
          count: data.material.chunkCount,
        }),
      );
      await load();
    } catch (err) {
      setError(err.message || t("pdfs.uploadFailed"));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(t("pdfs.deleteConfirm"))) return;
    try {
      await materialApi.remove(id);
      setMaterials((m) => m.filter((x) => x._id !== id));
    } catch (err) {
      setError(err.message || t("common.error"));
    }
  }

  function fmtSize(bytes) {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  return (
    <div className="container-page py-10 md:py-14">
      <Breadcrumbs
        items={[{ label: t("nav.home"), to: "/" }, { label: t("pdfs.title") }]}
      />

      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center">
            <FileText className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t("pdfs.title")}
            </h1>
            <p className="text-sm text-ink-500">{t("pdfs.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold">{t("pdfs.uploadTitle")}</h2>
            <p className="text-sm text-ink-500 mt-1">{t("pdfs.uploadHint")}</p>
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
                uploading ? "opacity-60 cursor-wait" : ""
              }`}>
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />{" "}
                  {t("pdfs.uploading")}
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> {t("pdfs.choosePdf")}
                </>
              )}
            </label>
          </div>
        </div>

        {successMsg && (
          <div className="mt-4 p-3 rounded-lg bg-green-50 dark:bg-green-950/40 border border-green-200 dark:border-green-900 text-green-800 dark:text-green-300 text-sm">
            {successMsg}
          </div>
        )}
        {error && (
          <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="card p-10 text-center text-sm text-ink-500 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> {t("common.loading")}
          </div>
        ) : materials.length === 0 ? (
          <EmptyState
            icon={FileText}
            title={t("pdfs.noPdfs")}
            description={t("pdfs.noPdfsSub")}
          />
        ) : (
          materials.map((m) => (
            <div key={m._id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-brand-600 dark:text-brand-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{m.title}</div>
                    <div className="text-xs text-ink-500 truncate">
                      {m.originalFilename} · {fmtSize(m.sizeBytes)} ·{" "}
                      {m.pageCount || "?"} · {m.textLength} · {m.language}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Link
                    to={`/pdf-workspace/${m._id}`}
                    className="btn-primary text-sm">
                    {t("pdfs.open")} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(m._id)}
                    className="btn-ghost text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40">
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
        <div>{t("pdfs.disclaimer")}</div>
      </div>
    </div>
  );
}
