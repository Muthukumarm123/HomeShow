import React from 'react';
import { Users, Hourglass, CheckCircle2, Ticket, QrCode, AlertTriangle, ArrowRight } from 'lucide-react';
import { SummaryStats } from '../../types.ts';

interface AdminDashboardTabProps {
  stats: SummaryStats | null;
  onNavigate: (tab: string) => void;
}

export const AdminDashboardTab: React.FC<AdminDashboardTabProps> = ({ stats, onNavigate }) => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-cinematic text-2xl sm:text-3xl font-black text-white">
          PREMIERE EVENT OVERVIEW
        </h2>
        <p className="text-xs sm:text-sm text-neutral-400 mt-1">
          Real-time booking pipeline, UNO challenge progress, and screening check-in metrics.
        </p>
      </div>

      {/* 6 Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* Total Bookings */}
        <div
          onClick={() => onNavigate('waiting-list')}
          className="p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/50 transition-all cursor-pointer shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-semibold tracking-wider text-neutral-400">
              Total Booking Requests
            </span>
            <div className="w-8 h-8 rounded bg-neutral-800 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white font-mono tabular-nums">
            {stats?.total ?? 0}
          </div>
          <div className="mt-2 text-xs text-neutral-400 flex items-center gap-1 group-hover:text-amber-400 transition-colors">
            <span>View all waiting list entries</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Waiting for UNO */}
        <div
          onClick={() => onNavigate('uno')}
          className="p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/50 transition-all cursor-pointer shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-semibold tracking-wider text-amber-400">
              Waiting for UNO
            </span>
            <div className="w-8 h-8 rounded bg-amber-950/60 border border-amber-600/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <Hourglass className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400 font-mono tabular-nums">
            {stats?.waiting_uno ?? 0}
          </div>
          <div className="mt-2 text-xs text-neutral-400 flex items-center gap-1 group-hover:text-amber-400 transition-colors">
            <span>Verify game completions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* UNO Challenges Completed */}
        <div
          onClick={() => onNavigate('uno')}
          className="p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-cyan-500/50 transition-all cursor-pointer shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-semibold tracking-wider text-cyan-400">
              UNO Challenges Done
            </span>
            <div className="w-8 h-8 rounded bg-cyan-950/60 border border-cyan-600/40 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-cyan-400 font-mono tabular-nums">
            {stats?.uno_completed ?? 0}
          </div>
          <div className="mt-2 text-xs text-neutral-400 flex items-center gap-1 group-hover:text-cyan-400 transition-colors">
            <span>Both matches completed</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Awaiting Approval */}
        <div
          onClick={() => onNavigate('approve')}
          className="p-5 rounded-xl bg-red-950/30 border border-red-900/60 hover:border-red-600/80 transition-all cursor-pointer shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-semibold tracking-wider text-red-300">
              Awaiting Approval
            </span>
            <div className="w-8 h-8 rounded bg-red-950 flex items-center justify-center text-red-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-red-400 font-mono tabular-nums">
            {stats?.awaiting_approval ?? 0}
          </div>
          <div className="mt-2 text-xs text-red-300 flex items-center gap-1 group-hover:text-amber-300 transition-colors font-semibold">
            <span>Ready for ticket issuance</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Tickets Sent */}
        <div
          onClick={() => onNavigate('tickets')}
          className="p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/50 transition-all cursor-pointer shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-semibold tracking-wider text-emerald-400">
              Tickets Sent
            </span>
            <div className="w-8 h-8 rounded bg-emerald-950/60 border border-emerald-600/40 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-emerald-400 font-mono tabular-nums">
            {stats?.tickets_sent ?? 0}
          </div>
          <div className="mt-2 text-xs text-neutral-400 flex items-center gap-1 group-hover:text-emerald-400 transition-colors">
            <span>View issued tickets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Tickets Checked In */}
        <div
          onClick={() => onNavigate('scan')}
          className="p-5 rounded-xl bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/50 transition-all cursor-pointer shadow-lg group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase font-semibold tracking-wider text-amber-300">
              Tickets Checked In
            </span>
            <div className="w-8 h-8 rounded bg-amber-950/60 border border-amber-600/40 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <QrCode className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-300 font-mono tabular-nums">
            {stats?.checked_in ?? 0}
          </div>
          <div className="mt-2 text-xs text-neutral-400 flex items-center gap-1 group-hover:text-amber-300 transition-colors">
            <span>Launch mobile camera scanner</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Quick Launch Panel */}
      <div className="p-6 rounded-xl bg-gradient-to-r from-red-950/30 via-neutral-900 to-neutral-950 border border-amber-900/40">
        <h3 className="font-cinematic text-lg font-bold text-white mb-2">
          ORGANISER QUICK ACTIONS
        </h3>
        <p className="text-xs text-neutral-400 mb-6">
          Streamlined shortcuts for managing your family screening event.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => onNavigate('scan')}
            className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-amber-500/80 text-left transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded bg-amber-400 text-black flex items-center justify-center mb-2">
              <QrCode className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-white">Open Ticket Scanner</div>
            <div className="text-xs text-neutral-400 mt-1">Scan family passes at the door</div>
          </button>

          <button
            onClick={() => onNavigate('approve')}
            className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-amber-500/80 text-left transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded bg-red-600 text-white flex items-center justify-center mb-2">
              <Ticket className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-white">Approve Pending Tickets</div>
            <div className="text-xs text-neutral-400 mt-1">Issue passes to UNO completers</div>
          </button>

          <button
            onClick={() => onNavigate('settings')}
            className="p-4 rounded-lg bg-neutral-950 border border-neutral-800 hover:border-amber-500/80 text-left transition-colors cursor-pointer"
          >
            <div className="w-8 h-8 rounded bg-neutral-800 text-amber-400 flex items-center justify-center mb-2">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div className="text-sm font-bold text-white">Screening Settings</div>
            <div className="text-xs text-neutral-400 mt-1">Configure date, venue & trailer</div>
          </button>
        </div>
      </div>
    </div>
  );
};
