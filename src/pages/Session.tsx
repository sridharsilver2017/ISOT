import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProgrammeStore, slugify } from '../store/programmeStore';
import {
  MapPin,
  User,
  ChevronLeft,
  Bookmark,
  Share2,
  Layers,
  Calendar,
  ArrowLeft,
  Search,
  Check,
  ChevronRight,
  Sparkles,
  Tag,
  SlidersHorizontal,
  List,
  LayoutGrid,
  ChevronDown,
  ChevronUp,
  Star,
  Mic,
  Users,
  Award
} from 'lucide-react';
import { useScheduleStore } from '../store/scheduleStore';
import { TalkCard } from '../components/TalkCard';
import { getSessionItems, ProgrammeItem } from '../types/programme';
import { getTypeBadgeColor, parsePartHeader, isSpecialEvent } from '../utils/timeUtils';

const parseSectionTitle = (title: string) => {
  if (!title) return { mainTitle: '', experts: [] };
  const match = title.match(/^(.*?)\s*\((?:Experts?|Expert):\s*(.*?)\)$/i);
  if (match) {
    return {
      mainTitle: match[1].trim(),
      experts: match[2].split(/,\s*/).map((s) => s.trim()).filter(Boolean),
    };
  }
  return { mainTitle: title, experts: [] };
};

