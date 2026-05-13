"use client";

import { ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

interface RoleGuardProps {
  role: "admin" | "user";
  children: ReactNode;
  /** Rendered instead of redirecting. Useful for inline admin sections. */
  fallback?: ReactNode;
}

/**
 * Wraps children so they only render when the authenticated user holds the
 * required role. While auth is loading it renders nothing. When the role
 * doesn't match it either renders the fallback or redirects to /dashboard.
 */
export function RoleGuard({ role, children, fallback }: RoleGuardProps) {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) return null;

  if (!user || user.role !== role) {
    if (fallback !== undefined) return <>{fallback}</>;
    // Redirect asynchronously to avoid calling router.push during render
    setTimeout(() => router.replace("/dashboard"), 0);
    return null;
  }

  return <>{children}</>;
}
