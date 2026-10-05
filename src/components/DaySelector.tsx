import React from 'react';
import { CONFERENCE_DAYS } from '../data/event';
import { useProgrammeStore } from '../store/programmeStore';

interface DaySelectorProps {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  className?: string;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  selectedDate,
  onSelectDate,
  className = '',
}) => {
  const { sessions } = useProgrammeStore();

  return (
    <div className={`w-full ${className}`}>
      {/* 3-Column Responsive Grid that fits mobile screens without horizontal clipping */}
      <div className="grid grid-cols-3 gap-2 sm:gap-3 w-full py-1">
        {CONFERENCE_DAYS.map((day) => {
          const isSelected = selectedDate === day.date;
          // Calculate dynamic session count from live store
          const daySessionsCount = sessions.filter((s) => s.date === day.date).length;

          return (
            <button
              key={day.date}
              type="button"
              onClick={() => onSelectDate(day.date)}
              className={`text-left p-3 sm:p-4 rounded-2xl sm:rounded-3xl transition-all duration-200 relative border flex flex-col justify-between active:scale-[0.98] ${
                isSelected
                  ? 'bg-gradient-to-br from-isot-burgundy to-isot-deep-burgundy text-white border-transparent shadow-lg shadow-isot-burgundy/25 ring-2 ring-isot-burgundy/50'
                  : 'bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-200 border-gray-200/80 dark:border-zinc-800 hover:border-isot-burgundy/40 dark:hover:border-zinc-700 shadow-sm'
              }`}
            >
              {/* Day Name */}
              <div className="flex items-center justify-between gap-1">
                <span
                  className={`text-[11px] sm:text-xs uppercase font-black tracking-wider truncate ${
                    isSelected ? 'text-amber-300' : 'text-isot-burgundy dark:text-rose-400'
                  }`}
                >
                  <span className="hidden sm:inline">{day.dayName}</span>
                  <span className="sm:hidden">{day.dayName.slice(0, 3)}</span>
                </span>

                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full shrink-0 ${
                    isSelected
                      ? 'bg-white/20 text-white'
                      : 'bg-gray-100 dark:bg-zinc-800 text-gray-500 dark:text-gray-400'
                  }`}
                >
                  {daySessionsCount}
                </span>
              </div>

              {/* Date */}
              <div className="mt-1 sm:mt-1.5">
                <div className="text-sm sm:text-lg font-black tracking-tight leading-tight">
                  {day.dayFormatted}
                </div>
                <div
                  className={`text-[10px] sm:text-[11px] font-semibold mt-0.5 ${
                    isSelected ? 'text-rose-100' : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  2026 • {daySessionsCount} Sessions
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
