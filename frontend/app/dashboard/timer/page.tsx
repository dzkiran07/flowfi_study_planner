"use client";

import { useState, useEffect } from "react";
import { Play, RefreshCw, Music } from "lucide-react";

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

const MODES: Record<TimerMode, { label: string; duration: number; activeBg: string; textColor: string; ringColor: string }> = {
  pomodoro: {
    label: "Pomodoro",
    duration: 25 * 60,
    activeBg: "bg-orange-500",
    textColor: "text-orange-500",
    ringColor: "stroke-orange-500",
  },
  shortBreak: {
    label: "Short Break",
    duration: 5 * 60,
    activeBg: "bg-cyan-500",
    textColor: "text-cyan-500",
    ringColor: "stroke-cyan-500",
  },
  longBreak: {
    label: "Long Break",
    duration: 15 * 60,
    activeBg: "bg-pink-500",
    textColor: "text-pink-500",
    ringColor: "stroke-pink-500",
  },
};

export default function TimerPage() {
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(MODES.pomodoro.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [musicSource, setMusicSource] = useState("");

  useEffect(() => {
    setTimeLeft(MODES[mode].duration);
    setIsRunning(false);
  }, [mode]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const handleTogglePlay = () => {
    if (timeLeft === 0) {
      setTimeLeft(MODES[mode].duration);
      setIsRunning(true);
    } else {
      setIsRunning(!isRunning);
    }
  };

  const handleReset = () => {
    setTimeLeft(MODES[mode].duration);
    setIsRunning(false);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const displayTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  const progress = timeLeft / MODES[mode].duration;

  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-1 flex-col items-center justify-center">
      {/* Mode Switcher */}
      <div className="mb-10 flex flex-wrap justify-center gap-3">
        {(Object.keys(MODES) as TimerMode[]).map((key) => {
          const m = MODES[key];
          const isActive = mode === key;
          return (
            <button
              key={key}
              onClick={() => setMode(key)}
              className={`rounded-full px-6 py-2.5 text-base font-medium transition-all ${
                isActive
                  ? `${m.activeBg} text-white shadow-lg`
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* Timer Card */}
      <div className="w-full max-w-lg">
        <div className="rounded-3xl bg-white p-10 shadow-md">
          <div className="relative flex flex-col items-center">
            <svg className="h-80 w-80 -rotate-90">
              <circle
                cx="160"
                cy="160"
                r={radius}
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                className="text-slate-100"
              />
              <circle
                cx="160"
                cy="160"
                r={radius}
                stroke="currentColor"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`${MODES[mode].ringColor} transition-all duration-1000 ease-linear`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-7xl font-bold text-slate-900 tracking-tight">
                {displayTime}
              </span>
              <span className={`mt-3 text-lg font-medium ${MODES[mode].textColor}`}>
                {MODES[mode].label}
              </span>
            </div>
          </div>

          {/* Control Bar */}
          <div className="mt-10 flex items-center justify-center gap-6">
            <button
              onClick={handleTogglePlay}
              className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-500 px-8 py-3.5 text-base font-medium text-white shadow-sm hover:bg-emerald-600 transition-colors"
            >
              <Play className="h-5 w-5" />
              {isRunning ? "Pause" : "Play"}
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-8 py-3.5 text-base font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="h-5 w-5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Background Music Section */}
      <div className="mt-10 w-full max-w-lg">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50">
              <Music className="h-6 w-6 text-slate-600" />
            </div>
            <div className="flex-1">
              <label htmlFor="music" className="block text-sm font-medium text-slate-700">
                Background Music:
              </label>
              <input
                id="music"
                type="text"
                value={musicSource}
                onChange={(e) => setMusicSource(e.target.value)}
                placeholder="Paste music URL or search..."
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-base text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
