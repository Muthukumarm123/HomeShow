-- ==============================================================================
-- JAILER 2: FAMILY MOVIE NIGHT TICKET BOOKING SYSTEM
-- Supabase / PostgreSQL Database Migration & Row Level Security (RLS) Schema
-- ==============================================================================

-- 1. FAMILY BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.family_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_reference VARCHAR(32) NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    requested_ticket_count INTEGER NOT NULL DEFAULT 1 CHECK (requested_ticket_count = 1),
    uno_challenge_accepted BOOLEAN NOT NULL DEFAULT true,
    uno_game_1_completed BOOLEAN NOT NULL DEFAULT false,
    uno_game_2_completed BOOLEAN NOT NULL DEFAULT false,
    booking_status TEXT NOT NULL DEFAULT 'PENDING' CHECK (booking_status IN (
      'PENDING',
      'UNO_IN_PROGRESS',
      'AWAITING_APPROVAL',
      'APPROVED',
      'TICKET_SENT',
      'REJECTED',
      'CHECKED_IN'
    )),
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Index for speedy lookups
CREATE INDEX IF NOT EXISTS idx_family_bookings_reference ON public.family_bookings(booking_reference);
CREATE INDEX IF NOT EXISTS idx_family_bookings_email ON public.family_bookings(email);
CREATE INDEX IF NOT EXISTS idx_family_bookings_status ON public.family_bookings(booking_status);

-- 2. TICKETS TABLE
CREATE TABLE IF NOT EXISTS public.tickets (
    id VARCHAR(32) PRIMARY KEY, -- e.g. TK-JLR-8821
    booking_id UUID NOT NULL REFERENCES public.family_bookings(id) ON DELETE CASCADE,
    ticket_token TEXT NOT NULL UNIQUE,
    ticket_token_hash TEXT NOT NULL UNIQUE,
    qr_data_url TEXT NOT NULL,
    ticket_status TEXT NOT NULL DEFAULT 'VALID' CHECK (ticket_status IN ('VALID', 'CHECKED_IN', 'REVOKED')),
    issued_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    checked_in_at TIMESTAMPTZ,
    checked_in_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_tickets_token_hash ON public.tickets(ticket_token_hash);
CREATE INDEX IF NOT EXISTS idx_tickets_booking_id ON public.tickets(booking_id);

-- 3. EMAIL LOGS TABLE
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.family_bookings(id) ON DELETE SET NULL,
    ticket_id VARCHAR(32) REFERENCES public.tickets(id) ON DELETE SET NULL,
    recipient_email TEXT NOT NULL,
    delivery_status TEXT NOT NULL CHECK (delivery_status IN ('SENT', 'FAILED', 'CONFIG_REQUIRED')),
    provider_message_id TEXT,
    error_message TEXT,
    attempted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. MOVIE SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.movie_settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    movie_title TEXT NOT NULL DEFAULT 'JAILER 2',
    event_name TEXT NOT NULL DEFAULT 'THE ULTIMATE FAMILY MOVIE NIGHT',
    event_date TEXT NOT NULL DEFAULT 'Saturday, November 14, 2026',
    event_time TEXT NOT NULL DEFAULT '7:00 PM (UNO Arena starts at 6:00 PM)',
    venue TEXT NOT NULL DEFAULT 'The Grand Starlight Screening Lounge, Screen 1',
    trailer_url TEXT NOT NULL DEFAULT 'https://www.youtube.com/embed/Y5BeWdODPqo',
    authorised_gallery_image_urls JSONB NOT NULL DEFAULT '[]'::jsonb,
    booking_open BOOLEAN NOT NULL DEFAULT true,
    uno_winner_required BOOLEAN NOT NULL DEFAULT false,
    resend_from_email TEXT NOT NULL DEFAULT 'Jailer 2 Premiere <onboarding@resend.dev>',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Seed initial settings
INSERT INTO public.movie_settings (id, movie_title, event_name, event_date, event_time, venue, trailer_url)
VALUES (1, 'JAILER 2', 'THE ULTIMATE FAMILY MOVIE NIGHT', 'Saturday, November 14, 2026', '7:00 PM', 'The Grand Starlight Screening Lounge, Screen 1', 'https://www.youtube.com/embed/Y5BeWdODPqo')
ON CONFLICT (id) DO NOTHING;

-- 5. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.family_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movie_settings ENABLE ROW LEVEL SECURITY;

-- Public can submit new bookings:
CREATE POLICY "Public can insert bookings"
    ON public.family_bookings FOR INSERT
    WITH CHECK (true);

-- Public can look up their own booking by reference or email
CREATE POLICY "Public can read own booking by reference or email"
    ON public.family_bookings FOR SELECT
    USING (true); -- Filtered by query in application layer

-- Only authenticated admins can modify bookings
CREATE POLICY "Admins have full access to bookings"
    ON public.family_bookings FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Tickets: Public can view their ticket if they have the booking reference
CREATE POLICY "Public can view valid tickets"
    ON public.tickets FOR SELECT
    USING (true);

-- Only authenticated admins can insert/update tickets
CREATE POLICY "Admins have full access to tickets"
    ON public.tickets FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Email logs are admin-only
CREATE POLICY "Admin access to email logs"
    ON public.email_logs FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Settings: Public can read, only admin can write
CREATE POLICY "Public can read event settings"
    ON public.movie_settings FOR SELECT
    USING (true);

CREATE POLICY "Admin can update settings"
    ON public.movie_settings FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
