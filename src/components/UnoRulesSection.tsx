import React from 'react';
import { Trophy, CheckCircle2, ShieldCheck, Gamepad2, ArrowRight } from 'lucide-react';

interface UnoRulesSectionProps {
  movieTitle?: string;
  challengeName?: string;
  onBookTickets: () => void;
}

export const UnoRulesSection: React.FC<UnoRulesSectionProps> = ({
  movieTitle = 'JAILER 2',
  challengeName = 'UNO Challenge',
  onBookTickets
}) => {
  return (
    <section id="uno-rules" className="py-20 bg-[#070709] border-b border-neutral-900 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-red-400 font-bold mb-2">
            <Gamepad2 className="w-4 h-4 text-amber-400" />
            <span>The Family Challenge Gate</span>
          </div>
          <h2 className="font-cinematic text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-wide">
            TWO GAMES. ONE EPIC MOVIE NIGHT.
          </h2>
          <p className="mt-4 text-neutral-400 text-sm sm:text-base leading-relaxed">
            Entry to our private screening isn't bought—it's earned with family fun! Each family member must complete two verified rounds of the {challengeName} before ticket issuance.
          </p>
        </div>

        {/* 4-Step Process Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <div className="p-6 rounded-xl bg-neutral-950/80 border border-neutral-800/80 hover:border-amber-500/40 transition-colors">
            <div className="text-amber-500 font-mono text-sm font-bold mb-3">01. STEP ONE</div>
            <h3 className="font-cinematic text-lg font-bold text-white mb-2">Submit Request</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Register yourself on the waiting list with your name and Gmail address. One individual ticket per request.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-neutral-950/80 border border-neutral-800/80 hover:border-amber-500/40 transition-colors">
            <div className="text-amber-500 font-mono text-sm font-bold mb-3">02. STEP TWO</div>
            <h3 className="font-cinematic text-lg font-bold text-white mb-2">Play 2 Challenge Matches</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Complete Round 1 and Round 2 of the family {challengeName}. Win or lose, completing both rounds qualifies you!
            </p>
          </div>

          <div className="p-6 rounded-xl bg-neutral-950/80 border border-neutral-800/80 hover:border-amber-500/40 transition-colors">
            <div className="text-amber-500 font-mono text-sm font-bold mb-3">03. STEP THREE</div>
            <h3 className="font-cinematic text-lg font-bold text-white mb-2">Admin Verification</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              The event organiser records your game completions in the system. Once both are checked, your status becomes Awaiting Approval.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-neutral-950/80 border border-neutral-800/80 hover:border-amber-500/40 transition-colors">
            <div className="text-amber-500 font-mono text-sm font-bold mb-3">04. STEP FOUR</div>
            <h3 className="font-cinematic text-lg font-bold text-white mb-2">QR Ticket Issued</h3>
            <p className="text-xs text-neutral-400 leading-relaxed">
              Upon organiser approval, your personalised cinematic ticket with high-security QR code is delivered to your inbox & portal!
            </p>
          </div>
        </div>

        {/* Feature Box with Rules and CTA */}
        <div className="rounded-2xl bg-gradient-to-r from-red-950/40 via-neutral-950 to-amber-950/30 border border-red-900/40 p-8 sm:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400 text-sm font-bold">
              <ShieldCheck className="w-5 h-5" />
              <span>Official Organiser Rulebook</span>
            </div>
            <h3 className="font-cinematic text-2xl font-bold text-white">
              Ready to take the {challengeName} for {movieTitle}?
            </h3>
            <ul className="text-sm text-neutral-300 space-y-2">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Strictly 1 ticket per attendee (everyone plays their own games)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Default rule: Completion of 2 full matches required (win not necessary)</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Bring your confirmed QR ticket on your phone for scanner entry</span>
              </li>
            </ul>
          </div>

          <button
            onClick={onBookTickets}
            className="px-8 py-4 text-sm font-bold tracking-wider uppercase text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-md transition-all shadow-xl shadow-amber-500/20 whitespace-nowrap active:scale-95 cursor-pointer flex items-center gap-2"
          >
            <span>Request Your Seat Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  );
};
