import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  FileText,
  Loader2,
  AlertCircle,
  Sparkles,
  ArrowLeft,
  MessageSquare,
  ListChecks,
  Brain,
  Send,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { materialApi, ragApi } from "../lib/api.js";
import Breadcrumbs from "../components/Breadcrumbs.jsx";

const LANGS = [
  { value: "auto", label: "Auto" },
  { value: "bn", label: "বাংলা" },
  { value: "en", label: "English" },
];

export default function PdfWorkspace() {
  const { id } = useParams();
  const { t } = useTranslation();

  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState("ask");

  const [question, setQuestion] = useState("");
  const [askLoading, setAskLoading] = useState(false);
  const [askResult, setAskResult] = useState(null);

  const [mcqCount, setMcqCount] = useState(10);
  const [mcqDifficulty, setMcqDifficulty] = useState("medium");
  const [mcqLoading, setMcqLoading] = useState(false);
  const [mcqResult, setMcqResult] = useState(null);

  const [analyzeLoading, setAnalyzeLoading] = useState(false);
  const [analyzeResult, setAnalyzeResult] = useState(null);

  const [outputLanguage, setOutputLanguage] = useState("auto");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await materialApi.get(id);
      setMaterial(data.material);
    } catch (err) {
      setError(err.message || t("common.error"));
    } finally {
      setLoading(false);
    }
  }

  async function handleAsk() {
    if (question.trim().length < 5) {
      setError(t("pdfWorkspace.questionPlaceholder"));
      return;
    }
    setError("");
    setAskLoading(true);
    setAskResult(null);
    try {
      const data = await ragApi.ask({
        question: question.trim(),
        materialId: id,
        outputLanguage,
        topK: 5,
      });
      setAskResult(data.result);
    } catch (err) {
      setError(err.message || t("common.error"));
    } finally {
      setAskLoading(false);
    }
  }

  async function handleMcq() {
    setError("");
    setMcqLoading(true);
    setMcqResult(null);
    try {
      const data = await ragApi.mcq({
        materialId: id,
        count: mcqCount,
        difficulty: mcqDifficulty,
        outputLanguage,
      });
      setMcqResult(data.result);
    } catch (err) {
      setError(err.message || t("common.error"));
    } finally {
      setMcqLoading(false);
    }
  }

  async function handleAnalyze() {
    setError("");
    setAnalyzeLoading(true);
    setAnalyzeResult(null);
    try {
      const data = await ragApi.analyze({
        materialId: id,
        outputLanguage,
      });
      setAnalyzeResult(data.result);
    } catch (err) {
      setError(err.message || t("common.error"));
    } finally {
      setAnalyzeLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="container-page py-12 flex items-center justify-center text-sm text-ink-500">
        <Loader2 className="h-4 w-4 animate-spin" /> {t("common.loading")}
      </div>
    );
  }

  if (error && !material) {
    return (
      <div className="container-page py-12 max-w-2xl">
        <div className="card p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm text-red-800 dark:text-red-300">{error}</div>
        </div>
        <Link to="/my-pdfs" className="btn-secondary mt-4">
          {t("pdfWorkspace.backToPdfs")}
        </Link>
      </div>
    );
  }

  const TABS = [
    { id: "ask", label: t("pdfWorkspace.tabAsk"), icon: MessageSquare },
    { id: "mcq", label: t("pdfWorkspace.tabMcq"), icon: ListChecks },
    { id: "analyze", label: t("pdfWorkspace.tabAnalyze"), icon: Brain },
  ];

  return (
    <div className="container-page py-10 md:py-14">
      <Breadcrumbs
        items={[
          { label: t("nav.home"), to: "/" },
          { label: t("pdfs.title"), to: "/my-pdfs" },
          { label: material.title },
        ]}
      />

      <Link
        to="/my-pdfs"
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600 mb-6">
        <ArrowLeft className="h-4 w-4" /> {t("pdfWorkspace.backToPdfs")}
      </Link>

      <div className="card p-6">
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center shrink-0">
            <FileText className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">
              {material.title}
            </h1>
            <p className="text-xs text-ink-500 mt-1">
              {material.pageCount || "?"} · {material.chunkCount} ·{" "}
              {material.language}
            </p>
          </div>
          <select
            value={outputLanguage}
            onChange={(e) => setOutputLanguage(e.target.value)}
            className="input !w-auto !py-2 text-sm">
            {LANGS.map((l) => (
              <option key={l.value} value={l.value}>
                {l.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 border-b border-ink-100 dark:border-ink-800">
        <div className="flex gap-1 overflow-x-auto">
          {TABS.map((tb) => {
            const Icon = tb.icon;
            const isActive = tab === tb.id;
            return (
              <button
                key={tb.id}
                type="button"
                onClick={() => setTab(tb.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap inline-flex items-center gap-2 ${
                  isActive
                    ? "border-brand-600 text-brand-700 dark:text-brand-300"
                    : "border-transparent text-ink-500 hover:text-ink-900 dark:hover:text-white"
                }`}>
                <Icon className="h-4 w-4" />
                {tb.label}
              </button>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="mt-6 card p-4 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1 text-sm text-red-800 dark:text-red-300">
            {error}
          </div>
        </div>
      )}

      {tab === "ask" && (
        <div className="mt-6 space-y-4">
          <div className="card p-6">
            <label className="block text-sm font-medium mb-2">
              {t("pdfWorkspace.askQuestion")}
            </label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              placeholder={t("pdfWorkspace.questionPlaceholder")}
              className="input resize-y text-sm"
            />
            <button
              type="button"
              onClick={handleAsk}
              disabled={askLoading}
              className="btn-primary mt-4">
              {askLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />{" "}
                  {t("pdfWorkspace.thinking")}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" /> {t("pdfWorkspace.ask")}
                </>
              )}
            </button>
          </div>

          {askResult && (
            <div className="space-y-4">
              <div className="card p-6">
                <div className="text-xs font-semibold text-ink-500 mb-2">
                  {t("pdfWorkspace.answer")}
                </div>
                <p className="text-sm whitespace-pre-wrap">
                  {askResult.answer}
                </p>
                {askResult.confidence && (
                  <div className="mt-3 text-xs text-ink-500">
                    {t("pdfWorkspace.confidence")}:{" "}
                    <strong>{askResult.confidence}</strong>
                  </div>
                )}
              </div>

              {askResult.keyPoints?.length > 0 && (
                <div className="card p-5">
                  <div className="text-xs font-semibold text-ink-500 mb-2">
                    {t("pdfWorkspace.keyPoints")}
                  </div>
                  <ul className="space-y-1.5 text-sm">
                    {askResult.keyPoints.map((p, i) => (
                      <li key={i} className="flex gap-2">
                        <span className="text-brand-500">•</span>
                        <span>{p}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {askResult.sources?.length > 0 && (
                <div className="card p-5">
                  <div className="text-xs font-semibold text-ink-500 mb-3">
                    {t("pdfWorkspace.sources")}
                  </div>
                  <ul className="space-y-3 text-sm">
                    {askResult.sources.map((s, i) => (
                      <li key={i}>
                        <div className="font-medium">
                          {t("pdfWorkspace.sourceN", {
                            n: s.sourceNumber,
                            title: s.materialTitle,
                          })}
                        </div>
                        <div className="text-ink-600 dark:text-ink-400 mt-1 text-xs">
                          {s.preview}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "mcq" && (
        <div className="mt-6 space-y-4">
          <div className="card p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs text-ink-500 mb-1.5">
                  {t("pdfWorkspace.howMany")}
                </label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={mcqCount}
                  onChange={(e) =>
                    setMcqCount(
                      Math.min(20, Math.max(1, Number(e.target.value) || 1)),
                    )
                  }
                  className="input text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-ink-500 mb-1.5">
                  {t("pdfWorkspace.difficulty")}
                </label>
                <select
                  value={mcqDifficulty}
                  onChange={(e) => setMcqDifficulty(e.target.value)}
                  className="input text-sm">
                  <option value="easy">{t("examBuilder.easy")}</option>
                  <option value="medium">{t("examBuilder.medium")}</option>
                  <option value="hard">{t("examBuilder.hard")}</option>
                </select>
              </div>
            </div>
            <button
              type="button"
              onClick={handleMcq}
              disabled={mcqLoading}
              className="btn-primary mt-4">
              {mcqLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />{" "}
                  {t("questionBank.building")}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />{" "}
                  {t("pdfWorkspace.generateMcqs")}
                </>
              )}
            </button>
          </div>

          {mcqResult?.questions?.map((q, i) => (
            <div key={i} className="card p-5">
              <div className="flex items-center justify-between text-xs text-ink-500 mb-2">
                <span>
                  {t("result.question")} {i + 1}
                </span>
                {q.difficulty && (
                  <span className="badge bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300">
                    {q.difficulty}
                  </span>
                )}
              </div>
              <p className="font-medium text-sm">{q.question}</p>
              <ul className="mt-3 space-y-1.5">
                {q.options?.map((opt, j) => (
                  <li
                    key={j}
                    className={`px-3 py-2 rounded-md border text-sm flex items-center gap-2 ${
                      j === q.answer
                        ? "border-green-300 bg-green-50 dark:bg-green-950/40 text-green-900 dark:text-green-300"
                        : "border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900"
                    }`}>
                    <span className="h-5 w-5 rounded-full border border-current/30 flex items-center justify-center text-xs font-semibold">
                      {String.fromCharCode(65 + j)}
                    </span>
                    <span>{opt}</span>
                  </li>
                ))}
              </ul>
              {q.explanation && (
                <div className="mt-3 text-xs bg-ink-100/60 dark:bg-ink-800/60 border border-ink-200 dark:border-ink-700 rounded-md p-3">
                  <span className="font-semibold">
                    {t("questionBank.explanation")}:{" "}
                  </span>
                  {q.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {tab === "analyze" && (
        <div className="mt-6 space-y-4">
          <div className="card p-6">
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={analyzeLoading}
              className="btn-primary">
              {analyzeLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />{" "}
                  {t("pdfWorkspace.analyzing")}
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4" />{" "}
                  {t("pdfWorkspace.analyzeThisPdf")}
                </>
              )}
            </button>
          </div>

          {analyzeResult && (
            <div className="grid gap-4 md:grid-cols-2">
              {analyzeResult.summary && (
                <div className="md:col-span-2 card p-5">
                  <div className="text-xs font-semibold text-ink-500 mb-2">
                    {t("pdfWorkspace.summary")}
                  </div>
                  <p className="text-sm">{analyzeResult.summary}</p>
                </div>
              )}
              {[
                ["importantFacts", t("pdfWorkspace.importantFacts")],
                ["potentialExamPoints", t("pdfWorkspace.examPoints")],
                ["thingsToMemorize", t("pdfWorkspace.thingsToMemorize")],
                ["confusingAreas", t("pdfWorkspace.confusingAreas")],
              ].map(
                ([key, title]) =>
                  analyzeResult[key]?.length > 0 && (
                    <div key={key} className="card p-5">
                      <div className="text-xs font-semibold text-ink-500 mb-2">
                        {title}
                      </div>
                      <ul className="space-y-1.5 text-sm">
                        {analyzeResult[key].map((x, i) => (
                          <li key={i} className="flex gap-2">
                            <span className="text-brand-500">•</span>
                            <span>
                              {typeof x === "string" ? x : JSON.stringify(x)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ),
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
