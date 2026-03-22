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
import { Loader2, X, RefreshCw } from "lucide-react";
import CustomerAutocomplete from "./CustomerAutocomplete";

interface Handyman { id: string; name: string }
interface Job {
  id: string; clientName: string; clientPhone?: string | null;
  clientEmail?: string | null; title: string; description?: string | null;
  date: string | Date; location: string; status: string; handymanId?: string | null;
  durationHours?: number | null;
  jobPhotos?: string[] | null;
  isRecurring?: boolean | null;
  recurringSchedule?: {
    frequency: string;
    startDate: string;
    endDate?: string;
  } | null;
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
    durationHours: job?.durationHours?.toString() || "",
    jobPhotos: job?.jobPhotos || [] as string[],
    isRecurring: job?.isRecurring || false,
    recurringFrequency: job?.recurringSchedule?.frequency || "weekly",
    recurringStartDate: job?.recurringSchedule?.startDate
      ? format(new Date(job.recurringSchedule.startDate), "yyyy-MM-dd")
      : "",
    recurringEndDate: job?.recurringSchedule?.endDate
      ? format(new Date(job.recurringSchedule.endDate), "yyyy-MM-dd")
      : "",
  });
  const [photoUrlInput, setPhotoUrlInput] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (field: string, value: string | boolean) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const addPhoto = () => {
    const url = photoUrlInput.trim();
    if (!url) return;
    try {
      new URL(url); // validate URL
      setFormData(prev => ({ ...prev, jobPhotos: [...prev.jobPhotos, url] }));
      setPhotoUrlInput("");
    } catch {
      toast.error("Please enter a valid URL");
    }
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      jobPhotos: prev.jobPhotos.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload: Record<string, unknown> = {
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        clientEmail: formData.clientEmail,
        title: formData.title,
        description: formData.description,
        date: formData.date,
        location: formData.location,
        status: formData.status,
        handymanId: formData.handymanId,
        durationHours: formData.durationHours ? parseFloat(formData.durationHours) : null,
        jobPhotos: formData.jobPhotos.length > 0 ? formData.jobPhotos : [],
        isRecurring: formData.isRecurring,
      };

      if (formData.isRecurring && formData.recurringStartDate) {
        payload.recurringSchedule = {
          frequency: formData.recurringFrequency,
          startDate: new Date(formData.recurringStartDate).toISOString(),
          endDate: formData.recurringEndDate
            ? new Date(formData.recurringEndDate).toISOString()
            : undefined,
        };
      }

      const res = await fetch(isEditing ? `/api/jobs/${job.id}` : "/api/jobs", {
        method: isEditing ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
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

  const handleCustomerSelect = (customer: { name: string; phone: string; email: string } | null) => {
    if (customer) {
      setFormData(prev => ({
        ...prev,
        clientName: customer.name,
        clientPhone: customer.phone,
        clientEmail: customer.email,
      }));
    }
  };

  const inputStyle = {
    background: "var(--bg-primary)",
    borderColor: "var(--border)",
    color: "var(--label-primary)",
  };
  const labelStyle = { color: "var(--label-tertiary)" };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-10">
      {/* Client Section */}
      <div>
        <p className="ios-section-header mb-2">Client</p>
        <div className="ios-group px-4 py-4 space-y-4">
          <CustomerAutocomplete
            onSelect={handleCustomerSelect}
            initialName={formData.clientName}
            initialPhone={formData.clientPhone}
            initialEmail={formData.clientEmail}
          />

          <div className="space-y-1.5">
            <Label htmlFor="clientPhone" className="text-[13px] font-medium" style={labelStyle}>Phone</Label>
            <Input
              id="clientPhone" type="tel" value={formData.clientPhone}
              onChange={e => set("clientPhone", e.target.value)}
              placeholder="+972-50-123-4567"
              className="h-11 text-[16px] rounded-xl border" style={inputStyle}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="clientEmail" className="text-[13px] font-medium" style={labelStyle}>Email</Label>
            <Input
              id="clientEmail" type="email" value={formData.clientEmail}
              onChange={e => set("clientEmail", e.target.value)}
              placeholder="client@email.com"
              className="h-11 text-[16px] rounded-xl border" style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* Job Details Section */}
      <div>
        <p className="ios-section-header mb-2">Job Details</p>
        <div className="ios-group px-4 py-4 space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title" className="text-[13px] font-medium" style={labelStyle}>Title *</Label>
            <Input
              id="title" required value={formData.title}
              onChange={e => set("title", e.target.value)}
              placeholder="Kitchen sink repair"
              className="h-11 text-[16px] rounded-xl border" style={inputStyle}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-[13px] font-medium" style={labelStyle}>Description</Label>
            <Textarea
              id="description" value={formData.description} rows={3}
              onChange={e => set("description", e.target.value)}
              placeholder="What needs to be done..."
              className="text-[16px] resize-none rounded-xl border" style={inputStyle}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date" className="text-[13px] font-medium" style={labelStyle}>Date & Time *</Label>
            <Input
              id="date" type="datetime-local" required value={formData.date}
              onChange={e => set("date", e.target.value)}
              className="h-11 text-[16px] rounded-xl border" style={inputStyle}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="durationHours" className="text-[13px] font-medium" style={labelStyle}>Duration (hours)</Label>
            <Input
              id="durationHours" type="number" min="0.5" max="24" step="0.5"
              value={formData.durationHours}
              onChange={e => set("durationHours", e.target.value)}
              placeholder="e.g. 2.5"
              className="h-11 text-[16px] rounded-xl border" style={inputStyle}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="location" className="text-[13px] font-medium" style={labelStyle}>Address *</Label>
            <Input
              id="location" required value={formData.location}
              onChange={e => set("location", e.target.value)}
              placeholder="Long Street 45, Cape Town"
              className="h-11 text-[16px] rounded-xl border" style={inputStyle}
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-[13px] font-medium" style={labelStyle}>Status</Label>
            <Select value={formData.status} onValueChange={val => set("status", val)}>
              <SelectTrigger className="h-11 text-[16px] rounded-xl border" style={inputStyle}>
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
            <Label className="text-[13px] font-medium" style={labelStyle}>Handyman</Label>
            <Select
              value={formData.handymanId || "none"}
              onValueChange={val => set("handymanId", val === "none" ? "" : val)}
            >
              <SelectTrigger className="h-11 text-[16px] rounded-xl border" style={inputStyle}>
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

      {/* Photos Section */}
      <div>
        <p className="ios-section-header mb-2">Photos</p>
        <div className="ios-group px-4 py-4 space-y-3">
          <p className="text-[13px]" style={{ color: "var(--label-tertiary)" }}>
            Add photo URLs for this job (before/after photos, etc.)
          </p>
          <div className="flex gap-2">
            <Input
              value={photoUrlInput}
              onChange={e => setPhotoUrlInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addPhoto(); } }}
              placeholder="https://example.com/photo.jpg"
              className="h-11 text-[16px] rounded-xl border flex-1" style={inputStyle}
            />
            <button
              type="button"
              onClick={addPhoto}
              className="h-11 px-4 rounded-xl font-semibold text-[15px] border"
              style={{ background: "var(--brand)", color: "white", border: "none" }}
            >
              Add
            </button>
          </div>
          {formData.jobPhotos.length > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {formData.jobPhotos.map((url, i) => (
                  <div key={i} className="relative group">
                    <img
                      src={url}
                      alt={`Job photo ${i + 1}`}
                      className="w-20 h-20 object-cover rounded-xl border"
                      style={{ borderColor: "var(--border)" }}
                      onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: "var(--ios-red)", color: "white" }}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recurring Section */}
      <div>
        <p className="ios-section-header mb-2">Recurring</p>
        <div className="ios-group px-4 py-4 space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <div
              className="relative w-[51px] h-[31px] rounded-full transition-colors duration-200 flex-shrink-0"
              style={{ background: formData.isRecurring ? "var(--ios-green, #34C759)" : "rgba(120,120,128,0.32)" }}
              onClick={() => set("isRecurring", !formData.isRecurring)}
            >
              <div
                className="absolute top-[2px] w-[27px] h-[27px] bg-white rounded-full shadow transition-transform duration-200"
                style={{ transform: formData.isRecurring ? "translateX(22px)" : "translateX(2px)" }}
              />
            </div>
            <div>
              <p className="font-semibold text-[15px]" style={{ color: "var(--label-primary)" }}>
                Recurring Job
              </p>
              <p className="text-[13px]" style={{ color: "var(--label-tertiary)" }}>
                Auto-generate repeated jobs on a schedule
              </p>
            </div>
          </label>

          {formData.isRecurring && (
            <div className="space-y-3 pt-2 border-t" style={{ borderColor: "var(--border)" }}>
              <div className="space-y-1.5">
                <Label className="text-[13px] font-medium" style={labelStyle}>Frequency</Label>
                <Select
                  value={formData.recurringFrequency}
                  onValueChange={val => set("recurringFrequency", val)}
                >
                  <SelectTrigger className="h-11 text-[16px] rounded-xl border" style={inputStyle}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="recurringStartDate" className="text-[13px] font-medium" style={labelStyle}>
                  Start Date *
                </Label>
                <Input
                  id="recurringStartDate" type="date"
                  value={formData.recurringStartDate}
                  onChange={e => set("recurringStartDate", e.target.value)}
                  required={formData.isRecurring}
                  className="h-11 text-[16px] rounded-xl border" style={inputStyle}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="recurringEndDate" className="text-[13px] font-medium" style={labelStyle}>
                  End Date (optional)
                </Label>
                <Input
                  id="recurringEndDate" type="date"
                  value={formData.recurringEndDate}
                  onChange={e => set("recurringEndDate", e.target.value)}
                  className="h-11 text-[16px] rounded-xl border" style={inputStyle}
                />
              </div>

              <div
                className="rounded-xl p-3 text-[13px]"
                style={{ background: "rgba(0,122,255,0.08)", color: "var(--ios-blue, #007AFF)" }}
              >
                <div className="flex items-start gap-2">
                  <RefreshCw className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>
                    A series of jobs will be auto-generated from the start date at the selected frequency
                    {formData.recurringEndDate ? " until the end date" : " (up to 52 occurrences)"}.
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="space-y-3">
        <button type="submit" disabled={loading} className="ios-btn-brand">
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
