"use client";

import DashboardHeader from "../../components/DashboardHeader";

export default function StatisticsPage() {
  return (
    <div className="space-y-6">
      <DashboardHeader title="Statistics" />
      <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
        Statistics
      </h2>

      <p className="mt-2 text-zinc-600 dark:text-zinc-400">
        Track your progress and performance.
      </p>
    </div>
  );
}
