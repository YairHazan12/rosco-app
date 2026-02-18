import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { format } from "date-fns";
import { MapPin, Clock, ChevronRight } from "lucide-react";

export const dynamic = "force-dynamic";

const statusColors: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
};

export default async function AllJobsPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { date: "desc" },
    include: { handyman: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">All Jobs</h1>

      <div className="space-y-2">
        {jobs.map((job) => (
          <Link key={job.id} href={`/handyman/jobs/${job.id}`} className="block">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 active:scale-[0.99] transition-all">
              {/* Time + status */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
                  <Clock className="w-4 h-4 text-orange-400" />
                  {format(new Date(job.date), "MMM d · h:mm a")}
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

              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <span className="text-xs text-gray-400">
                  {job.handyman ? `👤 ${job.handyman.name}` : "Unassigned"}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </div>
          </Link>
        ))}

        {jobs.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg">No jobs yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
