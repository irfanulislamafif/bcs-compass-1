import { Link } from 'react-router-dom';
import { BookOpen, ArrowRight } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { demoSubjects } from '../data/demoData.jsx';
import AccuracyBadge from '../components/AccuracyBadge.jsx';
import ProgressBar from '../components/ProgressBar.jsx';

export default function Subjects() {
  const { t } = useTranslation();

  return (
    <div className="container-page py-12 md:py-16">
      <div className="max-w-2xl">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight">
          {t('subjects.title')}
        </h1>
        <p className="mt-3 text-ink-500">{t('subjects.subtitle')}</p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {demoSubjects.map((s) => (
          <div key={s.id} className="card p-6 flex flex-col card-hover">
            <div className="flex items-start justify-between">
              <div className="h-10 w-10 rounded-lg bg-brand-50 dark:bg-brand-950/40 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-brand-600 dark:text-brand-400" />
              </div>
              <AccuracyBadge value={s.accuracy} />
            </div>

            <h3 className="mt-4 font-semibold text-lg">{s.name}</h3>
            <p className="mt-2 text-sm text-ink-500 flex-1">{s.description}</p>

            <div className="mt-4">
              <div className="flex justify-between text-xs text-ink-500 mb-1.5">
                <span>{t('subjects.progress')}</span>
                <span>{s.progress}%</span>
              </div>
              <ProgressBar value={s.progress} />
              <div className="mt-2 text-xs text-ink-500">
                {s.questionsAttempted} {t('subjects.questionsAttempted')} ·{' '}
                {s.topics.length} {t('subjects.topics')}
              </div>
            </div>

            <Link to={`/subjects/${s.id}`} className="btn-secondary mt-5 w-full">
              {t('subjects.viewSubject')} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </div>

      <div className="mt-12 card p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold">{t('subjects.readyToPractice')}</h3>
          <p className="text-sm text-ink-500 mt-1">{t('subjects.browsePrompt')}</p>
        </div>
        <Link to="/register" className="btn-primary">
          {t('nav.startPreparing')} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}