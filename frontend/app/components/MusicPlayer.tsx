"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Play, Pause, Volume, Volume1, Volume2, VolumeX } from "lucide-react";

type MusicPlayerProps = {
  /** Audio file URL. `null` renders the player disabled ("no track selected"). */
  src: string | null;
  /** Notified whenever playback starts/stops, so a parent can show its own "now playing" state. */
  onPlayingChange?: (isPlaying: boolean) => void;
  className?: string;
};

function formatTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const VOLUME_KEY = "flowfi_music_volume";

export default function MusicPlayer({ src, onPlayingChange, className = "" }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const seekTrackRef = useRef<HTMLDivElement | null>(null);
  const volumeTrackRef = useRef<HTMLDivElement | null>(null);
  // Tracks whether `audio.src` has actually been assigned yet — kept out of
  // React state since it's a load-once latch, not something that re-renders.
  const hasLoadedRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.6);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubTime, setScrubTime] = useState(0);
  const [isDraggingVolume, setIsDraggingVolume] = useState(false);
  const [showVolumePopover, setShowVolumePopover] = useState(false);

  // Restore the user's last volume (a preference, not the track itself).
  useEffect(() => {
    const stored = localStorage.getItem(VOLUME_KEY);
    if (stored) {
      const parsed = parseFloat(stored);
      if (!Number.isNaN(parsed)) setVolume(Math.min(1, Math.max(0, parsed)));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(VOLUME_KEY, String(volume));
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // A new `src` means a fresh track: fully unload the old one and reset the
  // "has this ever been loaded" latch so the next Play click loads the new
  // file rather than silently replaying the previous one's buffered audio.
  useEffect(() => {
    hasLoadedRef.current = false;
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    const el = audioRef.current;
    if (el) {
      el.pause();
      el.removeAttribute("src");
      el.load();
    }
  }, [src]);

  useEffect(() => {
    onPlayingChange?.(isPlaying);
  }, [isPlaying, onPlayingChange]);

  // The audio element's own events are the single source of truth for
  // playback state — never a separately-tracked bit of React state that
  // could drift from what the browser is actually doing.
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    const onTimeUpdate = () => {
      if (!isScrubbing) setCurrentTime(el.currentTime);
    };
    const onLoadedMetadata = () => setDuration(el.duration || 0);
    el.addEventListener("play", onPlay);
    el.addEventListener("pause", onPause);
    el.addEventListener("ended", onEnded);
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("loadedmetadata", onLoadedMetadata);
    return () => {
      el.removeEventListener("play", onPlay);
      el.removeEventListener("pause", onPause);
      el.removeEventListener("ended", onEnded);
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("loadedmetadata", onLoadedMetadata);
    };
  }, [isScrubbing]);

  // Directly triggered by the click itself (never from an effect reacting to
  // unrelated state), so browsers always treat it as a real user gesture and
  // allow playback. Also where the lazy-load actually happens: `audio.src`
  // is only ever assigned here, on first play, not on mount or track select.
  const handleTogglePlay = () => {
    const el = audioRef.current;
    if (!el || !src) return;
    if (!hasLoadedRef.current) {
      hasLoadedRef.current = true;
      el.src = src;
      el.load();
    }
    if (el.paused) {
      el.play().catch(() => {});
    } else {
      el.pause();
    }
  };

  const seekToClientX = useCallback((clientX: number) => {
    const track = seekTrackRef.current;
    if (!track || !duration) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    setScrubTime(ratio * duration);
  }, [duration]);

  const handleSeekPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!src || !duration) return;
    setIsScrubbing(true);
    seekToClientX(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handleSeekPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isScrubbing) return;
    seekToClientX(e.clientX);
  };
  const commitSeek = () => {
    if (!isScrubbing) return;
    const el = audioRef.current;
    if (el) el.currentTime = scrubTime;
    setCurrentTime(scrubTime);
    setIsScrubbing(false);
  };

  const setVolumeFromClientX = useCallback((clientX: number) => {
    const track = volumeTrackRef.current;
    if (!track) return;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    setVolume(ratio);
  }, []);

  const handleVolumePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setIsDraggingVolume(true);
    setVolumeFromClientX(e.clientX);
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const handleVolumePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingVolume) return;
    setVolumeFromClientX(e.clientX);
  };

  const displayTime = isScrubbing ? scrubTime : currentTime;
  const progressPct = duration > 0 ? (displayTime / duration) * 100 : 0;
  const VolumeIcon = volume === 0 ? VolumeX : volume < 0.35 ? Volume : volume < 0.7 ? Volume1 : Volume2;

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <button
        type="button"
        onClick={handleTogglePlay}
        disabled={!src}
        aria-label={isPlaying ? "Pause" : "Play"}
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white shadow-sm transition-transform hover:scale-105 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:hover:scale-100 dark:disabled:bg-slate-600"
      >
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-0.5" />}
      </button>

      <span className="w-9 shrink-0 text-right text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
        {formatTime(displayTime)}
      </span>

      {/* Seek bar */}
      <div
        ref={seekTrackRef}
        role="slider"
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={Math.round(duration)}
        aria-valuenow={Math.round(displayTime)}
        tabIndex={src ? 0 : -1}
        onPointerDown={handleSeekPointerDown}
        onPointerMove={handleSeekPointerMove}
        onPointerUp={commitSeek}
        onKeyDown={(e) => {
          const el = audioRef.current;
          if (!el || !duration) return;
          if (e.key === "ArrowRight") el.currentTime = Math.min(duration, el.currentTime + 5);
          if (e.key === "ArrowLeft") el.currentTime = Math.max(0, el.currentTime - 5);
        }}
        className={`group relative h-4 flex-1 touch-none ${src ? "cursor-pointer" : "cursor-not-allowed opacity-50"}`}
      >
        <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-slate-200 dark:bg-slate-700" />
        <div
          className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-indigo-600"
          style={{ width: `${progressPct}%` }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600 opacity-0 shadow transition-opacity group-hover:opacity-100"
          style={{ left: `${progressPct}%` }}
        />
      </div>

      <span className="w-9 shrink-0 text-[11px] tabular-nums text-slate-400 dark:text-slate-500">
        -{formatTime(Math.max(0, duration - displayTime))}
      </span>

      {/* Volume popover */}
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={() => setShowVolumePopover((v) => !v)}
          aria-label="Volume"
          className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
        >
          <VolumeIcon className="h-4 w-4" />
        </button>
        {showVolumePopover && (
          <div
            onMouseLeave={() => !isDraggingVolume && setShowVolumePopover(false)}
            onPointerUp={() => setIsDraggingVolume(false)}
            className="absolute bottom-full right-0 z-10 mb-2 rounded-xl border border-slate-200 bg-white p-3 shadow-lg dark:border-slate-700 dark:bg-slate-800"
          >
            <div
              ref={volumeTrackRef}
              role="slider"
              aria-label="Volume"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(volume * 100)}
              tabIndex={0}
              onPointerDown={handleVolumePointerDown}
              onPointerMove={handleVolumePointerMove}
              className="relative h-4 w-24 cursor-pointer touch-none"
            >
              <div className="absolute top-1/2 h-1 w-full -translate-y-1/2 rounded-full bg-slate-200 dark:bg-slate-700" />
              <div
                className="absolute top-1/2 h-1 -translate-y-1/2 rounded-full bg-indigo-600"
                style={{ width: `${volume * 100}%` }}
              />
              <div
                className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-600 shadow"
                style={{ left: `${volume * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* preload="none": nothing is fetched until the first Play click assigns `src`. */}
      <audio ref={audioRef} preload="none" loop />
    </div>
  );
}
