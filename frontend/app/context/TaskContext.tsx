"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AlertTriangle, BookOpen, Calendar as CalendarIcon, CheckCircle2, Clock, Pencil, PlayCircle, PlusCircle, Trash2 } from "lucide-react";

export type Priority = "HIGH" | "MEDIUM" | "LOW";

// Single source of truth for where a task lives on the Kanban board.
export type TaskStatus = "pending" | "in-progress" | "completed";

// Valid statuses, used to sanitize legacy localStorage entries.
export const TASK_STATUS_KEYS: TaskStatus[] = ["pending", "in-progress", "completed"];

export type Task = {
  id: number;
  title: string;
  description: string;
  topic: string;
  priority: Priority;
  status: TaskStatus;
  createdAt: number; // epoch ms when the task was created (drives "completed in")
  completedAt?: number; // epoch ms when moved to "completed"
  deadlineDate?: string; // YYYY-MM-DD
  deadlineTime?: string; // HH:MM (24h)
};

// Display metadata for each Kanban column, shared by the Planner board.
export const TASK_STATUSES: { key: TaskStatus; label: string; accent: string; dot: string }[] = [
  { key: "pending", label: "Pending", accent: "border-slate-200 dark:border-slate-700", dot: "bg-slate-400" },
  { key: "in-progress", label: "In Progress", accent: "border-blue-200 dark:border-blue-500/30", dot: "bg-blue-500" },
  { key: "completed", label: "Completed", accent: "border-emerald-200 dark:border-emerald-500/30", dot: "bg-emerald-500" },
];

export type ActivityType = "completed" | "created" | "deleted" | "started" | "edited";

export type Activity = {
  id: number;
  text: string;
  at: number; // epoch ms
  type?: ActivityType;
};

// Visual metadata for each activity kind, used to render a meaningful timeline.
export const ACTIVITY_META: Record<
  ActivityType,
  { icon: typeof Clock; color: string; ring: string; label: string }
> = {
  completed: {
    icon: CheckCircle2,
    color: "text-emerald-600 dark:text-emerald-400",
    ring: "bg-emerald-100 dark:bg-emerald-500/15",
    label: "Completed",
  },
  created: {
    icon: PlusCircle,
    color: "text-indigo-600 dark:text-indigo-400",
    ring: "bg-indigo-100 dark:bg-indigo-500/15",
    label: "Created",
  },
  deleted: {
    icon: Trash2,
    color: "text-rose-600 dark:text-rose-400",
    ring: "bg-rose-100 dark:bg-rose-500/15",
    label: "Deleted",
  },
  started: {
    icon: PlayCircle,
    color: "text-amber-600 dark:text-amber-400",
    ring: "bg-amber-100 dark:bg-amber-500/15",
    label: "Started",
  },
  edited: {
    icon: Pencil,
    color: "text-sky-600 dark:text-sky-400",
    ring: "bg-sky-100 dark:bg-sky-500/15",
    label: "Edited",
  },
};

export function activityTypeOf(activity: Activity): ActivityType {
  return activity.type ?? "completed";
}

