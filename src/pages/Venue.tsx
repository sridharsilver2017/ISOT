import React from 'react';
import { Link } from 'react-router-dom';
import { HALLS } from '../data/halls';
import { useProgrammeStore } from '../store/programmeStore';
import { MapPin, Navigation, ExternalLink, ChevronRight } from 'lucide-react';

export const Venue: React.FC = () => {
  const { sessions } = useProgrammeStore();
  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Conference Venue & Halls
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          HITEX Convention Center, Hyderabad, India
        </p>
      </div>

      {/* Hero Venue Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-isot-burgundy to-isot-deep-burgundy text-white p-6 sm:p-8 shadow-xl shadow-isot-burgundy/20">
        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-amber-300 font-bold text-xs">
            <MapPin size={13} />
            <span>HITEX Hyderabad</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black leading-tight">
            Hyderabad International Trade Exposition & Convention Center (HITEX)
          </h2>

          <p className="text-xs sm:text-sm text-rose-100 leading-relaxed">
            HITEX is India's premier purpose-built convention destination, located in the heart of Hyderabad's technology corridor (HITEC City). It offers world-class plenary halls, parallel conference screens, exhibition facilities, and open networking lawns.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <a
              href="https://maps.google.com/?q=HITEX+Exhibition+Center+Hyderabad"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white text-isot-burgundy font-black text-xs shadow-md hover:bg-gray-100 transition-colors"
            >
              <Navigation size={15} />
              <span>Get Google Maps Directions</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>

      {/* Conference Halls Directory */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
            Conference Halls & Tracks
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Dedicated spaces across 3 days of scientific sessions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {HALLS.map((hall) => {
            const hallSessions = sessions.filter(
              (s) => s.venue.includes(hall.name) || hall.name.includes(s.venue)
            );

            return (
              <div
                key={hall.id}
                className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-gray-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: hall.color }}
                      />
                      <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white">
                        {hall.name}
                      </h3>
                    </div>
                    {hall.capacity && (
                      <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full">
                        {hall.capacity}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600 dark:text-gray-300 mb-3 leading-relaxed">
                    {hall.description}
                  </p>

                  {hall.floor && (
                    <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-4">
                      Location: {hall.floor}
                    </div>
                  )}

                  {/* Scheduled sessions preview */}
                  <div className="space-y-1.5 pt-3 border-t border-gray-100 dark:border-zinc-800">
                    <span className="text-[10px] font-black uppercase tracking-wider text-isot-burgundy dark:text-rose-400">
                      Scheduled Sessions ({hallSessions.length}):
                    </span>
                    {hallSessions.slice(0, 3).map((s) => (
                      <Link
                        key={s.id}
                        to={`/session/${s.id}`}
                        className="block text-xs font-semibold text-gray-700 dark:text-gray-300 hover:text-isot-burgundy dark:hover:text-rose-400 truncate"
                      >
                        • {s.dayName}: {s.title}
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800 flex justify-end">
                  <Link
                    to={`/programme`}
                    className="text-xs font-bold text-isot-burgundy dark:text-rose-400 flex items-center gap-1 hover:underline"
                  >
                    <span>View in Programme</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Travel & Connectivity Guide */}
      <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <h2 className="text-lg font-black text-gray-900 dark:text-white">
          Travel & Transportation
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/60 dark:border-zinc-700/60">
            <h4 className="font-extrabold text-gray-900 dark:text-white mb-1">
              ✈️ Rajiv Gandhi Intl Airport (HYD)
            </h4>
            <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">
              Approx. 32 km via Outer Ring Road (ORR). Airport taxis, Uber, and Ola are readily available (approx. 40–50 mins).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/60 dark:border-zinc-700/60">
            <h4 className="font-extrabold text-gray-900 dark:text-white mb-1">
              🚇 Hyderabad Metro
            </h4>
            <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">
              Nearest metro station is <strong>Hitec City Metro Station / Raidurg</strong> on the Blue Line (approx. 3.5 km from HITEX).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/60 dark:border-zinc-700/60">
            <h4 className="font-extrabold text-gray-900 dark:text-white mb-1">
              🚆 Major Railway Stations
            </h4>
            <p className="text-gray-500 dark:text-gray-400 text-xs leading-relaxed">
              Secunderabad Railway Station (20 km) and Hyderabad Deccan / Nampally (17 km).
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
