import React, { useState, useMemo } from 'react';
import { useProgrammeStore } from '../store/programmeStore';
import { SessionCard } from '../components/SessionCard';
import { TalkCard } from '../components/TalkCard';
import { SpeakerCard } from '../components/SpeakerCard';
import { getSessionItems } from '../types/programme';
import { Search as SearchIcon, X, Sparkles, Layers, Mic } from 'lucide-react';

export const Search: React.FC = () => {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'talks' | 'sessions' | 'speakers'>('all');

  const { sessions, getSpeakers } = useProgrammeStore();
  const speakers = getSpeakers();

  const popularSearches = ['ABMR', 'Om Lakhani', 'Hall B', 'Tacrolimus', 'Liver', 'ChatGPT', 'DCD', 'Swap'];

  // Global search filtering
  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return { sessions: [], talks: [], speakers: [], total: 0 };
    }

    // Sessions matching
    const matchingSessions = sessions.filter((session) => {
      const inTitle = session.title.toLowerCase().includes(q);
      const inVenue = session.venue.toLowerCase().includes(q);
      const inTrack = session.track?.toLowerCase().includes(q);
      const inInCharge = session.sessionInCharge?.some((c) => c.toLowerCase().includes(q));
      const inCoInCharge = session.coInCharge?.some((c) => c.toLowerCase().includes(q));
      const inCoordinators = session.programmeCoordinators?.some((c) => c.toLowerCase().includes(q));
      return inTitle || inVenue || inTrack || inInCharge || inCoInCharge || inCoordinators;
    });

    // Talks matching
    const allTalks = sessions.flatMap((s) => getSessionItems(s));
    const matchingTalks = allTalks.filter((item) => {
      const inTitle = item.title.toLowerCase().includes(q);
      const inVenue = item.venue.toLowerCase().includes(q);
      const inSession = item.sessionTitle.toLowerCase().includes(q);
      const inSpeakers = item.speakers?.some((s) => s.toLowerCase().includes(q));
      const inChairs = item.chairpersons?.some((c) => c.toLowerCase().includes(q));
      const inPanelists = item.panelists?.some((p) => p.toLowerCase().includes(q));
      const inModerator = item.moderator?.toLowerCase().includes(q) || item.moderators?.some((m) => m.toLowerCase().includes(q));
      const inCasePresenters = item.casePresenters?.some((cp) => cp.toLowerCase().includes(q));
      const inProSpeakers = item.proSpeakers?.some((ps) => ps.toLowerCase().includes(q));
      const inConSpeakers = item.conSpeakers?.some((cs) => cs.toLowerCase().includes(q));
      const inDescription = item.description?.some((d) => d.toLowerCase().includes(q));

      return (
        inTitle ||
        inVenue ||
        inSession ||
        inSpeakers ||
        inChairs ||
        inPanelists ||
        inModerator ||
        inCasePresenters ||
        inProSpeakers ||
        inConSpeakers ||
        inDescription
      );
    });

    // Speakers matching
    const matchingSpeakers = speakers.filter((speaker) => {
      const inName = speaker.name.toLowerCase().includes(q);
      const inRoles = speaker.roles.some(
        (r) =>
          r.talkTitle?.toLowerCase().includes(q) ||
          r.sessionTitle.toLowerCase().includes(q) ||
          r.venue.toLowerCase().includes(q)
      );
      return inName || inRoles;
    });

    const total = matchingSessions.length + matchingTalks.length + matchingSpeakers.length;

    return {
      sessions: matchingSessions,
      talks: matchingTalks,
      speakers: matchingSpeakers,
      total,
    };
  }, [query, sessions, speakers]);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Global Search
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Instant search across sessions, talks, faculty, moderators, and halls
        </p>
      </div>

      {/* Search Input Card */}
      <div className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="relative">
          <SearchIcon
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by topic, speaker name, keyword (e.g. ABMR, Hall B, Kute)..."
            autoFocus
            className="w-full pl-12 pr-10 py-3.5 bg-gray-50 dark:bg-zinc-800/90 text-gray-900 dark:text-white placeholder-gray-400 rounded-2xl text-sm sm:text-base font-medium border border-transparent focus:border-isot-burgundy focus:bg-white dark:focus:bg-zinc-900 outline-none transition-all shadow-inner"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-zinc-700"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <span className="text-gray-400 font-bold uppercase tracking-wider text-[11px]">Popular:</span>
          {popularSearches.map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => setQuery(term)}
              className="px-2.5 py-1 rounded-xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 font-medium transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Results View */}
      {query.trim() ? (
        <div className="space-y-6">
          {/* Result Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'all'
                  ? 'bg-isot-burgundy text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-800'
              }`}
            >
              All Results ({results.total})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('talks')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'talks'
                  ? 'bg-isot-burgundy text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-800'
              }`}
            >
              Talks ({results.talks.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('sessions')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'sessions'
                  ? 'bg-isot-burgundy text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-800'
              }`}
            >
              Sessions ({results.sessions.length})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('speakers')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                activeTab === 'speakers'
                  ? 'bg-isot-burgundy text-white shadow-sm'
                  : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-800'
              }`}
            >
              Faculty ({results.speakers.length})
            </button>
          </div>

          {results.total === 0 ? (
            <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 text-center border border-gray-200 dark:border-zinc-800">
              <SearchIcon size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                No matching results for "{query}"
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Try searching with different keywords or browse the full programme by day.
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Talks Group */}
              {(activeTab === 'all' || activeTab === 'talks') && results.talks.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-gray-200 dark:border-zinc-800">
                    <Sparkles size={16} className="text-isot-burgundy dark:text-rose-400" />
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                      Individual Talks ({results.talks.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.talks.map((item) => (
                      <TalkCard key={item.id} item={item} showSessionContext />
                    ))}
                  </div>
                </section>
              )}

              {/* Sessions Group */}
              {(activeTab === 'all' || activeTab === 'sessions') && results.sessions.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-gray-200 dark:border-zinc-800">
                    <Layers size={16} className="text-isot-burgundy dark:text-rose-400" />
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                      Conference Sessions ({results.sessions.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.sessions.map((session) => (
                      <SessionCard key={session.id} session={session} />
                    ))}
                  </div>
                </section>
              )}

              {/* Faculty Group */}
              {(activeTab === 'all' || activeTab === 'speakers') && results.speakers.length > 0 && (
                <section className="space-y-3">
                  <div className="flex items-center gap-2 pb-1 border-b border-gray-200 dark:border-zinc-800">
                    <Mic size={16} className="text-isot-burgundy dark:text-rose-400" />
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                      Faculty & Speakers ({results.speakers.length})
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                    {results.speakers.map((speaker) => (
                      <SpeakerCard key={speaker.id} speaker={speaker} />
                    ))}
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 text-center border border-gray-200 dark:border-zinc-800 space-y-2">
          <SearchIcon size={32} className="mx-auto text-isot-burgundy dark:text-rose-400 mb-2" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white">
            Search anything in the ISOT 2026 Programme
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
            Type speaker names, session titles, medical topics (e.g. ABMR, BK Virus, Tacrolimus), or hall names above.
          </p>
        </div>
      )}
    </div>
  );
};
