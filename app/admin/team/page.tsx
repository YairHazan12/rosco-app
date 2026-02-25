"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { getPendingJoinRequests, approveJoinRequest, rejectJoinRequest } from "@/lib/auth-helpers";
import type { JoinRequest } from "@/lib/auth-types";
import type { Handyman } from "@/lib/types";
import { toast } from "sonner";
import { collection, query, where, getDocs } from "firebase/firestore";
import { clientDb } from "@/lib/firebase";

export default function TeamPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [teamMembers, setTeamMembers] = useState<Handyman[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push("/login");
      } else if (user?.role !== "admin") {
        router.push("/");
      } else {
        loadData();
      }
    }
  }, [user, authLoading, router]);

  const loadData = async () => {
    if (!user?.companyId) return;
    
    setLoading(true);
    try {
      // Load join requests
      const pendingRequests = await getPendingJoinRequests(user.companyId);
      setRequests(pendingRequests);
      
      // Load team members (handymen)
      const handymenRef = collection(clientDb, "handymen");
      const q = query(handymenRef, where("companyId", "==", user.companyId));
      const querySnapshot = await getDocs(q);
      
      const handymen: Handyman[] = [];
      querySnapshot.forEach((doc) => {
        handymen.push({
          id: doc.id,
          ...doc.data(),
        } as Handyman);
      });
      
      setTeamMembers(handymen);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast.error("Failed to load team data");
    } finally {
      setLoading(false);
    }
  };

  const loadRequests = async () => {
    if (!user?.companyId) return;
    
    try {
      const pendingRequests = await getPendingJoinRequests(user.companyId);
      setRequests(pendingRequests);
    } catch (error) {
      console.error("Failed to load requests:", error);
      toast.error("Failed to load join requests");
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await approveJoinRequest(requestId);
      toast.success("Request approved!");
      loadData(); // Reload all data
    } catch (error) {
      console.error("Failed to approve:", error);
      toast.error("Failed to approve request");
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectJoinRequest(requestId);
      toast.success("Request rejected");
      loadData(); // Reload all data
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

        {/* Team Members Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Team Members</h2>
          {teamMembers.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
              <div className="text-4xl mb-3">👥</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">No team members yet</h3>
              <p className="text-gray-600">Team members will appear here once they join.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {member.name}
                      </h3>
                      {member.phone && (
                        <p className="text-sm text-gray-600 mt-1">{member.phone}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {member.status || "active"}
                      </span>
                    </div>
                  </div>

                  {/* Specialties */}
                  {member.specialties && member.specialties.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {member.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200"
                          style={{ borderColor: "#0F9C8C20", color: "#0F9C8C", backgroundColor: "#0F9C8C10" }}
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Join Requests Section */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Join Requests</h2>
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
    </div>
  );
}
