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
import { useTranslation } from "react-i18next";
import { demoSubjects, getSubjectById } from "../data/demoData.jsx";
import { demoQuestions } from "../data/demoQuestions.jsx";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import { suggestedDurationMinutes } from "../lib/examHelpers.js";

const PRESETS = [
  { id: "quick", labelKey: "examBuilder.presetQuick", count: 10, duration: 10 },
  { id: "topic", labelKey: "examBuilder.presetTopic", count: 15, duration: 15 },
  {
    id: "subject",
    labelKey: "examBuilder.presetSubject",
    count: 30,
    duration: 30,
  },
  { id: "mock", labelKey: "examBuilder.presetMock", count: 50, duration: 50 },
];

export default function ExamBuilder() {
  const navigate = useNavigate();
  const { t } = useTranslation();
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

  function toggleTopic(tid) {
    setTopicIds((prev) =>
      prev.includes(tid) ? prev.filter((x) => x !== tid) : [...prev, tid],
    );
  }

  function applyPreset(p) {
    setPresetId(p.id);
    setCount(p.count);
    setDurationMin(p.duration);
  }

  function onCountChange(v) {
    const n = Math.max(1, Math.min(100, Number(v) || 1));
    setCount(n);
    setPresetId(null);
    setDurationMin(suggestedDurationMinutes(n));
  }

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
          { label: t("nav.home"), to: "/" },
          { label: t("nav.subjects"), to: "/subjects" },
          subject
            ? { label: subject.name, to: `/subjects/${subject.id}` }
            : null,
          { label: t("examBuilder.title") },
        ].filter(Boolean)}
      />

      <Link
        to="/subjects"
        className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600 mb-6">
        <ArrowLeft className="h-4 w-4" /> {t("examBuilder.backToSubjects")}
      </Link>

      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center">
            <ClipboardList className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t("examBuilder.title")}
            </h1>
            <p className="text-sm text-ink-500">{t("examBuilder.subtitle")}</p>
          </div>
        </div>
      </div>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="card p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              {t("examBuilder.quickPresets")}
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
                      : "bg-white dark:bg-ink-900 text-ink-700 dark:text-ink-300 border border-ink-300 dark:border-ink-700 hover:bg-ink-100 dark:hover:bg-ink-800"
                  }`}>
                  {t(p.labelKey)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="subject" className="block text-sm font-medium mb-2">
              {t("examBuilder.subject")}
            </label>
            <select
              id="subject"
              value={subjectId}
              onChange={(e) => {
                setSubjectId(e.target.value);
                setTopicIds([]);
              }}
              className="input">
              <option value="">{t("examBuilder.all")}</option>
              {demoSubjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {subject && (
            <div>
              <label className="block text-sm font-medium mb-2">
                {t("examBuilder.topics")}{" "}
                <span className="text-ink-500 font-normal">
                  {t("examBuilder.topicsOptional")}
                </span>
              </label>
              <div className="flex flex-wrap gap-2">
                {subject.topics.map((tt) => (
                  <button
                    key={tt.id}
                    type="button"
                    onClick={() => toggleTopic(tt.id)}
                    className={`badge border ${
                      topicIds.includes(tt.id)
                        ? "bg-brand-600 text-white border-brand-600"
                        : "bg-white dark:bg-ink-900 text-ink-700 dark:text-ink-300 border-ink-300 dark:border-ink-700 hover:border-brand-400"
                    }`}>
                    {tt.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label
                htmlFor="difficulty"
                className="block text-sm font-medium mb-2">
                {t("examBuilder.difficulty")}
              </label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="input">
                <option value="any">{t("examBuilder.anyDifficulty")}</option>
                <option value="easy">{t("examBuilder.easy")}</option>
                <option value="medium">{t("examBuilder.medium")}</option>
                <option value="hard">{t("examBuilder.hard")}</option>
              </select>
            </div>

            <div>
              <label htmlFor="count" className="block text-sm font-medium mb-2">
                {t("examBuilder.numberOfQuestions")}
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

          <div>
            <label
              htmlFor="duration"
              className="block text-sm font-medium mb-2">
              {t("examBuilder.timeLimit")}
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

          {availableQuestions < count && (
            <div className="flex items-start gap-3 p-4 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-300">
              <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                {t("examBuilder.warningText", {
                  available: availableQuestions,
                  effective: effectiveCount,
                })}
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="button"
              onClick={startExam}
              disabled={effectiveCount < 1}
              className="btn-primary w-full">
              <Play className="h-4 w-4" /> {t("examBuilder.startExam")}
            </button>
          </div>
        </div>

        <aside className="card p-6 h-fit">
          <div className="flex items-center gap-2 mb-4">
            <Settings2 className="h-4 w-4 text-ink-500" />
            <h2 className="font-semibold">{t("examBuilder.examSummary")}</h2>
          </div>

          <dl className="space-y-3 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">{t("examBuilder.subject")}</dt>
              <dd className="font-medium text-right">
                {subject ? subject.name : t("examBuilder.all")}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">{t("examBuilder.topics")}</dt>
              <dd className="font-medium text-right">
                {topicIds.length === 0
                  ? t("examBuilder.all")
                  : `${topicIds.length} ${t("examBuilder.selected")}`}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">{t("examBuilder.difficulty")}</dt>
              <dd className="font-medium text-right capitalize">
                {difficulty}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">{t("examBuilder.questions")}</dt>
              <dd className="font-medium text-right">{effectiveCount}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">{t("examBuilder.timeLimit")}</dt>
              <dd className="font-medium text-right">
                {durationMin} {t("examBuilder.mins")}
              </dd>
            </div>
            <div className="flex justify-between border-t border-ink-100 dark:border-ink-800 pt-3">
              <dt className="text-ink-500">{t("examBuilder.perQuestion")}</dt>
              <dd className="font-medium text-right">
                {effectiveCount
                  ? `${Math.round(
                      (durationMin * 60) / effectiveCount,
                    )}${t("examBuilder.perQuestionUnit")}`
                  : "—"}
              </dd>
            </div>
          </dl>

          <p className="mt-5 text-xs text-ink-500">
            {t("examBuilder.infoText")}
          </p>
        </aside>
      </div>
    </div>
  );
}
