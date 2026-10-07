import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProgrammeStore, slugify } from '../store/programmeStore';
import { MapPin, User, Users, Mic, Award, ChevronLeft, Bookmark, Share2, Calendar, ArrowLeft } from 'lucide-react';
import { useScheduleStore } from '../store/scheduleStore';
import { getTypeBadgeColor, parsePartHeader } from '../utils/timeUtils';
import { SpeakerAvatar } from '../components/SpeakerAvatar';

export const Talk: React.FC = () => {
  const { talkId } = useParams<{ talkId: string }>();
  const navigate = useNavigate();
  const { getTalkById } = useProgrammeStore();
  const result = getTalkById(talkId || '');
  const { isTalkSaved, toggleSaveTalk } = useScheduleStore();

  if (!result) {
    return (
      <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-200 dark:border-zinc-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Talk Not Found</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          The requested programme item could not be found.
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

  const { item, session } = result;
  const saved = isTalkSaved(item.id);
  const badge = getTypeBadgeColor(item.type);

  const handleToggleSave = () => {
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

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${item.title} - ISOT 2026`,
          text: `Join "${item.title}" at ISOT 2026 (${item.venue}, ${item.startTime})`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Talk link copied to clipboard!');
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Back Button */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-isot-burgundy dark:hover:text-rose-400 transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      {/* Main Talk Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-zinc-800 shadow-sm relative space-y-6">
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/90 text-red-700 dark:text-red-300 border border-red-200/90 dark:border-red-900/70 font-black text-xs shadow-2xs">
            <span>{item.startTime} {item.endTime ? `– ${item.endTime}` : ''}</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 font-bold text-xs border border-gray-200/80 dark:border-zinc-700">
            <Calendar size={13} className="text-isot-burgundy dark:text-rose-400" />
            <span>{item.dayName}, {session.dayDisplay} 2026</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-200 font-bold text-xs border border-gray-200/80 dark:border-zinc-700">
            <MapPin size={13} className="text-isot-burgundy dark:text-rose-400" />
            <span>{item.venue}</span>
          </span>

          {item.type && item.type !== 'talk' && (
            <span
              className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-extrabold border ${badge.bg} ${badge.text} ${badge.border}`}
            >
              {badge.label}
            </span>
          )}
        </div>

        {/* Parent Session Reference */}
        <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/60 dark:border-zinc-700/60 flex items-center justify-between">
          <div className="min-w-0 pr-2">
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 dark:text-gray-500 block mb-0.5">
              Part of Session
            </span>
            <Link
              to={`/session/${session.id}`}
              className="text-xs sm:text-sm font-bold text-isot-burgundy dark:text-rose-400 hover:underline line-clamp-1"
            >
              {session.title}
            </Link>
          </div>
          <Link to={`/session/${session.id}`} className="text-gray-400 hover:text-isot-burgundy shrink-0">
            <ChevronLeft size={16} className="rotate-180" />
          </Link>
        </div>

        {/* Talk Title */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight leading-snug">
            {item.title}
          </h1>
        </div>

        {/* Faculty Breakdown Section */}
        <div className="space-y-4 pt-4 border-t border-gray-100 dark:border-zinc-800">
          {/* Speakers */}
          {item.speakers && item.speakers.length > 0 && (
            <div className="bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl p-4 border border-rose-100 dark:border-rose-900/40">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-isot-burgundy dark:text-rose-400 mb-2">
                <Mic size={16} />
                <span>Faculty Speaker{item.speakers.length > 1 ? 's' : ''}</span>
              </div>
              <div className="space-y-2">
                {item.speakers.map((sp) => (
                  <Link
                    key={sp}
                    to={`/speaker/${slugify(sp)}`}
                    className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-zinc-900 border border-rose-100 dark:border-zinc-800 hover:border-isot-burgundy transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <SpeakerAvatar name={sp} size="sm" />
                      <span className="font-extrabold text-sm text-gray-900 dark:text-white group-hover:text-isot-burgundy">
                        {sp}
                      </span>
                    </div>
                    <span className="text-xs text-isot-burgundy font-semibold">View Profile →</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Panelists */}
          {item.panelists && item.panelists.length > 0 && (
            <div className="bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl p-4 border border-indigo-100 dark:border-indigo-900/40">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 mb-2">
                <Users size={16} />
                <span>Panelists</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {item.panelists.map((p) => (
                  <Link
                    key={p}
                    to={`/speaker/${slugify(p)}`}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-indigo-100 dark:border-zinc-800 hover:border-indigo-500 transition-colors"
                  >
                    <SpeakerAvatar name={p} size="sm" />
                    <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                      {p}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Moderator */}
          {item.moderator && (
            <div className="bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl p-4 border border-amber-100 dark:border-amber-900/40">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2">
                <Award size={16} />
                <span>Moderator</span>
              </div>
              <Link
                to={`/speaker/${slugify(item.moderator)}`}
                className="inline-flex items-center gap-2.5 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-amber-100 dark:border-zinc-800 hover:border-amber-500 transition-colors"
              >
                <SpeakerAvatar name={item.moderator} size="sm" />
                <span className="font-extrabold text-sm text-gray-900 dark:text-white">
                  {item.moderator}
                </span>
              </Link>
            </div>
          )}

          {/* Chairpersons */}
          {item.chairpersons && item.chairpersons.length > 0 && (
            <div className="bg-sky-50/50 dark:bg-sky-950/20 rounded-2xl p-4 border border-sky-100 dark:border-sky-900/40">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-400 mb-2">
                <User size={16} />
                <span>Chairperson{item.chairpersons.length > 1 ? 's' : ''}</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {item.chairpersons.map((c) => (
                  <Link
                    key={c}
                    to={`/speaker/${slugify(c)}`}
                    className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-zinc-900 border border-sky-100 dark:border-zinc-800 hover:border-sky-500 transition-colors"
                  >
                    <SpeakerAvatar name={c} size="sm" />
                    <span className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white">
                      {c}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Debate Pro / Con */}
          {item.proSpeakers && (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
              <div className="text-xs font-bold text-emerald-800 dark:text-emerald-300 mb-1">
                Debate — PRO Position:
              </div>
              <div className="font-extrabold text-sm text-gray-900 dark:text-white">
                {item.proSpeakers.join(', ')}
              </div>
            </div>
          )}
          {item.conSpeakers && (
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800">
              <div className="text-xs font-bold text-rose-800 dark:text-rose-300 mb-1">
                Debate — CON Position:
              </div>
              <div className="font-extrabold text-sm text-gray-900 dark:text-white">
                {item.conSpeakers.join(', ')}
              </div>
            </div>
          )}

          {/* Descriptions / Workshop Outlines */}
          {item.description && item.description.length > 0 && (
            <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-50/70 to-amber-50/30 dark:from-zinc-800/80 dark:to-zinc-800/40 border border-rose-100/90 dark:border-zinc-700/60 text-xs text-gray-700 dark:text-gray-300 space-y-3">
              <div className="text-[11px] font-black uppercase tracking-wider text-isot-burgundy dark:text-rose-400">
                Workshop Topics & Hands-on Outline:
              </div>
              <div className="space-y-2">
                {item.description.map((desc, idx) => {
                  const parsed = parsePartHeader(desc);
                  if (parsed.isPart) {
                    return (
                      <div
                        key={idx}
                        className="pt-3 first:pt-0 pb-1.5 flex flex-wrap items-center gap-2 border-b border-gray-100 dark:border-zinc-700/60 last:border-0"
                      >
                        {parsed.time && (
                          <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-red-50 dark:bg-red-950/90 text-red-700 dark:text-red-300 border border-red-200/90 dark:border-red-900/70 font-black text-xs shadow-2xs">
                            <span>{parsed.time}</span>
                          </span>
                        )}
                        {parsed.partName && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-isot-burgundy/10 dark:bg-rose-950/60 text-isot-burgundy dark:text-rose-300 font-black text-xs border border-isot-burgundy/20 dark:border-rose-800/40">
                            {parsed.partName}
                          </span>
                        )}
                        <span className="font-black text-sm sm:text-base text-gray-900 dark:text-white">
                          {parsed.title}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div key={idx} className="flex items-start gap-2 pl-4 leading-relaxed text-xs sm:text-sm text-gray-700 dark:text-gray-300">
                      <span className="text-isot-burgundy dark:text-rose-400 font-bold">›</span>
                      <span>{desc.replace(/^[\s»•]+/, '')}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Action Bar */}
        <div className="flex flex-wrap items-center gap-3 pt-6 border-t border-gray-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={handleToggleSave}
            className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all active:scale-95 ${
              saved
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/25'
                : 'bg-isot-burgundy hover:bg-isot-deep-burgundy text-white shadow-lg shadow-isot-burgundy/25'
            }`}
          >
            <Bookmark size={18} className={saved ? 'fill-white' : ''} />
            <span>{saved ? '★ Saved in My Schedule' : '☆ Add to My Schedule'}</span>
          </button>

          <button
            type="button"
            onClick={handleShare}
            className="p-3 rounded-2xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 transition-colors"
            title="Share talk"
          >
            <Share2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};
