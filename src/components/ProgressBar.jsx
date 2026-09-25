export default function ProgressBar({ value = 0, className = '' }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className={`h-1.5 w-full rounded-full bg-ink-100 overflow-hidden ${className}`}>
      <div
        className="h-full bg-brand-500 transition-all"
        style={{ width: `${v}%` }}
      />
    </div>
  );
}