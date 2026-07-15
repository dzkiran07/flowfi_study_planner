"use client";

import {
  Timer,
  CheckCircle2,
  TrendingUp,
  ListTodo,
} from "lucide-react";

import DashboardHeader from "../../components/DashboardHeader";
import StatCard from "../../components/StatCard";
import ProgressBar from "../../components/ProgressBar";
import {
  useTasks,
  calculateStats,
  formatStudyHours,
  TASK_STATUSES,
  PRIORITY_COLORS,
  priorityText,
  type Priority,
  type Session,
  type ProgressItem,
} from "../../context/TaskContext";
import { useTimer } from "../../context/TimerContext";

/** All-time (not just this week) per-topic study minutes, as the shared ProgressBar shape. */
function allTimeTopicBreakdown(sessions: Session[]): ProgressItem[] {
  const totals = new Map<string, number>();
  for (const s of sessions) {
    const topic = (s.topic || "").trim() || "General";
    totals.set(topic, (totals.get(topic) ?? 0) + (s.duration || 0));
  }
  const maxMin = Math.max(0, ...Array.from(totals.values()));
  return Array.from(totals.entries())
    .map(([topic, min]) => {
      const hours = Math.round((min / 60) * 10) / 10;
      return {
        topic,
        display: `${hours}h`,
        percent: maxMin > 0 ? Math.round((min / maxMin) * 100) : 0,
      };
    })
    .sort((a, b) => b.percent - a.percent);
}

type DayBucket = { key: string; label: string; minutes: number; isToday: boolean };

// `toISOString()` converts to UTC, which silently shifts the calendar date
// for any timezone ahead of UTC (e.g. a local midnight in IST is still the
// previous day in UTC) — that mismatch was causing the last-7-days chart to
// bucket sessions into the wrong day (or drop today's entirely). Building
// the key from local date parts keeps both sides of the comparison in the
// same timezone.
function localDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Study minutes for each of the last `days` calendar days (oldest first). */
function lastNDaysStudyMinutes(sessions: Session[], days: number): DayBucket[] {
  const buckets: DayBucket[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    buckets.push({
      key: localDateKey(d),
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      minutes: 0,
      isToday: i === 0,
    });
  }

  const byKey = new Map(buckets.map((b) => [b.key, b]));
  for (const s of sessions) {
    const key = localDateKey(new Date(s.timestamp));
    const bucket = byKey.get(key);
    if (bucket) bucket.minutes += s.duration || 0;
  }
  return buckets;
}

const PRIORITY_ORDER: Priority[] = ["HIGH", "MEDIUM", "LOW"];

