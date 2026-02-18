import { getJob } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Phone, Mail, Calendar, Clock } from "lucide-react";
import { format } from "date-fns";
import MarkDoneButton from "./_components/MarkDoneButton";
import WazeButton from "./_components/WazeButton";

export const dynamic = "force-dynamic";

const statusStyles: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-800",
  "In Progress": "bg-blue-100 text-blue-800",
  Completed: "bg-green-100 text-green-800",
};

export default async function HandymanJobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const job = await getJob(id);
  if (!job) notFound();

  const isCompleted = job.status === "Completed";

  return (
    <div className={isCompleted ? "space-y-4 pb-6" : "space-y-4 pb-48"}>
      <div>
        <Link href="/handyman" className="text-sm text-gray-400 active:text-gray-600">← Schedule</Link>
        <div className="flex items-start justify-between mt-2 gap-2">
          <h1 className="text-xl font-bold text-gray-900 flex-1 leading-tight">{job.title}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-semibold flex-shrink-0 ${statusStyles[job.status]}`}>{job.status}</span>
        </div>
        <p className="text-gray-500 mt-1">{job.clientName}</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center">
            <Calendar className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Date</p>
            <p className="text-sm font-bold">{format(new Date(job.date), "MMM d, yyyy")}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <p className="text-xs text-gray-400">Time</p>
            <p className="text-sm font-bold">{format(new Date(job.date), "h:mm a")}</p>
          </div>
        </div>
      </div>

      <WazeButton address={job.location} />

      {job.description && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Notes</p>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{job.description}</p>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Client</p>
        <p className="font-semibold text-gray-900">{job.clientName}</p>
        {job.clientPhone && (
          <a href={`tel:${job.clientPhone}`} className="flex items-center gap-3 bg-green-50 rounded-xl px-4 py-3 active:bg-green-100 transition-colors">
            <Phone className="w-5 h-5 text-green-600" />
            <span className="text-green-700 font-medium">{job.clientPhone}</span>
          </a>
        )}
        {job.clientEmail && (
          <a href={`mailto:${job.clientEmail}`} className="flex items-center gap-3 bg-blue-50 rounded-xl px-4 py-3 active:bg-blue-100 transition-colors">
            <Mail className="w-5 h-5 text-blue-600" />
            <span className="text-blue-700 font-medium text-sm">{job.clientEmail}</span>
          </a>
        )}
      </div>

      {isCompleted && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
          <p className="text-3xl mb-2">✅</p>
          <p className="text-green-700 font-bold text-lg">Job Complete!</p>
          {job.invoiceId && <p className="text-green-600 text-sm mt-1">Invoice created</p>}
        </div>
      )}

      {!isCompleted && <MarkDoneButton jobId={job.id} currentStatus={job.status} />}
    </div>
  );
}
