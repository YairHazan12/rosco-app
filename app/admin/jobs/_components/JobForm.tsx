"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { format } from "date-fns";

interface Handyman { id: string; name: string }
interface Job {
  id: string; clientName: string; clientPhone?: string | null;
  clientEmail?: string | null; title: string; description?: string | null;
  date: string | Date; location: string; status: string; handymanId?: string | null;
}

export default function JobForm({ handymen, job }: { handymen: Handyman[]; job?: Job }) {
  const router = useRouter();
  const isEditing = !!job;

  const formatDateForInput = (date: string | Date) =>
    format(new Date(date), "yyyy-MM-dd'T'HH:mm");

  const [formData, setFormData] = useState({
    clientName: job?.clientName || "",
    clientPhone: job?.clientPhone || "",
    clientEmail: job?.clientEmail || "",
    title: job?.title || "",
    description: job?.description || "",
    date: job ? formatDateForInput(job.date) : "",
    location: job?.location || "",
    status: job?.status || "Pending",
    handymanId: job?.handymanId || "",
  });
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(isEditing ? `/api/jobs/${job.id}` : "/api/jobs", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error();
      toast.success(isEditing ? "Job updated!" : "Job created!");
      router.push("/admin/jobs");
      router.refresh();
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!job || !confirm("Delete this job?")) return;
    setLoading(true);
    try {
      await fetch(`/api/jobs/${job.id}`, { method: "DELETE" });
      toast.success("Job deleted");
      router.push("/admin/jobs");
      router.refresh();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const fieldClass = "h-12 text-base";

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-10">
      {/* Client */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Client</p>

        <div className="space-y-1.5">
          <Label htmlFor="clientName" className="text-sm font-medium">Name *</Label>
          <Input id="clientName" required value={formData.clientName} className={fieldClass}
            onChange={e => set("clientName", e.target.value)} placeholder="John Smith" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="clientPhone" className="text-sm font-medium">Phone</Label>
          <Input id="clientPhone" type="tel" value={formData.clientPhone} className={fieldClass}
            onChange={e => set("clientPhone", e.target.value)} placeholder="+972-50-1234567" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="clientEmail" className="text-sm font-medium">Email</Label>
          <Input id="clientEmail" type="email" value={formData.clientEmail} className={fieldClass}
            onChange={e => set("clientEmail", e.target.value)} placeholder="client@email.com" />
        </div>
      </div>

      {/* Job details */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Job Details</p>

        <div className="space-y-1.5">
          <Label htmlFor="title" className="text-sm font-medium">Title *</Label>
          <Input id="title" required value={formData.title} className={fieldClass}
            onChange={e => set("title", e.target.value)} placeholder="Kitchen sink repair" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-sm font-medium">Description</Label>
          <Textarea id="description" value={formData.description} rows={3}
            onChange={e => set("description", e.target.value)}
            placeholder="What needs to be done..." className="text-base resize-none" />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="date" className="text-sm font-medium">Date & Time *</Label>
          <Input id="date" type="datetime-local" required value={formData.date} className={fieldClass}
            onChange={e => set("date", e.target.value)} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="location" className="text-sm font-medium">Address *</Label>
          <Input id="location" required value={formData.location} className={fieldClass}
            onChange={e => set("location", e.target.value)} placeholder="Rothschild Blvd 45, Tel Aviv" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Status</Label>
          <Select value={formData.status} onValueChange={val => set("status", val)}>
            <SelectTrigger className={fieldClass}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-sm font-medium">Handyman</Label>
          <Select
            value={formData.handymanId || "none"}
            onValueChange={val => set("handymanId", val === "none" ? "" : val)}
          >
            <SelectTrigger className={fieldClass}><SelectValue placeholder="Select handyman" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Unassigned</SelectItem>
              {handymen.map(h => (
                <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <Button type="submit" disabled={loading} className="w-full h-14 text-base font-bold rounded-2xl">
          {loading ? "Saving..." : isEditing ? "Update Job" : "Create Job"}
        </Button>
        {isEditing && (
          <Button type="button" variant="outline" onClick={handleDelete} disabled={loading}
            className="w-full h-12 text-red-600 border-red-200 hover:bg-red-50 rounded-2xl">
            Delete Job
          </Button>
        )}
      </div>
    </form>
  );
}
