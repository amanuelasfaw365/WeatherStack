export function WeatherCardSkeleton() {
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-2xl p-6 border border-slate-600 shadow-xl animate-pulse">
      {/* Header row */}
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-6 bg-slate-600 rounded" />
            <div className="w-40 h-7 bg-slate-600 rounded-lg" />
          </div>
          <div className="w-28 h-4 bg-slate-700 rounded" />
        </div>
        <div className="w-16 h-16 bg-slate-600 rounded-xl" />
      </div>

      {/* Temperature */}
      <div className="mb-4 space-y-2">
        <div className="w-32 h-14 bg-slate-600 rounded-xl" />
        <div className="w-48 h-4 bg-slate-700 rounded" />
        <div className="w-36 h-4 bg-slate-700 rounded" />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-slate-900/50 rounded-xl p-3 space-y-1.5">
            <div className="w-16 h-3 bg-slate-700 rounded" />
            <div className="w-24 h-4 bg-slate-600 rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
