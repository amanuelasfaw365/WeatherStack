import { AuthProvider } from "@/contexts/AuthContext";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-slate-900">{children}</div>
    </AuthProvider>
  );
}
