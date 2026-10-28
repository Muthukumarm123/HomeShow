import React, { useState } from 'react';
import { Ticket, CheckCircle2, XCircle, Mail, AlertTriangle, ShieldCheck, ExternalLink, Send } from 'lucide-react';
import { FamilyBooking } from '../../types.ts';

interface ApproveBookingsTabProps {
  bookings: FamilyBooking[];
  onApprove: (bookingId: string) => Promise<void>;
  onReject: (bookingId: string, reason?: string) => Promise<void>;
  onViewTicket: (booking: FamilyBooking) => void;
  actionLoadingId: string | null;
  resendConfigured?: boolean;
}

export const ApproveBookingsTab: React.FC<ApproveBookingsTabProps> = ({
  bookings,
  onApprove,
  onReject,
  onViewTicket,
  actionLoadingId,
  resendConfigured
}) => {
  const [rejectingBookingId, setRejectingBookingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  // Bookings that have completed both UNO games and are waiting approval
  const awaitingBookings = bookings.filter(
    (b) => b.booking_status === 'AWAITING_APPROVAL'
  );

  // Recently approved or sent bookings for review
  const recentlyApproved = bookings.filter(
    (b) => b.booking_status === 'APPROVED' || b.booking_status === 'TICKET_SENT'
  );

  const confirmReject = async (bookingId: string) => {
    await onReject(bookingId, rejectReason || 'Declined by organiser');
    setRejectingBookingId(null);
    setRejectReason('');
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-cinematic text-2xl font-black text-white">
          APPROVE & SEND TICKETS
        </h2>
        <p className="text-xs text-neutral-400">
          Review attendees who satisfied the 2 UNO games challenge and issue official digital passes.
        </p>
      </div>

      {/* Resend Status Banner */}
      <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Mail className="w-5 h-5 text-amber-400" />
          <div className="text-xs">
            <span className="font-bold text-white block">Automatic Email Delivery Status:</span>
            {resendConfigured ? (
              <span className="text-emerald-400">
                Resend API Key is Active &bull; Tickets will automatically dispatch to guest inbox.
              </span>
            ) : (
              <span className="text-neutral-400">
                Resend API key not yet set in environment. Passes generate instantly with full QR code and can be viewed, downloaded, or shared in-app.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Awaiting Approval Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-cinematic text-lg font-bold text-white flex items-center gap-2">
            <span>Awaiting Organizer Approval</span>
            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800">
              {awaitingBookings.length}
            </span>
          </h3>
        </div>

        {awaitingBookings.length === 0 ? (
          <div className="p-8 text-center rounded-xl border border-neutral-800 bg-neutral-950/60 text-neutral-400 text-xs">
            No attendees currently waiting for ticket approval. When attendees have both UNO games checked in the verification tab, they will appear here.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {awaitingBookings.map((b) => {
              const isLoading = actionLoadingId === b.id;

              return (
                <div
                  key={b.id}
                  className="p-6 rounded-xl bg-gradient-to-br from-neutral-950 to-[#120F12] border border-amber-600/50 shadow-xl flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between pb-3 border-b border-neutral-800">
                      <div>
                        <span className="text-[10px] font-mono tracking-widest text-neutral-400 uppercase">
                          BOOKING REFERENCE
                        </span>
                        <div className="font-mono text-lg font-bold text-amber-400">
                          {b.booking_reference}
                        </div>
                      </div>
                      <div className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-300 bg-cyan-950/80 px-2.5 py-0.5 rounded border border-cyan-600/50">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>UNO Completed</span>
                      </div>
                    </div>

                    <div className="py-4 space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Attendee Name:</span>
                        <span className="font-semibold text-white">{b.full_name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Email Address:</span>
                        <span className="font-mono text-neutral-200">{b.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Requested Tickets:</span>
                        <span className="font-mono text-white font-bold">1 Pass</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-neutral-400">Challenge Verification:</span>
                        <span className="text-emerald-400 font-semibold">Game 1 & 2 Verified ✓</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="pt-4 border-t border-neutral-800 flex items-center gap-3">
                    <button
                      onClick={() => onApprove(b.id)}
                      disabled={isLoading}
                      className="flex-1 py-2.5 px-4 text-xs font-bold uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isLoading ? 'Issuing Ticket...' : 'APPROVE & SEND TICKET'}</span>
                    </button>

                    <button
                      onClick={() => setRejectingBookingId(b.id)}
                      disabled={isLoading}
                      className="py-2.5 px-3 text-xs font-semibold text-neutral-400 hover:text-red-400 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recently Approved / Issued List */}
      <div>
        <h3 className="font-cinematic text-lg font-bold text-white mb-4">
          Recently Approved Passes ({recentlyApproved.length})
        </h3>
        <div className="rounded-xl border border-neutral-800 bg-neutral-950/60 divide-y divide-neutral-800/80">
          {recentlyApproved.length === 0 ? (
            <div className="p-6 text-center text-xs text-neutral-500">
              No tickets approved yet.
            </div>
          ) : (
            recentlyApproved.slice(0, 5).map((b) => (
              <div key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-semibold text-white mr-3">{b.full_name}</span>
                  <span className="font-mono text-neutral-400 mr-3">{b.booking_reference}</span>
                  <span className="font-mono text-neutral-500">{b.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-emerald-400 font-semibold font-mono">
                    {b.booking_status}
                  </span>
                  <button
                    onClick={() => onViewTicket(b)}
                    className="px-3 py-1 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Ticket className="w-3.5 h-3.5 text-amber-400" />
                    <span>View Pass</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectingBookingId && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#121217] border border-red-900 rounded-xl p-6 max-w-sm w-full">
            <h4 className="font-cinematic text-lg font-bold text-white mb-2">
              Reject Booking
            </h4>
            <p className="text-xs text-neutral-400 mb-4">
              Enter reason for declining this request:
            </p>
            <input
              type="text"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Duplicate submission or request withdrawn"
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
                Confirm Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
