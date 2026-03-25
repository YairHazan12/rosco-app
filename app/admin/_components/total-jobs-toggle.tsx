"use client";

import { useState } from "react";

type View = "total" | "week" | "month";

interface TotalJobsToggleProps {
  totalJobs: number;
  weekJobs: number;
  weekCompleted: number;
  monthJobs: number;
  monthCompleted: number;
}

export default function TotalJobsToggle({
  totalJobs,
  weekJobs,
  weekCompleted,
  monthJobs,
  monthCompleted,
}: TotalJobsToggleProps) {
  const [view, setView] = useState<View>("total");

  const count =
    view === "total" ? totalJobs : view === "week" ? weekJobs : monthJobs;
  const completed =
    view === "week" ? weekCompleted : view === "month" ? monthCompleted : null;

  return (
    <div className="flex flex-col">
      {/* Toggle pill */}
      <div
        className="flex rounded-[8px] p-0.5 mb-3 self-start"
        style={{ background: "rgba(0,0,0,0.06)" }}
      >
        {(["total", "week", "month"] as View[]).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className="px-2.5 py-1 rounded-[6px] transition-all"
            style={{
              background: view === v ? "#FFFFFF" : "transparent",
              color: view === v ? "var(--label-primary)" : "var(--label-tertiary)",
              fontSize: "11px",
              fontWeight: view === v ? 600 : 400,
              boxShadow: view === v ? "0 1px 3px rgba(0,0,0,0.10)" : "none",
            }}
          >
            {v === "total" ? "All" : v === "week" ? "Week" : "Month"}
          </button>
        ))}
      </div>

      {/* Count */}
      <p
        className="text-[30px] font-bold tracking-tight leading-none stat-number"
        style={{ color: "var(--label-primary)" }}
      >
        {count}
      </p>

      {/* Label */}
      <p className="text-[12px] mt-1.5 font-medium" style={{ color: "var(--label-tertiary)" }}>
        {view === "total" ? "Total jobs" : view === "week" ? "This week" : "This month"}
      </p>

      {/* Completed sub-label */}
      {completed !== null && count > 0 && (
        <p className="text-[11px] font-semibold mt-0.5" style={{ color: "#3CC864" }}>
          {completed}/{count} done
        </p>
      )}
    </div>
  );
}
