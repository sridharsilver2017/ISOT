import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Mic, ChevronRight } from 'lucide-react';
import { useScheduleStore } from '../store/scheduleStore';
import { useProgrammeStore } from '../store/programmeStore';
import { getCurrentProgrammeItem } from '../utils/timeUtils';
import { FavouriteButton } from './FavouriteButton';

interface UpNextProps {
  currentDate: string;
  currentTime: string;
}

export const UpNext: React.FC<UpNextProps> = ({ currentDate, currentTime }) => {
  const { isTalkSaved, toggleSaveTalk } = useScheduleStore();
  const { sessions } = useProgrammeStore();
  const { upNext } = getCurrentProgrammeItem(currentDate, currentTime, sessions);

  if (upNext.length === 0) {
    return null;
  }

  return (
    <section className="my-6">
      <div className="flex items-center justify-between mb-3.5">
        <h2 className="text-sm font-black tracking-wider uppercase text-isot-burgundy dark:text-rose-400 flex items-center gap-1.5">
          <Clock size={16} />
          Up Next
        </h2>
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
          Starting at {upNext[0]?.startTime}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {upNext.map((item) => {
          const saved = isTalkSaved(item.id);

          return (
            <div
              key={item.id}
              className="bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-xs font-bold text-isot-burgundy dark:text-rose-300 bg-isot-light-pink dark:bg-rose-950/40 px-2.5 py-0.5 rounded-full">
                    {item.startTime} {item.endTime ? `– ${item.endTime}` : ''}
                  </span>
                  <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                    {item.venue}
                  </span>
                </div>

                <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 line-clamp-1">
                  {item.sessionTitle}
                </div>

                <Link to={`/talk/${item.id}`} className="block group">
                  <h3 className="text-sm sm:text-base font-extrabold text-gray-900 dark:text-white group-hover:text-isot-burgundy dark:group-hover:text-rose-400 transition-colors line-clamp-2 mb-2">
                    {item.title}
                  </h3>
                </Link>

                {item.speakers && item.speakers.length > 0 && (
                  <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-2 line-clamp-1">
                    <Mic size={13} className="text-isot-burgundy dark:text-rose-400 shrink-0" />
                    <span>{item.speakers.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-100 dark:border-zinc-800/80">
                <Link
                  to={`/talk/${item.id}`}
                  className="text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-isot-burgundy dark:hover:text-rose-400 flex items-center gap-1"
                >
                  <span>Details</span>
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
