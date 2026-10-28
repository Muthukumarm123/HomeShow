import React, { useState } from 'react';
import { Ticket as TicketIcon, Search, CheckCircle2, Clock, QrCode, Filter, MessageCircle, Copy, Check, Send } from 'lucide-react';
import { Ticket, FamilyBooking } from '../../types.ts';

interface SentTicketsTabProps {
  tickets: { ticket: Ticket; booking: FamilyBooking | null }[];
  onViewTicket: (booking: FamilyBooking, ticket: Ticket) => void;
}

export const SentTicketsTab: React.FC<SentTicketsTabProps> = ({ tickets, onViewTicket }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VALID' | 'CHECKED_IN'>('ALL');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const getTicketUrl = (ref: string) => {
    if (typeof window === 'undefined') return '';
    const cleanUrl = window.location.href.split('?')[0].split('#')[0];
    return `${cleanUrl}?ticket=${encodeURIComponent(ref)}`;
  };

  const handleCopy = (ref: string, ticketId: string) => {
    const url = getTicketUrl(ref);
    navigator.clipboard.writeText(url);
    setCopiedId(ticketId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleWhatsApp = (guestName: string, ref: string) => {
    const url = getTicketUrl(ref);
    const text = encodeURIComponent(
      `🎉 Hi ${guestName}! Here is your verified movie ticket pass:\n\n🎟️ ${url}\n\nShow this QR pass at the entrance!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  const filteredTickets = tickets.filter(({ ticket, booking }) => {
    const matchesSearch =
      ticket.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (booking?.booking_reference || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || ticket.ticket_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-cinematic text-2xl font-black text-white">
            ISSUED MOVIE PASSES
          </h2>
          <p className="text-xs text-neutral-400">
            All confirmed tickets with cryptographic QR codes and check-in audit logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ticket ID or name..."
              className="pl-9 pr-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-md text-white text-xs focus:outline-none focus:border-amber-400 w-60"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700 rounded-md px-2 py-1.5">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="bg-transparent text-neutral-300 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Passes</option>
              <option value="VALID">Valid / Unused</option>
              <option value="CHECKED_IN">Checked In</option>
            </select>
          </div>
        </div>
      </div>

      {/* Organizer Quick Guide Banner */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-neutral-900 to-[#141217] border border-amber-600/30 text-xs text-neutral-300 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-md">
        <div>
          <span className="font-bold text-amber-400 block mb-0.5">
            💡 How do attendees get their ticket and QR code?
          </span>
          <span className="text-neutral-400">
            1. Click <strong>WhatsApp</strong> or <strong>Copy Link</strong> below to send the ticket directly to their phone.
            <br className="hidden sm:inline" />
            2. Or attendees can go to the website on their phone and click <strong>&quot;Look Up Ticket&quot;</strong> with their Booking Ref or Gmail.
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/90 text-neutral-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Ticket ID</th>
                <th className="py-3.5 px-4">Booking Ref</th>
                <th className="py-3.5 px-4">Guest Name</th>
                <th className="py-3.5 px-4">Email</th>
                <th className="py-3.5 px-4">Issued Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Check-in Details</th>
                <th className="py-3.5 px-4 text-right">Send / View Pass</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-neutral-500">
                    No issued tickets found matching your query.
                  </td>
                </tr>
              ) : (
                filteredTickets.map(({ ticket, booking }) => {
                  const isCheckedIn = ticket.ticket_status === 'CHECKED_IN';
                  const isCopied = copiedId === ticket.id;

                  return (
                    <tr key={ticket.id} className="hover:bg-neutral-900/50 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                        {ticket.id}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-300 whitespace-nowrap">
                        {booking?.booking_reference || '—'}
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                        {booking?.full_name || 'Guest'}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-neutral-400">
                        {booking?.email || '—'}
                      </td>
                      <td className="py-3.5 px-4 text-neutral-400 text-[11px] whitespace-nowrap">
                        {new Date(ticket.issued_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {isCheckedIn ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-600/40">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>CHECKED IN</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-600/30">
                            <Clock className="w-3 h-3" />
                            <span>VALID (Awaiting Door)</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-[11px] font-mono text-neutral-400">
                        {isCheckedIn ? (
                          <span>
                            {new Date(ticket.checked_in_at || '').toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}{' '}
                            by {ticket.checked_in_by || 'Admin'}
                          </span>
                        ) : (
                          <span className="text-neutral-600">—</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {booking && (
                            <>
                              <button
                                onClick={() => handleWhatsApp(booking.full_name, booking.booking_reference)}
                                title="Send ticket to attendee via WhatsApp"
                                className="px-2 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">WhatsApp</span>
                              </button>

                              <button
                                onClick={() => handleCopy(booking.booking_reference, ticket.id)}
                                title="Copy attendee ticket link"
                                className="px-2 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                              >
                                {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                <span className="hidden sm:inline">{isCopied ? 'Copied' : 'Link'}</span>
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => booking && onViewTicket(booking, ticket)}
                            title="Open full ticket pass preview"
                            className="px-2.5 py-1 rounded bg-amber-400/20 hover:bg-amber-400/30 text-amber-300 border border-amber-500/30 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            <span>QR Pass</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
