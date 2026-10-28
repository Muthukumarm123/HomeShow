import React, { useState } from 'react';
import { Play, Film, ExternalLink } from 'lucide-react';

interface TrailerSectionProps {
  trailerUrl: string;
}

export const TrailerSection: React.FC<TrailerSectionProps> = ({ trailerUrl }) => {
  const [isPlaying, setIsPlaying] = useState(false);

  // Normalize YouTube embed URL
  const getEmbedUrl = (url: string) => {
    if (!url) return 'https://www.youtube.com/embed/Y5BeWdODPqo';
    if (url.includes('embed/')) return url;
    if (url.includes('watch?v=')) {
      const id = url.split('watch?v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  const finalEmbedUrl = getEmbedUrl(trailerUrl);

  return (
    <section id="trailer" className="py-20 bg-[#09090C] border-b border-neutral-900 scroll-mt-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-amber-400 font-bold mb-2">
            <Film className="w-4 h-4" />
            <span>Official Premiere Footage</span>
          </div>
          <h2 className="font-cinematic text-3xl sm:text-5xl font-extrabold text-white tracking-wide">
            WATCH THE JAILER 2 TRAILER
          </h2>
          <p className="mt-3 text-neutral-400 text-sm sm:text-base max-w-xl mx-auto">
            Experience the explosive energy, charismatic power, and intensity before our private family screening.
          </p>
        </div>

        {/* Video Player Container */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-amber-900/40 shadow-2xl red-cinema-glow">
          {!isPlaying ? (
            <div className="relative w-full h-full flex items-center justify-center group cursor-pointer" onClick={() => setIsPlaying(true)}>
              {/* Poster Thumbnail */}
              <img
                src="/src/assets/images/jailer_movie_still_action_1793199448445.jpg"
                onError={(e) => {
                  // Fallback to hero
                  (e.target as HTMLImageElement).src = '/src/assets/images/jailer_hero_cinematic_1793199448445.jpg';
                }}
                alt="Jailer 2 Official Trailer Preview"
                className="w-full h-full object-cover brightness-75 group-hover:brightness-90 transition-all duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

              {/* Big Play Button Overlay */}
              <div className="absolute z-10 flex flex-col items-center gap-4">
                <button
                  type="button"
                  aria-label="Play Trailer"
                  className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-black flex items-center justify-center shadow-2xl shadow-amber-500/50 group-hover:scale-110 active:scale-95 transition-transform duration-300 cursor-pointer"
                >
                  <Play className="w-8 h-8 fill-black translate-x-0.5" />
                </button>
                <span className="font-cinematic text-sm tracking-widest text-amber-200 uppercase font-bold bg-black/60 px-4 py-1.5 rounded-full backdrop-blur-sm border border-amber-500/30">
                  Click to Watch Official Trailer
                </span>
              </div>
            </div>
          ) : (
            <iframe
              src={`${finalEmbedUrl}?autoplay=1&rel=0`}
              title="JAILER 2 Official Trailer"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          )}
        </div>

        <div className="mt-4 flex items-center justify-between text-xs text-neutral-500 px-1">
          <span>Official Sun Pictures / Production Partner Trailer Stream</span>
          <a
            href="https://www.youtube.com/results?search_query=jailer+2+official+trailer"
            target="_blank"
            rel="noreferrer"
            className="hover:text-amber-400 flex items-center gap-1 transition-colors"
          >
            <span>Search on YouTube</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </section>
  );
};
