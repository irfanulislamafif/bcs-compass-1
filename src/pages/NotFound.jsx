import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 text-center">
      <div>
        <div className="text-6xl font-extrabold text-brand-600">404</div>
        <h1 className="mt-4 text-xl font-semibold">{t('notFound.title')}</h1>
        <p className="mt-2 text-sm text-ink-500">{t('notFound.subtitle')}</p>
        <Link to="/" className="btn-primary mt-6">
          {t('notFound.backHome')}
        </Link>
      </div>
    </div>
  );
}