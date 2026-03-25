"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface FilterRowProps {
  filters: string[];
  activeFilter: string;
  paramName?: string;
}

export default function FilterRow({
  filters,
  activeFilter,
  paramName = "filter",
}: FilterRowProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function setFilter(f: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (f === "all") {
      params.delete(paramName);
    } else {
      params.set(paramName, f);
    }
    router.push(`/admin/billing?${params.toString()}`, { scroll: false });
  }

  return (
    <div
      className="flex gap-2 px-5 overflow-x-auto py-1"
      style={{ scrollbarWidth: "none" }}
    >
      {filters.map((f) => {
        const isActive = f === activeFilter;
        return (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="flex-shrink-0 h-[32px] px-4 rounded-[100px] capitalize transition-all"
            style={{
              fontSize: "13px",
              fontWeight: 500,
              background: isActive ? "#0F1A14" : "#FFFFFF",
              color: isActive ? "#FFFFFF" : "#7A8F82",
              border: isActive ? "none" : "1px solid rgba(0,0,0,0.08)",
            }}
          >
            {f === "all" ? "All" : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        );
      })}
    </div>
  );
}
