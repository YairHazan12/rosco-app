"use client";

import { Navigation } from "lucide-react";

export default function WazeButton({ address }: { address: string }) {
  const wazeDeep = `waze://?q=${encodeURIComponent(address)}&navigate=yes`;
  const wazeWeb  = `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;

  const handleClick = () => {
    window.location.href = wazeDeep;
    setTimeout(() => { window.location.href = wazeWeb; }, 1000);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full rounded-2xl p-4 transition-opacity active:opacity-75 text-left"
      style={{
        background: "linear-gradient(135deg, #00D4E8, #00B8D4)",
        boxShadow: "0 4px 14px rgba(0,200,215,0.35)",
      }}
    >
      <div className="flex items-center gap-3.5">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: "rgba(255,255,255,0.22)" }}
        >
          <Navigation className="w-[22px] h-[22px] text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-[17px] tracking-tight">
            Navigate with Waze
          </p>
          <p className="text-white/75 text-[13px] truncate mt-0.5">{address}</p>
        </div>
      </div>
    </button>
  );
}
