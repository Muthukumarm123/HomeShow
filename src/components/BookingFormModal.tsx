import React, { useState } from 'react';
import { X, Ticket, CheckCircle, Copy, AlertCircle, Sparkles, User, Mail, Phone } from 'lucide-react';
import confetti from 'canvas-confetti';
import { dataService } from '../services/dataService.ts';

interface BookingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewStatus: (ref: string) => void;
  movieTitle?: string;
  challengeName?: string;
}

export const BookingFormModal: React.FC<BookingFormModalProps> = ({
  isOpen,
  onClose,
  onViewStatus,
  movieTitle = 'JAILER 2',
  challengeName = 'UNO Challenge'
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [unoAccepted, setUnoAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success state
  const [submissionResult, setSubmissionResult] = useState<{
    reference: string;
    fullName: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || fullName.trim().length < 2) {
      setError('Please provide your full legal or family name.');
      return;
    }

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setError('Please enter a valid email address (e.g. yourname@gmail.com).');
      return;
    }

    if (!unoAccepted) {
      setError(`You must confirm that you understand the ${challengeName} requirement.`);
      return;
    }

    setIsSubmitting(true);
    try {
      const data = await dataService.createBooking({
        full_name: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        uno_challenge_accepted: true
      });

      setSubmissionResult({
        reference: data.booking_reference,
        fullName: fullName.trim()
      });

      // Fire celebratory confetti
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#F59E0B', '#DC2626', '#FCD34D']
      });
    } catch (err: any) {
      setError(err.message || 'Error communicating with booking server');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyRef = () => {
    if (!submissionResult) return;
    navigator.clipboard.writeText(submissionResult.reference);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleReset = () => {
    setFullName('');
    setEmail('');
    setPhone('');
    setUnoAccepted(false);
    setError(null);
    setSubmissionResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-xl rounded-2xl bg-[#0D0D11] border border-amber-900/50 shadow-2xl p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleReset}
          className="absolute top-5 right-5 p-2 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {!submissionResult ? (
          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-red-950/80 border border-red-700/50 flex items-center justify-center text-amber-400">
                <Ticket className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-cinematic text-2xl font-black text-white">
                  BOOK TICKETS
                </h3>
                <p className="text-xs text-neutral-400">
                  {movieTitle} Family Movie Night Waiting List Request
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-3.5 rounded-lg bg-red-950/60 border border-red-800 text-red-200 text-xs flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-500" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Pandian"
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Email Address (Preferably Gmail) *
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-500" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ramesh.pandian@gmail.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                  />
                </div>
                <span className="block mt-1 text-[11px] text-neutral-500">
                  Your approved QR ticket will be delivered to this inbox.
                </span>
              </div>

              {/* Number of Tickets (Enforced 1) */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider">
                    Number of Tickets
                  </label>
                  <span className="text-[11px] text-amber-400 font-medium">1 Ticket Per Attendee Policy</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-neutral-900/90 border border-neutral-800 rounded-lg text-sm">
                  <span className="text-white font-medium">1 Admission Pass</span>
                  <span className="text-xs text-neutral-400">Each attendee must submit individually & complete {challengeName}</span>
                </div>
              </div>

              {/* Phone (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-1.5">
                  Mobile Contact Number (Optional)
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3.5 top-3.5 text-neutral-500" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +44 7700 900077"
                    className="w-full pl-10 pr-4 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-colors"
                  />
                </div>
              </div>

              {/* Mandatory Requirement Note */}
              <div className="p-4 rounded-xl bg-red-950/40 border border-red-900/60 text-xs text-neutral-300 leading-relaxed">
                <p className="font-semibold text-amber-300 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Organiser Policy Notice:
                </p>
                <p className="italic">
                  "Your ticket request will be added to the waiting list. Your ticket will be issued only after the organiser verifies your {challengeName} and approves your booking."
                </p>
              </div>

              {/* Mandatory Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={unoAccepted}
                  onChange={(e) => setUnoAccepted(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded text-amber-500 bg-neutral-900 border-neutral-700 focus:ring-amber-400"
                />
                <span className="text-xs text-neutral-300">
                  I understand and agree that I must play and complete two verified {challengeName} rounds before receiving my confirmed ticket.
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 text-sm font-bold tracking-wider uppercase text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 rounded-lg transition-all shadow-lg shadow-amber-500/20 active:scale-98 cursor-pointer"
              >
                {isSubmitting ? 'Submitting to Waiting List...' : 'SUBMIT BOOKING REQUEST'}
              </button>
            </form>
          </div>
        ) : (
          /* Submission Confirmation Screen */
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-950/80 border border-emerald-500/50 flex items-center justify-center text-emerald-400 mx-auto mb-5 shadow-lg shadow-emerald-500/20">
              <CheckCircle className="w-9 h-9" />
            </div>

            <h3 className="font-cinematic text-2xl sm:text-3xl font-black text-white mb-2">
              YOUR REQUEST HAS BEEN RECEIVED!
            </h3>

            <p className="text-sm text-neutral-300 max-w-md mx-auto mb-6 leading-relaxed">
              Your booking is now on the waiting list. Complete your two {challengeName} rounds and wait for the organiser's approval before receiving your ticket.
            </p>

            {/* Reference Box */}
            <div className="p-4 rounded-xl bg-neutral-950 border border-amber-500/40 max-w-sm mx-auto mb-6">
              <span className="block text-[11px] uppercase tracking-widest text-neutral-400 font-semibold mb-1">
                Booking Reference Number
              </span>
              <div className="flex items-center justify-center gap-3">
                <span className="font-mono text-xl sm:text-2xl font-extrabold text-amber-400 tracking-wider">
                  {submissionResult.reference}
                </span>
                <button
                  onClick={handleCopyRef}
                  title="Copy Reference"
                  className="p-1.5 rounded bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Copy className="w-4 h-4" />
                </button>
              </div>
              {copied && (
                <span className="block mt-1 text-[11px] text-emerald-400 font-medium">
                  Copied to clipboard!
                </span>
              )}
            </div>

            <div className="text-xs text-neutral-400 mb-8 max-w-md mx-auto">
              Please save this reference code. You can check your {challengeName} verification progress and download your ticket once approved.
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => {
                  const ref = submissionResult.reference;
                  handleReset();
                  onViewStatus(ref);
                }}
                className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-black bg-amber-400 hover:bg-amber-300 rounded-md transition-colors cursor-pointer"
              >
                View Booking Status
              </button>
              <button
                onClick={handleReset}
                className="px-6 py-3 text-xs font-bold uppercase tracking-wider text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors cursor-pointer"
              >
                Close & Return
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
