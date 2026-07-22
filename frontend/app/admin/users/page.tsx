"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Pencil,
  Trash2,
  X,
  ShieldCheck,
  Loader2,
  UserPlus,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  UserCircle2,
  ListTodo,
  Timer,
} from "lucide-react";

import DashboardHeader from "../../components/DashboardHeader";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { authFetch } from "../../lib/api";
import PasswordInput from "../../components/PasswordInput";
import { formatStudyHours } from "../../context/TaskContext";

type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  taskCount: number;
  sessionCount: number;
  totalStudyMinutes: number;
};

type SortKey = "id" | "fullName" | "email" | "role" | "taskCount" | "sessionCount" | "createdAt";

const COLUMNS: { key: SortKey; label: string; align?: "right" }[] = [
  { key: "id", label: "ID" },
  { key: "fullName", label: "Name" },
  { key: "email", label: "Email" },
  { key: "role", label: "Role" },
  { key: "taskCount", label: "Tasks" },
  { key: "sessionCount", label: "Sessions" },
  { key: "createdAt", label: "Joined" },
];

function formatJoined(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function shortId(id: string): string {
  return id.length > 8 ? `${id.slice(0, 8)}…` : id;
}

export default function AdminUsersPage() {
  const { token, user: currentUser } = useAuth();
  const toast = useToast();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [sortKey, setSortKey] = useState<SortKey>("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const [viewingUser, setViewingUser] = useState<AdminUser | null>(null);

  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
  const [editFullName, setEditFullName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState<"user" | "admin">("user");
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createFullName, setCreateFullName] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState<"user" | "admin">("user");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadUsers = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await authFetch<{ users: AdminUser[] }>("/admin/users", token);
      setUsers(res.users);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return users;
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.id.toLowerCase().includes(query),
    );
  }, [users, searchQuery]);

  const sortedUsers = useMemo(() => {
    const arr = [...filteredUsers];
    arr.sort((a, b) => {
      let cmp: number;
      if (sortKey === "createdAt") {
        cmp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else if (sortKey === "taskCount" || sortKey === "sessionCount") {
        cmp = a[sortKey] - b[sortKey];
      } else {
        cmp = String(a[sortKey]).localeCompare(String(b[sortKey]));
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return arr;
  }, [filteredUsers, sortKey, sortDir]);

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);

  // Any change to what's being shown resets to page 1 — otherwise a filter
  // that shrinks the result set could leave the view stranded past the end.
  useEffect(() => {
    setPage(1);
  }, [searchQuery, sortKey, sortDir, pageSize]);

  const totalPages = Math.max(1, Math.ceil(sortedUsers.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const paginatedUsers = useMemo(
    () => sortedUsers.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [sortedUsers, currentPage, pageSize],
  );

  const openEdit = (u: AdminUser) => {
    setEditingUser(u);
    setEditFullName(u.fullName);
    setEditEmail(u.email);
    setEditRole(u.role);
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    if (!editingUser || !token) return;
    setIsSaving(true);
    setEditError(null);
    try {
      const res = await authFetch<{ user: AdminUser }>(`/admin/users/${editingUser.id}`, token, {
        method: "PATCH",
        body: { fullName: editFullName, email: editEmail, role: editRole },
      });
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? { ...u, ...res.user } : u)));
      setEditingUser(null);
      toast.success("User updated", { message: `Changes to "${res.user.fullName}" were saved.` });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save changes.";
      setEditError(message);
      toast.error("Failed to update user", { message });
    } finally {
      setIsSaving(false);
    }
  };

  const openCreate = () => {
    setCreateFullName("");
    setCreateEmail("");
    setCreatePassword("");
    setCreateRole("user");
    setCreateError(null);
    setShowCreateModal(true);
  };

  const handleCreateUser = async () => {
    if (!token) return;
    setIsCreating(true);
    setCreateError(null);
    try {
      const res = await authFetch<{ user: AdminUser }>("/admin/users", token, {
        method: "POST",
        body: {
          fullName: createFullName,
          email: createEmail,
          password: createPassword,
          role: createRole,
        },
      });
      setUsers((prev) => [res.user, ...prev]);
      setShowCreateModal(false);
      toast.success("User created", { message: `"${res.user.fullName}" was added.` });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create user.";
      setCreateError(message);
      toast.error("Failed to create user", { message });
    } finally {
      setIsCreating(false);
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete || !token) return;
    setIsDeleting(true);
    try {
      await authFetch(`/admin/users/${userToDelete.id}`, token, { method: "DELETE" });
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      toast.success("User deleted", { message: `"${userToDelete.fullName}" was removed.` });
      setUserToDelete(null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete user.";
      setError(message);
      toast.error("Failed to delete user", { message });
      setUserToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <DashboardHeader title="Admin Panel" />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Users</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{users.length} total accounts</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, email, or ID..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
            />
          </div>
          <button
            onClick={openCreate}
            className="press-feedback inline-flex shrink-0 items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            <UserPlus className="h-4 w-4" />
            Add User
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-slate-500 dark:text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading users...
          </div>
        ) : sortedUsers.length === 0 ? (
          <p className="p-10 text-center text-sm text-slate-500 dark:text-slate-400">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400 dark:border-slate-700 dark:text-slate-500">
                <tr>
                  {COLUMNS.map((col) => {
                    const isActive = sortKey === col.key;
                    return (
                      <th key={col.key} className="px-5 py-3 font-medium">
                        <button
                          onClick={() => toggleSort(col.key)}
                          className="flex items-center gap-1 transition-colors hover:text-slate-700 dark:hover:text-slate-200"
                        >
                          {col.label}
                          {isActive ? (
                            sortDir === "asc" ? (
                              <ChevronUp className="h-3.5 w-3.5" />
                            ) : (
                              <ChevronDown className="h-3.5 w-3.5" />
                            )
                          ) : (
                            <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />
                          )}
                        </button>
                      </th>
                    );
                  })}
                  <th className="px-5 py-3 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {paginatedUsers.map((u) => (
                  <tr
                    key={u.id}
                    onClick={() => setViewingUser(u)}
                    className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <td
                      className="px-5 py-3 font-mono text-xs text-slate-400 dark:text-slate-500"
                      title={u.id}
                    >
                      {shortId(u.id)}
                    </td>
                    <td className="px-5 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {u.fullName}
                      {u.id === currentUser?.id && (
                        <span className="ml-2 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                          You
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{u.email}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          u.role === "admin"
                            ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                        }`}
                      >
                        {u.role === "admin" && <ShieldCheck className="h-3 w-3" />}
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{u.taskCount}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{u.sessionCount}</td>
                    <td className="px-5 py-3 text-slate-500 dark:text-slate-400">{formatJoined(u.createdAt)}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openEdit(u);
                          }}
                          aria-label="Edit user"
                          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-500/10"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setUserToDelete(u);
                          }}
                          disabled={u.id === currentUser?.id}
                          aria-label="Delete user"
                          className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-30 dark:hover:bg-red-500/10"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isLoading && sortedUsers.length > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-5 py-3 text-sm dark:border-slate-700 sm:flex-row">
            <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span>
                Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, sortedUsers.length)} of{" "}
                {sortedUsers.length}
              </span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-300"
              >
                {[10, 25, 50].map((n) => (
                  <option key={n} value={n}>
                    {n} / page
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={currentPage <= 1}
                className="press-feedback rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Previous
              </button>
              <span className="px-1 text-xs font-medium text-slate-500 dark:text-slate-400">
                Page {currentPage} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage >= totalPages}
                className="press-feedback rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* User overview modal */}
      {viewingUser && (
        <div
          className="animate-overlay-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setViewingUser(null)}
          role="dialog"
          aria-modal="true"
          aria-label="User overview"
        >
          <div
            className="animate-scale-in w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                  <UserCircle2 className="h-7 w-7" />
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-semibold text-slate-900 dark:text-slate-100">{viewingUser.fullName}</h3>
                  <p className="truncate text-sm text-slate-500 dark:text-slate-400">{viewingUser.email}</p>
                </div>
              </div>
              <button
                onClick={() => setViewingUser(null)}
                className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-5 space-y-2.5 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-900/50">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">ID</span>
                <span className="font-mono text-xs text-slate-900 dark:text-slate-100">{viewingUser.id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Role</span>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                    viewingUser.role === "admin"
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
                      : "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
                  }`}
                >
                  {viewingUser.role === "admin" && <ShieldCheck className="h-3 w-3" />}
                  {viewingUser.role}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Joined</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">{formatJoined(viewingUser.createdAt)}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-slate-200 p-3 text-center dark:border-slate-700">
                <ListTodo className="mx-auto h-4 w-4 text-indigo-500" />
                <p className="mt-1.5 text-lg font-bold text-slate-900 dark:text-slate-100">{viewingUser.taskCount}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Tasks</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 text-center dark:border-slate-700">
                <Timer className="mx-auto h-4 w-4 text-orange-500" />
                <p className="mt-1.5 text-lg font-bold text-slate-900 dark:text-slate-100">{viewingUser.sessionCount}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Sessions</p>
              </div>
              <div className="rounded-xl border border-slate-200 p-3 text-center dark:border-slate-700">
                <Timer className="mx-auto h-4 w-4 text-purple-500" />
                <p className="mt-1.5 text-lg font-bold text-slate-900 dark:text-slate-100">
                  {formatStudyHours(viewingUser.totalStudyMinutes / 60)}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Study Time</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  const u = viewingUser;
                  setViewingUser(null);
                  setUserToDelete(u);
                }}
                disabled={viewingUser.id === currentUser?.id}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-red-500/30 dark:bg-slate-900 dark:hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
              <button
                type="button"
                onClick={() => {
                  const u = viewingUser;
                  setViewingUser(null);
                  openEdit(u);
                }}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create modal */}
      {showCreateModal && (
        <div
          className="animate-overlay-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setShowCreateModal(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="animate-scale-in w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Add User</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {createError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  {createError}
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={createFullName}
                  onChange={(e) => setCreateFullName(e.target.value)}
                  placeholder="Jane Doe"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  value={createEmail}
                  onChange={(e) => setCreateEmail(e.target.value)}
                  placeholder="jane@gmail.com"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Password</label>
                <PasswordInput
                  value={createPassword}
                  onChange={(e) => setCreatePassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                <select
                  value={createRole}
                  onChange={(e) => setCreateRole(e.target.value as "user" | "admin")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateUser}
                disabled={isCreating}
                className="press-feedback inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                {isCreating ? "Creating..." : "Create User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editingUser && (
        <div
          className="animate-overlay-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setEditingUser(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="animate-scale-in w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Edit User</h3>
              <button
                onClick={() => setEditingUser(null)}
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              {editError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  {editError}
                </div>
              )}
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  type="text"
                  value={editFullName}
                  onChange={(e) => setEditFullName(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-300">Role</label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as "user" | "admin")}
                  disabled={editingUser.id === currentUser?.id}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 disabled:opacity-60 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
                {editingUser.id === currentUser?.id && (
                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">You can&apos;t change your own role.</p>
                )}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={isSaving}
                className="press-feedback inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {userToDelete && (
        <div
          className="animate-overlay-in fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setUserToDelete(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="animate-scale-in w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400">
              <Trash2 className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Delete user?</h3>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              This will permanently delete &ldquo;{userToDelete.fullName}&rdquo; and all of their tasks and sessions. This
              action cannot be undone.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="press-feedback inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
