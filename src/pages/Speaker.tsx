import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProgrammeStore } from '../store/programmeStore';
import { useScheduleStore } from '../store/scheduleStore';
import { Award, ChevronLeft, ArrowRight, ArrowLeft, Bookmark, Share2, Check, MapPin } from 'lucide-react';
import { SpeakerAvatar } from '../components/SpeakerAvatar';

export const Speaker: React.FC = () => {
  const { speakerId } = useParams<{ speakerId: string }>();
  const navigate = useNavigate();
  const { getSpeakerById, getTalkById, getSessionById } = useProgrammeStore();
  const { isTalkSaved, toggleSaveTalk, isSessionSaved, toggleSaveSession } = useScheduleStore();
  const [copied, setCopied] = useState(false);

  const speaker = getSpeakerById(speakerId || '');

  if (!speaker) {
    return (
      <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-200 dark:border-zinc-800">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Faculty Member Not Found</h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
          The requested speaker could not be found in the conference database.
        </p>
        <Link
          to="/speakers"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-isot-burgundy text-white font-bold text-xs"
        >
          <ArrowLeft size={16} />
          Back to Faculty Directory
        </Link>
      </div>
    );
  }

  // Check if all of the speaker's contributions are saved
  const allSaved =
    speaker.roles.length > 0 &&
    speaker.roles.every((roleInfo) =>
      roleInfo.talkId
        ? isTalkSaved(roleInfo.talkId)
        : roleInfo.sessionId
        ? isSessionSaved(roleInfo.sessionId)
        : false
    );

  const saveOrUnsaveTalk = (talkId: string) => {
    const talkData = getTalkById(talkId);
    if (talkData) {
      const { item, session } = talkData;
      toggleSaveTalk({
        id: item.id,
        title: item.title,
        date: session.date,
        dayName: session.dayName,
        startTime: item.startTime,
        endTime: item.endTime,
        venue: session.venue,
        speakers: item.speakers,
        sessionId: session.id,
        sessionTitle: session.title,
      });
    }
  };

  const saveOrUnsaveSession = (sessionId: string) => {
    const session = getSessionById(sessionId);
    if (session) {
      toggleSaveSession({
        id: session.id,
        title: session.title,
        date: session.date,
        dayName: session.dayName,
        startTime: session.startTime,
        endTime: session.endTime,
        venue: session.venue,
      });
    }
  };

  const handleToggleSaveAll = () => {
    if (allSaved) {
      // Remove all
      speaker.roles.forEach((roleInfo) => {
        if (roleInfo.talkId && isTalkSaved(roleInfo.talkId)) {
          saveOrUnsaveTalk(roleInfo.talkId);
        } else if (roleInfo.sessionId && isSessionSaved(roleInfo.sessionId)) {
          saveOrUnsaveSession(roleInfo.sessionId);
        }
      });
    } else {
      // Save all that are not yet saved
      speaker.roles.forEach((roleInfo) => {
        if (roleInfo.talkId) {
          if (!isTalkSaved(roleInfo.talkId)) {
            saveOrUnsaveTalk(roleInfo.talkId);
          }
        } else if (roleInfo.sessionId) {
          if (!isSessionSaved(roleInfo.sessionId)) {
            saveOrUnsaveSession(roleInfo.sessionId);
          }
        }
      });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${speaker.name} - ISOT 2026 Faculty`,
          text: `Check out ${speaker.name}'s schedule and talks at ISOT 2026.`,
          url,
        });
      } catch (err) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex items-center justify-between gap-3 text-xs">
        <nav className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-medium">
          <Link
            to="/speakers"
            className="hover:text-isot-burgundy dark:hover:text-rose-400 transition-colors flex items-center gap-1"
          >
            <ChevronLeft size={14} />
            <span>Faculty</span>
          </Link>
          <span className="text-gray-300 dark:text-zinc-700">/</span>
          <span className="text-gray-700 dark:text-gray-300 font-semibold">{speaker.name}</span>
        </nav>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 font-bold hover:border-isot-burgundy dark:hover:border-rose-500 hover:text-isot-burgundy dark:hover:text-rose-400 transition-all shadow-2xs cursor-pointer"
        >
          <ChevronLeft size={14} />
          <span>Back</span>
        </button>
      </div>

      {/* Speaker Header Card */}
      <div className="relative overflow-hidden bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-zinc-800 shadow-sm">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-radial from-rose-500/10 to-transparent rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 sm:gap-6">
          <SpeakerAvatar name={speaker.name} size="xl" className="shadow-lg shadow-isot-burgundy/25 shrink-0" />

          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold text-xs mb-2">
              <Award size={13} />
              <span>ISOT 2026 Faculty</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              {speaker.name}
            </h1>

            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
              Contributing to <strong>{speaker.roles.length}</strong> session item{speaker.roles.length > 1 ? 's' : ''} at ISOT 2026
            </p>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={handleToggleSaveAll}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-sm cursor-pointer ${
                  allSaved
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                    : 'bg-isot-burgundy hover:bg-isot-deep-burgundy text-white shadow-isot-burgundy/25'
                }`}
              >
                <Bookmark size={15} className={allSaved ? 'fill-white' : ''} />
                <span>{allSaved ? 'Saved in My Day' : 'Save to Schedule'}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-zinc-700 font-semibold text-xs sm:text-sm transition-colors cursor-pointer"
                title="Share faculty link"
              >
                {copied ? (
                  <>
                    <Check size={14} className="text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 size={14} />
                    <span>Share</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Faculty Contributions Timeline */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
            Programme Appearances & Schedule
          </h2>
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
            {speaker.roles.length} {speaker.roles.length === 1 ? 'Slot' : 'Slots'}
          </span>
        </div>

        <div className="space-y-3">
          {speaker.roles.map((roleInfo, idx) => {
            const isSaved = roleInfo.talkId
              ? isTalkSaved(roleInfo.talkId)
              : roleInfo.sessionId
              ? isSessionSaved(roleInfo.sessionId)
              : false;

            const handleToggleItem = () => {
              if (roleInfo.talkId) {
                saveOrUnsaveTalk(roleInfo.talkId);
              } else if (roleInfo.sessionId) {
                saveOrUnsaveSession(roleInfo.sessionId);
              }
            };

            return (
              <div
                key={idx}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-5 border border-gray-200/80 dark:border-zinc-800 shadow-sm hover:border-isot-burgundy/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-2 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full bg-isot-burgundy/10 text-isot-burgundy dark:bg-rose-950/60 dark:text-rose-300">
                      {roleInfo.role}
                    </span>

                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/80 px-2 py-0.5 rounded-lg border border-red-200/80 dark:border-red-900/60">
                      {roleInfo.time}
                    </span>

                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                      <MapPin size={11} className="text-gray-400" />
                      <span>{roleInfo.venue}</span>
                    </span>

                    {roleInfo.date && (
                      <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                        {roleInfo.date}
                      </span>
                    )}
                  </div>

                  {roleInfo.talkTitle ? (
                    <Link
                      to={`/talk/${roleInfo.talkId}`}
                      className="block font-bold text-sm sm:text-base text-gray-900 dark:text-white hover:text-isot-burgundy dark:hover:text-rose-400 leading-snug"
                    >
                      {roleInfo.talkTitle}
                    </Link>
                  ) : (
                    <div className="font-bold text-sm sm:text-base text-gray-900 dark:text-white leading-snug">
                      {roleInfo.sessionTitle}
                    </div>
                  )}

                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Session:{' '}
                    <Link
                      to={`/session/${roleInfo.sessionId}`}
                      className="text-isot-burgundy dark:text-rose-400 hover:underline font-medium"
                    >
                      {roleInfo.sessionTitle}
                    </Link>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={handleToggleItem}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-2xs cursor-pointer ${
                      isSaved
                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-rose-50 hover:text-isot-burgundy dark:hover:bg-zinc-700'
                    }`}
                    title={isSaved ? 'Saved in My Schedule' : 'Save to My Schedule'}
                  >
                    <Bookmark size={13} className={isSaved ? 'fill-white' : ''} />
                    <span>{isSaved ? 'Saved' : 'Save'}</span>
                  </button>

                  {roleInfo.talkId ? (
                    <Link
                      to={`/talk/${roleInfo.talkId}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 text-xs font-bold hover:bg-isot-burgundy hover:text-white transition-colors"
                    >
                      <span>View Talk</span>
                      <ArrowRight size={14} />
                    </Link>
                  ) : (
                    <Link
                      to={`/session/${roleInfo.sessionId}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 text-xs font-bold hover:bg-isot-burgundy hover:text-white transition-colors"
                    >
                      <span>View Session</span>
                      <ArrowRight size={14} />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
