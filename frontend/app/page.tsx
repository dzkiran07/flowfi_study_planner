"use client";

import Image from "next/image";
import Link from "next/link";
import {
  BookOpen,
  Timer,
  TrendingUp,
  Calendar as CalendarIcon,
  FileText,
  ShieldCheck,
  ArrowRight,
  UserPlus,
  ListChecks,
  BarChart3,
} from "lucide-react";
import { useAuth } from "./context/AuthContext";
import { useScrollY } from "./lib/useScrollY";
import Reveal from "./components/Reveal";

const FEATURES = [
  {
    icon: BookOpen,
    label: "Study Planner",
    desc: "Organize tasks by topic, priority, and deadline on a simple Kanban board.",
    iconClass: "bg-blue-500/15 text-blue-400",
  },
  {
    icon: Timer,
    label: "Pomodoro Timer",
    desc: "Focus sessions with background music, so distractions stay outside.",
    iconClass: "bg-orange-500/15 text-orange-400",
  },
  {
    icon: CalendarIcon,
    label: "Smart Calendar",
    desc: "Track exams, assignments, and deadlines in one connected calendar.",
    iconClass: "bg-rose-500/15 text-rose-400",
  },
  {
    icon: FileText,
    label: "Notes",
    desc: "Capture ideas and lecture notes without leaving your workflow.",
    iconClass: "bg-emerald-500/15 text-emerald-400",
  },
  {
    icon: BarChart3,
    label: "Statistics",
    desc: "Visualize your study hours, streaks, and productivity trends.",
    iconClass: "bg-purple-500/15 text-purple-400",
  },
  {
    icon: ShieldCheck,
    label: "Secure & Private",
    desc: "Your account and data are isolated, encrypted, and yours alone.",
    iconClass: "bg-indigo-500/15 text-indigo-400",
  },
];

const STEPS = [
  {
    icon: UserPlus,
    title: "Sign up free",
    desc: "Create your account in seconds — no credit card required.",
  },
  {
    icon: ListChecks,
    title: "Plan & focus",
    desc: "Organize your tasks, then run focused Pomodoro sessions to get through them.",
  },
  {
    icon: TrendingUp,
    title: "Track your growth",
    desc: "Watch your study hours, streaks, and completion rate build over time.",
  },
];

