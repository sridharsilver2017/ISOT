import { Speaker, SpeakerRoleInfo } from '../types/programme';
import { PROGRAMME_SESSIONS } from './programme';

// Helper to create a consistent ID from name
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-');
}

export function extractAllSpeakers(): Speaker[] {
  const speakerMap = new Map<string, Speaker>();

  const getOrCreate = (name: string): Speaker => {
    const trimmed = name.trim();
    const id = slugify(trimmed);
    if (!speakerMap.has(id)) {
      speakerMap.set(id, {
        id,
        name: trimmed,
        roles: [],
        talkIds: [],
        sessionIds: [],
      });
    }
    return speakerMap.get(id)!;
  };

  PROGRAMME_SESSIONS.forEach((session) => {
    // Session Incharges
    if (session.sessionInCharge) {
      session.sessionInCharge.forEach((name) => {
        const sp = getOrCreate(name);
        if (!sp.sessionIds.includes(session.id)) sp.sessionIds.push(session.id);
        const roleInfo: SpeakerRoleInfo = {
          role: 'incharge',
          sessionId: session.id,
          sessionTitle: session.title,
          time: `${session.startTime}–${session.endTime}`,
          date: session.date,
          venue: session.venue,
        };
        sp.roles.push(roleInfo);
      });
    }

    // Programme Coordinators
    if (session.programmeCoordinators) {
      session.programmeCoordinators.forEach((name) => {
        const sp = getOrCreate(name);
        if (!sp.sessionIds.includes(session.id)) sp.sessionIds.push(session.id);
        const roleInfo: SpeakerRoleInfo = {
          role: 'coordinator',
          sessionId: session.id,
          sessionTitle: session.title,
          time: `${session.startTime}–${session.endTime}`,
          date: session.date,
          venue: session.venue,
        };
        sp.roles.push(roleInfo);
      });
    }

    // Items
    session.items.forEach((item) => {
      // Speakers
      if (item.speakers) {
        item.speakers.forEach((name) => {
          const sp = getOrCreate(name);
          if (!sp.talkIds.includes(item.id)) sp.talkIds.push(item.id);
          if (!sp.sessionIds.includes(session.id)) sp.sessionIds.push(session.id);
          sp.roles.push({
            role: 'speaker',
            talkId: item.id,
            talkTitle: item.title,
            sessionId: session.id,
            sessionTitle: session.title,
            time: `${item.startTime}–${item.endTime}`,
            date: item.date,
            venue: item.venue,
          });
        });
      }

      // Chairpersons
      if (item.chairpersons) {
        item.chairpersons.forEach((name) => {
          const sp = getOrCreate(name);
          if (!sp.talkIds.includes(item.id)) sp.talkIds.push(item.id);
          if (!sp.sessionIds.includes(session.id)) sp.sessionIds.push(session.id);
          sp.roles.push({
            role: 'chairperson',
            talkId: item.id,
            talkTitle: item.title,
            sessionId: session.id,
            sessionTitle: session.title,
            time: `${item.startTime}–${item.endTime}`,
            date: item.date,
            venue: item.venue,
          });
        });
      }

      // Panelists
      if (item.panelists) {
        item.panelists.forEach((name) => {
          const sp = getOrCreate(name);
          if (!sp.talkIds.includes(item.id)) sp.talkIds.push(item.id);
          if (!sp.sessionIds.includes(session.id)) sp.sessionIds.push(session.id);
          sp.roles.push({
            role: 'panelist',
            talkId: item.id,
            talkTitle: item.title,
            sessionId: session.id,
            sessionTitle: session.title,
            time: `${item.startTime}–${item.endTime}`,
            date: item.date,
            venue: item.venue,
          });
        });
      }

      // Moderator
      if (item.moderator) {
        const sp = getOrCreate(item.moderator);
        if (!sp.talkIds.includes(item.id)) sp.talkIds.push(item.id);
        if (!sp.sessionIds.includes(session.id)) sp.sessionIds.push(session.id);
        sp.roles.push({
          role: 'moderator',
          talkId: item.id,
          talkTitle: item.title,
          sessionId: session.id,
          sessionTitle: session.title,
          time: `${item.startTime}–${item.endTime}`,
          date: item.date,
          venue: item.venue,
        });
      }

      // Moderators array
      if (item.moderators) {
        item.moderators.forEach((name) => {
          const sp = getOrCreate(name);
          if (!sp.talkIds.includes(item.id)) sp.talkIds.push(item.id);
          if (!sp.sessionIds.includes(session.id)) sp.sessionIds.push(session.id);
          sp.roles.push({
            role: 'moderator',
            talkId: item.id,
            talkTitle: item.title,
            sessionId: session.id,
            sessionTitle: session.title,
            time: `${item.startTime}–${item.endTime}`,
            date: item.date,
            venue: item.venue,
          });
        });
      }

      // Case Presenters
      if (item.casePresenters) {
        item.casePresenters.forEach((name) => {
          const sp = getOrCreate(name);
          if (!sp.talkIds.includes(item.id)) sp.talkIds.push(item.id);
          if (!sp.sessionIds.includes(session.id)) sp.sessionIds.push(session.id);
          sp.roles.push({
            role: 'casePresenter',
            talkId: item.id,
            talkTitle: item.title,
            sessionId: session.id,
            sessionTitle: session.title,
            time: `${item.startTime}–${item.endTime}`,
            date: item.date,
            venue: item.venue,
          });
        });
      }

      // Pro speakers
      if (item.proSpeakers) {
        item.proSpeakers.forEach((name) => {
          const sp = getOrCreate(name);
          if (!sp.talkIds.includes(item.id)) sp.talkIds.push(item.id);
          if (!sp.sessionIds.includes(session.id)) sp.sessionIds.push(session.id);
          sp.roles.push({
            role: 'pro',
            talkId: item.id,
            talkTitle: item.title,
            sessionId: session.id,
            sessionTitle: session.title,
            time: `${item.startTime}–${item.endTime}`,
            date: item.date,
            venue: item.venue,
          });
        });
      }

      // Con speakers
      if (item.conSpeakers) {
        item.conSpeakers.forEach((name) => {
          const sp = getOrCreate(name);
          if (!sp.talkIds.includes(item.id)) sp.talkIds.push(item.id);
          if (!sp.sessionIds.includes(session.id)) sp.sessionIds.push(session.id);
          sp.roles.push({
            role: 'con',
            talkId: item.id,
            talkTitle: item.title,
            sessionId: session.id,
            sessionTitle: session.title,
            time: `${item.startTime}–${item.endTime}`,
            date: item.date,
            venue: item.venue,
          });
        });
      }
    });
  });

  return Array.from(speakerMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

export const SPEAKERS = extractAllSpeakers();

export function getSpeakerById(id: string): Speaker | undefined {
  return SPEAKERS.find((s) => s.id === id);
}

export function getAllTalks() {
  return PROGRAMME_SESSIONS.flatMap((s) => s.items);
}

export function getTalkById(id: string) {
  for (const session of PROGRAMME_SESSIONS) {
    const found = session.items.find((item) => item.id === id);
    if (found) {
      return { item: found, session };
    }
  }
  return undefined;
}

export function getSessionById(id: string) {
  return PROGRAMME_SESSIONS.find((s) => s.id === id);
}
