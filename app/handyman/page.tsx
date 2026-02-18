import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format, addDays, startOfDay, isSameDay } from "date-fns";
import { MapPin, Clock, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HandymanSchedulePage() {
  const today = startOfDay(new Date());
  const weekEnd = addDays(today, 7);

  const jobs = await prisma.job.findMany({
    where: {
      date: { gte: today, lte: weekEnd },
      status: { not: "Completed" },
    },
    orderBy: { date: "asc" },
    include: { handyman: true },
  });

  // Group by calendar day using the job's actual date (local timezone safe)
  const grouped: Record<string, typeof jobs> = {};
  for (const job of jobs) {
    const key = format(new Date(job.date), "yyyy-MM-dd");
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(job);
  }

  // Human-friendly label using isSameDay (local timezone aware)
  const dayLabel = (dateKey: string) => {
    // Parse as local noon to avoid midnight UTC ambiguity
    const [y, m, d] = dateKey.split("-").map(Number);
    const date = new Date(y, m - 1, d, 12, 0, 0);
    if (isSameDay(date, today)) return "Today";
    if (isSameDay(date, addDays(today, 1))) return "Tomorrow";
    return format(date, "EEEE, MMMM d");
  };

  const statusColors: Record<string, string> = {
    Pending: "bg-yellow-100 text-yellow-800",
    "In Progress": "bg-blue-100 text-blue-800",
    Completed: "bg-green-100 text-green-800",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Schedule</h1>
        <p className="text-gray-400 text-sm">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
      </div>

      {Object.keys(grouped).length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">🎉</p>
          <p className="text-gray-600 font-semibold text-lg">All clear!</p>
          <p className="text-gray-400 text-sm mt-1">No upcoming jobs for the next 7 days</p>
        </div>
      ) : (
        Object.entries(grouped).map(([dateKey, dayJobs]) => (
          <div key={dateKey}>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
              {dayLabel(dateKey)}
            </h2>
            <div className="space-y-2">
              {dayJobs.map((job) => (
                <Link
                  key={job.id}
                  href={`/handyman/jobs/${job.id}`}
                  className="block"
                >
                  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 active:scale-[0.99] transition-all">
                    {/* Time + status */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                        <Clock className="w-4 h-4 text-orange-400" />
                        {format(new Date(job.date), "h:mm a")}
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColors[job.status] || "bg-gray-100 text-gray-600"}`}>
                        {job.status}
                      </span>
                    </div>

                    {/* Title + client */}
                    <p className="font-bold text-gray-900 text-base leading-snug">{job.title}</p>
                    <p className="text-sm text-gray-500 mt-0.5">{job.clientName}</p>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-400">
                      <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{job.location}</span>
                    </div>

                    {/* Handyman tag + arrow */}
                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                      <span className="text-xs text-gray-400">
                        {job.handyman ? `👤 ${job.handyman.name}` : "Unassigned"}
                      </span>
                      <ChevronRight className="w-4 h-4 text-gray-300" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
