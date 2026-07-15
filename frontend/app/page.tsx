"use client";

import Image from "next/image";
import Link from "next/link";
import { BookOpen, Timer, TrendingUp } from "lucide-react";
import { useAuth } from "./context/AuthContext";

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  // While auth resolves, default to the logged-out CTAs rather than
  // flashing one version then the other.
  const isSignedIn = !isLoading && !!user;
  const homeHref = user?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <div className="flex min-h-screen flex-col bg-background dark:bg-slate-900">
      <header className="animate-fade-in px-6 py-4">
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-slate-900 dark:text-slate-50">
            <Image src="/images/flowfilogo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-lg object-contain" />
            Flow-Fi
          </Link>
          <div className="flex items-center gap-4">
            {isSignedIn ? (
              <>
                <span className="hidden text-sm text-slate-500 dark:text-slate-400 sm:inline">
                  Signed in as {user?.fullName}
                </span>
                <Link
                  href={homeHref}
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                >
                  Go to {user?.role === "admin" ? "Admin Panel" : "Dashboard"}
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50">
                  Sign In
                </Link>
                <Link
                  href="/signup"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="animate-fade-in-up mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-6xl dark:text-slate-50">
            Study smarter, not harder
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 dark:text-slate-400">
            Flow-Fi brings your tasks, Pomodoro timer, calendar, and progress tracking into one
            focused workspace — so you always know what to study next.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            {isSignedIn ? (
              <Link
                href={homeHref}
                className="press-feedback rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
              >
                Go to {user?.role === "admin" ? "Admin Panel" : "Dashboard"}
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="press-feedback rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="press-feedback rounded-lg border border-slate-300 px-6 py-3 text-base font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-800"
                >
                  Sign In
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="mt-20 w-full max-w-5xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div
              className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              style={{ animationDelay: "100ms" }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
                <BookOpen className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-50">Study Planner</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Organize tasks by topic, priority, and deadline on a simple Kanban board.
              </p>
            </div>
            <div
              className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              style={{ animationDelay: "180ms" }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300">
                <Timer className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-50">Focus Timer</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Pomodoro sessions with background music, so distractions stay outside.
              </p>
            </div>
            <div
              className="animate-fade-in-up rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-800"
              style={{ animationDelay: "260ms" }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300">
                <TrendingUp className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-50">Track Your Progress</h3>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
                Real-time study hours, streaks, and stats that update as you work.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-6 py-8">
        <div className="mx-auto max-w-7xl text-center text-sm text-slate-500 dark:text-slate-500">
          © 2026 Flow-Fi. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
