import React from 'react';
import { Search, LayoutGrid, CalendarRange, Bookmark, X } from 'lucide-react';
import { HALLS } from '../data/halls';

interface FilterBarProps {
  selectedHall: string;
  onSelectHall: (hallName: string) => void;
  availableHalls?: Array<{ id: string; name: string; shortName: string; count?: number }>;
  selectedTrack?: string;
  onSelectTrack?: (track: string) => void;
  tracks?: string[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  showSavedOnly: boolean;
  onToggleSavedOnly: () => void;
  viewMode: 'cards' | 'timeline';
  onToggleViewMode: (mode: 'cards' | 'timeline') => void;
  totalResultsCount?: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  selectedHall,
  onSelectHall,
  availableHalls,
  selectedTrack,
  onSelectTrack,
  tracks = [],
  searchQuery,
  onSearchChange,
  showSavedOnly,
  onToggleSavedOnly,
  viewMode,
  onToggleViewMode,
  totalResultsCount,
}) => {
  const activeHalls = availableHalls !== undefined ? availableHalls : HALLS;

  const hallOptions = [
    { name: 'All Halls', short: 'All Halls' },
    ...activeHalls.map((h) => ({ name: h.name, short: h.shortName })),
  ];

  return (
    <div className="w-full space-y-3 bg-white dark:bg-zinc-900/90 p-4 rounded-3xl border border-gray-200/80 dark:border-zinc-800/80 shadow-sm">
      {/* Search Input and View Switcher Row */}
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search topic, speaker, hall, keyword (e.g. ABMR, TAC)..."
            className="w-full pl-10 pr-9 py-2.5 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 rounded-xl text-sm border border-transparent focus:border-isot-burgundy focus:bg-white dark:focus:bg-zinc-900 outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Saved Only Filter Toggle */}
        <button
          type="button"
          onClick={onToggleSavedOnly}
          className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all border ${
            showSavedOnly
              ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
              : 'bg-gray-50 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700'
          }`}
          title="Filter saved items"
        >
          <Bookmark size={16} className={showSavedOnly ? 'fill-white' : ''} />
          <span className="hidden sm:inline">Saved</span>
        </button>

        {/* View Mode Toggle: Cards vs Timeline */}
        <div className="flex items-center bg-gray-100 dark:bg-zinc-800 p-1 rounded-xl border border-gray-200 dark:border-zinc-700">
          <button
            type="button"
            onClick={() => onToggleViewMode('cards')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'cards'
                ? 'bg-white dark:bg-zinc-700 text-isot-burgundy dark:text-rose-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            title="Card View"
            aria-label="Card View"
          >
            <LayoutGrid size={17} />
          </button>
          <button
            type="button"
            onClick={() => onToggleViewMode('timeline')}
            className={`p-1.5 rounded-lg transition-all ${
              viewMode === 'timeline'
                ? 'bg-white dark:bg-zinc-700 text-isot-burgundy dark:text-rose-400 shadow-sm'
                : 'text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200'
            }`}
            title="Timeline Matrix View"
            aria-label="Timeline Matrix View"
          >
            <CalendarRange size={17} />
          </button>
        </div>
      </div>

      {/* Hall Filter Horizontal Scrollable Pills (Only shown if active halls exist) */}
      {activeHalls.length > 0 && (
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1.5 px-0.5 flex items-center justify-between">
            <span>Filter by Hall</span>
            {totalResultsCount !== undefined && (
              <span className="text-isot-burgundy dark:text-rose-400 font-semibold lowercase">
                {totalResultsCount} items found
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
            {hallOptions.map((h) => {
              const isSelected = selectedHall === h.name;
              return (
                <button
                  key={h.name}
                  type="button"
                  onClick={() => onSelectHall(h.name)}
                  className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    isSelected
                      ? 'bg-isot-burgundy text-white shadow-sm shadow-isot-burgundy/25 scale-[1.02]'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {h.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Track filters (if available) */}
      {tracks.length > 1 && onSelectTrack && (
        <div className="pt-1 border-t border-gray-100 dark:border-zinc-800/80">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1 text-xs">
            <span className="text-[11px] font-bold text-gray-400 shrink-0 uppercase tracking-wider">Tracks:</span>
            <button
              type="button"
              onClick={() => onSelectTrack('All')}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                !selectedTrack || selectedTrack === 'All'
                  ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400'
              }`}
            >
              All Tracks
            </button>
            {tracks.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => onSelectTrack(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                  selectedTrack === t
                    ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-900'
                    : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
