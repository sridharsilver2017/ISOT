import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProgrammeStore } from '../store/programmeStore';
import { Clock, MapPin, User, ChevronLeft, Bookmark, Share2, Layers, Calendar, ArrowLeft, Edit2 } from 'lucide-react';
import { useScheduleStore } from '../store/scheduleStore';
import { TalkCard } from '../components/TalkCard';

export const Session: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { getSessionById } = useProgrammeStore();
  const session = getSessionById(sessionId || '');
  const { isSessionSaved, toggleSaveSession } = useScheduleStore();

  if (!session) {
    return (
      <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-200 dark:border-zinc-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Session Not Found</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          The requested session could not be found in the ISOT 2026 programme.
        </p>
        <Link
          to="/programme"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-isot-burgundy text-white font-bold text-xs"
        >
          <ArrowLeft size={16} />
          Back to Programme
        </Link>
      </div>
    );
  }

  const saved = isSessionSaved(session.id);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${session.title} - ISOT 2026`,
          text: `Check out ${session.title} at ISOT 2026 (${session.venue}, ${session.dayDisplay})`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Session link copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Back Button & Admin Shortcut */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-isot-burgundy dark:hover:text-rose-400 transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>

        <Link
          to="/admin"
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-300 hover:text-isot-burgundy text-xs font-bold transition-colors"
        >
          <Edit2 size={13} />
          <span>Edit in Admin</span>
        </Link>
      </div>

      {/* Main Header Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-zinc-800 shadow-sm relative overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-isot-light-pink dark:bg-rose-950/40 text-isot-burgundy dark:text-rose-300 font-bold text-xs">
            <Clock size={14} className="stroke-[2.5]" />
            {session.startTime} – {session.endTime}
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 font-semibold text-xs">
            <Calendar size={13} className="text-isot-burgundy dark:text-rose-400" />
            {session.dayName}, {session.dayDisplay} 2026
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 font-semibold text-xs">
            <MapPin size={13} className="text-amber-600" />
            {session.venue}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-snug mb-4">
          {session.title}
        </h1>

        {/* In-Charge Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-zinc-800">
          {session.sessionInCharge && session.sessionInCharge.length > 0 && (
            <div className="flex items-start gap-2 text-xs sm:text-sm">
              <User size={16} className="text-isot-gold shrink-0 mt-0.5" />
              <div>
                <span className="text-gray-400 font-medium">Session In-charge:</span>{' '}
                <span className="font-bold text-gray-900 dark:text-white">
                  {session.sessionInCharge.join(', ')}
                </span>
              </div>
            </div>
          )}

          {session.coInCharge && session.coInCharge.length > 0 && (
            <div className="flex items-start gap-2 text-xs sm:text-sm">
              <User size={16} className="text-isot-gold shrink-0 mt-0.5" />
              <div>
                <span className="text-gray-400 font-medium">Co-In-Charge:</span>{' '}
                <span className="font-bold text-gray-900 dark:text-white">
                  {session.coInCharge.join(', ')}
                </span>
              </div>
            </div>
          )}

          {session.programmeCoordinators && (
            <div className="flex items-start gap-2 text-xs sm:text-sm">
              <Layers size={16} className="text-gray-400 shrink-0 mt-0.5" />
              <div>
                <span className="text-gray-400 font-medium">Programme Coordinators:</span>{' '}
                <span className="font-bold text-gray-900 dark:text-white">
                  {session.programmeCoordinators.join(', ')}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() =>
              toggleSaveSession({
                id: session.id,
                title: session.title,
                date: session.date,
                dayName: session.dayName,
                startTime: session.startTime,
                endTime: session.endTime,
                venue: session.venue,
              })
            }
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 ${
              saved
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-isot-burgundy hover:bg-isot-deep-burgundy text-white shadow-md shadow-isot-burgundy/25'
            }`}
          >
            <Bookmark size={16} className={saved ? 'fill-white' : ''} />
            <span>{saved ? 'Session Saved in My Day' : 'Save Entire Session'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
            title="Share session"
          >
            <Share2 size={18} />
          </button>
        </div>
      </div>

      {/* Programme Items Sequence */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
            Programme Sequence ({session.items.length} items)
          </h2>
          <span className="text-xs text-gray-500 dark:text-gray-400">Chronological Order</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {session.items.map((item) => (
            <TalkCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </div>
  );
};
