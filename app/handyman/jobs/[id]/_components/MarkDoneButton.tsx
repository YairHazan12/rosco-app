"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle, Loader2, Play } from "lucide-react";
import { toast } from "sonner";

export default function MarkDoneButton({
  jobId,
  currentStatus,
}: {
  jobId: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const updateStatus = async (status: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${jobId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error();
      toast.success(status === "Completed" ? "Job marked complete! 🎉" : "Job started!");
      router.refresh();
    } catch {
      toast.error("Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkDone = () => {
    if (confirm("Mark this job as completed?")) updateStatus("Completed");
  };

  return (
    /* Sits above the tab bar (68px) + safe-area-inset-bottom */
    <div
      className="fixed left-0 right-0 z-20 px-4 pb-3 pt-4"
      style={{
        bottom: "calc(env(safe-area-inset-bottom, 0px) + 50px)",
        background: "linear-gradient(to top, var(--bg-primary) 75%, transparent)",
      }}
    >
      <div className="max-w-[430px] mx-auto space-y-2.5">
        {currentStatus === "Pending" && (
          <button
            onClick={() => updateStatus("In Progress")}
            disabled={loading}
            className="ios-btn-primary"
            style={{ background: "var(--ios-blue)" }}
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <Play className="w-[18px] h-[18px] fill-white" />
                Start Job
              </>
            )}
          </button>
        )}

        <button
          onClick={handleMarkDone}
          disabled={loading}
          className="ios-btn-success"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <CheckCircle className="w-[22px] h-[22px]" />
              Mark as Done
            </>
          )}
        </button>
      </div>
    </div>
  );
}
