import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Session, ProgrammeItem, Speaker, SpeakerRoleInfo, getSessionItems } from '../types/programme';
import { DEFAULT_PROGRAMME_SESSIONS } from '../data/defaultProgramme';

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_-]+/g, '-');
}

export function extractSpeakersFromSessions(sessions: Session[]): Speaker[] {
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

  sessions.forEach((session) => {
    if (session.sessionInCharge) {
      session.sessionInCharge.forEach((name) => {
        if (!name.trim()) return;
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

    if (session.programmeCoordinators) {
      session.programmeCoordinators.forEach((name) => {
        if (!name.trim()) return;
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

    const items = getSessionItems(session);
    items.forEach((item) => {
      if (item.speakers) {
        item.speakers.forEach((name) => {
          if (!name.trim()) return;
          const sp = getOrCreate(name);
          if (!sp.talkIds.includes(item.id)) sp.talkIds.push(item.id);
          if (!sp.sessionIds.includes(session.id)) sp.sessionIds.push(session.id);
          sp.roles.push({
            role: 'speaker',
            talkId: item.id,
            talkTitle: item.title,
            sessionId: session.id,
            sessionTitle: session.title,
            time: `${item.startTime}–${item.endTime || ''}`,
            date: item.date,
            venue: item.venue,
          });
        });
      }

      if (item.chairpersons) {
        item.chairpersons.forEach((name) => {
          if (!name.trim()) return;
          const sp = getOrCreate(name);
          if (!sp.talkIds.includes(item.id)) sp.talkIds.push(item.id);
          if (!sp.sessionIds.includes(session.id)) sp.sessionIds.push(session.id);
          sp.roles.push({
            role: 'chairperson',
            talkId: item.id,
            talkTitle: item.title,
            sessionId: session.id,
            sessionTitle: session.title,
            time: `${item.startTime}–${item.endTime || ''}`,
            date: item.date,
            venue: item.venue,
          });
        });
      }

      if (item.panelists) {
        item.panelists.forEach((name) => {
          if (!name.trim()) return;
          const sp = getOrCreate(name);
          if (!sp.talkIds.includes(item.id)) sp.talkIds.push(item.id);
          if (!sp.sessionIds.includes(session.id)) sp.sessionIds.push(session.id);
          sp.roles.push({
            role: 'panelist',
            talkId: item.id,
            talkTitle: item.title,
            sessionId: session.id,
            sessionTitle: session.title,
            time: `${item.startTime}–${item.endTime || ''}`,
            date: item.date,
            venue: item.venue,
          });
        });
      }

      if (item.moderator && item.moderator.trim()) {
        const sp = getOrCreate(item.moderator);
        if (!sp.talkIds.includes(item.id)) sp.talkIds.push(item.id);
        if (!sp.sessionIds.includes(session.id)) sp.sessionIds.push(session.id);
        sp.roles.push({
          role: 'moderator',
          talkId: item.id,
          talkTitle: item.title,
          sessionId: session.id,
          sessionTitle: session.title,
          time: `${item.startTime}–${item.endTime || ''}`,
          date: item.date,
          venue: item.venue,
        });
      }

      if (item.moderators) {
        item.moderators.forEach((name) => {
          if (!name.trim()) return;
          const sp = getOrCreate(name);
          if (!sp.talkIds.includes(item.id)) sp.talkIds.push(item.id);
          if (!sp.sessionIds.includes(session.id)) sp.sessionIds.push(session.id);
          sp.roles.push({
            role: 'moderator',
            talkId: item.id,
            talkTitle: item.title,
            sessionId: session.id,
            sessionTitle: session.title,
            time: `${item.startTime}–${item.endTime || ''}`,
            date: item.date,
            venue: item.venue,
          });
        });
      }

      if (item.casePresenters) {
        item.casePresenters.forEach((name) => {
          if (!name.trim()) return;
          const sp = getOrCreate(name);
          if (!sp.talkIds.includes(item.id)) sp.talkIds.push(item.id);
          if (!sp.sessionIds.includes(session.id)) sp.sessionIds.push(session.id);
          sp.roles.push({
            role: 'casePresenter',
            talkId: item.id,
            talkTitle: item.title,
            sessionId: session.id,
            sessionTitle: session.title,
            time: `${item.startTime}–${item.endTime || ''}`,
            date: item.date,
            venue: item.venue,
          });
        });
      }

      if (item.proSpeakers) {
        item.proSpeakers.forEach((name) => {
          if (!name.trim()) return;
          const sp = getOrCreate(name);
          if (!sp.talkIds.includes(item.id)) sp.talkIds.push(item.id);
          if (!sp.sessionIds.includes(session.id)) sp.sessionIds.push(session.id);
          sp.roles.push({
            role: 'pro',
            talkId: item.id,
            talkTitle: item.title,
            sessionId: session.id,
            sessionTitle: session.title,
            time: `${item.startTime}–${item.endTime || ''}`,
            date: item.date,
            venue: item.venue,
          });
        });
      }

      if (item.conSpeakers) {
        item.conSpeakers.forEach((name) => {
          if (!name.trim()) return;
          const sp = getOrCreate(name);
          if (!sp.talkIds.includes(item.id)) sp.talkIds.push(item.id);
          if (!sp.sessionIds.includes(session.id)) sp.sessionIds.push(session.id);
          sp.roles.push({
            role: 'con',
            talkId: item.id,
            talkTitle: item.title,
            sessionId: session.id,
            sessionTitle: session.title,
            time: `${item.startTime}–${item.endTime || ''}`,
            date: item.date,
            venue: item.venue,
          });
        });
      }
    });
  });

  return Array.from(speakerMap.values()).sort((a, b) => a.name.localeCompare(b.name));
}

interface ProgrammeState {
  sessions: Session[];
  isSyncing: boolean;
  isLoadingFromDb: boolean;
  isDbConnected: boolean;
  dbStorage: string;
  lastSynced: string | null;
  syncError: string | null;
  
  // Actions
  fetchProgrammeFromServer: () => Promise<void>;
  syncWithBackend: () => Promise<boolean>;
  updateSession: (sessionId: string, updatedData: Partial<Session>) => void;
  updateTalk: (talkId: string, updatedData: Partial<ProgrammeItem>) => void;
  addTalk: (sessionId: string, newTalk: ProgrammeItem, sectionId?: string) => void;
  deleteTalk: (talkId: string) => void;
  addSession: (newSession: Session) => void;
  deleteSession: (sessionId: string) => void;
  resetToDefaultProgramme: () => Promise<void>;
  importProgrammeJson: (json: string) => boolean;
  
  // Queries
  getSessionById: (id: string) => Session | undefined;
  getTalkById: (id: string) => { item: ProgrammeItem; session: Session } | undefined;
  getSpeakers: () => Speaker[];
  getSpeakerById: (id: string) => Speaker | undefined;
}

// Helper to push updates to Cloudflare Database if admin token exists
async function pushToBackend(sessions: Session[]): Promise<boolean> {
  const token = localStorage.getItem('isot2026-admin-auth-token');
  if (!token) return false;

  try {
    const res = await fetch('/api/programme', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sessions }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Database push error:', err);
    return false;
  }
}

export const useProgrammeStore = create<ProgrammeState>()(
  persist(
    (set, get) => ({
      sessions: DEFAULT_PROGRAMME_SESSIONS,
      isSyncing: false,
      isLoadingFromDb: false,
      isDbConnected: false,
      dbStorage: 'Local & Cloudflare D1 SQL Database',
      lastSynced: null,
      syncError: null,

      fetchProgrammeFromServer: async () => {
        set({ isSyncing: true, syncError: null });
        try {
          // Clean up old obsolete localStorage caches if present
          try {
            localStorage.removeItem('isot2026-custom-programme');
            localStorage.removeItem('isot2026-custom-programme-v22');
            localStorage.removeItem('isot2026-custom-programme-v21');
            localStorage.removeItem('isot2026-custom-programme-v19');
            localStorage.removeItem('isot2026-custom-programme-v18');
          } catch {
            // ignore
          }

          const res = await fetch('/api/programme', {
            headers: { 'Cache-Control': 'no-cache' },
          });
          if (res.ok) {
            const data = await res.json();
            const sessionList = Array.isArray(data.sessions) ? data.sessions : Array.isArray(data) ? data : null;
            if (sessionList && sessionList.length > 0) {
              const isV22Data = sessionList.some(
                (s: Session) => s.id === 'fri-ha-kidney' || s.id === 'sun-hb3-pediatric'
              );
              if (isV22Data) {
                set({
                  sessions: sessionList,
                  lastSynced: data.lastUpdated || new Date().toISOString(),
                  isDbConnected: true,
                  dbStorage: data.storage || 'Cloudflare D1 SQL Database',
                  isSyncing: false,
                  isLoadingFromDb: false,
                });
                return;
              }
            }
          }
          // Default fallback to V22 data
          set({
            sessions: DEFAULT_PROGRAMME_SESSIONS,
            isSyncing: false,
            isLoadingFromDb: false,
          });
        } catch {
          set({
            sessions: DEFAULT_PROGRAMME_SESSIONS,
            isSyncing: false,
            isLoadingFromDb: false,
          });
        }
      },

      syncWithBackend: async () => {
        const token = localStorage.getItem('isot2026-admin-auth-token');
        if (!token) {
          set({ syncError: 'Authentication required. Please log into the Admin panel.' });
          return false;
        }

        set({ isSyncing: true, syncError: null });
        try {
          const res = await fetch('/api/programme', {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ sessions: get().sessions }),
          });

          if (res.ok) {
            const data = await res.json();
            set({
              isSyncing: false,
              isDbConnected: true,
              lastSynced: data.lastUpdated || new Date().toISOString(),
              dbStorage: 'Cloudflare D1 SQL Database',
              syncError: null,
            });
            return true;
          } else {
            const errData = await res.json().catch(() => ({}));
            set({
              isSyncing: false,
              syncError: errData.error || 'Failed to persist changes to Cloudflare Database.',
            });
            return false;
          }
        } catch (err) {
          console.error('Database sync error:', err);
          set({
            isSyncing: false,
            syncError: 'Network error: could not connect to Cloudflare D1 database.',
          });
          return false;
        }
      },

      updateSession: (sessionId, updatedData) => {
        set((state) => {
          const newSessions = state.sessions.map((s) => {
            if (s.id === sessionId) {
              const updatedSession = { ...s, ...updatedData };
              if (updatedData.date || updatedData.venue || updatedData.title) {
                if (updatedSession.sections) {
                  updatedSession.sections = updatedSession.sections.map((sec) => ({
                    ...sec,
                    items: sec.items.map((item) => ({
                      ...item,
                      date: updatedData.date || item.date,
                      dayName: updatedData.dayName || item.dayName,
                      venue: updatedData.venue || item.venue,
                      sessionTitle: updatedData.title || item.sessionTitle,
                    })),
                  }));
                }
              }
              return updatedSession;
            }
            return s;
          });
          pushToBackend(newSessions);
          return { sessions: newSessions };
        });
      },

      updateTalk: (talkId, updatedData) => {
        set((state) => {
          const newSessions = state.sessions.map((s) => {
            if (!s.sections || s.sections.length === 0) return s;
            return {
              ...s,
              sections: s.sections.map((sec) => ({
                ...sec,
                items: sec.items.map((item) => {
                  if (item.id === talkId) {
                    return { ...item, ...updatedData };
                  }
                  return item;
                }),
              })),
            };
          });
          pushToBackend(newSessions);
          return { sessions: newSessions };
        });
      },

      addTalk: (sessionId, newTalk, sectionId) => {
        set((state) => {
          const newSessions = state.sessions.map((s) => {
            if (s.id === sessionId) {
              const sections = s.sections && s.sections.length > 0 ? [...s.sections] : [{ id: 'sec-main', title: '', items: [] }];
              const targetSecIdx = sectionId ? sections.findIndex((sec) => sec.id === sectionId) : 0;
              const idx = targetSecIdx >= 0 ? targetSecIdx : 0;
              
              const targetSec = { ...sections[idx] };
              targetSec.items = [...targetSec.items, newTalk].sort((a, b) => a.startTime.localeCompare(b.startTime));
              sections[idx] = targetSec;
              
              return {
                ...s,
                sections,
              };
            }
            return s;
          });
          pushToBackend(newSessions);
          return { sessions: newSessions };
        });
      },

      deleteTalk: (talkId) => {
        set((state) => {
          const newSessions = state.sessions.map((s) => {
            if (!s.sections) return s;
            return {
              ...s,
              sections: s.sections.map((sec) => ({
                ...sec,
                items: sec.items.filter((item) => item.id !== talkId),
              })),
            };
          });
          pushToBackend(newSessions);
          return { sessions: newSessions };
        });
      },

      addSession: (newSession) => {
        set((state) => {
          const newSessions = [...state.sessions, newSession];
          pushToBackend(newSessions);
          return { sessions: newSessions };
        });
      },

      deleteSession: (sessionId) => {
        set((state) => {
          const newSessions = state.sessions.filter((s) => s.id !== sessionId);
          pushToBackend(newSessions);
          return { sessions: newSessions };
        });
      },

      resetToDefaultProgramme: async () => {
        const token = localStorage.getItem('isot2026-admin-auth-token');
        if (token) {
          try {
            await fetch('/api/programme/reset', {
              method: 'POST',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
          } catch {
            // ignore network err
          }
        }
        set({ sessions: DEFAULT_PROGRAMME_SESSIONS });
        pushToBackend(DEFAULT_PROGRAMME_SESSIONS);
      },

      importProgrammeJson: (json) => {
        try {
          const parsed = JSON.parse(json);
          if (Array.isArray(parsed) && parsed.length > 0 && (parsed[0].sections || parsed[0].items)) {
            set({ sessions: parsed });
            pushToBackend(parsed);
            return true;
          }
          return false;
        } catch {
          return false;
        }
      },

      getSessionById: (id) => {
        return get().sessions.find((s) => s.id === id);
      },

      getTalkById: (id) => {
        for (const session of get().sessions) {
          const items = getSessionItems(session);
          const found = items.find((item) => item.id === id);
          if (found) {
            return { item: found, session };
          }
        }
        return undefined;
      },

      getSpeakers: () => {
        return extractSpeakersFromSessions(get().sessions);
      },

      getSpeakerById: (id) => {
        const all = get().getSpeakers();
        return all.find((s) => s.id === id);
      },
    }),
    {
      name: 'isot2026-custom-programme-v23',
      onRehydrateStorage: () => (state) => {
        if (!state || !state.sessions || state.sessions.length === 0 || !state.sessions.some((s) => s.id === 'fri-ha-kidney')) {
          if (state) {
            state.sessions = DEFAULT_PROGRAMME_SESSIONS;
          }
        }
      },
    }
  )
);
