import { SavedItem } from '../store/scheduleStore';

/**
 * Generates standard RFC 5545 iCalendar (.ics) content for saved schedule items
 * with IST (Asia/Kolkata) timezone and 15-minute reminders.
 */
export const generateICSContent = (items: SavedItem[]): string => {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//ISOT 2026//Conference Schedule//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:ISOT 2026 - My Schedule',
    'X-WR-TIMEZONE:Asia/Kolkata',
    'BEGIN:VTIMEZONE',
    'TZID:Asia/Kolkata',
    'X-LIC-LOCATION:Asia/Kolkata',
    'BEGIN:STANDARD',
    'TZOFFSETFROM:+0530',
    'TZOFFSETTO:+0530',
    'TZNAME:IST',
    'DTSTART:19700101T000000',
    'END:STANDARD',
    'END:VTIMEZONE',
  ];

  const now = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  items.forEach((item, idx) => {
    const cleanDate = item.date.replace(/-/g, '');
    const startTimeClean = (item.startTime || '09:00').replace(':', '').padEnd(4, '0') + '00';
    let endTimeClean = (item.endTime || item.startTime || '10:00').replace(':', '').padEnd(4, '0') + '00';

    if (startTimeClean === endTimeClean) {
      // Default duration to 30 mins if start and end are identical
      const [h, m] = (item.startTime || '09:00').split(':').map(Number);
      const endTotalMins = (h || 9) * 60 + (m || 0) + 30;
      const endH = String(Math.floor(endTotalMins / 60) % 24).padStart(2, '0');
      const endM = String(endTotalMins % 60).padStart(2, '0');
      endTimeClean = `${endH}${endM}00`;
    }

    const dtStart = `${cleanDate}T${startTimeClean}`;
    const dtEnd = `${cleanDate}T${endTimeClean}`;

    const cleanTitle = (item.title || 'ISOT 2026 Session')
      .replace(/\r?\n/g, ' ')
      .replace(/[,;\\]/g, (m) => `\\${m}`);
    const location = `${item.venue || 'HITEX Convention Center'}, HITEX Exhibition Center, Hyderabad, India`.replace(
      /[,;\\]/g,
      (m) => `\\${m}`
    );

    let descriptionParts: string[] = ['ISOT 2026 Annual Conference — HITEX Hyderabad'];
    if (item.sessionTitle && item.sessionTitle !== item.title) {
      descriptionParts.push(`Session: ${item.sessionTitle}`);
    }
    if (item.speakers && item.speakers.length > 0) {
      descriptionParts.push(`Faculty: ${item.speakers.join(', ')}`);
    }
    if (item.type) {
      descriptionParts.push(`Type: ${item.type.toUpperCase()}`);
    }
    descriptionParts.push('Website: https://www.isot2026.com');

    const cleanDescription = descriptionParts.join('\\n').replace(/[,;\\]/g, (m) => (m === '\\n' ? '\\n' : `\\${m}`));
    const uid = `isot2026-${item.id || idx}-${cleanDate}@isot2026.com`;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${now}`);
    lines.push(`DTSTART;TZID=Asia/Kolkata:${dtStart}`);
    lines.push(`DTEND;TZID=Asia/Kolkata:${dtEnd}`);
    lines.push(`SUMMARY:${cleanTitle}`);
    lines.push(`LOCATION:${location}`);
    lines.push(`DESCRIPTION:${cleanDescription}`);
    lines.push('STATUS:CONFIRMED');
    lines.push('BEGIN:VALARM');
    lines.push('TRIGGER:-PT15M');
    lines.push('ACTION:DISPLAY');
    lines.push(`DESCRIPTION:Reminder: ${cleanTitle} is starting in 15 minutes at ${item.venue || 'HITEX'}`);
    lines.push('END:VALARM');
    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
};

/**
 * Creates an iCalendar File object from saved items
 */
export const createICSFile = (items: SavedItem[]): File => {
  const icsContent = generateICSContent(items);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  return new File([blob], 'ISOT2026_MySchedule.ics', { type: 'text/calendar' });
};

/**
 * Triggers direct addition to device calendar.
 * On mobile/supported devices: invokes Web Share API which directly opens native Calendar import UI (iOS Calendar / Android Calendar).
 * On desktop: triggers calendar file open / fallback with download.
 */
export const addToDeviceCalendar = async (
  items: SavedItem[]
): Promise<{ success: boolean; method: 'native-share' | 'file-open' | 'aborted' | 'empty' }> => {
  if (!items || items.length === 0) {
    return { success: false, method: 'empty' };
  }

  const icsContent = generateICSContent(items);
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const file = new File([blob], 'ISOT2026_MySchedule.ics', { type: 'text/calendar' });

  // 1. Try Native Web Share API (Primary for Mobile iOS Safari / Android Chrome)
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({
        title: 'ISOT 2026 Schedule',
        text: `Add ${items.length} ISOT 2026 conference session${items.length > 1 ? 's' : ''} to your calendar`,
        files: [file],
      });
      return { success: true, method: 'native-share' };
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        return { success: false, method: 'aborted' };
      }
      // If sharing failed unexpectedly, proceed to fallback
    }
  }

  // 2. Direct Calendar stream open / download fallback
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'ISOT2026_MySchedule.ics');
  link.setAttribute('rel', 'noopener');
  document.body.appendChild(link);
  link.click();

  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 3000);

  return { success: true, method: 'file-open' };
};

/**
 * Builds direct Google Calendar web URL for a single session/talk
 */
export const getGoogleCalendarUrl = (item: SavedItem): string => {
  try {
    const startIso = new Date(`${item.date}T${item.startTime || '09:00'}:00+05:30`)
      .toISOString()
      .replace(/[-:]/g, '')
      .split('.')[0] + 'Z';

    const endTime = item.endTime || item.startTime || '10:00';
    let endIso = new Date(`${item.date}T${endTime}:00+05:30`)
      .toISOString()
      .replace(/[-:]/g, '')
      .split('.')[0] + 'Z';

    if (startIso === endIso) {
      const endDate = new Date(new Date(`${item.date}T${endTime}:00+05:30`).getTime() + 30 * 60000);
      endIso = endDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
    }

    const details = [
      item.sessionTitle && item.sessionTitle !== item.title ? `Session: ${item.sessionTitle}` : '',
      item.speakers && item.speakers.length > 0 ? `Faculty: ${item.speakers.join(', ')}` : '',
      'ISOT 2026 - 36th Annual Conference of the Indian Society of Organ Transplantation',
      'HITEX Convention Center, Hyderabad',
      'https://www.isot2026.com',
    ]
      .filter(Boolean)
      .join('\n\n');

    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: item.title,
      dates: `${startIso}/${endIso}`,
      details: details,
      location: `${item.venue || 'HITEX Convention Center'}, HITEX Hyderabad, India`,
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  } catch {
    return 'https://calendar.google.com';
  }
};

/**
 * Builds direct Outlook Calendar web URL for a single session/talk
 */
export const getOutlookCalendarUrl = (item: SavedItem): string => {
  try {
    const startIso = new Date(`${item.date}T${item.startTime || '09:00'}:00+05:30`).toISOString();
    const endTime = item.endTime || item.startTime || '10:00';
    let endIso = new Date(`${item.date}T${endTime}:00+05:30`).toISOString();

    if (startIso === endIso) {
      endIso = new Date(new Date(`${item.date}T${endTime}:00+05:30`).getTime() + 30 * 60000).toISOString();
    }

    const details = [
      item.sessionTitle && item.sessionTitle !== item.title ? `Session: ${item.sessionTitle}` : '',
      item.speakers && item.speakers.length > 0 ? `Faculty: ${item.speakers.join(', ')}` : '',
      'ISOT 2026 - 36th Annual Conference of the Indian Society of Organ Transplantation',
      'HITEX Convention Center, Hyderabad',
    ]
      .filter(Boolean)
      .join('\n\n');

    const params = new URLSearchParams({
      path: '/calendar/action/compose',
      rru: 'addevent',
      subject: item.title,
      startdt: startIso,
      enddt: endIso,
      body: details,
      location: `${item.venue || 'HITEX Convention Center'}, HITEX Hyderabad, India`,
    });

    return `https://outlook.live.com/calendar/0/deeplink/compose?${params.toString()}`;
  } catch {
    return 'https://outlook.live.com';
  }
};
