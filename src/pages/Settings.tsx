import React from 'react';
import { useScheduleStore } from '../store/scheduleStore';
import { Moon, Sun, Clock, Calendar, Smartphone, Trash2 } from 'lucide-react';
import { CONFERENCE_DAYS } from '../data/event';

export const Settings: React.FC = () => {
  const {
    darkMode,
    toggleDarkMode,
    simulatedDate,
    setSimulatedDate,
    simulatedTime,
    setSimulatedTime,
    savedItems,
    clearSchedule,
  } = useScheduleStore();

  return (
    <div className="space-y-6 pb-12 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Settings & Companion Tools
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Personalize your ISOT 2026 conference experience
        </p>
      </div>

      {/* Appearance Settings */}
      <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
          Appearance & Theme
        </h2>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/60 dark:border-zinc-700/60">
          <div className="flex items-center gap-3">
            {darkMode ? (
              <Moon size={22} className="text-indigo-400" />
            ) : (
              <Sun size={22} className="text-amber-500" />
            )}
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {darkMode ? 'Dark Mode Active' : 'Light Mode Active'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                High contrast medical conference theme
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={toggleDarkMode}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              darkMode
                ? 'bg-indigo-600 text-white shadow-md'
                : 'bg-amber-500 text-white shadow-md'
            }`}
          >
            Switch to {darkMode ? 'Light' : 'Dark'}
          </button>
        </div>
      </section>

      {/* Conference Live Mode Simulator */}
      <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
            Conference Time Simulator
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Simulate live conference hours to preview "Happening Now" and "Up Next" features
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/60 dark:border-zinc-700/60 space-y-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Calendar size={15} className="text-isot-burgundy dark:text-rose-400" />
              <span>Simulated Date</span>
            </label>
            <select
              value={simulatedDate}
              onChange={(e) => setSimulatedDate(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:border-isot-burgundy"
            >
              {CONFERENCE_DAYS.map((day) => (
                <option key={day.date} value={day.date}>
                  {day.dayName} ({day.dayFormatted} 2026)
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/60 dark:border-zinc-700/60 space-y-2">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-1.5">
              <Clock size={15} className="text-isot-burgundy dark:text-rose-400" />
              <span>Simulated Time Slot</span>
            </label>
            <select
              value={simulatedTime}
              onChange={(e) => setSimulatedTime(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 text-sm font-semibold text-gray-900 dark:text-white outline-none focus:border-isot-burgundy"
            >
              <option value="09:15">09:15 (Morning Sessions)</option>
              <option value="10:00">10:00 (Symposia)</option>
              <option value="11:30">11:30 (Orations & Keynotes)</option>
              <option value="13:30">13:30 (Lunch Break)</option>
              <option value="14:25">14:25 (Afternoon Panels)</option>
              <option value="16:30">16:30 (Late Afternoon Sessions)</option>
              <option value="18:30">18:30 (GBM)</option>
              <option value="20:30">20:30 (Gala Dinner)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Storage & Data Management */}
      <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
          Data & Local Storage
        </h2>

        <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/60 dark:border-zinc-700/60">
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white">
              My Schedule Items ({savedItems.length})
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Stored locally on this device via localStorage
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Clear all saved sessions and talks?')) {
                clearSchedule();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 text-xs font-bold transition-all"
          >
            <Trash2 size={14} />
            <span>Clear</span>
          </button>
        </div>
      </section>

      {/* Offline & App Info */}
      <section className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <Smartphone size={20} className="text-isot-burgundy dark:text-rose-400" />
          <h2 className="text-base font-extrabold text-gray-900 dark:text-white">
            Progressive Web App (PWA)
          </h2>
        </div>

        <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
          This conference companion application is 100% offline-ready. All scientific programme data, speaker schedules, hall locations, and your saved itinerary are stored in cache and will load instantly even with no internet connection at the convention center.
        </p>

        <div className="pt-2 text-[11px] text-gray-400 border-t border-gray-100 dark:border-zinc-800 flex justify-between">
          <span>ISOT 2026 Companion v1.0.0</span>
          <span>Deployable to Cloudflare Pages</span>
        </div>
      </section>
    </div>
  );
};
