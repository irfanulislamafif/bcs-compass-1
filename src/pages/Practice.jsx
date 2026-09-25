import { useEffect, useMemo, useState } from "react";
import {
  Link,
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
import { buildSession, getQuestionById } from "../data/demoQuestions.jsx";
import { getSubjectById, getTopicById } from "../data/demoData.jsx";
import { recordAttempt, recordMistake } from "../lib/sessionStore.js";
import { getActiveMistakeQuestionIds } from "../lib/progress.js";
import Breadcrumbs from "../components/Breadcrumbs.jsx";
import QuestionCard from "../components/QuestionCard.jsx";
import EmptyState from "../components/EmptyState.jsx";

/**
 * Practice modes:
 *  - /practice/topic/:subjectId/:topicId   → practice a topic
 *  - /practice/subject/:subjectId          → practice a subject (mixed topics)
 *  - /practice?mode=mistakes               → practice active mistakes
 *  - /practice?limit=10&subjectId=&topicId=&difficulty=
 */
export default function Practice() {
  const navigate = useNavigate();
  const { subjectId: subjFromPath, topicId: topicFromPath } = useParams();
  const [searchParams] = useSearchParams();

  const subjectId = subjFromPath || searchParams.get("subjectId") || undefined;
  const topicId = topicFromPath || searchParams.get("topicId") || undefined;
  const difficulty = searchParams.get("difficulty") || "any";
  const limit = Number(searchParams.get("limit") || 10);
  const mode = searchParams.get("mode") || "normal";

  /* ------- Build session once on mount ------- */
  const questions = useMemo(() => {
    if (mode === "mistakes") {
      const ids = getActiveMistakeQuestionIds();
      const list = ids.map((id) => getQuestionById(id)).filter(Boolean);
      return list.sort(() => Math.random() - 0.5);
    }
    return buildSession({ subjectId, topicId, difficulty, limit });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, subjectId, topicId, difficulty, limit]);

  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionIndex]: selectedOption }
  const [revealed, setRevealed] = useState({}); // { [questionIndex]: true }
  const [startedAt] = useState(() => Date.now());

  const current = questions[index];
  const total = questions.length;
  const isLast = index === total - 1;
  const allAnswered = Object.keys(answers).length === total;

  const subject = subjectId ? getSubjectById(subjectId) : null;
  const topicLookup =
    subjectId && topicId ? getTopicById(subjectId, topicId) : null;
  const topic = topicLookup?.topic || null;

  /* ------- Handlers ------- */

  function handleSelect(optionIdx) {
    if (revealed[index]) return;
    setAnswers((prev) => ({ ...prev, [index]: optionIdx }));
  }

  function handleCheck() {
    if (answers[index] == null) return;
    const selected = answers[index];
    const correct = selected === current.answer;

    setRevealed((prev) => ({ ...prev, [index]: true }));

    // Persist attempt + mistake
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
      recordMistake({
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
      state: { results, timeSpentMs, subjectId, topicId },
      replace: true,
    });
  }

  /* ------- Empty state ------- */
  if (total === 0) {
    if (mode === "mistakes") {
      return (
        <div className="container-page py-12">
          <EmptyState
            icon={CheckCircle2}
            title="No active mistakes to practice"
            description="Either you haven't gotten any questions wrong yet, or you've marked all your mistakes as understood. Great work!"
            action={
              <Link to="/mistakes" className="btn-primary">
                Open Mistake Book
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
          title="No questions available for this selection"
          description="Try a different topic, or explore the Subjects page to find questions to practice."
          action={
            <Link to="/subjects" className="btn-primary">
              Browse Subjects
            </Link>
          }
        />
      </div>
    );
  }

  /* ------- Render ------- */
  return (
    <div className="container-page py-10 md:py-14">
      <Breadcrumbs
        items={[
          { label: "Home", to: "/" },
          ...(mode === "mistakes"
            ? [
                { label: "Mistake Book", to: "/mistakes" },
                { label: "Practice Mistakes" },
              ]
            : [
                { label: "Subjects", to: "/subjects" },
                subject
                  ? { label: subject.name, to: `/subjects/${subject.id}` }
                  : null,
                topic
                  ? {
                      label: topic.name,
                      to: `/topics/${subject.id}/${topic.id}`,
                    }
                  : null,
                { label: "Practice" },
              ].filter(Boolean)),
        ]}
      />

      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-600">
          <ArrowLeft className="h-4 w-4" /> Back
        </button>

        <div className="text-sm text-ink-500">
          {mode === "mistakes" ? "Mistakes Practice" : "Practice Mode"} ·{" "}
          {Object.keys(answers).length}/{total} answered
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Main question area */}
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
              <ArrowLeft className="h-4 w-4" /> Previous
            </button>

            {!revealed[index] ? (
              <button
                type="button"
                onClick={handleCheck}
                disabled={answers[index] == null}
                className="btn-primary">
                <CheckCircle2 className="h-4 w-4" /> Check Answer
              </button>
            ) : isLast ? (
              <button type="button" onClick={finish} className="btn-primary">
                Finish Practice <Flag className="h-4 w-4" />
              </button>
            ) : (
              <button type="button" onClick={goNext} className="btn-primary">
                Next <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>

          {!allAnswered && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={finish}
                className="text-sm text-ink-500 hover:text-brand-600 underline underline-offset-2">
                Finish early and see results
              </button>
            </div>
          )}
        </div>

        {/* Sidebar: question navigator */}
        <aside className="card p-5 h-fit">
          <h3 className="font-semibold text-sm mb-3">Questions</h3>
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
                  "bg-white border-ink-200 text-ink-700 hover:border-brand-300";

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

          <div className="mt-5 pt-4 border-t border-ink-100 space-y-2 text-xs text-ink-500">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-brand-100 border border-brand-300" />
              Answered
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-green-100 border border-green-300" />
              Correct
            </div>
            <div className="flex items-center gap-2">
              <span className="h-3 w-3 rounded-sm bg-red-100 border border-red-300" />
              Incorrect
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
