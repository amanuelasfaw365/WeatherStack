"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { RoleGuard } from "@/components/RoleGuard";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface UserRow {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

interface HistoryItem {
  id: string;
  country: string;
  city: string | null;
  lat: number | null;
  lon: number | null;
  searchedAt: string;
}

interface SelectedUser {
  id: string;
  name: string;
  email: string;
}

function AdminPanel() {
  const { logout } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [selected, setSelected] = useState<SelectedUser | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchWithAuth("/api/admin/users")
      .then((r) => r.json())
      .then((d) => setUsers(d.users ?? []))
      .catch(() => setError("Failed to load users"));
  }, []);

  const loadHistory = async (user: UserRow) => {
    setSelected({ id: user.id, name: user.name, email: user.email });
    setHistoryLoading(true);
    setError("");
    try {
      const res = await fetchWithAuth(`/api/admin/history/${user.id}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load history");
        setHistory([]);
      } else {
        setHistory(data.history);
      }
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-slate-900">
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="text-slate-400 hover:text-white text-sm transition-colors">
            ← Dashboard
          </Link>
          <h1 className="text-xl font-bold text-white">Admin Panel</h1>
        </div>
        <button
          onClick={handleLogout}
          className="text-slate-400 hover:text-white text-sm transition-colors"
        >
          Logout
        </button>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 bg-red-950 border border-red-800 text-red-400 rounded-2xl px-4 py-3 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User list */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700">
              <h2 className="text-white font-semibold text-sm uppercase tracking-wide">
                Users ({users.length})
              </h2>
            </div>
            <ul className="divide-y divide-slate-700">
              {users.map((u) => (
                <li key={u.id}>
                  <button
                    onClick={() => loadHistory(u)}
                    className={`w-full text-left px-4 py-3 hover:bg-slate-700/50 transition-colors group ${
                      selected?.id === u.id ? "bg-slate-700/70" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-white text-sm font-medium group-hover:text-blue-300 transition-colors">
                          {u.name}
                        </p>
                        <p className="text-slate-400 text-xs mt-0.5">{u.email}</p>
                      </div>
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full ${
                          u.role === "admin"
                            ? "bg-amber-900 text-amber-300"
                            : "bg-slate-700 text-slate-300"
                        }`}
                      >
                        {u.role}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
              {users.length === 0 && (
                <li className="px-4 py-6 text-slate-500 text-sm text-center">
                  No users found
                </li>
              )}
            </ul>
          </div>

          {/* History panel */}
          <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-700">
              <h2 className="text-white font-semibold text-sm uppercase tracking-wide">
                {selected ? `History — ${selected.name}` : "Search History"}
              </h2>
            </div>

            {!selected ? (
              <p className="px-4 py-6 text-slate-500 text-sm text-center">
                Select a user to view their search history
              </p>
            ) : historyLoading ? (
              <p className="px-4 py-6 text-slate-400 text-sm text-center">Loading...</p>
            ) : history.length === 0 ? (
              <p className="px-4 py-6 text-slate-500 text-sm text-center">No searches yet</p>
            ) : (
              <ul className="divide-y divide-slate-700">
                {history.map((item) => (
                  <li key={item.id} className="px-4 py-3">
                    <p className="text-white text-sm font-medium">
                      {item.city ? `${item.city}, ` : ""}
                      {item.country}
                    </p>
                    {item.lat != null && (
                      <p className="text-slate-400 text-xs mt-0.5">
                        {item.lat.toFixed(4)}°, {item.lon?.toFixed(4)}°
                      </p>
                    )}
                    <p className="text-slate-500 text-xs mt-0.5">
                      {new Date(item.searchedAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RoleGuard role="admin">
      <AdminPanel />
    </RoleGuard>
  );
}
