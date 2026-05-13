/**
 * Drop-in fetch replacement for authenticated requests.
 *
 * On a 401 response it silently calls /api/auth/refresh to rotate the token
 * pair, then retries the original request exactly once. If the refresh also
 * fails a custom DOM event ("auth:signout") is dispatched so the AuthProvider
 * can clear local state and redirect to /login without this module depending
 * on React context.
 */

let refreshing: Promise<boolean> | null = null;

async function attemptRefresh(): Promise<boolean> {
  // Deduplicate concurrent refresh attempts: if one is already in flight, wait for it
  if (!refreshing) {
    refreshing = fetch("/api/auth/refresh", {
      method: "POST",
      credentials: "include",
    })
      .then((r) => r.ok)
      .finally(() => {
        refreshing = null;
      });
  }
  return refreshing;
}

export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const res = await fetch(input, { credentials: "include", ...init });

  if (res.status !== 401) return res;

  const refreshed = await attemptRefresh();
  if (!refreshed) {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("auth:signout"));
    }
    return res; // return original 401 so callers can handle it
  }

  // Retry original request with fresh access token cookie
  return fetch(input, { credentials: "include", ...init });
}
