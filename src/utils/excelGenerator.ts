import * as XLSX from 'xlsx';
import { Session, getSessionItems } from '../types/programme';
import { exportProgrammeToCsv } from './csvHelper';

export interface ExportDataOptions {
  scope: 'all' | 'day' | 'saved';
  selectedDate?: string;
  selectedHall?: string;
  savedItemIds?: string[];
}

interface ItemRow {
  'Day': string;
  'Date': string;
  'Hall / Venue': string;
  'Main Session': string;
  'Track': string;
  'Section Heading': string;
  'Time Slot': string;
  'Start Time': string;
  'End Time': string;
  'Item Type': string;
  'Topic / Presentation Title': string;
  'Speaker(s)': string;
  'Chairperson(s)': string;
  'Moderator(s)': string;
  'Panelist(s)': string;
  'Session In-Charge': string;
  'Brochure Page': number | string;
}

const buildItemRows = (sessions: Session[]): ItemRow[] => {
  const rows: ItemRow[] = [];

  sessions.forEach((session) => {
    const incharge = (session.sessionInCharge || []).join(', ');

    session.sections.forEach((section) => {
      const secTitle = section.title || '';
      section.items.forEach((item) => {
        const timeSlot = item.endTime ? `${item.startTime} - ${item.endTime}` : item.startTime;
        const speakers = (item.speakers || []).join(', ');
        const chairpersons = (item.chairpersons || []).join(', ');
        const panelists = (item.panelists || []).join(', ');
        const moderators = (item.moderators || (item.moderator ? [item.moderator] : [])).join(', ');

        rows.push({
          'Day': session.dayName,
          'Date': session.date,
          'Hall / Venue': session.venue,
          'Main Session': session.title,
          'Track': session.track || '',
          'Section Heading': secTitle,
          'Time Slot': timeSlot,
          'Start Time': item.startTime,
          'End Time': item.endTime || '',
          'Item Type': item.type.toUpperCase(),
          'Topic / Presentation Title': item.title,
          'Speaker(s)': speakers,
          'Chairperson(s)': chairpersons,
          'Moderator(s)': moderators,
          'Panelist(s)': panelists,
          'Session In-Charge': incharge,
          'Brochure Page': item.page || session.page || '',
        });
      });
    });
  });

  return rows;
};

const filterSessions = (allSessions: Session[], options: ExportDataOptions): Session[] => {
  let filtered = [...allSessions];

  if (options.scope === 'day' && options.selectedDate) {
    filtered = filtered.filter((s) => s.date === options.selectedDate);
  }

  if (options.selectedHall && options.selectedHall !== 'All Halls') {
    filtered = filtered.filter((s) =>
      s.venue.toLowerCase().includes(options.selectedHall!.toLowerCase())
    );
  }

  if (options.scope === 'saved' && options.savedItemIds) {
    const savedSet = new Set(options.savedItemIds);
    filtered = filtered
      .map((s) => {
        const items = getSessionItems(s).filter((item) => savedSet.has(item.id));
        if (items.length === 0) return null;
        return {
          ...s,
          sections: [{ id: `${s.id}-saved`, title: 'Bookmarked Talks', items }],
        };
      })
      .filter(Boolean) as Session[];
  }

  return filtered;
};

