"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { SearchBar } from "@/components/SearchBar";
import { WeatherCard } from "@/components/WeatherCard";
import { HistorySidebar } from "@/components/HistorySidebar";
import { SessionBanner } from "@/components/SessionBanner";

interface WeatherData {
  city: string;
  country: string;
  lat: number;
  lon: number;
  temp: number;
  feels_like: number;
  humidity: number;
  pressure: number;
  wind_speed: number;
  description: string;
  icon: string;
  sunrise: number;
  sunset: number;
  flagUrl: string;
}

interface HistoryItem {
  id: string;
  country: string;
  city: string | null;
  lat: number | null;
  lon: number | null;
  searchedAt: string;
}

export default function DashboardPage() {
  const { user, lastSession, loading: authLoading, logout, clearLastSession } = useAuth();
  const router = useRouter();

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentCountry, setCurrentCountry] = useState<string | undefined>();

  const fetchHistory = useCallback(async () => {
    const res = await fetchWithAuth("/api/history");
    if (res.ok) {
      const data = await res.json();
      setHistory(data.history);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (user) fetchHistory();
  }, [user, authLoading, router, fetchHistory]);

  const handleSearch = async (params: {
    mode: "name" | "coords";
    query?: string;
    lat?: string;
    lon?: string;
  }) => {
    setError("");
    setSearchLoading(true);
    try {
      const res = await fetchWithAuth("/api/weather/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Search failed");
        return;
      }
      setWeather(data.weather);
      setCurrentCountry(data.weather.country);
      await fetchHistory();
    } catch {
      setError("Network error");
    } finally {
      setSearchLoading(false);
    }
  };

  const handleReSearch = (item: HistoryItem) => {
    if (item.lat != null && item.lon != null) {
      handleSearch({ mode: "coords", lat: String(item.lat), lon: String(item.lon) });
    } else {
      handleSearch({ mode: "name", query: `${item.city ?? item.country}, ${item.country}` });
    }
  };

  const handleResume = () => {
    if (lastSession) {
      handleSearch({ mode: "name", query: lastSession.country });
      clearLastSession();
    }
  };

  const handleLogout = async () => {
    await logout(currentCountry);
    router.push("/login");
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate-400">
        Loading...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-white">WeatherStack</h1>
        <div className="flex items-center gap-4">
          {user?.role === "admin" && (
            <Link
              href="/dashboard/admin"
              className="text-amber-400 hover:text-amber-300 text-sm transition-colors"
            >
              Admin Panel
            </Link>
          )}
          {user && (
            <span className="text-slate-400 text-sm">
              {user.name}{" "}
              <span
                className={`text-xs px-2 py-0.5 rounded-full ml-1 ${
                  user.role === "admin"
                    ? "bg-amber-900 text-amber-300"
                    : "bg-slate-700 text-slate-300"
                }`}
              >
                {user.role}
              </span>
            </span>
          )}
          <button
            onClick={handleLogout}
            className="text-slate-400 hover:text-white text-sm transition-colors"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {lastSession && (
          <div className="mb-6">
            <SessionBanner
              country={lastSession.country}
              timestamp={lastSession.timestamp}
              onResume={handleResume}
              onDismiss={clearLastSession}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SearchBar onSearch={handleSearch} loading={searchLoading} />

            {error && (
              <div className="bg-red-950 border border-red-800 text-red-400 rounded-2xl px-4 py-3 text-sm">
                {error}
              </div>
            )}

            {weather ? (
              <WeatherCard data={weather} />
            ) : (
              !error && (
                <div className="bg-slate-800/50 rounded-2xl p-12 border border-slate-700 text-center">
                  <p className="text-slate-500 text-4xl mb-3">⛅</p>
                  <p className="text-slate-400">Search for a city or coordinates to see weather</p>
                </div>
              )
            )}
          </div>

          <div>
            <HistorySidebar history={history} onReSearch={handleReSearch} />
          </div>
        </div>
      </main>
    </div>
  );
}
