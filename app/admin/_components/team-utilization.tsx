import { getJobs, getHandymen, filterWeekJobs } from "@/lib/db";
import { getCompanyIdFromCookie } from "@/lib/server-auth";
import { Users } from "lucide-react";

export default async function TeamUtilization() {
  const companyId = await getCompanyIdFromCookie();
  const [allJobs, handymen] = await Promise.all([getJobs(companyId), getHandymen(companyId)]);

  const weekJobs = filterWeekJobs(allJobs);

  if (handymen.length === 0 || weekJobs.length === 0) return null;

  const handymanUtil = handymen.map((h) => ({
    ...h,
    weekCount: weekJobs.filter((j) => j.handymanId === h.id).length,
  }));

  const maxJobs = Math.max(...handymanUtil.map((x) => x.weekCount), 1);

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <p className="font-semibold text-[17px]" style={{ color: "var(--label-primary)" }}>
          Team This Week
        </p>
        <div className="flex items-center gap-1">
          <Users className="w-4 h-4" style={{ color: "var(--label-tertiary)" }} />
          <span className="text-[13px]" style={{ color: "var(--label-tertiary)" }}>
            {weekJobs.length} job{weekJobs.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>
      <div className="ios-group">
        {handymanUtil.map((h, i) => {
          const pct = h.weekCount > 0 ? (h.weekCount / maxJobs) * 100 : 0;
          return (
            <div
              key={h.id}
              className="flex items-center gap-3 px-4 py-3.5 min-h-[56px]"
              style={{
                borderBottom:
                  i < handymanUtil.length - 1 ? "0.5px solid var(--separator)" : "none",
              }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-[15px] text-white"
                style={{
                  background: h.weekCount > 0 ? "var(--brand)" : "var(--separator)",
                }}
              >
                {h.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1.5">
                  <p
                    className="font-semibold text-[15px] truncate"
                    style={{ color: "var(--label-primary)" }}
                  >
                    {h.name}
                  </p>
                  <p
                    className="text-[13px] font-semibold flex-shrink-0 ml-2"
                    style={{
                      color: h.weekCount > 0 ? "var(--brand)" : "var(--label-quaternary)",
                    }}
                  >
                    {h.weekCount} job{h.weekCount !== 1 ? "s" : ""}
                  </p>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: "var(--separator)" }}
                >
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      background: h.weekCount > 0 ? "var(--brand)" : "transparent",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
