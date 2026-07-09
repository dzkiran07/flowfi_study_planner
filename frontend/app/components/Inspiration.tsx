"use client";

import { Quote } from "lucide-react";

type InspirationProps = {
  quote: string;
  author?: string;
};

export default function Inspiration({
  quote,
  author = "Flow-Fi",
}: InspirationProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-800">
      <div className="mb-3 inline-flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300">
          <Quote className="h-4 w-4" />
        </span>
        <span className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">
          Inspiration
        </span>
      </div>
      <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-200">
        &ldquo;{quote}&rdquo;
      </p>
      {author && (
        <p className="mt-3 text-xs font-medium text-slate-400 dark:text-slate-500">
          — {author}
        </p>
      )}
    </div>
  );
}
