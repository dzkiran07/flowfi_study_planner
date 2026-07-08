"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Settings, LogOut, UserCircle2, Sun, Moon } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";


type Props = {
  title?: string;
};

export default function DashboardHeader({ title = "Dashboard" }: Props) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);


  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!wrapperRef.current) return;
      if (!wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    if (open) document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, [open]);




  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST" });
    logout();
    window.location.href = "/login";
  };

  return (
    <header className="sticky top-0 z-20 flex w-full items-center justify-between gap-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-6 py-4 rounded-2xl shadow-md border border-transparent dark:border-white/10">
      <h1 className="text-2xl font-bold text-black dark:text-white">{title}</h1>



      <div className="relative" ref={wrapperRef}>
        <button

          type="button"
          aria-label="Open profile menu"
          onClick={() => setOpen((v) => !v)}
          className="h-10 w-10 rounded-full bg-slate-900 text-white flex items-center justify-center hover:bg-slate-800 transition-colors"
        >
          <UserCircle2 className="h-6 w-6" />
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-slate-950 text-white shadow-xl border border-white/10 overflow-hidden z-50">
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center border border-white/10">
                  <span className="text-xl">{(user?.fullName?.[0] || "U").toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <div className="font-semibold truncate">{user?.fullName || "User"}</div>
                  <div className="text-sm text-white/70 truncate">{user?.email || ""}</div>
                </div>
              </div>
            </div>

            <div className="p-2">
              <Link
                href="/dashboard/settings"
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 w-full rounded-xl px-3 py-2 text-sm text-white/90 hover:bg-white/10 transition-colors"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>

              <div className="flex items-center justify-between gap-3 px-3 py-2 mt-1 rounded-xl hover:bg-white/10 transition-colors">
                <div className="flex items-center gap-3">
                  <Sun className="h-4 w-4" />
                  <div className="text-sm text-white/90">Switch to Dark</div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={theme === "dark"}
                    onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
                    className="sr-only"
                  />
                  <span
                    className={`w-11 h-6 rounded-full transition-colors ${
                      theme === "dark" ? "bg-purple-600" : "bg-white/20"
                    }`}
                  />
                  <span
                    className={`absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                      theme === "dark" ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </label>

              </div>

              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-3 w-full rounded-xl px-3 py-2 mt-1 text-sm text-white/90 hover:bg-white/10 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Log Out
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}

