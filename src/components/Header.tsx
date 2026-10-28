import React, { useState } from 'react';
import { Film, Menu, X, ShieldAlert, Ticket as TicketIcon, Sparkles } from 'lucide-react';

interface HeaderProps {
  movieTitle?: string;
  challengeName?: string;
  onOpenBooking: () => void;
  onOpenLookup: () => void;
  onOpenAdmin: () => void;
  onScrollToSection: (id: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  movieTitle = 'JAILER 2',
  challengeName = 'UNO Challenge',
  onOpenBooking,
  onOpenLookup,
  onOpenAdmin,
  onScrollToSection
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full bg-[#080809]/95 backdrop-blur-md border-b border-amber-900/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="flex items-center gap-2.5 text-left group cursor-pointer shrink-0"
        >
          <div className="w-9 h-9 rounded bg-red-950/80 border border-red-700/60 flex items-center justify-center text-amber-400 group-hover:border-amber-400 transition-colors">
            <Film className="w-5 h-5" />
          </div>
          <span className="font-cinematic text-xl font-black tracking-widest text-white group-hover:text-amber-400 transition-colors whitespace-nowrap">
            {movieTitle}
          </span>
        </button>

        {/* Zone 2: 4-5 Clean Nav Links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-neutral-300">
          <button
            onClick={() => onScrollToSection('trailer')}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Movie Trailer
          </button>
          <button
            onClick={() => onScrollToSection('gallery')}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Gallery
          </button>
          <button
            onClick={() => onScrollToSection('uno-rules')}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {challengeName}
          </button>
          <button
            onClick={onOpenLookup}
            className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <TicketIcon className="w-4 h-4 text-amber-500" />
            Check Ticket
          </button>
          <button
            onClick={onOpenAdmin}
            className="text-neutral-400 hover:text-red-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5"
          >
            <ShieldAlert className="w-4 h-4" />
            Admin Portal
          </button>
        </nav>

        {/* Zone 3: 1 Primary CTA Button & Mobile Toggle */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onOpenBooking}
            className="px-5 py-2.5 text-sm font-bold tracking-wider uppercase text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded transition-all shadow-lg hover:shadow-amber-500/20 active:scale-95 whitespace-nowrap cursor-pointer"
          >
            Book Tickets
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Navigation Menu"
            className="md:hidden p-2 text-neutral-400 hover:text-white rounded focus:outline-none cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0C0C0E] border-b border-neutral-800 px-4 pt-3 pb-6 space-y-3">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onScrollToSection('trailer');
            }}
            className="w-full text-left py-2.5 text-neutral-300 hover:text-amber-400 font-medium text-sm border-b border-neutral-800/80 cursor-pointer"
          >
            Movie Trailer
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onScrollToSection('gallery');
            }}
            className="w-full text-left py-2.5 text-neutral-300 hover:text-amber-400 font-medium text-sm border-b border-neutral-800/80 cursor-pointer"
          >
            Movie Pictures
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onScrollToSection('uno-rules');
            }}
            className="w-full text-left py-2.5 text-neutral-300 hover:text-amber-400 font-medium text-sm border-b border-neutral-800/80 cursor-pointer"
          >
            {challengeName} Details
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenLookup();
            }}
            className="w-full text-left py-2.5 text-amber-400 font-semibold text-sm flex items-center gap-2 border-b border-neutral-800/80 cursor-pointer"
          >
            <TicketIcon className="w-4 h-4" />
            Check My Booking / Ticket
          </button>
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAdmin();
            }}
            className="w-full text-left py-2.5 text-red-400 font-semibold text-sm flex items-center gap-2 cursor-pointer"
          >
            <ShieldAlert className="w-4 h-4" />
            Administrator Sign In
          </button>
        </div>
      )}
    </header>
  );
};
