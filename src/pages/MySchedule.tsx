import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useScheduleStore, SavedItem } from '../store/scheduleStore';
import { CONFERENCE_DAYS } from '../data/event';
import { Bookmark, Calendar, Trash2, ChevronRight, Mic, ArrowRight, FileDown, FileSpreadsheet, Table, CalendarPlus } from 'lucide-react';
import { timeToMinutes } from '../utils/timeUtils';
import { PdfExportModal } from '../components/PdfExportModal';
import { CalendarSyncModal } from '../components/CalendarSyncModal';
import { useProgrammeStore } from '../store/programmeStore';
import { downloadProgrammeExcel, downloadProgrammeCsv } from '../utils/excelGenerator';
import { addToDeviceCalendar, createICSFile } from '../utils/calendarGenerator';

export const MySchedule: React.FC = () => {
  const { savedItems, removeSavedItem, clearSchedule } = useScheduleStore();
  const { sessions } = useProgrammeStore();
  const [selectedDayFilter, setSelectedDayFilter] = useState<string>('all');
  const [isPdfModalOpen, setIsPdfModalOpen] = useState<boolean>(false);
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState<boolean>(false);

  // Filter items by day
  const filteredItems = savedItems.filter((item) => {
    if (selectedDayFilter === 'all') return true;
    return item.date === selectedDayFilter;
  });

  // Sort chronologically by date and startTime
  const sortedItems = [...filteredItems].sort((a, b) => {
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    return timeToMinutes(a.startTime) - timeToMinutes(b.startTime);
  });

  // Group by Date for display
  const groupedByDate: { [date: string]: SavedItem[] } = {};
  sortedItems.forEach((item) => {
    if (!groupedByDate[item.date]) groupedByDate[item.date] = [];
    groupedByDate[item.date].push(item);
  });

  const handleAddToCalendar = async () => {
    if (savedItems.length === 0) return;
    
    // Check if Web Share API with files is supported (mobile iOS/Android)
    try {
      const sampleFile = createICSFile(savedItems.slice(0, 1));
      if (navigator?.canShare && navigator.canShare({ files: [sampleFile] })) {
        await addToDeviceCalendar(savedItems);
        return;
      }
    } catch {
      // Fallback to modal if canShare check fails
    }

    // Open rich Calendar Sync modal for desktop & browser calendar choices
    setIsCalendarModalOpen(true);
  };

  const handleExportExcel = () => {
    downloadProgrammeExcel(sessions, {
      scope: 'saved',
      savedItemIds: savedItems.map((i) => i.id),
    });
  };

  const handleExportCsv = () => {
    downloadProgrammeCsv(sessions, {
      scope: 'saved',
      savedItemIds: savedItems.map((i) => i.id),
    });
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
              My Schedule
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-isot-burgundy text-white">
              {savedItems.length}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Personalized itinerary stored securely on your device
          </p>
        </div>

        {savedItems.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsPdfModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-isot-burgundy hover:bg-isot-deep-burgundy text-white text-xs font-bold shadow-md shadow-isot-burgundy/25 transition-all"
              title="Download Personalized PDF Itinerary"
            >
              <FileDown size={14} />
              <span>PDF</span>
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all"
              title="Download Excel Spreadsheet (.xlsx)"
            >
              <FileSpreadsheet size={14} />
              <span>Excel</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm transition-all"
              title="Download CSV (.csv)"
            >
              <Table size={14} />
              <span>CSV</span>
            </button>

            <button
              type="button"
              onClick={handleAddToCalendar}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition-all active:scale-95"
              title="Add to Device Calendar (Apple, Google, Outlook)"
            >
              <CalendarPlus size={14} />
              <span>Add to Calendar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear your saved schedule?')) {
                  clearSchedule();
                }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-all"
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          </div>
        )}
      </div>

      {/* Day Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          type="button"
          onClick={() => setSelectedDayFilter('all')}
          className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
            selectedDayFilter === 'all'
              ? 'bg-isot-burgundy text-white shadow-sm shadow-isot-burgundy/25'
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-800'
          }`}
        >
          All Days ({savedItems.length})
        </button>

        {CONFERENCE_DAYS.map((day) => {
          const count = savedItems.filter((i) => i.date === day.date).length;
          return (
            <button
              key={day.date}
              type="button"
              onClick={() => setSelectedDayFilter(day.date)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                selectedDayFilter === day.date
                  ? 'bg-isot-burgundy text-white shadow-sm shadow-isot-burgundy/25'
                  : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-zinc-800'
              }`}
            >
              {day.dayName} ({count})
            </button>
          );
        })}
      </div>

      {/* Saved Schedule Content */}
      {sortedItems.length > 0 ? (
        <div className="space-y-8">
          {Object.keys(groupedByDate)
            .sort()
            .map((dateKey) => {
              const dayObj = CONFERENCE_DAYS.find((d) => d.date === dateKey);
              const itemsOnDay = groupedByDate[dateKey];

              return (
                <div key={dateKey} className="space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-gray-200 dark:border-zinc-800">
                    <Calendar size={16} className="text-isot-burgundy dark:text-rose-400" />
                    <h3 className="font-extrabold text-base text-gray-900 dark:text-white">
                      {dayObj?.dayName}, {dayObj?.dayFormatted} 2026
                    </h3>
                    <span className="text-xs text-gray-400 font-semibold">
                      • {itemsOnDay.length} item{itemsOnDay.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                    {itemsOnDay.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-gray-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2">
                            <span className="inline-flex items-center px-2.5 py-1 rounded-xl bg-red-50 dark:bg-red-950/80 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-900/60 font-black text-xs">
                              <span>{item.startTime} {item.endTime ? `– ${item.endTime}` : ''}</span>
                            </span>

                            <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2.5 py-0.5 rounded-full">
                              {item.venue}
                            </span>
                          </div>

                          {item.sessionTitle && item.type === 'talk' && (
                            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1 line-clamp-1">
                              {item.sessionTitle}
                            </div>
                          )}

                          <Link
                            to={item.type === 'session' ? `/session/${item.id}` : `/talk/${item.id}`}
                            className="block group"
                          >
                            <h4 className="text-base font-black text-gray-900 dark:text-white group-hover:text-isot-burgundy dark:group-hover:text-rose-400 transition-colors leading-snug mb-2">
                              {item.title}
                            </h4>
                          </Link>

                          {item.speakers && item.speakers.length > 0 && (
                            <div className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1.5 mb-2">
                              <Mic size={13} className="text-isot-burgundy dark:text-rose-400 shrink-0" />
                              <span>{item.speakers.join(', ')}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-3 mt-2 border-t border-gray-100 dark:border-zinc-800/80">
                          <Link
                            to={item.type === 'session' ? `/session/${item.id}` : `/talk/${item.id}`}
                            className="text-xs font-bold text-isot-burgundy dark:text-rose-400 hover:underline flex items-center gap-1"
                          >
                            <span>Open {item.type === 'session' ? 'Session' : 'Talk'}</span>
                            <ChevronRight size={14} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => removeSavedItem(item.id)}
                            className="p-1.5 text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-800"
                            title="Remove from My Schedule"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 text-center border border-gray-200 dark:border-zinc-800 space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <Bookmark size={32} />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900 dark:text-white mb-1">
              Your schedule is currently empty
            </h3>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Tap the bookmark or star icon on any session or talk across the programme to build your personalized ISOT 2026 conference schedule.
            </p>
          </div>
          <Link
            to="/programme"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-isot-burgundy hover:bg-isot-deep-burgundy text-white font-black text-xs shadow-md shadow-isot-burgundy/25 transition-all"
          >
            <span>Browse Programme</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      )}

      {/* PDF Export Modal */}
      <PdfExportModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
      />

      {/* Calendar Sync Modal */}
      <CalendarSyncModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        savedItems={savedItems}
      />
    </div>
  );
};
