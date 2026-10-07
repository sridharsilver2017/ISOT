import React from 'react';
import { Link } from 'react-router-dom';
import { Session } from '../types/programme';
import { MapPin, User, ChevronRight, Bookmark, Layers } from 'lucide-react';
import { useScheduleStore } from '../store/scheduleStore';

interface SessionCardProps {
  session: Session;
}

export const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const { isSessionSaved, toggleSaveSession } = useScheduleStore();
  const saved = isSessionSaved(session.id);

  const handleToggleSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSaveSession({
      id: session.id,
      title: session.title,
      date: session.date,
      dayName: session.dayName,
      startTime: session.startTime,
      endTime: session.endTime,
      venue: session.venue,
    });
  };

  return (
    <div className="group bg-white dark:bg-zinc-900 rounded-3xl p-4 sm:p-6 border border-gray-200/90 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-isot-burgundy/30 dark:hover:border-rose-900/40 transition-all duration-200 relative flex flex-col justify-between w-full max-w-full overflow-hidden break-words">
      <div>
        {/* Top Meta: Time & Hall Badge */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="inline-flex items-center px-3 py-1 rounded-xl bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 font-black text-xs sm:text-sm">
            <span>{session.startTime} – {session.endTime}</span>
          </div>

          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-semibold text-xs">
            <MapPin size={13} className="text-isot-burgundy dark:text-rose-400" />
            <span>{session.venue}</span>
          </div>
        </div>

        {/* Session Title */}
        <Link to={`/session/${session.id}`} className="block">
          <h3 className="text-lg sm:text-xl font-black tracking-tight text-gray-900 dark:text-white group-hover:text-isot-burgundy dark:group-hover:text-rose-400 transition-colors leading-snug mb-3">
            {session.title}
          </h3>
        </Link>

        {/* Session In-Charge */}
        {session.sessionInCharge && session.sessionInCharge.length > 0 && (
          <div className="mb-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
            <User size={15} className="text-isot-gold shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-gray-500 dark:text-gray-400">
                Session In-charge{session.sessionInCharge.length > 1 ? 's' : ''}:
              </span>{' '}
              <span className="font-bold text-gray-900 dark:text-gray-200">
                {session.sessionInCharge.join(', ')}
              </span>
            </div>
          </div>
        )}

        {/* Co-in-charge / Programme Coordinators */}
        {session.programmeCoordinators && (
          <div className="mb-4 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
            <Layers size={14} className="text-gray-400 shrink-0" />
            <span>
              <strong className="font-semibold">Coordinators:</strong>{' '}
              {session.programmeCoordinators.join(', ')}
            </span>
          </div>
        )}

        {/* Programme count preview */}
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-5 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          <span>{session.sections && session.sections.length > 0 ? session.sections.reduce((acc, sec) => acc + (sec.items?.length || 0), 0) : (session.items?.length || 0)} programme items</span>
          {session.sections && session.sections.length > 1 && (
            <span className="text-isot-burgundy dark:text-rose-400 font-semibold">• {session.sections.length} sub-sessions</span>
          )}
          {session.page && (
            <span className="text-gray-400 dark:text-gray-500">• Page {session.page}</span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
        <Link
          to={`/session/${session.id}`}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-isot-burgundy hover:bg-isot-deep-burgundy text-white font-bold text-xs sm:text-sm transition-all shadow-sm shadow-isot-burgundy/25 active:scale-95"
        >
          <span>View Programme</span>
          <ChevronRight size={16} />
        </Link>

        <button
          type="button"
          onClick={handleToggleSave}
          className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all active:scale-95 ${
            saved
              ? 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-700'
              : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700'
          }`}
        >
          <Bookmark size={15} className={saved ? 'fill-amber-500 text-amber-500' : ''} />
          <span>{saved ? 'Saved' : 'Save'}</span>
        </button>
      </div>
    </div>
  );
};
