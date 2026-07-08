"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2 } from "lucide-react";

type Event = {
  id: number;
  title: string;
  type: "Exam" | "Assignment" | "Other";
  date: string;
  description: string;
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const EVENT_COLORS: Record<string, string> = {
  Exam: "bg-red-500",
  Assignment: "bg-orange-500",
  Other: "bg-green-500",
};

const EVENT_DOT_COLORS: Record<string, string> = {
  Exam: "bg-red-500",
  Assignment: "bg-orange-500",
  Other: "bg-green-500",
};

const EVENT_BADGE_COLORS: Record<string, string> = {
  Exam: "bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400",
  Assignment: "bg-orange-50 text-orange-600 dark:bg-orange-500/15 dark:text-orange-400",
  Other: "bg-green-50 text-green-600 dark:bg-green-500/15 dark:text-green-400",
};

const TYPE_OPTIONS: Event["type"][] = ["Exam", "Assignment", "Other"];

const DEFAULT_EVENTS: Event[] = [
  { id: 1, title: "Mathematics Final Exam", type: "Exam", date: "2026-07-25", description: "Final exam for Calculus" },
  { id: 2, title: "Chemistry Lab Quiz", type: "Assignment", date: "2026-07-28", description: "Lab quiz on acids and bases" },
  { id: 3, title: "Study Group Meeting", type: "Other", date: "2026-07-30", description: "Weekly study group" },
  { id: 4, title: "Physics Midterm", type: "Exam", date: "2026-07-15", description: "Midterm exam" },
  { id: 5, title: "English Essay", type: "Assignment", date: "2026-07-20", description: "Submit essay" },
];

import DashboardHeader from "../../components/DashboardHeader";

export default function CalendarPage() {
  const today = new Date();
  const [currentMonthIndex, setCurrentMonthIndex] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [events, setEvents] = useState<Event[]>(DEFAULT_EVENTS);
  const [showModal, setShowModal] = useState(false);

  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState<Event["type"]>("Exam");
  const [eventDate, setEventDate] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  const currentMonthName = MONTHS[currentMonthIndex];

  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay();

  const calendarDays: { day: number | null; date: string | null; isToday: boolean; events: Event[] }[] = [];

  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push({ day: null, date: null, isToday: false, events: [] });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const isToday = d === today.getDate() && currentMonthIndex === today.getMonth() && currentYear === today.getFullYear();
    const dayEvents = events.filter((e) => e.date === dateStr);
    calendarDays.push({ day: d, date: dateStr, isToday, events: dayEvents });
  }

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonthIndex(currentMonthIndex - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonthIndex(currentMonthIndex + 1);
    }
  };

  const openAddEvent = (dateStr: string) => {
    setEventDate(dateStr);
    setEventTitle("");
    setEventDescription("");
    setEventType("Exam");
    setShowModal(true);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate) return;

    const newEvent: Event = {
      id: Date.now(),
      title: eventTitle.trim(),
      type: eventType,
      date: eventDate,
      description: eventDescription.trim(),
    };

    setEvents([...events, newEvent]);
    setEventTitle("");
    setEventType("Exam");
    setEventDate("");
    setEventDescription("");
    setShowModal(false);
  };

  const handleDeleteEvent = (id: number) => {
    setEvents(events.filter((e) => e.id !== id));
  };

  const monthEvents = events.filter((e) => {
    const eventDate = new Date(e.date);
    return eventDate.getMonth() === currentMonthIndex && eventDate.getFullYear() === currentYear;
  });

  const totalEvents = monthEvents.length;
  const examCount = monthEvents.filter((e) => e.type === "Exam").length;
  const assignmentCount = monthEvents.filter((e) => e.type === "Assignment").length;
  const otherCount = monthEvents.filter((e) => e.type === "Other").length;

  const upcomingEvents = events
    .filter((e) => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <DashboardHeader title="Calendar" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-50">Calendar</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Plan exams, assignments and study sessions</p>
        </div>
        <button
          onClick={() => openAddEvent("")}
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Calendar Grid */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800 sm:p-6">
            {/* Month Header */}
            <div className="mb-5 flex items-center justify-between">
              <button
                onClick={handlePrevMonth}
                aria-label="Previous month"
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                {currentMonthName} {currentYear}
              </h3>
              <button
                onClick={handleNextMonth}
                aria-label="Next month"
                className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Days of Week */}
            <div className="mb-2 grid grid-cols-7">
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className="py-2 text-center text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Dates */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarDays.map((cell, idx) => (
                <button
                  key={idx}
                  disabled={cell.day === null}
                  onClick={() => cell.date && openAddEvent(cell.date)}
                  className={`flex aspect-square flex-col items-center justify-start rounded-xl p-1.5 text-sm transition-colors ${
                    cell.day === null
                      ? "cursor-default"
                      : cell.isToday
                      ? "bg-indigo-600 font-semibold text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                  }`}
                >
                  {cell.day && (
                    <>
                      <span className="leading-none">{cell.day}</span>
                      {cell.events.length > 0 && (
                        <div className="mt-1 flex flex-wrap items-center justify-center gap-1">
                          {cell.events.slice(0, 3).map((ev) => (
                            <span
                              key={ev.id}
                              title={ev.title}
                              className={`h-1.5 w-1.5 rounded-full ${EVENT_DOT_COLORS[ev.type]}`}
                            />
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 border-t border-slate-100 pt-4 dark:border-slate-700">
              {(["Exam", "Assignment", "Other"] as const).map((type) => (
                <div key={type} className="flex items-center gap-2">
                  <span className={`h-2.5 w-2.5 rounded-full ${EVENT_COLORS[type]}`} />
                  <span className="text-xs text-slate-600 dark:text-slate-400">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
              <Clock className="h-5 w-5 text-indigo-500" />
              Upcoming Events
            </h3>
            <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No upcoming events.</p>
              ) : (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="group flex items-start gap-3 rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
                  >
                    <div className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${EVENT_COLORS[event.type]}`} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-slate-100">{event.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      aria-label="Delete event"
                      className="shrink-0 rounded-lg p-1 text-slate-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-500/15"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Add Event */}
          <div className="rounded-2xl bg-gradient-to-br from-purple-600 to-pink-500 p-5 text-white">
            <h3 className="text-lg font-semibold">Quick Add</h3>
            <p className="mb-4 mt-1 text-sm text-white/80">Create a new event for today</p>
            <button
              onClick={() => openAddEvent(today.toISOString().slice(0, 10))}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-purple-600 transition-colors hover:bg-white/90"
            >
              <Plus className="h-4 w-4" />
              Add Event for Today
            </button>
          </div>

          {/* This Month Stats */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h3 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-50">This Month</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400">Total Events</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">{totalEvents}</span>
              </div>
              <div className="h-px bg-slate-100 dark:bg-slate-700" />
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-red-500" /> Exams
                </span>
                <span className="text-sm font-semibold text-red-600 dark:text-red-400">{examCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-orange-500" /> Assignments
                </span>
                <span className="text-sm font-semibold text-orange-600 dark:text-orange-400">{assignmentCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <CheckCircle2 className="h-4 w-4 text-green-500" /> Other
                </span>
                <span className="text-sm font-semibold text-green-600 dark:text-green-400">{otherCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowModal(false)}>
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">Add New Event</h3>
              <button
                onClick={() => setShowModal(false)}
                aria-label="Close"
                className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label htmlFor="eventTitle" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Title
                </label>
                <input
                  id="eventTitle"
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Enter event title"
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="eventType" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Type
                  </label>
                  <select
                    id="eventType"
                    value={eventType}
                    onChange={(e) => setEventType(e.target.value as Event["type"])}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  >
                    {TYPE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="eventDate" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Date
                  </label>
                  <input
                    id="eventDate"
                    type="date"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="eventDescription" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                  Description
                </label>
                <textarea
                  id="eventDescription"
                  rows={3}
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Enter event description"
                  className="w-full resize-none rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                />
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
                  className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
