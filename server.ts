import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { dbService } from './server/db.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Auth Middleware for /api/admin/*
function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Admin authentication token required.' });
    return;
  }
  const token = authHeader.split(' ')[1];
  if (!dbService.verifyAdminToken(token)) {
    res.status(403).json({ error: 'Forbidden: Invalid or expired admin session.' });
    return;
  }
  next();
}

// ----------------------------------------------------
// PUBLIC API ENDPOINTS
// ----------------------------------------------------

app.get('/api/public/event-info', (_req: Request, res: Response) => {
  const settings = dbService.getSettings();
  res.json({
    movie_title: settings.movie_title,
    event_name: settings.event_name,
    event_date: settings.event_date,
    event_time: settings.event_time,
    venue: settings.venue,
    trailer_url: settings.trailer_url,
    authorised_gallery_image_urls: settings.authorised_gallery_image_urls,
    booking_open: settings.booking_open,
    uno_winner_required: settings.uno_winner_required
  });
});

app.post('/api/public/bookings', (req: Request, res: Response) => {
  try {
    const { full_name, email, phone, uno_challenge_accepted } = req.body;

    const settings = dbService.getSettings();
    if (!settings.booking_open) {
      res.status(400).json({ error: 'Ticket requests are currently paused by the organizer.' });
      return;
    }

    if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
      res.status(400).json({ error: 'Please enter a valid full name.' });
      return;
    }

    if (!email || typeof email !== 'string' || !email.includes('@') || !email.includes('.')) {
      res.status(400).json({ error: 'Please enter a valid email address.' });
      return;
    }

    if (!uno_challenge_accepted) {
      res.status(400).json({ error: 'You must confirm and accept the UNO game challenge requirement.' });
      return;
    }

    const booking = dbService.createBooking({
      full_name,
      email,
      phone,
      uno_challenge_accepted
    });

    res.status(201).json({
      success: true,
      booking_reference: booking.booking_reference,
      booking,
      message: 'YOUR REQUEST HAS BEEN RECEIVED! Your booking is now on the waiting list. Complete your two UNO games and wait for the organiser\'s approval before receiving your ticket.'
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to submit booking request.' });
  }
});

app.get('/api/public/lookup/:query', (req: Request, res: Response) => {
  const query = req.params.query;
  if (!query) {
    res.status(400).json({ error: 'Search reference or email is required.' });
    return;
  }
  const result = dbService.getBookingByReferenceOrEmail(query);
  if (!result.booking) {
    res.status(404).json({ error: 'No booking found matching that reference or email address.' });
    return;
  }

  // Sanitize return data: don't leak private admin notes
  const settings = dbService.getSettings();
  res.json({
    booking: {
      booking_reference: result.booking.booking_reference,
      full_name: result.booking.full_name,
      email: result.booking.email,
      booking_status: result.booking.booking_status,
      uno_game_1_completed: result.booking.uno_game_1_completed,
      uno_game_2_completed: result.booking.uno_game_2_completed,
      created_at: result.booking.created_at
    },
    ticket: result.ticket ? {
      id: result.ticket.id,
      ticket_status: result.ticket.ticket_status,
      qr_data_url: result.ticket.qr_data_url,
      issued_at: result.ticket.issued_at,
      checked_in_at: result.ticket.checked_in_at
    } : null,
    event: {
      movie_title: settings.movie_title,
      event_name: settings.event_name,
      event_date: settings.event_date,
      event_time: settings.event_time,
      venue: settings.venue
    }
  });
});

// ----------------------------------------------------
// ADMIN AUTHENTICATION
// ----------------------------------------------------

app.post('/api/admin/login', (req: Request, res: Response) => {
  const { username = 'admin', password } = req.body;
  if (!password) {
    res.status(400).json({ error: 'Password is required' });
    return;
  }
  const token = dbService.authenticateAdmin(password, username);
  if (!token) {
    res.status(401).json({ error: 'Invalid administrator credentials.' });
    return;
  }
  res.json({ success: true, token, username });
});

app.post('/api/admin/logout', requireAdmin, (req: Request, res: Response) => {
  const token = req.headers.authorization!.split(' ')[1];
  dbService.invalidateAdminToken(token);
  res.json({ success: true, message: 'Logged out successfully.' });
});

app.post('/api/admin/change-password', requireAdmin, (req: Request, res: Response) => {
  const { old_password, new_password } = req.body;
  if (!old_password || !new_password || new_password.length < 6) {
    res.status(400).json({ error: 'New password must be at least 6 characters.' });
    return;
  }
  const ok = dbService.changeAdminPassword(old_password, new_password);
  if (!ok) {
    res.status(400).json({ error: 'Incorrect existing password.' });
    return;
  }
  res.json({ success: true, message: 'Password updated successfully. Please log in again.' });
});

// ----------------------------------------------------
// ADMIN DASHBOARD & BOOKING CONTROLS
// ----------------------------------------------------

app.get('/api/admin/summary', requireAdmin, (_req: Request, res: Response) => {
  const stats = dbService.getSummaryStats();
  res.json(stats);
});

app.get('/api/admin/bookings', requireAdmin, (_req: Request, res: Response) => {
  const bookings = dbService.getAllBookings();
  res.json(bookings);
});

app.patch('/api/admin/bookings/:id/uno', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { uno_game_1_completed, uno_game_2_completed } = req.body;
  const updated = dbService.updateUnoProgress(
    id,
    Boolean(uno_game_1_completed),
    Boolean(uno_game_2_completed)
  );
  if (!updated) {
    res.status(404).json({ error: 'Booking record not found.' });
    return;
  }
  res.json({ success: true, booking: updated });
});