export const Session: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const { sessions, getSessionById } = useProgrammeStore();
  const session = getSessionById(sessionId || '');
  const { isSessionSaved, toggleSaveSession, isTalkSaved, toggleSaveTalk } = useScheduleStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
  const [isScrolled, setIsScrolled] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const topicScrollRef = useRef<HTMLDivElement>(null);

  const checkTopicScroll = () => {
    const el = topicScrollRef.current;
    if (el) {
      const hasOverflow = el.scrollWidth > el.clientWidth + 1;
      setCanScrollLeft(hasOverflow && el.scrollLeft > 2);
      setCanScrollRight(hasOverflow && el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
    }
  };

  const scrollTopics = (direction: 'left' | 'right') => {
    if (topicScrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      topicScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      setTimeout(checkTopicScroll, 250);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 80);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    checkTopicScroll();
    const timer = setTimeout(checkTopicScroll, 100);
    const handleResize = () => checkTopicScroll();
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [session, isScrolled]);

  // Find previous and next sessions for easy conference browsing
  const sessionNavigation = useMemo(() => {
    if (!session) return { prev: null, next: null };
    const sameDaySessions = sessions.filter(
      (s) => s.date === session.date || s.dayName === session.dayName
    );
    const currentIndex = sameDaySessions.findIndex((s) => s.id === session.id);
    return {
      prev: currentIndex > 0 ? sameDaySessions[currentIndex - 1] : null,
      next: currentIndex >= 0 && currentIndex < sameDaySessions.length - 1 ? sameDaySessions[currentIndex + 1] : null,
    };
  }, [sessions, session]);

  if (!session) {
    return (
      <div className="text-center py-16 bg-white dark:bg-zinc-900 rounded-3xl p-8 border border-gray-200 dark:border-zinc-800 shadow-sm max-w-xl mx-auto my-12">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 dark:bg-rose-950/50 flex items-center justify-center text-isot-burgundy dark:text-rose-400 mx-auto mb-4">
          <Calendar size={28} />
        </div>
        <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-2">Session Not Found</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
          The requested session could not be found or may have been updated in the ISOT 2026 programme.
        </p>
        <Link
          to="/programme"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-isot-burgundy hover:bg-isot-deep-burgundy text-white font-bold text-sm shadow-md shadow-isot-burgundy/20 transition-all active:scale-95"
        >
          <ArrowLeft size={18} />
          Explore Full Programme
        </Link>
      </div>
    );
  }

  const saved = isSessionSaved(session.id);
  const allItems = getSessionItems(session);

  // Compute duration in hours / minutes if possible
  const computeDuration = (start: string, end: string) => {
    try {
      const [sH, sM] = start.split(':').map(Number);
      const [eH, eM] = end.split(':').map(Number);
      if (!isNaN(sH) && !isNaN(eH)) {
        const diffMins = (eH * 60 + (eM || 0)) - (sH * 60 + (sM || 0));
        if (diffMins > 0) {
          const hours = Math.floor(diffMins / 60);
          const mins = diffMins % 60;
          if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
          if (hours > 0) return `${hours} hrs`;
          return `${mins} mins`;
        }
      }
    } catch (e) {
      // ignore
    }
    return '';
  };

  const durationStr = computeDuration(session.startTime, session.endTime);

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${session.title} - ISOT 2026`,
          text: `Check out ${session.title} at ISOT 2026 (${session.venue}, ${session.dayDisplay})`,
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

  const toggleSectionCollapse = (secId: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [secId]: !prev[secId],
    }));
  };

  const toggleAllSections = (collapse: boolean) => {
    const newMap: Record<string, boolean> = {};
    if (session.sections) {
      session.sections.forEach((_, idx) => {
        newMap[`section-${idx}`] = collapse;
      });
    }
    setCollapsedSections(newMap);
  };

  const scrollToSection = (secId: string, buttonElement?: HTMLElement) => {
    setActiveSectionId(secId);
    // Auto-expand the target section if collapsed
    setCollapsedSections((prev) => ({ ...prev, [secId]: false }));

    // Smoothly scroll the clicked topic pill to the left of the bar
    if (buttonElement && topicScrollRef.current) {
      const container = topicScrollRef.current;
      const targetScrollLeft = buttonElement.offsetLeft - container.offsetLeft - 8;
      container.scrollTo({
        left: Math.max(0, targetScrollLeft),
        behavior: 'smooth',
      });
      setTimeout(checkTopicScroll, 300);
    }

    const element = document.getElementById(secId);
    if (element) {
      const yOffset = -90; // offset for sticky navigation
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  // Filter items by query if searching
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) {
      return session.sections && session.sections.length > 0
        ? session.sections
        : [{ id: 'sec-all', title: '', items: allItems }];
    }

    const q = searchQuery.toLowerCase().trim();
    const matchesItem = (item: ProgrammeItem) => {
      if (item.title?.toLowerCase().includes(q)) return true;
      if (item.speakers?.some((s) => s.toLowerCase().includes(q))) return true;
      if (item.chairpersons?.some((c) => c.toLowerCase().includes(q))) return true;
      if (item.panelists?.some((p) => p.toLowerCase().includes(q))) return true;
      if (item.moderator?.toLowerCase().includes(q)) return true;
      if (item.casePresenters?.some((cp) => cp.toLowerCase().includes(q))) return true;
      return false;
    };

    if (session.sections && session.sections.length > 0) {
      return session.sections
        .map((sec) => {
          const matchingItems = (sec.items || []).filter(matchesItem);
          const titleMatches = sec.title?.toLowerCase().includes(q);
          return {
            ...sec,
            items: titleMatches ? sec.items : matchingItems,
          };
        })
        .filter((sec) => (sec.items && sec.items.length > 0) || sec.title?.toLowerCase().includes(q));
    }

    return [
      {
        id: 'sec-filtered',
        title: '',
        items: allItems.filter(matchesItem),
      },
    ];
  }, [session.sections, allItems, searchQuery]);

  const totalFilteredItems = filteredSections.reduce(
    (acc, sec) => acc + (sec.items?.length || 0),
    0
  );

  const sectionsList = session.sections || [];

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Top Breadcrumb & Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <nav className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400 font-medium overflow-x-auto py-1 scrollbar-none">
          <Link
            to="/programme"
            className="hover:text-isot-burgundy dark:hover:text-rose-400 transition-colors flex items-center gap-1"
          >
            <ChevronLeft size={14} />
            <span>Programme</span>
          </Link>
          <span className="text-gray-300 dark:text-zinc-700">/</span>
          <span className="text-gray-700 dark:text-gray-300 font-semibold">{session.dayName}</span>
          <span className="text-gray-300 dark:text-zinc-700">/</span>
          <span className="text-gray-700 dark:text-gray-300 font-semibold">{session.venue}</span>
        </nav>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 font-bold hover:border-isot-burgundy dark:hover:border-rose-500 hover:text-isot-burgundy dark:hover:text-rose-400 transition-all shadow-2xs"
        >
          <ChevronLeft size={14} />
          <span>Back</span>
        </button>
      </div>

      {/* Main Hero Header Card */}
      <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-white via-rose-50/20 to-amber-50/20 dark:from-zinc-900 dark:via-zinc-900/90 dark:to-rose-950/20 p-4 sm:p-6 md:p-8 border border-gray-200/90 dark:border-zinc-800 shadow-sm">
        {/* Decorative subtle background accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-radial from-rose-400/10 to-transparent rounded-full blur-2xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-radial from-amber-400/10 to-transparent rounded-full blur-2xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10 space-y-4 sm:space-y-5">
          {/* High-Contrast Date, Time & Venue Highlight Ribbon */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
            {/* Highlighted Date Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-isot-burgundy text-white font-black text-xs sm:text-sm shadow-sm shadow-isot-burgundy/25 border border-rose-900/30">
              <Calendar size={13} className="stroke-[2.5]" />
              <span>{session.dayName}, {session.dayDisplay} 2026</span>
            </div>

            {/* Highlighted Time & Duration Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl sm:rounded-2xl bg-red-600 hover:bg-red-700 text-white font-black text-xs sm:text-sm shadow-sm shadow-red-600/25 border border-red-700">
              <span>{session.startTime} – {session.endTime}</span>
              {durationStr && (
                <span className="bg-black/20 text-white text-[10px] sm:text-[11px] px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg font-bold">
                  {durationStr}
                </span>
              )}
            </div>

            {/* Highlighted Venue Badge */}
            <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200 font-bold text-xs sm:text-sm border border-gray-200 dark:border-zinc-700 shadow-2xs">
              <MapPin size={13} className="text-isot-burgundy dark:text-rose-400 stroke-[2.5]" />
              <span>{session.venue}</span>
            </div>

            {session.track && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl sm:rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-isot-burgundy dark:text-rose-300 font-bold text-xs sm:text-sm border border-rose-200 dark:border-rose-900/50">
                <Tag size={12} />
                {session.track}
              </span>
            )}
          </div>

          {/* Session Title */}
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-gray-900 dark:text-white tracking-tight leading-tight">
              {session.title}
            </h1>
            {session.page && (
              <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 font-medium">
                Official Programme Guide • Page {session.page}
              </p>
            )}
          </div>

          {/* Leadership & In-Charge Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3 pt-1 sm:pt-2">
            {session.sessionInCharge && session.sessionInCharge.length > 0 && (
              <div className="flex items-center sm:items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-zinc-800/70 border border-gray-200/70 dark:border-zinc-700/60 backdrop-blur-xs">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                  <User size={14} />
                </div>
                <div>
                  <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Session In-Charge
                  </span>
                  <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white mt-0.5">
                    {session.sessionInCharge.map((name, idx) => (
                      <span key={name}>
                        <Link
                          to={`/speaker/${slugify(name)}`}
                          className="hover:text-isot-burgundy dark:hover:text-rose-400 hover:underline"
                        >
                          {name}
                        </Link>
                        {idx < (session.sessionInCharge?.length || 1) - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {session.coInCharge && session.coInCharge.length > 0 && (
              <div className="flex items-center sm:items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-zinc-800/70 border border-gray-200/70 dark:border-zinc-700/60 backdrop-blur-xs">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-rose-100 dark:bg-rose-950/60 text-isot-burgundy dark:text-rose-300 flex items-center justify-center shrink-0">
                  <User size={14} />
                </div>
                <div>
                  <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Co-In-Charge
                  </span>
                  <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white mt-0.5">
                    {session.coInCharge.map((name, idx) => (
                      <span key={name}>
                        <Link
                          to={`/speaker/${slugify(name)}`}
                          className="hover:text-isot-burgundy dark:hover:text-rose-400 hover:underline"
                        >
                          {name}
                        </Link>
                        {idx < (session.coInCharge?.length || 1) - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {session.programmeCoordinators && (
              <div className="flex items-center sm:items-start gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-white/80 dark:bg-zinc-800/70 border border-gray-200/70 dark:border-zinc-700/60 backdrop-blur-xs sm:col-span-2 lg:col-span-1">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-gray-100 dark:bg-zinc-700 text-gray-600 dark:text-gray-300 flex items-center justify-center shrink-0">
                  <Layers size={14} />
                </div>
                <div>
                  <span className="block text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    Programme Coordinators
                  </span>
                  <div className="font-bold text-xs sm:text-sm text-gray-900 dark:text-white mt-0.5">
                    {session.programmeCoordinators.map((name, idx) => (
                      <span key={name}>
                        <Link
                          to={`/speaker/${slugify(name)}`}
                          className="hover:text-isot-burgundy dark:hover:text-rose-400 hover:underline"
                        >
                          {name}
                        </Link>
                        {idx < (session.programmeCoordinators?.length || 1) - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Key Stats Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-3 sm:pt-4 border-t border-gray-200/80 dark:border-zinc-800">
            <div className="flex items-center justify-between sm:justify-start gap-3 sm:gap-4 text-xs font-semibold text-gray-600 dark:text-gray-300">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <strong>{allItems.length}</strong> Total Talks & Items
              </span>
              {sectionsList.length > 1 && (
                <span className="flex items-center gap-1.5 text-isot-burgundy dark:text-rose-400">
                  <Sparkles size={13} />
                  <strong>{sectionsList.length}</strong> Sub-Session Topics
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
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
                className={`flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-sm ${
                  saved
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/20'
                    : 'bg-isot-burgundy hover:bg-isot-deep-burgundy text-white shadow-isot-burgundy/25'
                }`}
              >
                <Bookmark size={15} className={saved ? 'fill-white' : ''} />
                <span>{saved ? 'Saved in My Day' : 'Bookmark Session'}</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="shrink-0 inline-flex items-center justify-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl bg-white dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-700 hover:bg-gray-50 dark:hover:bg-zinc-700 font-semibold text-xs sm:text-sm transition-colors"
                title="Share session link"
              >
                {copied ? (
                  <>
                    <Check size={15} className="text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 size={15} />
                    <span className="hidden sm:inline">Share</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Slim Sticky Fixed Header on Scroll: Date, Time, Hall on scroll & Topic Quick Jump */}
      {(isScrolled || sectionsList.length > 1) && (
        <div className="sticky top-14 sm:top-16 z-30 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 border border-gray-200/90 dark:border-zinc-800 shadow-md transition-all">
          {/* Top Fixed Highlight Row: Date, Time, Hall & Session Title - ONLY shown on scroll to avoid duplication */}
          {isScrolled && (
            <div className="flex flex-wrap items-center justify-between gap-2 pb-1.5 mb-1.5 border-b border-gray-100 dark:border-zinc-800">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0">
                {/* Highlighted Date */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-isot-burgundy text-white font-black text-xs shadow-2xs">
                  <Calendar size={12} className="stroke-[2.5]" />
                  <span>{session.dayName}, {session.dayDisplay}</span>
                </span>

                {/* Highlighted Time */}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-red-600 text-white font-black text-xs shadow-2xs">
                  <span>{session.startTime} – {session.endTime}</span>
                </span>

                {/* Highlighted Hall / Venue */}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-zinc-700 font-extrabold text-xs">
                  <MapPin size={11} className="text-isot-burgundy dark:text-rose-400 stroke-[2.5]" />
                  <span>{session.venue}</span>
                </span>

                {/* Truncated Session Title on Larger Screens */}
                <span className="hidden md:inline font-bold text-xs text-gray-700 dark:text-gray-300 truncate max-w-[260px] lg:max-w-[400px]">
                  • {session.title}
                </span>
              </div>

              {/* Quick Bookmark Toggle */}
              <div className="flex items-center gap-1.5 shrink-0">
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
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-bold transition-all shadow-2xs ${
                    saved
                      ? 'bg-amber-500 text-white'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-isot-burgundy hover:text-white'
                  }`}
                  title={saved ? 'Session Saved in My Day' : 'Bookmark Session'}
                >
                  <Bookmark size={12} className={saved ? 'fill-white' : ''} />
                  <span className="hidden xs:inline">{saved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Sub-Session Topic Quick-Jump Bar */}
          {sectionsList.length > 1 && (
            <div>
              <div className="flex items-center justify-between gap-2 mb-1 px-1 text-xs font-bold text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-1.5">
                  <SlidersHorizontal size={11} className="text-isot-burgundy dark:text-rose-400" />
                  <span className="text-[11px] font-bold">Jump to Topic:</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleAllSections(false)}
                    className="text-[10px] font-semibold text-isot-burgundy dark:text-rose-400 hover:underline"
                  >
                    Expand All
                  </button>
                  <span className="text-gray-300 dark:text-zinc-700">•</span>
                  <button
                    type="button"
                    onClick={() => toggleAllSections(true)}
                    className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 hover:underline"
                  >
                    Collapse All
                  </button>
                </div>
              </div>
              <div className="relative flex items-center gap-1">
                {canScrollLeft && (
                  <button
                    type="button"
                    onClick={() => scrollTopics('left')}
                    aria-label="Scroll topics left"
                    className="shrink-0 p-1 rounded-md bg-gray-100 hover:bg-isot-burgundy hover:text-white dark:bg-zinc-800 dark:hover:bg-rose-700 text-gray-600 dark:text-gray-300 transition-colors shadow-2xs"
                    title="Scroll Left"
                  >
                    <ChevronLeft size={14} />
                  </button>
                )}
                <div
                  ref={topicScrollRef}
                  onScroll={checkTopicScroll}
                  className="flex-1 flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar scrollbar-none scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {sectionsList.map((sec, idx) => {
                    const secId = `section-${idx}`;
                    const isSelected = activeSectionId === secId;
                    const { mainTitle } = parseSectionTitle(sec.title || `Part ${idx + 1}`);
                    const count = sec.items?.length || 0;

                    return (
                      <button
                        key={sec.id || idx}
                        type="button"
                        onClick={(e) => scrollToSection(secId, e.currentTarget)}
                        className={`shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                          isSelected
                            ? 'bg-isot-burgundy text-white shadow-xs'
                            : 'bg-gray-100 hover:bg-rose-50 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 hover:text-isot-burgundy dark:hover:text-rose-300 border border-transparent'
                        }`}
                      >
                        <span className="w-3.5 h-3.5 rounded-full bg-white/20 dark:bg-white/10 flex items-center justify-center text-[9px]">
                          {idx + 1}
                        </span>
                        <span className="truncate max-w-[140px] sm:max-w-[200px]">{mainTitle}</span>
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded-full ${
                            isSelected ? 'bg-white/20 text-white' : 'bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-gray-300'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
                {canScrollRight && (
                  <button
                    type="button"
                    onClick={() => scrollTopics('right')}
                    aria-label="Scroll topics right"
                    className="shrink-0 p-1 rounded-md bg-gray-100 hover:bg-isot-burgundy hover:text-white dark:bg-zinc-800 dark:hover:bg-rose-700 text-gray-600 dark:text-gray-300 transition-colors shadow-2xs"
                    title="Scroll Right"
                  >
                    <ChevronRight size={14} />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* In-Session Search & View Mode Switcher Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search talks, speakers, chairpersons..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-hidden focus:ring-2 focus:ring-isot-burgundy/30 focus:border-isot-burgundy transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              Clear
            </button>
          )}
        </div>

        {/* View Mode Switcher & Count */}
        <div className="flex items-center justify-between sm:justify-end gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            <strong className="text-gray-900 dark:text-white">{totalFilteredItems}</strong> of {allItems.length} talks
          </span>

          <div className="inline-flex items-center p-1 bg-gray-100 dark:bg-zinc-800/90 rounded-2xl border border-gray-200/80 dark:border-zinc-700/80">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-zinc-900 text-isot-burgundy dark:text-rose-400 shadow-2xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Compact Topic List View"
            >
              <List size={14} />
              <span>List View</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-zinc-900 text-isot-burgundy dark:text-rose-400 shadow-2xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
              title="Cards Grid View"
            >
              <LayoutGrid size={14} />
              <span>Grid View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Programme Items Sequence with Topics */}
      <div className="space-y-4 sm:space-y-5">
        {filteredSections.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-200 dark:border-zinc-800">
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
              No matching talks found in this session
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Try searching with another keyword or speaker name.
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 rounded-xl bg-isot-burgundy text-white font-bold text-xs"
            >
              Reset Search Filter
            </button>
          </div>
        ) : (
          filteredSections.map((section, sIdx) => {
            const secId = `section-${sIdx}`;
            const isCollapsed = !!collapsedSections[secId];
            const firstItem = section.items?.[0];
            const lastItem = section.items?.[section.items.length - 1];
            const timeRange =
              firstItem && lastItem && firstItem.startTime && lastItem.endTime
                ? `${firstItem.startTime} – ${lastItem.endTime}`
                : firstItem?.startTime || '';

            return (
              <section
                key={section.id || sIdx}
                id={secId}
                className="scroll-mt-32 rounded-3xl bg-white dark:bg-zinc-900 border border-gray-200/90 dark:border-zinc-800 shadow-sm overflow-hidden transition-all duration-200"
              >
                {/* Topic Header Card (Clickable to Expand/Collapse) */}
                {section.title ? (
                  <button
                    type="button"
                    onClick={() => toggleSectionCollapse(secId)}
                    className="group/topic w-full text-left p-4 sm:p-5 bg-gradient-to-r from-rose-50/80 via-white to-amber-50/40 dark:from-rose-950/40 dark:via-zinc-900 dark:to-zinc-900 border-b border-gray-200/80 dark:border-zinc-800 flex items-center justify-between gap-3 hover:bg-rose-100/50 dark:hover:bg-zinc-800/80 transition-colors"
                  >
                    {(() => {
                      const { mainTitle, experts } = parseSectionTitle(section.title);
                      return (
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-isot-burgundy text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs group-hover/topic:scale-105 transition-transform">
                            {sIdx + 1}
                          </div>
                          <div className="min-w-0 space-y-0.5">
                            <h2 className="text-sm sm:text-base md:text-lg font-black text-gray-900 dark:text-white tracking-tight leading-snug group-hover/topic:text-isot-burgundy dark:group-hover/topic:text-rose-400 transition-colors">
                              {mainTitle}
                            </h2>
                            {experts.length > 0 && (
                              <div
                                className="flex flex-wrap items-center gap-1.5 text-xs text-isot-burgundy dark:text-rose-400 font-semibold"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <span className="text-gray-500 dark:text-gray-400 font-medium">
                                  Expert{experts.length > 1 ? 's' : ''}:
                                </span>
                                {experts.map((exp, expIdx) => (
                                  <span key={exp}>
                                    <Link
                                      to={`/speaker/${slugify(exp)}`}
                                      className="font-bold underline hover:text-isot-deep-burgundy dark:hover:text-rose-300"
                                    >
                                      {exp}
                                    </Link>
                                    {expIdx < experts.length - 1 ? ', ' : ''}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })()}

                    <div className="flex items-center gap-2.5 shrink-0">
                      {timeRange && (
                        <span className="hidden xs:inline-flex items-center px-3 py-1.5 rounded-xl bg-red-600 text-white font-black text-xs shadow-xs shadow-red-600/20 border border-red-700/30">
                          <span>{timeRange}</span>
                        </span>
                      )}
                      <span className="inline-flex items-center px-2.5 py-1.5 rounded-xl bg-isot-light-pink dark:bg-rose-950/70 text-isot-burgundy dark:text-rose-300 font-bold text-[11px] border border-rose-200 dark:border-rose-900/50">
                        {section.items?.length || 0} {section.items?.length === 1 ? 'talk' : 'talks'}
                      </span>
                      {/* Highlighted Topic Expand/Collapse Arrow Badge */}
                      <div className="w-8 h-8 rounded-xl bg-isot-burgundy/10 dark:bg-rose-950/60 group-hover/topic:bg-isot-burgundy group-hover/topic:text-white text-isot-burgundy dark:text-rose-300 flex items-center justify-center transition-all duration-200 shadow-2xs group-hover/topic:shadow-xs">
                        {isCollapsed ? <ChevronDown size={17} className="stroke-[2.5]" /> : <ChevronUp size={17} className="stroke-[2.5]" />}
                      </div>
                    </div>
                  </button>
                ) : null}

                {/* Content body when expanded */}
                {!isCollapsed && (
                  <div className="p-4 sm:p-5">
                    {viewMode === 'list' ? (
                      <div className="flex flex-col gap-2.5 sm:gap-3">
                        {section.items &&
                          section.items.map((item) => {
                            const isSaved = isTalkSaved(item.id);
                            const badge = getTypeBadgeColor(item.type);
                            const isSpecial = isSpecialEvent(item.title, item.type);

                            return (
                              <div
                                key={item.id}
                                className={`group/row p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl transition-all border ${
                                  isSpecial
                                    ? 'bg-sky-50/80 dark:bg-sky-950/30 border-sky-200/90 dark:border-sky-900/60 shadow-xs hover:bg-sky-100/70 dark:hover:bg-sky-950/50'
                                    : 'bg-white dark:bg-zinc-900/80 hover:bg-rose-50/40 dark:hover:bg-zinc-800/50 border-gray-100 dark:border-zinc-800 hover:border-isot-burgundy/20 dark:hover:border-rose-900/30 shadow-2xs'
                                }`}
                              >
                                {/* Left Highlighted Time Badge (Clean standalone time in bold red) */}
                                <div className="shrink-0 min-w-[125px]">
                                  <span className="inline-flex items-center text-xs sm:text-sm font-black text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/90 px-3 py-1.5 rounded-xl border border-red-200/90 dark:border-red-900/70 shadow-2xs">
                                    <span>{item.startTime} {item.endTime ? `– ${item.endTime}` : ''}</span>
                                  </span>
                                </div>

                                {/* Center: Title & Speakers/Chairpersons */}
                                <div className="flex-1 min-w-0 space-y-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    {isSpecial ? (
                                      <span className="font-black text-sm sm:text-base text-gray-900 dark:text-white leading-snug">
                                        {item.title}
                                      </span>
                                    ) : (
                                      <>
                                        <Link
                                          to={`/talk/${item.id}`}
                                          className="font-black text-sm sm:text-base text-gray-900 dark:text-white group-hover/row:text-isot-burgundy dark:group-hover/row:text-rose-400 transition-colors leading-snug"
                                        >
                                          {item.title}
                                        </Link>
                                        {item.type && item.type !== 'talk' && (
                                          <span
                                            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-extrabold border ${badge.bg} ${badge.text} ${badge.border}`}
                                          >
                                            {badge.label}
                                          </span>
                                        )}
                                      </>
                                    )}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-600 dark:text-gray-300 pt-0.5">
                                    {/* Speakers */}
                                    {item.speakers && item.speakers.length > 0 && (
                                      <div className="inline-flex items-center gap-1">
                                        <Mic size={13} className="text-isot-burgundy dark:text-rose-400 shrink-0" />
                                        <span className="text-gray-400 dark:text-gray-500 font-medium">
                                          Speaker{item.speakers.length > 1 ? 's' : ''}:
                                        </span>{' '}
                                        <span className="font-bold text-gray-800 dark:text-gray-200">
                                          {item.speakers.map((sp, sIndex) => (
                                            <span key={sp}>
                                              <Link
                                                to={`/speaker/${slugify(sp)}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="hover:text-isot-burgundy dark:hover:text-rose-400 hover:underline"
                                              >
                                                {sp}
                                              </Link>
                                              {sIndex < (item.speakers?.length || 1) - 1 ? ', ' : ''}
                                            </span>
                                          ))}
                                        </span>
                                      </div>
                                    )}

                                    {/* Chairpersons */}
                                    {item.chairpersons && item.chairpersons.length > 0 && (
                                      <div className="inline-flex items-center gap-1 text-gray-500 dark:text-gray-400">
                                        <User size={12} className="shrink-0 opacity-70" />
                                        <span className="font-medium">Chairs:</span>{' '}
                                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                                          {item.chairpersons.map((c, cIndex) => (
                                            <span key={c}>
                                              <Link
                                                to={`/speaker/${slugify(c)}`}
                                                onClick={(e) => e.stopPropagation()}
                                                className="hover:underline"
                                              >
                                                {c}
                                              </Link>
                                              {cIndex < (item.chairpersons?.length || 1) - 1 ? ', ' : ''}
                                            </span>
                                          ))}
                                        </span>
                                      </div>
                                    )}

                                    {/* Panelists */}
                                    {item.panelists && item.panelists.length > 0 && (
                                      <div className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400">
                                        <Users size={12} className="shrink-0" />
                                        <span className="font-semibold">{item.panelists.join(', ')}</span>
                                      </div>
                                    )}

                                    {/* Moderator */}
                                    {item.moderator && (
                                      <div className="inline-flex items-center gap-1 text-amber-700 dark:text-amber-400">
                                        <Award size={12} className="shrink-0" />
                                        <span className="font-semibold">Mod: {item.moderator}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* Description / Outline Bullets if present */}
                                  {item.description && item.description.length > 0 && (
                                    <div className="mt-2.5 p-3.5 rounded-2xl bg-gradient-to-br from-rose-50/70 to-amber-50/30 dark:from-zinc-800/80 dark:to-zinc-800/40 border border-rose-100/90 dark:border-zinc-700/60 text-xs text-gray-700 dark:text-gray-300 space-y-2">
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

                                {/* Right: Action buttons with Highlighted Arrow */}
                                <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-2 sm:pt-0">
                                  <button
                                    type="button"
                                    onClick={() =>
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
                                      })
                                    }
                                    className={`p-2 rounded-xl transition-all active:scale-95 ${
                                      isSaved
                                        ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                                        : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-zinc-700'
                                    }`}
                                    title={isSaved ? 'Saved in My Day' : 'Add to My Day'}
                                  >
                                    <Star size={15} className={isSaved ? 'fill-amber-500 text-amber-500' : ''} />
                                  </button>

                                  {/* Highlighted Right Arrow Link - Hidden for special breaks/ceremonies/lunch/dinner/registration */}
                                  {!isSpecial && (
                                    <Link
                                      to={`/talk/${item.id}`}
                                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-isot-burgundy/10 hover:bg-isot-burgundy text-isot-burgundy hover:text-white dark:bg-rose-950/60 dark:hover:bg-isot-burgundy dark:text-rose-300 dark:hover:text-white font-bold text-xs transition-all shadow-2xs group-hover/row:bg-isot-burgundy group-hover/row:text-white active:scale-95"
                                      title="View Talk Details"
                                    >
                                      <span className="hidden sm:inline">Details</span>
                                      <ChevronRight size={15} className="group-hover/row:translate-x-0.5 transition-transform stroke-[2.5]" />
                                    </Link>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    ) : (
                      /* GRID VIEW FOR TOPIC ITEMS */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {section.items &&
                          section.items.map((item) => (
                            <TalkCard key={item.id} item={item} />
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </section>
            );
          })
        )}
      </div>

      {/* Next & Previous Session Navigator */}
      {(sessionNavigation.prev || sessionNavigation.next) && (
        <div className="pt-8 border-t border-gray-200 dark:border-zinc-800">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Browse More Sessions ({session.dayName})
            </h3>
            <Link
              to="/programme"
              className="text-xs font-bold text-isot-burgundy dark:text-rose-400 hover:underline"
            >
              All Sessions →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sessionNavigation.prev ? (
              <Link
                to={`/session/${sessionNavigation.prev.id}`}
                className="group p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-isot-burgundy/40 dark:hover:border-rose-900/50 shadow-2xs hover:shadow-sm transition-all flex items-center gap-3"
              >
                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-zinc-800 group-hover:bg-isot-burgundy group-hover:text-white text-gray-600 dark:text-gray-300 flex items-center justify-center shrink-0 transition-colors">
                  <ChevronLeft size={18} />
                </div>
                <div className="min-w-0">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Previous Session
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-isot-burgundy dark:group-hover:text-rose-400 transition-colors">
                    {sessionNavigation.prev.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {sessionNavigation.prev.startTime} – {sessionNavigation.prev.endTime} • {sessionNavigation.prev.venue}
                  </p>
                </div>
              </Link>
            ) : <div />}

            {sessionNavigation.next ? (
              <Link
                to={`/session/${sessionNavigation.next.id}`}
                className="group p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-isot-burgundy/40 dark:hover:border-rose-900/50 shadow-2xs hover:shadow-sm transition-all flex items-center justify-between gap-3 text-right"
              >
                <div className="min-w-0 flex-1">
                  <span className="block text-[11px] font-bold uppercase tracking-wider text-gray-400">
                    Next Session
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-isot-burgundy dark:group-hover:text-rose-400 transition-colors">
                    {sessionNavigation.next.title}
                  </h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400">
                    {sessionNavigation.next.startTime} – {sessionNavigation.next.endTime} • {sessionNavigation.next.venue}
                  </p>
                </div>
                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-zinc-800 group-hover:bg-isot-burgundy group-hover:text-white text-gray-600 dark:text-gray-300 flex items-center justify-center shrink-0 transition-colors">
                  <ChevronRight size={18} />
                </div>
              </Link>
            ) : <div />}
          </div>
        </div>
      )}
    </div>
  );
};


