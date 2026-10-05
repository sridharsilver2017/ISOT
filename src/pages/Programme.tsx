import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CONFERENCE_DAYS } from '../data/event';
import { useProgrammeStore } from '../store/programmeStore';
import { DaySelector } from '../components/DaySelector';
import { FilterBar } from '../components/FilterBar';
import { SessionCard } from '../components/SessionCard';
import { TalkCard } from '../components/TalkCard';
import { TimelineView } from '../components/TimelineView';
import { useScheduleStore } from '../store/scheduleStore';
import { Filter } from 'lucide-react';

export const Programme: React.FC = () => {
  const { date } = useParams<{ date?: string }>();
  const navigate = useNavigate();
  const { isTalkSaved, isSessionSaved } = useScheduleStore();
  const { sessions } = useProgrammeStore();

  // Active conference date (default to Friday 2026-10-09)
  const [activeDate, setActiveDate] = useState<string>(
    date || '2026-10-09'
  );

  useEffect(() => {
    if (date && ['2026-10-09', '2026-10-10', '2026-10-11'].includes(date)) {
      setActiveDate(date);
    }
  }, [date]);

  const handleDateChange = (newDate: string) => {
    setActiveDate(newDate);
    navigate(`/programme/${newDate}`, { replace: true });
  };

  // Filter states
  const [selectedHall, setSelectedHall] = useState<string>('All Halls');
  const [selectedTrack, setSelectedTrack] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('cards');
  const [displayMode, setDisplayMode] = useState<'sessions' | 'talks'>('sessions');

  // Filter sessions by active date
  const daySessions = sessions.filter((s) => s.date === activeDate);

  // Extract all tracks for active date
  const dayTracks = Array.from(
    new Set(daySessions.map((s) => s.track).filter(Boolean))
  ) as string[];

  // Filter sessions based on criteria
  const filteredSessions = daySessions.filter((session) => {
    // Hall filter
    if (selectedHall !== 'All Halls') {
      const matchHall =
        session.venue.toLowerCase().includes(selectedHall.toLowerCase()) ||
        selectedHall.toLowerCase().includes(session.venue.toLowerCase());
      if (!matchHall) return false;
    }

    // Track filter
    if (selectedTrack !== 'All' && session.track !== selectedTrack) {
      return false;
    }

    // Saved filter
    if (showSavedOnly) {
      const isSaved = isSessionSaved(session.id);
      const hasSavedTalks = session.items.some((i) => isTalkSaved(i.id));
      if (!isSaved && !hasSavedTalks) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const inTitle = session.title.toLowerCase().includes(query);
      const inVenue = session.venue.toLowerCase().includes(query);
      const inInCharge = session.sessionInCharge?.some((c) =>
        c.toLowerCase().includes(query)
      );
      const inItems = session.items.some(
        (i) =>
          i.title.toLowerCase().includes(query) ||
          i.speakers?.some((s) => s.toLowerCase().includes(query)) ||
          i.chairpersons?.some((c) => c.toLowerCase().includes(query)) ||
          i.panelists?.some((p) => p.toLowerCase().includes(query)) ||
          i.moderator?.toLowerCase().includes(query)
      );

      if (!inTitle && !inVenue && !inInCharge && !inItems) return false;
    }

    return true;
  });

  // Flattened items for talk view
  const allFilteredItems = filteredSessions.flatMap((s) => {
    if (!searchQuery.trim() && !showSavedOnly) return s.items;

    return s.items.filter((item) => {
      if (showSavedOnly && !isTalkSaved(item.id)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(q);
        const inSpeakers = item.speakers?.some((sp) => sp.toLowerCase().includes(q));
        const inChairs = item.chairpersons?.some((c) => c.toLowerCase().includes(q));
        const inPanelists = item.panelists?.some((p) => p.toLowerCase().includes(q));
        const inModerator = item.moderator?.toLowerCase().includes(q);
        const inVenue = item.venue.toLowerCase().includes(q);
        if (!inTitle && !inSpeakers && !inChairs && !inPanelists && !inModerator && !inVenue) {
          return false;
        }
      }
      return true;
    });
  });

  const activeDayInfo =
    CONFERENCE_DAYS.find((d) => d.date === activeDate) || CONFERENCE_DAYS[0];

  return (
    <div className="space-y-6 pb-12">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Scientific Programme
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Interactive schedule for ISOT 2026 Hyderabad
          </p>
        </div>

        {/* Display mode pills: Sessions vs Talks */}
        <div className="inline-flex bg-gray-200/80 dark:bg-zinc-800 p-1 rounded-2xl self-start sm:self-auto border border-gray-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => setDisplayMode('sessions')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              displayMode === 'sessions'
                ? 'bg-white dark:bg-zinc-900 text-isot-burgundy dark:text-rose-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
            }`}
          >
            Sessions ({filteredSessions.length})
          </button>
          <button
            type="button"
            onClick={() => setDisplayMode('talks')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              displayMode === 'talks'
                ? 'bg-white dark:bg-zinc-900 text-isot-burgundy dark:text-rose-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
            }`}
          >
            Individual Talks ({allFilteredItems.length})
          </button>
        </div>
      </div>

      {/* Horizontal Day Tabs */}
      <DaySelector selectedDate={activeDate} onSelectDate={handleDateChange} />

      {/* Filter Bar with Hall Pills, Search, Saved Toggle, View Switch */}
      <FilterBar
        selectedHall={selectedHall}
        onSelectHall={setSelectedHall}
        selectedTrack={selectedTrack}
        onSelectTrack={setSelectedTrack}
        tracks={dayTracks}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showSavedOnly={showSavedOnly}
        onToggleSavedOnly={() => setShowSavedOnly(!showSavedOnly)}
        viewMode={viewMode}
        onToggleViewMode={setViewMode}
        totalResultsCount={displayMode === 'sessions' ? filteredSessions.length : allFilteredItems.length}
      />

      {/* Main Content Area */}
      {viewMode === 'timeline' ? (
        <TimelineView items={allFilteredItems} date={activeDate} />
      ) : displayMode === 'sessions' ? (
        /* Sessions Card Grid */
        filteredSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 text-center border border-gray-200 dark:border-zinc-800">
            <Filter size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              No sessions match your filters
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">
              Try resetting the hall filter, track, or search keyword to see all sessions for {activeDayInfo.dayName}.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedHall('All Halls');
                setSelectedTrack('All');
                setSearchQuery('');
                setShowSavedOnly(false);
              }}
              className="px-4 py-2 rounded-xl bg-isot-burgundy text-white font-bold text-xs shadow-sm hover:bg-isot-deep-burgundy"
            >
              Reset All Filters
            </button>
          </div>
        )
      ) : (
        /* Individual Talks View */
        allFilteredItems.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allFilteredItems.map((item) => (
              <TalkCard key={item.id} item={item} showSessionContext />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 text-center border border-gray-200 dark:border-zinc-800">
            <Filter size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
              No individual talks match your query
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 max-w-sm mx-auto">
              Adjust your search keywords or reset filters to display talks.
            </p>
            <button
              type="button"
              onClick={() => {
                setSelectedHall('All Halls');
                setSelectedTrack('All');
                setSearchQuery('');
                setShowSavedOnly(false);
              }}
              className="px-4 py-2 rounded-xl bg-isot-burgundy text-white font-bold text-xs shadow-sm hover:bg-isot-deep-burgundy"
            >
              Reset All Filters
            </button>
          </div>
        )
      )}
    </div>
  );
};
