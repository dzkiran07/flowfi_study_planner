"use client";

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
  Flame,
  BookOpen,
  Clock,
  ListTodo,
  CheckCircle2,
  Timer,
  TrendingUp,
} from "lucide-react";

import DashboardHeader from "../components/DashboardHeader";
import StatCard from "../components/StatCard";
import ProgressBar from "../components/ProgressBar";
import Inspiration from "../components/Inspiration";

export default function DashboardPage() {
  const { user } = useAuth();
  const { tasks, upcomingTasks, recentActivities, sessions } = useTasks();
  // `elapsedMinutes` is credited focus time for the in-progress Pomodoro; it
  // is already 0 when there's nothing to credit, and — unlike `isRunning` —
  // it deliberately stays put across a pause/reset so Study Hours never dips.
  const { elapsedMinutes } = useTimer();

  const stats = calculateStats(tasks, sessions, elapsedMinutes);
  const weeklyProgress = aggregateSessionTopics(sessions);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="space-y-6">
      <DashboardHeader title="Dashboard" />

      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-500 p-6 text-white">
        <h2 className="text-2xl font-bold">Good Afternoon, {user?.fullName}!</h2>
        <p className="mt-1 text-sm text-white/80">{currentDate}</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
          <Flame className="h-4 w-4" />
          Your Streak: 12 Days
        </div>
      </div>

      <div className="rounded-xl bg-indigo-700 p-6 text-white">
        <h3 className="text-lg font-semibold">Ready when you are</h3>
        <p className="mt-1 text-sm text-white/80">Start a study session</p>
        <p className="mt-1 text-sm text-white/70">Choose your subject and duration</p>
        <button className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-white/90 transition-colors">
          Start session
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active Tasks"
          value={stats.active}
          icon={ListTodo}
          iconClass="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300"
          hint={`${stats.total} total tasks`}
        />
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
        <StatCard
          label="Study Hours"
          value={formatStudyHours(stats.studyHours)}
          icon={Timer}
          iconClass="bg-amber-50 text-amber-600 dark:bg-amber-500/10 dark:text-amber-300"
          hint={`${formatStudyHours(stats.studyHoursThisWeek)} logged this week`}
        />
        <StatCard
          label="Productivity"
          value={stats.productivity}
          suffix="%"
          icon={TrendingUp}
          iconClass="bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300"
          hint={`${stats.completed}/${stats.total} done`}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2 dark:border-slate-700 dark:bg-slate-800">
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

        <div className="space-y-6">
          <Inspiration quote="Success is the sum of small efforts repeated day in and day out." author="Robert Collier" />

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

      <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-700 dark:bg-slate-800">
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
                  <li key={activity.id} className="relative flex gap-4 pb-4">
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
