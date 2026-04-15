"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

type Tab = "quotes" | "invoices";

export default function SegmentControl({ activeTab }: { activeTab: Tab }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function switchTab(tab: Tab) {
    if (tab === activeTab) return;
    startTransition(() => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.push(`/admin/billing?${params.toString()}`);
    });
  }

  return (
    <div
      className="flex p-1 rounded-[100px] mx-5"
      style={{ background: "rgba(60,200,100,0.08)" }}
    >
      {(["quotes", "invoices"] as Tab[]).map((tab) => {
        const isActive = tab === activeTab;
        return (
          <button
            key={tab}
            onClick={() => switchTab(tab)}
            disabled={isPending}
            className="flex-1 py-2 rounded-[100px] font-medium capitalize transition-all duration-200"
            style={{
              fontSize: "14px",
              fontWeight: isActive ? 600 : 400,
              color: isActive ? "#FFFFFF" : "#7A8F82",
              background: isActive ? "#3CC864" : "transparent",
              boxShadow: isActive ? "0 2px 8px rgba(60,200,100,0.25)" : "none",
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        );
      })}
    </div>
  );
}
