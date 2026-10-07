import React, { useState } from 'react';
import {
  Calendar,
  Smartphone,
  CheckCircle2,
  X,
  ExternalLink,
  Sparkles,
  Bell,
  Clock,
  MapPin,
  CalendarPlus,
} from 'lucide-react';
import { SavedItem } from '../store/scheduleStore';
import {
  addToDeviceCalendar,
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
} from '../utils/calendarGenerator';

interface CalendarSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedItems: SavedItem[];
}

export const CalendarSyncModal: React.FC<CalendarSyncModalProps> = ({
  isOpen,
  onClose,
  savedItems,
}) => {
  const [syncedSuccess, setSyncedSuccess] = useState<boolean>(false);
  const [syncMethod, setSyncMethod] = useState<string>('');

  if (!isOpen) return null;

  const handleDeviceCalendarSync = async () => {
    const result = await addToDeviceCalendar(savedItems);
    if (result.success) {
      setSyncedSuccess(true);
      setSyncMethod(result.method === 'native-share' ? 'Device Calendar Prompt' : 'Calendar File (.ics)');
      setTimeout(() => {
        setSyncedSuccess(false);
      }, 4000);
    }
  };

  const handleGoogleCalendarFirst = () => {
    if (savedItems.length === 0) return;
    const url = getGoogleCalendarUrl(savedItems[0]);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOutlookCalendarFirst = () => {
    if (savedItems.length === 0) return;
    const url = getOutlookCalendarUrl(savedItems[0]);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-zinc-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-6 pb-5 border-b border-gray-100 dark:border-zinc-800 bg-gradient-to-r from-isot-burgundy/5 via-transparent to-amber-500/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-isot-burgundy text-white flex items-center justify-center shadow-md shadow-isot-burgundy/25">
                <CalendarPlus size={20} />
              </div>
              <div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white tracking-tight">
                  Add to Device Calendar
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  Sync {savedItems.length} saved session{savedItems.length > 1 ? 's' : ''} to your calendar
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {syncedSuccess && (
            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 animate-slide-up">
              <CheckCircle2 size={20} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
              <div className="text-xs font-bold">
                Calendar file prepared & sent! ({syncMethod}). Check your device calendar app.
              </div>
            </div>
          )}

          {/* Key Highlights Card */}
          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/70 dark:border-zinc-700/60 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-gray-700 dark:text-gray-300">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-isot-burgundy dark:text-rose-400" />
                <span>Conference Schedule</span>
              </span>
              <span className="px-2 py-0.5 rounded-full bg-isot-burgundy/10 text-isot-burgundy dark:text-rose-300 font-extrabold text-[11px]">
                {savedItems.length} Items Selected
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1 text-xs text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-1.5">
                <MapPin size={13} className="text-isot-burgundy dark:text-rose-400 shrink-0" />
                <span className="truncate">HITEX, Hyderabad</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Bell size={13} className="text-amber-500 shrink-0" />
                <span>15-min alerts</span>
              </div>
            </div>
          </div>

          {/* Primary Action Button: Add directly to Device Calendar */}
          <button
            type="button"
            onClick={handleDeviceCalendarSync}
            className="w-full flex items-center justify-between p-4 rounded-2xl bg-isot-burgundy hover:bg-isot-deep-burgundy text-white font-black text-sm shadow-lg shadow-isot-burgundy/25 transition-all group active:scale-[0.99]"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <Smartphone size={20} />
              </div>
              <div>
                <div className="text-sm font-black flex items-center gap-1.5">
                  <span>Add to Apple / Android / Device Calendar</span>
                  <Sparkles size={14} className="text-amber-300 animate-pulse" />
                </div>
                <div className="text-[11px] font-medium text-white/80">
                  Direct 1-tap sync into Apple Calendar, Google Calendar, or Outlook
                </div>
              </div>
            </div>
            <CalendarPlus size={20} className="shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Quick Web Calendar Options */}
          <div className="space-y-2 pt-1">
            <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              Or Open in Cloud Calendars
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={handleGoogleCalendarFirst}
                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-isot-burgundy dark:hover:border-rose-400 text-xs font-bold text-gray-800 dark:text-gray-200 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xs">
                    G
                  </div>
                  <span>Google Calendar</span>
                </div>
                <ExternalLink size={13} className="text-gray-400 group-hover:text-isot-burgundy" />
              </button>

              <button
                type="button"
                onClick={handleOutlookCalendarFirst}
                className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 hover:border-isot-burgundy dark:hover:border-rose-400 text-xs font-bold text-gray-800 dark:text-gray-200 transition-all group"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center font-black text-xs">
                    O
                  </div>
                  <span>Outlook / 365</span>
                </div>
                <ExternalLink size={13} className="text-gray-400 group-hover:text-isot-burgundy" />
              </button>
            </div>
          </div>

          {/* Info note */}
          <div className="p-3 rounded-xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300 flex items-start gap-2">
            <Clock size={14} className="shrink-0 mt-0.5" />
            <span>
              All events include correct Hall locations at HITEX Hyderabad and automatic 15-minute start reminders.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-zinc-800/50 border-t border-gray-100 dark:border-zinc-800 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
