import React, { useState } from 'react';
import { Image, X, ZoomIn, Film } from 'lucide-react';

interface GallerySectionProps {
  customImages?: string[];
}

export const GallerySection: React.FC<GallerySectionProps> = ({ customImages }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const defaultImages = [
    {
      url: '/src/assets/images/jailer_hero_cinematic_1793199448445.jpg',
      title: 'Tiger Muthuvel Pandian Returns',
      subtitle: 'The Legendary Patriarch in the Theatre of Vengeance'
    },
    {
      url: '/src/assets/images/jailer_uno_arena_1793199450537.jpg',
      title: 'Family Movie Lounge & UNO Arena',
      subtitle: 'Where Legends Duel Before the Movie Rolls'
    },
    {
      url: '/src/assets/images/jailer_movie_still_action_1793199450458.jpg',
      title: 'Cinematic Thriller Still',
      subtitle: 'High Stakes, Dark Secrets & Family Loyalty'
    }
  ];

  // If administrator added custom gallery URLs, combine them
  const displayImages = customImages && customImages.length > 0
    ? customImages.map((url, idx) => ({
        url,
        title: `Official Production Still ${idx + 1}`,
        subtitle: 'Authorized Promotional Media'
      }))
    : defaultImages;

  return (
    <section id="gallery" className="py-20 bg-[#08080A] border-b border-neutral-900 scroll-mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-amber-400 font-bold mb-2">
              <Film className="w-4 h-4" />
              <span>Visual Showcase</span>
            </div>
            <h2 className="font-cinematic text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-wide">
              JAILER 2 MOVIE PICTURES
            </h2>
            <p className="mt-2 text-neutral-400 text-sm sm:text-base max-w-xl">
              Promotional stills, premiere previews, and high-stakes family game night arena imagery.
            </p>
          </div>
          <div className="text-xs text-neutral-500">
            Click any picture for full theatrical preview
          </div>
        </div>

        {/* Responsive Gallery Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayImages.map((item, index) => (
            <div
              key={index}
              onClick={() => setSelectedImage(item.url)}
              className="group relative rounded-xl overflow-hidden bg-neutral-950 border border-neutral-800 hover:border-amber-500/60 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-2xl hover:shadow-amber-950/20"
            >
              <div className="aspect-[16/10] overflow-hidden bg-black relative">
                <img
                  src={item.url}
                  alt={item.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-108 brightness-90 group-hover:brightness-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />
                <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-4 h-4" />
                </div>
              </div>

              <div className="p-5">
                <h3 className="font-cinematic text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                  {item.title}
                </h3>
                <p className="mt-1 text-xs text-neutral-400">
                  {item.subtitle}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div
            className="relative max-w-5xl w-full max-h-[90vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 p-2 text-neutral-400 hover:text-white rounded-full bg-neutral-900 border border-neutral-700 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage}
              alt="Full Preview"
              referrerPolicy="no-referrer"
              className="max-h-[80vh] w-auto max-w-full rounded-lg border border-amber-900/60 shadow-2xl object-contain"
            />
          </div>
        </div>
      )}
    </section>
  );
};
