"use client";

import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, SkipForward, Music, Timer, CheckCircle2 } from "lucide-react";

import DashboardHeader from "../../components/DashboardHeader";

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

const MODES: Record<
  TimerMode,
  { label: string; description: string; duration: number; activeBg: string; textColor: string; ringColor: string }
> = {
  pomodoro: {
    label: "Pomodoro",
    description: "Focus on deep work",
    duration: 25 * 60,
    activeBg: "bg-orange-500",
    textColor: "text-orange-500",
    ringColor: "stroke-orange-500",
  },
  shortBreak: {
    label: "Short Break",
    description: "Recharge briefly",
    duration: 5 * 60,
    activeBg: "bg-cyan-500",
    textColor: "text-cyan-500",
    ringColor: "stroke-cyan-500",
  },
  longBreak: {
    label: "Long Break",
    description: "Rest and recover",
    duration: 15 * 60,
    activeBg: "bg-pink-500",
    textColor: "text-pink-500",
    ringColor: "stroke-pink-500",
  },
};

const MODE_ORDER: TimerMode[] = ["pomodoro", "shortBreak", "longBreak"];

export default function TimerPage() {
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState(MODES.pomodoro.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [musicSource, setMusicSource] = useState("");

  useEffect(() => {
    // Reset timer whenever the mode changes.
    const id = setTimeout(() => {
      setTimeLeft(MODES[mode].duration);
      setIsRunning(false);
    }, 0);
    return () => clearTimeout(id);
  }, [mode]);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // Handle completion: count pomodoros and auto-advance to the next mode.
  useEffect(() => {
    if (timeLeft !== 0) return;
    const id = setTimeout(() => {
      setIsRunning(false);
      if (mode === "pomodoro") {
        setCompletedSessions((c) => c + 1);
        setMode("shortBreak");
      } else {
        setMode("pomodoro");
      }
    }, 0);
    return () => clearTimeout(id);
  }, [timeLeft, mode]);

  const handleTogglePlay = () => {
    if (timeLeft === 0) {
      setTimeLeft(MODES[mode].duration);
      setIsRunning(true);
    } else {
      setIsRunning((r) => !r);
    }
  };

  const handleReset = () => {
    setTimeLeft(MODES[mode].duration);
    setIsRunning(false);
  };

  const handleSkip = () => {
    const next = MODE_ORDER[(MODE_ORDER.indexOf(mode) + 1) % MODE_ORDER.length];
    setMode(next);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const displayTime = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  const progress = timeLeft / MODES[mode].duration;

  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-1 flex-col items-center">
      <DashboardHeader title="Timer" />

      <div className="mx-auto w-full max-w-xl px-4 py-8">
        {/* Mode switcher */}
        <div className="mb-8 grid grid-cols-3 gap-1.5 rounded-2xl border border-slate-200 bg-slate-100 p-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          {MODE_ORDER.map((key) => {
            const m = MODES[key];
            const isActive = mode === key;
            return (
              <button
                key={key}
                onClick={() => setMode(key)}
                className={`rounded-xl px-2 py-2.5 text-center text-sm font-semibold transition-all ${
                  isActive
                    ? `${m.activeBg} text-white shadow`
                    : "text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-700"
                }`}
              >
                {m.label}
              </button>
            );
          })}
        </div>

        {/* Timer card */}
        <div className="relative rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl dark:border-slate-700 dark:bg-slate-800 sm:p-10">
          <p className="text-center text-sm font-medium text-slate-500 dark:text-slate-400">
            {MODES[mode].description}
          </p>

          <div className="relative mx-auto mt-6 flex h-72 w-72 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 280 280">
              <circle
                cx="140"
                cy="140"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                className="text-slate-200 dark:text-slate-700"
              />
              <circle
                cx="140"
                cy="140"
                r={radius}
                stroke="currentColor"
                strokeWidth="12"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                className={`${MODES[mode].ringColor} transition-all duration-1000 ease-linear`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-6xl font-bold tabular-nums tracking-tight text-slate-900 dark:text-slate-50 sm:text-7xl">
                {displayTime}
              </span>
              <span className={`mt-2 text-sm font-semibold uppercase tracking-widest ${MODES[mode].textColor}`}>
                {MODES[mode].label}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={handleReset}
              aria-label="Reset timer"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              <RotateCcw className="h-5 w-5" />
            </button>

            <button
              onClick={handleTogglePlay}
              className={`inline-flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition-all hover:scale-105 hover:brightness-105 ${MODES[mode].activeBg}`}
            >
              {isRunning ? <Pause className="h-7 w-7" /> : <Play className="h-7 w-7 translate-x-0.5" />}
            </button>

            <button
              onClick={handleSkip}
              aria-label="Skip to next mode"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              <SkipForward className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 text-orange-600 dark:bg-orange-500/20">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{completedSessions}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Sessions done</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20">
              <Timer className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-900 dark:text-slate-50">{MODES[mode].label}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Current mode</p>
            </div>
          </div>
        </div>

        {/* Background music */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              <Music className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <label htmlFor="music" className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                Background Music
              </label>
              <input
                id="music"
                type="text"
                value={musicSource}
                onChange={(e) => setMusicSource(e.target.value)}
                placeholder="Paste a music URL to play while you focus"
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              />
            </div>
          </div>
          {musicSource.trim() !== "" && (
            <audio className="mt-4 w-full" src={musicSource} controls autoPlay={isRunning} />
          )}
        </div>
      </div>
    </div>
  );
}
