"use client";

import { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface OffDayRequest {
  id: string;
  handymanId: string;
  handymanName: string;
  date: string;
  reason?: string;
  status: "pending" | "approved" | "rejected";
  requestedAt: string;
  reviewedAt?: string;
}

export default function OffDaysPage() {
  const [requests, setRequests] = useState<OffDayRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending");

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const response = await fetch("/api/off-day-requests?companyId=DEMO");
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setRequests(data);
    } catch (error) {
      console.error("Error loading requests:", error);
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (requestId: string, status: "approved" | "rejected") => {
    try {
      const response = await fetch(`/api/off-day-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status,
          reviewedBy: "admin", // In a real app, use the actual admin user ID
          companyId: "DEMO",
        }),
      });

      if (!response.ok) throw new Error("Failed to update");

      setRequests(prev =>
        prev.map(r =>
          r.id === requestId
            ? { ...r, status, reviewedAt: new Date().toISOString() }
            : r
        )
      );

      toast.success(`Request ${status}`);
    } catch (error) {
      console.error("Error reviewing request:", error);
      toast.error("Failed to update request");
    }
  };

  const filteredRequests = requests.filter(r => {
    if (filter === "all") return true;
    return r.status === filter;
  });

  const pendingCount = requests.filter(r => r.status === "pending").length;
  const approvedCount = requests.filter(r => r.status === "approved").length;
  const rejectedCount = requests.filter(r => r.status === "rejected").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved": return "var(--ios-green)";
      case "rejected": return "var(--ios-red)";
      default: return "var(--ios-orange)";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved": return <CheckCircle className="w-5 h-5" />;
      case "rejected": return <XCircle className="w-5 h-5" />;
      default: return <Clock className="w-5 h-5" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="text-gray-600">Loading requests...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-4">
      {/* Header */}
      <div className="pt-2">
        <h1 className="ios-large-title">Off-Day Requests</h1>
        <p className="text-[13px] mt-1" style={{ color: "var(--label-tertiary)" }}>
          Review and manage handyman time-off requests
        </p>
      </div>

      {/* Filter tabs */}
      <div className="ios-card overflow-hidden">
        <div className="flex divide-x" style={{ borderColor: "var(--separator)" }}>
          {[
            { key: "pending" as const, label: "Pending", count: pendingCount },
            { key: "approved" as const, label: "Approved", count: approvedCount },
            { key: "rejected" as const, label: "Rejected", count: rejectedCount },
            { key: "all" as const, label: "All", count: requests.length },
          ].map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className="flex-1 px-4 py-3 text-center transition-colors"
              style={{
                background: filter === key ? "var(--bg-card-alt)" : "transparent",
                color: filter === key ? "var(--brand)" : "var(--label-primary)",
              }}
            >
              <div className="text-[15px] font-semibold">{label}</div>
              <div className="text-[13px] mt-0.5" style={{ color: "var(--label-tertiary)" }}>
                {count}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Requests list */}
      {filteredRequests.length > 0 ? (
        <div className="space-y-3">
          {filteredRequests.map((request) => (
            <div
              key={request.id}
              className="ios-card p-4"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="w-4 h-4" style={{ color: "var(--label-secondary)" }} />
                    <div className="text-[15px] font-semibold" style={{ color: "var(--label-primary)" }}>
                      {new Date(request.date + "T00:00:00").toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </div>
                  </div>
                  <div className="text-[14px]" style={{ color: "var(--label-secondary)" }}>
                    {request.handymanName}
                  </div>
                  {request.reason && (
                    <div 
                      className="text-[13px] mt-2 p-2 rounded-lg" 
                      style={{ background: "var(--bg-card-alt)", color: "var(--label-primary)" }}
                    >
                      {request.reason}
                    </div>
                  )}
                </div>
                <div 
                  className="flex items-center gap-1.5 text-[13px] font-medium px-3 py-1.5 rounded-full"
                  style={{ 
                    background: `${getStatusColor(request.status)}20`,
                    color: getStatusColor(request.status)
                  }}
                >
                  {getStatusIcon(request.status)}
                  <span className="capitalize">{request.status}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: "var(--separator)" }}>
                <div className="text-[11px]" style={{ color: "var(--label-tertiary)" }}>
                  Requested {new Date(request.requestedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  {request.reviewedAt && (
                    <>
                      {" • "}
                      Reviewed {new Date(request.reviewedAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </>
                  )}
                </div>

                {request.status === "pending" && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleReview(request.id, "rejected")}
                      size="sm"
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      <XCircle className="w-3.5 h-3.5 mr-1" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => handleReview(request.id, "approved")}
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-3.5 h-3.5 mr-1" />
                      Approve
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="ios-card p-12 text-center">
          <Clock 
            className="w-12 h-12 mx-auto mb-3 opacity-30" 
            style={{ color: "var(--label-tertiary)" }} 
          />
          <div className="text-[15px]" style={{ color: "var(--label-secondary)" }}>
            No {filter !== "all" ? filter : ""} requests
          </div>
        </div>
      )}
    </div>
  );
}
