"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import {
  useTasks,
  calculateStats,
  formatDeadline,
  formatRelativeTime,
  formatAbsoluteTime,
  formatStudyHours,
  PRIORITY_COLORS,
  priorityText,
  topicColorClass,
  aggregateSessionTopics,
  ACTIVITY_META,
  activityTypeOf,
} from "../context/TaskContext";
import { useTimer } from "../context/TimerContext";
import {
  BookOpen,
  Clock,
  ListTodo,
  CheckCircle2,
  Timer,
  TrendingUp,
  Sunrise,
  Sun,
  Sunset,
  Moon,
  Play,
  ShieldAlert,
} from "lucide-react";

/** Picks a time-of-day greeting + matching icon from an hour (0-23). */
function getGreeting(hour: number) {
  if (hour < 5) return { text: "Good Night", icon: Moon };
  if (hour < 12) return { text: "Good Morning", icon: Sunrise };
  if (hour < 17) return { text: "Good Afternoon", icon: Sun };
  if (hour < 21) return { text: "Good Evening", icon: Sunset };
  return { text: "Good Night", icon: Moon };
}

// A simple, fixed daily focus-time target used for the "Quick Stats" ring.
const DAILY_GOAL_MINUTES = 120;

import DashboardHeader from "../components/DashboardHeader";
import StatCard from "../components/StatCard";
import ProgressBar from "../components/ProgressBar";
import Inspiration from "../components/Inspiration";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { tasks, upcomingTasks, recentActivities, sessions } = useTasks();
  // `elapsedMinutes` is credited focus time for the in-progress Pomodoro; it
  // is already 0 when there's nothing to credit, and — unlike `isRunning` —
  // it deliberately stays put across a pause/reset so Study Hours never dips.
  const { elapsedMinutes } = useTimer();

  const stats = calculateStats(tasks, sessions, elapsedMinutes);
  const weeklyProgress = aggregateSessionTopics(sessions);

  // Ticks once a minute so the greeting/date roll over on their own —
  // no refresh needed to go from "Good Morning" to "Good Afternoon".
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Surfaces *why* someone landed here after being bounced out of a
  // restricted area (e.g. a non-admin hitting /admin), instead of a silent,
  // unexplained redirect — then strips the param so it doesn't linger on
  // refresh/share.
  const denied = searchParams.get("denied");
  useEffect(() => {
    if (!denied) return;
    const id = setTimeout(() => router.replace("/dashboard"), 4000);
    return () => clearTimeout(id);
  }, [denied, router]);

  const { text: greeting, icon: GreetingIcon } = getGreeting(now.getHours());
  const currentDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // "Quick Stats" — focus minutes logged today (real sessions + any
  // in-progress Pomodoro credit) against a fixed daily goal.
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);
  const todayMinutes =
    sessions
      .filter((s) => s.timestamp >= startOfToday.getTime())
      .reduce((sum, s) => sum + (s.duration || 0), 0) + elapsedMinutes;
  const goalPercent = Math.min(100, Math.round((todayMinutes / DAILY_GOAL_MINUTES) * 100));
  const ringRadius = 18;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - goalPercent / 100);

  return (
    <div className="space-y-6">
      <DashboardHeader title="Dashboard" />

      {denied && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <ShieldAlert className="h-5 w-5 shrink-0" />
          You don&apos;t have access to the {denied === "admin" ? "Admin Panel" : "requested page"}.
        </div>
      )}

      <div className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          {/* Greeting */}
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
              <GreetingIcon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {greeting}, {user?.fullName}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">{currentDate}</p>
            </div>
          </div>

          {/* Quick Stats: daily focus goal */}
          <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-2.5 dark:bg-slate-900/40">
            <svg className="h-11 w-11 shrink-0 -rotate-90" viewBox="0 0 44 44">
              <circle cx="22" cy="22" r={ringRadius} stroke="currentColor" strokeWidth="4" fill="none" className="text-slate-200 dark:text-slate-700" />
              <circle
                cx="22"
                cy="22"
                r={ringRadius}
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={ringCircumference}
                strokeDashoffset={ringOffset}
                className="text-indigo-600 transition-all duration-500 dark:text-indigo-400"
              />
            </svg>
            <div>
              <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">Daily Goal</p>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {formatStudyHours(todayMinutes / 60)} / {formatStudyHours(DAILY_GOAL_MINUTES / 60)}
              </p>
            </div>
          </div>

          {/* Primary CTA */}
          <Link
            href="/dashboard/timer"
            className="press-feedback inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            <Play className="h-4 w-4" />
            Start Session
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="animate-fade-in-up" style={{ animationDelay: "60ms" }}>
          <StatCard
            label="Active Tasks"
            value={stats.active}
            icon={ListTodo}
            iconClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"
            hint={`${stats.total} total tasks`}
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: "120ms" }}>
          <StatCard
            label="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            iconClass="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300"
            hint={
              stats.completedThisWeek > 0
                ? `+${stats.completedThisWeek} this week`
                : "No completions this week"
            }
          />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: "180ms" }}>
          <StatCard
            label="Study Hours"
            value={formatStudyHours(stats.studyHours)}
            icon={Timer}
            iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"
            hint={`${formatStudyHours(stats.studyHoursThisWeek)} logged this week`}
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

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2 dark:border-slate-700 dark:bg-slate-800" style={{ animationDelay: "100ms" }}>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Upcoming Deadlines</h3>
          <div className="mt-4 space-y-3">
            {upcomingTasks.length === 0 ? (
              <p className="text-sm text-slate-500 dark:text-slate-400">No upcoming deadlines. You&apos;re all caught up!</p>
            ) : (
              upcomingTasks.slice(0, 5).map((task) => (
                <div
                  key={task.id}
                  className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700/50"
                >
                  <div className="pt-0.5">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-700">
                      <BookOpen className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${topicColorClass(task.topic)}`}
                      >
                        {task.topic}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}
                      >
                        {priorityText(task.priority)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100">{task.title}</p>
                    <p className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-300">
                      Due: {formatDeadline(task.deadlineDate, task.deadlineTime)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="animate-fade-in-up space-y-6" style={{ animationDelay: "150ms" }}>
          <Inspiration />

          <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Weekly Study Progress</h3>
            <div className="mt-4">
              <ProgressBar
                items={weeklyProgress}
                emptyHint="No study sessions yet. Finish a Pomodoro to see your weekly progress."
              />
            </div>
          </div>
        </div>
      </div>

      <div className="animate-fade-in-up rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800" style={{ animationDelay: "200ms" }}>
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Recent Activity</h3>
          {recentActivities.length > 0 && (
            <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-300">
              {recentActivities.length} {recentActivities.length === 1 ? "event" : "events"}
            </span>
          )}
        </div>
        <div className="mt-4">
          {recentActivities.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-200 py-10 text-center dark:border-slate-700">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-700">
                <Clock className="h-6 w-6 text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300">No recent activity yet</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">Complete or create tasks to build your timeline.</p>
            </div>
          ) : (
            <ol className="relative space-y-1">
              {recentActivities.map((activity, idx) => {
                const meta = ACTIVITY_META[activityTypeOf(activity)];
                const Icon = meta.icon;
                const isLast = idx === recentActivities.length - 1;
                return (
                  <li
                    key={activity.id}
                    className="animate-fade-in-up relative flex gap-4 rounded-lg pb-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/40"
                    style={{ animationDelay: `${Math.min(idx, 6) * 50}ms` }}
                  >
                    {!isLast && (
                      <span className="absolute left-[19px] top-10 h-[calc(100%-1.25rem)] w-px bg-slate-200 dark:bg-slate-700" aria-hidden />
                    )}
                    <div className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${meta.ring}`}>
                      <Icon className={`h-5 w-5 ${meta.color}`} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={`text-xs font-semibold uppercase tracking-wide ${meta.color}`}>{meta.label}</span>
                        <span
                          className="cursor-default text-xs text-slate-400 dark:text-slate-500"
                          title={formatAbsoluteTime(activity.at)}
                        >
                          {formatRelativeTime(activity.at)}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-sm font-medium text-slate-900 dark:text-slate-100">{activity.text}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          )}
        </div>
      </div>
    </div>
  );
}
