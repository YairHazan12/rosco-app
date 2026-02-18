"use client";

import { Navigation } from "lucide-react";

export default function WazeButton({ address }: { address: string }) {
  const wazeDeep = `waze://?q=${encodeURIComponent(address)}&navigate=yes`;
  const wazeWeb  = `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;

  const handleClick = () => {
    // Try deep link; fall back to web after 1 s if app not installed
    window.location.href = wazeDeep;
    setTimeout(() => {
      window.location.href = wazeWeb;
    }, 1000);
  };

  return (
    <button
      onClick={handleClick}
      className="w-full bg-[#00D4E8] active:bg-[#00bdd0] rounded-2xl p-5 transition-colors text-left"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
          <Navigation className="w-7 h-7 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-bold text-base">Navigate with Waze</p>
          <p className="text-white/80 text-sm truncate mt-0.5">{address}</p>
        </div>
      </div>
    </button>
  );
}
