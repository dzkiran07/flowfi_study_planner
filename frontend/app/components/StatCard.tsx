"use client";

import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  label: string;
  value: string | number;
  suffix?: string;
  icon: LucideIcon;
  /** Tailwind classes for the icon tile, e.g. "bg-indigo-50 text-indigo-600". */
  iconClass: string;
  /** Muted contextual hint shown beneath the main figure. */
  hint?: React.ReactNode;
};

export default function StatCard({
  label,
  value,
  suffix,
  icon: Icon,
  iconClass,
  hint,
}: StatCardProps) {
  return (
    <div className="group relative rounded-2xl border border-slate-200/70 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-800">
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">
            {label}
          </p>
          <p className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-50">
            {value}
            {suffix && (
              <span className="ml-1 text-2xl font-bold text-slate-400 dark:text-slate-500">
                {suffix}
              </span>
            )}
          </p>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {hint && (
        <p className="mt-3 text-xs font-medium text-slate-400 dark:text-slate-500">{hint}</p>
      )}
    </div>
  );
}
