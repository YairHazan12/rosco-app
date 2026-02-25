import { getJobs } from "@/lib/db";
import { getCompanyIdFromCookie } from "@/lib/server-auth";

const statusConfig: Record<string, { color: string }> = {
  Pending: { color: "var(--ios-orange)" },
  "In Progress": { color: "var(--ios-blue)" },
  Completed: { color: "var(--ios-green)" },
};

export default async function JobPipeline() {
  const companyId = await getCompanyIdFromCookie();
  const allJobs = await getJobs(companyId);

  const pipeline = {
    Pending: allJobs.filter((j) => j.status === "Pending").length,
    "In Progress": allJobs.filter((j) => j.status === "In Progress").length,
    Completed: allJobs.filter((j) => j.status === "Completed").length,
  };
  const pipelineTotal = allJobs.length;

  if (pipelineTotal === 0) return null;

  return (
    <div className="ios-card p-4">
      <p className="font-semibold text-[15px] mb-3" style={{ color: "var(--label-primary)" }}>
        Job Pipeline
      </p>

      {/* Stacked bar */}
      <div className="flex h-2.5 rounded-full overflow-hidden gap-0.5 mb-3">
        {pipeline.Pending > 0 && (
          <div
            style={{
              width: `${(pipeline.Pending / pipelineTotal) * 100}%`,
              background: "var(--ios-orange)",
              borderRadius: "9999px",
            }}
          />
        )}
        {pipeline["In Progress"] > 0 && (
          <div
            style={{
              width: `${(pipeline["In Progress"] / pipelineTotal) * 100}%`,
              background: "var(--ios-blue)",
              borderRadius: "9999px",
            }}
          />
        )}
        {pipeline.Completed > 0 && (
          <div
            style={{
              width: `${(pipeline.Completed / pipelineTotal) * 100}%`,
              background: "var(--ios-green)",
              borderRadius: "9999px",
            }}
          />
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {(["Pending", "In Progress", "Completed"] as const).map((status) =>
          pipeline[status] > 0 ? (
            <div key={status} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: statusConfig[status].color }}
              />
              <span className="text-[12px] font-medium" style={{ color: "var(--label-secondary)" }}>
                {pipeline[status]} {status}
              </span>
            </div>
          ) : null
        )}
      </div>
    </div>
  );
}
