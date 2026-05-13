export function HistorySidebarSkeleton() {
  return (
    <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700 animate-pulse">
      <div className="w-32 h-3.5 bg-slate-600 rounded mb-4" />
      <ul className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <li key={i} className="bg-slate-700/50 rounded-xl p-3 space-y-1.5">
            <div className="w-3/4 h-4 bg-slate-600 rounded" />
            <div className="w-1/2 h-3 bg-slate-700 rounded" />
          </li>
        ))}
      </ul>
    </div>
  );
}
