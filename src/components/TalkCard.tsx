import React from 'react';
import { Link } from 'react-router-dom';
import { ProgrammeItem } from '../types/programme';
import { MapPin, User, Users, Mic, Award, ChevronRight, Star } from 'lucide-react';
import { useScheduleStore } from '../store/scheduleStore';
import { getTypeBadgeColor, parsePartHeader, isSpecialEvent } from '../utils/timeUtils';
import { slugify } from '../store/programmeStore';

interface TalkCardProps {
  item: ProgrammeItem;
  showSessionContext?: boolean;
}

export const TalkCard: React.FC<TalkCardProps> = ({ item, showSessionContext = false }) => {
  const { isTalkSaved, toggleSaveTalk } = useScheduleStore();
  const saved = isTalkSaved(item.id);
  const badge = getTypeBadgeColor(item.type);
  const isSpecial = isSpecialEvent(item.title, item.type);

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
    <div
      className={`group rounded-3xl p-4 sm:p-5 border transition-all duration-200 relative flex flex-col justify-between w-full max-w-full overflow-hidden break-words ${
        isSpecial
          ? 'bg-sky-50/70 dark:bg-sky-950/30 border-sky-200/80 dark:border-sky-900/50 shadow-2xs hover:border-sky-300 dark:hover:border-sky-800'
          : 'bg-white dark:bg-zinc-900 border-gray-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-isot-burgundy/30 dark:hover:border-rose-900/40'
      }`}
    >
      <div>
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/90 text-red-700 dark:text-red-300 border border-red-200/90 dark:border-red-900/70 font-black text-xs shadow-2xs">
            <span>{item.startTime} {item.endTime ? `– ${item.endTime}` : ''}</span>
          </span>

          <div className="inline-flex items-center gap-1 text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 px-2.5 py-1 rounded-full border border-gray-200 dark:border-zinc-700">
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
        <div className="mb-3">
          {isSpecial ? (
            <h4 className="text-base sm:text-lg font-black tracking-tight text-gray-900 dark:text-white leading-snug">
              {item.title}
            </h4>
          ) : (
            <Link to={`/talk/${item.id}`} className="block">
              <h4 className="text-base sm:text-lg font-black tracking-tight text-gray-900 dark:text-white group-hover:text-isot-burgundy dark:group-hover:text-rose-400 transition-colors leading-snug inline">
                {item.title}
              </h4>
              {item.type && item.type !== 'talk' && (
                <span
                  className={`inline-flex items-center ml-2 align-middle px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${badge.bg} ${badge.text} ${badge.border}`}
                >
                  {badge.label}
                </span>
              )}
            </Link>
          )}
        </div>

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

        {/* Moderator(s) */}
        {(() => {
          const moderators = item.moderators && item.moderators.length > 0
            ? item.moderators
            : item.moderator
            ? [item.moderator]
            : [];
          if (moderators.length === 0) return null;
          return (
            <div className="mb-2 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
              <Award size={14} className="text-amber-500 shrink-0" />
              <span>
                <strong className="font-medium text-gray-400 dark:text-gray-500">
                  Moderator{moderators.length > 1 ? 's' : ''}:
                </strong>{' '}
                {moderators.map((mod, idx) => (
                  <span key={mod}>
                    <Link
                      to={`/speaker/${slugify(mod)}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-semibold text-gray-800 dark:text-gray-200 hover:underline"
                    >
                      {mod}
                    </Link>
                    {idx < moderators.length - 1 ? ', ' : ''}
                  </span>
                ))}
              </span>
            </div>
          );
        })()}

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

        {/* Description / Outline Bullets if present */}
        {item.description && item.description.length > 0 && (
          <div className="my-2.5 p-3.5 rounded-2xl bg-gradient-to-br from-rose-50/70 to-amber-50/30 dark:from-zinc-800/80 dark:to-zinc-800/40 border border-rose-100/90 dark:border-zinc-700/60 text-xs text-gray-700 dark:text-gray-300 space-y-2">
            <div className="text-[10px] font-black uppercase tracking-wider text-isot-burgundy dark:text-rose-400">
              Workshop Topics & Hands-on Outline:
            </div>
            <div className="space-y-1.5">
              {item.description.map((desc, dIdx) => {
                const parsed = parsePartHeader(desc);
                if (parsed.isPart) {
                  return (
                    <div
                      key={dIdx}
                      className="pt-2 first:pt-0 pb-1 flex flex-wrap items-center gap-1.5 border-b border-gray-100 dark:border-zinc-700/60 last:border-0"
                    >
                      {parsed.time && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-red-50 dark:bg-red-950/90 text-red-700 dark:text-red-300 border border-red-200/90 dark:border-red-900/70 font-black text-[11px] shadow-2xs">
                          <span>{parsed.time}</span>
                        </span>
                      )}
                      {parsed.partName && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-isot-burgundy/10 dark:bg-rose-950/60 text-isot-burgundy dark:text-rose-300 font-black text-[10px] border border-isot-burgundy/20 dark:border-rose-800/40">
                          {parsed.partName}
                        </span>
                      )}
                      <span className="font-black text-xs text-gray-900 dark:text-white">
                        {parsed.title}
                      </span>
                    </div>
                  );
                }
                return (
                  <div key={dIdx} className="flex items-start gap-2 pl-3 leading-relaxed text-[11px] text-gray-700 dark:text-gray-300">
                    <span className="text-isot-burgundy dark:text-rose-400 font-bold">›</span>
                    <span>{desc.replace(/^[\s»•]+/, '')}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Action footer */}
      <div className="flex items-center justify-between gap-3 pt-3 mt-2 border-t border-gray-100 dark:border-zinc-800/80">
        {!isSpecial ? (
          <Link
            to={`/talk/${item.id}`}
            className="text-xs font-bold text-isot-burgundy dark:text-rose-400 hover:text-isot-deep-burgundy flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
          >
            <span>View Details</span>
            <ChevronRight size={14} />
          </Link>
        ) : (
          <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
            ISOT 2026
          </span>
        )}

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
