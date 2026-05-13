"use client";

interface HistoryItem {
  id: string;
  country: string;
  city: string | null;
  lat: number | null;
  lon: number | null;
  searchedAt: string;
}

interface HistorySidebarProps {
  history: HistoryItem[];
  onReSearch: (item: HistoryItem) => void;
}

export function HistorySidebar({ history, onReSearch }: HistorySidebarProps) {
  return (
    <div className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
      <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
        Recent Searches
      </h3>
      {history.length === 0 ? (
        <p className="text-slate-500 text-sm">No searches yet</p>
      ) : (
        <ul className="space-y-2">
          {history.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onReSearch(item)}
                className="w-full text-left bg-slate-700/50 hover:bg-slate-700 rounded-xl p-3 transition-colors group"
              >
                <p className="text-white font-medium text-sm group-hover:text-blue-300 transition-colors">
                  {item.city ? `${item.city}, ` : ""}{item.country}
                </p>
                <p className="text-slate-500 text-xs mt-0.5">
                  {new Date(item.searchedAt).toLocaleString()}
                </p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
