import React, { useState } from 'react';
import {
  FileDown,
  X,
  Calendar,
  Layers,
  Bookmark,
  Printer,
  CheckCircle2,
  FileText,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { useProgrammeStore } from '../store/programmeStore';
import { useScheduleStore } from '../store/scheduleStore';
import { generateProgrammePdf } from '../utils/pdfGenerator';
import { CONFERENCE_DAYS } from '../data/event';

const CONFERENCE_HALLS: string[] = [
  'Hall A',
  'Hall B – Screen 1',
  'Hall B – Screen 2',
  'Hall B – Screen 3',
  'Hall C',
  'Hall D',
  'Hall F',
];

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  defaultDate = '2026-10-09',
}) => {
  const { sessions } = useProgrammeStore();
  const { savedItems } = useScheduleStore();

  const [scope, setScope] = useState<'all' | 'day' | 'saved'>('all');
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [selectedHall, setSelectedHall] = useState<string>('All Halls');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    try {
      await generateProgrammePdf(sessions, {
        scope,
        selectedDate,
        selectedHall,
        savedItemIds: savedItems.map((item) => item.id),
      });
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className="bg-white dark:bg-zinc-900 w-full max-w-lg rounded-3xl border border-gray-200 dark:border-zinc-800 shadow-2xl overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative bg-gradient-to-r from-isot-burgundy via-isot-deep-burgundy to-isot-navy p-6 text-white">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X size={18} />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-inner">
              <FileDown size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-black tracking-tight">
                  Export Programme PDF
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-amber-400 text-isot-deep-burgundy rounded-full shadow-sm">
                  V21 Ready
                </span>
              </div>
              <p className="text-xs text-white/80">
                Generate high-resolution, beautifully formatted schedule documents
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Scope Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              1. Choose Schedule Scope
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setScope('all')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  scope === 'all'
                    ? 'border-isot-burgundy bg-isot-burgundy/5 dark:bg-isot-burgundy/20 ring-2 ring-isot-burgundy/30'
                    : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Layers
                    size={18}
                    className={
                      scope === 'all'
                        ? 'text-isot-burgundy dark:text-rose-400'
                        : 'text-gray-400'
                    }
                  />
                  {scope === 'all' && (
                    <CheckCircle2
                      size={16}
                      className="text-isot-burgundy dark:text-rose-400"
                    />
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    Full Programme
                  </p>
                  <p className="text-[10px] text-gray-500">All 3 Days (Complete)</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScope('day')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  scope === 'day'
                    ? 'border-isot-burgundy bg-isot-burgundy/5 dark:bg-isot-burgundy/20 ring-2 ring-isot-burgundy/30'
                    : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Calendar
                    size={18}
                    className={
                      scope === 'day'
                        ? 'text-isot-burgundy dark:text-rose-400'
                        : 'text-gray-400'
                    }
                  />
                  {scope === 'day' && (
                    <CheckCircle2
                      size={16}
                      className="text-isot-burgundy dark:text-rose-400"
                    />
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    Single Day
                  </p>
                  <p className="text-[10px] text-gray-500">Selected Day Only</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setScope('saved')}
                className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                  scope === 'saved'
                    ? 'border-isot-burgundy bg-isot-burgundy/5 dark:bg-isot-burgundy/20 ring-2 ring-isot-burgundy/30'
                    : 'border-gray-200 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <Bookmark
                    size={18}
                    className={
                      scope === 'saved'
                        ? 'text-isot-burgundy dark:text-rose-400'
                        : 'text-gray-400'
                    }
                  />
                  {scope === 'saved' && (
                    <CheckCircle2
                      size={16}
                      className="text-isot-burgundy dark:text-rose-400"
                    />
                  )}
                </div>
                <div className="mt-2">
                  <p className="text-xs font-bold text-gray-900 dark:text-white">
                    My Schedule
                  </p>
                  <p className="text-[10px] text-gray-500">
                    {savedItems.length} Bookmarks
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Conditional Day Selector */}
          {scope === 'day' && (
            <div className="animate-fade-in">
              <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
                Select Date
              </label>
              <div className="grid grid-cols-3 gap-2">
                {CONFERENCE_DAYS.map((d) => (
                  <button
                    key={d.date}
                    type="button"
                    onClick={() => setSelectedDate(d.date)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      selectedDate === d.date
                        ? 'bg-isot-burgundy text-white border-isot-burgundy shadow-sm'
                        : 'border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <div>{d.dayName}</div>
                    <div className="text-[10px] opacity-80">{d.dayFormatted}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Hall Filter */}
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
              Filter by Hall (Optional)
            </label>
            <select
              value={selectedHall}
              onChange={(e) => setSelectedHall(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-800 text-xs font-medium text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-isot-burgundy/40"
            >
              <option value="All Halls">All Halls (Complete Coverage)</option>
              {CONFERENCE_HALLS.map((h) => (
                <option key={h} value={h}>
                  {h}
                </option>
              ))}
            </select>
          </div>

          {/* Direct Download Official Brochure Option */}
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <FileText className="text-amber-700 dark:text-amber-400 shrink-0" size={20} />
              <div>
                <p className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Official 32-Page Brochure (V21 PDF)
                </p>
                <p className="text-[10px] text-amber-700 dark:text-amber-400">
                  Direct official high-res catalogue file
                </p>
              </div>
            </div>
            <a
              href="/ISOT-2026-Brochure-V21.pdf"
              download="ISOT-2026-Brochure-V21.pdf"
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold shadow-sm whitespace-nowrap"
            >
              Download PDF
            </a>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 dark:bg-zinc-800/60 border-t border-gray-200/80 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={handlePrint}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-zinc-700 hover:bg-gray-100 dark:hover:bg-zinc-700 text-gray-700 dark:text-gray-300 text-xs font-bold transition-all"
          >
            <Printer size={15} />
            <span>Print View</span>
          </button>

          <div className="w-full sm:w-auto flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGeneratePdf}
              className="w-1/2 sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-isot-burgundy hover:bg-isot-deep-burgundy disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-isot-burgundy/25 transition-all"
            >
              {isGenerating ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  <span>Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles size={15} className="text-amber-300" />
                  <span>Download Styled PDF</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