const STATS = [
  { value: "6", label: "Productivity Tools" },
  { value: "100%", label: "Free to Use" },
  { value: "24/7", label: "Access Anywhere" },
  { value: "0", label: "Ads or Tracking" },
];

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  // While auth resolves, default to the logged-out CTAs rather than
  // flashing one version then the other.
  const isSignedIn = !isLoading && !!user;
  const homeHref = user?.role === "admin" ? "/admin" : "/dashboard";

  // Drives the parallax blobs, the hero fade-out, and the nav's scroll state.
  const scrollY = useScrollY();
  const scrolled = scrollY > 10;
  const heroOpacity = Math.max(0, 1 - scrollY / 500);
  const heroShift = Math.min(scrollY * 0.25, 120);

  return (
    <div className="flex min-h-screen flex-col bg-background dark:bg-slate-900">
      {/* Nav — intentionally always-dark/glass so it reads well over the
          animated hero regardless of the site's light/dark mode setting.
          Solidifies slightly once you've scrolled past the hero. */}
      <header
        className={`sticky top-0 z-30 border-b px-6 py-4 backdrop-blur-md transition-colors duration-300 ${
          scrolled ? "border-white/15 bg-slate-950/90 shadow-lg shadow-black/20" : "border-white/10 bg-slate-950/70"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
            <Image src="/images/flowfilogo.png" alt="" width={32} height={32} className="h-8 w-8 rounded-lg object-contain" />
            Flow-Fi
          </Link>
          <div className="flex items-center gap-6">
            <Link href="#features" className="hidden text-sm font-medium text-slate-300 transition-colors hover:text-white sm:inline">
              Features
            </Link>
            {isSignedIn ? (
              <>
                <span className="hidden text-sm text-slate-400 sm:inline">Signed in as {user?.fullName}</span>
                <Link
                  href={homeHref}
                  className="press-feedback rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                >
                  Go to {user?.role === "admin" ? "Admin Panel" : "Dashboard"}
                </Link>
              </>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-slate-300 transition-colors hover:text-white">
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="press-feedback rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero — full-bleed dark section with a slowly drifting gradient-blob
          background, independent of the app's light/dark theme toggle. */}
      <section className="relative overflow-hidden bg-slate-950">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* Each blob has its own drift keyframe (ambient motion) nested inside
              a wrapper whose translateY tracks scroll at a different rate — the
              two transforms compose, so blobs both drift AND part faster/slower
              than the page as you scroll, a classic parallax cue. */}
          <div style={{ transform: `translateY(${scrollY * 0.12}px)` }}>
            <div className="animate-blob-1 absolute -left-32 -top-32 h-96 w-96 rounded-full bg-indigo-600/30 blur-3xl" />
          </div>
          <div style={{ transform: `translateY(${scrollY * -0.08}px)` }}>
            <div className="animate-blob-2 absolute -right-24 top-10 h-[28rem] w-[28rem] rounded-full bg-blue-600/20 blur-3xl" />
          </div>
          <div style={{ transform: `translateY(${scrollY * 0.18}px)` }}>
            <div className="animate-blob-3 absolute bottom-[-8rem] left-1/3 h-[26rem] w-[26rem] rounded-full bg-violet-600/20 blur-3xl" />
          </div>
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
              backgroundSize: "56px 56px",
              transform: `translateY(${scrollY * 0.06}px)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-slate-950" />
        </div>

        <div
          className="relative mx-auto flex max-w-5xl flex-col items-center px-6 py-24 text-center sm:py-32"
          style={{ opacity: heroOpacity, transform: `translateY(${heroShift}px)` }}
        >
          

          <h1 className="animate-fade-in-up mt-6 text-4xl font-bold tracking-tight text-white sm:text-6xl" style={{ animationDelay: "60ms" }}>
            Your Complete Student
            <br />
            <span className="bg-gradient-to-r from-indigo-400 via-blue-400 to-violet-400 bg-clip-text text-transparent">
              Productivity Ecosystem
            </span>
          </h1>

          <p className="animate-fade-in-up mt-6 max-w-2xl text-lg leading-8 text-slate-400" style={{ animationDelay: "120ms" }}>
            Flow-Fi brings your tasks, Pomodoro timer, calendar, and progress tracking into one
            focused workspace so you always know what to study next.
          </p>

          <div className="animate-fade-in-up mt-10 flex flex-col items-center gap-4 sm:flex-row" style={{ animationDelay: "180ms" }}>
            {isSignedIn ? (
              <Link
                href={homeHref}
                className="press-feedback inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-600/20 transition-colors hover:bg-indigo-700"
              >
                Go to {user?.role === "admin" ? "Admin Panel" : "Dashboard"}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="press-feedback inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-indigo-600/20 transition-colors hover:bg-indigo-700"
                >
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="#features"
                  className="press-feedback rounded-lg border border-white/15 bg-white/5 px-6 py-3 text-base font-medium text-slate-200 transition-colors hover:bg-white/10"
                >
                  Explore Features
                </Link>
              </>
            )}
          </div>

          <div className="animate-fade-in-up mt-16 grid w-full grid-cols-2 gap-4 sm:grid-cols-4" style={{ animationDelay: "240ms" }}>
            {STATS.map((s) => (
              <div key={s.label} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white sm:text-3xl">{s.value}</p>
                <p className="mt-1 text-xs text-slate-400 sm:text-sm">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="flex-1">
        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-6 py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
              Everything You Need to Succeed
            </h2>
            <p className="mt-3 text-base text-slate-500 dark:text-slate-400">
              Every tool you need for academic life, designed to work together.
            </p>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <Reveal key={f.label} delay={i * 70}>
                <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md dark:border-slate-700 dark:bg-slate-800">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${f.iconClass}`}>
                    <f.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold text-slate-900 dark:text-slate-50">{f.label}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="border-t border-slate-200 bg-slate-50 px-6 py-24 dark:border-slate-800 dark:bg-slate-900/60">
          <div className="mx-auto max-w-5xl">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
                How It Works
              </h2>
              <p className="mt-3 text-base text-slate-500 dark:text-slate-400">
                From sign-up to your first focused session in three steps.
              </p>
            </Reveal>

            <div className="relative mt-16 grid grid-cols-1 gap-10 sm:grid-cols-3">
              <div
                aria-hidden="true"
                className="absolute left-0 right-0 top-8 hidden h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-700 sm:block"
              />
              {STEPS.map((s, i) => (
                <Reveal key={s.title} delay={i * 120}>
                  <div className="relative flex flex-col items-center text-center">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-4 border-slate-50 bg-indigo-600 text-white shadow-md dark:border-slate-900">
                      <s.icon className="h-6 w-6" />
                    </div>
                    <span className="mt-4 text-xs font-semibold uppercase tracking-wide text-indigo-500">
                      Step {i + 1}
                    </span>
                    <h3 className="mt-1.5 text-lg font-semibold text-slate-900 dark:text-slate-50">{s.title}</h3>
                    <p className="mt-2 max-w-xs text-sm text-slate-600 dark:text-slate-400">{s.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="px-6 py-24">
          <Reveal className="mx-auto max-w-4xl">
            <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-600 to-blue-600 px-8 py-14 text-center shadow-xl">
              <h2 className="text-3xl font-bold text-white sm:text-4xl">
                {isSignedIn ? "Jump back into your workspace" : "Ready to take control of your studies?"}
              </h2>
              <p className="mx-auto mt-3 max-w-xl text-base text-indigo-100">
                {isSignedIn
                  ? "Your tasks, timer, and stats are exactly where you left them."
                  : "Join Flow-Fi and turn scattered study habits into a focused, trackable routine."}
              </p>
              <div className="mt-8">
                <Link
                  href={isSignedIn ? homeHref : "/signup"}
                  className="press-feedback inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-indigo-700 shadow-sm transition-colors hover:bg-indigo-50"
                >
                  {isSignedIn ? `Go to ${user?.role === "admin" ? "Admin Panel" : "Dashboard"}` : "Get Started Free"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-slate-200 px-6 py-10 dark:border-slate-800">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-50">
            <Image src="/images/flowfilogo.png" alt="" width={26} height={26} className="h-[26px] w-[26px] rounded-lg object-contain" />
            Flow-Fi
          </Link>
          <div className="flex items-center gap-6 text-sm font-medium text-slate-500 dark:text-slate-400">
            <Link href="#features" className="transition-colors hover:text-slate-900 dark:hover:text-slate-100">
              Features
            </Link>
            <Link href="/login" className="transition-colors hover:text-slate-900 dark:hover:text-slate-100">
              Login
            </Link>
            <Link href="/signup" className="transition-colors hover:text-slate-900 dark:hover:text-slate-100">
              Get Started
            </Link>
          </div>
        </div>
        <div className="mx-auto mt-6 max-w-7xl border-t border-slate-100 pt-6 text-center text-sm text-slate-400 dark:border-slate-800 dark:text-slate-500">
          © 2026 Flow-Fi. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
