import Link from "next/link";
import { Wrench, Shield, CreditCard, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-900 flex flex-col">
      {/* Brand header */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12">
        <div className="w-16 h-16 bg-orange-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-500/30">
          <Wrench className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-white mb-1">ROSCO</h1>
        <p className="text-slate-400 text-base">Handyman Management</p>
      </div>

      {/* Navigation cards */}
      <div className="px-4 pb-10 space-y-3 max-w-lg mx-auto w-full">
        <Link href="/admin" className="block">
          <div className="bg-white/10 active:bg-white/20 border border-white/10 rounded-2xl p-5 flex items-center gap-4 transition-colors">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-blue-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-base">Admin Panel</p>
              <p className="text-slate-400 text-sm">Jobs, invoices, dashboard</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500" />
          </div>
        </Link>

        <Link href="/handyman" className="block">
          <div className="bg-white/10 active:bg-white/20 border border-white/10 rounded-2xl p-5 flex items-center gap-4 transition-colors">
            <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <Wrench className="w-6 h-6 text-orange-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-base">Handyman App</p>
              <p className="text-slate-400 text-sm">Schedule, navigation, status</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500" />
          </div>
        </Link>

        <Link href="/pay/demo" className="block">
          <div className="bg-white/10 active:bg-white/20 border border-white/10 rounded-2xl p-5 flex items-center gap-4 transition-colors">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
              <CreditCard className="w-6 h-6 text-green-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-semibold text-base">Customer Payment</p>
              <p className="text-slate-400 text-sm">View invoice & pay</p>
            </div>
            <ChevronRight className="w-5 h-5 text-slate-500" />
          </div>
        </Link>

        <p className="text-center text-slate-600 text-xs pt-2">MVP v1.0 — No auth yet</p>
      </div>
    </main>
  );
}
