import { useMemo, useState } from "react";
import {
  Link,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  ClipboardList,
  Play,
  AlertTriangle,
  Settings2,
} from "lucide-react";
import { demoSubjects, getSubjectById } from "../data/demoData.jsx";
import { demoQuestions } from "../data/demoQuestions.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import { suggestedDurationMinutes } from "../lib/examHelpers.js";

const DIFFICULTIES = [
  { value: "any", label: "Any difficulty" },
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

const PRESETS = [
  { id: "quick", label: "Quick Test", count: 10, duration: 10 },
  { id: "topic", label: "Topic Test", count: 15, duration: 15 },
  { id: "subject", label: "Subject Exam", count: 30, duration: 30 },
  { id: "mock", label: "Full Mock", count: 50, duration: 50 },
];

export default function ExamBuilder() {
  const navigate = useNavigate();
  const { subjectId: subjectIdFromPath } = useParams();
  const [searchParams] = useSearchParams();

  const initialSubject =
    subjectIdFromPath || searchParams.get("subjectId") || "";
  const initialTopic = searchParams.get("topicId") || "";

  const [subjectId, setSubjectId] = useState(initialSubject);
  const [topicIds, setTopicIds] = useState(initialTopic ? [initialTopic] : []);
  const [difficulty, setDifficulty] = useState("any");
  const [count, setCount] = useState(20);
  const [durationMin, setDurationMin] = useState(20);
  const [presetId, setPresetId] = useState(null);

  const subject = subjectId ? getSubjectById(subjectId) : null;

  /* -------- Availability check -------- */
  const availableQuestions = useMemo(() => {
    let pool = demoQuestions.slice();
    if (subjectId) pool = pool.filter((q) => q.subjectId === subjectId);
    if (topicIds.length)
      pool = pool.filter((q) => topicIds.includes(q.topicId));
    if (difficulty !== "any")
      pool = pool.filter((q) => q.difficulty === difficulty);
    return pool.length;
  }, [subjectId, topicIds, difficulty]);

  const effectiveCount = Math.min(count, availableQuestions);

  /* -------- Topic toggle -------- */
  function toggleTopic(tid) {
    setTopicIds((prev) =>
      prev.includes(tid) ? prev.filter((x) => x !== tid) : [...prev, tid],
    );
  }

  /* -------- Preset apply -------- */
  function applyPreset(p) {
    setPresetId(p.id);
    setCount(p.count);
    setDurationMin(p.duration);
  }

  /* -------- Auto-suggest time when count changes without preset -------- */
  function onCountChange(v) {
    const n = Math.max(1, Math.min(100, Number(v) || 1));
    setCount(n);
    setPresetId(null);
    setDurationMin(suggestedDurationMinutes(n));
  }

  /* -------- Submit -------- */
  function startExam() {
    if (effectiveCount < 1) return;
    const params = new URLSearchParams();
    if (subjectId) params.set("subjectId", subjectId);
    if (topicIds.length) params.set("topicIds", topicIds.join(","));
    if (difficulty !== "any") params.set("difficulty", difficulty);
    params.set("count", String(effectiveCount));
    params.set("duration", String(durationMin));
    navigate(`/exam/run?${params.toString()}`);
  }

  return (
    <div className="container-page py-10 md:py-14">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          { label: "Subjects", to: "/subjects" },
          subject
            ? { label: subject.name, to: `/subjects/${subject.id}` }
            : null,
          { label: "Create Exam" },
        ].filter(Boolean)}
      />

      <Link
        to="/subjects"
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to Subjects
      </Link>

      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-brand-50 flex items-center justify-center">
            <ClipboardList className="h-6 w-6 text-brand-600" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Create an Exam
            </h1>
            <p className="text-sm text-ink-500">
              Configure a timed exam that simulates real BCS exam conditions.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* ---------- Config form ---------- */}
        <div className="card p-6 space-y-6">
          {/* Presets */}
          <div>
            <label className="block text-sm font-medium mb-2">
              Quick presets
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => applyPreset(p)}
                  className={`btn ${
                    presetId === p.id
                      ? "bg-brand-600 text-white hover:bg-brand-700"
                      : "bg-white text-ink-700 border border-ink-300 hover:bg-ink-100"
                  }`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-2">
              Subject
            </label>
            <select
              id="subject"
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setTopicIds([]);
              }}
              className="input">
              <option value="">Mixed — all subjects</option>
              {demoSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Topics */}
          {subject && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Topics{" "}
                <span className="text-ink-500 font-normal">
                  (leave empty to include all topics)
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {subject.topics.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => toggleTopic(t.id)}
                    className={`badge border ${
                      topicIds.includes(t.id)
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-white text-ink-700 border-ink-300 hover:border-brand-400"
                    }`}>
                    {t.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Difficulty + Count */}
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="difficulty"
                className="block text-sm font-medium mb-2">
                Difficulty
              </label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="input">
                {DIFFICULTIES.map((d) => (
                  <option key={d.value} value={d.value}>
                    {d.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="count" className="block text-sm font-medium mb-2">
                Number of questions
              </label>
              <input
                id="count"
                type="number"
                min={1}
                max={100}
                value={count}
                onChange={(e) => onCountChange(e.target.value)}
                className="input"
              />
            </div>
          </div>

          {/* Duration */}
          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium mb-2">
              Time limit (minutes)
            </label>
            <input
              id="duration"
              type="number"
              min={1}
              max={180}
              value={durationMin}
              onChange={(e) => {
                setDurationMin(Math.max(1, Number(e.target.value) || 1));
                setPresetId(null);
              }}
              className="input"
            />
          </div>

          {/* Warning when not enough questions */}
          {availableQuestions < count && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                Only <strong>{availableQuestions}</strong> questions match your
                filters. The exam will use <strong>{effectiveCount}</strong>{" "}
                questions.
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={startExam}
              disabled={effectiveCount < 1}
              className="btn-primary w-full">
              <Play className="h-4 w-4" /> Start Exam
            </button>
          </div>
        </div>

        {/* ---------- Live summary ---------- */}
        <aside className="card p-6 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="h-4 w-4 text-ink-500" />
            <h2 className="font-semibold">Exam Summary</h2>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">Subject</dt>
              <dd className="font-medium text-right">
                {subject ? subject.name : "Mixed"}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Topics</dt>
              <dd className="font-medium text-right">
                {topicIds.length === 0 ? "All" : `${topicIds.length} selected`}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Difficulty</dt>
              <dd className="font-medium text-right capitalize">
                {difficulty}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Questions</dt>
              <dd className="font-medium text-right">{effectiveCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">Time limit</dt>
              <dd className="font-medium text-right">{durationMin} min</dd>
            </div>
            <div className="flex justify-between border-t border-ink-100 pt-3">
              <dt className="text-ink-500">Approx. per question</dt>
              <dd className="font-medium text-right">
                {effectiveCount
                  ? `${Math.round((durationMin * 60) / effectiveCount)}s`
                  : "—"}
              </dd>
            </div>
          </dl>

          <p className="mt-5 text-xs text-ink-500">
            In exam mode, correct answers are not shown until you submit. You
            can mark questions for review and return to them before submitting.
          </p>
        </aside>
      </div>
    </div>
  );
}