/** Formats an epoch timestamp as an absolute, human-readable date-time. */
export function formatAbsoluteTime(at: number): string {
  return new Date(at).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

/** Formats a study-time figure (in hours) as e.g. "2 hrs 5 mins". */
export function formatStudyHours(hours: number): string {
  const totalMin = Math.max(0, Math.round((hours || 0) * 60));
  const hrs = Math.floor(totalMin / 60);
  const mins = totalMin % 60;
  const hrPart = hrs > 0 ? `${hrs} ${hrs === 1 ? "hr" : "hrs"}` : "";
  const minPart = mins > 0 ? `${mins} ${mins === 1 ? "min" : "mins"}` : "";
  if (hrPart && minPart) return `${hrPart} ${minPart}`;
  return hrPart || minPart || "0 mins";
}

/** Formats a duration (ms) as "Xd, Yh, Zm" for the "Completed in" label. */
export function formatDuration(ms: number): string {
  const totalMin = Math.max(0, Math.floor(ms / 60000));
  const days = Math.floor(totalMin / (60 * 24));
  const hrs = Math.floor((totalMin % (60 * 24)) / 60);
  const mins = totalMin % 60;
  return `${days}d, ${hrs}h, ${mins}m`;
}

const TASKS_KEY = "flowfi_study_tasks";
const RECENT_KEY = "flowfi_recent_activities";
const SESSIONS_KEY = "flowfi_study_sessions";
const MAX_ACTIVITIES = 8;

const DEFAULT_ACTIVITIES: Activity[] = [
  { id: 1, text: "Completed Read Physics Chapter 4 - Physics", at: Date.now() - 1000 * 60 * 42, type: "completed" },
  { id: 2, text: 'Added "Submit History Essay" - History', at: Date.now() - 1000 * 60 * 60 * 3, type: "created" },
  { id: 3, text: 'Started "Calculus" study session', at: Date.now() - 1000 * 60 * 60 * 5, type: "started" },
  { id: 4, text: 'Added "Complete Calculus Assignment" - Mathematics', at: Date.now() - 1000 * 60 * 60 * 26, type: "created" },
];

const DAY = 24 * 60 * 60 * 1000;

const DEFAULT_TASKS: Task[] = [
  {
    id: 1,
    title: "Complete Calculus Assignment",
    description: "Finish problems from chapter 5",
    topic: "Mathematics",
    priority: "HIGH",
    status: "pending",
    createdAt: Date.now() - 2 * DAY,
    deadlineDate: "2026-07-10",
    deadlineTime: "17:00",
  },
  {
    id: 2,
    title: "Read Physics Chapter 4",
    description: "Notes on thermodynamics",
    topic: "Physics",
    priority: "MEDIUM",
    status: "completed",
    createdAt: Date.now() - 5 * DAY,
    completedAt: Date.now() - 2 * DAY,
    deadlineDate: "2026-07-12",
    deadlineTime: "14:00",
  },
  {
    id: 3,
    title: "Submit History Essay",
    description: "Renaissance art analysis",
    topic: "History",
    priority: "HIGH",
    status: "pending",
    createdAt: Date.now() - 1 * DAY,
    deadlineDate: "2026-07-15",
    deadlineTime: "23:59",
  },
];

// Shared priority-badge styling (colorful, solid badges used on both pages).
export const PRIORITY_COLORS: Record<Priority, string> = {
  HIGH: "bg-red-500 text-white",
  MEDIUM: "bg-amber-500 text-white",
  LOW: "bg-green-500 text-white",
};

// Palette used to deterministically color any topic (incl. custom ones).
const TOPIC_PALETTE = [
  "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
  "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
];

// Returns a stable color class for any topic string (custom topics included).
export function topicColorClass(topic: string): string {
  const key = (topic || "").trim().toLowerCase();
  if (!key) return TOPIC_PALETTE[0];
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return TOPIC_PALETTE[Math.abs(hash) % TOPIC_PALETTE.length];
}

export type ProgressItem = {
  topic: string;
  /** Right-aligned label shown next to the bar, e.g. "75%" or "2.5h". */
  display: string;
  /** Bar fill width as a percentage (0-100). */
  percent: number;
};

/**
 * DRY helper: aggregates tasks by topic and computes the completion
 * percentage for each (including custom topics). Empty topic -> "General".
 */
export function aggregateTopics(tasks: Task[]): ProgressItem[] {
  const map = new Map<string, { total: number; completed: number }>();
  for (const task of tasks) {
    const topic = (task.topic || "").trim() || "General";
    const entry = map.get(topic) ?? { total: 0, completed: 0 };
    entry.total += 1;
    if (task.status === "completed") entry.completed += 1;
    map.set(topic, entry);
  }
  return Array.from(map.entries()).map(([topic, entry]) => ({
    topic,
    display: `${entry.total > 0 ? Math.round((entry.completed / entry.total) * 100) : 0}%`,
    percent: entry.total > 0 ? Math.round((entry.completed / entry.total) * 100) : 0,
  }));
}

// A single, logged Pomodoro focus session tied to a task (if any).
export type Session = {
  id: number;
  /** Length of the session in minutes (e.g. 25 for a Pomodoro). */
  duration: number;
  taskId: number | null;
  topic: string;
  timestamp: number; // epoch ms when the session completed
};

/**
 * Aggregates logged study sessions into per-topic study time for the current
 * week. Drives the Dashboard's "Weekly Study Progress". Empty topic -> "General".
 */
export function aggregateSessionTopics(sessions: Session[]): ProgressItem[] {
  const weekAgo = Date.now() - WEEK_MS;
  const totals = new Map<string, number>(); // topic -> minutes this week
  for (const s of sessions) {
    if (s.timestamp < weekAgo) continue;
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

// One week in ms, used for the "this week" deltas across stats.
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export type Stats = {
  total: number;
  active: number;
  completed: number;
  /** Total tracked study hours, summed from logged focus sessions. */
  studyHours: number;
  /** Completion rate as a percentage (0-100). */
  productivity: number;
  /** Tasks created in the last 7 days. */
  createdThisWeek: number;
  /** Tasks completed in the last 7 days. */
  completedThisWeek: number;
  /** Study hours logged in the last 7 days. */
  studyHoursThisWeek: number;
};

/**
 * Centralized, single-source-of-truth stat helper. Active, Completed and
 * Productivity come from the master tasks array; Study Hours are summed from
 * the logged focus `sessions` (each session's `duration` is in minutes).
 */
export function calculateStats(tasks: Task[], sessions: Session[] = []): Stats {
  const now = Date.now();
  const weekAgo = now - WEEK_MS;

  let active = 0;
  let completed = 0;
  let createdThisWeek = 0;
  let completedThisWeek = 0;
  let studyHours = 0;
  let studyHoursThisWeek = 0;

  for (const task of tasks) {
    if (task.status === "completed") {
      completed += 1;
      if ((task.completedAt ?? task.createdAt) >= weekAgo) completedThisWeek += 1;
    } else {
      active += 1;
    }
    if (task.createdAt >= weekAgo) createdThisWeek += 1;
  }

  for (const s of sessions) {
    const hours = (s.duration || 0) / 60;
    studyHours += hours;
    if (s.timestamp >= weekAgo) studyHoursThisWeek += hours;
  }

  const total = tasks.length;
  const productivity = total > 0 ? Math.round((completed / total) * 100) : 0;

  return {
    total,
    active,
    completed,
    studyHours: Math.round(studyHours * 10) / 10,
    productivity,
    createdThisWeek,
    completedThisWeek,
    studyHoursThisWeek: Math.round(studyHoursThisWeek * 10) / 10,
  };
}

const priorityLabel: Record<Priority, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export function priorityText(priority: Priority): string {
  return priorityLabel[priority];
}

/** Formats an epoch timestamp as a short relative time, e.g. "2h ago". */
export function formatRelativeTime(at: number): string {
  const diff = Date.now() - at;
  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(at).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function toTimestamp(task: Task): number {
  if (!task.deadlineDate) return Number.POSITIVE_INFINITY;
  const dt = new Date(`${task.deadlineDate}T${task.deadlineTime || "23:59"}`);
  const t = dt.getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}

/**
 * Returns every non-completed task that has a deadline, sorted by the
 * closest deadline date and time (ascending). Drives the Dashboard's
 * "Upcoming Deadlines" — completed work is intentionally excluded.
 */
export function filterUpcomingTasks(tasks: Task[]): Task[] {
  return tasks
    .filter((task) => task.status !== "completed" && !!task.deadlineDate)
    .sort((a, b) => toTimestamp(a) - toTimestamp(b));
}

/** Formats a deadline into a readable string, e.g. "Jul 10, 5:00 PM". */
export function formatDeadline(date?: string, time?: string): string {
  if (!date) return "No deadline";
  const dt = new Date(`${date}T${time || "00:00"}`);
  if (Number.isNaN(dt.getTime())) return "No deadline";
  return dt.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export type DeadlineStatus = "none" | "overdue" | "today" | "soon" | "upcoming";

export type DeadlineInfo = {
  status: DeadlineStatus;
  label: string;
  icon: typeof Clock;
  chip: string;
};

/**
 * Classifies a task's deadline relative to now into a meaningful status
 * (overdue / due today / due soon / upcoming / none) used for card badges.
 */
export function getDeadlineInfo(task: Task): DeadlineInfo {
  if (!task.deadlineDate) {
    return { status: "none", label: "No deadline", icon: Clock, chip: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300" };
  }
  const ts = toTimestamp(task);
  const now = Date.now();
  const dayMs = 24 * 60 * 60 * 1000;
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = startOfToday.getTime() + dayMs;

  if (ts < now) {
    return { status: "overdue", label: `Overdue · ${formatDeadline(task.deadlineDate, task.deadlineTime)}`, icon: AlertTriangle, chip: "bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300" };
  }
  if (ts <= endOfToday) {
    return { status: "today", label: `Due today · ${formatDeadline(task.deadlineDate, task.deadlineTime)}`, icon: Clock, chip: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300" };
  }
  if (ts <= now + 2 * dayMs) {
    return { status: "soon", label: `Due soon · ${formatDeadline(task.deadlineDate, task.deadlineTime)}`, icon: Clock, chip: "bg-orange-100 text-orange-700 dark:bg-orange-500/15 dark:text-orange-300" };
  }
  return { status: "upcoming", label: `Due ${formatDeadline(task.deadlineDate, task.deadlineTime)}`, icon: CalendarIcon, chip: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300" };
}

// Backward compatibility: migrate legacy `subject`/`completed` data to
// `topic`/`status` so existing localStorage entries keep working.
function migrateTask(t: Partial<Task> & { subject?: string; completed?: boolean }): Task {
  return {
    id: t.id ?? Date.now(),
    title: t.title ?? "",
    description: t.description ?? "",
    topic: (t.topic ?? t.subject ?? "General").trim() || "General",
    priority: t.priority ?? "MEDIUM",
    status: TASK_STATUS_KEYS.includes(t.status as TaskStatus)
      ? (t.status as TaskStatus)
      : t.completed
        ? "completed"
        : "pending",
    createdAt: t.createdAt ?? Date.now(),
    completedAt: t.completedAt,
    deadlineDate: t.deadlineDate,
    deadlineTime: t.deadlineTime,
  };
}

type TaskContextType = {
  tasks: Task[];
  upcomingTasks: Task[];
  recentActivities: Activity[];
  sessions: Session[];
  addTask: (task: Omit<Task, "id" | "createdAt">) => void;
  setTaskStatus: (id: number, status: TaskStatus) => void;
  deleteTask: (id: number) => void;
  getUpcomingTasks: () => Task[];
  logSession: (session: Omit<Session, "id" | "timestamp">) => void;
};

const TaskContext = createContext<TaskContextType>({
  tasks: [],
  upcomingTasks: [],
  recentActivities: [],
  sessions: [],
  addTask: () => {},
  setTaskStatus: () => {},
  deleteTask: () => {},
  getUpcomingTasks: () => [],
  logSession: () => {},
});

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const storedTasks = localStorage.getItem(TASKS_KEY);
      const parsedTasks = storedTasks ? JSON.parse(storedTasks) : null;
      const initialTasks = Array.isArray(parsedTasks)
        ? (parsedTasks as (Partial<Task> & { subject?: string })[]).map(migrateTask)
        : DEFAULT_TASKS.map(migrateTask);

      const storedRecent = localStorage.getItem(RECENT_KEY);
      const parsedRecent = storedRecent ? JSON.parse(storedRecent) : null;
      const initialRecent = Array.isArray(parsedRecent)
        ? (parsedRecent as Activity[])
        : DEFAULT_ACTIVITIES.map((a) => ({ ...a }));

      const storedSessions = localStorage.getItem(SESSIONS_KEY);
      const parsedSessions = storedSessions ? JSON.parse(storedSessions) : null;
      const initialSessions = Array.isArray(parsedSessions)
        ? (parsedSessions as Session[])
        : [];

      // Avoid synchronous setState during the effect body (eslint rule).
      setTimeout(() => {
        setTasks(initialTasks);
        setRecentActivities(initialRecent);
        setSessions(initialSessions);
        setIsLoading(false);
      }, 0);
    } catch {
      setTimeout(() => {
        setTasks(DEFAULT_TASKS.map(migrateTask));
        setRecentActivities([]);
        setSessions([]);
        setIsLoading(false);
      }, 0);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || isLoading) return;
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
    localStorage.setItem(RECENT_KEY, JSON.stringify(recentActivities));
    localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions));
  }, [tasks, recentActivities, sessions, isLoading]);

  const logActivity = (entry: Omit<Activity, "id" | "at"> & { id?: number; at?: number }) => {
    setRecentActivities((prev) =>
      [
        { id: entry.id ?? Date.now(), at: entry.at ?? Date.now(), ...entry },
        ...prev,
      ].slice(0, MAX_ACTIVITIES),
    );
  };

  const addTask = (task: Omit<Task, "id" | "createdAt">) => {
    setTasks((prev) => [{ ...task, id: Date.now(), createdAt: Date.now() }, ...prev]);
    logActivity({ text: `Added "${task.title}" · ${task.topic || "General"}`, type: "created" });
  };

  const setTaskStatus = (id: number, status: TaskStatus) => {
    const target = tasks.find((t) => t.id === id);
    if (!target || target.status === status) return;
    const wasCompleted = target.status === "completed";
    setTasks((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, status, completedAt: status === "completed" ? Date.now() : undefined }
          : t,
      ),
    );
    // Log a completion event only when a task enters the "completed" column.
    if (status === "completed" && !wasCompleted) {
      logActivity({
        text: `Completed "${target.title}" - ${target.topic || "General"}`,
        type: "completed",
      });
    }
  };

  const deleteTask = (id: number) => {
    const target = tasks.find((t) => t.id === id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (target) {
      logActivity({
        text: `Removed "${target.title}" · ${target.topic || "General"}`,
        type: "deleted",
      });
    }
  };

  const logSession = (session: Omit<Session, "id" | "timestamp">) => {
    setSessions((prev) => [
      { id: Date.now(), timestamp: Date.now(), ...session },
      ...prev,
    ]);
  };

  const upcomingTasks = useMemo(() => filterUpcomingTasks(tasks), [tasks]);
  const getUpcomingTasks = useCallback(() => filterUpcomingTasks(tasks), [tasks]);

  const value = useMemo<TaskContextType>(
    () => ({
      tasks,
      upcomingTasks,
      recentActivities,
      sessions,
      addTask,
      setTaskStatus,
      deleteTask,
      getUpcomingTasks,
      logSession,
    }),
    [tasks, upcomingTasks, recentActivities, sessions, getUpcomingTasks],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  return useContext(TaskContext);
}
