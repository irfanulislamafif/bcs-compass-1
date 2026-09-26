import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Navigate,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { Clock, Flag, ChevronLeft, ChevronRight, Send } from "lucide-react";
import { useTranslation } from "react-i18next";
import { buildExamQuestions, formatClock } from "../lib/examHelpers.js";
import { getSubjectById } from "../data/demoData.jsx";
import {
  saveExamAttempt,
  recordAttempt,
  recordMistakeWithRevision,
} from "../lib/sessionStore.js";

const MARKS = {
  none: "none",
  review: "review",
  answeredReview: "answeredReview",
};

export default function ExamRunner() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();

  const preloadedQuestions = location.state?.preloadedQuestions || null;
  const preloadedConfig = location.state?.preloadedConfig || null;

  const config = useMemo(() => {
    if (preloadedConfig) {
      return {
        subjectId: "",
        topicIds: [],
        difficulty: "any",
        count: preloadedQuestions?.length || 0,
        durationSec: preloadedConfig.durationSec,
        title: preloadedConfig.title || "AI Exam",
      };
    }
    const subjectId = searchParams.get("subjectId") || undefined;
    const topicIdsRaw = searchParams.get("topicIds");
    const topicIds = topicIdsRaw
      ? topicIdsRaw.split(",").filter(Boolean)
      : undefined;
    const difficulty = searchParams.get("difficulty") || "any";
    const count = Number(searchParams.get("count") || 20);
    const durationMin = Number(searchParams.get("duration") || 20);
    return {
      subjectId,
      topicIds,
      difficulty,
      count,
      durationSec: durationMin * 60,
      title: null,
    };
  }, [preloadedConfig, preloadedQuestions, searchParams]);

  const [questions] = useState(
    () => preloadedQuestions || buildExamQuestions(config),
  );

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [marks, setMarks] = useState({});
  const [visited, setVisited] = useState(() => new Set([0]));

  const [secondsLeft, setSecondsLeft] = useState(config.durationSec);
  const startRef = useRef(Date.now());
  const submittedRef = useRef(false);

  const submitExam = useCallback(
    (auto = false) => {
      if (submittedRef.current) return;
      submittedRef.current = true;

      const timeSpentMs = Date.now() - startRef.current;

      const results = questions.map((q, i) => {
        const selected = answers[i] ?? null;
        return {
          questionId: q.id,
          subjectId: q.subjectId,
          topicId: q.topicId,
          selected,
          isCorrect: selected === q.answer,
          timeSpentMs: 0,
          question: q,
        };
      });

      const score = results.filter((r) => r.isCorrect).length;

      results.forEach((r) => {
        const base = {
          questionId: r.questionId,
          subjectId: r.subjectId,
          topicId: r.topicId,
          selected: r.selected,
          isCorrect: r.isCorrect,
          at: Date.now(),
        };
        recordAttempt(base);
        if (!r.isCorrect && r.selected != null) {
          recordMistakeWithRevision(base);
        }
      });

      saveExamAttempt({
        examConfig: config,
        results,
        score,
        total: results.length,
        accuracy: results.length
          ? Math.round((score / results.length) * 100)
          : 0,
        timeSpentMs,
        completedAt: Date.now(),
        autoSubmitted: auto,
      });

      navigate("/exam/result", {
        state: {
          results,
          timeSpentMs,
          autoSubmitted: auto,
          config,
        },
        replace: true,
      });
    },
    [answers, config, navigate, questions],
  );

  useEffect(() => {
    const id = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(id);
          submitExam(true);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [submitExam]);

  useEffect(() => {
    function onBeforeUnload(e) {
      if (submittedRef.current) return;
      e.preventDefault();
      e.returnValue = "";
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

  useEffect(() => {
    setVisited((prev) => {
      const next = new Set(prev);
      next.add(index);
      return next;
    });
  }, [index]);

  if (questions.length === 0) {
    return <Navigate to="/exam" replace />;
  }

  const current = questions[index];
  const total = questions.length;
  const answeredCount = Object.keys(answers).length;
  const reviewCount = Object.values(marks).filter(
    (m) => m === MARKS.review || m === MARKS.answeredReview,
  ).length;

  const subject = config.subjectId ? getSubjectById(config.subjectId) : null;
  const headerTitle =
    config.title ||
    (subject
      ? `${subject.name} ${t("examBuilder.presetSubject")}`
      : t("examRunner.inProgress"));
  const isLowTime = secondsLeft <= 60;

  function selectOption(i) {
    setAnswers((prev) => ({ ...prev, [index]: i }));
    setMarks((prev) => {
      if (prev[index] === MARKS.review) {
        return { ...prev, [index]: MARKS.answeredReview };
      }
      return prev;
    });
  }

  function toggleReview() {
    setMarks((prev) => {
      const cur = prev[index];
      if (cur === MARKS.review) return { ...prev, [index]: MARKS.none };
      if (cur === MARKS.answeredReview) return { ...prev, [index]: MARKS.none };
      return {
        ...prev,
        [index]: answers[index] != null ? MARKS.answeredReview : MARKS.review,
      };
    });
  }

  function confirmSubmit() {
    const unanswered = total - answeredCount;
    const msg = unanswered
      ? t("examRunner.submitConfirmUnanswered", { count: unanswered })
      : t("examRunner.submitConfirm");
    if (window.confirm(msg)) submitExam(false);
  }

  function paletteClass(i) {
    const mark = marks[i];
    const answered = answers[i] != null;
    const isCurrent = i === index;

    let cls =
      "h-9 w-9 rounded-md text-xs font-semibold flex items-center justify-center border transition-colors relative ";

    if (mark === MARKS.review) {
      cls += "bg-amber-100 border-amber-400 text-amber-900";
    } else if (mark === MARKS.answeredReview) {
      cls += "bg-amber-200 border-amber-500 text-amber-900";
    } else if (answered) {
      cls += "bg-green-100 border-green-400 text-green-800";
    } else if (visited.has(i)) {
      cls += "bg-red-50 border-red-300 text-red-700";
    } else {
      cls +=
        "bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-700 text-ink-700 dark:text-ink-300 hover:border-brand-300";
    }

    if (isCurrent) cls += " ring-2 ring-brand-500 ring-offset-1";
    return cls;
  }

  return (
    <div className="min-h-screen bg-ink-100/40 dark:bg-ink-950">
      <header className="sticky top-0 z-30 bg-white dark:bg-ink-900 border-b border-ink-200 dark:border-ink-800">
        <div className="container-page">
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <div className="text-xs text-ink-500">
                {t("examRunner.inProgress")}
              </div>
              <div className="font-semibold truncate">{headerTitle}</div>
            </div>

            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-sm font-semibold ${
                isLowTime
                  ? "bg-red-50 dark:bg-red-950/40 border-red-300 dark:border-red-900 text-red-700 dark:text-red-400 animate-pulse"
                  : "bg-ink-100 dark:bg-ink-800 border-ink-200 dark:border-ink-700 text-ink-900 dark:text-ink-100"
              }`}
              role="timer"
              aria-live="polite">
              <Clock className="h-4 w-4" />
              {formatClock(secondsLeft)}
            </div>

            <button
              type="button"
              onClick={confirmSubmit}
              className="btn-primary">
              <Send className="h-4 w-4" /> {t("examRunner.submit")}
            </button>
          </div>
        </div>
      </header>

      <div className="container-page py-6">
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <div>
            <div className="card p-6">
              <div className="flex items-center justify-between text-xs text-ink-500 mb-3">
                <span>
                  {t("examRunner.questionOf", {
                    current: index + 1,
                    total,
                  })}
                </span>
                <button
                  type="button"
                  onClick={toggleReview}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-medium ${
                    marks[index] && marks[index] !== MARKS.none
                      ? "bg-amber-100 border-amber-400 text-amber-900"
                      : "bg-white dark:bg-ink-900 border-ink-300 dark:border-ink-700 text-ink-700 dark:text-ink-300 hover:border-amber-400"
                  }`}>
                  <Flag className="h-3.5 w-3.5" />
                  {marks[index] && marks[index] !== MARKS.none
                    ? t("examRunner.markedForReview")
                    : t("examRunner.markForReview")}
                </button>
              </div>

              <h2 className="text-base md:text-lg font-semibold leading-relaxed">
                {current.question}
              </h2>

              <ul className="mt-5 space-y-2.5">
                {current.options.map((opt, i) => {
                  const isSelected = answers[index] === i;
                  return (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => selectOption(i)}
                        className={`w-full text-left px-4 py-3 rounded-lg border flex items-center gap-3 transition-colors ${
                          isSelected
                            ? "border-brand-500 bg-brand-50 dark:bg-brand-950/40"
                            : "border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 hover:border-brand-300"
                        }`}>
                        <span className="shrink-0 h-6 w-6 rounded-full border border-current/30 flex items-center justify-center text-xs font-semibold">
                          {String.fromCharCode(65 + i)}
                        </span>
                        <span className="text-sm">{opt}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setIndex((i) => Math.max(0, i - 1))}
                disabled={index === 0}
                className="btn-secondary">
                <ChevronLeft className="h-4 w-4" /> {t("examRunner.previous")}
              </button>

              {index === total - 1 ? (
                <button
                  type="button"
                  onClick={confirmSubmit}
                  className="btn-primary">
                  <Send className="h-4 w-4" /> {t("examRunner.submitExam")}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIndex((i) => Math.min(total - 1, i + 1))}
                  className="btn-primary">
                  {t("examRunner.next")} <ChevronRight className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>

          <aside className="card p-5 h-fit lg:sticky lg:top-20">
            <h3 className="font-semibold text-sm mb-3">
              {t("examRunner.questionPalette")}
            </h3>

            <div className="grid grid-cols-5 gap-2">
              {questions.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={paletteClass(i)}
                  aria-label={`Go to question ${i + 1}`}>
                  {i + 1}
                </button>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-ink-100 dark:border-ink-800 space-y-2 text-xs text-ink-500">
              <Legend
                swatch="bg-green-100 border-green-400"
                label={`${t("examRunner.answered")} (${answeredCount})`}
              />
              <Legend
                swatch="bg-red-50 border-red-300"
                label={`${t("examRunner.unanswered")} (${Math.max(
                  0,
                  visited.size - answeredCount,
                )})`}
              />
              <Legend
                swatch="bg-amber-100 border-amber-400"
                label={`${t("examRunner.markedReview")} (${reviewCount})`}
              />
              <Legend
                swatch="bg-white border-ink-200"
                label={t("examRunner.notVisited")}
              />
            </div>

            <div className="mt-5 pt-4 border-t border-ink-100 dark:border-ink-800 text-xs text-ink-500">
              <div className="flex justify-between mb-1">
                <span>{t("examRunner.answered")}</span>
                <span>
                  {answeredCount} / {total}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-ink-100 dark:bg-ink-800 overflow-hidden">
                <div
                  className="h-full bg-brand-500"
                  style={{ width: `${(answeredCount / total) * 100}%` }}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Legend({ swatch, label }) {
  return (
    <div className="flex items-center gap-2">
      <span className={`h-3 w-3 rounded-sm border ${swatch}`} />
      <span>{label}</span>
    </div>
  );
}
