"use client";

import { useState, useEffect } from "react";
import { Filter, Plus, Trash2, CheckCircle2, Circle, X, ChevronDown, Search } from "lucide-react";

type Task = {
  id: number;
  title: string;
  description: string;
  subject: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  completed: boolean;
};

const DEFAULT_TASKS: Task[] = [
  {
    id: 1,
    title: "Complete Calculus Assignment",
    description: "Finish problems from chapter 5",
    subject: "Mathematics",
    priority: "HIGH",
    completed: false,
  },
  {
    id: 2,
    title: "Read Physics Chapter 4",
    description: "Notes on thermodynamics",
    subject: "Physics",
    priority: "MEDIUM",
    completed: true,
  },
  {
    id: 3,
    title: "Submit History Essay",
    description: "Renaissance art analysis",
    subject: "History",
    priority: "HIGH",
    completed: false,
  },
];

const STORAGE_KEY = "flowfi_study_tasks";

export default function StudyPlannerPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setTasks(parsed);
        } else {
          setTasks(DEFAULT_TASKS);
        }
      } else {
        setTasks(DEFAULT_TASKS);
      }
    } catch {
      setTasks(DEFAULT_TASKS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isLoading) return;

    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks, isLoading]);

  useEffect(() => {
    function handleStorage() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    }

    window.addEventListener("beforeunload", handleStorage);
    return () => window.removeEventListener("beforeunload", handleStorage);
  }, [tasks]);

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [priority, setPriority] = useState<"HIGH" | "MEDIUM" | "LOW">("MEDIUM");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSubject, setFilterSubject] = useState<string>("All");
  const [filterPriority, setFilterPriority] = useState<string>("All");
  const [showFilters, setShowFilters] = useState(false);

  const filteredTasks = tasks.filter((task) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === "" ||
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      task.subject.toLowerCase().includes(query);

    const matchesSubject = filterSubject === "All" || task.subject === filterSubject;
    const matchesPriority = filterPriority === "All" || task.priority === filterPriority;

    return matchesSearch && matchesSubject && matchesPriority;
  });

  const uniqueSubjects = Array.from(new Set(tasks.map((t) => t.subject)));

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const progressPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const priorityColors: Record<string, string> = {
    HIGH: "bg-red-50 text-red-600",
    MEDIUM: "bg-orange-50 text-orange-600",
    LOW: "bg-green-50 text-green-600",
  };

  const priorityBorderColors: Record<string, string> = {
    HIGH: "border-red-100",
    MEDIUM: "border-orange-100",
    LOW: "border-green-100",
  };

  const subjectColors: Record<string, string> = {
    Mathematics: "bg-indigo-50 text-indigo-600",
    Physics: "bg-blue-50 text-blue-600",
    History: "bg-amber-50 text-amber-600",
    Chemistry: "bg-emerald-50 text-emerald-600",
    English: "bg-purple-50 text-purple-600",
    Biology: "bg-teal-50 text-teal-600",
    Geography: "bg-rose-50 text-rose-600",
    ComputerScience: "bg-sky-50 text-sky-600",
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTask: Task = {
      id: Date.now(),
      title,
      description,
      subject: subject || "General",
      priority,
      completed: false,
    };

    setTasks([newTask, ...tasks]);
    setTitle("");
    setDescription("");
    setSubject("Mathematics");
    setPriority("MEDIUM");
    setShowForm(false);
  };

  const handleToggle = (id: number) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const handleDelete = (id: number) => {
    setTasks(tasks.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-slate-500">Total Tasks</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{totalTasks}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{completedTasks}</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <p className="text-sm text-slate-500">Overall Progress</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">{progressPercent}%</p>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Controls Row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                showFilters || filterSubject !== "All" || filterPriority !== "All"
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filter
              {(filterSubject !== "All" || filterPriority !== "All") && (
                <span className="ml-1 rounded-full bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-indigo-700">
                  {[filterSubject, filterPriority].filter((v) => v !== "All").length}
                </span>
              )}
            </button>

            {showFilters && (
              <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Subject</label>
                    <select
                      value={filterSubject}
                      onChange={(e) => setFilterSubject(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    >
                      <option value="All">All Subjects</option>
                      {uniqueSubjects.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Priority</label>
                    <select
                      value={filterPriority}
                      onChange={(e) => setFilterPriority(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    >
                      <option value="All">All Priorities</option>
                      <option value="HIGH">High</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="LOW">Low</option>
                    </select>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setFilterSubject("All");
                        setFilterPriority("All");
                        setShowFilters(false);
                      }}
                      className="text-xs font-medium text-slate-500 hover:text-slate-700"
                    >
                      Reset filters
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowFilters(false)}
                      className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Study Task
        </button>
      </div>

      {/* Add Task Form */}
      {showForm && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Create New Study Task</h3>
            <button
              onClick={() => setShowForm(false)}
              className="rounded-lg p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <form onSubmit={handleAddTask} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                  Task Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  placeholder="Enter task title"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  placeholder="Enter task description"
                />
              </div>
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-slate-700 mb-1">
                  Subject
                </label>
                <div className="relative">
                  <select
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full appearance-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Physics">Physics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="English">English</option>
                    <option value="History">History</option>
                    <option value="Geography">Geography</option>
                    <option value="ComputerScience">Computer Science</option>
                    <option value="Other">Other</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-1">
                  Priority
                </label>
                <div className="relative">
                  <select
                    id="priority"
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as "HIGH" | "MEDIUM" | "LOW")}
                    className="w-full appearance-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Create Task
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Task List Container */}
      <div className="space-y-4">
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50">
              <Search className="h-6 w-6 text-slate-400" />
            </div>
            <h3 className="mt-4 text-sm font-semibold text-slate-900">No tasks found</h3>
            <p className="mt-1 text-sm text-slate-500">Try adjusting your search or filters.</p>
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div
              key={task.id}
              className={`bg-white rounded-2xl p-5 shadow-sm border transition-colors ${
                priorityBorderColors[task.priority] || "border-slate-100"
              } ${task.completed ? "opacity-75" : ""}`}
            >
              <div className="flex items-start gap-4">
                <div className="pt-1">
                  <button
                    onClick={() => handleToggle(task.id)}
                    className="rounded-full transition-colors"
                    aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-indigo-600" />
                    ) : (
                      <Circle className="h-5 w-5 text-slate-300 hover:text-indigo-600" />
                    )}
                  </button>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        subjectColors[task.subject] || "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {task.subject}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        priorityColors[task.priority]
                      }`}
                    >
                      {task.priority}
                    </span>
                    {task.completed && (
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-600">
                        Completed
                      </span>
                    )}
                  </div>
                  <p className={`mt-2 text-sm font-medium text-slate-900 ${task.completed ? "line-through text-slate-500" : ""}`}>
                    {task.title}
                  </p>
                  <p className={`mt-1 text-sm text-slate-500 ${task.completed ? "line-through text-slate-400" : ""}`}>
                    {task.description}
                  </p>
                </div>

                <button
                  onClick={() => handleDelete(task.id)}
                  className="shrink-0 rounded-lg p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                  aria-label="Delete task"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
