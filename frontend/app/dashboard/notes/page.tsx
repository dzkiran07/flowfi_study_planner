"use client";

import { useEffect, useState } from "react";
import { Search, Plus, Trash2, X, StickyNote, FileText, Loader2 } from "lucide-react";

import DashboardHeader from "../../components/DashboardHeader";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import { authFetch } from "../../lib/api";

type Note = {
  id: string;
  title: string;
  content: string;
  tag: string;
  createdAt: string;
};

type RawNote = {
  _id: string;
  title: string;
  content: string;
  tag: string;
  createdAt: string;
};

function mapNote(n: RawNote): Note {
  return { id: n._id, title: n.title, content: n.content, tag: n.tag, createdAt: n.createdAt };
}

const TAG_COLORS: Record<string, string> = {
  Work: "bg-blue-500",
  Personal: "bg-green-500",
  Ideas: "bg-purple-500",
  Study: "bg-orange-500",
  Default: "bg-slate-500",
};

const TAG_BORDER_COLORS: Record<string, string> = {
  Work: "border-l-blue-500",
  Personal: "border-l-green-500",
  Ideas: "border-l-purple-500",
  Study: "border-l-orange-500",
  Default: "border-l-slate-500",
};

const TAG_OPTIONS = ["Work", "Personal", "Ideas", "Study", "Custom"];

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function NotesPage() {
  const { token, isLoading: authLoading } = useAuth();
  const toast = useToast();

  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState("Work");
  const [customTag, setCustomTag] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setNotes([]);
      setIsLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await authFetch<{ notes: RawNote[] }>("/notes", token);
        if (cancelled) return;
        setNotes(res.notes.map(mapNote));
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load notes.");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, authLoading]);

  const filteredNotes = notes.filter((note) => {
    const q = searchQuery.toLowerCase().trim();
    if (q === "") return true;
    return (
      note.title.toLowerCase().includes(q) ||
      note.content.toLowerCase().includes(q) ||
      note.tag.toLowerCase().includes(q)
    );
  });

  const openModal = () => {
    setTitle("");
    setContent("");
    setTag("Work");
    setCustomTag("");
    setSaveError(null);
    setShowModal(true);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !token) return;
    const finalTag = tag === "Custom" ? customTag.trim() || "Default" : tag;
    setIsSaving(true);
    setSaveError(null);
    try {
      const res = await authFetch<{ note: RawNote }>("/notes", token, {
        method: "POST",
        body: { title: title.trim(), content: content.trim(), tag: finalTag },
      });
      setNotes((prev) => [mapNote(res.note), ...prev]);
      setShowModal(false);
      toast.success("Note created", { message: `"${res.note.title}" was saved.` });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save note.";
      setSaveError(message);
      toast.error("Failed to save note", { message });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!token) return;
    const target = notes.find((n) => n.id === id);
    try {
      await authFetch(`/notes/${id}`, token, { method: "DELETE" });
      setNotes((prev) => prev.filter((n) => n.id !== id));
      toast.success("Note deleted", { message: target ? `"${target.title}" was removed.` : undefined });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete note.";
      setError(message);
      toast.error("Failed to delete note", { message });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6 dark:bg-slate-800">
      <div className="mx-auto max-w-6xl space-y-6">
        <DashboardHeader title="Notes" />

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Notes</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {notes.length} {notes.length === 1 ? "note" : "notes"} saved
            </p>
          </div>
          <button
            onClick={openModal}
            className="press-feedback inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            New Note
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        {/* Notes grid */}
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-16 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading notes...
          </div>
        ) : filteredNotes.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white py-16 text-center dark:border-slate-700 dark:bg-slate-800">
            <FileText className="h-10 w-10 text-slate-300 dark:text-slate-600" />
            <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">No notes found</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {searchQuery ? "Try a different search term." : "Create your first note to get started."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredNotes.map((note, i) => (
              <div
                key={note.id}
                onClick={() => setSelectedNote(note)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedNote(note);
                  }
                }}
                className={`animate-fade-in-up group relative flex cursor-pointer flex-col rounded-2xl border border-l-4 border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md dark:border-slate-700 dark:bg-slate-800 ${
                  TAG_BORDER_COLORS[note.tag] || TAG_BORDER_COLORS.Default
                }`}
                style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${
                      TAG_COLORS[note.tag] || TAG_COLORS.Default
                    }`}
                  >
                    {note.tag}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                    aria-label="Delete note"
                    className="rounded-lg p-1 text-slate-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-500/15"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <h3 className="mt-3 line-clamp-1 text-base font-semibold text-slate-900 dark:text-slate-100">
                  {note.title}
                </h3>
                <p className="mt-1 line-clamp-3 flex-1 text-sm text-slate-600 dark:text-slate-400">{note.content}</p>
                <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                  <StickyNote className="h-3.5 w-3.5" />
                  {formatDate(note.createdAt)}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Note Modal */}
      {showModal && (
        <div
          className="animate-overlay-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setShowModal(false)}
        >
          <div
            className="animate-scale-in w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Add New Note</h3>
              <button
                onClick={() => setShowModal(false)}
                aria-label="Close"
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddNote} className="space-y-4">
              {saveError && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                  {saveError}
                </div>
              )}
              <div>
                <label htmlFor="noteTitle" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Title
                </label>
                <input
                  id="noteTitle"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter note title"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label htmlFor="noteContent" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Content
                </label>
                <textarea
                  id="noteContent"
                  rows={4}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Write your note..."
                  className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div>
                <label htmlFor="noteTag" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Tag
                </label>
                <select
                  id="noteTag"
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                >
                  {TAG_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                {tag === "Custom" && (
                  <input
                    type="text"
                    value={customTag}
                    onChange={(e) => setCustomTag(e.target.value)}
                    placeholder="Enter your custom tag"
                    className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  />
                )}
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="press-feedback inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSaving ? "Saving..." : "Add Note"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Note Detail Modal */}
      {selectedNote && (
        <div
          className="animate-overlay-in fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedNote(null)}
        >
          <div
            className="animate-scale-in w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className={`flex items-center justify-between gap-3 border-l-4 p-6 ${
                TAG_BORDER_COLORS[selectedNote.tag] || TAG_BORDER_COLORS.Default
              }`}
            >
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold text-white ${
                  TAG_COLORS[selectedNote.tag] || TAG_COLORS.Default
                }`}
              >
                {selectedNote.tag}
              </span>
              <button
                onClick={() => setSelectedNote(null)}
                aria-label="Close"
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-50">{selectedNote.title}</h3>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
                <StickyNote className="h-3.5 w-3.5" />
                {formatDate(selectedNote.createdAt)}
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700 dark:text-slate-300">
                {selectedNote.content}
              </p>
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => {
                    handleDeleteNote(selectedNote.id);
                    setSelectedNote(null);
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50 dark:border-red-800 dark:bg-slate-900 dark:text-red-400 dark:hover:bg-red-500/15"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete Note
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
