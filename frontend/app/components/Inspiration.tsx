"use client";

import { useEffect, useRef, useState } from "react";
import { Quote, RefreshCw } from "lucide-react";
import { QUOTES } from "../lib/quotes";

const ROTATE_MS = 12000;

export default function Inspiration() {
  // Random starting point so every page load/user doesn't see the same
  // quote first, while still cycling through the whole list over time.
  const [index, setIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const advance = () => {
    // Briefly fade out, swap the quote, then fade back in — a crossfade
    // without needing to mount two overlapping copies of the text.
    setVisible(false);
    setTimeout(() => {
      setIndex((i) => (i + 1) % QUOTES.length);
      setVisible(true);
    }, 200);
  };

  useEffect(() => {
    timerRef.current = setInterval(advance, ROTATE_MS);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const current = QUOTES[index];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm dark:border-slate-700/60 dark:bg-slate-800">
      <div className="mb-3 flex items-center justify-between">
        <div className="inline-flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300">
            <Quote className="h-4 w-4" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wide text-purple-600 dark:text-purple-300">
            Inspiration
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            if (timerRef.current) clearInterval(timerRef.current);
            advance();
            timerRef.current = setInterval(advance, ROTATE_MS);
          }}
          aria-label="Next quote"
          title="Next quote"
          className="press-feedback rounded-lg p-1.5 text-slate-300 transition-colors hover:bg-purple-50 hover:text-purple-600 dark:text-slate-600 dark:hover:bg-purple-500/10 dark:hover:text-purple-300"
        >
          <RefreshCw className="h-3.5 w-3.5" />
        </button>
      </div>
      <div className={`transition-opacity duration-200 ${visible ? "opacity-100" : "opacity-0"}`}>
        <p className="min-h-[3.75rem] text-sm leading-relaxed text-slate-700 dark:text-slate-200">
          &ldquo;{current.quote}&rdquo;
        </p>
        <p className="mt-3 text-xs font-medium text-slate-400 dark:text-slate-500">— {current.author}</p>
      </div>
    </div>
  );
}
