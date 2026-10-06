import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, ExternalLink, ArrowRight, BookOpen } from 'lucide-react';

export const Brochure: React.FC = () => {
  return (
    <div className="space-y-6 sm:space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Conference Brochure
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            ISOT 2026 Announcement & Programme Document
          </p>
        </div>

        <Link
          to="/programme"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-isot-burgundy hover:bg-isot-deep-burgundy text-white font-bold text-xs shadow-md shadow-isot-burgundy/25 transition-all self-start sm:self-auto"
        >
          <BookOpen size={16} />
          <span>Interactive Programme App</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Brochure Overview Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 border border-gray-200/80 dark:border-zinc-800 shadow-sm space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-isot-burgundy text-white flex items-center justify-center font-black text-base shadow-md">
            <FileText size={24} />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white">
              ISOT 2026 Official Programme Brochure (V21)
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              36th Annual Conference • Indian Society of Organ Transplantation • 32 Pages Complete Catalogue
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          <a
            href="/ISOT-2026-Brochure-V21.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-isot-burgundy hover:bg-isot-deep-burgundy text-white font-bold text-xs shadow-md shadow-isot-burgundy/25 transition-all"
          >
            <FileText size={16} />
            <span>Open V21 Brochure PDF</span>
            <ExternalLink size={14} />
          </a>

          <a
            href="/ISOT-2026-Brochure-V21.pdf"
            download="ISOT-2026-Brochure-V21.pdf"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-gray-200 font-bold text-xs border border-gray-200 dark:border-zinc-700 transition-all"
          >
            <span>Download V21 PDF</span>
          </a>
        </div>

        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/60 border border-gray-200/60 dark:border-zinc-700/60 text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
          <p>
            The interactive programme in this web companion has been meticulously converted directly from the official ISOT 2026 programme catalogue, covering all 19 parallel symposia, orations, panel discussions, and workshops across Hall A, Hall B (Screens 1, 2, 3), Hall C, Hall D, Hall F, and TID 2026.
          </p>
        </div>

        {/* Brochure Document Summary Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-isot-burgundy dark:text-rose-400">
              Day 1: Friday 09 Oct
            </span>
            <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
              <li>• Kidney & Organ Transplantation (Hall A, p.5)</li>
              <li>• Transplant Pathology (Hall B1, p.6)</li>
              <li>• ISOT – ISCCM (Hall B2, p.8)</li>
              <li>• ISOT – BTS Immunology (Hall B3, p.9)</li>
              <li>• AI in Transplantation (Hall D, p.11)</li>
              <li>• Free Paper Oral Presentations (Hall C)</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-isot-burgundy dark:text-rose-400">
              Day 2: Saturday 10 Oct
            </span>
            <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
              <li>• ISOT Orations & Plenary (Hall A, p.14)</li>
              <li>• Transplantation Surgery (Hall B1, p.15)</li>
              <li>• Heart / Lungs / Hand (Hall B2, p.17)</li>
              <li>• Multi Organ Transplantation (Hall B2, p.17)</li>
              <li>• ABO Incompatible (Hall B3, p.18)</li>
              <li>• NOTTO Policy & Swap (Hall C, p.19)</li>
              <li>• AI Hands-on Protocols (Hall D, p.20)</li>
              <li>• Liver in Transplantation (Hall F, p.23)</li>
              <li>• TID 2026 Solid Organ (p.24)</li>
            </ul>
          </div>

          <div className="p-4 rounded-2xl border border-gray-200 dark:border-zinc-800 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-isot-burgundy dark:text-rose-400">
              Day 3: Sunday 11 Oct
            </span>
            <ul className="text-xs space-y-1 text-gray-600 dark:text-gray-400">
              <li>• Precision Medicine & TAC (Hall A, p.25)</li>
              <li>• DCD India Symposia (Hall B1, p.26)</li>
              <li>• Pregnancy, Living Donor & Swap (Hall B2, p.27)</li>
              <li>• IPTA Pediatric Transplantation (Hall B3, p.28)</li>
              <li>• Valedictory Ceremony & Lunch</li>
            </ul>
          </div>
        </div>

        {/* Action Link to Official Site */}
        <div className="pt-4 border-t border-gray-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-3">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            For registration, abstract submission updates, and accommodations:
          </span>
          <a
            href="https://www.isot2026.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-isot-burgundy dark:text-rose-400 hover:underline"
          >
            <span>Visit www.isot2026.com</span>
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </div>
  );
};
