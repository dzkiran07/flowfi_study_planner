"use client";

import { useEffect, useState } from "react";
import { User, Sun, Trash2, Info, Loader2, CheckCircle2, AlertTriangle, X, ShieldCheck, LogOut } from "lucide-react";

import DashboardHeader from "../../components/DashboardHeader";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { authFetch } from "../../lib/api";

type Profile = { fullName: string; email: string };

export default function SettingsPage() {
  const { token, user, isLoading: authLoading, updateUser, updateToken, logout } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Load the real profile from the database whenever the authenticated user
  // is (or changes) — never hardcoded placeholders, and never another
  // account's data, since `/auth/me` is scoped to the Bearer token's owner.
  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setIsLoadingProfile(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setIsLoadingProfile(true);
      try {
        const res = await authFetch<{ user: Profile }>("/auth/me", token);
        if (cancelled) return;
        setFullName(res.user.fullName);
        setEmail(res.user.email);
      } catch (err) {
        console.error(err);
      } finally {
        if (!cancelled) setIsLoadingProfile(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, authLoading]);

  const handleSaveProfile = async () => {
    if (!token) return;
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await authFetch<{ user: Profile }>("/auth/me", token, {
        method: "PATCH",
        body: { fullName, email },
      });
      setFullName(res.user.fullName);
      setEmail(res.user.email);
      updateUser({ fullName: res.user.fullName, email: res.user.email });
      setSaveMessage({ type: "success", text: "Profile saved." });
      toast.success("Profile saved", { message: "Your changes have been saved." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save profile.";
      setSaveMessage({ type: "error", text: message });
      toast.error("Failed to save profile", { message });
    } finally {
      setIsSaving(false);
    }
  };

  const { theme, setTheme } = useTheme();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isLoggingOutAll, setIsLoggingOutAll] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setPasswordError(null);

    if (newPassword !== confirmNewPassword) {
      setPasswordError("New passwords don't match.");
      return;
    }

    setIsChangingPassword(true);
    try {
      const res = await authFetch<{ token: string }>("/auth/change-password", token, {
        method: "PATCH",
        body: { currentPassword, newPassword },
      });
      updateToken(res.token);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      toast.success("Password changed", { message: "Your password has been updated." });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to change password.";
      setPasswordError(message);
      toast.error("Failed to change password", { message });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogoutAll = async () => {
    if (!token) return;
    setIsLoggingOutAll(true);
    try {
      await authFetch("/auth/logout-all", token, { method: "POST" });
      toast.success("Logged out everywhere", { message: "Please sign in again." });
      logout();
      setTimeout(() => {
        window.location.href = "/login";
      }, 500);
      return;
    } catch (err) {
      toast.error("Failed to log out of all devices", { message: err instanceof Error ? err.message : undefined });
    } finally {
      setIsLoggingOutAll(false);
    }
  };

  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [showClearPassword, setShowClearPassword] = useState(false);
  const [clearPassword, setClearPassword] = useState("");
  const [isClearing, setIsClearing] = useState(false);
  const [clearError, setClearError] = useState<string | null>(null);

  const openClearPasswordStep = () => {
    setShowClearConfirm(false);
    setClearPassword("");
    setClearError(null);
    setShowClearPassword(true);
  };

  const handleClearData = async () => {
    if (!token) return;
    setIsClearing(true);
    setClearError(null);
    try {
      await authFetch("/auth/clear-data", token, {
        method: "POST",
        body: { password: clearPassword },
      });
      // Recent activity is a per-user, client-only log — wipe it too so
      // nothing from before the clear lingers in the timeline.
      if (user?.id) localStorage.removeItem(`flowfi_recent_activities_${user.id}`);
      setShowClearPassword(false);
      toast.success("Data cleared", { message: "All your tasks, notes, and sessions have been deleted." });
      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 500);
      return;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to clear data.";
      setClearError(message);
      toast.error("Failed to clear data", { message });
    } finally {
      setIsClearing(false);
    }
  };

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
                disabled={isLoadingProfile}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-600 disabled:opacity-60"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1 dark:text-slate-300">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoadingProfile}
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-600 disabled:opacity-60"
              />
            </div>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handleSaveProfile}
                disabled={isLoadingProfile || isSaving}
                className="inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSaving ? "Saving..." : "Save Profile"}
              </button>
              {saveMessage && (
                <span
                  className={`inline-flex items-center gap-1 text-sm font-medium ${
                    saveMessage.type === "success" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"
                  }`}
                >
                  {saveMessage.type === "success" && <CheckCircle2 className="h-4 w-4" />}
                  {saveMessage.text}
                </span>
              )}
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

        <div className="rounded-xl bg-white dark:bg-slate-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <ShieldCheck className="h-5 w-5 text-slate-600 dark:text-slate-400" />
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Security</h3>
          </div>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {passwordError && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                {passwordError}
              </div>
            )}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Current Password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-600"
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  required
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Confirm New Password
                </label>
                <input
                  id="confirmNewPassword"
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Repeat new password"
                  required
                  className="w-full rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Must be at least 8 characters and include a letter and a number.
            </p>
            <button
              type="submit"
              disabled={isChangingPassword}
              className="press-feedback inline-flex items-center gap-2 rounded-lg bg-purple-600 px-5 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isChangingPassword && <Loader2 className="h-4 w-4 animate-spin" />}
              {isChangingPassword ? "Updating..." : "Change Password"}
            </button>
          </form>

          <div className="mt-6 flex items-center justify-between gap-4 rounded-lg bg-slate-50 p-4 dark:bg-slate-900/40">
            <div>
              <p className="text-sm font-medium text-slate-900 dark:text-slate-100">Log out of all devices</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Invalidates every active session, including this one. You&apos;ll need to sign in again.
              </p>
            </div>
            <button
              onClick={handleLogoutAll}
              disabled={isLoggingOutAll}
              className="press-feedback inline-flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
            >
              {isLoggingOutAll ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
              {isLoggingOutAll ? "Logging out..." : "Log Out Everywhere"}
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
            <h3 className="text-lg font-semibold text-red-900 dark:text-red-300">Danger Zone</h3>
          </div>
          <div className="space-y-4">
            <p className="text-sm text-red-700 dark:text-red-400">
              Clear all your data including tasks, notes, and calendar events. This action cannot be undone.
            </p>
            <button
              onClick={() => setShowClearConfirm(true)}
              className="press-feedback inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              Clear All Data
            </button>
          </div>
        </div>
      </div>

      {/* Step 1: confirm intent */}
      {showClearConfirm && (
        <div
          className="animate-overlay-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setShowClearConfirm(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Confirm clear all data"
        >
          <div
            className="animate-scale-in w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Clear all your data?</h3>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              This will permanently delete every task and focus session on your account. This action cannot be undone.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowClearConfirm(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={openClearPasswordStep}
                className="press-feedback rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: verify password before actually deleting anything */}
      {showClearPassword && (
        <div
          className="animate-overlay-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => !isClearing && setShowClearPassword(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Confirm password to clear all data"
        >
          <div
            className="animate-scale-in w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Confirm your password</h3>
              <button
                onClick={() => setShowClearPassword(false)}
                disabled={isClearing}
                className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50 dark:hover:bg-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              For your security, re-enter your password to permanently delete all your data.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleClearData();
              }}
              className="mt-4 space-y-4"
            >
              {clearError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  {clearError}
                </div>
              )}
              <div>
                <label htmlFor="clearPassword" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Password
                </label>
                <input
                  id="clearPassword"
                  type="password"
                  autoFocus
                  required
                  value={clearPassword}
                  onChange={(e) => setClearPassword(e.target.value)}
                  disabled={isClearing}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-red-600 focus:outline-none focus:ring-1 focus:ring-red-600 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowClearPassword(false)}
                  disabled={isClearing}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isClearing || !clearPassword}
                  className="press-feedback inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isClearing && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isClearing ? "Clearing..." : "Clear All Data"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}