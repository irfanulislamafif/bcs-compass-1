import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  PlusCircle,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Save,
} from "lucide-react";
import { questionApi } from "../lib/api.js";
import { demoSubjects } from "../data/demoData.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";

const DIFFICULTIES = ["easy", "medium", "hard"];
const LANGS = [
  { value: "en", label: "English" },
  { value: "bn", label: "বাংলা (Bangla)" },
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

    if (!form.subjectId) return setError("Please choose a subject.");
    if (!form.topicId.trim()) return setError("Please enter a topic.");
    if (form.question.trim().length < 5)
      return setError("Question must be at least 5 characters.");
    if (form.options.some((o) => !o.trim()))
      return setError("All 4 options must be filled in.");

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
          .map((t) => t.trim())
          .filter(Boolean)
          .slice(0, 10),
      };
      await questionApi.saveManual(payload);
      setSuccess(
        form.isPublic
          ? "Saved. Your question is pending admin review before other users can see it."
          : "Saved to your private question bank.",
      );
      setForm({ ...EMPTY_FORM, subjectId: form.subjectId });
    } catch (err) {
      setError(err.message || "Failed to save question.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="container-page py-10 md:py-14">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "AI Question Bank", to: "/question-bank" },
          { label: "Create Question" },
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <Link
          to="/question-bank"
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Back to Question Bank
        </Link>
      </div>

      <div className="max-w-3xl">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-11 w-11 rounded-lg bg-brand-50 flex items-center justify-center">
            <PlusCircle className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Create a Question
            </h1>
            <p className="text-sm text-ink-500">
              Write your own MCQ. It goes to your private bank, or becomes
              public after admin approval.
            </p>
          </div>
        </div>

        {success && (
          <div className="mb-4 card p-4 bg-green-50 border-green-200 flex items-start gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
            <div className="text-sm text-green-800">{success}</div>
          </div>
        )}
        {error && (
          <div className="mb-4 card p-4 bg-red-50 border-red-200 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-800">{error}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Where */}
          <div className="card p-6">
            <h2 className="font-semibold text-sm mb-4">
              Where does this question belong?
            </h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-1">
                <label className="block text-xs text-ink-500 mb-1.5">
                  Subject *
                </label>
                <select
                  value={form.subjectId}
                  onChange={(e) => {
                    update("subjectId", e.target.value);
                    update("topicId", "");
                  }}
                  className="input text-sm">
                  <option value="">Choose subject…</option>
                  {demoSubjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs text-ink-500 mb-1.5">
                  Topic *
                </label>
                {subject?.topics?.length > 0 ? (
                  <select
                    value={form.topicId}
                    onChange={(e) => update("topicId", e.target.value)}
                    className="input text-sm">
                    <option value="">Choose topic…</option>
                    {subject.topics.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={form.topicId}
                    onChange={(e) => update("topicId", e.target.value)}
                    placeholder="e.g. constitution"
                    className="input text-sm"
                  />
                )}
              </div>

              <div className="sm:col-span-1">
                <label className="block text-xs text-ink-500 mb-1.5">
                  Section (optional)
                </label>
                <input
                  type="text"
                  value={form.section}
                  onChange={(e) => update("section", e.target.value)}
                  placeholder="e.g. Section A"
                  className="input text-sm"
                />
              </div>
            </div>
          </div>

          {/* Question */}
          <div className="card p-6">
            <h2 className="font-semibold text-sm mb-4">Question</h2>
            <textarea
              value={form.question}
              onChange={(e) => update("question", e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Type your question here…"
              className="input resize-y text-sm"
            />
            <div className="text-right text-xs text-ink-500 mt-1">
              {form.question.length} / 1000
            </div>
          </div>

          {/* Options */}
          <div className="card p-6">
            <h2 className="font-semibold text-sm mb-4">Options</h2>
            <p className="text-xs text-ink-500 mb-4">
              Fill all 4 options, then click the radio button next to the
              correct answer.
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
                        : "border-ink-300 text-ink-500 hover:border-brand-500"
                    }`}>
                    {letter}
                  </button>
                  <input
                    type="text"
                    value={form.options[i]}
                    onChange={(e) => updateOption(i, e.target.value)}
                    placeholder={`Option ${letter}`}
                    maxLength={500}
                    className="input text-sm flex-1"
                  />
                </li>
              ))}
            </ul>
            <div className="mt-4 text-xs text-ink-500">
              Correct answer: <strong>{"ABCD"[form.answer]}</strong>
            </div>
          </div>

          {/* Explanation */}
          <div className="card p-6">
            <h2 className="font-semibold text-sm mb-4">
              Explanation (optional)
            </h2>
            <textarea
              value={form.explanation}
              onChange={(e) => update("explanation", e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Why is the correct answer right?"
              className="input resize-y text-sm"
            />
          </div>

          {/* Metadata */}
          <div className="card p-6">
            <h2 className="font-semibold text-sm mb-4">Metadata</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs text-ink-500 mb-1.5">
                  Difficulty
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
                  Language
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
                  Marks
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
                  Time limit (seconds)
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
                  Tags (comma-separated, optional)
                </label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={(e) => update("tags", e.target.value)}
                  placeholder="e.g. constitution, 1972, article"
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
                      Make this question public
                    </div>
                    <div className="text-xs text-ink-500 mt-0.5">
                      Public questions are reviewed by admins before other users
                      can see them. Private questions are only visible to you.
                    </div>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap gap-3">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" /> Save Question
                </>
              )}
            </button>
            <button type="button" onClick={reset} className="btn-secondary">
              Reset Form
            </button>
            <Link to="/question-bank" className="btn-ghost">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
