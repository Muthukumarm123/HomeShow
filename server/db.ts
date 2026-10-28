import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import QRCode from 'qrcode';

export interface FamilyBooking {
  id: string;
  booking_reference: string;
  full_name: string;
  email: string;
  phone?: string;
  requested_ticket_count: number;
  uno_challenge_accepted: boolean;
  uno_game_1_completed: boolean;
  uno_game_2_completed: boolean;
  booking_status: 'PENDING' | 'UNO_IN_PROGRESS' | 'AWAITING_APPROVAL' | 'APPROVED' | 'TICKET_SENT' | 'REJECTED' | 'CHECKED_IN';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Ticket {
  id: string;
  booking_id: string;
  ticket_token: string;
  ticket_token_hash: string;
  qr_data_url: string;
  ticket_status: 'VALID' | 'CHECKED_IN' | 'REVOKED';
  issued_at: string;
  checked_in_at: string | null;
  checked_in_by: string | null;
}

export interface EmailLog {
  id: string;
  booking_id: string;
  ticket_id: string;
  recipient_email: string;
  delivery_status: 'SENT' | 'FAILED' | 'CONFIG_REQUIRED';
  provider_message_id: string | null;
  error_message: string | null;
  attempted_at: string;
}

export interface MovieSettings {
  movie_title: string;
  event_name: string;
  event_date: string;
  event_time: string;
  venue: string;
  trailer_url: string;
  authorised_gallery_image_urls: string[];
  booking_open: boolean;
  uno_winner_required: boolean;
  resend_from_email: string;
}

export interface AdminUser {
  id: string;
  username: string;
  password_hash: string;
  salt: string;
  created_at: string;
  sessions: string[];
}

export interface AppDatabase {
  bookings: FamilyBooking[];
  tickets: Ticket[];
  email_logs: EmailLog[];
  settings: MovieSettings;
  admins: AdminUser[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'jailer_db.json');

const DEFAULT_SETTINGS: MovieSettings = {
  movie_title: 'JAILER 2',
  event_name: 'THE ULTIMATE FAMILY MOVIE NIGHT',
  event_date: 'Saturday, November 14, 2026',
  event_time: '7:00 PM (UNO Arena starts at 6:00 PM)',
  venue: 'The Grand Starlight Screening Lounge, Screen 1',
  trailer_url: 'https://www.youtube.com/embed/Y5BeWdODPqo',
  authorised_gallery_image_urls: [
    '/src/assets/images/jailer_hero_cinematic_1793199448445.jpg',
    '/src/assets/images/jailer_uno_arena_1793199450537.jpg',
    '/src/assets/images/jailer_movie_still_action_1793199450458.jpg'
  ],
  booking_open: true,
  uno_winner_required: false,
  resend_from_email: process.env.RESEND_FROM_EMAIL || 'Jailer 2 Premiere <onboarding@resend.dev>'
};

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

export class DatabaseService {
  private db: AppDatabase;
  private isSaving = false;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    this.db = this.load();
    this.ensureInitialAdmin();
  }

  private load(): AppDatabase {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const data = JSON.parse(raw);
        return {
          bookings: data.bookings || [],
          tickets: data.tickets || [],
          email_logs: data.email_logs || [],
          settings: { ...DEFAULT_SETTINGS, ...(data.settings || {}) },
          admins: data.admins || []
        };
      }
    } catch (err) {
      console.error('Failed to read db file, initializing fresh:', err);
    }

