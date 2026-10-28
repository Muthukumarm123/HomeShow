import React, { useState } from 'react';
import { X, Key, ShieldCheck, AlertCircle, Eye, EyeOff, HelpCircle } from 'lucide-react';
import { dataService } from '../../services/dataService.ts';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPasswords, setShowPasswords] = useState(false);
  const [isEmergencyMode, setIsEmergencyMode] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 5) {
      setError('New password must be at least 5 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    try {
      await dataService.changeAdminPassword(currentPassword, newPassword, isEmergencyMode);
      setSuccess('Your administrator password has been updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-[#0D0D11] border border-amber-900/60 shadow-2xl p-6 sm:p-7">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-neutral-400 hover:text-white rounded-lg hover:bg-neutral-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-600/40 flex items-center justify-center text-amber-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-cinematic text-xl font-bold text-white">
              CHANGE ADMIN PASSWORD
            </h3>
            <p className="text-xs text-neutral-400">
              Update your master credentials for managing movie nights
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-950/70 border border-red-800 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-emerald-950 border border-emerald-700 text-xs text-emerald-200 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Current Password or Emergency Recovery Key */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs uppercase font-semibold text-neutral-300">
                {isEmergencyMode ? 'Emergency Recovery Key' : 'Current Password'} *
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsEmergencyMode(!isEmergencyMode);
                  setCurrentPassword('');
                  setError(null);
                }}
                className="text-[11px] text-amber-400 hover:underline cursor-pointer"
              >
                {isEmergencyMode ? 'Use Normal Password' : 'Forgot Password?'}
              </button>
            </div>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder={isEmergencyMode ? 'Enter recovery key: FAMILY-CINEMA-2026' : 'Enter current password'}
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400 font-mono"
            />
            {isEmergencyMode && (
              <span className="block mt-1 text-[11px] text-amber-300/80">
                Default recovery key is: <code className="bg-black px-1 rounded font-bold">FAMILY-CINEMA-2026</code>
              </span>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-xs uppercase font-semibold text-neutral-300 mb-1">
              New Password *
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 5 characters"
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-xs uppercase font-semibold text-neutral-300 mb-1">
              Confirm New Password *
            </label>
            <input
              type={showPasswords ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-type new password"
              className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-xs focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Show/Hide password toggle */}
          <div className="flex items-center justify-between pt-1">
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="text-xs text-neutral-400 hover:text-white flex items-center gap-1.5 cursor-pointer"
            >
              {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPasswords ? 'Hide password characters' : 'Show password characters'}</span>
            </button>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-xs font-bold uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 disabled:opacity-50 rounded-lg transition-all shadow-md cursor-pointer"
            >
              {loading ? 'Saving New Password...' : 'Save & Apply New Password'}
            </button>
          </div>
        </form>

        <div className="mt-4 pt-3 border-t border-neutral-800 text-[11px] text-neutral-500 text-center">
          Changes take effect immediately on your device and GitHub Pages site.
        </div>
      </div>
    </div>
  );
};
