import { useEffect, useRef, useState } from 'react';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext.jsx';

const OPTIONS = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
];

export default function ThemeMenu() {
  const { preference, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function onClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const current = OPTIONS.find((o) => o.value === preference) || OPTIONS[2];
  const Icon = current.Icon;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm
                   text-ink-600 dark:text-ink-300
                   hover:bg-ink-100 dark:hover:bg-ink-800
                   transition-colors"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <Icon className="h-4 w-4" />
        <span className="hidden sm:inline font-medium">{current.label}</span>
        <ChevronDown className="h-3 w-3" />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-1 w-40 py-1 rounded-xl bg-white dark:bg-ink-900
                     border border-ink-200 dark:border-ink-800 shadow-lg z-50
                     animate-fade-in"
        >
          {OPTIONS.map((o) => {
            const OptIcon = o.Icon;
            const isActive = preference === o.value;
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  setTheme(o.value);
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition-colors ${
                  isActive
                    ? 'text-brand-700 dark:text-brand-300 bg-brand-50 dark:bg-brand-950/40'
                    : 'text-ink-700 dark:text-ink-300 hover:bg-ink-100 dark:hover:bg-ink-800'
                }`}
                role="menuitem"
              >
                <OptIcon className="h-4 w-4" />
                {o.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}