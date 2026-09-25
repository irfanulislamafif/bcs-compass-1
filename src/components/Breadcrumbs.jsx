import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

/**
 * items: [{ label, to? }]
 * The last item is treated as the current page (no link).
 */
export default function Breadcrumbs({ items = [] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-500">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {item.to && !last ? (
                <Link to={item.to} className="hover:text-brand-600">
                  {item.label}
                </Link>
              ) : (
                <span className={last ? 'text-ink-900 font-medium' : ''}>{item.label}</span>
              )}
              {!last && <ChevronRight className="h-3.5 w-3.5 text-ink-300" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}