app.patch('/api/admin/bookings/:id/email', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    res.status(400).json({ error: 'Invalid email address.' });
    return;
  }
  const updated = dbService.updateBookingEmail(id, email);
  if (!updated) {
    res.status(404).json({ error: 'Booking not found.' });
    return;
  }
  res.json({ success: true, booking: updated });
});

app.post('/api/admin/bookings/:id/approve', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const appUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const result = await dbService.approveAndIssueTicket(id, appUrl);
    res.json({
      success: true,
      ticket: result.ticket,
      booking: result.booking,
      emailResult: result.emailResult
    });
  } catch (err: any) {
    res.status(400).json({ error: err.message || 'Failed to approve booking.' });
  }
});

app.post('/api/admin/bookings/:id/reject', requireAdmin, (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const updated = dbService.rejectBooking(id, reason);
  if (!updated) {
    res.status(404).json({ error: 'Booking not found.' });
    return;
  }
  res.json({ success: true, booking: updated });
});

app.get('/api/admin/tickets', requireAdmin, (_req: Request, res: Response) => {
  const tickets = dbService.getAllTickets();
  res.json(tickets);
});

// ----------------------------------------------------
// QR SCANNER & ENTRY CHECK-IN
// ----------------------------------------------------

app.post('/api/admin/tickets/verify-token', requireAdmin, (req: Request, res: Response) => {
  const { token } = req.body;
  if (!token) {
    res.status(400).json({ error: 'QR Token or Ticket ID required.' });
    return;
  }
  const result = dbService.verifyQrTicket(token);
  res.json(result);
});

app.post('/api/admin/tickets/confirm-check-in', requireAdmin, (req: Request, res: Response) => {
  const { ticket_id, admin_user = 'Admin' } = req.body;
  if (!ticket_id) {
    res.status(400).json({ error: 'Ticket ID is required.' });
    return;
  }
  const result = dbService.confirmCheckIn(ticket_id, admin_user);
  if (!result.success) {
    res.status(400).json(result);
    return;
  }
  res.json(result);
});

// ----------------------------------------------------
// SETTINGS & EMAIL LOGS
// ----------------------------------------------------

app.get('/api/admin/settings', requireAdmin, (_req: Request, res: Response) => {
  res.json(dbService.getSettings());
});

app.put('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
  const updated = dbService.updateSettings(req.body);
  res.json({ success: true, settings: updated });
});

app.get('/api/admin/email-logs', requireAdmin, (_req: Request, res: Response) => {
  res.json(dbService.getEmailLogs());
});

app.post('/api/admin/send-test-email', requireAdmin, async (req: Request, res: Response) => {
  const { test_email } = req.body;
  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) {
    res.status(400).json({
      error: 'RESEND_API_KEY is not configured in the environment. Please add it to your server environment or .env file.'
    });
    return;
  }

  const targetEmail = test_email || 'test@example.com';
  const settings = dbService.getSettings();

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: settings.resend_from_email || 'Jailer 2 Premiere <onboarding@resend.dev>',
        to: [targetEmail],
        subject: 'Test Delivery: Jailer 2 Premiere Ticket Service',
        html: `<h2>Jailer 2 Email Service Active!</h2><p>This is a verified test email from the Jailer 2 Family Movie Night Booking System.</p>`
      })
    });

    const data = await resendRes.json() as any;
    if (!resendRes.ok) {
      throw new Error(data?.message || `HTTP ${resendRes.status}`);
    }

    res.json({ success: true, message: `Test email dispatched successfully to ${targetEmail}!`, data });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to dispatch test email.' });
  }
});

// ----------------------------------------------------
// FRONTEND INTEGRATION (Vite in Dev, Dist in Prod)
// ----------------------------------------------------

async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Dynamic import vite for dev server middleware
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(port, () => {
    console.log(`🎬 Jailer 2 Movie Night server active on http://0.0.0.0:${port}`);
  });
}

startServer().catch(err => {
  console.error('Fatal error starting server:', err);
  process.exit(1);
});
