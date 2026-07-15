"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useTasks } from "./TaskContext";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

export type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

export const MODES: Record<
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

export const MODE_ORDER: TimerMode[] = ["pomodoro", "shortBreak", "longBreak"];

/** Formats a seconds count as "MM:SS". */
export function formatTimeLeft(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/** Plays a short (~6s) beeping alarm using the Web Audio API — no audio asset needed. */
function playAlarm(ctx: AudioContext | null) {
  if (!ctx) return;
  if (ctx.state === "suspended") ctx.resume().catch(() => {});

  const beepDuration = 0.35;
  const gap = 0.25;
  const totalBeeps = 10; // ~6 seconds total

  for (let i = 0; i < totalBeeps; i++) {
    const startTime = ctx.currentTime + i * (beepDuration + gap);
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 880;
    gainNode.gain.setValueAtTime(0.0001, startTime);
    gainNode.gain.exponentialRampToValueAtTime(0.35, startTime + 0.02);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + beepDuration);
    osc.connect(gainNode).connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + beepDuration + 0.02);
  }
}

// Namespaced per user — a previous account's in-progress (not yet logged)
// Pomodoro credit must never bleed into a different account's Study Hours.
function timerStateKey(userId: string): string {
  return `flowfi_timer_state_${userId}`;
}

type PersistedState = {
  mode: TimerMode;
  endAt: number | null;
  pausedRemaining: number | null;
  isRunning: boolean;
  completedSessions: number;
  selectedTaskId: string | null;
  /** Credited focus minutes for the in-progress Pomodoro, not yet logged as a Session. */
  accumulatedMinutes: number;
  /** Wall-clock start of the current running segment (null when not actively running a Pomodoro). */
  segmentStartAt: number | null;
};

type TimerContextType = {
  mode: TimerMode;
  timeLeft: number;
  isRunning: boolean;
  completedSessions: number;
  selectedTaskId: string | null;
  /** Minutes credited toward the current, not-yet-completed Pomodoro. Survives pause/reset/mode-switch — only cleared once the session actually completes and is logged. */
  elapsedMinutes: number;
  setSelectedTaskId: (id: string | null) => void;
  changeMode: (mode: TimerMode) => void;
  togglePlay: () => void;
  reset: () => void;
  skip: () => void;
};

