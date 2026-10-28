export interface FamilyBooking {
  id: string;
  event_id?: string;
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
  event_id?: string;
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
  id?: string;
  movie_title: string;
  event_name: string;
  tagline?: string;
  event_date: string;
  event_time: string;
  venue: string;
  hero_image_url?: string;
  trailer_url: string;
  authorised_gallery_image_urls: string[];
  challenge_name?: string; // e.g. "UNO Challenge" or "Movie Trivia" or "Mario Kart"
  challenge_game1_label?: string; // e.g. "UNO Game 1"
  challenge_game2_label?: string; // e.g. "UNO Game 2"
  booking_open: boolean;
  uno_winner_required: boolean;
  resend_from_email: string;
  resend_api_key_configured?: boolean;
}

export interface MovieEventPreset {
  id: string;
  movie_title: string;
  event_name: string;
  tagline: string;
  hero_image_url: string;
  event_date: string;
  event_time: string;
  venue: string;
  trailer_url: string;
  challenge_name: string;
  challenge_game1_label: string;
  challenge_game2_label: string;
  authorised_gallery_image_urls: string[];
}

export interface SummaryStats {
  total: number;
  waiting_uno: number;
  uno_completed: number;
  awaiting_approval: number;
  tickets_sent: number;
  checked_in: number;
}
