import { useMemo, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Flag,
  ListChecks,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { buildSession, getQuestionById } from "../data/demoQuestions.jsx";
import { getSubjectById, getTopicById } from "../data/demoData.jsx";
import {
  recordAttempt,
  recordMistakeWithRevision,
} from "../lib/sessionStore.js";
import { getActiveMistakeQuestionIds } from "../lib/progress.js";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import QuestionCard from "../components/QuestionCard.jsx";
import EmptyState from "../components/EmptyState.jsx";

export default function Practice() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { subjectId: subjFromPath, topicId: topicFromPath } = useParams();
  const [searchParams] = useSearchParams();

  const subjectId = subjFromPath || searchParams.get("subjectId") || undefined;
  const topicId = topicFromPath || searchParams.get("topicId") || undefined;
  const difficulty = searchParams.get("difficulty") || "any";
  const limit = Number(searchParams.get("limit") || 10);
  const mode = searchParams.get("mode") || "normal";

  const aiQuestions = location.state?.aiQuestions || null;
  const aiMeta = location.state?.aiMeta || null;

  const questions = useMemo(() => {
    if (aiQuestions && aiQuestions.length > 0) return aiQuestions;
    if (mode === "mistakes") {
      const ids = getActiveMistakeQuestionIds();
      const list = ids.map((id) => getQuestionById(id)).filter(Boolean);
      return list.sort(() => Math.random() - 0.5);
    }
    return buildSession({ subjectId, topicId, difficulty, limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, subjectId, topicId, difficulty, limit, aiQuestions]);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState({});
  const [startedAt] = useState(() => Date.now());

  const current = questions[index];
  const total = questions.length;
  const isLast = index === total - 1;
  const allAnswered = Object.keys(answers).length === total;

  const subject = subjectId ? getSubjectById(subjectId) : null;
  const topicLookup =
    subjectId && topicId ? getTopicById(subjectId, topicId) : null;
  const topic = topicLookup?.topic || null;

  function handleSelect(optionIdx) {
    if (revealed[index]) return;
    setAnswers((prev) => ({ ...prev, [index]: optionIdx }));
  }

  function handleCheck() {
    if (answers[index] == null) return;
    const selected = answers[index];
    const correct = selected === current.answer;
    setRevealed((prev) => ({ ...prev, [index]: true }));

    const attempt = {
      questionId: current.id,
      subjectId: current.subjectId,
      topicId: current.topicId,
      selected,
      isCorrect: correct,
      at: Date.now(),
    };
    recordAttempt(attempt);
    if (!correct) {
      recordMistakeWithRevision({
        questionId: current.id,
        subjectId: current.subjectId,
        topicId: current.topicId,
        at: Date.now(),
      });
    }
  }

  function goNext() {
    if (!isLast) setIndex((i) => i + 1);
  }
  function goPrev() {
    if (index > 0) setIndex((i) => i - 1);
  }

  function finish() {
    const timeSpentMs = Date.now() - startedAt;
    const results = questions.map((q, i) => {
      const selected = answers[i] ?? null;
      return {
        question: q,
        selected,
        isCorrect: selected === q.answer,
      };
    });
    navigate("/practice/result", {
      state: {
        results,
        timeSpentMs,
        subjectId: aiMeta?.subjectId || subjectId,
        topicId: aiMeta?.topicId || topicId,
        fromAI: !!aiQuestions,
      },
      replace: true,
    });
  }

  if (total === 0) {
    if (aiQuestions && aiQuestions.length === 0) {
      return (
        <div className="container-page py-12">
          <EmptyState
            icon={ListChecks}
            title={t("practice.noAiQuestions")}
            description={t("practice.noAiQuestionsSub")}
            action={
              <Link to="/ai-lab" className="btn-primary">
                {t("practice.openAiLab")}
              </Link>
            }
          />
        </div>
      );
    }

    if (mode === "mistakes" && !aiQuestions) {
      return (
        <div className="container-page py-12">
          <EmptyState
            icon={CheckCircle2}
            title={t("practice.noMistakes")}
            description={t("practice.noMistakesSub")}
            action={
              <Link to="/mistakes" className="btn-primary">
                {t("practice.openMistakeBook")}
              </Link>
            }
          />
        </div>
      );
    }

    return (
      <div className="container-page py-12">
        <EmptyState
          icon={ListChecks}
          title={t("practice.noQuestions")}
          description={t("practice.noQuestionsSub")}
          action={
            <Link to="/subjects" className="btn-primary">
              {t("practice.browseSubjects")}
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="container-page py-10 md:py-14">
      <Breadcrumbs
        items={[
          { label: t("nav.home"), to: "/" },
          ...(aiQuestions
            ? [
                { label: t("nav.aiLab"), to: "/ai-lab" },
                { label: t("practice.aiMode") },
              ]
            : mode === "mistakes"
              ? [
                  { label: t("nav.mistakes"), to: "/mistakes" },
                  { label: t("practice.mistakesMode") },
                ]
              : [
                  { label: t("nav.subjects"), to: "/subjects" },
                  subject
                    ? { label: subject.name, to: `/subjects/${subject.id}` }
                    : null,
                  topic
                    ? {
                        label: topic.name,
                        to: `/topics/${subject.id}/${topic.id}`,
                      }
                    : null,
                  { label: t("practice.mode") },
                ].filter(Boolean)),
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> {t("common.back")}
        </button>

        <div className="text-sm text-ink-500">
          {aiQuestions
            ? t("practice.aiMode")
            : mode === "mistakes"
              ? t("practice.mistakesMode")
              : t("practice.mode")}{" "}
          · {Object.keys(answers).length}/{total} {t("practice.answered")}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div>
          <QuestionCard
            question={current}
            selectedIndex={answers[index] ?? null}
            onSelect={handleSelect}
            reveal={!!revealed[index]}
            disabled={!!revealed[index]}
            index={index + 1}
            total={total}
          />

          <div className="mt-5 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={goPrev}
              disabled={index === 0}
              className="btn-secondary">
              <ArrowLeft className="h-4 w-4" /> {t("practice.previousQuestion")}
            </button>

            {!revealed[index] ? (
              <button
                type="button"
                onClick={handleCheck}
                disabled={answers[index] == null}
                className="btn-primary">
                <CheckCircle2 className="h-4 w-4" /> {t("practice.checkAnswer")}
              </button>
            ) : isLast ? (
              <button type="button" onClick={finish} className="btn-primary">
                {t("practice.finish")} <Flag className="h-4 w-4" />
              </button>
            ) : (
              <button type="button" onClick={goNext} className="btn-primary">
                {t("practice.nextQuestion")} <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {!allAnswered && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={finish}
                className="text-sm text-ink-500 hover:text-brand-600 underline underline-offset-2">
                {t("practice.finishEarly")}
              </button>
            </div>
          )}
        </div>

        <aside className="card p-5 h-fit">
          <h3 className="font-semibold text-sm mb-3">
            {t("practice.questions")}
          </h3>
          <div className="grid grid-cols-5 gap-2">
            {questions.map((q, i) => {
              const answered = answers[i] != null;
              const isCurrent = i === index;
              const wasCorrect = revealed[i] && answers[i] === q.answer;
              const wasWrong =
                revealed[i] && answers[i] != null && answers[i] !== q.answer;

              let cls =
                "h-9 w-9 rounded-md border text-xs font-medium flex items-center justify-center transition-colors ";
              if (wasCorrect)
                cls += "bg-green-100 border-green-300 text-green-800";
              else if (wasWrong)
                cls += "bg-red-100 border-red-300 text-red-800";
              else if (answered)
                cls += "bg-brand-100 border-brand-300 text-brand-800";
              else
                cls +=
                  "bg-white dark:bg-ink-900 border-ink-200 dark:border-ink-800 text-ink-700 dark:text-ink-300 hover:border-brand-300";

              if (isCurrent) cls += " ring-2 ring-brand-500 ring-offset-1";

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={cls}
                  aria-label={`Go to question ${i + 1}`}>
                  {i + 1}
                </button>
              );
            })}
          </div>

          <div className="mt-5 pt-4 border-t border-ink-100 dark:border-ink-800 space-y-2 text-xs text-ink-500">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-brand-100 border border-brand-300" />
              {t("practice.answeredStatus")}
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-green-100 border border-green-300" />
              {t("practice.correct")}
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-red-100 border border-red-300" />
              {t("practice.incorrect")}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
