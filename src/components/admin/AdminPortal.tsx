import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  LayoutDashboard,
  Users,
  Gamepad2,
  CheckCircle,
  Ticket as TicketIcon,
  QrCode,
  Settings,
  LogOut,
  X,
  Lock,
  Key,
  Globe
} from 'lucide-react';
import { AdminDashboardTab } from './AdminDashboardTab.tsx';
import { WaitingListTab } from './WaitingListTab.tsx';
import { UnoVerificationTab } from './UnoVerificationTab.tsx';
import { ApproveBookingsTab } from './ApproveBookingsTab.tsx';
import { SentTicketsTab } from './SentTicketsTab.tsx';
import { QrScannerTab } from './QrScannerTab.tsx';
import { MovieSettingsTab } from './MovieSettingsTab.tsx';
import { MultiSiteTab } from './MultiSiteTab.tsx';
import { ChangePasswordModal } from './ChangePasswordModal.tsx';
import { TicketPass } from '../TicketPass.tsx';
import { FamilyBooking, Ticket, MovieSettings, SummaryStats } from '../../types.ts';
import { dataService } from '../../services/dataService.ts';

interface AdminPortalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSettings: MovieSettings;
  onSettingsUpdated?: (newSettings: MovieSettings) => void;
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  isOpen,
  onClose,
  defaultSettings,
  onSettingsUpdated
}) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('jailer_admin_token'));
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  // Sign In Form State
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Data States
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [bookings, setBookings] = useState<FamilyBooking[]>([]);
  const [tickets, setTickets] = useState<{ ticket: Ticket; booking: FamilyBooking | null }[]>([]);
  const [settings, setSettings] = useState<MovieSettings>(defaultSettings);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // Ticket Preview Modal State
  const [previewData, setPreviewData] = useState<{
    ticket: Ticket;
    booking: FamilyBooking;
  } | null>(null);

  useEffect(() => {
    if (token && isOpen) {
      fetchAllData();
    }
  }, [token, isOpen]);

  const fetchAllData = async () => {
    if (!token) return;
    try {
      const [statsData, bookingsData, ticketsData, settingsData] = await Promise.all([
        dataService.getSummaryStats(),
        dataService.getAllBookings(),
        dataService.getAllTickets(),
        dataService.getEventInfo()
      ]);

      setStats(statsData);
      setBookings(bookingsData);
      setTickets(ticketsData);
      setSettings(settingsData);
    } catch (err) {
      console.error('Failed fetching admin data:', err);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const data = await dataService.loginAdmin(password);
      setToken(data.token);
      setPassword('');
      await fetchAllData();
    } catch (err: any) {
      setLoginError(err.message || 'Invalid administrator password.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('jailer_admin_token');
    setToken(null);
    setActiveTab('dashboard');
  };

  // Actions
  const handleToggleUno = async (bookingId: string, game1: boolean, game2: boolean) => {
    setActionLoadingId(bookingId);
    try {
      await dataService.updateUnoProgress(bookingId, game1, game2);
      await fetchAllData();
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateEmail = async (bookingId: string, email: string) => {
    setActionLoadingId(bookingId);
    try {
      await dataService.updateBookingEmail(bookingId, email);
      await fetchAllData();
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleApprove = async (bookingId: string) => {
    setActionLoadingId(bookingId);
    try {
      const result = await dataService.approveAndIssueTicket(bookingId);
      await fetchAllData();

      if (result.ticket && result.booking) {
        setPreviewData({ ticket: result.ticket, booking: result.booking });
      }
    } catch (err: any) {
      alert(err.message || 'Error approving booking');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (bookingId: string, reason?: string) => {
    setActionLoadingId(bookingId);
    try {
      await dataService.rejectBooking(bookingId, reason);
      await fetchAllData();
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleUpdateSettings = async (newSettings: Partial<MovieSettings>) => {
    try {
      const updated = await dataService.updateSettings(newSettings);
      setSettings(updated);
      if (onSettingsUpdated) onSettingsUpdated(updated);
      await fetchAllData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleChangePassword = async (oldPass: string, newPass: string) => {
    try {
      return await dataService.changeAdminPassword(oldPass, newPass);
    } catch (_) {
      return false;
    }
  };

  const handleSendTestEmail = async (testEmail: string) => {
    const res = await fetch('/api/admin/send-test-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ test_email: testEmail })
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to dispatch test email');
    }
  };

  const handleOpenTicketPreview = (booking: FamilyBooking, explicitTicket?: Ticket) => {
    const t = explicitTicket || tickets.find((item) => item.booking?.id === booking.id)?.ticket;
    if (t) {
      setPreviewData({ ticket: t, booking });
    } else {
      alert('Ticket not yet issued for this booking.');
    }
  };

  const handleEventPresetSwitched = (newSettings: MovieSettings) => {
    setSettings(newSettings);
    if (onSettingsUpdated) onSettingsUpdated(newSettings);
    fetchAllData();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/95 backdrop-blur-md flex flex-col">
      {/* Top Bar */}
      <div className="w-full bg-[#0C0C0F] border-b border-neutral-800 px-4 sm:px-8 py-3.5 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-red-950 border border-red-700 flex items-center justify-center text-amber-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h1 className="font-cinematic text-lg font-black text-white leading-tight">
              {settings.movie_title || 'CINEMA'} <span className="text-amber-400">&bull;</span> ORGANIZER CONSOLE
            </h1>
            <span className="text-[11px] text-neutral-400">
              Multi-Website & Premiere Control Center
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {token && (
            <>
              {/* Prominent Change Password Button */}
              <button
                onClick={() => setShowChangePasswordModal(true)}
                className="px-3 py-1.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Change your administrator password"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Change Password</span>
              </button>

              <button
                onClick={handleLogout}
                className="text-neutral-400 hover:text-red-400 text-xs font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-neutral-800 transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Log Out</span>
              </button>
            </>
          )}

          <button
            onClick={onClose}
            className="p-1.5 text-neutral-400 hover:text-white rounded hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-8">
        {!token ? (
          /* LOGIN SCREEN */
          <div className="max-w-md mx-auto my-12 p-8 rounded-2xl bg-[#0D0D11] border border-amber-900/50 shadow-2xl">
            <div className="w-12 h-12 rounded-xl bg-red-950/80 border border-red-700/60 flex items-center justify-center text-amber-400 mx-auto mb-4">
              <Lock className="w-6 h-6" />
            </div>

            <h2 className="font-cinematic text-2xl font-black text-white text-center mb-1">
              ADMINISTRATOR SIGN IN
            </h2>
            <p className="text-xs text-neutral-400 text-center mb-6">
              Enter your master organiser password to manage bookings, verify challenges, and scan passes.
            </p>

            {loginError && (
              <div className="mb-4 p-3 rounded-lg bg-red-950/70 border border-red-800 text-xs text-red-200">
                {loginError}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-neutral-300 mb-1">
                  Master Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter administrator password..."
                  className="w-full px-3.5 py-2.5 bg-neutral-900 border border-neutral-700 rounded-lg text-white text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={isLoggingIn}
                className="w-full py-3 text-xs font-bold uppercase tracking-wider text-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-lg transition-all shadow-md active:scale-98 cursor-pointer"
              >
                {isLoggingIn ? 'Authenticating...' : 'Sign In to Dashboard'}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-neutral-800 text-[11px] text-neutral-500 leading-relaxed text-center space-y-2">
              <div>
                <span>Default Password: </span>
                <code className="text-amber-400 font-bold bg-neutral-900 px-1.5 py-0.5 rounded">
                  jailer2026
                </code>
              </div>
              <div>
                <span>Forgot password? Emergency recovery key: </span>
                <code className="text-neutral-300 font-bold bg-neutral-900 px-1.5 py-0.5 rounded">
                  FAMILY-CINEMA-2026
                </code>
              </div>
              <button
                onClick={() => setShowChangePasswordModal(true)}
                className="text-amber-400 hover:underline inline-block mt-2 font-semibold"
              >
                Reset / Change Password Now
              </button>
            </div>
          </div>
        ) : (
          /* AUTHENTICATED DASHBOARD */
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Navigation Tabs Bar */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-neutral-800 no-scrollbar">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'dashboard'
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </button>

              <button
                onClick={() => setActiveTab('waiting-list')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'waiting-list'
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Waiting List ({bookings.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('uno')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'uno'
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Gamepad2 className="w-3.5 h-3.5" />
                <span>UNO Verification</span>
              </button>

              <button
                onClick={() => setActiveTab('approve')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'approve'
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <CheckCircle className="w-3.5 h-3.5" />
                <span>
                  Approve Bookings ({bookings.filter((b) => b.booking_status === 'AWAITING_APPROVAL').length})
                </span>
              </button>

              <button
                onClick={() => setActiveTab('tickets')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'tickets'
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <TicketIcon className="w-3.5 h-3.5" />
                <span>Sent Tickets ({tickets.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('scan')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'scan'
                    ? 'bg-emerald-400 text-black shadow-md'
                    : 'text-neutral-400 hover:text-emerald-400 hover:bg-neutral-900'
                }`}
              >
                <QrCode className="w-3.5 h-3.5" />
                <span>Scan Tickets</span>
              </button>

              <button
                onClick={() => setActiveTab('multi-site')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'multi-site'
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'text-neutral-400 hover:text-amber-400 hover:bg-neutral-900'
                }`}
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Multi-Website & GitHub</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900'
                }`}
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Movie Settings</span>
              </button>

              <button
                onClick={() => setShowChangePasswordModal(true)}
                className="px-3.5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer text-amber-400 hover:bg-neutral-900 border border-amber-500/30"
              >
                <Key className="w-3.5 h-3.5" />
                <span>Change Password</span>
              </button>
            </div>

            {/* Tab Views */}
            <div className="pt-2">
              {activeTab === 'dashboard' && (
                <AdminDashboardTab stats={stats} onNavigate={(tab) => setActiveTab(tab)} />
              )}

              {activeTab === 'waiting-list' && (
                <WaitingListTab
                  bookings={bookings}
                  onToggleUno={handleToggleUno}
                  onUpdateEmail={handleUpdateEmail}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onViewTicket={handleOpenTicketPreview}
                  actionLoadingId={actionLoadingId}
                />
              )}

              {activeTab === 'uno' && (
                <UnoVerificationTab
                  bookings={bookings}
                  onToggleUno={handleToggleUno}
                  onNavigateToApprove={() => setActiveTab('approve')}
                  actionLoadingId={actionLoadingId}
                />
              )}

              {activeTab === 'approve' && (
                <ApproveBookingsTab
                  bookings={bookings}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onViewTicket={handleOpenTicketPreview}
                  actionLoadingId={actionLoadingId}
                  resendConfigured={settings.resend_api_key_configured}
                />
              )}

              {activeTab === 'tickets' && (
                <SentTicketsTab
                  tickets={tickets}
                  onViewTicket={(b, t) => handleOpenTicketPreview(b, t)}
                />
              )}

              {activeTab === 'scan' && <QrScannerTab />}

              {activeTab === 'multi-site' && (
                <MultiSiteTab
                  currentSettings={settings}
                  onEventSwitched={handleEventPresetSwitched}
                />
              )}

              {activeTab === 'settings' && (
                <MovieSettingsTab
                  settings={settings}
                  onUpdateSettings={handleUpdateSettings}
                  onChangePassword={handleChangePassword}
                  onSendTestEmail={handleSendTestEmail}
                />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ticket Preview Modal */}
      {previewData && (
        <div className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative max-w-xl w-full my-8">
            <TicketPass
              ticket={previewData.ticket}
              booking={previewData.booking}
              settings={settings}
              onClose={() => setPreviewData(null)}
            />
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
        onSuccess={() => {
          alert('Password successfully updated!');
        }}
      />
    </div>
  );
};