const TimerContext = createContext<TimerContextType>({
  mode: "pomodoro",
  timeLeft: MODES.pomodoro.duration,
  isRunning: false,
  completedSessions: 0,
  selectedTaskId: null,
  elapsedMinutes: 0,
  setSelectedTaskId: () => {},
  changeMode: () => {},
  togglePlay: () => {},
  reset: () => {},
  skip: () => {},
});

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const { tasks, isLoading: tasksLoading, logSession } = useTasks();
  const toast = useToast();
  const { user } = useAuth();
  const userId = user?.id ?? null;

  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [endAt, setEndAt] = useState<number | null>(null);
  const [pausedRemaining, setPausedRemaining] = useState<number | null>(MODES.pomodoro.duration);
  const [isRunning, setIsRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [accumulatedMinutes, setAccumulatedMinutes] = useState(0);
  const [segmentStartAt, setSegmentStartAt] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const audioCtxRef = useRef<AudioContext | null>(null);

  // Force a re-render every second while running so the derived `timeLeft`
  // (computed from wall-clock time below) stays visually live.
  const [, setTick] = useState(0);

  function resetToDefaults() {
    setMode("pomodoro");
    setEndAt(null);
    setPausedRemaining(MODES.pomodoro.duration);
    setIsRunning(false);
    setCompletedSessions(0);
    setSelectedTaskId(null);
    setAccumulatedMinutes(0);
    setSegmentStartAt(null);
  }

  // Hydrate from this user's own namespaced key whenever the logged-in user
  // changes (login, logout, or switching accounts on the same browser) — the
  // previous user's key is wiped at the same moment, so a not-yet-logged
  // Pomodoro's `accumulatedMinutes` can never bleed into the next account's
  // Study Hours (calculateStats adds `elapsedMinutes` straight on top).
  const prevUserIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (typeof window === "undefined") return;

    const prevUserId = prevUserIdRef.current;
    if (prevUserId && prevUserId !== userId) {
      localStorage.removeItem(timerStateKey(prevUserId));
    }
    prevUserIdRef.current = userId;

    if (!userId) {
      resetToDefaults();
      setIsLoading(false);
      return;
    }

    try {
      const stored = localStorage.getItem(timerStateKey(userId));
      const parsed = stored ? (JSON.parse(stored) as Partial<PersistedState>) : null;
      setTimeout(() => {
        if (parsed) {
          setMode(parsed.mode ?? "pomodoro");
          setEndAt(parsed.endAt ?? null);
          setPausedRemaining(parsed.pausedRemaining ?? MODES[parsed.mode ?? "pomodoro"].duration);
          setIsRunning(parsed.isRunning ?? false);
          setCompletedSessions(parsed.completedSessions ?? 0);
          setSelectedTaskId(parsed.selectedTaskId ?? null);
          setAccumulatedMinutes(parsed.accumulatedMinutes ?? 0);
          setSegmentStartAt(parsed.segmentStartAt ?? null);
        } else {
          resetToDefaults();
        }
        setIsLoading(false);
      }, 0);
    } catch {
      setTimeout(() => {
        resetToDefaults();
        setIsLoading(false);
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Persist on every change.
  useEffect(() => {
    if (typeof window === "undefined" || isLoading || !userId) return;
    const toSave: PersistedState = {
      mode,
      endAt,
      pausedRemaining,
      isRunning,
      completedSessions,
      selectedTaskId,
      accumulatedMinutes,
      segmentStartAt,
    };
    localStorage.setItem(timerStateKey(userId), JSON.stringify(toSave));
  }, [
    userId,
    mode,
    endAt,
    pausedRemaining,
    isRunning,
    completedSessions,
    selectedTaskId,
    accumulatedMinutes,
    segmentStartAt,
    isLoading,
  ]);

  const timeLeft =
    isRunning && endAt != null
      ? Math.max(0, Math.ceil((endAt - Date.now()) / 1000))
      : pausedRemaining ?? MODES[mode].duration;

  // Live progress toward Study Hours: already-committed minutes from earlier
  // segments of this same (not-yet-completed) Pomodoro, plus whatever has
  // elapsed in the segment currently running. This is intentionally
  // independent of `timeLeft`/`pausedRemaining`, so pausing, resetting, or
  // switching modes never claws back credit the user already earned.
  const liveSegmentMinutes =
    isRunning && mode === "pomodoro" && segmentStartAt != null
      ? Math.max(0, Date.now() - segmentStartAt) / 60000
      : 0;
  const elapsedMinutes = accumulatedMinutes + liveSegmentMinutes;

  // Live tick for display while running.
  useEffect(() => {
    if (!isRunning) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [isRunning]);

  /** Folds the currently-running segment's elapsed time into `accumulatedMinutes` and stops it. */
  function commitRunningSegment() {
    if (mode === "pomodoro" && segmentStartAt != null) {
      const segMin = Math.max(0, Date.now() - segmentStartAt) / 60000;
      setAccumulatedMinutes((m) => m + segMin);
    }
    setSegmentStartAt(null);
  }

  function completeSession() {
    playAlarm(audioCtxRef.current);
    setIsRunning(false);
    setEndAt(null);
    if (mode === "pomodoro") {
      const finalMinutes = accumulatedMinutes + (segmentStartAt != null ? Math.max(0, Date.now() - segmentStartAt) / 60000 : 0);
      setSegmentStartAt(null);
      setCompletedSessions((c) => c + 1);
      const sel = tasks.find((t) => t.id === selectedTaskId);
      if (sel) {
        logSession({
          taskId: sel.id,
          topic: sel.topic || "General",
          duration: Math.round(finalMinutes) || Math.round(MODES.pomodoro.duration / 60),
        });
      }
      // This attempt is now permanently logged as a Session — clear the
      // live credit so it isn't double-counted by calculateStats.
      setAccumulatedMinutes(0);
      setMode("shortBreak");
      setPausedRemaining(MODES.shortBreak.duration);
      toast.success("Focus session complete", {
        message: sel ? `Logged ${Math.round(finalMinutes) || 1} min on "${sel.title}".` : "Time for a short break.",
      });
    } else {
      setMode("pomodoro");
      setPausedRemaining(MODES.pomodoro.duration);
      toast.info("Break's over", { message: "Ready for another focus session?" });
    }
  }

  // Fires completion exactly when the session ends (wall-clock accurate),
  // and re-checks on tab-focus in case background throttling delayed it.
  // Waits for tasks to finish loading so a just-refreshed page doesn't miss
  // logging a session that already finished while the tab was closed.
  useEffect(() => {
    if (!isRunning || endAt == null || tasksLoading) return;
    let done = false;
    const complete = () => {
      if (done) return;
      done = true;
      completeSession();
    };
    const remainMs = endAt - Date.now();
    if (remainMs <= 0) {
      complete();
      return;
    }
    const timeoutId = setTimeout(complete, remainMs);
    const onVisible = () => {
      if (document.visibilityState === "visible" && Date.now() >= endAt) complete();
    };
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRunning, endAt, mode, selectedTaskId, tasks, tasksLoading]);

  const changeMode = (next: TimerMode) => {
    commitRunningSegment();
    setMode(next);
    setEndAt(null);
    setPausedRemaining(MODES[next].duration);
    setIsRunning(false);
  };

  const togglePlay = () => {
    if (!isRunning) {
      // Unlock/create the audio context inside this user-gesture handler so
      // the later alarm (fired from a timer callback) is allowed to play.
      if (typeof window !== "undefined" && !audioCtxRef.current) {
        const AudioCtx =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
        if (AudioCtx) {
          try {
            audioCtxRef.current = new AudioCtx();
          } catch {
            audioCtxRef.current = null;
          }
        }
      }
      audioCtxRef.current?.resume().catch(() => {});

      const startRemaining = timeLeft <= 0 ? MODES[mode].duration : timeLeft;
      setPausedRemaining(null);
      setEndAt(Date.now() + startRemaining * 1000);
      setIsRunning(true);
      if (mode === "pomodoro") setSegmentStartAt(Date.now());
    } else {
      commitRunningSegment();
      setPausedRemaining(timeLeft);
      setEndAt(null);
      setIsRunning(false);
    }
  };

  const reset = () => {
    // Resetting only restarts the visible countdown — any focus time already
    // credited to this Pomodoro attempt (accumulatedMinutes) is preserved.
    commitRunningSegment();
    setPausedRemaining(MODES[mode].duration);
    setEndAt(null);
    setIsRunning(false);
  };

  const skip = () => {
    const next = MODE_ORDER[(MODE_ORDER.indexOf(mode) + 1) % MODE_ORDER.length];
    changeMode(next);
  };

  const value = useMemo<TimerContextType>(
    () => ({
      mode,
      timeLeft,
      isRunning,
      completedSessions,
      selectedTaskId,
      elapsedMinutes,
      setSelectedTaskId,
      changeMode,
      togglePlay,
      reset,
      skip,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, timeLeft, isRunning, completedSessions, selectedTaskId, elapsedMinutes],
  );

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  return useContext(TimerContext);
}
