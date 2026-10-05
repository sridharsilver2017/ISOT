import React from 'react';
import { Link } from 'react-router-dom';
import { Speaker } from '../types/programme';
import { ChevronRight } from 'lucide-react';

interface SpeakerCardProps {
  speaker: Speaker;
}

export const SpeakerCard: React.FC<SpeakerCardProps> = ({ speaker }) => {
  // Aggregate unique roles
  const uniqueRoles = Array.from(new Set(speaker.roles.map((r) => r.role)));

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'speaker':
        return { label: 'Speaker', bg: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300' };
      case 'chairperson':
        return { label: 'Chairperson', bg: 'bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300' };
      case 'panelist':
        return { label: 'Panelist', bg: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300' };
      case 'moderator':
        return { label: 'Moderator', bg: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300' };
      case 'incharge':
        return { label: 'Session In-Charge', bg: 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-300' };
      case 'coordinator':
        return { label: 'Coordinator', bg: 'bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-300' };
      default:
        return { label: role, bg: 'bg-gray-100 text-gray-700 dark:bg-zinc-800 dark:text-gray-300' };
    }
  };

  return (
    <Link
      to={`/speaker/${speaker.id}`}
      className="group block bg-white dark:bg-zinc-900 rounded-3xl p-5 border border-gray-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md hover:border-isot-burgundy/40 dark:hover:border-rose-800/40 transition-all duration-200"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-isot-burgundy/10 to-isot-gold/20 dark:from-rose-950/60 dark:to-zinc-800 border border-isot-burgundy/20 flex items-center justify-center text-isot-burgundy dark:text-rose-400 font-bold text-lg group-hover:scale-105 transition-transform shrink-0">
            {speaker.name.charAt(0)}
          </div>
          <div>
            <h4 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white group-hover:text-isot-burgundy dark:group-hover:text-rose-400 transition-colors">
              {speaker.name}
            </h4>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {speaker.roles.length} session contribution{speaker.roles.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        <div className="p-2 rounded-full text-gray-400 group-hover:text-isot-burgundy dark:group-hover:text-rose-400 group-hover:translate-x-1 transition-all">
          <ChevronRight size={18} />
        </div>
      </div>

      {/* Role Badges */}
      <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-gray-100 dark:border-zinc-800/80">
        {uniqueRoles.map((role) => {
          const badge = getRoleBadge(role);
          return (
            <span
              key={role}
              className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full ${badge.bg}`}
            >
              {badge.label}
            </span>
          );
        })}
      </div>
    </Link>
  );
};
