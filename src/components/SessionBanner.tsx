"use client";

interface SessionBannerProps {
  country: string;
  timestamp: string;
  onResume: () => void;
  onDismiss: () => void;
}

export function SessionBanner({ country, timestamp, onResume, onDismiss }: SessionBannerProps) {
  const date = new Date(timestamp).toLocaleString();

  return (
    <div className="bg-amber-950 border border-amber-700 rounded-2xl p-4 flex items-center justify-between gap-4">
      <div>
        <p className="text-amber-300 font-medium text-sm">Resume last session?</p>
        <p className="text-amber-200/70 text-xs mt-0.5">
          You were viewing <span className="font-semibold text-amber-200">{country}</span> on {date}
        </p>
      </div>
      <div className="flex gap-2 shrink-0">
        <button
          onClick={onResume}
          className="bg-amber-600 hover:bg-amber-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors"
        >
          Resume
        </button>
        <button
          onClick={onDismiss}
          className="bg-slate-700 hover:bg-slate-600 text-slate-300 text-sm px-3 py-1.5 rounded-lg transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
