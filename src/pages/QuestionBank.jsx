import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ListChecks, Filter, Trash2, Loader2, AlertCircle, Eye, RefreshCw,
  ArrowRight, Play, PlusCircle,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { questionApi, examApi } from '../lib/api.js';
import Breadcrumbs from '../components/Breadcrumbs.jsx';
import EmptyState from '../components/EmptyState.jsx';

const DIFFICULTIES = ['any', 'easy', 'medium', 'hard'];

export default function QuestionBank() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sourceTab, setSourceTab] = useState('');

  const [difficulty, setDifficulty] = useState('');
  const [language, setLanguage] = useState('');
  const [showAnswers, setShowAnswers] = useState({});

  const [examCount, setExamCount] = useState(10);
  const [examDuration, setExamDuration] = useState(10);
  const [examDifficulty, setExamDifficulty] = useState('any');
  const [examLoading, setExamLoading] = useState(false);
  const [examError, setExamError] = useState('');

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [difficulty, language, sourceTab]);

  async function load() {
    setLoading(true);
    setError('');
    try {
      const filters = {};
      if (sourceTab) filters.sourceType = sourceTab;
      if (difficulty) filters.difficulty = difficulty;
      if (language) filters.language = language;
      const data = await questionApi.list(filters);
      setQuestions(data.items || []);
    } catch (err) {
      setError(err.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm(t('questionBank.deleteQuestion'))) return;
    try {
      await questionApi.remove(id);
      setQuestions((q) => q.filter((x) => x._id !== id));
    } catch (err) {
      setError(err.message || t('common.error'));
    }
  }

  function toggleAnswer(id) {
    setShowAnswers((s) => ({ ...s, [id]: !s[id] }));
  }

  async function buildExam() {
    setExamError('');
    setExamLoading(true);
    try {
      const data = await examApi.build({
        title: 'Question Bank Exam',
        count: examCount,
        durationMin: examDuration,
        difficulty: examDifficulty,
      });
      const exam = data.exam;
      const mapped = exam.questions.map((row) => {
        const doc = row.questionId;
        return {
          id: doc._id,
          subjectId: doc.subjectId,
          topicId: doc.topicId,
          difficulty: doc.difficulty,
          type: 'mcq',
          sourceType: doc.sourceType,
          question: doc.question,
          options: doc.options,
          answer: doc.answer,
          explanation: doc.explanation,
        };
      });
      navigate('/exam/run', {
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
      setExamError(err.message || t('common.error'));
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
        items={[
          { label: t('nav.home'), to: '/' },
          { label: t('questionBank.title') },
        ]}
      />

      <div className="max-w-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <div className="h-11 w-11 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center shrink-0">
            <ListChecks className="h-6 w-6 text-brand-600 dark:text-brand-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              {t('questionBank.title')}
            </h1>
            <p className="text-sm text-ink-500">
              {t('questionBank.subtitle')}
            </p>
          </div>
          <Link
            to="/question-bank/create"
            className="btn-primary whitespace-nowrap"
          >
            <PlusCircle className="h-4 w-4" /> {t('questionBank.create')}
          </Link>
        </div>

        <div className="mt-6 border-b border-ink-100 dark:border-ink-800">
          <div className="flex gap-1 overflow-x-auto">
            {[
              { id: '', label: t('questionBank.tabAll') },
              { id: 'user', label: t('questionBank.tabMine') },
              { id: 'ai', label: t('questionBank.tabAi') },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSourceTab(tab.id)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  sourceTab === tab.id
                    ? 'border-brand-600 text-brand-700 dark:text-brand-300'
                    : 'border-transparent text-ink-500 hover:text-ink-900 dark:hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 card p-6">
        <h2 className="font-semibold mb-4">{t('questionBank.buildExam')}</h2>
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label className="block text-xs text-ink-500 mb-1.5">
              {t('questionBank.questions')}
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
            <label className="block text-xs text-ink-500 mb-1.5">
              {t('questionBank.minutes')}
            </label>
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
              {t('questionBank.difficulty')}
            </label>
            <select
              value={examDifficulty}
              onChange={(e) => setExamDifficulty(e.target.value)}
              className="input text-sm"
            >
              {DIFFICULTIES.map((d) => (
                <option key={d} value={d}>
                  {d === 'any' ? t('questionBank.any') : d}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="button"
              onClick={buildExam}
              disabled={examLoading || questions.length === 0}
              className="btn-primary w-full"
            >
              {examLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />{' '}
                  {t('questionBank.building')}
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" /> {t('questionBank.startExam')}
                </>
              )}
            </button>
          </div>
        </div>
        {examError && (
          <div className="mt-3 text-sm text-red-600">{examError}</div>
        )}
        <div className="mt-3 text-xs text-ink-500">
          {t('questionBank.examNote')}
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-4">
        <div className="card p-4">
          <div className="text-xs text-ink-500">
            {t('questionBank.totalQuestions')}
          </div>
          <div className="text-2xl font-bold mt-1">{stats.total}</div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-ink-500">{t('examBuilder.easy')}</div>
          <div className="text-2xl font-bold mt-1">
            {stats.byDifficulty.easy}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-ink-500">{t('examBuilder.medium')}</div>
          <div className="text-2xl font-bold mt-1">
            {stats.byDifficulty.medium}
          </div>
        </div>
        <div className="card p-4">
          <div className="text-xs text-ink-500">{t('examBuilder.hard')}</div>
          <div className="text-2xl font-bold mt-1">
            {stats.byDifficulty.hard}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-sm text-ink-500">
          <Filter className="h-4 w-4" /> {t('questionBank.filter')}
        </div>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="input !w-auto !py-2 text-sm"
        >
          <option value="">{t('questionBank.anyDifficulty')}</option>
          <option value="easy">{t('examBuilder.easy')}</option>
          <option value="medium">{t('examBuilder.medium')}</option>
          <option value="hard">{t('examBuilder.hard')}</option>
        </select>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="input !w-auto !py-2 text-sm"
        >
          <option value="">{t('questionBank.anyLanguage')}</option>
          <option value="en">English</option>
          <option value="bn">বাংলা</option>
        </select>
        <button type="button" onClick={load} className="btn-secondary text-sm">
          <RefreshCw className="h-3.5 w-3.5" /> {t('questionBank.refresh')}
        </button>
      </div>

      {error && (
        <div className="mt-4 card p-4 bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div className="text-sm text-red-800 dark:text-red-300">{error}</div>
        </div>
      )}

      <div className="mt-6 space-y-3">
        {loading ? (
          <div className="card p-10 text-center text-sm text-ink-500 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> {t('common.loading')}
          </div>
        ) : questions.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title={t('questionBank.noQuestions')}
            description={t('questionBank.noQuestionsSub')}
            action={
              <div className="flex flex-wrap gap-2 justify-center">
                <Link to="/ai-lab" className="btn-secondary">
                  {t('practice.openAiLab')}
                </Link>
                <Link to="/question-bank/create" className="btn-primary">
                  <PlusCircle className="h-4 w-4" /> {t('questionBank.create')}
                </Link>
              </div>
            }
          />
        ) : (
          questions.map((q) => (
            <div key={q._id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="badge bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300">
                    {q.subjectId}
                  </span>
                  {q.section && (
                    <span className="badge bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300">
                      {q.section}
                    </span>
                  )}
                  <span className="badge bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300">
                    {q.difficulty}
                  </span>
                  <span className="badge bg-ink-100 dark:bg-ink-800 text-ink-700 dark:text-ink-300">
                    {q.sourceType === 'user'
                      ? t('questionBank.mine')
                      : q.sourceType}
                  </span>
                  {q.language === 'bn' && (
                    <span className="badge bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
                      বাংলা
                    </span>
                  )}
                  {q.isPublic && (
                    <span className="badge bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300">
                      {t('questionBank.public')}
                    </span>
                  )}
                  {q.status === 'pending' && (
                    <span className="badge bg-ink-100 dark:bg-ink-800 text-ink-500">
                      {t('questionBank.pendingReview')}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleAnswer(q._id)}
                    className="btn-secondary text-xs"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    {showAnswers[q._id]
                      ? t('questionBank.hideAnswer')
                      : t('questionBank.showAnswer')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(q._id)}
                    className="btn-ghost text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
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
                            ? 'border-green-300 bg-green-50 dark:bg-green-950/40 text-green-900 dark:text-green-300'
                            : 'border-ink-200 dark:border-ink-700 bg-white dark:bg-ink-900'
                        }`}
                      >
                        <span className="h-5 w-5 rounded-full border border-current/30 flex items-center justify-center text-xs font-semibold">
                          {String.fromCharCode(65 + j)}
                        </span>
                        <span>{opt}</span>
                      </li>
                    ))}
                  </ul>
                  {q.explanation && (
                    <div className="mt-3 text-xs bg-ink-100/60 dark:bg-ink-800/60 border border-ink-200 dark:border-ink-700 rounded-md p-3">
                      <span className="font-semibold">
                        {t('questionBank.explanation')}:{' '}
                      </span>
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