export default function StatisticsPage() {
  const { tasks, sessions } = useTasks();
  const { elapsedMinutes } = useTimer();

  const stats = calculateStats(tasks, sessions, elapsedMinutes);
  const topicBreakdown = allTimeTopicBreakdown(sessions);
  const weeklyBuckets = lastNDaysStudyMinutes(sessions, 7);
  const maxDayMinutes = Math.max(1, ...weeklyBuckets.map((b) => b.minutes));

  const activeTasks = tasks.filter((t) => t.status !== "completed");
  const statusCounts = TASK_STATUSES.map((s) => ({
    ...s,
    count: tasks.filter((t) => t.status === s.key).length,
  }));
  const priorityCounts = PRIORITY_ORDER.map((p) => ({
    priority: p,
    count: activeTasks.filter((t) => t.priority === p).length,
  }));

  return (
    <div className="space-y-6">
      <DashboardHeader title="Statistics" />

      <div className="animate-fade-in-up">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Statistics</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Track your progress and performance over time.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <StatCard
            label="Study Hours"
            value={formatStudyHours(stats.studyHours)}
            icon={Timer}
            iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"
            hint={`${formatStudyHours(stats.studyHoursThisWeek)} this week`}
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          <StatCard
            label="Focus Sessions"
            value={sessions.length}
            icon={CheckCircle2}
            iconClass="bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300"
            hint="Pomodoros logged"
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: "180ms" }}>
          <StatCard
            label="Tasks Completed"
            value={stats.completed}
            icon={ListTodo}
            iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
            hint={`${stats.total} total tasks`}
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: "240ms" }}>
          <StatCard
            label="Productivity"
            value={stats.productivity}
            suffix="%"
            icon={TrendingUp}
            iconClass="bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300"
            hint={`${stats.completed}/${stats.total} done`}
          />
        </div>
      </div>

      {/* Weekly study time chart */}
      <div className="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Study Time — Last 7 Days</h3>
        <div className="mt-6 flex h-40 items-end gap-3 sm:gap-4">
          {weeklyBuckets.map((day, i) => {
            const heightPct = day.minutes > 0 ? Math.max(6, Math.round((day.minutes / maxDayMinutes) * 100)) : 0;
            return (
              <div key={day.key} className="flex flex-1 flex-col items-center gap-2">
                <div className="group relative flex h-32 w-full items-end justify-center">
                  <div
                    className={`absolute -top-7 rounded-md px-2 py-1 text-xs font-medium text-white opacity-0 shadow transition-opacity group-hover:opacity-100 ${
                      day.minutes > 0 ? "bg-slate-900 dark:bg-slate-100 dark:text-slate-900" : "hidden"
                    }`}
                  >
                    {formatStudyHours(day.minutes / 60)}
                  </div>
                  <div
                    className={`w-full max-w-[28px] origin-bottom rounded-t-md transition-all duration-700 ease-out ${
                      day.isToday ? "bg-indigo-600 dark:bg-indigo-400" : "bg-indigo-300 dark:bg-indigo-500/50"
                    }`}
                    style={{ height: `${heightPct}%`, transitionDelay: `${i * 60}ms` }}
                  />
                </div>
                <span
                  className={`text-xs font-medium ${
                    day.isToday
                      ? "font-semibold text-indigo-600 dark:text-indigo-400"
                      : "text-slate-400 dark:text-slate-500"
                  }`}
                >
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Study time by topic (all-time) */}
        <div className="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Study Time by Topic</h3>
          <div className="mt-4">
            <ProgressBar items={topicBreakdown} emptyHint="No study sessions yet. Finish a Pomodoro to see this breakdown." />
          </div>
        </div>

        {/* Task status breakdown */}
        <div className="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800" style={{ animationDelay: "100ms" }}>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Task Status</h3>
          {stats.total === 0 ? (
            <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No tasks yet.</p>
          ) : (
            <>
              <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
                {statusCounts.map(
                  (s) =>
                    s.count > 0 && (
                      <div
                        key={s.key}
                        title={`${s.label}: ${s.count}`}
                        className={`${s.dot} h-full transition-all`}
                        style={{ width: `${(s.count / stats.total) * 100}%` }}
                      />
                    ),
                )}
              </div>
              <div className="mt-4 space-y-2">
                {statusCounts.map((s) => (
                  <div key={s.key} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                      <span className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />
                      {s.label}
                    </span>
                    <span className="font-semibold text-slate-900 dark:text-slate-100">{s.count}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Active task priority breakdown */}
      <div className="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800" style={{ animationDelay: "200ms" }}>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Active Tasks by Priority</h3>
        {activeTasks.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">No active tasks — nice work!</p>
        ) : (
          <>
            <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
              {priorityCounts.map(
                (p) =>
                  p.count > 0 && (
                    <div
                      key={p.priority}
                      title={`${priorityText(p.priority)}: ${p.count}`}
                      className={`${PRIORITY_COLORS[p.priority]} h-full transition-all`}
                      style={{ width: `${(p.count / activeTasks.length) * 100}%` }}
                    />
                  ),
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
              {priorityCounts.map((p) => (
                <div key={p.priority} className="flex items-center gap-2 text-sm">
                  <span className={`h-2.5 w-2.5 rounded-full ${PRIORITY_COLORS[p.priority].split(" ")[0]}`} />
                  <span className="text-slate-600 dark:text-slate-400">{priorityText(p.priority)}</span>
                  <span className="font-semibold text-slate-900 dark:text-slate-100">{p.count}</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
