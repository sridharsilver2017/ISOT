import React from 'react';
import { Link } from 'react-router-dom';
import { ProgrammeItem } from '../types/programme';
import { getTypeBadgeColor } from '../utils/timeUtils';
import { Clock, Star, Mic } from 'lucide-react';
import { useScheduleStore } from '../store/scheduleStore';

interface TimelineViewProps {
  items: ProgrammeItem[];
  date: string;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ items }) => {
  const { isTalkSaved, toggleSaveTalk } = useScheduleStore();

  // Get distinct time slots sorted chronologically
  const timeSlots = Array.from(new Set(items.map((i) => i.startTime))).sort();

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-3xl border border-gray-200/80 dark:border-zinc-800 p-4 sm:p-6 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-zinc-800">
        <div>
          <h3 className="text-base font-extrabold text-gray-900 dark:text-white">Conference Timeline Matrix</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Scroll horizontally to view concurrent sessions across all halls
          </p>
        </div>
      </div>

      <div className="overflow-x-auto no-scrollbar pb-4">
        <div className="min-w-[760px] sm:min-w-[900px] space-y-6">
          {timeSlots.map((time) => {
            const slotItems = items.filter((i) => i.startTime === time);

            return (
              <div key={time} className="relative pl-24">
                {/* Time header badge on left */}
                <div className="absolute left-0 top-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-isot-burgundy text-white font-black text-xs shadow-sm">
                  <Clock size={12} />
                  <span>{time}</span>
                </div>

                {/* Vertical time marker line */}
                <div className="absolute left-[88px] top-7 bottom-0 w-0.5 bg-gray-200 dark:bg-zinc-800" />

                {/* Cards in this slot */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {slotItems.map((item) => {
                    const saved = isTalkSaved(item.id);
                    const badge = getTypeBadgeColor(item.type);

                    return (
                      <div
                        key={item.id}
                        className="bg-gray-50 dark:bg-zinc-800/80 border border-gray-200/70 dark:border-zinc-700/60 rounded-2xl p-3.5 hover:border-isot-burgundy/40 dark:hover:border-rose-700/50 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1.5 mb-1.5">
                            <span className="text-[11px] font-bold text-isot-burgundy dark:text-rose-400 bg-isot-light-pink dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                              {item.venue}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.2 rounded ${badge.bg} ${badge.text}`}
                            >
                              {badge.label}
                            </span>
                          </div>

                          <Link
                            to={`/talk/${item.id}`}
                            className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white hover:text-isot-burgundy dark:hover:text-rose-400 line-clamp-2 leading-snug"
                          >
                            {item.title}
                          </Link>

                          {item.speakers && item.speakers.length > 0 && (
                            <div className="text-[11px] text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1">
                              <Mic size={11} className="text-isot-burgundy shrink-0" />
                              <span className="line-clamp-1">{item.speakers.join(', ')}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-gray-200/60 dark:border-zinc-700/50">
                          <span className="text-[10px] text-gray-400">
                            {item.startTime} – {item.endTime || ''}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              toggleSaveTalk({
                                id: item.id,
                                title: item.title,
                                date: item.date,
                                dayName: item.dayName,
                                startTime: item.startTime,
                                endTime: item.endTime,
                                venue: item.venue,
                                speakers: item.speakers,
                                sessionId: item.sessionId,
                                sessionTitle: item.sessionTitle,
                              });
                            }}
                            className="p-1 text-gray-400 hover:text-amber-500"
                            aria-label="Bookmark talk"
                          >
                            <Star
                              size={14}
                              className={saved ? 'fill-amber-500 text-amber-500' : ''}
                            />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
