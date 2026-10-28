import React, { useState } from 'react';
import { Search, Filter, Edit2, Check, X, Ticket, AlertCircle, CheckCircle2, Mail, ExternalLink, MessageCircle } from 'lucide-react';
import { FamilyBooking } from '../../types.ts';

interface WaitingListTabProps {
  bookings: FamilyBooking[];
  onToggleUno: (bookingId: string, game1: boolean, game2: boolean) => Promise<void>;
  onUpdateEmail: (bookingId: string, email: string) => Promise<void>;
  onApprove: (bookingId: string) => Promise<void>;
  onReject: (bookingId: string, reason?: string) => Promise<void>;
  onViewTicket: (booking: FamilyBooking) => void;
  actionLoadingId: string | null;
}

export const WaitingListTab: React.FC<WaitingListTabProps> = ({
  bookings,
  onToggleUno,
  onUpdateEmail,
  onApprove,
  onReject,
  onViewTicket,
  actionLoadingId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [editingEmailBookingId, setEditingEmailBookingId] = useState<string | null>(null);
  const [editEmailVal, setEditEmailVal] = useState('');
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.booking_reference.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'ALL' || b.booking_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="text-amber-400 font-mono text-xs">PENDING</span>;
      case 'UNO_IN_PROGRESS':
        return <span className="text-amber-300 font-mono text-xs">UNO IN PROGRESS</span>;
      case 'AWAITING_APPROVAL':
        return <span className="text-cyan-400 font-mono text-xs font-bold">AWAITING APPROVAL</span>;
      case 'APPROVED':
        return <span className="text-emerald-400 font-mono text-xs">APPROVED</span>;
      case 'TICKET_SENT':
        return <span className="text-emerald-300 font-mono text-xs font-bold">TICKET SENT</span>;
      case 'CHECKED_IN':
        return <span className="text-emerald-200 font-mono text-xs font-bold">CHECKED IN</span>;
      case 'REJECTED':
        return <span className="text-red-400 font-mono text-xs">REJECTED</span>;
      default:
        return <span className="font-mono text-xs">{status}</span>;
    }
  };

  const startEditEmail = (b: FamilyBooking) => {
    setEditingEmailBookingId(b.id);
    setEditEmailVal(b.email);
  };

  const saveEditEmail = async (bookingId: string) => {
    if (!editEmailVal.includes('@')) return;
    await onUpdateEmail(bookingId, editEmailVal);
    setEditingEmailBookingId(null);
  };

  const confirmReject = async (bookingId: string) => {
    await onReject(bookingId, rejectReason || 'Declined by organiser');
    setRejectingBookingId(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-cinematic text-2xl font-black text-white">
            ATTENDEE WAITING LIST
          </h2>
          <p className="text-xs text-neutral-400">
            Manage family submissions, verify game challenges, and issue passes.
          </p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, ref, or email..."
              className="pl-9 pr-3 py-1.5 bg-neutral-900 border border-neutral-700 rounded-md text-white text-xs focus:outline-none focus:border-amber-400 w-64"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-neutral-900 border border-neutral-700 rounded-md px-2 py-1.5">
            <Filter className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-neutral-300 text-xs focus:outline-none cursor-pointer"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="UNO_IN_PROGRESS">UNO In Progress</option>
              <option value="AWAITING_APPROVAL">Awaiting Approval</option>
              <option value="TICKET_SENT">Ticket Sent</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-xl border border-neutral-800 bg-neutral-950/80 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-neutral-800 bg-neutral-900/90 text-neutral-400 font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">Booking Ref</th>
                <th className="py-3.5 px-4">Customer Name</th>
                <th className="py-3.5 px-4">Email Address</th>
                <th className="py-3.5 px-4 text-center">Tickets</th>
                <th className="py-3.5 px-4 text-center">UNO Game 1</th>
                <th className="py-3.5 px-4 text-center">UNO Game 2</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Date</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800/60 text-neutral-300">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-neutral-500">
                    No booking requests found matching your query.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const isLoading = actionLoadingId === b.id;
                  const canApprove =
                    b.uno_game_1_completed &&
                    b.uno_game_2_completed &&
                    b.booking_status !== 'APPROVED' &&
                    b.booking_status !== 'TICKET_SENT' &&
                    b.booking_status !== 'CHECKED_IN';
                  const hasTicket =
                    b.booking_status === 'APPROVED' ||
                    b.booking_status === 'TICKET_SENT' ||
                    b.booking_status === 'CHECKED_IN';

                  return (
                    <tr key={b.id} className="hover:bg-neutral-900/50 transition-colors">
                      {/* Booking ID */}
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400 whitespace-nowrap">
                        {b.booking_reference}
                      </td>

                      {/* Name */}
                      <td className="py-3.5 px-4 font-semibold text-white whitespace-nowrap">
                        {b.full_name}
                      </td>

                      {/* Email (with inline editor) */}
                      <td className="py-3.5 px-4">
                        {editingEmailBookingId === b.id ? (
                          <div className="flex items-center gap-1.5">
                            <input
                              type="email"
                              value={editEmailVal}
                              onChange={(e) => setEditEmailVal(e.target.value)}
                              className="px-2 py-1 bg-black border border-amber-400 rounded text-xs text-white"
                            />
                            <button
                              onClick={() => saveEditEmail(b.id)}
                              className="p-1 text-emerald-400 hover:text-white"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingEmailBookingId(null)}
                              className="p-1 text-neutral-400 hover:text-white"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 group">
                            <span className="font-mono text-neutral-400">{b.email}</span>
                            <button
                              onClick={() => startEditEmail(b)}
                              title="Edit email address"
                              className="opacity-0 group-hover:opacity-100 p-1 text-neutral-500 hover:text-amber-400 transition-opacity cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>

                      {/* Ticket Count */}
                      <td className="py-3.5 px-4 text-center font-mono font-semibold">
                        {b.requested_ticket_count}
                      </td>

                      {/* UNO Game 1 */}
                      <td className="py-3.5 px-4 text-center">
                        <label className="inline-flex items-center justify-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={b.uno_game_1_completed}
                            disabled={isLoading || b.booking_status === 'CHECKED_IN'}
                            onChange={(e) =>
                              onToggleUno(b.id, e.target.checked, b.uno_game_2_completed)
                            }
                            className="w-4 h-4 rounded text-amber-500 bg-neutral-900 border-neutral-700 focus:ring-0 cursor-pointer"
                          />
                        </label>
                      </td>

                      {/* UNO Game 2 */}
                      <td className="py-3.5 px-4 text-center">
                        <label className="inline-flex items-center justify-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={b.uno_game_2_completed}
                            disabled={isLoading || b.booking_status === 'CHECKED_IN'}
                            onChange={(e) =>
                              onToggleUno(b.id, b.uno_game_1_completed, e.target.checked)
                            }
                            className="w-4 h-4 rounded text-amber-500 bg-neutral-900 border-neutral-700 focus:ring-0 cursor-pointer"
                          />
                        </label>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {getStatusBadge(b.booking_status)}
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 text-neutral-500 text-[11px] whitespace-nowrap">
                        {new Date(b.created_at).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          {canApprove && (
                            <button
                              onClick={() => onApprove(b.id)}
                              disabled={isLoading}
                              className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded transition-all cursor-pointer shadow"
                            >
                              {isLoading ? 'Issuing...' : 'Approve & Send'}
                            </button>
                          )}

                          {hasTicket && (
                            <>
                              <button
                                onClick={() => {
                                  const cleanUrl = window.location.href.split('?')[0];
                                  const url = `${cleanUrl}?ticket=${encodeURIComponent(b.booking_reference)}`;
                                  const text = encodeURIComponent(
                                    `🎉 Hi ${b.full_name}! Here is your verified movie ticket pass:\n\n🎟️ ${url}\n\nShow this QR pass at the entrance!`
                                  );
                                  window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
                                }}
                                title="Send pass to attendee via WhatsApp"
                                className="px-2 py-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-600/40 rounded transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <MessageCircle className="w-3 h-3 text-emerald-400" />
                                <span className="hidden md:inline">WhatsApp</span>
                              </button>

                              <button
                                onClick={() => onViewTicket(b)}
                                className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-neutral-200 bg-neutral-800 hover:bg-neutral-700 rounded transition-all flex items-center gap-1 cursor-pointer"
                              >
                                <Ticket className="w-3 h-3 text-amber-400" />
                                <span>Pass</span>
                              </button>
                            </>
                          )}

                          {b.booking_status !== 'REJECTED' && b.booking_status !== 'CHECKED_IN' && (
                            <button
                              onClick={() => setRejectingBookingId(b.id)}
                              className="p-1 text-neutral-500 hover:text-red-400 transition-colors cursor-pointer"
                              title="Reject Request"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
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

      {/* Reject Modal */}
      {rejectingBookingId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#121217] border border-red-900 rounded-xl p-6 max-w-sm w-full">
            <h4 className="font-cinematic text-lg font-bold text-white mb-2">
              Decline Booking Request
            </h4>
            <p className="text-xs text-neutral-400 mb-4">
              Are you sure you want to reject this request? You may provide an optional reason.
            </p>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Reason (e.g. Ineligible or Duplicate)"
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-xs text-white mb-4 focus:outline-none focus:border-red-500"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setRejectingBookingId(null)}
                className="px-3 py-1.5 text-xs text-neutral-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => confirmReject(rejectingBookingId)}
                className="px-4 py-1.5 text-xs font-bold text-white bg-red-700 hover:bg-red-600 rounded"
              >
                Decline Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
