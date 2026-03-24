"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { CheckCircle2, Clock } from "lucide-react";
import { getAvailableHandymen } from "@/lib/availability";
import type { Handyman, Job } from "@/lib/types";

interface Props {
  /** ISO string or empty — the job's scheduled start datetime */
  startTime: string;
  /** Duration in hours (matches existing durationHours field) */
  durationHours: string;
  /** All handymen in the company */
  handymen: Handyman[];
  /** All existing jobs (for overlap detection) */
  jobs: Job[];
  /** Currently selected handyman id */
  selectedId: string;
  /** Called when admin selects a different handyman */
  onSelect: (id: string) => void;
}

export default function HandymanAvailabilityPicker({
  startTime,
  durationHours,
  handymen,
  jobs,
  selectedId,
  onSelect,
}: Props) {
  const result = useMemo(() => {
    if (!startTime || !durationHours) return null;
    const start = new Date(startTime);
    if (isNaN(start.getTime())) return null;
    const durationMin = parseFloat(durationHours) * 60;
    if (isNaN(durationMin) || durationMin <= 0) return null;
    return getAvailableHandymen(start, durationMin, handymen, jobs);
  }, [startTime, durationHours, handymen, jobs]);

  if (!result) {
    return (
      <div
        className="rounded-xl px-4 py-3 text-[13px]"
        style={{
          background: "rgba(120,120,128,0.08)",
          color: "var(--label-tertiary)",
        }}
      >
        Set a date/time and duration above to see worker availability.
      </div>
    );
  }

  const allCards = [
    ...result.available.map((h) => ({ handyman: h, busyUntil: null as Date | null })),
    ...result.busy.map(({ handyman, busyUntil }) => ({ handyman, busyUntil })),
  ];

  if (allCards.length === 0) {
    return (
      <div
        className="rounded-xl px-4 py-3 text-[13px]"
        style={{
          background: "rgba(120,120,128,0.08)",
          color: "var(--label-tertiary)",
        }}
      >
        No handymen found.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Summary strip */}
      <div className="flex gap-3 text-[12px] font-medium">
        <span style={{ color: "var(--ios-green, #34C759)" }}>
          {result.available.length} available
        </span>
        <span style={{ color: "var(--label-tertiary)" }}>·</span>
        <span style={{ color: "var(--label-tertiary)" }}>
          {result.busy.length} busy
        </span>
      </div>

      {/* Card grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        {allCards.map(({ handyman, busyUntil }) => {
          const isAvailable = !busyUntil;
          const isSelected = selectedId === handyman.id;

          return (
            <button
              key={handyman.id}
              type="button"
              disabled={!isAvailable}
              onClick={() => onSelect(isSelected ? "" : handyman.id)}
              className={[
                "relative text-left rounded-2xl border px-4 py-3 transition-all duration-200",
                isAvailable
                  ? "cursor-pointer active:scale-[0.98]"
                  : "cursor-not-allowed",
              ].join(" ")}
              style={{
                background: isAvailable
                  ? isSelected
                    ? "rgba(52,199,89,0.12)"
                    : "var(--bg-primary)"
                  : "rgba(120,120,128,0.06)",
                borderColor: isSelected
                  ? "var(--ios-green, #34C759)"
                  : isAvailable
                  ? "var(--border)"
                  : "rgba(120,120,128,0.2)",
                opacity: isAvailable ? 1 : 0.55,
              }}
            >
              {/* Name + status badge row */}
              <div className="flex items-start justify-between gap-2">
                <span
                  className="font-semibold text-[15px] leading-snug"
                  style={{
                    color: isAvailable
                      ? "var(--label-primary)"
                      : "var(--label-tertiary)",
                  }}
                >
                  {handyman.name}
                </span>

                {isAvailable ? (
                  <span
                    className="flex items-center gap-1 text-[11px] font-semibold rounded-full px-2 py-0.5 flex-shrink-0"
                    style={{
                      background: "rgba(52,199,89,0.15)",
                      color: "var(--ios-green, #34C759)",
                    }}
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    Available
                  </span>
                ) : (
                  <span
                    className="flex items-center gap-1 text-[11px] font-medium rounded-full px-2 py-0.5 flex-shrink-0"
                    style={{
                      background: "rgba(120,120,128,0.12)",
                      color: "var(--label-tertiary)",
                    }}
                  >
                    <Clock className="w-3 h-3" />
                    Busy
                  </span>
                )}
              </div>

              {/* Sub-text */}
              <p
                className="text-[12px] mt-0.5"
                style={{ color: "var(--label-tertiary)" }}
              >
                {isAvailable
                  ? handyman.specialties?.join(", ") || "General"
                  : `Busy until ${format(busyUntil!, "h:mm a")}`}
              </p>

              {/* Selected indicator ring */}
              {isSelected && (
                <div
                  className="absolute inset-0 rounded-2xl pointer-events-none"
                  style={{
                    boxShadow: "0 0 0 2px var(--ios-green, #34C759)",
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
