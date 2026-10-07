import { ProgrammeItem, Session, getSessionItems } from '../types/programme';

export const CONFERENCE_DATES = ['2026-10-09', '2026-10-10', '2026-10-11'];

// Get current date in YYYY-MM-DD
export function getTodayDateIso(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

// Get current time in HH:mm
export function getCurrentTimeHHMM(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${min}`;
}

// Check if today is an active conference day
export function isTodayConferenceDay(): boolean {
  return CONFERENCE_DATES.includes(getTodayDateIso());
}

// Parse HH:mm to minutes since start of day
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const parts = timeStr.split(':');
  if (parts.length < 2) return 0;
  const hours = parseInt(parts[0], 10) || 0;
  const mins = parseInt(parts[1], 10) || 0;
  return hours * 60 + mins;
}

export function isTimeInRange(checkTime: string, startTime: string, endTime?: string): boolean {
  const current = timeToMinutes(checkTime);
  const start = timeToMinutes(startTime);
  const end = endTime ? timeToMinutes(endTime) : start + 30; // fallback 30 mins
  return current >= start && current < end;
}

export function getCurrentProgrammeItem(
  currentDate: string,
  currentTime: string,
  sessions: Session[] = []
): {
  happeningNow: ProgrammeItem[];
  upNext: ProgrammeItem[];
  isWithinConferenceHours: boolean;
} {
  const currentMinutes = timeToMinutes(currentTime);

  // Get all items for this date
  const dayItems = sessions
    .filter((s) => s.date === currentDate)
    .flatMap((s) => getSessionItems(s));

  if (dayItems.length === 0) {
    return {
      happeningNow: [],
      upNext: [],
      isWithinConferenceHours: false,
    };
  }

  // Find min start and max end for the day
  let minStart = 24 * 60;
  let maxEnd = 0;
  dayItems.forEach((item) => {
    const s = timeToMinutes(item.startTime);
    const e = item.endTime ? timeToMinutes(item.endTime) : s + 30;
    if (s < minStart) minStart = s;
    if (e > maxEnd) maxEnd = e;
  });

  const isWithinConferenceHours = currentMinutes >= minStart && currentMinutes <= maxEnd;

  // Happening now: items where currentTime is between startTime and endTime
  const happeningNow = dayItems.filter((item) => {
    const s = timeToMinutes(item.startTime);
    const e = item.endTime ? timeToMinutes(item.endTime) : s + 25;
    return currentMinutes >= s && currentMinutes < e;
  });

  // Up next: items starting strictly after currentTime, grouped by earliest upcoming slot
  const upcomingItems = dayItems
    .filter((item) => timeToMinutes(item.startTime) >= currentMinutes)
    .sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));

  let upNext: ProgrammeItem[] = [];
  if (upcomingItems.length > 0) {
    const nextStartTime = upcomingItems[0].startTime;
    upNext = upcomingItems.filter((item) => item.startTime === nextStartTime);
  }

  return {
    happeningNow,
    upNext,
    isWithinConferenceHours,
  };
}

export function formatTimeSlot(startTime: string, endTime?: string): string {
  if (!endTime) return startTime;
  return `${startTime} – ${endTime}`;
}

export function getTypeBadgeColor(type: string): { bg: string; text: string; border: string; label: string } {
  switch (type) {
    case 'oration':
      return { bg: 'bg-amber-50 dark:bg-amber-950/40', text: 'text-amber-700 dark:text-amber-400', border: 'border-amber-200 dark:border-amber-800', label: 'Oration' };
    case 'panel':
      return { bg: 'bg-indigo-50 dark:bg-indigo-950/40', text: 'text-indigo-700 dark:text-indigo-400', border: 'border-indigo-200 dark:border-indigo-800', label: 'Panel' };
    case 'workshop':
      return { bg: 'bg-pink-50 dark:bg-pink-950/40', text: 'text-pink-700 dark:text-pink-400', border: 'border-pink-200 dark:border-pink-800', label: 'Hands-on AI' };
    case 'ceremony':
      return { bg: 'bg-rose-50 dark:bg-rose-950/40', text: 'text-rose-700 dark:text-rose-400', border: 'border-rose-200 dark:border-rose-800', label: 'Ceremony' };
    case 'lunch':
      return { bg: 'bg-emerald-50 dark:bg-emerald-950/40', text: 'text-emerald-700 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-800', label: 'Lunch' };
    case 'dinner':
      return { bg: 'bg-purple-50 dark:bg-purple-950/40', text: 'text-purple-700 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-800', label: 'Gala Dinner' };
    case 'break':
      return { bg: 'bg-orange-50 dark:bg-orange-950/40', text: 'text-orange-700 dark:text-orange-400', border: 'border-orange-200 dark:border-orange-800', label: 'Tea Break' };
    case 'gbm':
      return { bg: 'bg-red-50 dark:bg-red-950/40', text: 'text-red-700 dark:text-red-400', border: 'border-red-200 dark:border-red-800', label: 'GBM' };
    case 'registration':
      return { bg: 'bg-blue-50 dark:bg-blue-950/40', text: 'text-blue-700 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-800', label: 'Registration' };
    case 'talk':
    default:
      return { bg: 'bg-sky-50 dark:bg-sky-950/40', text: 'text-sky-700 dark:text-sky-400', border: 'border-sky-200 dark:border-sky-800', label: 'Talk' };
  }
}

export interface ParsedPartHeader {
  isPart: boolean;
  partName?: string;
  time?: string;
  title?: string;
}

export function parsePartHeader(text: string): ParsedPartHeader {
  if (!text) return { isPart: false };
  const match = text.match(/^(Part\s+[A-Z0-9]+)\s*\(([\d]{1,2}:[\d]{2}\s*[\u2013\u2014–-]\s*[\d]{1,2}:[\d]{2})\)\s*:\s*(.*)$/i);
  if (match) {
    return {
      isPart: true,
      partName: match[1].trim(),
      time: match[2].replace(/[\u2013\u2014-]/g, '–').trim(),
      title: match[3].trim(),
    };
  }

  const altMatch = text.match(/^(Part\s+[A-Z0-9]+)\s*:\s*(.*)$/i);
  if (altMatch) {
    return {
      isPart: true,
      partName: altMatch[1].trim(),
      title: altMatch[2].trim(),
    };
  }

  return { isPart: false };
}

export function isSpecialEvent(title: string = '', type: string = ''): boolean {
  const t = (title || '').toLowerCase().trim();
  const typ = (type || '').toLowerCase().trim();

  if (['registration', 'ceremony', 'lunch', 'dinner', 'break', 'social'].includes(typ)) {
    return true;
  }

  if (
    t.includes('registration') ||
    t.includes('ceremony') ||
    t.includes('inaugural') ||
    t.includes('valedictory') ||
    t.includes('lunch') ||
    t.includes('gala dinner') ||
    t.includes('dinner') ||
    t.includes('tea break') ||
    t.includes('coffee break') ||
    t.includes('high tea') ||
    t.includes('welcome reception') ||
    t.includes('inauguration')
  ) {
    return true;
  }

  return false;
}
