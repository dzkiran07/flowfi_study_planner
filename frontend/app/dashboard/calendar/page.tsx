"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { Plus, Trash2, Lock, X, ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, CheckCircle2, Loader2 } from "lucide-react";
import { useTasks } from "../../context/TaskContext";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import { authFetch } from "../../lib/api";

type Event = {
  id: string;
  title: string;
  /** "Exam" | "Assignment" | "Other" | "Deadline" | a user-defined custom type name. */
  type: string;
  /** Custom color (hex) for non-built-in types, set when type is "Other" or a custom name. */
  color?: string;
  date: string;
  description: string;
  /** True for events mirrored in from the Study Planner's task deadlines — view-only, can't be deleted here. */
  locked?: boolean;
};

type RawEvent = {
  _id: string;
  title: string;
  type: string;
  color: string | null;
  date: string;
  description: string;
};

function mapEvent(e: RawEvent): Event {
  return { id: e._id, title: e.title, type: e.type, color: e.color ?? undefined, date: e.date, description: e.description };
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const EVENT_COLORS: Record<string, string> = {
  Exam: "bg-red-500",
  Assignment: "bg-orange-500",
  Other: "bg-green-500",
  Deadline: "bg-violet-500",
};

const DEFAULT_CUSTOM_COLOR = "#22c55e";

/** Resolves the display color for an event: fixed colors for the built-in types, else its custom color. */
function getEventColor(event: Pick<Event, "type" | "color">): string {
  if (event.type === "Exam") return "#ef4444";
  if (event.type === "Assignment") return "#f97316";
  if (event.type === "Deadline") return "#8b5cf6";
  return event.color || DEFAULT_CUSTOM_COLOR;
}

const TYPE_OPTIONS = ["Exam", "Assignment", "Other"] as const;

import DashboardHeader from "../../components/DashboardHeader";

export default function CalendarPage() {
  const today = new Date();
  const { tasks } = useTasks();
  const toast = useToast();
  const { token, isLoading: authLoading } = useAuth();
  const [currentMonthIndex, setCurrentMonthIndex] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSavingEvent, setIsSavingEvent] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setEvents([]);
      setIsLoadingEvents(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setIsLoadingEvents(true);
      try {
        const res = await authFetch<{ events: RawEvent[] }>("/events", token);
        if (!cancelled) setEvents(res.events.map(mapEvent));
      } catch (err) {
        if (!cancelled) toast.error("Failed to load events", { message: err instanceof Error ? err.message : undefined });
      } finally {
        if (!cancelled) setIsLoadingEvents(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, authLoading]);

  // Study Planner tasks with a deadline are mirrored in as locked "Deadline"
  // events — derived every render (not stored), so they always stay in sync
  // and can't drift from the Study Planner's own task list.
  const deadlineEvents = useMemo<Event[]>(
    () =>
      tasks
        .filter((t) => !!t.deadlineDate && t.status === "in-progress")
        .map((t) => ({
          id: `deadline-${t.id}`,
          title: t.title,
          type: "Deadline",
          date: t.deadlineDate as string,
          description: t.description,
          locked: true,
        })),
    [tasks],
  );

  const allEvents = useMemo(() => [...events, ...deadlineEvents], [events, deadlineEvents]);

  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState<string>("Exam");
  const [customTypeName, setCustomTypeName] = useState("");
  const [customColor, setCustomColor] = useState(DEFAULT_CUSTOM_COLOR);
  const [eventDate, setEventDate] = useState("");
  const [eventDescription, setEventDescription] = useState("");

  // Briefly highlights a date cell when jumping to it from the "Upcoming
  // Events" list, and scrolls it into view (switching month first if needed).
  const [highlightedDate, setHighlightedDate] = useState<string | null>(null);
  const dayRefs = useRef<Record<string, HTMLButtonElement | null>>({});

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
    const dayEvents = allEvents.filter((e) => e.date === dateStr);
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
    setCustomTypeName("");
    setCustomColor(DEFAULT_CUSTOM_COLOR);
    setShowModal(true);
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventTitle.trim() || !eventDate || !token) return;

    const isCustom = eventType === "Other";
    const resolvedType = isCustom && customTypeName.trim() ? customTypeName.trim() : eventType;

    setIsSavingEvent(true);
    try {
      const res = await authFetch<{ event: RawEvent }>("/events", token, {
        method: "POST",
        body: {
          title: eventTitle.trim(),
          type: resolvedType,
          color: isCustom ? customColor : undefined,
          date: eventDate,
          description: eventDescription.trim(),
        },
      });
      const created = mapEvent(res.event);
      setEvents((prev) => [...prev, created]);
      setEventTitle("");
      setEventType("Exam");
      setCustomTypeName("");
      setCustomColor(DEFAULT_CUSTOM_COLOR);
      setEventDate("");
      setEventDescription("");
      setShowModal(false);
      toast.success("Event added", {
        message: `"${created.title}" scheduled for ${new Date(created.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}.`,
      });
    } catch (err) {
      toast.error("Failed to add event", { message: err instanceof Error ? err.message : undefined });
    } finally {
      setIsSavingEvent(false);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    // Locked (Study Planner) deadlines never live in `events` to begin with,
    // but guard anyway in case this is ever called with one.
    if (id.startsWith("deadline-") || !token) return;
    const target = events.find((e) => e.id === id);
    try {
      await authFetch(`/events/${id}`, token, { method: "DELETE" });
      setEvents((prev) => prev.filter((e) => e.id !== id));
      if (target) toast.success("Event deleted", { message: `"${target.title}" was removed.` });
    } catch (err) {
      toast.error("Failed to delete event", { message: err instanceof Error ? err.message : undefined });
    }
  };

  // Switches to the event's month (if needed) and briefly flickers its date
  // cell so it's easy to spot where an upcoming event falls on the calendar.
  const jumpToEvent = (event: Event) => {
    const d = new Date(event.date);
    setCurrentMonthIndex(d.getMonth());
    setCurrentYear(d.getFullYear());
    setHighlightedDate(event.date);
  };

  useEffect(() => {
    if (!highlightedDate) return;
    const el = dayRefs.current[highlightedDate];
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
    const timeoutId = setTimeout(() => setHighlightedDate(null), 1600);
    return () => clearTimeout(timeoutId);
  }, [highlightedDate, currentMonthIndex, currentYear]);

  const monthEvents = allEvents.filter((e) => {
    const eventDate = new Date(e.date);
    return eventDate.getMonth() === currentMonthIndex && eventDate.getFullYear() === currentYear;
  });

  const totalEvents = monthEvents.length;
  const examCount = monthEvents.filter((e) => e.type === "Exam").length;
  const assignmentCount = monthEvents.filter((e) => e.type === "Assignment").length;
  const deadlineCount = monthEvents.filter((e) => e.type === "Deadline").length;
  const otherCount = monthEvents.filter(
    (e) => e.type !== "Exam" && e.type !== "Assignment" && e.type !== "Deadline",
  ).length;

  const upcomingEvents = allEvents
    .filter((e) => new Date(e.date) >= today)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const pastEvents = allEvents
    .filter((e) => new Date(e.date) < today)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <DashboardHeader title="Calendar" />

      <div className="flex flex-wrap items-center justify-end gap-4">
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
                  ref={(el) => {
                    if (cell.date) dayRefs.current[cell.date] = el;
                  }}
                  disabled={cell.day === null}
                  onClick={() => cell.date && openAddEvent(cell.date)}
                  className={`flex aspect-square flex-col items-center justify-start overflow-hidden rounded-xl p-1 text-sm transition-colors ${
                    cell.day === null
                      ? "cursor-default"
                      : cell.isToday
                      ? "bg-indigo-600 font-semibold text-white shadow-sm"
                      : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                  } ${
                    cell.date && cell.date === highlightedDate
                      ? "animate-pulse ring-4 ring-indigo-400 dark:ring-indigo-300"
                      : ""
                  }`}
                >
                  {cell.day && (
                    <>
                      <span className="leading-none">{cell.day}</span>
                      {cell.events.length > 0 && (
                        <div className="mt-1 flex w-full flex-col items-stretch gap-0.5">
                          {cell.events.slice(0, 2).map((ev) => (
                            <span
                              key={ev.id}
                              title={ev.title}
                              className="w-full truncate rounded px-1 text-[9px] font-medium leading-tight text-white"
                              style={{ backgroundColor: getEventColor(ev) }}
                            >
                              {ev.title}
                            </span>
                          ))}
                          {cell.events.length > 2 && (
                            <span className="text-[9px] leading-tight text-slate-400 dark:text-slate-300">
                              +{cell.events.length - 2} more
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  )}
                </button>
              ))}
            </div>

            {/* Legend */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-6 border-t border-slate-100 pt-4 dark:border-slate-700">
              {(["Exam", "Assignment", "Other", "Deadline"] as const).map((type) => (
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
                    onClick={() => jumpToEvent(event)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") jumpToEvent(event);
                    }}
                    title="Click to locate this event on the calendar"
                    className="group flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700/50"
                  >
                    <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: getEventColor(event) }} />
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
                    {event.locked ? (
                      <span
                        title="Synced from Study Planner — view only"
                        className="shrink-0 rounded-lg p-1 text-slate-300 dark:text-slate-500"
                      >
                        <Lock className="h-4 w-4" />
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(event.id);
                        }}
                        aria-label="Delete event"
                        className="shrink-0 rounded-lg p-1 text-slate-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-500/15"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Past Events */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-700 dark:bg-slate-800">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-slate-900 dark:text-slate-50">
              <CheckCircle2 className="h-5 w-5 text-slate-400" />
              Past Events
            </h3>
            <div className="max-h-64 space-y-3 overflow-y-auto pr-1">
              {pastEvents.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">No past events.</p>
              ) : (
                pastEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => jumpToEvent(event)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") jumpToEvent(event);
                    }}
                    title="Click to locate this event on the calendar"
                    className="group flex cursor-pointer items-start gap-3 rounded-xl border border-slate-100 p-3 opacity-80 transition-colors hover:bg-slate-50 hover:opacity-100 dark:border-slate-700 dark:hover:bg-slate-700/50"
                  >
                    <div className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: getEventColor(event) }} />
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
                    {event.locked ? (
                      <span
                        title="Synced from Study Planner — view only"
                        className="shrink-0 rounded-lg p-1 text-slate-300 dark:text-slate-500"
                      >
                        <Lock className="h-4 w-4" />
                      </span>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteEvent(event.id);
                        }}
                        aria-label="Delete event"
                        className="shrink-0 rounded-lg p-1 text-slate-400 opacity-0 transition-opacity hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 dark:hover:bg-red-500/15"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
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
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                  <Lock className="h-4 w-4 text-violet-500" /> Deadlines
                </span>
                <span className="text-sm font-semibold text-violet-600 dark:text-violet-400">{deadlineCount}</span>
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
                    onChange={(e) => setEventType(e.target.value)}
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
              {eventType === "Other" && (
                <div className="grid grid-cols-[1fr_auto] items-end gap-4 rounded-lg border border-dashed border-slate-300 p-3 dark:border-slate-600">
                  <div>
                    <label htmlFor="customTypeName" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Custom type name
                    </label>
                    <input
                      id="customTypeName"
                      type="text"
                      value={customTypeName}
                      onChange={(e) => setCustomTypeName(e.target.value)}
                      placeholder="e.g. Study Session"
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 dark:border-slate-600 dark:bg-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label htmlFor="customColor" className="mb-1 block text-sm font-medium text-slate-700 dark:text-slate-200">
                      Color
                    </label>
                    <input
                      id="customColor"
                      type="color"
                      value={customColor}
                      onChange={(e) => setCustomColor(e.target.value)}
                      className="h-9 w-14 cursor-pointer rounded-lg border border-slate-300 bg-white p-1 dark:border-slate-600 dark:bg-slate-900"
                    />
                  </div>
                </div>
              )}
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
                  disabled={isSavingEvent}
                  className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSavingEvent && <Loader2 className="h-4 w-4 animate-spin" />}
                  {isSavingEvent ? "Saving..." : "Add Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
