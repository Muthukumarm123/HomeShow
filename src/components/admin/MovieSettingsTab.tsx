import React, { useState } from 'react';
import { Settings, Save, Mail, CheckCircle2, AlertCircle, Key, Plus, Trash2, Send } from 'lucide-react';
import { MovieSettings } from '../../types.ts';

interface MovieSettingsTabProps {
  settings: MovieSettings;
  onUpdateSettings: (newSettings: Partial<MovieSettings>) => Promise<void>;
  onChangePassword: (oldPass: string, newPass: string) => Promise<boolean>;
  onSendTestEmail: (testEmail: string) => Promise<void>;
}

export const MovieSettingsTab: React.FC<MovieSettingsTabProps> = ({
  settings,
  onUpdateSettings,
  onChangePassword,
  onSendTestEmail
}) => {
  const [formData, setFormData] = useState<MovieSettings>({ ...settings });
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Gallery URL management
  const [newGalleryUrl, setNewGalleryUrl] = useState('');

  // Password state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Test email state
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);
  const [testEmailMsg, setTestEmailMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await onUpdateSettings(formData);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddGalleryUrl = () => {
    if (!newGalleryUrl.trim()) return;
    setFormData((prev) => ({
      ...prev,
      authorised_gallery_image_urls: [
        ...(prev.authorised_gallery_image_urls || []),
        newGalleryUrl.trim()
      ]
    }));
    setNewGalleryUrl('');
  };

  const handleRemoveGalleryUrl = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      authorised_gallery_image_urls: prev.authorised_gallery_image_urls.filter((_, i) => i !== index)
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMsg(null);
    const ok = await onChangePassword(oldPassword, newPassword);
    if (ok) {
      setPasswordMsg({ type: 'success', text: 'Password successfully changed! Please re-login.' });
      setOldPassword('');
      setNewPassword('');
    } else {
      setPasswordMsg({ type: 'error', text: 'Incorrect existing password. Failed to change.' });
    }
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingTest(true);
    setTestEmailMsg(null);
    try {
      await onSendTestEmail(testEmail || 'your-email@example.com');
      setTestEmailMsg({ type: 'success', text: 'Test email dispatched successfully via Resend API!' });
    } catch (err: any) {
      setTestEmailMsg({ type: 'error', text: err.message || 'Failed to dispatch test email.' });
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <div>
        <h2 className="font-cinematic text-2xl font-black text-white">
          MOVIE & SCREENING SETTINGS
        </h2>
        <p className="text-xs text-neutral-400">
          Configure event date, venue, trailer player, rules, email integration, and credentials.
        </p>
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-xl bg-emerald-950 border border-emerald-600 text-emerald-200 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Screening settings saved successfully! All updates are live.</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-6">
        <div className="border-b border-neutral-800 pb-4">
          <h3 className="font-cinematic text-lg font-bold text-white">
            Premiere Event Information
          </h3>
          <p className="text-xs text-neutral-400">
            Details shown on the landing page, booking forms, and digital tickets.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
          <div>
            <label className="block font-semibold uppercase text-neutral-300 mb-1.5">
              Movie Title
            </label>
            <input
              type="text"
              value={formData.movie_title}
              onChange={(e) => setFormData({ ...formData, movie_title: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-white"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-neutral-300 mb-1.5">
              Event Subtitle / Tagline
            </label>
            <input
              type="text"
              value={formData.event_name}
              onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-white"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-neutral-300 mb-1.5">
              Event Date
            </label>
            <input
              type="text"
              value={formData.event_date}
              onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
              placeholder="e.g. Saturday, November 14, 2026"
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-white"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-neutral-300 mb-1.5">
              Event Showtime & UNO Hours
            </label>
            <input
              type="text"
              value={formData.event_time}
              onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
              placeholder="e.g. 7:00 PM (UNO Lounge opens 6:00 PM)"
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-white"
            />
          </div>

          <div className="col-span-full">
            <label className="block font-semibold uppercase text-neutral-300 mb-1.5">
              Screening Venue
            </label>
            <input
              type="text"
              value={formData.venue}
              onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
              placeholder="e.g. The Grand Starlight Screening Lounge, Screen 1"
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-white"
            />
          </div>

          <div className="col-span-full">
            <label className="block font-semibold uppercase text-neutral-300 mb-1.5">
              Official YouTube Trailer URL
            </label>
            <input
              type="text"
              value={formData.trailer_url}
              onChange={(e) => setFormData({ ...formData, trailer_url: e.target.value })}
              placeholder="https://www.youtube.com/embed/Y5BeWdODPqo"
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-white font-mono"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="pt-4 border-t border-neutral-800 space-y-4">
          <h4 className="font-cinematic text-sm font-bold text-white uppercase tracking-wider">
            Registration & Challenge Rules
          </h4>

          <label className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-white block">
                Public Ticket Requests
              </span>
              <span className="text-[11px] text-neutral-400">
                When enabled, family members can submit waiting list requests from the homepage.
              </span>
            </div>
            <input
              type="checkbox"
              checked={formData.booking_open}
              onChange={(e) => setFormData({ ...formData, booking_open: e.target.checked })}
              className="w-4 h-4 rounded text-amber-500 bg-neutral-800 border-neutral-700 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-3 rounded-lg bg-neutral-900/60 border border-neutral-800 cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-white block">
                UNO Winner Rule
              </span>
              <span className="text-[11px] text-neutral-400">
                {formData.uno_winner_required
                  ? 'Active rule: Attendee must win at least 1 UNO game to qualify.'
                  : 'Default rule: Completion only (winning is not required, just playing both matches).'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={formData.uno_winner_required}
              onChange={(e) => setFormData({ ...formData, uno_winner_required: e.target.checked })}
              className="w-4 h-4 rounded text-amber-500 bg-neutral-800 border-neutral-700 cursor-pointer"
            />
          </label>
        </div>

        {/* Gallery Image URLs Manager */}
        <div className="pt-4 border-t border-neutral-800">
          <h4 className="font-cinematic text-sm font-bold text-white uppercase tracking-wider mb-2">
            Authorised Gallery Picture URLs
          </h4>
          <p className="text-[11px] text-neutral-400 mb-3">
            Add or remove authorised promotional images displayed in the public gallery.
          </p>

          <div className="space-y-2 mb-3">
            {(formData.authorised_gallery_image_urls || []).map((url, idx) => (
              <div key={idx} className="flex items-center gap-2 bg-neutral-900 px-3 py-2 rounded text-xs">
                <span className="font-mono text-neutral-300 truncate flex-1">{url}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveGalleryUrl(idx)}
                  className="text-neutral-500 hover:text-red-400 p-1 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newGalleryUrl}
              onChange={(e) => setNewGalleryUrl(e.target.value)}
              placeholder="Paste new image URL..."
              className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-xs text-white"
            />
            <button
              type="button"
              onClick={handleAddGalleryUrl}
              className="px-3 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded text-xs font-semibold flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Image</span>
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3 text-xs font-bold uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg transition-all shadow cursor-pointer"
        >
          {isSaving ? 'Saving Changes...' : 'Save Screening Settings'}
        </button>
      </form>

      {/* Email Integration Panel */}
      <div className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
        <div className="border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Mail className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinematic text-lg font-bold text-white">
              Resend Email Service Integration
            </h3>
          </div>
          <p className="text-xs text-neutral-400">
            Automated ticket email delivery setup and testing.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/80 border border-neutral-800 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-neutral-300 font-semibold">Environment API Key:</span>
            {settings.resend_api_key_configured ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Configured & Active
              </span>
            ) : (
              <span className="text-amber-400 font-bold flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Not Configured (Tickets work via in-app QR)
              </span>
            )}
          </div>
          <div className="text-neutral-400 leading-relaxed">
            To enable real email delivery to family Gmail addresses:
            <ol className="list-decimal pl-5 mt-1 space-y-1 text-neutral-400">
              <li>Sign up for free at <a href="https://resend.com" target="_blank" rel="noreferrer" className="text-amber-400 underline">resend.com</a> (3,000 free emails/mo).</li>
              <li>Create an API key in your Resend dashboard.</li>
              <li>Set <code className="bg-black px-1.5 py-0.5 rounded text-amber-300">RESEND_API_KEY="re_..."</code> in your environment or Secrets.</li>
              <li>For free tier testing, use sender <code className="bg-black px-1.5 py-0.5 rounded text-amber-300">onboarding@resend.dev</code> to send to your verified account email.</li>
            </ol>
          </div>
        </div>

        {/* Test Email Dispatcher */}
        <form onSubmit={handleSendTestEmail} className="pt-2 flex flex-col sm:flex-row gap-2">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="Enter test email address (e.g. yourname@gmail.com)"
            className="flex-1 px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-xs text-white"
          />
          <button
            type="submit"
            disabled={sendingTest || !settings.resend_api_key_configured}
            className="px-4 py-2 bg-amber-400 hover:bg-amber-300 disabled:opacity-40 text-black text-xs font-bold uppercase rounded flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{sendingTest ? 'Sending...' : 'Send Test Email'}</span>
          </button>
        </form>

        {testEmailMsg && (
          <div
            className={`p-3 rounded text-xs ${
              testEmailMsg.type === 'success'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : 'bg-red-950 text-red-300 border border-red-700'
            }`}
          >
            {testEmailMsg.text}
          </div>
        )}
      </div>

      {/* Admin Password Change Form */}
      <form onSubmit={handlePasswordSubmit} className="p-6 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-4">
        <div className="border-b border-neutral-800 pb-4">
          <div className="flex items-center gap-2 mb-1">
            <Key className="w-5 h-5 text-amber-400" />
            <h3 className="font-cinematic text-lg font-bold text-white">
              Change Administrator Password
            </h3>
          </div>
          <p className="text-xs text-neutral-400">
            Update your master password for accessing this organiser dashboard.
          </p>
        </div>

        {passwordMsg && (
          <div
            className={`p-3 rounded text-xs ${
              passwordMsg.type === 'success'
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                : 'bg-red-950 text-red-300 border border-red-700'
            }`}
          >
            {passwordMsg.text}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold uppercase text-neutral-300 mb-1">
              Current Password
            </label>
            <input
              type="password"
              required
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="Enter current password"
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-white"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase text-neutral-300 mb-1">
              New Password (min 6 chars)
            </label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new strong password"
              className="w-full px-3 py-2 bg-neutral-900 border border-neutral-700 rounded text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-5 py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white font-bold text-xs uppercase tracking-wider rounded transition-colors cursor-pointer"
        >
          Update Admin Password
        </button>
      </form>
    </div>
  );
};
