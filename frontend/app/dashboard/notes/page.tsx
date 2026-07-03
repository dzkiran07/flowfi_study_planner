"use client";

import { useState } from "react";
import { Search, Plus, MoreHorizontal, X } from "lucide-react";

type Note = {
  id: number;
  title: string;
  content: string;
  tag: string;
  date: string;
};

const NOTE_COLORS = [
  "bg-blue-100",
  "bg-pink-100",
  "bg-green-100",
  "bg-yellow-100",
  "bg-purple-100",
];

const TAG_COLORS: Record<string, string> = {
  Work: "bg-blue-500",
  Personal: "bg-green-500",
  Ideas: "bg-purple-500",
  Study: "bg-orange-500",
  Default: "bg-slate-500",
};

const DEFAULT_NOTES: Note[] = [
  { id: 1, title: "Meeting Notes", content: "Discussed project timeline and deliverables...", tag: "Work", date: "Jul 1, 2026" },
  { id: 2, title: "Shopping List", content: "Milk, eggs, bread, and fruits...", tag: "Personal", date: "Jun 30, 2026" },
  { id: 3, title: "App Ideas", content: "A platform for collaborative learning...", tag: "Ideas", date: "Jun 28, 2026" },
  { id: 4, title: "Math Formulas", content: "Quadratic formula: x = (-b ± √...", tag: "Study", date: "Jun 25, 2026" },
  { id: 5, title: "Travel Plans", content: "Research destinations for summer...", tag: "Personal", date: "Jun 20, 2026" },
];

export default function NotesPage() {
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-300 bg-white text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            New Note
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEFAULT_NOTES.map((note, idx) => (
<div
               key={note.id}
               className={`${NOTE_COLORS[idx % NOTE_COLORS.length]} rounded-lg p-4 shadow-md hover:-rotate-1 transition-transform duration-200 ease-in-out relative`}
             >
              <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/30 to-transparent rounded-t-lg pointer-events-none" />
              <div className="flex items-start justify-between mb-3">
                <span className={`text-xs font-medium text-white px-2 py-0.5 rounded ${TAG_COLORS[note.tag] || TAG_COLORS.Default}`}>
                  {note.tag}
                </span>
                <button className="text-slate-600 hover:text-slate-900">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
              <h3 className="text-base font-semibold text-slate-900 mb-2">{note.title}</h3>
              <p className="text-sm text-slate-600 mb-4 line-clamp-3">{note.content}</p>
              <div className="text-xs text-slate-500">{note.date}</div>
            </div>
          ))}
        </div>

        <div className="text-center text-sm text-slate-500 pt-4">
          12 notes total
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-900">Add New Note</h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form className="space-y-4">
              <div>
                <label htmlFor="noteTitle" className="block text-sm font-medium text-slate-700 mb-1">
                  Title
                </label>
                <input
                  id="noteTitle"
                  type="text"
                  placeholder="Enter note title"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label htmlFor="noteContent" className="block text-sm font-medium text-slate-700 mb-1">
                  Content
                </label>
                <textarea
                  id="noteContent"
                  rows={4}
                  placeholder="Write your note..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-600 resize-none"
                />
              </div>
              <div>
                <label htmlFor="noteTag" className="block text-sm font-medium text-slate-700 mb-1">
                  Tag (optional)
                </label>
                <input
                  id="noteTag"
                  type="text"
                  placeholder="Add a tag"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
                >
                  Add Note
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}