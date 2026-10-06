import React from 'react';
import { EVENT_DETAILS, ISOT_COUNCIL } from '../data/event';
import { ShieldCheck, Award, HeartHandshake, MapPin, ExternalLink, Users } from 'lucide-react';
import { SpeakerAvatar } from '../components/SpeakerAvatar';

export const About: React.FC = () => {
  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
          About ISOT 2026 & Council
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          Indian Society of Organ Transplantation • 36th Annual Conference
        </p>
      </div>

      {/* Conference Overview Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-isot-light-pink dark:bg-rose-950/40 text-isot-burgundy dark:text-rose-300 font-bold text-xs">
          <ShieldCheck size={14} />
          <span>Official Conference Overview</span>
        </div>

        <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
          {EVENT_DETAILS.fullTitle}
        </h2>

        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
          The 36th Annual Conference of the Indian Society of Organ Transplantation (ISOT 2026) is the premier gathering of transplant physicians, surgeons, immunologists, critical care specialists, pathologists, and policy makers in South Asia.
        </p>

        <div className="p-4 rounded-2xl bg-isot-burgundy/5 dark:bg-rose-950/20 border border-isot-burgundy/15 space-y-1">
          <span className="text-[10px] uppercase font-bold tracking-widest text-isot-burgundy dark:text-rose-400">
            Conference Theme
          </span>
          <p className="text-base font-extrabold text-gray-900 dark:text-white">
            “{EVENT_DETAILS.theme}”
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/60 dark:border-zinc-700/60">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Dates</span>
            <p className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white">{EVENT_DETAILS.datesDisplay}</p>
          </div>
          <div className="p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/60 dark:border-zinc-700/60">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Venue</span>
            <p className="font-extrabold text-xs sm:text-sm text-gray-900 dark:text-white">HITEX, Hyderabad</p>
          </div>
          <div className="p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/60 dark:border-zinc-700/60">
            <span className="text-[10px] font-bold text-gray-400 uppercase">Official Website</span>
            <a
              href="https://www.isot2026.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-extrabold text-xs sm:text-sm text-isot-burgundy dark:text-rose-400 flex items-center gap-1 hover:underline"
            >
              <span>{EVENT_DETAILS.website}</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>
      </div>

      {/* ISOT Council Section */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Users size={20} className="text-isot-burgundy dark:text-rose-400" />
          <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
            ISOT Council
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {ISOT_COUNCIL.map((member, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-zinc-900 rounded-2xl p-4 border border-gray-200/80 dark:border-zinc-800 shadow-sm flex items-center gap-3.5 hover:border-isot-burgundy/30 transition-colors"
            >
              <SpeakerAvatar name={member.name} size="md" />
              <div>
                <h4 className="font-extrabold text-sm text-gray-900 dark:text-white">
                  {member.name}
                </h4>
                <p className="text-xs text-isot-burgundy dark:text-rose-400 font-bold">
                  {member.designation}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Organising Committee & Secretariat */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Organising Secretaries */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <HeartHandshake size={20} className="text-isot-burgundy dark:text-rose-400" />
            <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white">
              Organising Committee
            </h3>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Organised By
            </span>
            <p className="font-extrabold text-sm text-gray-900 dark:text-white">
              {EVENT_DETAILS.organizedBy}
            </p>
          </div>

          <div className="space-y-3 pt-3 border-t border-gray-100 dark:border-zinc-800">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              Organizing Secretaries
            </span>
            {EVENT_DETAILS.organizingSecretaries.map((sec, i) => (
              <div key={i} className="p-3 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/60 dark:border-zinc-700/60 flex items-center gap-3">
                <SpeakerAvatar name={sec.name} size="md" />
                <div>
                  <p className="font-extrabold text-sm text-gray-900 dark:text-white">{sec.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{sec.affiliation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Congress Secretariat */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Award size={20} className="text-isot-burgundy dark:text-rose-400" />
            <h3 className="font-extrabold text-base sm:text-lg text-gray-900 dark:text-white">
              Congress Secretariat & PCO
            </h3>
          </div>

          <div className="space-y-1">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Professional Conference Organiser (PCO)
            </span>
            <p className="font-extrabold text-sm text-gray-900 dark:text-white">
              {EVENT_DETAILS.pco.name}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/60 dark:border-zinc-700/60 space-y-2">
            <div>
              <p className="font-extrabold text-sm text-gray-900 dark:text-white">
                {EVENT_DETAILS.congressSecretariat.contactPerson}
              </p>
              <p className="text-xs text-isot-burgundy dark:text-rose-400 font-semibold">
                {EVENT_DETAILS.congressSecretariat.title}
              </p>
            </div>
            <div className="flex items-start gap-1.5 text-xs text-gray-500 dark:text-gray-400 pt-1">
              <MapPin size={14} className="shrink-0 mt-0.5 text-isot-gold" />
              <span>{EVENT_DETAILS.congressSecretariat.address}</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