// Generate and Download Excel Workbook (.xlsx)
export function downloadProgrammeExcel(
  allSessions: Session[],
  options: ExportDataOptions = { scope: 'all' }
): void {
  const targetSessions = filterSessions(allSessions, options);

  if (targetSessions.length === 0) {
    alert('No items found to export for the selected filter.');
    return;
  }

  const wb = XLSX.utils.book_new();

  // 1. Main Sheet with target rows
  const allRows = buildItemRows(targetSessions);
  const wsMain = XLSX.utils.json_to_sheet(allRows);

  // Set column widths for readability
  wsMain['!cols'] = [
    { wch: 10 }, // Day
    { wch: 12 }, // Date
    { wch: 20 }, // Hall
    { wch: 35 }, // Main Session
    { wch: 25 }, // Track
    { wch: 35 }, // Section Heading
    { wch: 15 }, // Time Slot
    { wch: 10 }, // Start Time
    { wch: 10 }, // End Time
    { wch: 12 }, // Type
    { wch: 55 }, // Topic
    { wch: 30 }, // Speakers
    { wch: 35 }, // Chairpersons
    { wch: 25 }, // Moderators
    { wch: 35 }, // Panelists
    { wch: 25 }, // Session In-Charge
    { wch: 12 }, // Page
  ];

  const mainSheetName =
    options.scope === 'day'
      ? options.selectedDate === '2026-10-09'
        ? 'Friday 09 Oct'
        : options.selectedDate === '2026-10-10'
        ? 'Saturday 10 Oct'
        : 'Sunday 11 Oct'
      : options.scope === 'saved'
      ? 'My Schedule'
      : 'All Sessions';

  XLSX.utils.book_append_sheet(wb, wsMain, mainSheetName);

  // If exporting all 3 days, also add dedicated tabs for each day
  if (options.scope === 'all') {
    const days = [
      { date: '2026-10-09', name: 'Friday 09 Oct' },
      { date: '2026-10-10', name: 'Saturday 10 Oct' },
      { date: '2026-10-11', name: 'Sunday 11 Oct' },
    ];

    days.forEach((d) => {
      const daySessions = allSessions.filter((s) => s.date === d.date);
      const dayRows = buildItemRows(daySessions);
      if (dayRows.length > 0) {
        const wsDay = XLSX.utils.json_to_sheet(dayRows);
        wsDay['!cols'] = wsMain['!cols'];
        XLSX.utils.book_append_sheet(wb, wsDay, d.name);
      }
    });

    // Faculty Summary Sheet
    const facultyMap = new Map<string, { role: string; sessions: string[] }>();
    allRows.forEach((r) => {
      if (r['Speaker(s)']) {
        r['Speaker(s)'].split(',').forEach((sp) => {
          const name = sp.trim();
          if (!name) return;
          if (!facultyMap.has(name)) facultyMap.set(name, { role: 'Speaker', sessions: [] });
          facultyMap.get(name)!.sessions.push(`${r.Date} ${r['Time Slot']} - ${r['Topic / Presentation Title']}`);
        });
      }
    });

    const facultyRows = Array.from(facultyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([name, info]) => ({
        'Faculty / Speaker Name': name,
        'Role': info.role,
        'Appearances': info.sessions.length,
        'Sessions / Presentations': info.sessions.join(' | '),
      }));

    if (facultyRows.length > 0) {
      const wsFaculty = XLSX.utils.json_to_sheet(facultyRows);
      wsFaculty['!cols'] = [
        { wch: 30 },
        { wch: 15 },
        { wch: 15 },
        { wch: 80 },
      ];
      XLSX.utils.book_append_sheet(wb, wsFaculty, 'Faculty Directory');
    }
  }

  const filename =
    options.scope === 'day'
      ? `ISOT-2026-Programme-${options.selectedDate}.xlsx`
      : options.scope === 'saved'
      ? 'ISOT-2026-My-Schedule.xlsx'
      : 'ISOT-2026-Official-Scientific-Programme.xlsx';

  XLSX.writeFile(wb, filename);
}

// Generate and Download CSV File (.csv) with UTF-8 BOM
export function downloadProgrammeCsv(
  allSessions: Session[],
  options: ExportDataOptions = { scope: 'all' }
): void {
  const targetSessions = filterSessions(allSessions, options);

  if (targetSessions.length === 0) {
    alert('No items found to export for the selected filter.');
    return;
  }

  const csvContent = exportProgrammeToCsv(targetSessions);
  // Add UTF-8 BOM so Excel opens special characters and commas properly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  const filename =
    options.scope === 'day'
      ? `ISOT-2026-Programme-${options.selectedDate}.csv`
      : options.scope === 'saved'
      ? 'ISOT-2026-My-Schedule.csv'
      : 'ISOT-2026-Official-Scientific-Programme.csv';

  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
