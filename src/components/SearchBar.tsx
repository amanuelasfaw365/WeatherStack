"use client";

import { useState } from "react";

interface SearchBarProps {
  onSearch: (params: { mode: "name" | "coords"; query?: string; lat?: string; lon?: string }) => void;
  loading: boolean;
}

export function SearchBar({ onSearch, loading }: SearchBarProps) {
  const [mode, setMode] = useState<"name" | "coords">("name");
  const [query, setQuery] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "name") {
      onSearch({ mode, query });
    } else {
      onSearch({ mode, lat, lon });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-slate-800 rounded-2xl p-4 border border-slate-700">
      <div className="flex gap-2 mb-4">
        <button
          type="button"
          onClick={() => setMode("name")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "name"
              ? "bg-blue-600 text-white"
              : "bg-slate-700 text-slate-400 hover:text-white"
          }`}
        >
          City / Country Name
        </button>
        <button
          type="button"
          onClick={() => setMode("coords")}
          className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
            mode === "coords"
              ? "bg-blue-600 text-white"
              : "bg-slate-700 text-slate-400 hover:text-white"
          }`}
        >
          Coordinates
        </button>
      </div>

      {mode === "name" ? (
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g. London, GB or Tokyo"
          className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
          required
        />
      ) : (
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
            placeholder="Latitude (-90 to 90)"
            step="any"
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
          <input
            type="number"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
            placeholder="Longitude (-180 to 180)"
            step="any"
            className="flex-1 bg-slate-700 border border-slate-600 rounded-lg px-4 py-2.5 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-2.5 transition-colors"
      >
        {loading ? "Searching..." : "Search Weather"}
      </button>
    </form>
  );
}
