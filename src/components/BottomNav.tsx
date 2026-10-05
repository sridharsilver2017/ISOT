import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Calendar, Bookmark, Search, MoreHorizontal, MapPin, FileText, Info, Settings as SettingsIcon, ShieldCheck, X } from 'lucide-react';
import { useScheduleStore } from '../store/scheduleStore';

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const { savedItems } = useScheduleStore();
  const [showMoreMenu, setShowMoreMenu] = useState(false);

  const navItems = [
    { name: 'Home', path: '/', icon: Home, exact: true },
    { name: 'Programme', path: '/programme', icon: Calendar },
    {
      name: 'My Day',
      path: '/my-schedule',
      icon: Bookmark,
      badge: savedItems.length > 0 ? savedItems.length : undefined,
    },
    { name: 'Search', path: '/search', icon: Search },
  ];

  const moreItems = [
    { name: 'Admin CMS', path: '/admin', icon: ShieldCheck, desc: 'Edit topics, sessions, times & faculty' },
    { name: 'Venue & Halls', path: '/venue', icon: MapPin, desc: 'HITEX Hyderabad & Hall Guides' },
    { name: 'Speakers', path: '/speakers', icon: Calendar, desc: 'Full Faculty Directory & Search' },
    { name: 'ISOT Council & About', path: '/about', icon: Info, desc: 'Committee, Organisers, Secretariat' },
    { name: 'Brochure Viewer', path: '/brochure', icon: FileText, desc: 'Original conference announcement' },
    { name: 'Settings & Tools', path: '/settings', icon: SettingsIcon, desc: 'Theme, Day Simulator, Offline Mode' },
  ];

  const isMoreActive = ['/admin', '/venue', '/speakers', '/about', '/brochure', '/settings'].some((p) =>
    location.pathname.startsWith(p)
  );

  return (
    <>
      {/* More Menu Bottom Sheet */}
      {showMoreMenu && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity md:hidden"
          onClick={() => setShowMoreMenu(false)}
        >
          <div
            className="absolute bottom-0 inset-x-0 bg-white dark:bg-zinc-900 rounded-t-3xl p-5 safe-bottom border-t border-gray-200 dark:border-zinc-800 shadow-2xl animate-in slide-in-from-bottom-5 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100 dark:border-zinc-800">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">Conference Menu</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">ISOT 2026 Hyderabad</p>
              </div>
              <button
                type="button"
                onClick={() => setShowMoreMenu(false)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-1 py-2">
              {moreItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setShowMoreMenu(false)}
                    className={`flex items-center gap-3.5 p-3 rounded-2xl transition-colors ${
                      isActive
                        ? 'bg-isot-burgundy/10 text-isot-burgundy dark:bg-rose-950/40 dark:text-rose-400 font-semibold'
                        : 'text-gray-700 hover:bg-gray-50 dark:text-gray-200 dark:hover:bg-zinc-800/60'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                        isActive
                          ? 'bg-isot-burgundy text-white'
                          : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <Icon size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{item.name}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{item.desc}</div>
                    </div>
                  </NavLink>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Nav Bar */}
      <nav className="fixed bottom-0 inset-x-0 z-40 glass-nav border-t border-gray-200/80 dark:border-zinc-800 md:hidden safe-bottom">
        <div className="grid grid-cols-5 h-16 max-w-lg mx-auto px-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center relative py-1 transition-colors ${
                  isActive
                    ? 'text-isot-burgundy dark:text-rose-400 font-bold'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <div className="relative">
                  <Icon
                    size={22}
                    className={`transition-transform duration-200 ${
                      isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.75]'
                    }`}
                  />
                  {item.badge !== undefined && (
                    <span className="absolute -top-1.5 -right-2.5 bg-isot-burgundy text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-zinc-900">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] mt-1 tracking-tight">{item.name}</span>
                {isActive && (
                  <span className="absolute top-0 w-8 h-1 bg-isot-burgundy dark:bg-rose-400 rounded-full" />
                )}
              </NavLink>
            );
          })}

          {/* More button */}
          <button
            type="button"
            onClick={() => setShowMoreMenu(true)}
            className={`flex flex-col items-center justify-center relative py-1 transition-colors ${
              isMoreActive
                ? 'text-isot-burgundy dark:text-rose-400 font-bold'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
            }`}
          >
            <MoreHorizontal
              size={22}
              className={`transition-transform duration-200 ${
                isMoreActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.75]'
              }`}
            />
            <span className="text-[11px] mt-1 tracking-tight">More</span>
            {isMoreActive && (
              <span className="absolute top-0 w-8 h-1 bg-isot-burgundy dark:bg-rose-400 rounded-full" />
            )}
          </button>
        </div>
      </nav>
    </>
  );
};
