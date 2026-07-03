"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, X, ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react";

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

const EVENT_BADGE_COLORS: Record<string, string> = {
  Exam: "bg-red-50 text-red-600",
  Assignment: "bg-orange-50 text-orange-600",
  Other: "bg-green-50 text-green-600",
};

const DEFAULT_EVENTS: Event[] = [
  { id: 1, title: "Mathematics Final Exam", type: "Exam", date: "2026-07-25", description: "Final exam for Calculus" },
  { id: 2, title: "Chemistry Lab Quiz", type: "Assignment", date: "2026-07-28", description: "Lab quiz on acids and bases" },
  { id: 3, title: "Study Group Meeting", type: "Other", date: "2026-07-30", description: "Weekly study group" },
  { id: 4, title: "Physics Midterm", type: "Exam", date: "2026-07-15", description: "Midterm exam" },
  { id: 5, title: "English Essay", type: "Assignment", date: "2026-07-20", description: "Submit essay" },
];

export default function CalendarPage() {
  const today = new Date();
  const [currentMonthIndex, setCurrentMonthIndex] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [events, setEvents] = useState<Event[]>(DEFAULT_EVENTS);
  const [showModal, setShowModal] = useState(false);

  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState<"Exam" | "Assignment" | "Other">("Exam");
  const [eventDate, setEventDate] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  const currentMonthName = MONTHS[currentMonthIndex];

  const daysInMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay();

  const calendarDays: { day: number | null; date: string | null; isToday: boolean; hasEvent: boolean; eventType: string; eventTitle: string }[] = [];

  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push({ day: null, date: null, isToday: false, hasEvent: false, eventType: "", eventTitle: "" });
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${currentYear}-${String(currentMonthIndex + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const isToday = d === today.getDate() && currentMonthIndex === today.getMonth() && currentYear === today.getFullYear();
    const event = events.find((e) => e.date === dateStr);
    const hasEvent = !!event;
    const eventType = event?.type || "";
    const eventTitle = event?.title || "";
    calendarDays.push({ day: d, date: dateStr, isToday, hasEvent, eventType, eventTitle });
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
    setShowModal(true);
  };

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate) return;

    const newEvent: Event = {
      id: Date.now(),
      title: eventTitle,
      type: eventType,
      date: eventDate,
      description: eventDescription,
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
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-slate-900">Calendar</h2>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Event
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Calendar Grid */}
        <div className="lg:col-span-2">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            {/* Month Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handlePrevMonth}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <h3 className="text-xl font-semibold text-slate-900">
                {currentMonthName} {currentYear}
              </h3>
              <button
                onClick={handleNextMonth}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Days of Week */}
            <div className="grid grid-cols-7 mb-2">
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className="text-center text-xs font-medium text-slate-500 uppercase tracking-wider py-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Dates */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((cell, idx) => (
                <button
                  key={idx}
                  disabled={cell.day === null}
                  onClick={() => cell.date && openAddEvent(cell.date)}
                  className={`flex flex-col items-center justify-center rounded-xl text-sm font-medium transition-colors ${
                    cell.day === null
                      ? "h-24 cursor-default"
                      : cell.isToday
                      ? "h-24 bg-indigo-600 text-white"
                      : "h-24 text-slate-700 hover:bg-slate-50 cursor-pointer"
                  }`}
                >
                  {cell.day && (
                    <>
                      <span className="leading-none">{cell.day}</span>
                      {cell.hasEvent && (
                        <span className={`mt-1 truncate w-full text-center px-0.5 py-0.5 rounded-md text-[10px] leading-tight font-medium ${
                          cell.eventType === "Exam"
                            ? "bg-red-50 text-red-700"
                            : cell.eventType === "Assignment"
                            ? "bg-orange-50 text-orange-700"
                            : "bg-green-50 text-green-700"
                        }`}>
                          {cell.eventTitle}
                        </span>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center gap-6">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <span className="text-xs text-slate-600">Exam</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-orange-500" />
                <span className="text-xs text-slate-600">Assignment</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                <span className="text-xs text-slate-600">Other</span>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Upcoming Events */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Upcoming Events</h3>
            <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
              {upcomingEvents.length === 0 ? (
                <p className="text-sm text-slate-500">No upcoming events.</p>
              ) : (
                upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-start gap-3 rounded-xl border border-slate-100 p-3"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-50">
                      <div
                        className={`h-2.5 w-2.5 rounded-full ${
                          event.type === "Exam"
                            ? "bg-red-500"
                            : event.type === "Assignment"
                            ? "bg-orange-500"
                            : "bg-green-500"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{event.title}</p>
                      <p className="text-xs text-slate-500">
                        {new Date(event.date).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="shrink-0 rounded-lg p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
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
            <h3 className="text-lg font-semibold mb-1">Quick Add</h3>
            <p className="text-sm text-white/80 mb-4">Create a new event for today</p>
            <button
              onClick={() => setShowModal(true)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-purple-600 hover:bg-white/90 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Event for Today
            </button>
          </div>

          {/* This Month Stats */}
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">This Month Stats</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Total Events</span>
                <span className="text-sm font-semibold text-slate-900">{totalEvents}</span>
              </div>
              <div className="h-px bg-slate-100" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Exams</span>
                <span className="text-sm font-semibold text-red-600">{examCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Assignments</span>
                <span className="text-sm font-semibold text-orange-600">{assignmentCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Other</span>
                <span className="text-sm font-semibold text-green-600">{otherCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-slate-900">Add New Event</h3>
              <button
                onClick={() => setShowModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddEvent} className="space-y-4">
              <div>
                <label htmlFor="eventDate" className="block text-sm font-medium text-slate-700 mb-1">
                  Date
                </label>
                <input
                  id="eventDate"
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label htmlFor="eventType" className="block text-sm font-medium text-slate-700 mb-1">
                  Event Type
                </label>
                <select
                  id="eventType"
                  value={eventType}
                  onChange={(e) => setEventType(e.target.value as "Exam" | "Assignment" | "Other")}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                >
                  <option value="Exam">Exam</option>
                  <option value="Assignment">Assignment</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="eventTitle" className="block text-sm font-medium text-slate-700 mb-1">
                  Title
                </label>
                <input
                  id="eventTitle"
                  type="text"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  placeholder="Enter event title"
                  required
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                />
              </div>
              <div>
                <label htmlFor="eventDescription" className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  id="eventDescription"
                  rows={2}
                  value={eventDescription}
                  onChange={(e) => setEventDescription(e.target.value)}
                  placeholder="Enter event description"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
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
