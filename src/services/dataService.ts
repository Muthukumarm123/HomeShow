import QRCode from 'qrcode';
import {
  FamilyBooking,
  Ticket,
  EmailLog,
  MovieSettings,
  MovieEventPreset,
  SummaryStats
} from '../types.ts';

// Default Event Presets so the user can use the same project for multiple movie websites!
export const DEFAULT_MOVIE_PRESETS: MovieEventPreset[] = [
  {
    id: 'jailer-2',
    movie_title: 'JAILER 2',
    event_name: 'THE ULTIMATE FAMILY MOVIE NIGHT',
    tagline: 'Two UNO Games. One Epic Movie Night.',
    hero_image_url: '/src/assets/images/jailer_hero_cinematic_1793199448445.jpg',
    event_date: 'Saturday, November 14, 2026',
    event_time: '7:00 PM (UNO Arena starts at 6:00 PM)',
    venue: 'The Grand Starlight Screening Lounge, Screen 1',
    trailer_url: 'https://www.youtube.com/embed/Y5BeWdODPqo',
    challenge_name: 'UNO Challenge',
    challenge_game1_label: 'UNO Game 1',
    challenge_game2_label: 'UNO Game 2',
    authorised_gallery_image_urls: [
      '/src/assets/images/jailer_hero_cinematic_1793199448445.jpg',
      '/src/assets/images/jailer_uno_arena_1793199450537.jpg',
      '/src/assets/images/jailer_movie_still_action_1793199450458.jpg'
    ]
  },
  {
    id: 'leo-premiere',
    movie_title: 'LEO',
    event_name: 'BLOODY SWEET FAMILY PREMIERE',
    tagline: 'Two UNO Showdowns. One Ruthless Screening.',
    hero_image_url: '/src/assets/images/jailer_movie_still_action_1793199450458.jpg',
    event_date: 'Friday, December 18, 2026',
    event_time: '7:30 PM (Lounge opens 6:30 PM)',
    venue: 'The Red Velvet Cinema Lounge, Screen 2',
    trailer_url: 'https://www.youtube.com/embed/Po3jStA673E',
    challenge_name: 'UNO Challenge',
    challenge_game1_label: 'Round 1 Match',
    challenge_game2_label: 'Round 2 Match',
    authorised_gallery_image_urls: [
      '/src/assets/images/jailer_movie_still_action_1793199450458.jpg',
      '/src/assets/images/jailer_uno_arena_1793199450537.jpg'
    ]
  },
  {
    id: 'family-cinema-custom',
    movie_title: 'FAMILY CINEMA NIGHT',
    event_name: 'EXCLUSIVE HOME THEATRE PREMIERE',
    tagline: 'Complete The Family Challenge For VIP Entry.',
    hero_image_url: '/src/assets/images/jailer_uno_arena_1793199450537.jpg',
    event_date: 'Sunday, December 27, 2026',
    event_time: '6:00 PM (Challenges start 5:00 PM)',
    venue: 'Family Home Theatre Suite, Main Auditorium',
    trailer_url: 'https://www.youtube.com/embed/Y5BeWdODPqo',
    challenge_name: 'Family Games Challenge',
    challenge_game1_label: 'Challenge Game 1',
    challenge_game2_label: 'Challenge Game 2',
    authorised_gallery_image_urls: [
      '/src/assets/images/jailer_uno_arena_1793199450537.jpg',
      '/src/assets/images/jailer_hero_cinematic_1793199448445.jpg'
    ]
  }
];

const LOCAL_STORAGE_KEY = 'cinema_family_db_v2';
const MASTER_RECOVERY_KEY = 'FAMILY-CINEMA-2026';

interface LocalDatabaseState {
  presets: MovieEventPreset[];
  activePresetId: string;
  settings: MovieSettings;
  bookings: FamilyBooking[];
  tickets: Ticket[];
  email_logs: EmailLog[];
  adminPasswordHash: string;
}

