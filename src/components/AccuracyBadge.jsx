import { Target } from 'lucide-react';

function tone(v) {
  if (v >= 70) return 'text-green-700 bg-green-50';
  if (v >= 55) return 'text-amber-700 bg-amber-50';
  return 'text-red-700 bg-red-50';
}

export default function AccuracyBadge({ value = 0 }) {
  return (
    <span className={`badge ${tone(value)}`}>
      <Target className="h-3 w-3" /> {value}% accuracy
    </span>
  );
}