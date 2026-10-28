/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { HeroSection } from './components/HeroSection.tsx';
import { TrailerSection } from './components/TrailerSection.tsx';
import { GallerySection } from './components/GallerySection.tsx';
import { UnoRulesSection } from './components/UnoRulesSection.tsx';
import { Footer } from './components/Footer.tsx';
import { BookingFormModal } from './components/BookingFormModal.tsx';
import { LookupModal } from './components/LookupModal.tsx';
import { AdminPortal } from './components/admin/AdminPortal.tsx';
import { MovieSettings } from './types.ts';
import { dataService, DEFAULT_MOVIE_PRESETS } from './services/dataService.ts';

const FALLBACK_SETTINGS: MovieSettings = {
  ...DEFAULT_MOVIE_PRESETS[0],
  booking_open: true,
  uno_winner_required: false,
  resend_from_email: 'Jailer 2 Premiere <onboarding@resend.dev>'
};

export default function App() {
  const [settings, setSettings] = useState<MovieSettings>(FALLBACK_SETTINGS);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isLookupOpen, setIsLookupOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [lookupRef, setLookupRef] = useState<string>('');

  useEffect(() => {
    dataService.getEventInfo()
      .then((data) => {
        if (data && data.movie_title) {
          setSettings(data);
        }
      })
      .catch((err) => {
        console.warn('Could not fetch initial event settings:', err);
      });

    // Auto-open attendee ticket if URL has ?ticket=REF or ?ref=REF or ?booking=REF
    try {
      const params = new URLSearchParams(window.location.search);
      const ticketParam = params.get('ticket') || params.get('ref') || params.get('booking');
      if (ticketParam && ticketParam.trim()) {
        setLookupRef(ticketParam.trim());
        setIsLookupOpen(true);
      }
    } catch (e) {
      console.warn('Could not parse URL params', e);
    }
  }, []);

  const handleScrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenStatusForRef = (ref: string) => {
    setLookupRef(ref);
    setIsLookupOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#070708] text-neutral-100 flex flex-col selection:bg-amber-400 selection:text-black">
      {/* Cinematic Top Bar with Dynamic Movie Title */}
      <Header
        movieTitle={settings.movie_title}
        challengeName={settings.challenge_name || 'UNO Challenge'}
        onOpenBooking={() => setIsBookingOpen(true)}
        onOpenLookup={() => {
          setLookupRef('');
          setIsLookupOpen(true);
        }}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onScrollToSection={handleScrollToSection}
      />

      {/* Main Content Sections */}
      <main className="flex-1">
        {/* 1. Hero Section */}
        <HeroSection
          settings={settings}
          onBookTickets={() => setIsBookingOpen(true)}
          onWatchTrailer={() => handleScrollToSection('trailer')}
          onCheckStatus={() => {
            setLookupRef('');
            setIsLookupOpen(true);
          }}
        />

        {/* 2. Official Trailer Section */}
        <TrailerSection trailerUrl={settings.trailer_url} />

        {/* 3. Movie Pictures / Gallery Section */}
        <GallerySection customImages={settings.authorised_gallery_image_urls} />

        {/* 4. Challenge Rules & Mechanism */}
        <UnoRulesSection
          movieTitle={settings.movie_title}
          challengeName={settings.challenge_name || 'UNO Challenge'}
          onBookTickets={() => setIsBookingOpen(true)}
        />
      </main>

      {/* Footer */}
      <Footer
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenBooking={() => setIsBookingOpen(true)}
        onOpenLookup={() => {
          setLookupRef('');
          setIsLookupOpen(true);
        }}
      />

      {/* Modals */}
      <BookingFormModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
        onViewStatus={handleOpenStatusForRef}
        movieTitle={settings.movie_title}
        challengeName={settings.challenge_name || 'UNO Challenge'}
      />

      <LookupModal
        isOpen={isLookupOpen}
        onClose={() => setIsLookupOpen(false)}
        initialQuery={lookupRef}
        defaultSettings={settings}
      />

      <AdminPortal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        defaultSettings={settings}
        onSettingsUpdated={(newS) => setSettings(newS)}
      />
    </div>
  );
}
