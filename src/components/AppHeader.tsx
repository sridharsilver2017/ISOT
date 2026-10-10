import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Search, Calendar, Users, MapPin, Bookmark, FileText, Info, WifiOff, RefreshCw } from 'lucide-react';
import { useScheduleStore } from '../store/scheduleStore';
import { useProgrammeStore } from '../store/programmeStore';

export const AppHeader: React.FC = () => {
  const location = useLocation();
  const { darkMode, toggleDarkMode, savedItems } = useScheduleStore();
  const { fetchProgrammeFromServer, isSyncing } = useProgrammeStore();
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const navLinks = [
    { name: 'Home', path: '/', icon: Calendar },
    { name: 'Programme', path: '/programme', icon: Calendar },
    { name: 'Speakers', path: '/speakers', icon: Users },
    { name: 'My Schedule', path: '/my-schedule', icon: Bookmark, badge: savedItems.length },
    { name: 'Venue', path: '/venue', icon: MapPin },
    { name: 'Brochure', path: '/brochure', icon: FileText },
    { name: 'About', path: '/about', icon: Info },
  ];

  return (
    <header className="sticky top-0 z-40 w-full glass-header border-b border-gray-200/80 dark:border-zinc-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-isot-burgundy to-isot-deep-burgundy flex items-center justify-center shadow-md shadow-isot-burgundy/20 group-hover:scale-105 transition-transform">
              <span className="text-white font-black text-sm tracking-tighter">ISOT</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-isot-burgundy dark:text-rose-400">
                  ISOT 2026
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                  Hyderabad
                </span>
              </div>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive =
                link.path === '/'
                  ? location.pathname === '/'
                  : location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all relative flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-isot-burgundy text-white shadow-sm shadow-isot-burgundy/30'
                      : 'text-gray-700 hover:text-isot-burgundy hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-zinc-800'
                  }`}
                >
                  {link.name}
                  {link.badge !== undefined && link.badge > 0 && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-white text-isot-burgundy'
                          : 'bg-isot-burgundy text-white'
                      }`}
                    >
                      {link.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center gap-2">
            {!isOnline && (
              <div
                title="Working Offline"
                className="flex items-center gap-1 text-xs bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 px-2 py-1 rounded-full"
              >
                <WifiOff size={14} />
                <span className="hidden sm:inline">Offline</span>
              </div>
            )}

            {/* Live Auto-Refresh Indicator / Trigger */}
            <button
              type="button"
              onClick={() => fetchProgrammeFromServer()}
              title="Auto-refreshing every 30s. Click to refresh now."
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80 transition-all cursor-pointer"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="hidden xs:inline sm:inline">Live 30s</span>
              <RefreshCw size={12} className={`text-emerald-600 dark:text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            </button>

            <Link
              to="/search"
              aria-label="Search programme"
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <Search size={20} />
            </Link>

            <button
              type="button"
              onClick={toggleDarkMode}
              aria-label="Toggle theme"
              className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            >
              {darkMode ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
