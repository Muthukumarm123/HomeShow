import React, { useRef, useState } from 'react';
import { Film, Printer, Download, CheckCircle2, ShieldCheck, MapPin, Calendar, Clock, Share2, Copy, Check, MessageCircle } from 'lucide-react';
import { Ticket, FamilyBooking, MovieSettings } from '../types.ts';

interface TicketPassProps {
  ticket: Ticket;
  booking: Pick<FamilyBooking, 'full_name' | 'booking_reference' | 'email'>;
  settings: Pick<MovieSettings, 'movie_title' | 'event_name' | 'event_date' | 'event_time' | 'venue'>;
  onClose?: () => void;
}

export const TicketPass: React.FC<TicketPassProps> = ({
  ticket,
  booking,
  settings,
  onClose
}) => {
  const printRef = useRef<HTMLDivElement>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const getTicketUrl = () => {
    if (typeof window === 'undefined') return '';
    const cleanUrl = window.location.href.split('?')[0].split('#')[0];
    return `${cleanUrl}?ticket=${encodeURIComponent(booking.booking_reference)}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = ticket.qr_data_url;
    link.download = `${settings.movie_title.replace(/\s+/g, '_')}_Ticket_${ticket.id}.png`;
    link.click();
  };

  const handleCopyLink = () => {
    const url = getTicketUrl();
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const url = getTicketUrl();
    const text = encodeURIComponent(
      `🎉 Hi ${booking.full_name}! Here is your confirmed ticket & QR pass for ${settings.movie_title || 'Family Movie Night'}:\n\n🎟️ View your ticket: ${url}\n\nDate: ${settings.event_date}\nTime: ${settings.event_time}\nVenue: ${settings.venue}\n\nSee you at the screening!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  return (
    <div className="flex flex-col items-center max-w-xl mx-auto w-full">
      {/* Notice Banner For Organizers */}
      <div className="w-full mb-4 p-3.5 rounded-xl bg-gradient-to-r from-emerald-950/80 to-neutral-900 border border-emerald-600/50 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg print:hidden">
        <div className="flex items-center gap-2.5 text-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Send this pass directly to <strong>{booking.full_name}</strong> via WhatsApp or link:
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleShareWhatsApp}
            className="px-3 py-1.5 rounded bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
          <button
            onClick={handleCopyLink}
            className="px-3 py-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>

      {/* Printable Ticket Container */}
      <div
        ref={printRef}
        className="w-full rounded-2xl bg-[#0A0A0D] border-2 border-amber-600/60 shadow-2xl overflow-hidden relative print:border-black print:text-black print:bg-white"
        style={{
          boxShadow: '0 0 50px -10px rgba(220, 38, 38, 0.35)'
        }}
      >
        {/* Ticket Header Banner */}
        <div className="relative bg-gradient-to-r from-red-950 via-neutral-900 to-amber-950 p-6 border-b border-amber-600/40 text-center">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-amber-400">
              OFFICIAL ENTRY PASS
            </span>
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-2.5 py-0.5 rounded border border-emerald-600/40">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{ticket.ticket_status === 'CHECKED_IN' ? 'CHECKED IN' : 'CONFIRMED'}</span>
            </div>
          </div>

          <h2 className="font-cinematic text-4xl sm:text-5xl font-black tracking-wider text-white">
            {settings.movie_title || 'JAILER 2'}
          </h2>
          <div className="font-cinematic text-xs sm:text-sm tracking-widest text-amber-300 font-semibold mt-1">
            {settings.event_name || 'THE ULTIMATE FAMILY MOVIE NIGHT'}
          </div>
        </div>

        {/* Ticket Stub Notch Dividers */}
        <div className="relative flex items-center justify-between px-6 py-2 bg-[#0E0E12] border-b border-dashed border-amber-800/40">
          <div className="text-[11px] font-mono text-neutral-400">
            TICKET ID: <span className="text-white font-bold">{ticket.id}</span>
          </div>
          <div className="text-[11px] font-mono text-neutral-400">
            REF: <span className="text-amber-400 font-bold">{booking.booking_reference}</span>
          </div>
        </div>

        {/* Ticket Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Guest Name Display */}
          <div className="text-center pb-2 border-b border-neutral-800">
            <div className="text-xs uppercase tracking-widest text-neutral-400 font-semibold mb-1">
              Admit One Guest
            </div>
            <div className="font-cinematic text-2xl sm:text-3xl font-extrabold text-white">
              {booking.full_name}
            </div>
            <div className="text-xs text-neutral-400 mt-0.5 font-mono">
              {booking.email}
            </div>
          </div>

          {/* Event Specs Grid */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-neutral-400">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                <span className="uppercase tracking-wider">Date</span>
              </div>
              <div className="font-semibold text-white pl-5">
                {settings.event_date}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-neutral-400">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span className="uppercase tracking-wider">Showtime</span>
              </div>
              <div className="font-semibold text-white pl-5">
                {settings.event_time}
              </div>
            </div>

            <div className="col-span-2 space-y-1">
              <div className="flex items-center gap-1.5 text-neutral-400">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span className="uppercase tracking-wider">Venue</span>
              </div>
              <div className="font-semibold text-white pl-5">
                {settings.venue}
              </div>
            </div>
          </div>

          {/* QR Code Container */}
          <div className="p-4 rounded-xl bg-white border border-amber-500/50 flex flex-col items-center justify-center max-w-[240px] mx-auto shadow-inner">
            <img
              src={ticket.qr_data_url}
              alt={`QR Code for Ticket ${ticket.id}`}
              className="w-48 h-48 block"
            />
            <div className="text-[10px] font-mono tracking-widest text-neutral-800 text-center font-bold mt-1">
              SCAN AT VENUE ENTRANCE
            </div>
          </div>

          {/* Ticket Security Notice */}
          <div className="text-center text-[11px] text-neutral-400 leading-relaxed">
            <div className="flex items-center justify-center gap-1.5 text-amber-400 font-semibold mb-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Verified Single-Use Entry Code</span>
            </div>
            Present this QR pass to the organiser at the lounge door. Entry will be verified through the official camera scanner.
          </div>
        </div>

        {/* Perforated Footer */}
        <div className="bg-[#070709] px-6 py-3 border-t border-amber-900/40 text-center text-[10px] text-neutral-500 font-mono">
          {settings.movie_title.toUpperCase()} PREMIERE &bull; VERIFIED ENTRY PASS &bull; ID: {ticket.id}
        </div>
      </div>

      {/* Action Buttons (Excluded from print) */}
      <div className="flex flex-wrap items-center justify-center gap-3 mt-6 print:hidden">
        <button
          onClick={handleShareWhatsApp}
          className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Send via WhatsApp</span>
        </button>

        <button
          onClick={handleCopyLink}
          className="px-5 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
        >
          {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
          <span>{copiedLink ? 'Ticket Link Copied!' : 'Copy Ticket Link'}</span>
        </button>

        <button
          onClick={handleDownload}
          className="px-5 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-black text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Save QR Image</span>
        </button>

        <button
          onClick={handlePrint}
          className="px-4 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print</span>
        </button>

        {onClose && (
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close
          </button>
        )}
      </div>
    </div>
  );
};
