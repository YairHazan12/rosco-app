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

  // bottom-16 = 64px = height of the handyman bottom nav
  return (
    <div className="fixed bottom-16 left-0 right-0 z-10 px-4 pb-3 pt-2 bg-gradient-to-t from-gray-50 via-gray-50/90 to-transparent">
      <div className="max-w-lg mx-auto space-y-2">
        {currentStatus === "Pending" && (
          <button
            onClick={() => updateStatus("In Progress")}
            disabled={loading}
            className="w-full bg-blue-500 active:bg-blue-600 disabled:opacity-60 text-white font-semibold py-3.5 rounded-2xl transition-colors flex items-center justify-center gap-2 text-base shadow-md"
          >
            {loading
              ? <Loader2 className="w-5 h-5 animate-spin" />
              : <><Play className="w-4 h-4 fill-white" /> Start Job</>
            }
          </button>
        )}

        <button
          onClick={handleMarkDone}
          disabled={loading}
          className="w-full bg-green-500 active:bg-green-600 disabled:opacity-60 text-white font-bold py-4 rounded-2xl transition-colors flex items-center justify-center gap-2 text-lg shadow-lg shadow-green-500/30"
        >
          {loading
            ? <Loader2 className="w-5 h-5 animate-spin" />
            : <><CheckCircle className="w-6 h-6" /> Mark as Done</>
          }
        </button>
      </div>
    </div>
  );
}
