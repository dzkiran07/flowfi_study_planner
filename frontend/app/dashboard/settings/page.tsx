"use client";

import { useState } from "react";
import { User, Sun, Trash2, Info } from "lucide-react";

import DashboardHeader from "../../components/DashboardHeader";
import { useTheme } from "../../context/ThemeContext";

export default function SettingsPage() {
  const [fullName, setFullName] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [course, setCourse] = useState("Computer Science");
  const [bio, setBio] = useState("");

  const { theme, setTheme } = useTheme();

  return (
    <div className="min-h-screen bg-background dark:bg-slate-800 dark:text-slate-100 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <DashboardHeader title="Settings" />

        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Settings</h2>

          <p className="mt-2 text-slate-600 dark:text-slate-400">Manage your account and preferences</p>
        </div>

        <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <User className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Profile Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
            <div>
              <label htmlFor="course" className="block text-sm font-medium text-slate-700 mb-1">
                Course/Program
              </label>
              <input
                id="course"
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-slate-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                rows={3}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-600 resize-none"
              />
            </div>
            <div className="pt-2">
              <button className="rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors">
                Save Profile
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <Sun className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Appearance</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Dark Mode</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark themes</p>
              </div>
              <button
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  theme === "dark" ? "bg-purple-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    theme === "dark" ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4 dark:bg-blue-950/30">
              <Info className="h-4 w-4 text-blue-600 mt-0.5 dark:text-blue-400" />
              <p className="text-xs text-blue-700 dark:text-blue-300">
                Your theme preference is saved on this device and applied automatically on your next visit.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-300">Data Management</h3>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-red-700 dark:text-red-400">
              Clear all your data including tasks, notes, and calendar events. This action cannot be undone.
            </p>
            <button className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors">
              <Trash2 className="h-4 w-4" />
              Clear All Data
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}