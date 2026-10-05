import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Users, Bookmark, MapPin, Sparkles, ArrowRight, Award, ChevronRight, Settings as SettingsIcon } from 'lucide-react';
import { EVENT_DETAILS, CONFERENCE_DAYS } from '../data/event';
import { useProgrammeStore } from '../store/programmeStore';
import { useScheduleStore } from '../store/scheduleStore';
import { HappeningNow } from '../components/HappeningNow';
import { UpNext } from '../components/UpNext';
import { DaySelector } from '../components/DaySelector';
import { SessionCard } from '../components/SessionCard';
import { isTodayConferenceDay, getTodayDateIso, getCurrentTimeHHMM } from '../utils/timeUtils';

export const Home: React.FC = () => {
  const { savedItems } = useScheduleStore();
  const { sessions } = useProgrammeStore();

  const isLiveToday = isTodayConferenceDay();
  const todayDateIso = getTodayDateIso();

  // Active selected day for the programme preview (defaults to live today date if conference is ongoing, otherwise Friday 2026-10-09)
  const [selectedDay, setSelectedDay] = useState<string>(
    isLiveToday ? todayDateIso : '2026-10-09'
  );

  // Live time tracker that updates every 30 seconds when conference is active
  const [liveCurrentTime, setLiveCurrentTime] = useState<string>(getCurrentTimeHHMM());

  useEffect(() => {
    if (!isLiveToday) return;
    const interval = setInterval(() => {
      setLiveCurrentTime(getCurrentTimeHHMM());
    }, 30000);
    return () => clearInterval(interval);
  }, [isLiveToday]);

  // Get current sessions for selected date
  const activeDaySessions = sessions.filter((s) => s.date === selectedDay);
  const activeDayInfo = CONFERENCE_DAYS.find((d) => d.date === selectedDay) || CONFERENCE_DAYS[0];

  const quickActions = [
    {
      title: 'Programme',
      subtitle: `${sessions.length} Sessions • Full Agenda`,
      icon: Calendar,
      link: '/programme',
      bg: 'from-rose-500/10 to-isot-burgundy/20 dark:from-rose-950/40 dark:to-zinc-800',
      iconColor: 'text-isot-burgundy dark:text-rose-400',
    },
    {
      title: 'Faculty & Speakers',
      subtitle: 'Complete Directory & Talks',
      icon: Users,
      link: '/speakers',
      bg: 'from-amber-500/10 to-amber-600/20 dark:from-amber-950/40 dark:to-zinc-800',
      iconColor: 'text-amber-600 dark:text-amber-400',
    },
    {
      title: 'My Day / Schedule',
      subtitle: `${savedItems.length} Saved item${savedItems.length === 1 ? '' : 's'}`,
      icon: Bookmark,
      link: '/my-schedule',
      bg: 'from-blue-500/10 to-indigo-600/20 dark:from-blue-950/40 dark:to-zinc-800',
      iconColor: 'text-blue-600 dark:text-blue-400',
      badge: savedItems.length > 0 ? savedItems.length : undefined,
    },
    {
      title: 'Admin CMS',
      subtitle: 'Edit Topics, Dates & Halls',
      icon: SettingsIcon,
      link: '/admin',
      bg: 'from-purple-500/10 to-purple-600/20 dark:from-purple-950/40 dark:to-zinc-800',
      iconColor: 'text-purple-600 dark:text-purple-400',
    },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 pb-10">
      {/* Hero Conference Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-isot-burgundy via-isot-deep-burgundy to-black text-white p-6 sm:p-8 lg:p-10 shadow-xl shadow-isot-burgundy/20">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-isot-gold/15 blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-300 font-bold text-xs uppercase tracking-wider mb-4 border border-white/10">
            <Sparkles size={14} />
            <span>36th Annual Conference</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight mb-2">
            ISOT 2026
          </h1>

          <p className="text-sm sm:text-base text-rose-100 font-medium mb-4">
            Indian Society of Organ Transplantation
          </p>

          <div className="p-3.5 sm:p-4 rounded-2xl bg-black/25 backdrop-blur-sm border border-white/10 mb-6">
            <p className="text-xs uppercase tracking-widest text-amber-300 font-bold mb-1">
              Theme
            </p>
            <p className="text-base sm:text-lg font-bold text-white leading-snug">
              “{EVENT_DETAILS.theme}”
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-6 text-xs sm:text-sm text-gray-200">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-isot-gold" />
              <span>{EVENT_DETAILS.datesDisplay}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={16} className="text-isot-gold" />
              <span>{EVENT_DETAILS.venue}, Hyderabad</span>
            </div>
          </div>
        </div>
      </div>

      {/* Live Conference Banner / Status */}
      {isLiveToday ? (
        <div className="p-4 rounded-3xl bg-emerald-500/15 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs sm:text-sm font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">
              Conference Is Live Today ({todayDateIso})
            </span>
          </div>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2.5 py-1 rounded-full">
            {liveCurrentTime}
          </span>
        </div>
      ) : null}

      {/* Quick Actions Grid */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                to={action.link}
                className="group bg-white dark:bg-zinc-900 border border-gray-200/80 dark:border-zinc-800 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md hover:border-isot-burgundy/40 dark:hover:border-rose-900/50 transition-all flex flex-col justify-between relative"
              >
                <div>
                  <div
                    className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${action.bg} flex items-center justify-center mb-3 group-hover:scale-105 transition-transform`}
                  >
                    <Icon size={22} className={action.iconColor} />
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base text-gray-900 dark:text-white group-hover:text-isot-burgundy dark:group-hover:text-rose-400 transition-colors">
                    {action.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                    {action.subtitle}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs font-bold text-isot-burgundy dark:text-rose-400">
                  <span>Explore</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>

                {action.badge !== undefined && (
                  <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-xs font-black bg-isot-burgundy text-white">
                    {action.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </section>

      {/* Happening Now & Up Next - LIVE ONLY ON ACTUAL CONFERENCE DAYS */}
      {isLiveToday && (
        <>
          <HappeningNow currentDate={todayDateIso} currentTime={liveCurrentTime} />
          <UpNext currentDate={todayDateIso} currentTime={liveCurrentTime} />
        </>
      )}

      {/* Day Selector & Conference Agenda Explorer */}
      <section className="bg-white dark:bg-zinc-900 p-4 sm:p-6 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-isot-burgundy dark:text-rose-400">
                Scientific Programme
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mt-0.5">
              Select Conference Day
            </h2>
          </div>
        </div>

        <DaySelector
          selectedDate={selectedDay}
          onSelectDate={(date) => setSelectedDay(date)}
        />
      </section>

      {/* Today's Sessions Overview */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
              {activeDayInfo.dayName} Programme ({activeDayInfo.dayFormatted})
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {activeDaySessions.length} Parallel Halls & Symposia
            </p>
          </div>

          <Link
            to={`/programme/${selectedDay}`}
            className="text-xs sm:text-sm font-bold text-isot-burgundy dark:text-rose-400 hover:text-isot-deep-burgundy flex items-center gap-1"
          >
            <span>Full Schedule</span>
            <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {activeDaySessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      </section>

      {/* Important Information & Special Events */}
      <section className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Award size={20} className="text-isot-burgundy dark:text-rose-400" />
          <h2 className="text-lg font-black text-gray-900 dark:text-white">
            Important Conference Information
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {EVENT_DETAILS.specialEvents.map((event, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/60 dark:border-zinc-700/60 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="text-[11px] font-bold text-isot-burgundy dark:text-rose-400">
                    {event.day}
                  </span>
                  <span className="text-[11px] font-bold text-gray-500 dark:text-gray-400">
                    {event.time}
                  </span>
                </div>
                <h4 className="font-extrabold text-sm text-gray-900 dark:text-white mb-1">
                  {event.title}
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">{event.note}</p>
              </div>

              <div className="mt-3 pt-2 border-t border-gray-200/50 dark:border-zinc-700/50 flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300 font-medium">
                <MapPin size={13} className="text-isot-gold" />
                <span>{event.venue}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Organised By Footer Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-isot-burgundy/10 to-amber-500/10 dark:from-rose-950/20 dark:to-zinc-800 border border-isot-burgundy/20 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-isot-burgundy text-white flex items-center justify-center font-black text-sm shrink-0">
            ISOT
          </div>
          <div>
            <h4 className="font-bold text-sm text-gray-900 dark:text-white">
              Organised by Kidney Health Trust of Telangana
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Congress Secretariat: Meety Events Private Limited, HITEX Hyderabad
            </p>
          </div>
        </div>

        <Link
          to="/about"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-isot-burgundy text-white font-bold text-xs shadow-sm hover:bg-isot-deep-burgundy transition-colors shrink-0"
        >
          <span>About ISOT & Council</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
};
