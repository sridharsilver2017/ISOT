import React from 'react';
import { Link } from 'react-router-dom';
import { ProgrammeItem } from '../types/programme';
import { Clock, MapPin, User, Users, Mic, Award, ChevronRight, Star } from 'lucide-react';
import { useScheduleStore } from '../store/scheduleStore';
import { getTypeBadgeColor } from '../utils/timeUtils';
import { slugify } from '../store/programmeStore';

interface TalkCardProps {
  item: ProgrammeItem;
  showSessionContext?: boolean;
}

export const TalkCard: React.FC<TalkCardProps> = ({ item, showSessionContext = false }) => {
  const { isTalkSaved, toggleSaveTalk } = useScheduleStore();
  const saved = isTalkSaved(item.id);
  const badge = getTypeBadgeColor(item.type);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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
  };

  return (
    <div className="group bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-5 border border-gray-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-isot-burgundy/30 dark:hover:border-rose-900/40 transition-all duration-200 relative flex flex-col justify-between w-full max-w-full overflow-hidden break-words">
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-isot-light-pink dark:bg-rose-950/40 text-isot-burgundy dark:text-rose-300 font-bold text-xs">
              <Clock size={13} className="stroke-[2.5]" />
              {item.startTime} {item.endTime ? `– ${item.endTime}` : ''}
            </span>

            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${badge.bg} ${badge.text} ${badge.border}`}
            >
              {badge.label}
            </span>
          </div>

          <div className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800/80 px-2.5 py-1 rounded-full">
            <MapPin size={12} className="text-isot-burgundy dark:text-rose-400" />
            <span>{item.venue}</span>
          </div>
        </div>

        {/* Session context if needed */}
        {showSessionContext && (
          <Link
            to={`/session/${item.sessionId}`}
            className="inline-block text-[11px] font-bold uppercase tracking-wider text-isot-burgundy dark:text-rose-400 mb-1 hover:underline"
          >
            {item.sessionTitle}
          </Link>
        )}

        {/* Title / Topic */}
        <Link to={`/talk/${item.id}`} className="block">
          <h4 className="text-base sm:text-lg font-black tracking-tight text-gray-900 dark:text-white group-hover:text-isot-burgundy dark:group-hover:text-rose-400 transition-colors leading-snug mb-3">
            {item.title}
          </h4>
        </Link>

        {/* Speakers */}
        {item.speakers && item.speakers.length > 0 && (
          <div className="mb-2.5 flex items-start gap-2 text-xs sm:text-sm">
            <Mic size={15} className="text-isot-burgundy dark:text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="text-gray-400 dark:text-gray-500 font-medium">Speaker{item.speakers.length > 1 ? 's' : ''}:</span>{' '}
              {item.speakers.map((sp, idx) => (
                <span key={sp}>
                  <Link
                    to={`/speaker/${slugify(sp)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-bold text-gray-900 dark:text-gray-100 hover:text-isot-burgundy dark:hover:text-rose-400 hover:underline"
                  >
                    {sp}
                  </Link>
                  {idx < (item.speakers?.length || 1) - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Panelists */}
        {item.panelists && item.panelists.length > 0 && (
          <div className="mb-2 flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
            <Users size={14} className="text-indigo-500 shrink-0 mt-0.5" />
            <div>
              <span className="text-gray-400 dark:text-gray-500 font-medium">Panelists:</span>{' '}
              {item.panelists.map((p, idx) => (
                <span key={p}>
                  <Link
                    to={`/speaker/${slugify(p)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="font-semibold text-gray-800 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline"
                  >
                    {p}
                  </Link>
                  {idx < (item.panelists?.length || 1) - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Moderator */}
        {item.moderator && (
          <div className="mb-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
            <Award size={14} className="text-amber-500 shrink-0" />
            <span>
              <strong className="font-medium text-gray-400 dark:text-gray-500">Moderator:</strong>{' '}
              <Link
                to={`/speaker/${slugify(item.moderator)}`}
                onClick={(e) => e.stopPropagation()}
                className="font-semibold text-gray-800 dark:text-gray-200 hover:underline"
              >
                {item.moderator}
              </Link>
            </span>
          </div>
        )}

        {/* Chairpersons */}
        {item.chairpersons && item.chairpersons.length > 0 && (
          <div className="mb-3 flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
            <User size={14} className="text-gray-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-medium">Chairpersons:</span>{' '}
              {item.chairpersons.map((c, idx) => (
                <span key={c}>
                  <Link
                    to={`/speaker/${slugify(c)}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-gray-700 dark:text-gray-300 hover:underline font-medium"
                  >
                    {c}
                  </Link>
                  {idx < (item.chairpersons?.length || 1) - 1 ? ', ' : ''}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Case Presenters */}
        {item.casePresenters && item.casePresenters.length > 0 && (
          <div className="mb-3 text-xs text-gray-600 dark:text-gray-400">
            <span className="font-medium text-gray-400">Case Presenters:</span>{' '}
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {item.casePresenters.join(', ')}
            </span>
          </div>
        )}
      </div>

      {/* Action footer */}
      <div className="flex items-center justify-between gap-3 pt-3 mt-2 border-t border-gray-100 dark:border-zinc-800/80">
        <Link
          to={`/talk/${item.id}`}
          className="text-xs font-bold text-isot-burgundy dark:text-rose-400 hover:text-isot-deep-burgundy flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
        >
          <span>View Details</span>
          <ChevronRight size={14} />
        </Link>

        <button
          type="button"
          onClick={handleToggleSave}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all active:scale-95 ${
            saved
              ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-700'
              : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
          }`}
          aria-label={saved ? 'Remove from My Day' : 'Add to My Day'}
        >
          <Star size={13} className={saved ? 'fill-amber-500 text-amber-500' : 'text-gray-400'} />
          <span>{saved ? 'Saved' : 'Save'}</span>
        </button>
      </div>
    </div>
  );
};
