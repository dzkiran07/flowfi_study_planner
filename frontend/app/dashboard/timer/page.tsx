"use client";

import { useEffect, useState } from "react";
import { Play, Pause, RotateCcw, SkipForward, Music, Timer, CheckCircle2, ChevronDown } from "lucide-react";

import DashboardHeader from "../../components/DashboardHeader";
import MusicPlayer from "../../components/MusicPlayer";
import { useTasks, topicColorClass } from "../../context/TaskContext";
import { MODES, MODE_ORDER, formatTimeLeft, useTimer } from "../../context/TimerContext";

type Track = { id: string; label: string; src: string };

const TRACKS: Track[] = [
  { id: "lofi", label: "Lo-fi Beats", src: "/audio/lofi-beats.mp3" },
  { id: "piano", label: "Classical Piano", src: "/audio/classical-piano.mp3" },
  { id: "rain", label: "Rain & Thunder", src: "/audio/rain-thunderstorm.mp3" },
  { id: "binaural", label: "Binaural Beats", src: "/audio/binaural-beats.mp3" },
];

const MUSIC_TRACK_KEY = "flowfi_music_track";

export default function TimerPage() {
  const { tasks } = useTasks();
  const {
    mode,
    timeLeft,
    isRunning,
    completedSessions,
    selectedTaskId,
    setSelectedTaskId,
    changeMode,
    togglePlay,
    reset,
    skip,
  } = useTimer();

  // Background music: which preset track (if any) is selected, persisted
  // per-browser so the choice survives a refresh/revisit. Actual playback
  // (play/pause, seeking, volume) is owned entirely by <MusicPlayer>.
  const [trackId, setTrackId] = useState<string | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const selectedTrack = TRACKS.find((t) => t.id === trackId) ?? null;

  useEffect(() => {
    const storedTrack = localStorage.getItem(MUSIC_TRACK_KEY);
    if (storedTrack && TRACKS.some((t) => t.id === storedTrack)) setTrackId(storedTrack);
  }, []);

  useEffect(() => {
    if (trackId) localStorage.setItem(MUSIC_TRACK_KEY, trackId);
    else localStorage.removeItem(MUSIC_TRACK_KEY);
  }, [trackId]);

  const handleSelectTrack = (id: string) => {
    setTrackId((prev) => (prev === id ? null : id));
  };

  // Task linkage: only tasks currently "In Progress" can be tracked.
  const inProgressTasks = tasks.filter((t) => t.status === "in-progress");
  const selectedTask = tasks.find((t) => t.id === selectedTaskId) ?? null;

  // Non-intrusive validation toast.
  const [toast, setToast] = useState<string | null>(null);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(id);
  }, [toast]);

  const handleTogglePlay = () => {
    const startingFresh = timeLeft === 0 || !isRunning;
    if (startingFresh && selectedTaskId === null) {
      setToast("Please select a task to track your focus session.");
      return;
    }
    togglePlay();
  };

  const displayTime = formatTimeLeft(timeLeft);
  const progress = timeLeft / MODES[mode].duration;

  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="flex flex-1 flex-col items-center">
      <DashboardHeader title="Timer" />

      {toast && (
        <div className="fixed left-1/2 top-24 z-50 -translate-x-1/2 rounded-xl border border-amber-200 bg-white px-4 py-2.5 text-sm font-medium text-amber-700 shadow-lg dark:border-amber-500/30 dark:bg-slate-800 dark:text-amber-300">
          {toast}
        </div>
      )}

      <div className="mx-auto w-full max-w-xl px-4 py-8">
        {/* Mode switcher */}
        <div className="mb-8 grid grid-cols-3 gap-1.5 rounded-2xl border border-slate-200 bg-slate-100 p-1.5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          {MODE_ORDER.map((key) => {
            const m = MODES[key];
            const isActive = mode === key;
            return (
              <button
                key={key}
                onClick={() => changeMode(key)}
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

        {/* Active task selector */}
        <div className="mb-6 flex justify-center">
          <div className="w-full max-w-sm">
            <label
              htmlFor="active-task"
              className="mb-1.5 block text-center text-xs font-medium text-slate-500 dark:text-slate-400"
            >
              Select Active Task
            </label>
            <div className="relative">
              <select
                id="active-task"
                value={selectedTaskId ?? ""}
                onChange={(e) => setSelectedTaskId(e.target.value || null)}
                className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-3 py-2.5 pr-9 text-sm font-medium text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="">No task selected</option>
                {inProgressTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-2.5 h-4 w-4 text-slate-400" />
            </div>
            {inProgressTasks.length === 0 && (
              <p className="mt-1.5 text-center text-xs text-slate-400 dark:text-slate-500">
                No tasks in progress. Move a task to “In Progress” in the Study Planner.
              </p>
            )}
          </div>
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
              {isRunning && selectedTask && (
                <span
                  className={`mt-3 inline-flex max-w-[15rem] items-center truncate rounded-full px-3 py-1 text-xs font-medium ${topicColorClass(selectedTask.topic)}`}
                  title={selectedTask.title}
                >
                  <span className="truncate">{selectedTask.title}</span>
                </span>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="mt-8 flex items-center justify-center gap-4">
            <button
              onClick={reset}
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
              onClick={skip}
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
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
              <Music className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-slate-700 dark:text-slate-200">Background Music</p>
              <p className="truncate text-xs text-slate-400 dark:text-slate-500">
                {selectedTrack
                  ? isMusicPlaying
                    ? `Now playing · ${selectedTrack.label}`
                    : `${selectedTrack.label} · paused`
                  : "Pick a track to play while you focus"}
              </p>
            </div>
            {selectedTrack && isMusicPlaying && (
              <span className="ml-auto flex shrink-0 items-end gap-0.5" aria-hidden="true">
                <span className="h-2 w-0.5 animate-pulse rounded-full bg-indigo-500 [animation-delay:0ms]" />
                <span className="h-3.5 w-0.5 animate-pulse rounded-full bg-indigo-500 [animation-delay:150ms]" />
                <span className="h-2.5 w-0.5 animate-pulse rounded-full bg-indigo-500 [animation-delay:300ms]" />
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {TRACKS.map((track) => {
              const isActive = track.id === trackId;
              return (
                <button
                  key={track.id}
                  type="button"
                  onClick={() => handleSelectTrack(track.id)}
                  aria-pressed={isActive}
                  className={`rounded-xl border px-3 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-700"
                  }`}
                >
                  {track.label}
                </button>
              );
            })}
          </div>

          <MusicPlayer
            className="mt-4"
            src={selectedTrack?.src ?? null}
            onPlayingChange={setIsMusicPlaying}
          />
        </div>
      </div>
    </div>
  );
}
