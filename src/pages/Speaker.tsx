import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProgrammeStore } from '../store/programmeStore';
import { Award, ChevronLeft, ArrowRight, ArrowLeft } from 'lucide-react';

export const Speaker: React.FC = () => {
  const { speakerId } = useParams<{ speakerId: string }>();
  const navigate = useNavigate();
  const { getSpeakerById } = useProgrammeStore();
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

  return (
    <div className="space-y-6 pb-12 max-w-4xl mx-auto">
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-isot-burgundy dark:hover:text-rose-400 transition-colors"
        >
          <ChevronLeft size={16} />
          <span>Back</span>
        </button>
      </div>

      {/* Speaker Header Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-zinc-800 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-5">
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-br from-isot-burgundy to-isot-deep-burgundy flex items-center justify-center text-white font-black text-3xl sm:text-4xl shadow-lg shadow-isot-burgundy/25 shrink-0">
          {speaker.name.charAt(0)}
        </div>

        <div className="text-center sm:text-left flex-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 font-bold text-xs mb-2">
            <Award size={13} />
            <span>ISOT 2026 Faculty</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            {speaker.name}
          </h1>

          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1">
            Contributing to {speaker.roles.length} session item{speaker.roles.length > 1 ? 's' : ''} at ISOT 2026
          </p>
        </div>
      </div>

      {/* Faculty Contributions Timeline */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
          Programme Appearances & Schedule
        </h2>

        <div className="space-y-3">
          {speaker.roles.map((roleInfo, idx) => {
            return (
              <div
                key={idx}
                className="bg-white dark:bg-zinc-900 rounded-2xl p-4 sm:p-5 border border-gray-200/80 dark:border-zinc-800 shadow-sm hover:border-isot-burgundy/30 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full bg-isot-burgundy/10 text-isot-burgundy dark:bg-rose-950/60 dark:text-rose-300">
                      {roleInfo.role}
                    </span>

                    <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                      {roleInfo.time}
                    </span>

                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full">
                      {roleInfo.venue}
                    </span>
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

                <div className="flex items-center gap-2 self-end sm:self-center">
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
