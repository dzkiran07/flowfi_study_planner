"use client";

import { useState } from "react";
import { Filter, Plus, Trash2, CheckCircle2, Circle, X, ChevronDown, Search } from "lucide-react";

import DashboardHeader from "../../components/DashboardHeader";
import DatePicker from "../../components/DatePicker";
import TimePicker from "../../components/TimePicker";
import { useTasks, formatDeadline, PRIORITY_COLORS, priorityText, SUBJECT_COLORS, SUBJECT_FALLBACK, type Priority } from "../../context/TaskContext";

export default function StudyPlannerPage() {
  const { tasks, addTask, toggleTask, deleteTask } = useTasks();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [subject, setSubject] = useState("Mathematics");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");
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

  const priorityBorderColors: Record<string, string> = {
    HIGH: "border-red-100",
    MEDIUM: "border-orange-100",
    LOW: "border-green-100",
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description,
      subject: subject || "General",
      priority,
      completed: false,
      deadlineDate: deadlineDate || undefined,
      deadlineTime: deadlineTime || undefined,
    });

    setTitle("");
    setDescription("");
    setSubject("Mathematics");
    setPriority("MEDIUM");
    setDeadlineDate("");
    setDeadlineTime("");
    setShowForm(false);
  };

  const handleToggle = (id: number) => {
    toggleTask(id);
  };

  const handleDelete = (id: number) => {
    deleteTask(id);
  };

  return (
    <div className="space-y-6">
      <DashboardHeader title="Study Planner" />

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
                    onChange={(e) => setPriority(e.target.value as Priority)}
                    className="w-full appearance-none rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label htmlFor="deadlineDate" className="block text-sm font-medium text-slate-700 mb-1">
                  Due Date
                </label>
                <DatePicker value={deadlineDate} onChange={setDeadlineDate} />
              </div>
              <div>
                <label htmlFor="deadlineTime" className="block text-sm font-medium text-slate-700 mb-1">
                  Due Time
                </label>
                <TimePicker value={deadlineTime} onChange={setDeadlineTime} />
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
              className={`group flex items-start gap-4 rounded-2xl bg-white p-5 shadow-sm border transition-colors hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-700 dark:hover:bg-slate-700/50 ${
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
                        SUBJECT_COLORS[task.subject] || SUBJECT_FALLBACK
                      }`}
                    >
                      {task.subject}
                    </span>
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_COLORS[task.priority]}`}
                    >
                      {priorityText(task.priority)}
                    </span>
                    {task.completed && (
                      <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
                        Completed
                      </span>
                    )}
                  </div>
                  <p className={`mt-2 text-sm font-semibold text-slate-900 dark:text-slate-100 ${task.completed ? "line-through text-slate-500" : ""}`}>
                    {task.title}
                  </p>
                  <p className={`mt-1 text-sm text-slate-500 dark:text-slate-400 ${task.completed ? "line-through text-slate-400" : ""}`}>
                    {task.description}
                  </p>
                  {task.deadlineDate && (
                    <p className="mt-2 text-xs font-medium text-slate-400 dark:text-slate-300">
                      Due: {formatDeadline(task.deadlineDate, task.deadlineTime)}
                    </p>
                  )}
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
