import React, { useState, useEffect, useMemo, useRef } from 'react';
import { HALLS } from '../data/halls';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CONFERENCE_DAYS } from '../data/event';
import { useProgrammeStore } from '../store/programmeStore';
import { DaySelector } from '../components/DaySelector';
import { FilterBar } from '../components/FilterBar';
import { SessionCard } from '../components/SessionCard';
import { TalkCard } from '../components/TalkCard';
import { TimelineView } from '../components/TimelineView';
import { useScheduleStore } from '../store/scheduleStore';
import { getSessionItems } from '../types/programme';
import { Filter, FileDown, Radio } from 'lucide-react';
import { PdfExportModal } from '../components/PdfExportModal';
import { getEffectiveSessionStatus, getEffectiveItemStatus, isTodayConferenceDay, getTodayDateIso } from '../utils/timeUtils';

export const Programme: React.FC = () => {
  const { date } = useParams<{ date?: string }>();
  const [searchParams] = useSearchParams();
  const targetTalkId = searchParams.get('talk');
  const navigate = useNavigate();
  const { isTalkSaved, isSessionSaved } = useScheduleStore();
  const { sessions, lastRefreshedAt } = useProgrammeStore();
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);

  // Active conference date (default to today if conference is active, else Friday 2026-10-09)
  const [activeDate, setActiveDate] = useState<string>(
    date || (isTodayConferenceDay() ? getTodayDateIso() : '2026-10-09')
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
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showSavedOnly, setShowSavedOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'cards' | 'timeline'>('cards');
  const [displayMode, setDisplayMode] = useState<'sessions' | 'talks'>('sessions');

  // Filter sessions by active date
  const daySessions = useMemo(() => {
    return sessions.filter((s) => s.date === activeDate);
  }, [sessions, activeDate]);

  // Compute available halls that actually have at least 1 session on this day
  const availableHalls = useMemo(() => {
    const hallNamesWithSessions = new Set<string>();
    daySessions.forEach((s) => {
      if (s.venue && s.venue.trim() && s.venue.trim() !== 'As per programme') {
        hallNamesWithSessions.add(s.venue.trim());
      }
    });

    const matchedHalls = HALLS.filter((h) =>
      hallNamesWithSessions.has(h.name) ||
      Array.from(hallNamesWithSessions).some(
        (v) => v.toLowerCase().includes(h.name.toLowerCase()) || h.name.toLowerCase().includes(v.toLowerCase())
      )
    );

    // Also include any dynamic venue from database not explicitly in static HALLS
    const knownNames = new Set(matchedHalls.map((h) => h.name.toLowerCase()));
    hallNamesWithSessions.forEach((vName) => {
      const alreadyCovered = Array.from(knownNames).some(
        (kn) => kn === vName.toLowerCase() || kn.includes(vName.toLowerCase()) || vName.toLowerCase().includes(kn)
      );
      if (!alreadyCovered) {
        matchedHalls.push({
          id: vName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
          name: vName,
          shortName: vName,
          capacity: '',
          floor: '',
          description: `Venue for ${vName}`,
          color: '#0D9488',
        });
      }
    });

    return matchedHalls;
  }, [daySessions]);

  // If selected hall has 0 sessions on this newly selected day, auto-reset to 'All Halls'
  useEffect(() => {
    if (selectedHall !== 'All Halls') {
      const isHallAvailable = availableHalls.some(
        (h) =>
          h.name.toLowerCase().includes(selectedHall.toLowerCase()) ||
          selectedHall.toLowerCase().includes(h.name.toLowerCase())
      );
      if (!isHallAvailable) {
        setSelectedHall('All Halls');
      }
    }
  }, [activeDate, availableHalls, selectedHall]);

  // Extract all tracks with active sessions for active date (filtered by selectedHall if specified)
  const dayTracks = useMemo(() => {
    const relevant = selectedHall === "All Halls"
      ? daySessions
      : daySessions.filter((s) =>
          s.venue.toLowerCase().includes(selectedHall.toLowerCase()) ||
          selectedHall.toLowerCase().includes(s.venue.toLowerCase())
        );
    return Array.from(
      new Set(relevant.map((s) => s.track).filter(Boolean))
    ) as string[];
  }, [daySessions, selectedHall]);

  // If selected track has 0 sessions on this newly selected day/hall, auto-reset to "All"
  useEffect(() => {
    if (selectedTrack !== "All" && !dayTracks.includes(selectedTrack)) {
      setSelectedTrack("All");
    }
  }, [dayTracks, selectedTrack]);

  // Filter sessions based on criteria (recomputed whenever date, filters or 30s auto-refresh ticks)
  const filteredSessions = useMemo(() => {
    return daySessions.filter((session) => {
      const items = getSessionItems(session);
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

      // Status filter
      if (selectedStatus !== 'all') {
        const sessionStatus = getEffectiveSessionStatus(session);
        const hasMatchingTalks = items.some((i) => getEffectiveItemStatus(i) === selectedStatus);
        if (sessionStatus !== selectedStatus && !hasMatchingTalks) return false;
      }

      // Saved filter
      if (showSavedOnly) {
        const isSaved = isSessionSaved(session.id);
        const hasSavedTalks = items.some((i) => isTalkSaved(i.id));
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
        const inItems = items.some(
          (i) =>
            i.title.toLowerCase().includes(query) ||
            i.speakers?.some((s) => s.toLowerCase().includes(query)) ||
            i.chairpersons?.some((c) => c.toLowerCase().includes(query)) ||
            i.panelists?.some((p) => p.toLowerCase().includes(query)) ||
            i.moderator?.toLowerCase().includes(query) ||
            i.moderators?.some((m) => m.toLowerCase().includes(query))
        );

        if (!inTitle && !inVenue && !inInCharge && !inItems) return false;
      }

      return true;
    });
  }, [daySessions, selectedHall, selectedTrack, selectedStatus, showSavedOnly, searchQuery, isSessionSaved, isTalkSaved, lastRefreshedAt]);

  // Flattened items for talk view
  const allFilteredItems = filteredSessions.flatMap((s) => {
    const items = getSessionItems(s);

    return items.filter((item) => {
      if (selectedStatus !== 'all' && getEffectiveItemStatus(item) !== selectedStatus) {
        return false;
      }

      if (showSavedOnly && !isTalkSaved(item.id)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inTitle = item.title.toLowerCase().includes(q);
        const inSpeakers = item.speakers?.some((sp) => sp.toLowerCase().includes(q));
        const inChairs = item.chairpersons?.some((c) => c.toLowerCase().includes(q));
        const inPanelists = item.panelists?.some((p) => p.toLowerCase().includes(q));
        const inModerator = item.moderator?.toLowerCase().includes(q) || item.moderators?.some((m) => m.toLowerCase().includes(q));
        const inVenue = item.venue.toLowerCase().includes(q);
        if (!inTitle && !inSpeakers && !inChairs && !inPanelists && !inModerator && !inVenue) {
          return false;
        }
      }
      return true;
    });
  });

  const liveItemsOnActiveDay = useMemo(() => {
    return daySessions
      .flatMap((s) => getSessionItems(s))
      .filter((i) => getEffectiveItemStatus(i) === 'ongoing');
  }, [daySessions]);
  const hasLiveItems = liveItemsOnActiveDay.length > 0;

  const autoJumpedDateRef = useRef<Record<string, boolean>>({});

  const scrollToLiveOrTarget = (smooth = true): boolean => {
    if (targetTalkId) {
      const targetEl = document.getElementById(`talk-${targetTalkId}`);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' });
        targetEl.classList.add('ring-4', 'ring-inset', 'ring-red-500', 'shadow-2xl');
        setTimeout(() => targetEl.classList.remove('ring-4', 'ring-inset', 'ring-red-500', 'shadow-2xl'), 2500);
        return true;
      }
    }

    const liveEl = document.querySelector('[data-live="true"]') as HTMLElement | null;
    if (liveEl) {
      liveEl.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' });
      liveEl.classList.add('ring-4', 'ring-inset', 'ring-emerald-500', 'shadow-2xl');
      setTimeout(() => liveEl.classList.remove('ring-4', 'ring-inset', 'ring-emerald-500', 'shadow-2xl'), 2500);
      return true;
    }

    return false;
  };

  const scrollToUpcoming = (smooth = true): boolean => {
    const upcomingEl = document.querySelector('[data-upcoming="true"]') as HTMLElement | null;
    if (upcomingEl) {
      upcomingEl.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'center' });
      return true;
    }
    return false;
  };

  // Automatically jump to live talks when opened
  useEffect(() => {
    if (autoJumpedDateRef.current[activeDate]) return;

    const hasItems =
      displayMode === 'sessions' ? filteredSessions.length > 0 : allFilteredItems.length > 0;
    if (!hasItems) return;

    const timer = setTimeout(() => {
      const jumped = scrollToLiveOrTarget(true);
      if (jumped) {
        autoJumpedDateRef.current[activeDate] = true;
      } else if (activeDate === getTodayDateIso()) {
        const upJumped = scrollToUpcoming(true);
        if (upJumped) {
          autoJumpedDateRef.current[activeDate] = true;
        }
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [activeDate, displayMode, viewMode, filteredSessions.length, allFilteredItems.length, targetTalkId]);

  const activeDayInfo =
    CONFERENCE_DAYS.find((d) => d.date === activeDate) || CONFERENCE_DAYS[0];

  return (
    <div className="space-y-4 sm:space-y-6 pb-12 w-full max-w-full">
      {/* Header Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Scientific Programme
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Interactive schedule for ISOT 2026 Hyderabad
          </p>
        </div>

        {/* Action controls: Live Jump, Mode switcher & PDF Export */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          {/* Quick Actions (Live Jump + PDF) */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            {hasLiveItems && (
              <button
                type="button"
                onClick={() => scrollToLiveOrTarget(true)}
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/30 transition-all active:scale-95 animate-pulse"
                title="Jump to live talks happening right now"
              >
                <Radio size={13} className="animate-pulse" />
                <span>Jump to Live ({liveItemsOnActiveDay.length})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsPdfModalOpen(true)}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-2xl bg-isot-burgundy hover:bg-isot-deep-burgundy text-white font-bold text-xs shadow-md shadow-isot-burgundy/25 transition-all active:scale-95"
              title="Download Beautiful PDF Programme"
            >
              <FileDown size={15} />
              <span>Download PDF</span>
            </button>
          </div>

          {/* Display mode pills: Sessions vs Talks - Full-width native segmented control on mobile */}
          <div className="grid grid-cols-2 sm:flex bg-gray-200/80 dark:bg-zinc-800 p-1 rounded-2xl border border-gray-200 dark:border-zinc-700 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => setDisplayMode('sessions')}
              className={`py-2 sm:py-1.5 px-3 rounded-xl text-xs font-bold text-center transition-all ${
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
              className={`py-2 sm:py-1.5 px-3 rounded-xl text-xs font-bold text-center transition-all ${
                displayMode === 'talks'
                  ? 'bg-white dark:bg-zinc-900 text-isot-burgundy dark:text-rose-400 shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900'
              }`}
            >
              Talks ({allFilteredItems.length})
            </button>
          </div>
        </div>
      </div>

      {/* Horizontal Day Tabs */}
      <DaySelector selectedDate={activeDate} onSelectDate={handleDateChange} />

      {/* Filter Bar with Hall Pills, Search, Saved Toggle, View Switch */}
      <FilterBar
        selectedHall={selectedHall}
        onSelectHall={setSelectedHall}
        availableHalls={availableHalls}
        selectedTrack={selectedTrack}
        onSelectTrack={setSelectedTrack}
        tracks={dayTracks}
        selectedStatus={selectedStatus}
        onSelectStatus={setSelectedStatus}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
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

      {/* PDF Export Modal */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        defaultDate={activeDate}
      />

      {/* Floating Jump-to-Live Pill for instant re-centering */}
      {hasLiveItems && (
        <button
          type="button"
          onClick={() => scrollToLiveOrTarget(true)}
          className="fixed bottom-20 md:bottom-8 right-4 sm:right-8 z-30 inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-xl shadow-emerald-600/35 hover:scale-105 active:scale-95 transition-all border border-white/20 animate-pulse"
          title="Jump to live talks happening now"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          <span>Jump to Live ({liveItemsOnActiveDay.length})</span>
        </button>
      )}
    </div>
  );
};
