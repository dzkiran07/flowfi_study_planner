"use client";

import { ProgressItem } from "../context/TaskContext";

// Deterministic, readable bar-fill palette (light + dark variants).
const BAR_COLORS = [
  "bg-indigo-500 dark:bg-indigo-400",
  "bg-blue-500 dark:bg-blue-400",
  "bg-amber-500 dark:bg-amber-400",
  "bg-emerald-500 dark:bg-emerald-400",
  "bg-purple-500 dark:bg-purple-400",
  "bg-teal-500 dark:bg-teal-400",
  "bg-rose-500 dark:bg-rose-400",
  "bg-sky-500 dark:bg-sky-400",
];

function barColorClass(topic: string): string {
  const key = (topic || "").trim().toLowerCase();
  if (!key) return BAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) | 0;
  return BAR_COLORS[Math.abs(hash) % BAR_COLORS.length];
}

type ProgressBarProps = {
  items: ProgressItem[];
  emptyHint?: string;
};

export default function ProgressBar({ items, emptyHint }: ProgressBarProps) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {emptyHint ?? "No topics yet. Add a task to get started."}
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.topic}>
          <div className="flex items-center justify-between gap-3 text-sm">
            <span className="truncate font-medium text-slate-700 dark:text-slate-200">
              {item.topic}
            </span>
            <span className="shrink-0 font-semibold tabular-nums text-slate-500 dark:text-slate-400">
              {item.display}
            </span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${barColorClass(item.topic)}`}
              style={{ width: `${item.percent}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
