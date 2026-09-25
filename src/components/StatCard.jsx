export default function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs text-ink-500">{label}</span>
        {Icon && (
          <div className="h-8 w-8 rounded-lg bg-brand-50 flex items-center justify-center">
            <Icon className="h-4 w-4 text-brand-600" />
          </div>
        )}
      </div>
      <div className="mt-2 text-2xl font-bold">{value}</div>
      {sub && <div className="mt-1 text-xs text-ink-500">{sub}</div>}
    </div>
  );
}