"use client";

import { useEffect, useState } from "react";
import { Users, ListTodo, Timer, UserPlus, Loader2, UserCircle2 } from "lucide-react";

import DashboardHeader from "../components/DashboardHeader";
import StatCard from "../components/StatCard";
import { useAuth } from "../context/AuthContext";
import { authFetch } from "../lib/api";
import { formatStudyHours, TASK_STATUSES, type TaskStatus } from "../context/TaskContext";

type RecentSignup = {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
};

type AdminStats = {
  totalUsers: number;
  totalTasks: number;
  totalSessions: number;
  signupsThisWeek: number;
  totalStudyHours: number;
  taskStatusCounts: Record<TaskStatus, number>;
  recentSignups: RecentSignup[];
};

function formatJoined(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminOverviewPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await authFetch<{ stats: AdminStats }>("/admin/stats", token);
        if (!cancelled) setStats(res.stats);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load stats.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const totalTasksForBreakdown = stats
    ? TASK_STATUSES.reduce((sum, s) => sum + (stats.taskStatusCounts[s.key] || 0), 0)
    : 0;

  return (
    <div className="space-y-6">
      <DashboardHeader title="Admin Panel" />

      <div>
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Overview</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Platform-wide activity across every account.</p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      {!stats && !error ? (
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading stats...
        </div>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Total Users"
              value={stats.totalUsers}
              icon={Users}
              iconClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"
              hint={`+${stats.signupsThisWeek} this week`}
            />
            <StatCard
              label="New Signups"
              value={stats.signupsThisWeek}
              icon={UserPlus}
              iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
              hint="Last 7 days"
            />
            <StatCard
              label="Total Tasks"
              value={stats.totalTasks}
              icon={ListTodo}
              iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"
              hint={`${stats.totalSessions} focus sessions logged`}
            />
            <StatCard
              label="Study Hours"
              value={formatStudyHours(stats.totalStudyHours)}
              icon={Timer}
              iconClass="bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300"
              hint="Across all users"
            />
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Recent signups */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 lg:col-span-2">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Recent Signups</h3>
              <div className="mt-4 space-y-1">
                {stats.recentSignups.length === 0 ? (
                  <p className="text-sm text-slate-500 dark:text-slate-400">No signups yet.</p>
                ) : (
                  stats.recentSignups.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-3 rounded-xl px-2 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                        <UserCircle2 className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{u.fullName}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                      </div>
                      <span className="shrink-0 text-xs text-slate-400 dark:text-slate-500">{formatJoined(u.createdAt)}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Task status breakdown */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Task Status</h3>
              <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">Across every account</p>
              {totalTasksForBreakdown === 0 ? (
                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No tasks yet.</p>
              ) : (
                <>
                  <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                    {TASK_STATUSES.map((s) => {
                      const count = stats.taskStatusCounts[s.key] || 0;
                      return (
                        count > 0 && (
                          <div
                            key={s.key}
                            title={`${s.label}: ${count}`}
                            className={`${s.dot} h-full transition-all`}
                            style={{ width: `${(count / totalTasksForBreakdown) * 100}%` }}
                          />
                        )
                      );
                    })}
                  </div>
                  <div className="mt-4 space-y-2">
                    {TASK_STATUSES.map((s) => (
                      <div key={s.key} className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                          {s.label}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-slate-100">
                          {stats.taskStatusCounts[s.key] || 0}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
