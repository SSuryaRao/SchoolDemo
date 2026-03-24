export default function EmptyState({ icon = '📭', title = 'No results', message = 'Nothing to show here yet.', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="text-4xl mb-3">{icon}</div>
      <p className="text-base font-semibold text-gray-700">{title}</p>
      <p className="text-sm text-gray-400 mt-1 max-w-xs">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
