import { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  PlusCircle,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Save,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { questionApi } from "../lib/api.js";
import { demoSubjects } from "../data/demoData.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";

const DIFFICULTIES = ["easy", "medium", "hard"];
const LANGS = [
  { value: "en", label: "English" },
  { value: "bn", label: "বাংলা" },
];

const EMPTY_FORM = {
  subjectId: "",
  topicId: "",
  section: "",
  question: "",
  options: ["", "", "", ""],
  answer: 0,
  explanation: "",
  difficulty: "medium",
  language: "en",
  marks: 1,
  timeLimitSec: 60,
  isPublic: false,
  tags: "",
};

export default function CreateQuestion() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const subject = useMemo(
    () => demoSubjects.find((s) => s.id === form.subjectId),
    [form.subjectId],
  );

  function update(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateOption(i, value) {
    setForm((prev) => {
      const opts = [...prev.options];
      opts[i] = value;
      return { ...prev, options: opts };
    });
  }

  function reset() {
    setForm(EMPTY_FORM);
    setError("");
    setSuccess("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.subjectId) return setError(t("createQuestion.chooseSubject"));
    if (!form.topicId.trim()) return setError(t("createQuestion.chooseTopic"));
    if (form.question.trim().length < 5)
      return setError(t("auth.passwordTooShort"));
    if (form.options.some((o) => !o.trim()))
      return setError(t("auth.passwordTooShort"));

    setSaving(true);
    try {
      const payload = {
        subjectId: form.subjectId,
        topicId: form.topicId,
        section: form.section,
        question: form.question,
        options: form.options.map((o) => o.trim()),
        answer: form.answer,
        explanation: form.explanation,
        difficulty: form.difficulty,
        language: form.language,
        marks: Number(form.marks) || 1,
        timeLimitSec: Number(form.timeLimitSec) || 60,
        isPublic: form.isPublic,
        tags: form.tags
          .split(",")
          .map((tt) => tt.trim())
          .filter(Boolean)
          .slice(0, 10),
      };
      await questionApi.saveManual(payload);
      setSuccess(
        form.isPublic
          ? t("createQuestion.savedPublic")
          : t("createQuestion.savedPrivate"),
      );
      setForm({ ...EMPTY_FORM, subjectId: form.subjectId });
    } catch (err) {
      setError(err.message || t("common.error"));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-page py-10 md:py-14">
      <Breadcrumbs
        items={[
          { label: t("nav.home"), to: "/" },
          { label: t("questionBank.title"), to: "/question-bank" },
          { label: t("createQuestion.title") },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <Link
          to="/question-bank"
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> {t("createQuestion.backToBank")}
        </Link>
      </div>

      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-11 w-11 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center">
            <PlusCircle className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t("createQuestion.title")}
            </h1>
            <p className="text-sm text-ink-500">
              {t("createQuestion.subtitle")}
            </p>
          </div>
        </div>

        {success && (
          <div className="mb-4 card p-4 bg-green-50 dark:bg-green-950/40 border-green-200 dark:border-green-900 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div className="text-sm text-green-800 dark:text-green-300">
              {success}
            </div>
          </div>
        )}
        {error && (
          <div className="mb-4 card p-4 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-800 dark:text-red-300">
              {error}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="card p-6">
            <h2 className="font-semibold text-sm mb-4">
              {t("createQuestion.where")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="block text-xs text-ink-500 mb-1.5">
                  {t("createQuestion.subject")} *
                </label>
                <select
                  value={form.subjectId}
                  onChange={(e) => {
                    update("subjectId", e.target.value);
                    update("topicId", "");
                  }}
                  className="input text-sm">
                  <option value="">{t("createQuestion.chooseSubject")}</option>
                  {demoSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-ink-500 mb-1.5">
                  {t("createQuestion.topic")} *
                </label>
                {subject?.topics?.length > 0 ? (
                  <select
                    value={form.topicId}
                    onChange={(e) => update("topicId", e.target.value)}
                    className="input text-sm">
                    <option value="">{t("createQuestion.chooseTopic")}</option>
                    {subject.topics.map((tt) => (
                      <option key={tt.id} value={tt.id}>
                        {tt.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form.topicId}
                    onChange={(e) => update("topicId", e.target.value)}
                    placeholder={t("createQuestion.orEnterTopic")}
                    className="input text-sm"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs text-ink-500 mb-1.5">
                  {t("createQuestion.section")}
                </label>
                <input
                  type="text"
                  value={form.section}
                  onChange={(e) => update("section", e.target.value)}
                  placeholder={t("createQuestion.sectionHint")}
                  className="input text-sm"
                />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-sm mb-4">
              {t("createQuestion.question")}
            </h2>
            <textarea
              value={form.question}
              onChange={(e) => update("question", e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder={t("createQuestion.questionPlaceholder")}
              className="input resize-y text-sm"
            />
            <div className="text-right text-xs text-ink-500 mt-1">
              {form.question.length} / 1000
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-sm mb-4">
              {t("createQuestion.options")}
            </h2>
            <p className="text-xs text-ink-500 mb-4">
              {t("createQuestion.optionsHint")}
            </p>
            <ul className="space-y-3">
              {["A", "B", "C", "D"].map((letter, i) => (
                <li key={letter} className="flex items-start gap-3">
                  <button
                    type="button"
                    onClick={() => update("answer", i)}
                    aria-label={`Mark ${letter} as correct`}
                    className={`shrink-0 h-9 w-9 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-colors ${
                      form.answer === i
                        ? "border-green-500 bg-green-500 text-white"
                        : "border-ink-300 dark:border-ink-700 text-ink-500 hover:border-brand-500"
                    }`}>
                    {letter}
                  </button>
                  <input
                    type="text"
                    value={form.options[i]}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={t("createQuestion.option", { letter })}
                    maxLength={500}
                    className="input text-sm flex-1"
                  />
                </li>
              ))}
            </ul>
            <div className="mt-4 text-xs text-ink-500">
              {t("createQuestion.correctAnswer")}:{" "}
              <strong>{"ABCD"[form.answer]}</strong>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-sm mb-4">
              {t("createQuestion.explanation")}
            </h2>
            <textarea
              value={form.explanation}
              onChange={(e) => update("explanation", e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder={t("createQuestion.explanationPlaceholder")}
              className="input resize-y text-sm"
            />
          </div>

          <div className="card p-6">
            <h2 className="font-semibold text-sm mb-4">
              {t("createQuestion.metadata")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs text-ink-500 mb-1.5">
                  {t("createQuestion.difficulty")}
                </label>
                <select
                  value={form.difficulty}
                  onChange={(e) => update("difficulty", e.target.value)}
                  className="input text-sm">
                  {DIFFICULTIES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-ink-500 mb-1.5">
                  {t("createQuestion.language")}
                </label>
                <select
                  value={form.language}
                  onChange={(e) => update("language", e.target.value)}
                  className="input text-sm">
                  {LANGS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs text-ink-500 mb-1.5">
                  {t("createQuestion.marks")}
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={form.marks}
                  onChange={(e) => update("marks", e.target.value)}
                  className="input text-sm"
                />
              </div>

              <div>
                <label className="block text-xs text-ink-500 mb-1.5">
                  {t("createQuestion.timeLimit")}
                </label>
                <input
                  type="number"
                  min={5}
                  max={3600}
                  value={form.timeLimitSec}
                  onChange={(e) => update("timeLimitSec", e.target.value)}
                  className="input text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs text-ink-500 mb-1.5">
                  {t("createQuestion.tags")}
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => update("tags", e.target.value)}
                  placeholder={t("createQuestion.tagsPlaceholder")}
                  className="input text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isPublic}
                    onChange={(e) => update("isPublic", e.target.checked)}
                    className="mt-1"
                  />
                  <div>
                    <div className="text-sm font-medium">
                      {t("createQuestion.makePublic")}
                    </div>
                    <div className="text-xs text-ink-500 mt-0.5">
                      {t("createQuestion.publicNote")}
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />{" "}
                  {t("createQuestion.saving")}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> {t("createQuestion.save")}
                </>
              )}
            </button>
            <button type="button" onClick={reset} className="btn-secondary">
              {t("createQuestion.reset")}
            </button>
            <Link to="/question-bank" className="btn-ghost">
              {t("createQuestion.cancel")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
