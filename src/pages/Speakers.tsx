import React, { useState, useMemo } from 'react';
import { useProgrammeStore } from '../store/programmeStore';
import { SpeakerCard } from '../components/SpeakerCard';
import { Search, Users, X } from 'lucide-react';

export const Speakers: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('All');
  const [selectedLetter, setSelectedLetter] = useState<string>('All');

  const { getSpeakers } = useProgrammeStore();
  const speakers = getSpeakers();

  // Available alphabetical letters from existing speakers
  const alphabet = useMemo(() => {
    const letters = new Set(speakers.map((s) => s.name.charAt(0).toUpperCase()));
    return Array.from(letters).sort();
  }, [speakers]);

  // Filtered speakers
  const filteredSpeakers = useMemo(() => {
    return speakers.filter((speaker) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = speaker.name.toLowerCase().includes(q);
        const matchesTalk = speaker.roles.some((r) =>
          r.talkTitle?.toLowerCase().includes(q) || r.sessionTitle.toLowerCase().includes(q)
        );
        if (!matchesName && !matchesTalk) return false;
      }

      // Role filter
      if (selectedRole !== 'All') {
        if (!speaker.roles.some((r) => r.role === selectedRole)) {
          return false;
        }
      }

      // Letter filter
      if (selectedLetter !== 'All') {
        if (speaker.name.charAt(0).toUpperCase() !== selectedLetter) {
          return false;
        }
      }

      return true;
    });
  }, [speakers, searchQuery, selectedRole, selectedLetter]);

  // Group by first letter
  const groupedByLetter = useMemo(() => {
    const groups: { [letter: string]: typeof filteredSpeakers } = {};
    filteredSpeakers.forEach((sp) => {
      const letter = sp.name.charAt(0).toUpperCase();
      if (!groups[letter]) groups[letter] = [];
      groups[letter].push(sp);
    });
    return groups;
  }, [filteredSpeakers]);

  const roleFilters = [
    { id: 'All', label: 'All Faculty' },
    { id: 'speaker', label: 'Speakers' },
    { id: 'chairperson', label: 'Chairpersons' },
    { id: 'panelist', label: 'Panelists' },
    { id: 'moderator', label: 'Moderators' },
    { id: 'incharge', label: 'Session In-Charges' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          Faculty Directory
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Distinguished national and international transplantation experts at ISOT 2026 ({speakers.length} total)
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-3xl border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-3.5">
        {/* Search input */}
        <div className="relative">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search faculty by name, topic, or keyword..."
            className="w-full pl-10 pr-9 py-2.5 bg-gray-50 dark:bg-zinc-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 rounded-xl text-sm border border-transparent focus:border-isot-burgundy focus:bg-white dark:focus:bg-zinc-900 outline-none transition-all"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* Role pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {roleFilters.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setSelectedRole(r.id)}
              className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                selectedRole === r.id
                  ? 'bg-isot-burgundy text-white shadow-sm'
                  : 'bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Alphabet quick jump */}
        <div className="pt-2 border-t border-gray-100 dark:border-zinc-800 flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setSelectedLetter('All')}
            className={`px-2 py-1 rounded-lg text-xs font-bold shrink-0 transition-colors ${
              selectedLetter === 'All'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                : 'text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            All
          </button>
          {alphabet.map((letter) => (
            <button
              key={letter}
              type="button"
              onClick={() => setSelectedLetter(letter)}
              className={`w-7 h-7 rounded-lg text-xs font-extrabold flex items-center justify-center shrink-0 transition-colors ${
                selectedLetter === letter
                  ? 'bg-isot-burgundy text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-zinc-800'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 px-1">
        <span>Showing {filteredSpeakers.length} faculty member{filteredSpeakers.length === 1 ? '' : 's'}</span>
        {(searchQuery || selectedRole !== 'All' || selectedLetter !== 'All') && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedRole('All');
              setSelectedLetter('All');
            }}
            className="text-isot-burgundy dark:text-rose-400 font-bold hover:underline"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Grouped Alphabetical Grid */}
      {filteredSpeakers.length > 0 ? (
        <div className="space-y-6">
          {Object.keys(groupedByLetter)
            .sort()
            .map((letter) => (
              <div key={letter} className="space-y-3">
                <div className="sticky top-20 z-10 inline-flex items-center justify-center w-8 h-8 rounded-xl bg-isot-burgundy text-white font-black text-sm shadow-md">
                  {letter}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {groupedByLetter[letter].map((speaker) => (
                    <SpeakerCard key={speaker.id} speaker={speaker} />
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-10 text-center border border-gray-200 dark:border-zinc-800">
          <Users size={36} className="mx-auto text-gray-300 dark:text-gray-600 mb-3" />
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
            No faculty members found
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Try searching for another name or clearing your filter selections.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setSelectedRole('All');
              setSelectedLetter('All');
            }}
            className="px-4 py-2 rounded-xl bg-isot-burgundy text-white font-bold text-xs"
          >
            Show All Faculty
          </button>
        </div>
      )}
    </div>
  );
};
