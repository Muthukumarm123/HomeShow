import React, { useState } from 'react';
import { Gamepad2, CheckCircle2, Clock, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { FamilyBooking } from '../../types.ts';

interface UnoVerificationTabProps {
  bookings: FamilyBooking[];
  onToggleUno: (bookingId: string, game1: boolean, game2: boolean) => Promise<void>;
  onNavigateToApprove: () => void;
  actionLoadingId: string | null;
}

export const UnoVerificationTab: React.FC<UnoVerificationTabProps> = ({
  bookings,
  onToggleUno,
  onNavigateToApprove,
  actionLoadingId
}) => {
  const [filterPendingOnly, setFilterPendingOnly] = useState(true);

  // Focus on bookings that either need UNO verification or just completed it
  const displayBookings = bookings.filter((b) => {
    if (b.booking_status === 'REJECTED') return false;
    if (filterPendingOnly) {
      return (
        !b.uno_game_1_completed ||
        !b.uno_game_2_completed ||
        b.booking_status === 'AWAITING_APPROVAL'
      );
    }
    return true;
  });

  const awaitingCount = bookings.filter(
    (b) => b.booking_status === 'AWAITING_APPROVAL'
  ).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-amber-400 font-bold mb-1">
            <Gamepad2 className="w-4 h-4" />
            <span>Challenge Management Matrix</span>
          </div>
          <h2 className="font-cinematic text-2xl font-black text-white">
            UNO GAME VERIFICATION
          </h2>
          <p className="text-xs text-neutral-400">
            Verify Game 1 and Game 2 as family members play. Marking both moves them to Awaiting Approval.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-neutral-300 cursor-pointer">
            <input
              type="checkbox"
              checked={filterPendingOnly}
              onChange={(e) => setFilterPendingOnly(e.target.checked)}
              className="rounded text-amber-500 bg-neutral-900 border-neutral-700"
            />
            <span>Show Incomplete & Awaiting only</span>
          </label>
        </div>
      </div>

      {/* Organizer Alert Banner if attendees are awaiting approval */}
      {awaitingCount > 0 && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-red-950/60 to-neutral-900 border border-amber-600/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-400 text-black flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white">
                {awaitingCount} {awaitingCount === 1 ? 'Attendee Has' : 'Attendees Have'} Completed Both UNO Games!
              </div>
              <div className="text-xs text-amber-200/80">
                Their challenge is finished. Ready for you to review and issue tickets.
              </div>
            </div>
          </div>

          <button
            onClick={onNavigateToApprove}
            className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-black bg-amber-400 hover:bg-amber-300 rounded-md transition-colors flex items-center gap-2 self-start sm:self-auto cursor-pointer shrink-0"
          >
            <span>Review & Approve Passes</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* UNO Verification Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayBookings.length === 0 ? (
          <div className="col-span-full py-12 text-center rounded-xl border border-neutral-800 bg-neutral-950/50 text-neutral-400 text-sm">
            All registered attendees have completed their UNO games!
          </div>
        ) : (
          displayBookings.map((b) => {
            const isLoading = actionLoadingId === b.id;
            const bothDone = b.uno_game_1_completed && b.uno_game_2_completed;

            return (
              <div
                key={b.id}
                className={`p-5 rounded-xl border transition-all ${
                  bothDone
                    ? 'bg-neutral-950 border-amber-600/40 shadow-lg shadow-amber-950/10'
                    : 'bg-neutral-900/60 border-neutral-800'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between pb-3 border-b border-neutral-800/80">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest text-neutral-500">
                      REF: {b.booking_reference}
                    </span>
                    <h4 className="font-cinematic text-lg font-bold text-white mt-0.5">
                      {b.full_name}
                    </h4>
                    <span className="text-xs text-neutral-400 font-mono truncate block max-w-[200px]">
                      {b.email}
                    </span>
                  </div>

                  <div className="text-right">
                    {bothDone ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-600/40">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Ready</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-600/30">
                        <Clock className="w-3 h-3" />
                        <span>In Play</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Verification Toggles */}
                <div className="py-4 space-y-3">
                  {/* Game 1 */}
                  <label className="flex items-center justify-between p-3 rounded-lg bg-neutral-950/80 border border-neutral-800 hover:border-amber-500/40 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${
                          b.uno_game_1_completed
                            ? 'bg-emerald-500 text-black'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {b.uno_game_1_completed ? '✓' : '1'}
                      </div>
                      <span className="text-xs font-semibold text-white">
                        UNO GAME 1
                      </span>
                    </div>

                    <input
                      type="checkbox"
                      checked={b.uno_game_1_completed}
                      disabled={isLoading}
                      onChange={(e) =>
                        onToggleUno(b.id, e.target.checked, b.uno_game_2_completed)
                      }
                      className="w-4 h-4 rounded text-amber-500 bg-neutral-900 border-neutral-700 cursor-pointer"
                    />
                  </label>

                  {/* Game 2 */}
                  <label className="flex items-center justify-between p-3 rounded-lg bg-neutral-950/80 border border-neutral-800 hover:border-amber-500/40 cursor-pointer transition-colors">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center text-xs font-bold ${
                          b.uno_game_2_completed
                            ? 'bg-emerald-500 text-black'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {b.uno_game_2_completed ? '✓' : '2'}
                      </div>
                      <span className="text-xs font-semibold text-white">
                        UNO GAME 2
                      </span>
                    </div>

                    <input
                      type="checkbox"
                      checked={b.uno_game_2_completed}
                      disabled={isLoading}
                      onChange={(e) =>
                        onToggleUno(b.id, b.uno_game_1_completed, e.target.checked)
                      }
                      className="w-4 h-4 rounded text-amber-500 bg-neutral-900 border-neutral-700 cursor-pointer"
                    />
                  </label>
                </div>

                {/* Footer status notice */}
                <div className="text-[11px] text-neutral-500 pt-2 border-t border-neutral-800/80 flex items-center justify-between">
                  <span>Status:</span>
                  <span className="font-mono text-neutral-300 font-semibold">
                    {b.booking_status}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
