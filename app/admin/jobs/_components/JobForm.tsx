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
import { Loader2 } from "lucide-react";

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-10">
      {/* Client Section */}
      <div>
        <p className="ios-section-header mb-2">Client</p>
        <div className="ios-group px-4 py-4 space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="clientName"
              className="text-[13px] font-medium"
              style={{ color: "var(--label-tertiary)" }}
            >
              Name *
            </Label>
            <Input
              id="clientName"
              required
              value={formData.clientName}
              onChange={e => set("clientName", e.target.value)}
              placeholder="John Smith"
              className="h-11 text-[16px] rounded-xl border"
              style={{
                background: "var(--bg-primary)",
                borderColor: "var(--border)",
                color: "var(--label-primary)",
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="clientPhone"
              className="text-[13px] font-medium"
              style={{ color: "var(--label-tertiary)" }}
            >
              Phone
            </Label>
            <Input
              id="clientPhone"
              type="tel"
              value={formData.clientPhone}
              onChange={e => set("clientPhone", e.target.value)}
              placeholder="+972-50-1234567"
              className="h-11 text-[16px] rounded-xl border"
              style={{
                background: "var(--bg-primary)",
                borderColor: "var(--border)",
                color: "var(--label-primary)",
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="clientEmail"
              className="text-[13px] font-medium"
              style={{ color: "var(--label-tertiary)" }}
            >
              Email
            </Label>
            <Input
              id="clientEmail"
              type="email"
              value={formData.clientEmail}
              onChange={e => set("clientEmail", e.target.value)}
              placeholder="client@email.com"
              className="h-11 text-[16px] rounded-xl border"
              style={{
                background: "var(--bg-primary)",
                borderColor: "var(--border)",
                color: "var(--label-primary)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Job Details Section */}
      <div>
        <p className="ios-section-header mb-2">Job Details</p>
        <div className="ios-group px-4 py-4 space-y-4">
          <div className="space-y-1.5">
            <Label
              htmlFor="title"
              className="text-[13px] font-medium"
              style={{ color: "var(--label-tertiary)" }}
            >
              Title *
            </Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={e => set("title", e.target.value)}
              placeholder="Kitchen sink repair"
              className="h-11 text-[16px] rounded-xl border"
              style={{
                background: "var(--bg-primary)",
                borderColor: "var(--border)",
                color: "var(--label-primary)",
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="description"
              className="text-[13px] font-medium"
              style={{ color: "var(--label-tertiary)" }}
            >
              Description
            </Label>
            <Textarea
              id="description"
              value={formData.description}
              rows={3}
              onChange={e => set("description", e.target.value)}
              placeholder="What needs to be done..."
              className="text-[16px] resize-none rounded-xl border"
              style={{
                background: "var(--bg-primary)",
                borderColor: "var(--border)",
                color: "var(--label-primary)",
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="date"
              className="text-[13px] font-medium"
              style={{ color: "var(--label-tertiary)" }}
            >
              Date & Time *
            </Label>
            <Input
              id="date"
              type="datetime-local"
              required
              value={formData.date}
              onChange={e => set("date", e.target.value)}
              className="h-11 text-[16px] rounded-xl border"
              style={{
                background: "var(--bg-primary)",
                borderColor: "var(--border)",
                color: "var(--label-primary)",
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              htmlFor="location"
              className="text-[13px] font-medium"
              style={{ color: "var(--label-tertiary)" }}
            >
              Address *
            </Label>
            <Input
              id="location"
              required
              value={formData.location}
              onChange={e => set("location", e.target.value)}
              placeholder="Rothschild Blvd 45, Tel Aviv"
              className="h-11 text-[16px] rounded-xl border"
              style={{
                background: "var(--bg-primary)",
                borderColor: "var(--border)",
                color: "var(--label-primary)",
              }}
            />
          </div>

          <div className="space-y-1.5">
            <Label
              className="text-[13px] font-medium"
              style={{ color: "var(--label-tertiary)" }}
            >
              Status
            </Label>
            <Select value={formData.status} onValueChange={val => set("status", val)}>
              <SelectTrigger
                className="h-11 text-[16px] rounded-xl border"
                style={{
                  background: "var(--bg-primary)",
                  borderColor: "var(--border)",
                  color: "var(--label-primary)",
                }}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label
              className="text-[13px] font-medium"
              style={{ color: "var(--label-tertiary)" }}
            >
              Handyman
            </Label>
            <Select
              value={formData.handymanId || "none"}
              onValueChange={val => set("handymanId", val === "none" ? "" : val)}
            >
              <SelectTrigger
                className="h-11 text-[16px] rounded-xl border"
                style={{
                  background: "var(--bg-primary)",
                  borderColor: "var(--border)",
                  color: "var(--label-primary)",
                }}
              >
                <SelectValue placeholder="Select handyman" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Unassigned</SelectItem>
                {handymen.map(h => (
                  <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="space-y-3">
        <button
          type="submit"
          disabled={loading}
          className="ios-btn-brand"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            isEditing ? "Update Job" : "Create Job"
          )}
        </button>

        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={loading}
            className="w-full h-12 rounded-2xl font-semibold text-[16px] border transition-colors"
            style={{
              color: "var(--ios-red)",
              borderColor: "rgba(255,59,48,0.3)",
              background: "transparent",
            }}
          >
            Delete Job
          </button>
        )}
      </div>
    </form>
  );
}
