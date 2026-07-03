"use client";

import { useState } from "react";
import { User, Sun, Bell, Trash2, Info } from "lucide-react";

export default function SettingsPage() {
  const [fullName, setFullName] = useState("John Doe");
  const [email, setEmail] = useState("john@example.com");
  const [course, setCourse] = useState("Computer Science");
  const [bio, setBio] = useState("");

  const [darkMode, setDarkMode] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [taskReminders, setTaskReminders] = useState(true);
  const [examReminders, setExamReminders] = useState(true);
  const [studySuggestions, setStudySuggestions] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900">Settings</h2>
          <p className="mt-2 text-slate-600">Manage your account and preferences</p>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <User className="h-5 w-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">Profile Settings</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-slate-700 mb-1">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-600"
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

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <Sun className="h-5 w-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">Appearance</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">Dark Mode</p>
                <p className="text-xs text-slate-500">Switch between light and dark themes</p>
              </div>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  darkMode ? "bg-purple-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    darkMode ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="flex items-start gap-3 rounded-lg bg-blue-50 p-4">
              <Info className="h-4 w-4 text-blue-600 mt-0.5" />
              <p className="text-xs text-blue-700">
                Dark mode will be fully implemented in a future update. Stay tuned for more theme options!
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <Bell className="h-5 w-5 text-slate-600" />
            <h3 className="text-lg font-semibold text-slate-900">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-900">Email Notifications</p>
                <p className="text-xs text-slate-500">Receive updates via email</p>
              </div>
              <button
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  emailNotifications ? "bg-purple-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    emailNotifications ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="border-t border-slate-100" />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-900">Push Notifications</p>
                <p className="text-xs text-slate-500">Get notifications on your device</p>
              </div>
              <button
                onClick={() => setPushNotifications(!pushNotifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  pushNotifications ? "bg-purple-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    pushNotifications ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="border-t border-slate-100" />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-900">Task Reminders</p>
                <p className="text-xs text-slate-500">Reminders for upcoming tasks</p>
              </div>
              <button
                onClick={() => setTaskReminders(!taskReminders)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  taskReminders ? "bg-purple-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    taskReminders ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="border-t border-slate-100" />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-900">Exam Reminders</p>
                <p className="text-xs text-slate-500">Reminders for upcoming exams</p>
              </div>
              <button
                onClick={() => setExamReminders(!examReminders)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  examReminders ? "bg-purple-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    examReminders ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
            <div className="border-t border-slate-100" />
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-slate-900">Study Suggestions</p>
                <p className="text-xs text-slate-500">Personalized study recommendations</p>
              </div>
              <button
                onClick={() => setStudySuggestions(!studySuggestions)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  studySuggestions ? "bg-purple-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                    studySuggestions ? "translate-x-5" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-red-50 border border-red-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <Trash2 className="h-5 w-5 text-red-600" />
            <h3 className="text-lg font-semibold text-red-900">Data Management</h3>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-red-700">
              Clear all your data including tasks, notes, and calendar events. This action cannot be undone.
            </p>
            <button className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors">
              <Trash2 className="h-4 w-4" />
              Clear All Data
            </button>
          </div>
        </div>

        <div className="text-center pt-6">
          <p className="text-lg font-semibold text-slate-900">StudySync</p>
          <p className="text-xs text-slate-500 mt-1">
            Version 1.0.0 • Built with ❤️ for students
          </p>
        </div>
      </div>
    </div>
  );
}