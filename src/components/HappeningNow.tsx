import React from 'react';
import { Link } from 'react-router-dom';
import { Radio, Mic, ChevronRight } from 'lucide-react';
import { useScheduleStore } from '../store/scheduleStore';
import { useProgrammeStore } from '../store/programmeStore';
import { getCurrentProgrammeItem } from '../utils/timeUtils';
import { FavouriteButton } from './FavouriteButton';

interface HappeningNowProps {
  currentDate: string;
  currentTime: string;
}

export const HappeningNow: React.FC<HappeningNowProps> = ({ currentDate, currentTime }) => {
  const { isTalkSaved, toggleSaveTalk } = useScheduleStore();
  const { sessions } = useProgrammeStore();
  const { happeningNow, isWithinConferenceHours } = getCurrentProgrammeItem(currentDate, currentTime, sessions);

  if (!isWithinConferenceHours || happeningNow.length === 0) {
    return null;
  }

  return (
    <section className="my-6">
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
          </span>
          <h2 className="text-sm font-black tracking-wider uppercase text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
            Happening Now
          </h2>
        </div>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          Live across {happeningNow.length} hall{happeningNow.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {happeningNow.map((item) => {
          const saved = isTalkSaved(item.id);

          return (
            <div
              key={item.id}
              className="bg-gradient-to-br from-emerald-50/70 to-white dark:from-emerald-950/20 dark:to-zinc-900 border border-emerald-200/90 dark:border-emerald-900/50 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all relative flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-xs tracking-tight">
                      <Radio size={12} className="animate-pulse" />
                      LIVE
                    </span>
                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {item.startTime} – {item.endTime}
                    </span>
                  </div>

                  <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/80 px-2.5 py-0.5 rounded-full">
                    {item.venue}
                  </span>
                </div>

                <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                  {item.sessionTitle}
                </div>

                <Link to={`/talk/${item.id}`} className="block group">
                  <h3 className="text-base sm:text-lg font-black tracking-tight text-gray-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 mb-2">
                    {item.title}
                  </h3>
                </Link>

                {item.speakers && item.speakers.length > 0 && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-3">
                    <Mic size={14} className="text-emerald-600 shrink-0" />
                    <span>
                      <strong className="font-medium text-gray-400">Speaker:</strong>{' '}
                      {item.speakers.join(', ')}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-emerald-100 dark:border-emerald-950/60">
                <Link
                  to={`/talk/${item.id}`}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1"
                >
                  <span>Open Talk Details</span>
                  <ChevronRight size={14} />
                </Link>

                <FavouriteButton
                  isSaved={saved}
                  onToggle={(e) => {
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
                  size="sm"
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