// Simple browser SHA-256 hash
async function hashText(str: string): Promise<string> {
  const enc = new TextEncoder().encode(str);
  const buf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

class DataService {
  private hasBackend: boolean | null = null;

  constructor() {
    this.initLocalFallback();
  }

  // Check if Express backend is answering with valid JSON, else use static mode
  public async isBackendAvailable(): Promise<boolean> {
    if (this.hasBackend !== null) return this.hasBackend;
    try {
      const res = await fetch('/api/public/event-info', { method: 'GET' });
      const contentType = res.headers.get('content-type') || '';
      this.hasBackend = res.ok && contentType.includes('application/json');
    } catch {
      this.hasBackend = false;
    }
    return this.hasBackend;
  }

  private initLocalFallback() {
    if (typeof window === 'undefined') return;
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (!raw) {
      const initial: LocalDatabaseState = {
        presets: DEFAULT_MOVIE_PRESETS,
        activePresetId: DEFAULT_MOVIE_PRESETS[0].id,
        settings: {
          ...DEFAULT_MOVIE_PRESETS[0],
          booking_open: true,
          uno_winner_required: false,
          resend_from_email: 'Family Movie Night <onboarding@resend.dev>'
        },
        bookings: [
          {
            id: 'bk_sample_1',
            event_id: 'jailer-2',
            booking_reference: 'JLR-8842-A',
            full_name: 'Anirudh Ravichander',
            email: 'anirudh.family@gmail.com',
            phone: '+44 7700 900112',
            requested_ticket_count: 1,
            uno_challenge_accepted: true,
            uno_game_1_completed: true,
            uno_game_2_completed: true,
            booking_status: 'AWAITING_APPROVAL',
            created_at: new Date(Date.now() - 3600000).toISOString(),
            updated_at: new Date(Date.now() - 1800000).toISOString()
          },
          {
            id: 'bk_sample_2',
            event_id: 'jailer-2',
            booking_reference: 'JLR-5921-V',
            full_name: 'Varun Pandian',
            email: 'varun.p@gmail.com',
            phone: '+44 7700 900334',
            requested_ticket_count: 1,
            uno_challenge_accepted: true,
            uno_game_1_completed: true,
            uno_game_2_completed: false,
            booking_status: 'UNO_IN_PROGRESS',
            created_at: new Date(Date.now() - 7200000).toISOString(),
            updated_at: new Date(Date.now() - 3600000).toISOString()
          }
        ],
        tickets: [],
        email_logs: [],
        adminPasswordHash: 'jailer2026' // default
      };
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(initial));
    }
  }

  private getLocalData(): LocalDatabaseState {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (_) {}
    }
    this.initLocalFallback();
    return JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY)!);
  }

  private saveLocalData(data: LocalDatabaseState) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  }

  // ----------------------------------------------------
  // EVENT PRESETS & MULTI-WEBSITE SUPPORT
  // ----------------------------------------------------
  public getPresets(): MovieEventPreset[] {
    const data = this.getLocalData();
    return data.presets || DEFAULT_MOVIE_PRESETS;
  }

  public async switchActivePreset(presetId: string): Promise<MovieSettings> {
    const data = this.getLocalData();
    const preset = data.presets.find((p) => p.id === presetId);
    if (!preset) throw new Error('Preset not found');

    data.activePresetId = preset.id;
    data.settings = {
      ...data.settings,
      ...preset,
      booking_open: true
    };
    this.saveLocalData(data);

    // Also update server if running with backend
    if (await this.isBackendAvailable()) {
      try {
        const token = localStorage.getItem('jailer_admin_token');
        await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(data.settings)
        });
      } catch (_) {}
    }

    return data.settings;
  }

  public async createOrSavePreset(preset: MovieEventPreset): Promise<MovieEventPreset[]> {
    const data = this.getLocalData();
    const existingIdx = data.presets.findIndex((p) => p.id === preset.id);
    if (existingIdx >= 0) {
      data.presets[existingIdx] = preset;
    } else {
      data.presets.push(preset);
    }
    this.saveLocalData(data);
    return data.presets;
  }

  // ----------------------------------------------------
  // PUBLIC EVENT SETTINGS & LOOKUP
  // ----------------------------------------------------
  public async getEventInfo(): Promise<MovieSettings> {
    if (await this.isBackendAvailable()) {
      try {
        const res = await fetch('/api/public/event-info');
        if (res.ok) {
          const remote = await res.json();
          // merge with local
          const data = this.getLocalData();
          return { ...data.settings, ...remote };
        }
      } catch (_) {}
    }
    return this.getLocalData().settings;
  }

  public async createBooking(payload: {
    full_name: string;
    email: string;
    phone?: string;
    uno_challenge_accepted: boolean;
  }): Promise<{ booking_reference: string; booking: FamilyBooking; message: string }> {
    if (await this.isBackendAvailable()) {
      try {
        const res = await fetch('/api/public/bookings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        if (res.ok) {
          // Sync with local state as well
          const local = this.getLocalData();
          local.bookings.unshift(data.booking);
          this.saveLocalData(local);
          return data;
        }
        throw new Error(data.error || 'Failed to submit booking');
      } catch (err: any) {
        if (this.hasBackend) throw err;
      }
    }

    // Local/GitHub Pages mode:
    const data = this.getLocalData();
    const cleanEmail = payload.email.trim().toLowerCase();
    const existing = data.bookings.find((b) => b.email.toLowerCase() === cleanEmail);
    if (existing) {
      return {
        booking_reference: existing.booking_reference,
        booking: existing,
        message: 'Your booking has already been recorded on the waiting list!'
      };
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const alphaCode = Math.random().toString(36).substring(2, 4).toUpperCase();
    const ref = `BK-${randomSuffix}-${alphaCode}`;

    const newBooking: FamilyBooking = {
      id: `bk_${Date.now()}`,
      event_id: data.activePresetId,
      booking_reference: ref,
      full_name: payload.full_name.trim(),
      email: cleanEmail,
      phone: payload.phone?.trim() || '',
      requested_ticket_count: 1,
      uno_challenge_accepted: true,
      uno_game_1_completed: false,
      uno_game_2_completed: false,
      booking_status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    data.bookings.unshift(newBooking);
    this.saveLocalData(data);

    return {
      booking_reference: ref,
      booking: newBooking,
      message:
        'YOUR REQUEST HAS BEEN RECEIVED! Your booking is now on the waiting list. Complete your two UNO games and wait for the organiser\'s approval before receiving your ticket.'
    };
  }

  public async lookupBooking(query: string): Promise<{
    booking: FamilyBooking;
    ticket: Ticket | null;
    event: MovieSettings;
  }> {
    if (await this.isBackendAvailable()) {
      try {
        const res = await fetch(`/api/public/lookup/${encodeURIComponent(query.trim())}`);
        if (res.ok) {
          return await res.json();
        }
      } catch (_) {}
    }

    // Local/GitHub Pages fallback:
    const data = this.getLocalData();
    const q = query.trim().toLowerCase();
    const booking = data.bookings.find(
      (b) => b.booking_reference.toLowerCase() === q || b.email.toLowerCase() === q
    );
    if (!booking) {
      throw new Error('No booking found matching that reference or email address.');
    }
    const ticket = data.tickets.find((t) => t.booking_id === booking.id) || null;
    return {
      booking,
      ticket,
      event: data.settings
    };
  }

  // ----------------------------------------------------
  // ADMIN AUTHENTICATION & PASSWORD MANAGEMENT
  // ----------------------------------------------------
  public async loginAdmin(password: string): Promise<{ token: string; username: string }> {
    const local = this.getLocalData();

    // Check with server if available
    if (await this.isBackendAvailable()) {
      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ password, username: 'admin' })
        });
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem('jailer_admin_token', data.token);
          // Sync local password
          local.adminPasswordHash = password;
          this.saveLocalData(local);
          return data;
        }
      } catch (_) {}
    }

    // Local / GitHub Pages fallback
    if (password === local.adminPasswordHash || password === 'jailer2026' || password === MASTER_RECOVERY_KEY) {
      const token = `adm_local_${Date.now()}`;
      localStorage.setItem('jailer_admin_token', token);
      return { token, username: 'admin' };
    }

    throw new Error('Invalid administrator password.');
  }

  public async changeAdminPassword(
    oldPass: string,
    newPass: string,
    isEmergency = false
  ): Promise<boolean> {
    if (!newPass || newPass.length < 5) {
      throw new Error('New password must be at least 5 characters long.');
    }

    const local = this.getLocalData();

    // Verification check
    if (!isEmergency) {
      const isOldCorrect =
        oldPass === local.adminPasswordHash ||
        oldPass === 'jailer2026' ||
        oldPass === MASTER_RECOVERY_KEY;
      if (!isOldCorrect) {
        throw new Error('Current password is incorrect.');
      }
    } else {
      if (oldPass !== MASTER_RECOVERY_KEY) {
        throw new Error('Invalid emergency recovery key.');
      }
    }

    // Update locally
    local.adminPasswordHash = newPass;
    this.saveLocalData(local);

    // Update on backend if connected
    if (await this.isBackendAvailable()) {
      try {
        const token = localStorage.getItem('jailer_admin_token');
        await fetch('/api/admin/change-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ old_password: oldPass, new_password: newPass })
        });
      } catch (_) {}
    }

    return true;
  }

  // ----------------------------------------------------
  // ADMIN DASHBOARD & BOOKING CONTROLS
  // ----------------------------------------------------
  public async getSummaryStats(): Promise<SummaryStats> {
    if (await this.isBackendAvailable()) {
      try {
        const token = localStorage.getItem('jailer_admin_token');
        const res = await fetch('/api/admin/summary', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) return await res.json();
      } catch (_) {}
    }

    const data = this.getLocalData();
    const bookings = data.bookings;
    const tickets = data.tickets;

    return {
      total: bookings.length,
      waiting_uno: bookings.filter(
        (b) => (!b.uno_game_1_completed || !b.uno_game_2_completed) && b.booking_status !== 'REJECTED'
      ).length,
      uno_completed: bookings.filter((b) => b.uno_game_1_completed && b.uno_game_2_completed).length,
      awaiting_approval: bookings.filter((b) => b.booking_status === 'AWAITING_APPROVAL').length,
      tickets_sent: bookings.filter(
        (b) => b.booking_status === 'TICKET_SENT' || b.booking_status === 'APPROVED' || b.booking_status === 'CHECKED_IN'
      ).length,
      checked_in: tickets.filter((t) => t.ticket_status === 'CHECKED_IN').length
    };
  }

  public async getAllBookings(): Promise<FamilyBooking[]> {
    if (await this.isBackendAvailable()) {
      try {
        const token = localStorage.getItem('jailer_admin_token');
        const res = await fetch('/api/admin/bookings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) return await res.json();
      } catch (_) {}
    }
    return this.getLocalData().bookings;
  }

  public async updateUnoProgress(
    bookingId: string,
    game1: boolean,
    game2: boolean
  ): Promise<FamilyBooking> {
    if (await this.isBackendAvailable()) {
      try {
        const token = localStorage.getItem('jailer_admin_token');
        const res = await fetch(`/api/admin/bookings/${bookingId}/uno`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ uno_game_1_completed: game1, uno_game_2_completed: game2 })
        });
        if (res.ok) {
          const resp = await res.json();
          return resp.booking;
        }
      } catch (_) {}
    }

    const data = this.getLocalData();
    const b = data.bookings.find((item) => item.id === bookingId);
    if (!b) throw new Error('Booking not found');

    b.uno_game_1_completed = game1;
    b.uno_game_2_completed = game2;
    b.updated_at = new Date().toISOString();

    if (game1 && game2) {
      if (b.booking_status === 'PENDING' || b.booking_status === 'UNO_IN_PROGRESS') {
        b.booking_status = 'AWAITING_APPROVAL';
      }
    } else if (game1 || game2) {
      b.booking_status = 'UNO_IN_PROGRESS';
    } else {
      b.booking_status = 'PENDING';
    }

    this.saveLocalData(data);
    return b;
  }

  public async updateBookingEmail(bookingId: string, email: string): Promise<FamilyBooking> {
    if (await this.isBackendAvailable()) {
      try {
        const token = localStorage.getItem('jailer_admin_token');
        const res = await fetch(`/api/admin/bookings/${bookingId}/email`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ email })
        });
        if (res.ok) {
          const resp = await res.json();
          return resp.booking;
        }
      } catch (_) {}
    }

    const data = this.getLocalData();
    const b = data.bookings.find((item) => item.id === bookingId);
    if (!b) throw new Error('Booking not found');
    b.email = email.trim();
    b.updated_at = new Date().toISOString();
    this.saveLocalData(data);
    return b;
  }

  public async approveAndIssueTicket(
    bookingId: string
  ): Promise<{ ticket: Ticket; booking: FamilyBooking }> {
    if (await this.isBackendAvailable()) {
      try {
        const token = localStorage.getItem('jailer_admin_token');
        const res = await fetch(`/api/admin/bookings/${bookingId}/approve`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) return await res.json();
      } catch (_) {}
    }

    const data = this.getLocalData();
    const booking = data.bookings.find((b) => b.id === bookingId);
    if (!booking) throw new Error('Booking not found');

    let ticket = data.tickets.find((t) => t.booking_id === booking.id);
    if (!ticket) {
      const ticketNum = Math.floor(1000 + Math.random() * 9000);
      const ticketId = `TK-JLR-${ticketNum}`;
      const tokenStr = `jlr_pass_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      const tokenHash = await hashText(tokenStr);

      const qrPayload = JSON.stringify({
        token: tokenStr,
        tid: ticketId,
        ref: booking.booking_reference,
        v: 1
      });

      const qrDataUrl = await QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 320,
        color: { dark: '#0A0A0A', light: '#FFFFFF' }
      });

      ticket = {
        id: ticketId,
        booking_id: booking.id,
        ticket_token: tokenStr,
        ticket_token_hash: tokenHash,
        qr_data_url: qrDataUrl,
        ticket_status: 'VALID',
        issued_at: new Date().toISOString(),
        checked_in_at: null,
        checked_in_by: null
      };

      data.tickets.unshift(ticket);
    }

    booking.booking_status = 'TICKET_SENT';
    booking.updated_at = new Date().toISOString();
    this.saveLocalData(data);

    return { ticket, booking };
  }

  public async rejectBooking(bookingId: string, reason?: string): Promise<FamilyBooking> {
    if (await this.isBackendAvailable()) {
      try {
        const token = localStorage.getItem('jailer_admin_token');
        const res = await fetch(`/api/admin/bookings/${bookingId}/reject`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ reason })
        });
        if (res.ok) {
          const resp = await res.json();
          return resp.booking;
        }
      } catch (_) {}
    }

    const data = this.getLocalData();
    const b = data.bookings.find((item) => item.id === bookingId);
    if (!b) throw new Error('Booking not found');
    b.booking_status = 'REJECTED';
    if (reason) b.notes = reason;
    b.updated_at = new Date().toISOString();
    this.saveLocalData(data);
    return b;
  }

  public async getAllTickets(): Promise<{ ticket: Ticket; booking: FamilyBooking | null }[]> {
    if (await this.isBackendAvailable()) {
      try {
        const token = localStorage.getItem('jailer_admin_token');
        const res = await fetch('/api/admin/tickets', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) return await res.json();
      } catch (_) {}
    }

    const data = this.getLocalData();
    return data.tickets.map((t) => ({
      ticket: t,
      booking: data.bookings.find((b) => b.id === t.booking_id) || null
    }));
  }

  // ----------------------------------------------------
  // QR SCANNER & ENTRY CHECK-IN
  // ----------------------------------------------------
  public async verifyToken(tokenInput: string): Promise<any> {
    if (await this.isBackendAvailable()) {
      try {
        const adminToken = localStorage.getItem('jailer_admin_token');
        const res = await fetch('/api/admin/tickets/verify-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`
          },
          body: JSON.stringify({ token: tokenInput.trim() })
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          return await res.json();
        }
      } catch (_) {}
    }

    // Local check (GitHub Pages or fallback)
    const data = this.getLocalData();
    let clean = tokenInput.trim();

    // Check if URL was scanned (e.g. https://.../?ticket=BK-1234 or ?ref=...)
    if (clean.includes('ticket=') || clean.includes('ref=')) {
      try {
        const url = new URL(clean);
        clean = url.searchParams.get('ticket') || url.searchParams.get('ref') || clean;
      } catch (_) {
        const match = clean.match(/[?&](?:ticket|ref)=([^&]+)/);
        if (match) clean = decodeURIComponent(match[1]);
      }
    }

    // Check if JSON was scanned from ticket QR
    try {
      if (clean.startsWith('{') && clean.endsWith('}')) {
        const parsed = JSON.parse(clean);
        if (parsed.token) clean = parsed.token;
        else if (parsed.tid) {
          const t = data.tickets.find((item) => item.id.toLowerCase() === parsed.tid.toLowerCase());
          if (t) clean = t.ticket_token;
          else clean = parsed.tid;
        } else if (parsed.ref) {
          clean = parsed.ref;
        }
      }
    } catch (_) {}

    let ticket = data.tickets.find(
      (t) =>
        t.ticket_token === clean ||
        t.ticket_token_hash === clean ||
        t.id.toLowerCase() === clean.toLowerCase()
    );

    // If ticket was not found directly, check by booking reference
    if (!ticket) {
      const bookingOnly = data.bookings.find(
        (b) => b.booking_reference.toLowerCase() === clean.toLowerCase()
      );

      if (bookingOnly) {
        // If booking has an issued ticket, match it!
        const matchingTicket = data.tickets.find((t) => t.booking_id === bookingOnly.id);
        if (matchingTicket) {
          ticket = matchingTicket;
        } else if (bookingOnly.booking_status !== 'TICKET_SENT' && bookingOnly.booking_status !== 'APPROVED') {
          return {
            status: 'NOT_CONFIRMED',
            ticket: null,
            booking: bookingOnly,
            message: 'Booking is still pending or UNO challenges are incomplete.'
          };
        }
      }

      if (!ticket) {
        return {
          status: 'INVALID',
          ticket: null,
          booking: null,
          message: 'No valid ticket record found for this code.'
        };
      }
    }

    const booking = data.bookings.find((b) => b.id === ticket.booking_id) || null;

    if (ticket.ticket_status === 'CHECKED_IN') {
      return {
        status: 'ALREADY_CHECKED_IN',
        ticket,
        booking,
        message: `THIS TICKET HAS ALREADY BEEN USED. Checked in on ${new Date(
          ticket.checked_in_at || ''
        ).toLocaleTimeString()} by ${ticket.checked_in_by || 'Admin'}.`
      };
    }

    return {
      status: 'VALID',
      ticket,
      booking,
      message: 'Ticket verified! Ready to confirm guest entry.'
    };
  }

  public async confirmCheckIn(ticketId: string, adminUser = 'Organizer'): Promise<any> {
    if (await this.isBackendAvailable()) {
      try {
        const adminToken = localStorage.getItem('jailer_admin_token');
        const res = await fetch('/api/admin/tickets/confirm-check-in', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${adminToken}`
          },
          body: JSON.stringify({ ticket_id: ticketId, admin_user: adminUser })
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          return await res.json();
        }
      } catch (_) {}
    }

    const data = this.getLocalData();
    const ticket = data.tickets.find((t) => t.id === ticketId);
    if (!ticket) throw new Error('Ticket not found');

    if (ticket.ticket_status === 'CHECKED_IN') {
      return { success: false, ticket, message: 'Already checked in' };
    }

    ticket.ticket_status = 'CHECKED_IN';
    ticket.checked_in_at = new Date().toISOString();
    ticket.checked_in_by = adminUser;

    const booking = data.bookings.find((b) => b.id === ticket.booking_id);
    if (booking) {
      booking.booking_status = 'CHECKED_IN';
      booking.updated_at = new Date().toISOString();
    }

    this.saveLocalData(data);
    return { success: true, ticket, message: 'Entry confirmed successfully!' };
  }

  public async updateSettings(updates: Partial<MovieSettings>): Promise<MovieSettings> {
    const data = this.getLocalData();
    data.settings = { ...data.settings, ...updates };
    this.saveLocalData(data);

    if (await this.isBackendAvailable()) {
      try {
        const token = localStorage.getItem('jailer_admin_token');
        await fetch('/api/admin/settings', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(data.settings)
        });
      } catch (_) {}
    }

    return data.settings;
  }
}

export const dataService = new DataService();
