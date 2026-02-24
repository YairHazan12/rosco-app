"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { getPendingJoinRequests, approveJoinRequest, rejectJoinRequest } from "@/lib/auth-helpers";
import type { JoinRequest } from "@/lib/auth-types";
import { toast } from "sonner";

export default function TeamPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (user?.role !== "admin") {
        router.push("/");
      } else {
        loadRequests();
      }
    }
  }, [user, authLoading, router]);

  const loadRequests = async () => {
    if (!user?.companyId) return;
    
    setLoading(true);
    try {
      const pendingRequests = await getPendingJoinRequests(user.companyId);
      setRequests(pendingRequests);
    } catch (error) {
      console.error("Failed to load requests:", error);
      toast.error("Failed to load join requests");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await approveJoinRequest(requestId);
      toast.success("Request approved!");
      loadRequests(); // Reload requests
    } catch (error) {
      console.error("Failed to approve:", error);
      toast.error("Failed to approve request");
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectJoinRequest(requestId);
      toast.success("Request rejected");
      loadRequests(); // Reload requests
    } catch (error) {
      console.error("Failed to reject:", error);
      toast.error("Failed to reject request");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <button
            onClick={() => router.push("/admin")}
            className="text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Team Management</h1>
          <p className="text-gray-600 mt-2">Manage join requests and team members</p>
        </div>

        {requests.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
            <div className="text-4xl mb-3">✅</div>
            <h3 className="text-lg font-semibold text-gray-900 mb-1">No pending requests</h3>
            <p className="text-gray-600">All caught up! New join requests will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div
                key={request.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {request.handymanName}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">{request.handymanEmail}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Requested {new Date(request.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
