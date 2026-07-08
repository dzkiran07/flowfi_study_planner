"use client";

import { useAuth } from "../context/AuthContext";
import { Flame, BookOpen, Clock, Calendar as CalendarIcon } from "lucide-react";

import DashboardHeader from "../components/DashboardHeader";

export default function DashboardPage() {
  const { user } = useAuth();


  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const tasks = [
    { name: "Complete Calculus Assignment", due: "Today, 5:00 PM", priority: "High" },
    { name: "Read Physics Chapter 4", due: "Tomorrow, 2:00 PM", priority: "Medium" },
    { name: "Submit History Essay", due: "Fri, 11:59 PM", priority: "High" },
    { name: "Review Biology Notes", due: "Sat, 10:00 AM", priority: "Low" },
    { name: "Prepare for Chemistry Quiz", due: "Mon, 9:00 AM", priority: "Medium" },
  ];

  const progressSubjects = [
    { name: "Mathematics", percent: 75 },
    { name: "Physics", percent: 60 },
    { name: "Chemistry", percent: 45 },
    { name: "English", percent: 90 },
  ];

  const recentActivities = [
    { action: "Completed Biology Chapter 5 Notes", time: "2 hours ago" },
    { action: "Finished 2-hour Calculus Study Session", time: "5 hours ago" },
    { action: "Submitted Physics Lab Report", time: "Yesterday" },
    { action: "Created New Study Plan for Finals", time: "2 days ago" },
  ];

  return (
    <div className="space-y-6">
      <DashboardHeader title="Dashboard" />


      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-500 p-6 text-white">
        <h2 className="text-2xl font-bold">Good Afternoon, {user?.fullName}!</h2>
        <p className="mt-1 text-sm text-white/80">{currentDate}</p>
        <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
          <Flame className="h-4 w-4" />
          Your Streak: 12 Days
        </div>
      </div>

      <div className="rounded-xl bg-indigo-700 p-6 text-white">
        <h3 className="text-lg font-semibold">Ready when you are</h3>
        <p className="mt-1 text-sm text-white/80">Start a study session</p>
        <p className="mt-1 text-sm text-white/70">Choose your subject and duration</p>
        <button className="mt-4 rounded-lg bg-white px-4 py-2 text-sm font-medium text-indigo-700 hover:bg-white/90 transition-colors">
          Start session
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Active Tasks</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">6</p>
          <p className="mt-1 text-xs text-slate-500">+2 from last semester</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Tasks Completed</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">42</p>
          <p className="mt-1 text-xs text-slate-500">+8 this week</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Study Hours</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">28h</p>
          <p className="mt-1 text-xs text-slate-500">This week</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Productivity</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">94%</p>
          <p className="mt-1 text-xs text-slate-500">+5% improvement</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 lg:col-span-2">
          <h3 className="text-lg font-semibold text-slate-900">Upcoming Deadlines</h3>
          <div className="mt-4 space-y-3">
            {tasks.map((task, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between rounded-lg border border-slate-100 p-4"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50">
                    <BookOpen className="h-5 w-5 text-slate-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{task.name}</p>
                    <p className="text-xs text-slate-500">{task.due}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    task.priority === "High"
                      ? "bg-red-50 text-red-600"
                      : task.priority === "Medium"
                      ? "bg-orange-50 text-orange-600"
                      : "bg-green-50 text-green-600"
                  }`}
                >
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl bg-purple-600 p-5 text-white">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 rounded-lg bg-white/20 p-2">
                <BookOpen className="h-5 w-5" />
              </div>
              <p className="text-sm leading-relaxed">
                &ldquo;Success is the sum of small efforts repeated day in and day out.&rdquo;
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-lg font-semibold text-slate-900">Weekly Study Progress</h3>
            <div className="mt-4 space-y-4">
              {progressSubjects.map((subject) => (
                <div key={subject.name}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-slate-700">{subject.name}</span>
                    <span className="text-slate-500">{subject.percent}%</span>
                  </div>
                  <div className="mt-2 h-2 rounded-full bg-slate-100">
                    <div
                      className="h-2 rounded-full bg-indigo-600"
                      style={{ width: `${subject.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <h3 className="text-lg font-semibold text-slate-900">Recent Activity</h3>
        <div className="mt-4 space-y-4">
          {recentActivities.map((activity, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between rounded-lg border border-slate-100 p-4"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-50">
                  <Clock className="h-5 w-5 text-slate-600" />
                </div>
                <p className="text-sm font-medium text-slate-900">{activity.action}</p>
              </div>
              <span className="text-xs text-slate-500">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
