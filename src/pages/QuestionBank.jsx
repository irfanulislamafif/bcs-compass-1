import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ListChecks,
  Filter,
  Trash2,
  Loader2,
  AlertCircle,
  Eye,
  RefreshCw,
  ArrowRight,
  Play,
} from "lucide-react";
import { questionApi, examApi } from "../lib/api.js";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import EmptyState from "../components/EmptyState.jsx";

const DIFFICULTIES = ["any", "easy", "medium", "hard"];
const LANGUAGES = [
  { value: "", label: "Any language" },
  { value: "en", label: "English" },
  { value: "bn", label: "বাংলা" },
];

export default function QuestionBank() {
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [difficulty, setDifficulty] = useState("");
  const [language, setLanguage] = useState("");
  const [showAnswers, setShowAnswers] = useState({});

  const [examCount, setExamCount] = useState(10);
  const [examDuration, setExamDuration] = useState(10);
  const [examDifficulty, setExamDifficulty] = useState("any");
  const [examLoading, setExamLoading] = useState(false);
  const [examError, setExamError] = useState("");

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, language]);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const filters = { sourceType: "ai" };
      if (difficulty) filters.difficulty = difficulty;
      if (language) filters.language = language;
      const data = await questionApi.list(filters);
      setQuestions(data.items || []);
    } catch (err) {
      setError(err.message || "Failed to load questions.");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this question from your bank?")) return;
    try {
      await questionApi.remove(id);
      setQuestions((q) => q.filter((x) => x._id !== id));
    } catch (err) {
      setError(err.message || "Delete failed.");
    }
  }

  function toggleAnswer(id) {
    setShowAnswers((s) => ({ ...s, [id]: !s[id] }));
  }

  async function buildExam() {
    setExamError("");
    setExamLoading(true);
    try {
      const data = await examApi.build({
        title: "AI Question Bank Exam",
        count: examCount,
        durationMin: examDuration,
        difficulty: examDifficulty,
        source: "ai",
      });

      const exam = data.exam;
      const mapped = exam.questions.map((row) => {
        const doc = row.questionId;
        return {
          id: doc._id,
          subjectId: doc.subjectId,
          topicId: doc.topicId,
          difficulty: doc.difficulty,
          type: "mcq",
          sourceType: "ai",
          question: doc.question,
          options: doc.options,
          answer: doc.answer,
          explanation: doc.explanation,
        };
      });

      navigate("/exam/run", {
        state: {
          preloadedQuestions: mapped,
          preloadedConfig: {
            title: exam.title,
            durationSec: exam.durationSec,
            count: mapped.length,
          },
        },
      });
    } catch (err) {
      setExamError(err.message || "Failed to build exam.");
    } finally {
      setExamLoading(false);
    }
  }

  const stats = useMemo(() => {
    const total = questions.length;
    const byDifficulty = { easy: 0, medium: 0, hard: 0 };
    for (const q of questions) {
      if (byDifficulty[q.difficulty] != null) byDifficulty[q.difficulty] += 1;
    }
    return { total, byDifficulty };
  }, [questions]);

  return (
    <div className="container-page py-10 md:py-14">
      <Breadcrumbs
        items={[{ label: "Home", to: "/" }, { label: "AI Question Bank" }]}
      />

      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-brand-50 flex items-center justify-center">
            <ListChecks className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              AI Question Bank
            </h1>
            <p className="text-sm text-ink-500">
              Your saved AI-generated questions. Build exams from them anytime.
            </p>
          </div>
        </div>
      </div>

      {/* Exam builder */}
      <div className="mt-8 card p-6">
        <h2 className="font-semibold mb-4">Build an AI Exam</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-xs text-ink-500 mb-1.5">
              Questions
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={examCount}
              onChange={(e) =>
                setExamCount(Math.max(1, Number(e.target.value) || 1))
              }
              className="input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-ink-500 mb-1.5">Minutes</label>
            <input
              type="number"
              min={1}
              max={180}
              value={examDuration}
              onChange={(e) =>
                setExamDuration(Math.max(1, Number(e.target.value) || 1))
              }
              className="input text-sm"
            />
          </div>
          <div>
            <label className="block text-xs text-ink-500 mb-1.5">
              Difficulty
            </label>
            <select
              value={examDifficulty}
              onChange={(e) => setExamDifficulty(e.target.value)}
              className="input text-sm">
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d === "any" ? "Any" : d}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={buildExam}
              disabled={examLoading || questions.length === 0}
              className="btn-primary w-full">
              {examLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Building…
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> Start AI Exam
                </>
              )}
            </button>
          </div>
        </div>
        {examError && (
          <div className="mt-3 text-sm text-red-600">{examError}</div>
        )}
        <div className="mt-3 text-xs text-ink-500">
          Exam uses only your own AI questions. Save some in the AI Study Lab
          first.
        </div>
      </div>

      {/* Stats */}
      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <div className="card p-4">
          <div className="text-xs text-ink-500">Total questions</div>
          <div className="text-2xl font-bold mt-1">{stats.total}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-ink-500">Easy</div>
          <div className="text-2xl font-bold mt-1">
            {stats.byDifficulty.easy}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-ink-500">Medium</div>
          <div className="text-2xl font-bold mt-1">
            {stats.byDifficulty.medium}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-ink-500">Hard</div>
          <div className="text-2xl font-bold mt-1">
            {stats.byDifficulty.hard}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-sm text-ink-500">
          <Filter className="h-4 w-4" /> Filter:
        </div>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="input !w-auto !py-2 text-sm">
          <option value="">Any difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="input !w-auto !py-2 text-sm">
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>
        <button type="button" onClick={load} className="btn-secondary text-sm">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {error && (
        <div className="mt-4 card p-4 bg-red-50 border-red-200 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {/* List */}
      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="card p-10 text-center text-sm text-ink-500 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        ) : questions.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="No AI questions saved yet"
            description="Generate MCQs in the AI Study Lab and click 'Save to Bank'. They'll appear here, ready to practice or build exams from."
            action={
              <Link to="/ai-lab" className="btn-primary">
                Open AI Study Lab <ArrowRight className="h-4 w-4" />
              </Link>
            }
          />
        ) : (
          questions.map((q) => (
            <div key={q._id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="badge bg-brand-50 text-brand-700">
                    {q.subjectId}
                  </span>
                  <span className="badge bg-ink-100 text-ink-700">
                    {q.difficulty}
                  </span>
                  {q.language === "bn" && (
                    <span className="badge bg-amber-50 text-amber-700">
                      বাংলা
                    </span>
                  )}
                  {q.status === "pending" && (
                    <span className="badge bg-ink-100 text-ink-500">
                      pending review
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleAnswer(q._id)}
                    className="btn-secondary text-xs">
                    <Eye className="h-3.5 w-3.5" />
                    {showAnswers[q._id] ? "Hide answer" : "Show answer"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(q._id)}
                    className="btn-ghost text-xs text-red-600 hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <p className="font-medium text-sm">{q.question}</p>

              {showAnswers[q._id] && (
                <>
                  <ul className="mt-3 space-y-1.5">
                    {q.options.map((opt, j) => (
                      <li
                        key={j}
                        className={`px-3 py-2 rounded-md border text-sm flex items-center gap-2 ${
                          j === q.answer
                            ? "border-green-300 bg-green-50 text-green-900"
                            : "border-ink-200 bg-white"
                        }`}>
                        <span className="h-5 w-5 rounded-full border border-current/30 flex items-center justify-center text-xs font-semibold">
                          {String.fromCharCode(65 + j)}
                        </span>
                        <span>{opt}</span>
                      </li>
                    ))}
                  </ul>
                  {q.explanation && (
                    <div className="mt-3 text-xs bg-ink-100/60 border border-ink-200 rounded-md p-3">
                      <span className="font-semibold">Explanation: </span>
                      {q.explanation}
                    </div>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
