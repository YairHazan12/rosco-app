"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { getPendingJoinRequests, approveJoinRequest, rejectJoinRequest } from "@/lib/auth-helpers";
import type { JoinRequest } from "@/lib/auth-types";
import type { Handyman } from "@/lib/types";
import { toast } from "sonner";
import { collection, query, where, getDocs, doc, updateDoc, getDoc } from "firebase/firestore";
import { clientDb } from "@/lib/firebase";
import { 
  Users, 
  Copy, 
  Check, 
  UserMinus, 
  UserCheck, 
  UserX,
  Share2,
  AlertCircle 
} from "lucide-react";
import { HandymanDetailsModal } from "@/app/admin/_components/handyman-details-modal";

export default function TeamPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [teamMembers, setTeamMembers] = useState<Handyman[]>([]);
  const [loading, setLoading] = useState(true);
  const [teamCode, setTeamCode] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [dismissedRequests, setDismissedRequests] = useState<Set<string>>(new Set());
  const [dismissedMembers, setDismissedMembers] = useState<Set<string>>(new Set());
  const [selectedHandyman, setSelectedHandyman] = useState<Handyman | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

      // Load company code from company document
      const companyRef = doc(clientDb, "companies", user.companyId);
      const companySnap = await getDoc(companyRef);
      if (companySnap.exists()) {
        const companyData = companySnap.data() as { companyCode?: string };
        if (companyData.companyCode) {
          setTeamCode(companyData.companyCode);
        }
      }
      
      // Load team members (handymen)
      const handymenRef = collection(clientDb, "handymen");
      const q = query(
        handymenRef, 
        where("companyId", "==", user.companyId),
        where("status", "==", "active")
      );
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

  const handleCopyCode = async () => {
    if (!teamCode) {
      toast.error("Team code not available");
      return;
    }

    try {
      await navigator.clipboard.writeText(teamCode);
      setCopied(true);
      toast.success("Team code copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy code");
    }
  };

  const handleShareLink = async () => {
    if (!teamCode) {
      toast.error("Team code not available");
      return;
    }

    const inviteUrl = `${window.location.origin}/join/${teamCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Our Team on ROSCO",
          text: "Join our team on ROSCO! 🔧 Tap this link to get started:",
          url: inviteUrl,
        });
      } catch (error) {
        // User cancelled or error - fallback to copy link
        try {
          await navigator.clipboard.writeText(inviteUrl);
          setCopied(true);
          toast.success("Invite link copied!");
          setTimeout(() => setCopied(false), 2000);
        } catch {
          toast.error("Failed to copy link");
        }
      }
    } else {
      try {
        await navigator.clipboard.writeText(inviteUrl);
        setCopied(true);
        toast.success("Invite link copied!");
        setTimeout(() => setCopied(false), 2000);
      } catch {
        toast.error("Failed to copy link");
      }
    }
  };

  const handleViewHandyman = (handyman: Handyman) => {
    setSelectedHandyman(handyman);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedHandyman(null);
  };

  const handleRemoveMember = async (memberId: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the team? They will need to rejoin to access jobs.`)) {
      return;
    }

    // Optimistic: animate out immediately
    setRemovingId(memberId);
    setDismissedMembers(prev => new Set(prev).add(memberId));

    try {
      const handymanRef = doc(clientDb, "handymen", memberId);
      await updateDoc(handymanRef, {
        status: "inactive",
        updatedAt: new Date().toISOString(),
      });
      
      // After animation, remove from state
      setTimeout(() => {
        setTeamMembers(prev => prev.filter(m => m.id !== memberId));
        setDismissedMembers(prev => {
          const next = new Set(prev);
          next.delete(memberId);
          return next;
        });
      }, 400);
      
      toast.success(`${memberName} removed from team`);
    } catch (error) {
      console.error("Failed to remove member:", error);
      toast.error("Failed to remove team member");
      // Revert optimistic update
      setDismissedMembers(prev => {
        const next = new Set(prev);
        next.delete(memberId);
        return next;
      });
    } finally {
      setRemovingId(null);
    }
  };

  const handleApprove = async (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    
    // Optimistic: animate out immediately
    setDismissedRequests(prev => new Set(prev).add(requestId));

    try {
      await approveJoinRequest(requestId);
      
      // Revalidate server cache so new jobs will see the handyman
      if (user?.companyId) {
        await fetch('/api/revalidate-handymen', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ companyId: user.companyId }),
        });
      }
      
      // After animation, remove from state and reload team members
      setTimeout(async () => {
        setRequests(prev => prev.filter(r => r.id !== requestId));
        setDismissedRequests(prev => {
          const next = new Set(prev);
          next.delete(requestId);
          return next;
        });
        
        // Reload team members to show the new member
        if (user?.companyId) {
          const handymenRef = collection(clientDb, "handymen");
          const q = query(
            handymenRef, 
            where("companyId", "==", user.companyId),
            where("status", "==", "active")
          );
          const querySnapshot = await getDocs(q);
          const handymen: Handyman[] = [];
          querySnapshot.forEach((d) => {
            handymen.push({ id: d.id, ...d.data() } as Handyman);
          });
          setTeamMembers(handymen);
        }
      }, 400);
      
      toast.success(`${request?.handymanName || "User"} added to team! 🎉`);
    } catch (error) {
      console.error("Failed to approve:", error);
      toast.error("Failed to approve request");
      // Revert optimistic update
      setDismissedRequests(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  const handleReject = async (requestId: string) => {
    const request = requests.find(r => r.id === requestId);
    
    // Optimistic: animate out immediately
    setDismissedRequests(prev => new Set(prev).add(requestId));

    try {
      await rejectJoinRequest(requestId);
      
      // After animation, remove from state
      setTimeout(() => {
        setRequests(prev => prev.filter(r => r.id !== requestId));
        setDismissedRequests(prev => {
          const next = new Set(prev);
          next.delete(requestId);
          return next;
        });
      }, 400);
      
      toast.success(`${request?.handymanName || "User"} request rejected`);
    } catch (error) {
      console.error("Failed to reject:", error);
      toast.error("Failed to reject request");
      // Revert optimistic update
      setDismissedRequests(prev => {
        const next = new Set(prev);
        next.delete(requestId);
        return next;
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div style={{ color: "var(--label-secondary)" }}>Loading...</div>
      </div>
    );
  }

  if (!user || user?.role !== "admin") {
    return null;
  }

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────── */}
      <div>
        <h1 className="ios-large-title">Team</h1>
        <p className="text-[15px] mt-1" style={{ color: "var(--label-secondary)" }}>
          Manage your team and join requests
        </p>
      </div>

      {/* ── Team Code Card ─────────────────────────── */}
      <div
        className="rounded-[16px] overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #3CC864 0%, #1A7A32 100%)",
          boxShadow: "0px 8px 32px rgba(60, 200, 100, 0.30)",
        }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center gap-3 mb-5">
            <div
              className="w-10 h-10 rounded-[10px] flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.20)" }}
            >
              <Users className="w-5 h-5 text-white" strokeWidth={1.75} />
            </div>
            <div>
              <p className="text-white font-semibold text-[17px] leading-tight">Team Code</p>
              <p className="text-[13px] mt-0.5" style={{ color: "rgba(255,255,255,0.70)" }}>
                Share with handymen to join your team
              </p>
            </div>
          </div>

          {/* Code Block */}
          <div
            className="rounded-[12px] px-5 py-4 mb-5 text-center"
            style={{ background: "rgba(0,0,0,0.12)" }}
          >
            <p
              className="text-[11px] font-semibold uppercase mb-2"
              style={{ color: "rgba(255,255,255,0.60)", letterSpacing: "0.08em" }}
            >
              Your Code
            </p>
            <p
              style={{
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
                fontSize: "22px",
                fontWeight: 700,
                color: "#FFFFFF",
                letterSpacing: "0.12em",
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {teamCode ?? "—"}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleCopyCode}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-[12px] font-semibold text-[15px] text-white transition-all active:scale-[0.97] active:opacity-90"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" strokeWidth={2.25} />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" strokeWidth={1.75} />
                  Copy
                </>
              )}
            </button>
            <button
              onClick={handleShareLink}
              className="flex items-center justify-center gap-2 px-4 py-3 rounded-[12px] font-semibold text-[15px] text-white transition-all active:scale-[0.97] active:opacity-90"
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
              }}
            >
              <Share2 className="w-4 h-4" strokeWidth={1.75} />
              Share Link
            </button>
          </div>
        </div>
      </div>

      {/* ── Team Members Section ───────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="ios-section-header">Team Members</h2>
          <span 
            className="text-[13px] font-semibold px-2.5 py-1 rounded-full"
            style={{ 
              background: "var(--brand-light)",
              color: "var(--brand)"
            }}
          >
            {teamMembers.length}
          </span>
        </div>

        {teamMembers.length === 0 ? (
          <div className="ios-card text-center py-12">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                 style={{ background: "var(--bg-grouped)" }}>
              <Users className="w-8 h-8" style={{ color: "var(--label-tertiary)" }} />
            </div>
            <h3 className="ios-headline mb-2">No team members yet</h3>
            <p className="text-[15px]" style={{ color: "var(--label-secondary)" }}>
              Share your team code to invite handymen
            </p>
          </div>
        ) : (
          <div className="ios-card divide-y" style={{ borderColor: "var(--separator)" }}>
            {teamMembers.map((member, index) => (
              <div
                key={member.id}
                className="p-4 hover:bg-opacity-50"
                style={{ 
                  background: index % 2 === 0 ? "transparent" : "var(--bg-grouped)",
                  opacity: dismissedMembers.has(member.id) ? 0 : 1,
                  maxHeight: dismissedMembers.has(member.id) ? "0px" : "200px",
                  overflow: "hidden",
                  padding: dismissedMembers.has(member.id) ? "0 16px" : undefined,
                  transition: "opacity 0.3s ease, max-height 0.4s ease, padding 0.4s ease",
                }}
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Clickable Content Area */}
                  <button
                    onClick={() => handleViewHandyman(member)}
                    className="flex-1 min-w-0 text-left transition-opacity hover:opacity-80 active:opacity-60 cursor-pointer"
                  >
                    {/* Name & Status */}
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="ios-headline truncate">
                        {member.name}
                      </h3>
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold"
                        style={{
                          background: "var(--green-light)",
                          color: "var(--green)"
                        }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: "var(--green)" }} />
                        Active
                      </span>
                    </div>

                    {/* Email */}
                    {member.email && (
                      <p className="text-[13px] truncate" style={{ color: "var(--label-secondary)" }}>
                        {member.email}
                      </p>
                    )}

                    {/* Phone */}
                    {member.phone && (
                      <p className="text-[14px] font-medium mt-1" style={{ color: "var(--label)" }}>
                        📞 {member.phone}
                      </p>
                    )}

                    {/* Specialties */}
                    {member.specialties && member.specialties.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {member.specialties.map((specialty, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center px-2.5 py-1 rounded-lg text-[12px] font-medium"
                            style={{
                              background: "var(--brand-light)",
                              color: "var(--brand)",
                              border: "1px solid var(--brand)"
                            }}
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>

                  {/* Remove Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveMember(member.id, member.name);
                    }}
                    disabled={removingId === member.id}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[13px] font-semibold transition-all active:scale-95"
                    style={{
                      background: "var(--red-light)",
                      color: "var(--red)",
                      border: "1px solid var(--red)",
                      opacity: removingId === member.id ? 0.5 : 1
                    }}
                  >
                    <UserMinus className="w-4 h-4" strokeWidth={2.5} />
                    {removingId === member.id ? "..." : "Remove"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Pending Join Requests ──────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="ios-section-header">Join Requests</h2>
          {requests.length > 0 && (
            <span 
              className="text-[13px] font-semibold px-2.5 py-1 rounded-full"
              style={{ 
                background: "var(--amber-light)",
                color: "#B45309"
              }}
            >
              {requests.length}
            </span>
          )}
        </div>

        {requests.length === 0 ? (
          <div className="ios-card text-center py-12">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                 style={{ background: "var(--green-light)" }}>
              <UserCheck className="w-8 h-8" style={{ color: "var(--green)" }} />
            </div>
            <h3 className="ios-headline mb-2">All caught up!</h3>
            <p className="text-[15px]" style={{ color: "var(--label-secondary)" }}>
              No pending join requests at the moment
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="ios-card"
                style={{
                  borderLeftWidth: "4px",
                  borderLeftColor: "var(--amber)",
                  opacity: dismissedRequests.has(request.id) ? 0 : 1,
                  maxHeight: dismissedRequests.has(request.id) ? "0px" : "300px",
                  overflow: "hidden",
                  marginBottom: dismissedRequests.has(request.id) ? "0px" : undefined,
                  padding: dismissedRequests.has(request.id) ? "0" : undefined,
                  transition: "opacity 0.3s ease, max-height 0.4s ease, margin 0.4s ease, padding 0.4s ease",
                }}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: "var(--amber-light)" }}
                        >
                          <AlertCircle className="w-5 h-5" style={{ color: "#B45309" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="ios-headline truncate">
                            {request.handymanName}
                          </h3>
                          <p className="text-[13px] truncate" style={{ color: "var(--label-secondary)" }}>
                            {request.handymanEmail}
                          </p>
                        </div>
                      </div>
                      <p className="text-[12px] mt-2" style={{ color: "var(--label-tertiary)" }}>
                        Requested {new Date(request.createdAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric"
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleApprove(request.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[14px] transition-all active:scale-[0.97]"
                      style={{
                        background: "var(--green)",
                        color: "white",
                        boxShadow: "0 2px 8px rgba(16, 185, 129, 0.25)"
                      }}
                    >
                      <UserCheck className="w-4 h-4" strokeWidth={2.5} />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-[14px] transition-all active:scale-[0.97]"
                      style={{
                        background: "white",
                        color: "var(--red)",
                        border: "1.5px solid var(--red)",
                        boxShadow: "0 1px 3px rgba(239, 68, 68, 0.1)"
                      }}
                    >
                      <UserX className="w-4 h-4" strokeWidth={2.5} />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Handyman Details Modal */}
      <HandymanDetailsModal 
        handyman={selectedHandyman}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  );
}
