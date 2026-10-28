import React from 'react';
import { Film, ShieldAlert, Heart } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  onOpenBooking: () => void;
  onOpenLookup: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdmin,
  onOpenBooking,
  onOpenLookup
}) => {
  return (
    <footer className="w-full bg-[#060608] border-t border-neutral-900 py-12 text-xs text-neutral-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-neutral-800/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-red-950/80 border border-red-700/60 flex items-center justify-center text-amber-400">
              <Film className="w-4 h-4" />
            </div>
            <span className="font-cinematic text-lg font-black tracking-widest text-white">
              JAILER <span className="text-amber-400">2</span>
            </span>
            <span className="text-neutral-500 text-xs hidden sm:inline ml-2">
              Private Family Movie Night &bull; UNO Challenge
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 font-medium text-neutral-400">
            <button
              onClick={onOpenBooking}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Request Ticket
            </button>
            <button
              onClick={onOpenLookup}
              className="hover:text-amber-400 transition-colors cursor-pointer"
            >
              Check Booking Status
            </button>
            <button
              onClick={onOpenAdmin}
              className="hover:text-red-400 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Organizer Sign In</span>
            </button>
          </div>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-neutral-500">
          <div>
            &copy; 2026 Jailer 2 Family Premiere. Private invitation-only family gathering.
          </div>
          <div className="flex items-center gap-1">
            <span>Crafted with</span>
            <Heart className="w-3 h-3 text-red-500 fill-red-500" />
            <span>for the Ultimate Family Movie Night</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