    return {
      bookings: [],
      tickets: [],
      email_logs: [],
      settings: DEFAULT_SETTINGS,
      admins: []
    };
  }

  private save(): void {
    if (this.isSaving) return;
    this.isSaving = true;
    try {
      const tempPath = `${DB_FILE}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.db, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Error saving db:', err);
    } finally {
      this.isSaving = false;
    }
  }

  private ensureInitialAdmin(): void {
    if (this.db.admins.length === 0) {
      const initialPass = process.env.ADMIN_INIT_PASSWORD || 'jailer2026';
      const salt = crypto.randomBytes(16).toString('hex');
      const password_hash = hashPassword(initialPass, salt);
      this.db.admins.push({
        id: 'admin_master_1',
        username: 'admin',
        password_hash,
        salt,
        created_at: new Date().toISOString(),
        sessions: []
      });
      this.save();
      console.log('✅ Initial administrator provisioned: username "admin", password "jailer2026" (or ADMIN_INIT_PASSWORD)');
    }
  }

  // Admin Auth
  public authenticateAdmin(password: string, username = 'admin'): string | null {
    const admin = this.db.admins.find(a => a.username.toLowerCase() === username.toLowerCase());
    if (!admin) return null;
    const computedHash = hashPassword(password, admin.salt);
    if (computedHash === admin.password_hash) {
      const token = `adm_${crypto.randomBytes(32).toString('hex')}`;
      admin.sessions.push(token);
      // keep last 10 sessions max
      if (admin.sessions.length > 10) admin.sessions = admin.sessions.slice(-10);
      this.save();
      return token;
    }
    return null;
  }

  public verifyAdminToken(token: string): boolean {
    if (!token) return false;
    return this.db.admins.some(admin => admin.sessions.includes(token));
  }

  public invalidateAdminToken(token: string): void {
    this.db.admins.forEach(admin => {
      admin.sessions = admin.sessions.filter(s => s !== token);
    });
    this.save();
  }

  public changeAdminPassword(oldPass: string, newPass: string): boolean {
    const admin = this.db.admins[0];
    if (!admin) return false;
    const computed = hashPassword(oldPass, admin.salt);
    if (computed !== admin.password_hash) return false;
    const newSalt = crypto.randomBytes(16).toString('hex');
    admin.salt = newSalt;
    admin.password_hash = hashPassword(newPass, newSalt);
    admin.sessions = []; // log out other sessions
    this.save();
    return true;
  }

  // Public Booking
  public createBooking(data: {
    full_name: string;
    email: string;
    phone?: string;
    uno_challenge_accepted: boolean;
  }): FamilyBooking {
    const cleanEmail = data.email.trim().toLowerCase();
    
    // Check if booking already exists for this email
    const existing = this.db.bookings.find(b => b.email.toLowerCase() === cleanEmail);
    if (existing) {
      return existing;
    }

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const alphaCode = crypto.randomBytes(1).toString('hex').toUpperCase();
    const ref = `JLR-${randomSuffix}-${alphaCode}`;

    const newBooking: FamilyBooking = {
      id: `bk_${crypto.randomBytes(8).toString('hex')}`,
      booking_reference: ref,
      full_name: data.full_name.trim(),
      email: cleanEmail,
      phone: data.phone?.trim() || '',
      requested_ticket_count: 1, // Enforced 1 per person policy
      uno_challenge_accepted: !!data.uno_challenge_accepted,
      uno_game_1_completed: false,
      uno_game_2_completed: false,
      booking_status: 'PENDING',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    this.db.bookings.unshift(newBooking);
    this.save();
    return newBooking;
  }

  public getBookingByReferenceOrEmail(identifier: string): {
    booking: FamilyBooking | null;
    ticket: Ticket | null;
  } {
    const q = identifier.trim().toLowerCase();
    const booking = this.db.bookings.find(
      b => b.booking_reference.toLowerCase() === q || b.email.toLowerCase() === q
    );
    if (!booking) return { booking: null, ticket: null };
    const ticket = this.db.tickets.find(t => t.booking_id === booking.id) || null;
    return { booking, ticket };
  }

  // Admin Booking Management
  public getAllBookings(): FamilyBooking[] {
    return [...this.db.bookings];
  }

  public updateUnoProgress(
    bookingId: string,
    game1: boolean,
    game2: boolean
  ): FamilyBooking | null {
    const booking = this.db.bookings.find(b => b.id === bookingId);
    if (!booking) return null;

    booking.uno_game_1_completed = game1;
    booking.uno_game_2_completed = game2;
    booking.updated_at = new Date().toISOString();

    if (game1 && game2) {
      if (booking.booking_status === 'PENDING' || booking.booking_status === 'UNO_IN_PROGRESS') {
        booking.booking_status = 'AWAITING_APPROVAL';
      }
    } else if (game1 || game2) {
      if (booking.booking_status === 'PENDING') {
        booking.booking_status = 'UNO_IN_PROGRESS';
      }
    } else {
      if (booking.booking_status === 'UNO_IN_PROGRESS' || booking.booking_status === 'AWAITING_APPROVAL') {
        booking.booking_status = 'PENDING';
      }
    }

    this.save();
    return booking;
  }

  public updateBookingEmail(bookingId: string, newEmail: string): FamilyBooking | null {
    const booking = this.db.bookings.find(b => b.id === bookingId);
    if (!booking) return null;
    booking.email = newEmail.trim().toLowerCase();
    booking.updated_at = new Date().toISOString();
    this.save();
    return booking;
  }

  public rejectBooking(bookingId: string, reason?: string): FamilyBooking | null {
    const booking = this.db.bookings.find(b => b.id === bookingId);
    if (!booking) return null;
    booking.booking_status = 'REJECTED';
    if (reason) booking.notes = reason;
    booking.updated_at = new Date().toISOString();
    this.save();
    return booking;
  }

  public async approveAndIssueTicket(
    bookingId: string,
    appUrl: string
  ): Promise<{ ticket: Ticket; booking: FamilyBooking; emailResult: EmailLog }> {
    const booking = this.db.bookings.find(b => b.id === bookingId);
    if (!booking) {
      throw new Error('Booking not found');
    }

    if (!booking.uno_game_1_completed || !booking.uno_game_2_completed) {
      throw new Error('Both UNO games must be completed before ticket approval');
    }

    // Atomic idempotency check: check if ticket already issued
    let ticket = this.db.tickets.find(t => t.booking_id === booking.id);
    if (!ticket) {
      const ticketNum = Math.floor(1000 + Math.random() * 9000);
      const ticketId = `TK-JLR-${ticketNum}`;
      const token = `jlr_pass_${crypto.randomBytes(24).toString('hex')}`;
      const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

      // The QR code contains an opaque, secure token payload
      // Scanner will read this payload (e.g. JSON or secure URL)
      const qrPayload = JSON.stringify({
        token,
        tid: ticketId,
        ref: booking.booking_reference,
        v: 1
      });

      const qrDataUrl = await QRCode.toDataURL(qrPayload, {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 320,
        color: {
          dark: '#0A0A0A',
          light: '#FFFFFF'
        }
      });

      ticket = {
        id: ticketId,
        booking_id: booking.id,
        ticket_token: token,
        ticket_token_hash: tokenHash,
        qr_data_url: qrDataUrl,
        ticket_status: 'VALID',
        issued_at: new Date().toISOString(),
        checked_in_at: null,
        checked_in_by: null
      };

      this.db.tickets.unshift(ticket);
    }

    booking.booking_status = 'APPROVED';
    booking.updated_at = new Date().toISOString();

    // Trigger Email Delivery
    const emailResult = await this.deliverTicketEmail(booking, ticket, appUrl);

    if (emailResult.delivery_status === 'SENT' || emailResult.delivery_status === 'CONFIG_REQUIRED') {
      booking.booking_status = 'TICKET_SENT';
    }

    this.save();
    return { ticket, booking, emailResult };
  }

  public async deliverTicketEmail(
    booking: FamilyBooking,
    ticket: Ticket,
    appUrl: string
  ): Promise<EmailLog> {
    const resendApiKey = process.env.RESEND_API_KEY;
    const fromEmail = this.db.settings.resend_from_email || 'Jailer 2 Premiere <onboarding@resend.dev>';
    const emailLogId = `eml_${crypto.randomBytes(8).toString('hex')}`;

    if (!resendApiKey) {
      const log: EmailLog = {
        id: emailLogId,
        booking_id: booking.id,
        ticket_id: ticket.id,
        recipient_email: booking.email,
        delivery_status: 'CONFIG_REQUIRED',
        provider_message_id: null,
        error_message: 'RESEND_API_KEY is not set. Ticket generated and ready for direct in-app display and download.',
        attempted_at: new Date().toISOString()
      };
      this.db.email_logs.unshift(log);
      this.save();
      return log;
    }

    // Call Resend API
    try {
      const htmlBody = this.generateTicketEmailHtml(booking, ticket);
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: fromEmail,
          to: [booking.email],
          subject: 'Your Jailer 2 Family Movie Night Ticket!',
          html: htmlBody
        })
      });

      const resData = await res.json() as any;

      if (!res.ok) {
        throw new Error(resData?.message || `Resend error: HTTP ${res.status}`);
      }

      const log: EmailLog = {
        id: emailLogId,
        booking_id: booking.id,
        ticket_id: ticket.id,
        recipient_email: booking.email,
        delivery_status: 'SENT',
        provider_message_id: resData?.id || 'resend_ok',
        error_message: null,
        attempted_at: new Date().toISOString()
      };
      this.db.email_logs.unshift(log);
      this.save();
      return log;
    } catch (err: any) {
      const log: EmailLog = {
        id: emailLogId,
        booking_id: booking.id,
        ticket_id: ticket.id,
        recipient_email: booking.email,
        delivery_status: 'FAILED',
        provider_message_id: null,
        error_message: err.message || 'Unknown network error during email delivery',
        attempted_at: new Date().toISOString()
      };
      this.db.email_logs.unshift(log);
      this.save();
      return log;
    }
  }

  private generateTicketEmailHtml(booking: FamilyBooking, ticket: Ticket): string {
    const s = this.db.settings;
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Your Jailer 2 Movie Night Ticket</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0B0B0C; color: #FFFFFF; margin: 0; padding: 24px; }
    .card { max-width: 540px; margin: 0 auto; background-color: #141416; border: 1px solid #B45309; border-radius: 12px; overflow: hidden; }
    .header { background: linear-gradient(180deg, #7F1D1D 0%, #141416 100%); padding: 32px 24px; text-align: center; }
    .title { font-size: 28px; font-weight: 900; letter-spacing: 2px; color: #F59E0B; margin: 0; }
    .subtitle { font-size: 13px; letter-spacing: 1.5px; color: #FCA5A5; margin-top: 6px; text-transform: uppercase; }
    .content { padding: 24px; font-size: 15px; line-height: 1.6; color: #E5E7EB; }
    .ticket-box { background: #080808; border: 1px dashed #D97706; border-radius: 8px; padding: 20px; margin: 20px 0; text-align: center; }
    .qr-img { width: 220px; height: 220px; border-radius: 6px; margin: 12px auto; display: block; background: #FFFFFF; padding: 8px; }
    .meta-row { display: flex; justify-content: space-between; border-bottom: 1px solid #262626; padding: 8px 0; font-size: 14px; text-align: left; }
    .meta-label { color: #9CA3AF; }
    .meta-val { color: #FFFFFF; font-weight: 600; }
    .footer { text-align: center; padding: 20px; font-size: 12px; color: #6B7280; border-top: 1px solid #1F2937; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <h1 class="title">${s.movie_title}</h1>
      <div class="subtitle">${s.event_name}</div>
    </div>
    <div class="content">
      <p style="font-size: 18px; color: #F59E0B; font-weight: bold; margin-top: 0;">Congratulations ${booking.full_name}!</p>
      <p>Your Jailer 2 Family Movie Night ticket has been approved after completing your UNO challenge. We look forward to an epic family movie night!</p>
      
      <div class="ticket-box">
        <div style="font-size: 11px; letter-spacing: 2px; color: #10B981; font-weight: bold; margin-bottom: 8px;">CONFIRMED ENTRY PASS</div>
        <img class="qr-img" src="${ticket.qr_data_url}" alt="Ticket QR Code" />
        <div style="font-size: 12px; color: #9CA3AF; margin-top: 8px;">Show this QR code to the organiser at the lounge door.</div>
      </div>

      <div style="margin: 16px 0;">
        <div class="meta-row"><span class="meta-label">Ticket Holder:</span><span class="meta-val">${booking.full_name}</span></div>
        <div class="meta-row"><span class="meta-label">Ticket ID:</span><span class="meta-val">${ticket.id}</span></div>
        <div class="meta-row"><span class="meta-label">Booking Reference:</span><span class="meta-val">${booking.booking_reference}</span></div>
        <div class="meta-row"><span class="meta-label">Date:</span><span class="meta-val">${s.event_date}</span></div>
        <div class="meta-row"><span class="meta-label">Time:</span><span class="meta-val">${s.event_time}</span></div>
        <div class="meta-row"><span class="meta-label">Venue:</span><span class="meta-val">${s.venue}</span></div>
      </div>

      <p style="font-size: 13px; color: #9CA3AF;">Please arrive with your family early to secure prime cinema seating. Two UNO Games. One Epic Movie Night.</p>
    </div>
    <div class="footer">
      JAILER 2 Family Movie Night &copy; 2026. Private Family Event Pass.
    </div>
  </div>
</body>
</html>
`;
  }

  // QR Code Verification & Check-in
  public verifyQrTicket(tokenOrData: string): {
    status: 'VALID' | 'ALREADY_CHECKED_IN' | 'INVALID' | 'NOT_CONFIRMED';
    ticket: Ticket | null;
    booking: FamilyBooking | null;
    message: string;
  } {
    let cleanToken = tokenOrData.trim();

    // Check if URL was scanned (e.g. ?ticket=... or ?ref=...)
    if (cleanToken.includes('ticket=') || cleanToken.includes('ref=')) {
      try {
        const url = new URL(cleanToken);
        cleanToken = url.searchParams.get('ticket') || url.searchParams.get('ref') || cleanToken;
      } catch (_) {
        const match = cleanToken.match(/[?&](?:ticket|ref)=([^&]+)/);
        if (match) cleanToken = decodeURIComponent(match[1]);
      }
    }
    
    // Check if tokenOrData is JSON from QR
    try {
      if (cleanToken.startsWith('{') && cleanToken.endsWith('}')) {
        const parsed = JSON.parse(cleanToken);
        if (parsed.token) cleanToken = parsed.token;
        else if (parsed.tid) {
          const t = this.db.tickets.find(item => item.id.toLowerCase() === parsed.tid.toLowerCase());
          if (t) cleanToken = t.ticket_token;
          else cleanToken = parsed.tid;
        } else if (parsed.ref) {
          cleanToken = parsed.ref;
        }
      }
    } catch (_) {}

    // Lookup ticket by token, token hash, or ticket id
    let ticket = this.db.tickets.find(
      t => t.ticket_token === cleanToken ||
           t.ticket_token_hash === cleanToken ||
           t.id.toLowerCase() === cleanToken.toLowerCase()
    );

    if (!ticket) {
      // Check if user entered a booking reference
      const bookingOnly = this.db.bookings.find(
        b => b.booking_reference.toLowerCase() === cleanToken.toLowerCase()
      );

      if (bookingOnly) {
        const matchingTicket = this.db.tickets.find(t => t.booking_id === bookingOnly.id);
        if (matchingTicket) {
          ticket = matchingTicket;
        } else if (bookingOnly.booking_status !== 'APPROVED' && bookingOnly.booking_status !== 'TICKET_SENT' && bookingOnly.booking_status !== 'CHECKED_IN') {
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

    const booking = this.db.bookings.find(b => b.id === ticket.booking_id) || null;

    if (ticket.ticket_status === 'CHECKED_IN') {
      return {
        status: 'ALREADY_CHECKED_IN',
        ticket,
        booking,
        message: `THIS TICKET HAS ALREADY BEEN USED. Checked in on ${new Date(ticket.checked_in_at || '').toLocaleTimeString()} by ${ticket.checked_in_by || 'Admin'}.`
      };
    }

    return {
      status: 'VALID',
      ticket,
      booking,
      message: 'Ticket verified! Ready to confirm guest entry.'
    };
  }

  // Atomic check-in
  public confirmCheckIn(ticketId: string, adminUser = 'Organizer'): {
    success: boolean;
    ticket: Ticket | null;
    message: string;
  } {
    const ticket = this.db.tickets.find(t => t.id === ticketId);
    if (!ticket) {
      return { success: false, ticket: null, message: 'Ticket not found' };
    }

    // Atomic prevent duplicate check-in
    if (ticket.ticket_status === 'CHECKED_IN') {
      return {
        success: false,
        ticket,
        message: `Already checked in at ${ticket.checked_in_at}`
      };
    }

    ticket.ticket_status = 'CHECKED_IN';
    ticket.checked_in_at = new Date().toISOString();
    ticket.checked_in_by = adminUser;

    const booking = this.db.bookings.find(b => b.id === ticket.booking_id);
    if (booking) {
      booking.booking_status = 'CHECKED_IN';
      booking.updated_at = new Date().toISOString();
    }

    this.save();
    return { success: true, ticket, message: 'Entry confirmed successfully!' };
  }

  // Settings
  public getSettings(): MovieSettings & { resend_api_key_configured: boolean } {
    return {
      ...this.db.settings,
      resend_api_key_configured: !!process.env.RESEND_API_KEY
    };
  }

  public updateSettings(updates: Partial<MovieSettings>): MovieSettings {
    this.db.settings = {
      ...this.db.settings,
      ...updates
    };
    this.save();
    return this.db.settings;
  }

  // Statistics
  public getSummaryStats() {
    const bookings = this.db.bookings;
    const tickets = this.db.tickets;

    const total = bookings.length;
    const waiting_uno = bookings.filter(b => (!b.uno_game_1_completed || !b.uno_game_2_completed) && b.booking_status !== 'REJECTED').length;
    const uno_completed = bookings.filter(b => b.uno_game_1_completed && b.uno_game_2_completed).length;
    const awaiting_approval = bookings.filter(b => b.booking_status === 'AWAITING_APPROVAL').length;
    const tickets_sent = bookings.filter(b => b.booking_status === 'TICKET_SENT' || b.booking_status === 'APPROVED' || b.booking_status === 'CHECKED_IN').length;
    const checked_in = tickets.filter(t => t.ticket_status === 'CHECKED_IN').length;

    return {
      total,
      waiting_uno,
      uno_completed,
      awaiting_approval,
      tickets_sent,
      checked_in
    };
  }

  public getAllTickets(): { ticket: Ticket; booking: FamilyBooking | null }[] {
    return this.db.tickets.map(t => ({
      ticket: t,
      booking: this.db.bookings.find(b => b.id === t.booking_id) || null
    }));
  }

  public getEmailLogs(): EmailLog[] {
    return [...this.db.email_logs];
  }
}

export const dbService = new DatabaseService();
