import { useTranslation } from 'react-i18next';
import { Languages } from 'lucide-react';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const current = i18n.language === 'bn' ? 'bn' : 'en';

  function toggle() {
    i18n.changeLanguage(current === 'bn' ? 'en' : 'bn');
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium
                 text-ink-600 dark:text-ink-300
                 hover:bg-ink-100 dark:hover:bg-ink-800
                 transition-colors"
      aria-label="Switch language"
      title={current === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
    >
      <Languages className="h-4 w-4" />
      <span>{current === 'bn' ? 'EN' : 'বাং'}</span>
    </button>
  );
}