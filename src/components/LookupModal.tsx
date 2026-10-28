import React, { useState } from 'react';
import { X, Search, CheckCircle2, Clock, AlertCircle, Ticket as TicketIcon, Gamepad2 } from 'lucide-react';
import { TicketPass } from './TicketPass.tsx';
import { Ticket, FamilyBooking, MovieSettings } from '../types.ts';
import { dataService } from '../services/dataService.ts';

interface LookupModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuery?: string;
  defaultSettings: MovieSettings;
}

export const LookupModal: React.FC<LookupModalProps> = ({
  isOpen,
  onClose,
  initialQuery = '',
  defaultSettings
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    booking: FamilyBooking;
    ticket: Ticket | null;
    event: MovieSettings;
  } | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      setError('Please enter your booking reference (e.g. JLR-... or BK-...) or email.');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await dataService.lookupBooking(query.trim());
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Error looking up your booking');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="text-amber-400 font-semibold text-xs flex items-center gap-1.5">
            <Clock className="w-4 h-4" />
            Waiting for Challenge
          </span>
        );
      case 'UNO_IN_PROGRESS':
        return (
          <span className="text-amber-300 font-semibold text-xs flex items-center gap-1.5">
            <Gamepad2 className="w-4 h-4" />
            Challenge In Progress (1 of 2 Complete)
          </span>
        );
      case 'AWAITING_APPROVAL':
        return (
          <span className="text-cyan-400 font-semibold text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Games Completed &bull; Awaiting Organiser Approval
          </span>
        );
      case 'APPROVED':
      case 'TICKET_SENT':
        return (
          <span className="text-emerald-400 font-semibold text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Approved &bull; Ticket Issued
          </span>
        );
      case 'CHECKED_IN':
        return (
          <span className="text-emerald-300 font-semibold text-xs flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4" />
            Checked In at Screening
          </span>
        );
      case 'REJECTED':
        return (
          <span className="text-red-400 font-semibold text-xs flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4" />
            Request Declined
          </span>
        );
      default:
        return <span>{status}</span>;
    }
  };

  const challengeLabel = result?.event?.challenge_name || defaultSettings.challenge_name || 'UNO Challenge';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0D0D11] border border-neutral-800 shadow-2xl p-6 sm:p-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-amber-950/80 border border-amber-600/40 flex items-center justify-center text-amber-400">
            <TicketIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-cinematic text-2xl font-black text-white">
              LOOK UP YOUR TICKET
            </h3>
            <p className="text-xs text-neutral-400">
              Check {challengeLabel} verification status and retrieve your movie ticket pass
            </p>
          </div>
        </div>

        {/* Search input form */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-500" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Enter Booking Reference or Gmail..."
              className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-400"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 text-xs font-bold uppercase tracking-wider text-black bg-amber-400 hover:bg-amber-300 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && (
          <div className="mb-6 p-3.5 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Results view */}
        {result && (
          <div className="space-y-6">
            {/* Status card */}
            <div className="p-5 rounded-xl bg-neutral-950 border border-neutral-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-neutral-800 gap-2">
                <div>
                  <span className="text-[11px] text-neutral-400 font-mono">BOOKING REF:</span>
                  <div className="font-mono text-lg font-bold text-amber-400">
                    {result.booking.booking_reference}
                  </div>
                </div>
                <div>{getStatusBadge(result.booking.booking_status)}</div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 text-xs">
                <div>
                  <span className="text-neutral-500 block">Attendee Name</span>
                  <span className="text-white font-medium text-sm">{result.booking.full_name}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Email</span>
                  <span className="text-white font-medium text-sm">{result.booking.email}</span>
                </div>
              </div>

              {/* Progress Matrix */}
              <div className="mt-4 p-4 rounded-lg bg-neutral-900/90 border border-neutral-800">
                <span className="text-xs uppercase tracking-wider text-amber-400 font-bold block mb-2">
                  {challengeLabel} Verification
                </span>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        result.booking.uno_game_1_completed
                          ? 'bg-emerald-500 text-black'
                          : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                      }`}
                    >
                      {result.booking.uno_game_1_completed ? '✓' : '1'}
                    </div>
                    <span className={result.booking.uno_game_1_completed ? 'text-emerald-400 font-semibold' : 'text-neutral-400'}>
                      Round 1: {result.booking.uno_game_1_completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        result.booking.uno_game_2_completed
                          ? 'bg-emerald-500 text-black'
                          : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                      }`}
                    >
                      {result.booking.uno_game_2_completed ? '✓' : '2'}
                    </div>
                    <span className={result.booking.uno_game_2_completed ? 'text-emerald-400 font-semibold' : 'text-neutral-400'}>
                      Round 2: {result.booking.uno_game_2_completed ? 'Completed' : 'Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* If ticket is approved and available, display the ticket */}
            {result.ticket ? (
              <div className="pt-2">
                <TicketPass
                  ticket={result.ticket}
                  booking={result.booking}
                  settings={result.event || defaultSettings}
                />
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 text-center text-xs text-neutral-400">
                {result.booking.booking_status === 'AWAITING_APPROVAL' ? (
                  <span>
                    🎉 Both challenge rounds are recorded! The organiser will review and issue your ticket shortly.
                  </span>
                ) : (
                  <span>
                    Please complete your 2 {challengeLabel} rounds with the family. Once verified by the organiser, your ticket and QR code will appear here.
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
