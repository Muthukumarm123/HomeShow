import React from 'react';
import { Play, Ticket, Calendar, Clock, MapPin, Sparkles, Trophy } from 'lucide-react';
import { MovieSettings } from '../types.ts';

interface HeroSectionProps {
  settings: MovieSettings;
  onBookTickets: () => void;
  onWatchTrailer: () => void;
  onCheckStatus: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  settings,
  onBookTickets,
  onWatchTrailer,
  onCheckStatus
}) => {
  const heroImage =
    settings.hero_image_url || '/src/assets/images/jailer_hero_cinematic_1793199448445.jpg';

  return (
    <div className="relative min-h-[92vh] flex flex-col justify-between overflow-hidden bg-[#070708] border-b border-red-950/50">
      {/* Background Cinematic Visual with Scrim Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt={`${settings.movie_title} Theatrical Scene`}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-top opacity-55 scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Deep red and dark obsidian multi-stop gradient scrim */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#070708] via-[#070708]/75 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#070708] via-transparent to-[#070708]/90" />
        <div className="absolute inset-0 bg-radial from-red-900/20 via-transparent to-black/60 pointer-events-none" />
      </div>

      {/* Main Hero Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-12 flex-1 flex flex-col justify-center">
        <div className="max-w-3xl">
          {/* Movie Night Tagline Kicker */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded bg-red-950/70 border border-red-700/40 text-xs font-semibold text-red-200 tracking-wider uppercase mb-6 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Private Family Premiere Event</span>
          </div>

          {/* Main Title */}
          <h1 className="font-cinematic text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight text-white leading-none mb-4 drop-shadow-2xl">
            {settings.movie_title || 'JAILER 2'}
          </h1>

          {/* Subtitle */}
          <p className="font-cinematic text-xl sm:text-2xl lg:text-3xl font-semibold tracking-wider text-amber-200/90 mb-4">
            {settings.event_name || 'THE ULTIMATE FAMILY MOVIE NIGHT'}
          </p>

          {/* Tagline */}
          <p className="text-base sm:text-lg text-neutral-300 max-w-2xl leading-relaxed mb-8 italic">
            "{settings.tagline || 'Two UNO Games. One Epic Movie Night.'}"
          </p>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-5 mb-10">
            <button
              onClick={onBookTickets}
              className="px-8 py-4 text-base font-bold tracking-wider uppercase text-black bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 rounded-md transition-all duration-200 shadow-xl shadow-amber-500/20 hover:scale-[1.02] active:scale-95 flex items-center gap-3 cursor-pointer"
            >
              <Ticket className="w-5 h-5 text-black" />
              <span>Book Tickets</span>
            </button>

            <button
              onClick={onWatchTrailer}
              className="px-7 py-4 text-base font-bold tracking-wider uppercase text-white bg-neutral-900/90 hover:bg-neutral-800 border border-red-800/60 hover:border-amber-400/80 rounded-md transition-all duration-200 flex items-center gap-3 backdrop-blur-sm active:scale-95 cursor-pointer"
            >
              <Play className="w-5 h-5 text-amber-400 fill-amber-400" />
              <span>Watch Trailer</span>
            </button>

            <button
              onClick={onCheckStatus}
              className="px-5 py-4 text-sm font-semibold tracking-wide text-neutral-400 hover:text-white underline underline-offset-4 transition-colors cursor-pointer"
            >
              Already requested? Check Status
            </button>
          </div>
        </div>
      </div>

      {/* Atmospheric Event Specs Strip */}
      <div className="relative z-10 w-full bg-black/85 border-t border-neutral-800/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-3 text-neutral-300">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="block text-xs uppercase text-neutral-500 tracking-wider font-semibold">Event Date</span>
                <span className="font-semibold text-white">{settings.event_date}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-neutral-300">
              <Clock className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="block text-xs uppercase text-neutral-500 tracking-wider font-semibold">Showtime</span>
                <span className="font-semibold text-white">{settings.event_time}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-neutral-300">
              <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="block text-xs uppercase text-neutral-500 tracking-wider font-semibold">Screening Venue</span>
                <span className="font-semibold text-white truncate max-w-[220px]">{settings.venue}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 text-neutral-300">
              <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <span className="block text-xs uppercase text-neutral-500 tracking-wider font-semibold">Requirement</span>
                <span className="font-semibold text-amber-300">{settings.challenge_name || '2 Verified UNO Games'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
