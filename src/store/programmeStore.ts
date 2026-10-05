import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Session, ProgrammeItem, Speaker, SpeakerRoleInfo } from '../types/programme';
import { PROGRAMME_SESSIONS as DEFAULT_SESSIONS } from '../data/programme';

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

    session.items.forEach((item) => {
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
  lastSynced: string | null;
  syncError: string | null;
  
  // Actions
  fetchProgrammeFromServer: () => Promise<void>;
  syncWithBackend: () => Promise<boolean>;
  updateSession: (sessionId: string, updatedData: Partial<Session>) => void;
  updateTalk: (talkId: string, updatedData: Partial<ProgrammeItem>) => void;
  addTalk: (sessionId: string, newTalk: ProgrammeItem) => void;
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

// Helper to push updates to backend if admin token exists
async function pushToBackend(sessions: Session[]) {
  const token = localStorage.getItem('isot2026-admin-auth-token');
  if (!token) return;

  try {
    await fetch('/api/programme', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ sessions }),
    });
  } catch (err) {
    console.warn('Backend sync failed (will retry or remain in local storage):', err);
  }
}

export const useProgrammeStore = create<ProgrammeState>()(
  persist(
    (set, get) => ({
      sessions: DEFAULT_SESSIONS,
      isSyncing: false,
      lastSynced: null,
      syncError: null,

      fetchProgrammeFromServer: async () => {
        set({ isSyncing: true, syncError: null });
        try {
          const res = await fetch('/api/programme');
          if (res.ok) {
            const data = await res.json();
            if (data.hasCustomData && Array.isArray(data.sessions) && data.sessions.length > 0) {
              set({
                sessions: data.sessions,
                lastSynced: data.lastUpdated || new Date().toISOString(),
                isSyncing: false,
              });
              return;
            }
          }
          set({ isSyncing: false });
        } catch {
          // If server fails or offline, use local/cached programme
          set({ isSyncing: false });
        }
      },

      syncWithBackend: async () => {
        const token = localStorage.getItem('isot2026-admin-auth-token');
        if (!token) return false;

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
              lastSynced: data.lastUpdated || new Date().toISOString(),
              syncError: null,
            });
            return true;
          } else {
            const errData = await res.json().catch(() => ({}));
            set({
              isSyncing: false,
              syncError: errData.error || 'Failed to save to server.',
            });
            return false;
          }
        } catch (err) {
          console.error('Server sync error:', err);
          set({
            isSyncing: false,
            syncError: 'Network error: could not connect to backend server.',
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
                updatedSession.items = updatedSession.items.map((item) => ({
                  ...item,
                  date: updatedData.date || item.date,
                  dayName: updatedData.dayName || item.dayName,
                  venue: updatedData.venue || item.venue,
                  sessionTitle: updatedData.title || item.sessionTitle,
                }));
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
          const newSessions = state.sessions.map((s) => ({
            ...s,
            items: s.items.map((item) => {
              if (item.id === talkId) {
                return { ...item, ...updatedData };
              }
              return item;
            }),
          }));
          pushToBackend(newSessions);
          return { sessions: newSessions };
        });
      },

      addTalk: (sessionId, newTalk) => {
        set((state) => {
          const newSessions = state.sessions.map((s) => {
            if (s.id === sessionId) {
              return {
                ...s,
                items: [...s.items, newTalk].sort((a, b) => a.startTime.localeCompare(b.startTime)),
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
          const newSessions = state.sessions.map((s) => ({
            ...s,
            items: s.items.filter((item) => item.id !== talkId),
          }));
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
        set({ sessions: DEFAULT_SESSIONS, lastSynced: null });
      },

      importProgrammeJson: (json) => {
        try {
          const parsed = JSON.parse(json);
          if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].items) {
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
          const found = session.items.find((item) => item.id === id);
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
      name: 'isot2026-custom-programme',
    }
  )
);
