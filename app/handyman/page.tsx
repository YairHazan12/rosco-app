import { Suspense } from "react";
import { format } from "date-fns";
import ScheduleContent from "./_components/schedule-content";
import ScheduleSkeleton from "./_components/schedule-skeleton";

export const dynamic = "force-dynamic";

export default function HandymanSchedulePage() {
  return (
    <div className="space-y-6 pb-4">
      {/* Header — renders immediately */}
      <div className="pt-2">
        <p className="text-[13px] font-medium" style={{ color: "var(--label-tertiary)" }}>
          {format(new Date(), "EEEE, MMMM d")}
        </p>
        <h1 className="ios-large-title mt-0.5">Schedule</h1>
      </div>

      {/* Schedule content streams in */}
      <Suspense fallback={<ScheduleSkeleton />}>
        <ScheduleContent />
      </Suspense>
    </div>
  );
}
