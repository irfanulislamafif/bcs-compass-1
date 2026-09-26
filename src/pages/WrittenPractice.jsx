import { useState } from 'react';
import {
  PenLine, Loader2, AlertCircle, Sparkles, CheckCircle2, XCircle,
  TrendingUp, BookOpen, RotateCcw, Send,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { aiApi } from '../lib/api.js';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import ProgressBar from '../components/ProgressBar.jsx';

const LANGS = [
  { value: 'auto', label: 'Auto' },
  { value: 'bn', label: 'বাংলা' },
  { value: 'en', label: 'English' },
];

export default function WrittenPractice() {
  const { t } = useTranslation();
  const [material, setMaterial] = useState('');
  const [outputLanguage, setOutputLanguage] = useState('auto');
  const [questionCount, setQuestionCount] = useState(3);

  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [questions, setQuestions] = useState([]);

  const [activeIdx, setActiveIdx] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState('');

  const charCount = material.length;
  const canGenerate =
    charCount >= 50 && charCount <= 20000 && !loadingQuestions;

  const active = questions[activeIdx];

  function loadSample() {
    setMaterial(
      'The Constitution of Bangladesh was adopted on 4 November 1972 and came into effect on 16 December 1972. ' +
        'It originally had 153 articles, 11 parts, and 7 schedules. It declares Bangladesh a unitary, independent, ' +
        'sovereign republic. Fundamental rights are guaranteed in Part III. The Prime Minister is the head of ' +
        'government and the President is the head of state. Article 7 declares the Constitution the supreme law.'
    );
  }

  async function generateQuestions() {
    setError('');
    setEvaluation(null);
    setUserAnswer('');
    setLoadingQuestions(true);
    try {
      const data = await aiApi.written({
        material,
        count: questionCount,
        outputLanguage,
      });
      const list = data.result?.questions || [];
      setQuestions(list);
      setActiveIdx(0);
    } catch (err) {
      setError(err.message || t('common.error'));
    } finally {
      setLoadingQuestions(false);
    }
  }

  function selectQuestion(idx) {
    setActiveIdx(idx);
    setUserAnswer('');
    setEvaluation(null);
    setError('');
  }

  async function submitAnswer() {
    if (!active) return;
    if (userAnswer.trim().length < 20) {
      setError(t('writtenPractice.minChars'));
      return;
    }
    setError('');
    setEvaluating(true);
    try {
      const data = await aiApi.evaluate({
        question: active.question,
        expectedPoints: active.expectedPoints || [],
        userAnswer: userAnswer.trim(),
        marks: 10,
        outputLanguage,
      });
      setEvaluation(data.result);
    } catch (err) {
      setError(err.message || t('common.error'));
    } finally {
      setEvaluating(false);
    }
  }

  function reset() {
    setQuestions([]);
    setActiveIdx(0);
    setUserAnswer('');
    setEvaluation(null);
    setError('');
  }

  return (
    <div className="container-page py-10 md:py-14">
      <Breadcrumbs
        items={[
          { label: t('nav.home'), to: '/' },
          { label: t('writtenPractice.title') },
        ]}
      />

      <div className="max-w-2xl">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center">
            <PenLine className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t('writtenPractice.title')}
            </h1>
            <p className="text-sm text-ink-500">
              {t('writtenPractice.subtitle')}
            </p>
          </div>
        </div>
      </div>

      {questions.length === 0 && (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-2">
              <label htmlFor="material" className="block text-sm font-medium">
                {t('writtenPractice.studyMaterial')}
              </label>
              <button
                type="button"
                onClick={loadSample}
                className="text-xs text-brand-600 hover:underline"
              >
                {t('writtenPractice.loadSample')}
              </button>
            </div>
            <textarea
              id="material"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              rows={10}
              placeholder={t('writtenPractice.pasteHere')}
              className="input resize-y font-mono text-sm leading-relaxed"
            />
            <div className="mt-2 text-xs text-ink-500">
              {t('writtenPractice.chars', {
                count: charCount.toLocaleString(),
              })}
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs text-ink-500 mb-1.5">
                  {t('writtenPractice.outputLanguage')}
                </label>
                <select
                  value={outputLanguage}
                  onChange={(e) => setOutputLanguage(e.target.value)}
                  className="input text-sm"
                >
                  {LANGS.map((l) => (
                    <option key={l.value} value={l.value}>
                      {l.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-ink-500 mb-1.5">
                  {t('writtenPractice.howManyQuestions')}
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={questionCount}
                  onChange={(e) =>
                    setQuestionCount(
                      Math.min(10, Math.max(1, Number(e.target.value) || 1))
                    )
                  }
                  className="input text-sm"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={generateQuestions}
              disabled={!canGenerate}
              className="btn-primary mt-6 w-full"
            >
              {loadingQuestions ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />{' '}
                  {t('writtenPractice.generating')}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />{' '}
                  {t('writtenPractice.generateQuestions')}
                </>
              )}
            </button>

            {error && (
              <div className="mt-4 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 text-sm">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <aside className="card p-5 h-fit">
            <h3 className="font-semibold text-sm mb-3">
              {t('writtenPractice.howItWorks')}
            </h3>
            <ol className="space-y-2.5 text-sm text-ink-600 dark:text-ink-400">
              <li className="flex gap-2">
                <span className="text-brand-500 font-semibold">1.</span>
                {t('writtenPractice.howStep1')}
              </li>
              <li className="flex gap-2">
                <span className="text-brand-500 font-semibold">2.</span>
                {t('writtenPractice.howStep2')}
              </li>
              <li className="flex gap-2">
                <span className="text-brand-500 font-semibold">3.</span>
                {t('writtenPractice.howStep3')}
              </li>
              <li className="flex gap-2">
                <span className="text-brand-500 font-semibold">4.</span>
                {t('writtenPractice.howStep4')}
              </li>
            </ol>
            <p className="mt-4 text-xs text-ink-500">
              {t('writtenPractice.disclaimer')}
            </p>
          </aside>
        </div>
      )}

      {questions.length > 0 && (
        <>
          <div className="mt-8 flex items-center justify-between">
            <div className="text-sm text-ink-500">
              {t('writtenPractice.questionsCount', {
                count: questions.length,
              })}{' '}
              · {t('writtenPractice.currentlyOn', { n: activeIdx + 1 })}
            </div>
            <button
              type="button"
              onClick={reset}
              className="text-sm text-ink-500 hover:text-brand-600 inline-flex items-center gap-1"
            >
              <RotateCcw className="h-3.5 w-3.5" />{' '}
              {t('writtenPractice.newSession')}
            </button>
          </div>

          <div className="mt-4 grid gap-6 lg:grid-cols-[1fr_300px]">
            <div className="space-y-6">
              <div className="card p-6">
                <div className="flex flex-wrap items-center gap-2 text-xs mb-3">
                  <span className="badge bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300">
                    {t('result.question')} {activeIdx + 1}
                  </span>
                  {active?.type && (
                    <span className="badge bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300">
                      {active.type}
                    </span>
                  )}
                  {active?.difficulty && (
                    <span className="badge bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300">
                      {active.difficulty}
                    </span>
                  )}
                </div>
                <p className="font-medium">{active?.question}</p>

                {active?.expectedPoints?.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs font-semibold text-ink-500 mb-1">
                      {t('writtenPractice.hint')}
                    </div>
                    <ul className="text-sm space-y-1">
                      {active.expectedPoints.map((p, i) => (
                        <li key={i} className="flex gap-2 text-ink-600 dark:text-ink-400">
                          <span className="text-brand-500">•</span>
                          <span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {!evaluation && (
                <div className="card p-6">
                  <label
                    htmlFor="answer"
                    className="block text-sm font-medium mb-2"
                  >
                    {t('writtenPractice.yourAnswer')}
                  </label>
                  <textarea
                    id="answer"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    rows={10}
                    maxLength={5000}
                    placeholder={t('writtenPractice.answerPlaceholder')}
                    className="input resize-y text-sm leading-relaxed"
                  />
                  <div className="flex items-center justify-between mt-2 text-xs text-ink-500">
                    <span>
                      {t('writtenPractice.charsCount', {
                        count: userAnswer.length.toLocaleString(),
                      })}
                    </span>
                    {userAnswer.length > 0 && userAnswer.length < 20 && (
                      <span className="text-amber-600">
                        {t('writtenPractice.minChars')}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={submitAnswer}
                    disabled={evaluating || userAnswer.trim().length < 20}
                    className="btn-primary mt-4 w-full"
                  >
                    {evaluating ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />{' '}
                        {t('writtenPractice.evaluating')}
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />{' '}
                        {t('writtenPractice.submitForEval')}
                      </>
                    )}
                  </button>

                  {error && (
                    <div className="mt-3 flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-300 text-sm">
                      <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              )}

              {evaluation && (
                <EvaluationView
                  evaluation={evaluation}
                  userAnswer={userAnswer}
                  onRetry={() => {
                    setEvaluation(null);
                    setError('');
                  }}
                  t={t}
                />
              )}
            </div>

            <aside className="card p-5 h-fit lg:sticky lg:top-20">
              <h3 className="font-semibold text-sm mb-3">
                {t('practice.questions')}
              </h3>
              <ul className="space-y-2">
                {questions.map((q, i) => {
                  const isCurrent = i === activeIdx;
                  return (
                    <li key={i}>
                      <button
                        type="button"
                        onClick={() => selectQuestion(i)}
                        className={`w-full text-left px-3 py-2 rounded-md text-sm border transition-colors ${
                          isCurrent
                            ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300'
                            : 'border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900 text-ink-700 dark:text-ink-300 hover:border-brand-300'
                        }`}
                      >
                        <div className="font-medium">
                          {t('result.question')} {i + 1}
                        </div>
                        <div className="text-xs text-ink-500 truncate mt-0.5">
                          {q.question}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>
          </div>
        </>
      )}

      <div className="mt-12 card p-5 text-xs text-ink-500 flex items-start gap-2">
        <Sparkles className="h-4 w-4 text-brand-600 shrink-0 mt-0.5" />
        <div>{t('writtenPractice.disclaimer')}</div>
      </div>
    </div>
  );
}

function EvaluationView({ evaluation, userAnswer, onRetry, t }) {
  const {
    score,
    maxScore,
    percentage,
    verdict,
    strengths = [],
    missingPoints = [],
    corrections = [],
    suggestedImprovement,
    modelAnswerOutline = [],
  } = evaluation;

  const verdictColor =
    {
      excellent: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40',
      good: 'text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-950/40',
      average: 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40',
      weak: 'text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/40',
      poor: 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40',
    }[verdict] || 'text-ink-700 dark:text-ink-300 bg-ink-100 dark:bg-ink-800';

  return (
    <div className="space-y-6">
      <div className="card p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-xs text-ink-500">
              {t('writtenPractice.aiScore')}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-bold">{score}</span>
              <span className="text-ink-500">/ {maxScore}</span>
              <span className={`badge ${verdictColor} ml-2 capitalize`}>
                {verdict}
              </span>
            </div>
            <div className="mt-3 w-64 max-w-full">
              <ProgressBar value={percentage} />
              <div className="mt-1 text-xs text-ink-500">{percentage}%</div>
            </div>
          </div>

          <button type="button" onClick={onRetry} className="btn-secondary">
            <RotateCcw className="h-4 w-4" />{' '}
            {t('writtenPractice.rewriteAnswer')}
          </button>
        </div>
      </div>

      <div className="card p-5">
        <div className="text-xs font-semibold text-ink-500 mb-2">
          {t('writtenPractice.yourAnswerLabel')}
        </div>
        <p className="text-sm whitespace-pre-wrap text-ink-700 dark:text-ink-300">
          {userAnswer}
        </p>
      </div>

      {strengths.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <h3 className="font-semibold text-sm">
              {t('writtenPractice.strengths')}
            </h3>
          </div>
          <ul className="space-y-1.5 text-sm">
            {strengths.map((s, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-green-600 shrink-0">✓</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {missingPoints.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <XCircle className="h-4 w-4 text-red-600" />
            <h3 className="font-semibold text-sm">
              {t('writtenPractice.missingPoints')}
            </h3>
          </div>
          <ul className="space-y-1.5 text-sm">
            {missingPoints.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-red-500 shrink-0">•</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {corrections.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-amber-600" />
            <h3 className="font-semibold text-sm">
              {t('writtenPractice.corrections')}
            </h3>
          </div>
          <ul className="space-y-3 text-sm">
            {corrections.map((c, i) => (
              <li key={i}>
                <div className="font-medium text-ink-900 dark:text-white">
                  {c.issue}
                </div>
                <div className="text-ink-600 dark:text-ink-400 mt-0.5">
                  → {c.fix}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {suggestedImprovement && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-brand-600" />
            <h3 className="font-semibold text-sm">
              {t('writtenPractice.suggestedImprovement')}
            </h3>
          </div>
          <p className="text-sm text-ink-700 dark:text-ink-300 whitespace-pre-wrap">
            {suggestedImprovement}
          </p>
        </div>
      )}

      {modelAnswerOutline.length > 0 && (
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="h-4 w-4 text-ink-500" />
            <h3 className="font-semibold text-sm">
              {t('writtenPractice.modelAnswerOutline')}
            </h3>
          </div>
          <ul className="space-y-1.5 text-sm">
            {modelAnswerOutline.map((p, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-brand-500 shrink-0">{i + 1}.</span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}