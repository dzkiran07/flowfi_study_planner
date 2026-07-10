"use client";

import { useState } from "react";
import { Filter, Plus, Trash2, CheckCircle2, Circle, X, ChevronDown, Search, GripVertical, ListTodo, TrendingUp } from "lucide-react";

import DashboardHeader from "../../components/DashboardHeader";
import DatePicker from "../../components/DatePicker";
import TimePicker from "../../components/TimePicker";
import {
  useTasks,
  calculateStats,
  PRIORITY_COLORS,
  priorityText,
  topicColorClass,
  getDeadlineInfo,
  formatDuration,
  formatDeadline,
  formatAbsoluteTime,
  TASK_STATUSES,
  type Priority,
  type TaskStatus,
  type Task,
} from "../../context/TaskContext";

export default function StudyPlannerPage() {
  const { tasks, addTask, setTaskStatus, deleteTask } = useTasks();

  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [topic, setTopic] = useState("");
  const [priority, setPriority] = useState<Priority>("MEDIUM");
  const [deadlineDate, setDeadlineDate] = useState("");
  const [deadlineTime, setDeadlineTime] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTopic, setFilterTopic] = useState<string>("All");
  const [filterPriority, setFilterPriority] = useState<string>("All");
  const [showFilters, setShowFilters] = useState(false);

  const filteredTasks = tasks.filter((task) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      query === "" ||
      task.title.toLowerCase().includes(query) ||
      task.description.toLowerCase().includes(query) ||
      task.topic.toLowerCase().includes(query);

    const matchesTopic = filterTopic === "All" || task.topic === filterTopic;
    const matchesPriority = filterPriority === "All" || task.priority === filterPriority;

    return matchesSearch && matchesTopic && matchesPriority;
  });

  const uniqueTopics = Array.from(new Set(tasks.map((t) => t.topic || "General")));

  const stats = calculateStats(tasks);
  const totalTasks = stats.total;
  const completedTasks = stats.completed;
  const progressPercent = stats.productivity;
  const createdThisWeek = stats.createdThisWeek;
  const completedThisWeek = stats.completedThisWeek;

  const priorityAccent: Record<string, string> = {
    HIGH: "border-l-red-500",
    MEDIUM: "border-l-amber-500",
    LOW: "border-l-emerald-500",
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description,
      topic: topic.trim() || "General",
      priority,
      status: "pending",
      deadlineDate: deadlineDate || undefined,
      deadlineTime: deadlineTime || undefined,
    });

    setTitle("");
    setDescription("");
    setTopic("");
    setPriority("MEDIUM");
    setDeadlineDate("");
    setDeadlineTime("");
    setShowForm(false);
  };

  const handleToggle = (id: string, current: TaskStatus) => {
    setTaskStatus(id, current === "completed" ? "pending" : "completed");
  };

  const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const confirmDelete = () => {
    if (taskToDelete) deleteTask(taskToDelete.id);
    setTaskToDelete(null);
  };

  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<TaskStatus | null>(null);

  const tasksByStatus = (status: TaskStatus) =>
    filteredTasks.filter((task) => task.status === status);

  const handleDrop = (status: TaskStatus) => {
    if (draggingId !== null) setTaskStatus(draggingId, status);
    setDraggingId(null);
    setDragOverCol(null);
  };

  return (
    <div className="space-y-6">
      <DashboardHeader title="Study Planner" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="group relative rounded-2xl border border-slate-200/70 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">Total Tasks</p>
              <p className="mt-3 text-4xl font-bold text-slate-900 dark:text-slate-50">{totalTasks}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-500/10 dark:text-indigo-300">
              <ListTodo className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-slate-400 dark:text-slate-500">
            <span className="text-emerald-600 dark:text-emerald-400">+{createdThisWeek}</span> this week
          </p>
        </div>

        <div className="group relative rounded-2xl border border-slate-200/70 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">Completed</p>
              <p className="mt-3 text-4xl font-bold text-slate-900 dark:text-slate-50">{completedTasks}</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="mt-3 text-xs font-medium text-slate-400 dark:text-slate-500">
            <span className={completedThisWeek > 0 ? "text-emerald-600 dark:text-emerald-400" : ""}>
              {completedThisWeek > 0 ? `+${completedThisWeek}` : "0"}
            </span>{" "}
            this week
          </p>
        </div>

        <div className="group relative rounded-2xl border border-slate-200/70 bg-white p-7 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg dark:border-slate-700/60 dark:bg-slate-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400 dark:text-slate-500">Overall Progress</p>
              <p className="mt-3 text-4xl font-bold text-slate-900 dark:text-slate-50">{progressPercent}%</p>
            </div>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-500/10 dark:text-purple-300">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-700">
            <div
              className="h-2.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="mt-3 text-xs font-medium text-slate-400 dark:text-slate-500">
            {completedTasks} of {totalTasks} completed
          </p>
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
                showFilters || filterTopic !== "All" || filterPriority !== "All"
                  ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                  : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Filter className="h-4 w-4" />
              Filter
              {(filterTopic !== "All" || filterPriority !== "All") && (
                <span className="ml-1 rounded-full bg-indigo-100 px-1.5 py-0.5 text-xs font-semibold text-indigo-700">
                  {[filterTopic, filterPriority].filter((v) => v !== "All").length}
                </span>
              )}
            </button>

            {showFilters && (
              <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-500 mb-1">Topic</label>
                    <select
                      value={filterTopic}
                      onChange={(e) => setFilterTopic(e.target.value)}
                      className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                    >
                      <option value="All">All Topics</option>
                      {uniqueTopics.map((s) => (
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
                        setFilterTopic("All");
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
              <div className="sm:col-span-2">
                <label htmlFor="topic" className="block text-sm font-medium text-slate-700 mb-1">
                  Topic
                </label>
                <input
                  id="topic"
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  placeholder="e.g. Mathematics, Coding, History"
                />
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

      {/* Kanban Board */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center shadow-sm dark:border-slate-700 dark:bg-slate-800">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 dark:bg-slate-700">
            <Search className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-slate-100">No tasks found</h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TASK_STATUSES.map((col) => {
            const colTasks = tasksByStatus(col.key);
            const isOver = dragOverCol === col.key;
            return (
              <div
                key={col.key}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOverCol(col.key);
                }}
                onDragLeave={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    setDragOverCol((prev) => (prev === col.key ? null : prev));
                  }
                }}
                onDrop={() => handleDrop(col.key)}
                className={`flex flex-col rounded-2xl border bg-slate-50/70 p-3 transition-colors dark:bg-slate-800/40 ${
                  col.accent
                } ${isOver ? "ring-2 ring-indigo-400 ring-offset-1 dark:ring-offset-slate-900" : ""}`}
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${col.dot}`} />
                    <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">{col.label}</h3>
                  </div>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-500 dark:bg-slate-700 dark:text-slate-300">
                    {colTasks.length}
                  </span>
                </div>

                <div className="flex min-h-[120px] flex-col gap-3">
                  {colTasks.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-slate-200 py-8 text-xs text-slate-400 dark:border-slate-700">
                      No tasks
                    </div>
                  ) : (
                    colTasks.map((task) => {
                      const deadline = getDeadlineInfo(task);
                      const DeadlineIcon = deadline.icon;
                      const isCompleted = task.status === "completed";
                      const completedIn = isCompleted
                        ? formatDuration((task.completedAt ?? Date.now()) - task.createdAt)
                        : "";
                      return (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => {
                            setDraggingId(task.id);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          onDragEnd={() => {
                            setDraggingId(null);
                            setDragOverCol(null);
                          }}
                          onClick={() => setSelectedTask(task)}
                          className={`group flex cursor-grab items-start gap-3 rounded-xl border border-slate-200 border-l-4 bg-white p-3 shadow-sm transition-all hover:shadow-md active:cursor-grabbing dark:border-slate-700 dark:bg-slate-800 ${
                            priorityAccent[task.priority] || "border-l-slate-300"
                          } ${draggingId === task.id ? "opacity-40" : ""} ${isCompleted ? "opacity-80" : ""}`}
                        >
                          <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-slate-300 dark:text-slate-600" />

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggle(task.id, task.status);
                            }}
                            className="mt-0.5 shrink-0 rounded-full transition-transform hover:scale-110 active:scale-95"
                            aria-label={isCompleted ? "Mark as incomplete" : "Mark as complete"}
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                            ) : (
                              <Circle className="h-5 w-5 text-slate-300 hover:text-indigo-600 dark:text-slate-600" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${topicColorClass(task.topic)}`}
                              >
                                {task.topic}
                              </span>
                              <span
                                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${PRIORITY_COLORS[task.priority]}`}
                              >
                                {priorityText(task.priority)}
                              </span>
                            </div>

                            <p
                              className={`mt-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100 ${
                                isCompleted ? "line-through text-slate-500" : ""
                              }`}
                            >
                              {task.title}
                            </p>
                            {task.description && (
                              <p
                                className={`mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400 ${
                                  isCompleted ? "line-through text-slate-400" : ""
                                }`}
                              >
                                {task.description}
                              </p>
                            )}

                            <div className="mt-2 flex items-center justify-between gap-2">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ${deadline.chip}`}
                              >
                                <DeadlineIcon className="h-3 w-3" />
                                {deadline.label}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setTaskToDelete(task);
                                }}
                                className="shrink-0 rounded-md p-1 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                                aria-label="Delete task"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>

                            {isCompleted && (
                              <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                                <CheckCircle2 className="h-3 w-3" />
                                Completed in {completedIn}
                              </p>
      )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task detail modal */}
      {selectedTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setSelectedTask(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Task details"
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${topicColorClass(selectedTask.topic)}`}
                >
                  {selectedTask.topic}
                </span>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PRIORITY_COLORS[selectedTask.priority]}`}
                >
                  {priorityText(selectedTask.priority)}
                </span>
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                  {TASK_STATUSES.find((s) => s.key === selectedTask.status)?.label ?? selectedTask.status}
                </span>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="shrink-0 rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">{selectedTask.title}</h3>

            {selectedTask.description && (
              <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                {selectedTask.description}
              </p>
            )}

            <div className="mt-5 space-y-2.5 rounded-xl bg-slate-50 p-4 text-sm dark:bg-slate-900/50">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Status</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {TASK_STATUSES.find((s) => s.key === selectedTask.status)?.label ?? selectedTask.status}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Created</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {formatAbsoluteTime(selectedTask.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-slate-400">Deadline</span>
                <span className="font-medium text-slate-900 dark:text-slate-100">
                  {selectedTask.deadlineDate
                    ? formatDeadline(selectedTask.deadlineDate, selectedTask.deadlineTime)
                    : "—"}
                </span>
              </div>
              {selectedTask.status === "completed" && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Completed in</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {formatDuration((selectedTask.completedAt ?? Date.now()) - selectedTask.createdAt)}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-5 flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setSelectedTask(null);
                  setTaskToDelete(selectedTask);
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-red-200 bg-white px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-500/30 dark:bg-slate-900 dark:hover:bg-red-500/10"
              >
                <Trash2 className="h-4 w-4" />
                Delete task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {taskToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
          onClick={() => setTaskToDelete(null)}
          role="dialog"
          aria-modal="true"
          aria-label="Confirm delete task"
        >
          <div
            className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-700 dark:bg-slate-800"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400">
              <Trash2 className="h-5 w-5" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-slate-100">Delete task?</h3>
            <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
              This will permanently delete &ldquo;{taskToDelete.title}&rdquo;. This action cannot be undone.
            </p>
            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setTaskToDelete(null)}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
