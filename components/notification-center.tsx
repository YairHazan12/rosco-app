"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  writeBatch,
} from "firebase/firestore";
import { clientDb } from "@/lib/firebase";
import { useAuth } from "@/lib/auth-context";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

export interface AppNotification {
  id: string;
  userId: string;
  companyId: string;
  type: "job_assigned" | "job_updated" | "job_status" | "invoice_paid" | "team_joined" | "general";
  title: string;
  message: string;
  read: boolean;
  createdAt: string; // ISO string
  metadata?: Record<string, string>;
}

function getNotificationIcon(type: AppNotification["type"]) {
  switch (type) {
    case "job_assigned":  return "📋";
    case "job_updated":   return "✏️";
    case "job_status":    return "🔄";
    case "invoice_paid":  return "💰";
    case "team_joined":   return "👋";
    default:              return "🔔";
  }
}

export default function NotificationCenter() {
  const { user, firebaseUser } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Subscribe to notifications for this user
  useEffect(() => {
    if (!firebaseUser?.uid) return;

    const q = query(
      collection(clientDb, "notifications"),
      where("userId", "==", firebaseUser.uid),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) => {
      setNotifications(
        snap.docs.map((d) => ({ id: d.id, ...d.data() } as AppNotification))
      );
    });

    return unsub;
  }, [firebaseUser?.uid]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function markAsRead(notif: AppNotification) {
    if (notif.read) return;
    await updateDoc(doc(clientDb, "notifications", notif.id), { read: true });
  }

  async function markAllRead() {
    const unread = notifications.filter((n) => !n.read);
    if (!unread.length) return;
    const batch = writeBatch(clientDb);
    unread.forEach((n) => batch.update(doc(clientDb, "notifications", n.id), { read: true }));
    await batch.commit();
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full transition-colors"
        style={{ color: "var(--label-secondary)" }}
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span
            className="absolute top-1.5 right-1.5 flex items-center justify-center text-[10px] font-bold rounded-full min-w-[16px] h-[16px] px-[3px]"
            style={{ background: "var(--ios-red)", color: "#fff" }}
          >
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute right-0 mt-1 w-80 rounded-2xl shadow-xl border overflow-hidden z-50"
          style={{
            background: "var(--bg-card)",
            borderColor: "var(--separator)",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3 border-b"
            style={{ borderColor: "var(--separator)" }}
          >
            <span className="font-semibold text-[15px]" style={{ color: "var(--label-primary)" }}>
              Notifications
            </span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-[13px] font-medium"
                style={{ color: "var(--brand)" }}
              >
                Mark all read
              </button>
            )}
          </div>

          {/* Feed */}
          <div className="max-h-[360px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-10 text-center" style={{ color: "var(--label-tertiary)" }}>
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-[14px]">No notifications yet</p>
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markAsRead(n)}
                  className={cn(
                    "w-full text-left px-4 py-3 flex gap-3 transition-colors border-b last:border-b-0",
                    !n.read && "hover:opacity-90"
                  )}
                  style={{
                    borderColor: "var(--separator)",
                    background: n.read ? "transparent" : "var(--brand-light)",
                  }}
                >
                  {/* Icon */}
                  <span className="text-[20px] mt-0.5 shrink-0">{getNotificationIcon(n.type)}</span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p
                      className="text-[14px] font-medium leading-snug"
                      style={{ color: "var(--label-primary)" }}
                    >
                      {n.title}
                    </p>
                    <p
                      className="text-[13px] mt-0.5 leading-snug"
                      style={{ color: "var(--label-secondary)" }}
                    >
                      {n.message}
                    </p>
                    <p
                      className="text-[12px] mt-1"
                      style={{ color: "var(--label-tertiary)" }}
                    >
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                    </p>
                  </div>

                  {/* Unread dot */}
                  {!n.read && (
                    <span
                      className="w-2 h-2 rounded-full shrink-0 mt-1.5"
                      style={{ background: "var(--brand)" }}
                    />
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
