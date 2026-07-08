"use client";

import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, "0"));
const PERIODS = ["AM", "PM"];

const ITEM_H = 32; // px
const VIEWPORT_H = 128; // px (h-32)
const EDGE_PAD = (VIEWPORT_H - ITEM_H) / 2;

function formatTime(value?: string): string {
  if (!value) return "Select a time";
  const [h, m] = value.split(":").map(Number);
  const dt = new Date();
  dt.setHours(h, m, 0, 0);
  if (Number.isNaN(dt.getTime())) return "Select a time";
  return dt.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function to24(hour12: number, period: string, minute: string): string {
  let h24 = hour12 % 12;
  if (period === "PM") h24 += 12;
  return `${String(h24).padStart(2, "0")}:${minute}`;
}

const triggerClass =
  "w-full flex items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm transition-colors focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100";

const popoverClass =
  "absolute right-0 bottom-full mb-2 z-30 rounded-2xl border border-slate-200 bg-white p-3 shadow-xl dark:border-slate-700 dark:bg-slate-800";

function WheelColumn({
  items,
  value,
  onChange,
  label,
}: {
  items: string[];
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      const idx = items.indexOf(value);
      ref.current.scrollTop = idx >= 0 ? idx * ITEM_H : 0;
    }
    // Position once on mount (popover mounts per open).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    if (!ref.current) return;
    const idx = Math.min(items.length - 1, Math.max(0, Math.round(ref.current.scrollTop / ITEM_H)));
    const next = items[idx];
    if (next !== value) onChange(next);
  };

  return (
    <div className="flex flex-col items-center">
      <span className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">{label}</span>
      <div className="relative h-32 w-14 overflow-hidden">
        <div className="pointer-events-none absolute inset-x-1 top-1/2 h-8 -translate-y-1/2 rounded-lg bg-indigo-100 dark:bg-indigo-500/20" />
        <div
          ref={ref}
          onScroll={handleScroll}
          className="h-full overflow-y-auto snap-y snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ paddingTop: EDGE_PAD, paddingBottom: EDGE_PAD }}
        >
          {items.map((it) => (
            <div
              key={it}
              className={`flex h-8 snap-center items-center justify-center text-sm ${
                it === value
                  ? "font-semibold text-indigo-600 dark:text-indigo-300"
                  : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {it}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function TimePicker({
  value,
  onChange,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const [hStr, mStr, pStr] = (() => {
    if (!value) return ["9", "00", "AM"];
    const [h, m] = value.split(":").map(Number);
    const period = h < 12 ? "AM" : "PM";
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return [String(hour12), String(m).padStart(2, "0"), period];
  })();

  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const update = (hour12: number, minute: string, period: string) => {
    onChange(to24(hour12, period, minute));
  };

  return (
    <div className={`relative ${className || ""}`} ref={ref}>
      <button type="button" onClick={() => setOpen((o) => !o)} className={triggerClass}>
        <span className={value ? "" : "text-slate-400 dark:text-slate-500"}>{formatTime(value)}</span>
        <Clock className="h-4 w-4 text-slate-400" />
      </button>
      {open && (
        <div className={popoverClass}>
          <div className="flex items-start justify-center gap-2">
            <WheelColumn label="Hour" items={HOURS} value={hStr} onChange={(v) => update(Number(v), mStr, pStr)} />
            <span className="mt-6 text-xl font-semibold text-slate-300 dark:text-slate-600">:</span>
            <WheelColumn label="Min" items={MINUTES} value={mStr} onChange={(v) => update(Number(hStr), v, pStr)} />
            <WheelColumn label="AM/PM" items={PERIODS} value={pStr} onChange={(v) => update(Number(hStr), mStr, v)} />
          </div>
          <div className="mt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
