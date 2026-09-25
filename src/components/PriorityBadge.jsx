import { ArrowUp, Minus, Star } from 'lucide-react';

const MAP = {
  high:   { label: 'High Priority', cls: 'bg-red-50 text-red-700',       Icon: ArrowUp },
  medium: { label: 'Study',         cls: 'bg-amber-50 text-amber-700',   Icon: Minus   },
  low:    { label: 'Low Priority',  cls: 'bg-ink-100 text-ink-700',      Icon: Minus   },
  master: { label: 'Master',        cls: 'bg-green-50 text-green-700',   Icon: Star    },
};

export default function PriorityBadge({ priority = 'medium' }) {
  const { label, cls, Icon } = MAP[priority] || MAP.medium;
  return (
    <span className={`badge ${cls}`}>
      <Icon className="h-3 w-3" /> {label}
    </span>
  );
}