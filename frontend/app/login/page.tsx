"use client";

import { useEffect } from "react";
import { useState } from "react";
import Image from "next/image";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import PasswordInput from "../components/PasswordInput";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { user, isLoading: authLoading, login } = useAuth();
  const toast = useToast();

  // Wait for the *validated* session (not just a raw localStorage key) before
  // redirecting away — an expired/invalid token should land you back here,
  // not bounce you to a dashboard that immediately bounces you out again.
  useEffect(() => {
    if (!authLoading && user) {
      window.location.href = user.role === "admin" ? "/admin" : "/dashboard";
    }
  }, [user, authLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success || !data?.token || !data?.user) {
        const message = data?.message || "Invalid email or password";
        setError(message);
        toast.error("Login failed", { message });
      } else {
        login({ user: data.user, token: data.token });
        toast.success("Login successful", { message: `Welcome back, ${data.user.fullName}` });
        setTimeout(() => {
          window.location.href = data.user.role === "admin" ? "/admin" : "/dashboard";
        }, 500);
        return;
      }
    } catch {
      setError("Network error. Please try again.");
      toast.error("Network error", { message: "Please check your connection and try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 dark:bg-slate-900">
      <div className="animate-fade-in-up w-full max-w-md">
        <div className="text-center">
          <Image
            src="/images/flowfilogo.png"
            alt="Flow-Fi"
            width={56}
            height={56}
            className="mx-auto h-14 w-14 rounded-2xl object-contain transition-transform duration-300 hover:scale-105"
          />
          <h1 className="mt-4 text-2xl font-bold text-slate-900 dark:text-slate-50">
            Welcome Back
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Sign in to your account
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <PasswordInput
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="press-feedback flex w-full items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Don&apos;t have an account?{" "}
          <a href="/signup" className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
            Sign up
          </a>
        </p>
      </div>
    </div>
  );
}
