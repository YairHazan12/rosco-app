import { formatZAR } from "@/lib/billing-types";

interface StatsStripProps {
  total: number;
  outstanding: number;
  collected: number;
}

export default function StatsStrip({ total, outstanding, collected }: StatsStripProps) {
  const stats = [
    { label: "Documents", value: String(total), color: "#1C2B22" },
    { label: "Collected", value: formatZAR(collected), color: "#3CC864" },
    { label: "Outstanding", value: formatZAR(outstanding), color: "#F07028" },
  ];

  return (
    <div className="flex gap-3 px-5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
      {stats.map((s) => (
        <div
          key={s.label}
          className="flex-shrink-0 rounded-[12px] px-4 py-2.5"
          style={{
            background: "#FFFFFF",
            boxShadow: "0px 1px 3px rgba(0,0,0,0.06), 0px 4px 12px rgba(0,0,0,0.04)",
            border: "1px solid rgba(0,0,0,0.06)",
            minWidth: "120px",
          }}
        >
          <p style={{ fontSize: "11px", fontWeight: 500, color: "#7A8F82", marginBottom: "2px" }}>
            {s.label}
          </p>
          <p
            className="stat-number"
            style={{ fontSize: "18px", fontWeight: 700, color: s.color }}
          >
            {s.value}
          </p>
        </div>
      ))}
    </div>
  );
}
