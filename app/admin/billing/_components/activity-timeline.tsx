import type { ActivityEvent, ActivityEventType } from "@/lib/billing-types";
import { formatDate } from "@/lib/billing-types";

const EVENT_ICONS: Record<ActivityEventType, string> = {
  created:        "📝",
  sent:           "📤",
  viewed:         "👁",
  accepted:       "✅",
  link_generated: "🔗",
  paid:           "💚",
  edited:         "✏️",
  overdue:        "⚠️",
  converted:      "🔄",
};

interface ActivityTimelineProps {
  events: ActivityEvent[];
}

export default function ActivityTimeline({ events }: ActivityTimelineProps) {
  if (events.length === 0) return null;

  const sorted = [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  return (
    <div className="mx-5 mb-4">
      <p style={{ fontSize: "10px", fontWeight: 600, color: "#7A8F82", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "8px", paddingLeft: "4px" }}>
        Activity
      </p>
      <div
        className="rounded-[16px] overflow-hidden"
        style={{
          background: "#FFFFFF",
          border: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0px 1px 3px rgba(0,0,0,0.06), 0px 4px 12px rgba(0,0,0,0.04)",
        }}
      >
        {sorted.map((event, i) => (
          <div
            key={event.id}
            className="flex items-start gap-3 px-4 py-3.5"
            style={{ borderBottom: i < sorted.length - 1 ? "1px solid rgba(0,0,0,0.06)" : undefined }}
          >
            <span style={{ fontSize: "18px", lineHeight: "1", marginTop: "1px" }}>{EVENT_ICONS[event.type]}</span>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: "14px", color: "#1C2B22", fontWeight: 500 }}>{event.description}</p>
              <p style={{ fontSize: "12px", color: "#7A8F82", marginTop: "2px" }}>
                {formatDate(event.timestamp)}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
