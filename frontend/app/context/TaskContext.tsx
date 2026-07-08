"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Priority = "HIGH" | "MEDIUM" | "LOW";

export type Task = {
  id: number;
  title: string;
  description: string;
  subject: string;
  priority: Priority;
  completed: boolean;
  deadlineDate?: string; // YYYY-MM-DD
  deadlineTime?: string; // HH:MM (24h)
};

const STORAGE_KEY = "flowfi_study_tasks";

const DEFAULT_TASKS: Task[] = [
  {
    id: 1,
    title: "Complete Calculus Assignment",
    description: "Finish problems from chapter 5",
    subject: "Mathematics",
    priority: "HIGH",
    completed: false,
    deadlineDate: "2026-07-10",
    deadlineTime: "17:00",
  },
  {
    id: 2,
    title: "Read Physics Chapter 4",
    description: "Notes on thermodynamics",
    subject: "Physics",
    priority: "MEDIUM",
    completed: true,
    deadlineDate: "2026-07-12",
    deadlineTime: "14:00",
  },
  {
    id: 3,
    title: "Submit History Essay",
    description: "Renaissance art analysis",
    subject: "History",
    priority: "HIGH",
    completed: false,
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

// Shared subject-tag styling (used by both the Study Planner and Dashboard).
export const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
  Physics: "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
  History: "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
  Chemistry: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  English: "bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-300",
  Biology: "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
  Geography: "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
  ComputerScience: "bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-300",
};

export const SUBJECT_FALLBACK = "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300";

const priorityLabel: Record<Priority, string> = {
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

export function priorityText(priority: Priority): string {
  return priorityLabel[priority];
}

function toTimestamp(task: Task): number {
  if (!task.deadlineDate) return Number.POSITIVE_INFINITY;
  const dt = new Date(`${task.deadlineDate}T${task.deadlineTime || "23:59"}`);
  const t = dt.getTime();
  return Number.isNaN(t) ? Number.POSITIVE_INFINITY : t;
}

/**
 * Returns only upcoming, non-completed tasks, sorted by the closest
 * deadline date and time (ascending).
 */
export function filterUpcomingTasks(tasks: Task[]): Task[] {
  const now = Date.now();
  return tasks
    .filter((task) => !task.completed && !!task.deadlineDate)
    .filter((task) => toTimestamp(task) >= now)
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

type TaskContextType = {
  tasks: Task[];
  upcomingTasks: Task[];
  addTask: (task: Omit<Task, "id">) => void;
  toggleTask: (id: number) => void;
  deleteTask: (id: number) => void;
  getUpcomingTasks: () => Task[];
};

const TaskContext = createContext<TaskContextType>({
  tasks: [],
  upcomingTasks: [],
  addTask: () => {},
  toggleTask: () => {},
  deleteTask: () => {},
  getUpcomingTasks: () => [],
});

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const parsed = stored ? JSON.parse(stored) : null;
      const initial = Array.isArray(parsed) ? (parsed as Task[]) : DEFAULT_TASKS;
      // Avoid synchronous setState during the effect body (eslint rule).
      setTimeout(() => setTasks(initial), 0);
    } catch {
      setTimeout(() => setTasks(DEFAULT_TASKS), 0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || isLoading) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, isLoading]);

  const addTask = (task: Omit<Task, "id">) => {
    setTasks((prev) => [{ ...task, id: Date.now() }, ...prev]);
  };

  const toggleTask = (id: number) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const deleteTask = (id: number) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  const upcomingTasks = useMemo(() => filterUpcomingTasks(tasks), [tasks]);
  const getUpcomingTasks = useCallback(() => filterUpcomingTasks(tasks), [tasks]);

  const value = useMemo<TaskContextType>(
    () => ({ tasks, upcomingTasks, addTask, toggleTask, deleteTask, getUpcomingTasks }),
    [tasks, upcomingTasks, getUpcomingTasks],
  );

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
}

export function useTasks() {
  return useContext(TaskContext);
}
