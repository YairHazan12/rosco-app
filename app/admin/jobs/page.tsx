import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus, ChevronRight, MapPin, Clock, FileText } from "lucide-react";
import { format } from "date-fns";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
};

export default async function JobsPage() {
  const jobs = await prisma.job.findMany({
    orderBy: { date: "desc" },
    include: { handyman: true, invoice: true },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Jobs</h1>
        <Link href="/admin/jobs/new">
          <Button className="gap-2 h-11">
            <Plus className="w-4 h-4" /> New Job
          </Button>
        </Link>
      </div>

      {/* Mobile-first card list */}
      <div className="space-y-2">
        {jobs.map((job) => (
          <Link key={job.id} href={`/admin/jobs/${job.id}`} className="block">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 hover:shadow-md active:scale-[0.99] transition-all">
              {/* Top row: status + date */}
              <div className="flex items-center justify-between mb-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusStyles[job.status] || "bg-gray-100 text-gray-700"}`}>
                  {job.status}
                </span>
                <div className="flex items-center gap-1 text-xs text-gray-400">
                  <Clock className="w-3 h-3" />
                  {format(new Date(job.date), "MMM d · h:mm a")}
                </div>
              </div>

              {/* Job title + client */}
              <p className="font-semibold text-gray-900 text-base leading-tight">{job.title}</p>
              <p className="text-sm text-gray-500 mt-0.5">{job.clientName}</p>

              {/* Location */}
              <div className="flex items-center gap-1 mt-2 text-xs text-gray-400">
                <MapPin className="w-3 h-3 flex-shrink-0" />
                <span className="truncate">{job.location}</span>
              </div>

              {/* Bottom row: handyman + invoice badge + arrow */}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  {job.handyman ? (
                    <span className="text-xs text-gray-500">👤 {job.handyman.name}</span>
                  ) : (
                    <span className="text-xs text-gray-300 italic">Unassigned</span>
                  )}
                  {job.invoice && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      {job.invoice.status}
                    </span>
                  )}
                  {!job.invoice && job.status === "Completed" && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                      No invoice
                    </span>
                  )}
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300" />
              </div>
            </div>
          </Link>
        ))}

        {jobs.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-2">No jobs yet</p>
            <Link href="/admin/jobs/new" className="text-blue-500 hover:underline text-sm">
              + Create your first job
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
