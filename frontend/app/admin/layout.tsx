"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useAuthGuard } from "../lib/useAuthGuard";
import { authFetch } from "../lib/api";
import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, Users, LogOut, ShieldCheck, UserCircle2 } from "lucide-react";

const navItems = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", icon: Users },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { token, user, logout } = useAuth();
  const { isAuthorized } = useAuthGuard({ requireRole: "admin" });
  const router = useRouter();
  const pathname = usePathname();
  const [totalUsers, setTotalUsers] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthorized || !token) return;
    authFetch<{ stats: { totalUsers: number } }>("/admin/stats", token)
      .then((res) => setTotalUsers(res.stats.totalUsers))
      .catch(() => {});
  }, [isAuthorized, token]);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    logout();
    router.push("/login");
  };

  if (!isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background dark:bg-slate-800">
        <p className="text-slate-600 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background dark:bg-slate-800">
      <aside className="fixed inset-y-0 left-0 z-10 flex w-64 flex-col bg-slate-950 text-white">
        <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-6">
          <Image src="/images/flowfilogo.png" alt="" width={28} height={28} className="h-7 w-7 rounded-lg object-contain" />
          <span className="text-xl font-bold">Flow-Fi</span>
        </div>

        <div className="flex items-center gap-2 px-6 py-3 text-xs font-semibold uppercase tracking-wide text-indigo-300">
          <ShieldCheck className="h-4 w-4" />
          Admin Panel
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-slate-800 text-white"
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                {item.href === "/admin/users" && totalUsers !== null && (
                  <span className="ml-auto rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
                    {totalUsers}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {user && (
          <div className="mx-4 mb-4 flex items-center gap-3 rounded-xl bg-slate-900 p-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-500/15 text-indigo-300">
              <UserCircle2 className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user.fullName}</p>
              <p className="truncate text-xs text-slate-400">{user.email}</p>
            </div>
          </div>
        )}

        <div className="border-t border-slate-800 p-4">
          <Link
            href="/dashboard"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <LayoutDashboard className="h-5 w-5" />
            Back to App
          </Link>
          <button
            onClick={handleLogout}
            className="mt-1 flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      <main className="pl-64">
        <div className="mx-auto max-w-7xl p-6">{children}</div>
      </main>
    </div>
  );
}
