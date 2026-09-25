export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="card p-10 text-center">
      {Icon && (
        <div className="mx-auto h-12 w-12 rounded-full bg-ink-100 flex items-center justify-center">
          <Icon className="h-6 w-6 text-ink-500" />
        </div>
      )}
      <h3 className="mt-4 font-semibold">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-ink-500 max-w-md mx-auto">{description}</p>
      )}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}