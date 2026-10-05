import { Session, ProgrammeItem, ProgrammeItemType } from '../types/programme';
import { CONFERENCE_DAYS } from '../data/event';

export const CSV_HEADERS = [
  'Date',
  'Venue',
  'Session Start',
  'Session End',
  'Session Title',
  'Session In-Charge',
  'Co In-Charge',
  'Programme Coordinators',
  'Section Heading',
  'Item Type',
  'Item Start',
  'Item End',
  'Topic / Talk Title',
  'Speakers',
  'Chairpersons',
  'Panelists',
  'Moderators',
  'Case Presenters',
  'Pro Speakers',
  'Con Speakers',
  'Description',
];

// Helper to escape CSV values
function escapeCsvValue(val: string | undefined | null): string {
  if (val === undefined || val === null) return '';
  const str = String(val).trim();
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

// Convert Sessions to CSV format for Google Sheets
export function exportProgrammeToCsv(sessions: Session[]): string {
  const rows: string[] = [];
  rows.push(CSV_HEADERS.map(escapeCsvValue).join(','));

  sessions.forEach((session) => {
    const incharge = (session.sessionInCharge || []).join(', ');
    const coincharge = (session.coInCharge || []).join(', ');
    const coordinators = (session.programmeCoordinators || []).join(', ');

    if (session.sections && session.sections.length > 0) {
      session.sections.forEach((section) => {
        const secTitle = section.title || '';
        if (section.items && section.items.length > 0) {
          section.items.forEach((item) => {
            const speakers = (item.speakers || []).join(', ');
            const chairpersons = (item.chairpersons || []).join(', ');
            const panelists = (item.panelists || []).join(', ');
            const moderators = (item.moderators || (item.moderator ? [item.moderator] : [])).join(', ');
            const casePresenters = (item.casePresenters || []).join(', ');
            const proSpeakers = (item.proSpeakers || []).join(', ');
            const conSpeakers = (item.conSpeakers || []).join(', ');
            const description = (item.description || []).join(' | ');

            rows.push([
              escapeCsvValue(session.date),
              escapeCsvValue(session.venue),
              escapeCsvValue(session.startTime),
              escapeCsvValue(session.endTime),
              escapeCsvValue(session.title),
              escapeCsvValue(incharge),
              escapeCsvValue(coincharge),
              escapeCsvValue(coordinators),
              escapeCsvValue(secTitle),
              escapeCsvValue(item.type || 'talk'),
              escapeCsvValue(item.startTime),
              escapeCsvValue(item.endTime || ''),
              escapeCsvValue(item.title),
              escapeCsvValue(speakers),
              escapeCsvValue(chairpersons),
              escapeCsvValue(panelists),
              escapeCsvValue(moderators),
              escapeCsvValue(casePresenters),
              escapeCsvValue(proSpeakers),
              escapeCsvValue(conSpeakers),
              escapeCsvValue(description),
            ].join(','));
          });
        } else {
          // Empty section placeholder row
          rows.push([
            escapeCsvValue(session.date),
            escapeCsvValue(session.venue),
            escapeCsvValue(session.startTime),
            escapeCsvValue(session.endTime),
            escapeCsvValue(session.title),
            escapeCsvValue(incharge),
            escapeCsvValue(coincharge),
            escapeCsvValue(coordinators),
            escapeCsvValue(secTitle),
            escapeCsvValue('talk'),
            escapeCsvValue(session.startTime),
            escapeCsvValue(session.endTime),
            escapeCsvValue(''),
            '', '', '', '', '', '', '', '',
          ].join(','));
        }
      });
    }
  });

  return rows.join('\n');
}

// Robust CSV Line Splitter handling quotes and commas
function parseCsvRows(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++; // skip escaped quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \r\n
      }
      currentRow.push(currentVal.trim());
      currentVal = '';
      if (currentRow.some((c) => c.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
    } else {
      currentVal += char;
    }
  }

  if (currentVal.length > 0 || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    if (currentRow.some((c) => c.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

// Convert CSV content back into Session[] hierarchy
export function parseCsvToProgramme(csvText: string): Session[] {
  const rawRows = parseCsvRows(csvText);
  if (rawRows.length < 2) {
    throw new Error('CSV file is empty or missing headers.');
  }

  const headerRow = rawRows[0].map((h) => h.toLowerCase().trim().replace(/[\s/_-]+/g, ''));
  
  // Find column indices
  const getCol = (names: string[]): number => {
    for (const name of names) {
      const idx = headerRow.findIndex((h) => h.includes(name.toLowerCase()));
      if (idx >= 0) return idx;
    }
    return -1;
  };

  const colDate = getCol(['date']);
  const colVenue = getCol(['venue', 'hall']);
  const colSessionStart = getCol(['sessionstart', 'sstart']);
  const colSessionEnd = getCol(['sessionend', 'send']);
  const colSessionTitle = getCol(['sessiontitle', 'stitle', 'mainsession']);
  const colIncharge = getCol(['incharge', 'sessionincharge']);
  const colCoIncharge = getCol(['coincharge']);
  const colCoord = getCol(['coordinator', 'programmecoordinators']);
  const colSectionHeading = getCol(['sectionheading', 'section', 'subsession']);
  const colItemType = getCol(['itemtype', 'type']);
  const colItemStart = getCol(['itemstart', 'start', 'time', 'starttime']);
  const colItemEnd = getCol(['itemend', 'end', 'endtime']);
  const colTopic = getCol(['topic', 'talktitle', 'title', 'presentation']);
  const colSpeakers = getCol(['speakers', 'speaker', 'faculty']);
  const colChairpersons = getCol(['chairpersons', 'chairperson', 'chairs', 'chair']);
  const colPanelists = getCol(['panelists', 'panelist', 'panel']);
  const colModerators = getCol(['moderators', 'moderator']);
  const colCasePresenters = getCol(['casepresenters', 'casepresenter']);
  const colPro = getCol(['prospeakers', 'prospeaker']);
  const colCon = getCol(['conspeakers', 'conspeaker']);
  const colDescription = getCol(['description', 'notes']);

  const splitList = (str: string | undefined): string[] | undefined => {
    if (!str || !str.trim()) return undefined;
    const items = str.split(',').map((s) => s.trim()).filter(Boolean);
    return items.length > 0 ? items : undefined;
  };

  const splitDescription = (str: string | undefined): string[] | undefined => {
    if (!str || !str.trim()) return undefined;
    const items = str.split('|').map((s) => s.trim()).filter(Boolean);
    return items.length > 0 ? items : undefined;
  };

  const sessionsMap = new Map<string, Session>();
  let sessionCounter = 0;

  for (let r = 1; r < rawRows.length; r++) {
    const row = rawRows[r];
    const date = (colDate >= 0 ? row[colDate] : '').trim() || '2026-10-09';
    const venue = (colVenue >= 0 ? row[colVenue] : '').trim() || 'Hall A';
    const sessionTitle = (colSessionTitle >= 0 ? row[colSessionTitle] : '').trim() || 'Main Scientific Session';
    const sessionStart = (colSessionStart >= 0 ? row[colSessionStart] : '').trim() || '09:00';
    const sessionEnd = (colSessionEnd >= 0 ? row[colSessionEnd] : '').trim() || '18:00';

    const sessionKey = `${date}_${venue}_${sessionTitle}`.toLowerCase().replace(/[^\w]/g, '_');

    if (!sessionsMap.has(sessionKey)) {
      sessionCounter++;
      const dayObj = CONFERENCE_DAYS.find((d) => d.date === date) || CONFERENCE_DAYS[0];
      const sessionInCharge = splitList(colIncharge >= 0 ? row[colIncharge] : undefined);
      const coInCharge = splitList(colCoIncharge >= 0 ? row[colCoIncharge] : undefined);
      const programmeCoordinators = splitList(colCoord >= 0 ? row[colCoord] : undefined);

      sessionsMap.set(sessionKey, {
        id: `session_${String(sessionCounter).padStart(2, '0')}_${date.replace(/-/g, '')}_${venue.toLowerCase().replace(/[^\w]/g, '_')}`,
        index: sessionCounter,
        date,
        dayName: dayObj.dayName,
        dayDisplay: dayObj.dayFormatted,
        title: sessionTitle,
        startTime: sessionStart,
        endTime: sessionEnd,
        venue,
        sessionInCharge,
        coInCharge,
        programmeCoordinators,
        sections: [],
      });
    }

    const session = sessionsMap.get(sessionKey)!;
    const sectionHeading = (colSectionHeading >= 0 ? row[colSectionHeading] : '').trim() || 'General Session';

    let section = session.sections.find((s) => s.title.toLowerCase() === sectionHeading.toLowerCase());
    if (!section) {
      const secId = `${session.id}-sec-${session.sections.length + 1}`;
      section = {
        id: secId,
        title: sectionHeading,
        items: [],
      };
      session.sections.push(section);
    }

    const itemTopic = (colTopic >= 0 ? row[colTopic] : '').trim();
    if (itemTopic) {
      const itemStart = (colItemStart >= 0 ? row[colItemStart] : '').trim() || session.startTime;
      const itemEnd = (colItemEnd >= 0 ? row[colItemEnd] : '').trim() || '';
      const rawType = (colItemType >= 0 ? row[colItemType] : '').trim().toLowerCase();
      
      let type: ProgrammeItemType = 'talk';
      if (['talk', 'panel', 'break', 'ceremony', 'registration', 'lunch', 'dinner', 'oration', 'workshop', 'gbm', 'other'].includes(rawType)) {
        type = rawType as ProgrammeItemType;
      } else if (itemTopic.toLowerCase().includes('panel')) {
        type = 'panel';
      } else if (itemTopic.toLowerCase().includes('oration')) {
        type = 'oration';
      } else if (itemTopic.toLowerCase().includes('lunch')) {
        type = 'lunch';
      } else if (itemTopic.toLowerCase().includes('tea') || itemTopic.toLowerCase().includes('break')) {
        type = 'break';
      } else if (itemTopic.toLowerCase().includes('inaugur') || itemTopic.toLowerCase().includes('ceremony')) {
        type = 'ceremony';
      } else if (itemTopic.toLowerCase().includes('registration')) {
        type = 'registration';
      }

      const itemId = `talk_${session.id}_${section.items.length + 1}_${itemStart.replace(':', '')}`;
      const item: ProgrammeItem = {
        id: itemId,
        sessionId: session.id,
        sessionTitle: session.title,
        date: session.date,
        dayName: session.dayName,
        startTime: itemStart,
        endTime: itemEnd,
        title: itemTopic,
        type,
        venue: session.venue,
        speakers: splitList(colSpeakers >= 0 ? row[colSpeakers] : undefined),
        chairpersons: splitList(colChairpersons >= 0 ? row[colChairpersons] : undefined),
        panelists: splitList(colPanelists >= 0 ? row[colPanelists] : undefined),
        moderators: splitList(colModerators >= 0 ? row[colModerators] : undefined),
        casePresenters: splitList(colCasePresenters >= 0 ? row[colCasePresenters] : undefined),
        proSpeakers: splitList(colPro >= 0 ? row[colPro] : undefined),
        conSpeakers: splitList(colCon >= 0 ? row[colCon] : undefined),
        description: splitDescription(colDescription >= 0 ? row[colDescription] : undefined),
      };

      section.items.push(item);
    }
  }

  return Array.from(sessionsMap.values());
}

// Blank Google Sheets Template with sample row
export function getBlankCsvTemplate(): string {
  const sampleRow = [
    '2026-10-09',
    'Hall A',
    '09:00',
    '18:00',
    'Kidney and Organ Transplantation',
    'Vivek Kute',
    '',
    '',
    'Need of ISOT Position Statement on Failing Graft',
    'talk',
    '09:00',
    '09:20',
    'Management of the Failing Kidney Allograft: Immunological, Infectious and Non-Immunological Considerations',
    'Manish Rathi',
    'S Krishnan, Sindhu Kaza, C. Shyam Sunder Rao',
    '',
    '',
    '',
    '',
    '',
    '',
  ];

  return [
    CSV_HEADERS.map(escapeCsvValue).join(','),
    sampleRow.map(escapeCsvValue).join(','),
  ].join('\n');
}
