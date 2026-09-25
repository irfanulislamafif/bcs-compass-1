import { CheckCircle2, XCircle, Circle } from 'lucide-react';

/**
 * Props:
 * - question (object)
 * - selectedIndex (number|null)
 * - onSelect (index) => void
 * - reveal (bool) — when true, shows correct/incorrect coloring + explanation
 * - disabled (bool)
 * - index (number) — 1-based for display
 * - total (number)
 */
export default function QuestionCard({
  question,
  selectedIndex,
  onSelect,
  reveal = false,
  disabled = false,
  index,
  total,
}) {
  const optionLetter = (i) => String.fromCharCode(65 + i);

  function optionClass(i) {
    const isSelected = selectedIndex === i;
    const isCorrect = reveal && i === question.answer;
    const isWrong = reveal && isSelected && i !== question.answer;

    if (isCorrect) {
      return 'border-green-500 bg-green-50 text-green-900';
    }
    if (isWrong) {
      return 'border-red-500 bg-red-50 text-red-900';
    }
    if (isSelected) {
      return 'border-brand-500 bg-brand-50 text-ink-900';
    }
    return 'border-ink-200 bg-white hover:border-brand-300 hover:bg-brand-50/40';
  }

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between text-xs text-ink-500 mb-3">
        <span>
          Question {index} of {total}
        </span>
        <span className="capitalize">{question.difficulty}</span>
      </div>

      <h2 className="text-base md:text-lg font-semibold leading-relaxed">
        {question.question}
      </h2>

      <ul className="mt-5 space-y-2.5">
        {question.options.map((opt, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => !disabled && onSelect(i)}
              disabled={disabled}
              className={`w-full text-left px-4 py-3 rounded-lg border flex items-center gap-3 transition-colors disabled:cursor-not-allowed ${optionClass(
                i
              )}`}
            >
              <span className="shrink-0 h-6 w-6 rounded-full border border-current/30 flex items-center justify-center text-xs font-semibold">
                {optionLetter(i)}
              </span>
              <span className="text-sm flex-1">{opt}</span>
              {reveal && i === question.answer && (
                <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
              )}
              {reveal && selectedIndex === i && i !== question.answer && (
                <XCircle className="h-4 w-4 text-red-600 shrink-0" />
              )}
              {!reveal && selectedIndex === i && (
                <Circle className="h-3.5 w-3.5 fill-current shrink-0" />
              )}
            </button>
          </li>
        ))}
      </ul>

      {reveal && (
        <div className="mt-5 p-4 rounded-lg bg-ink-100/60 border border-ink-200">
          <div className="text-xs font-semibold text-ink-700 mb-1">
            Explanation
          </div>
          <p className="text-sm text-ink-700 leading-relaxed">
            {question.explanation}
          </p>
        </div>
      )}
    </div>
  );
}