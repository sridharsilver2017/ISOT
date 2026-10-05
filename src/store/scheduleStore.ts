import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface SavedItem {
  id: string;
  type: 'talk' | 'session' | 'special';
  talkId?: string;
  sessionId?: string;
  title: string;
  date: string;
  dayName: string;
  startTime: string;
  endTime?: string;
  venue: string;
  speakers?: string[];
  sessionTitle?: string;
  savedAt: number;
}

interface ScheduleState {
  savedItems: SavedItem[];
  simulatedDate: string; // '2026-10-09' | '2026-10-10' | '2026-10-11' | 'auto'
  simulatedTime: string; // 'HH:mm' or 'auto'
  darkMode: boolean;

  // Actions
  toggleSaveTalk: (item: {
    id: string;
    title: string;
    date: string;
    dayName: string;
    startTime: string;
    endTime?: string;
    venue: string;
    speakers?: string[];
    sessionId: string;
    sessionTitle?: string;
  }) => void;
  toggleSaveSession: (session: {
    id: string;
    title: string;
    date: string;
    dayName: string;
    startTime: string;
    endTime: string;
    venue: string;
  }) => void;
  isTalkSaved: (id: string) => boolean;
  isSessionSaved: (id: string) => boolean;
  removeSavedItem: (id: string) => void;
  clearSchedule: () => void;
  setSimulatedDate: (date: string) => void;
  setSimulatedTime: (time: string) => void;
  setDarkMode: (enabled: boolean) => void;
  toggleDarkMode: () => void;
}

export const useScheduleStore = create<ScheduleState>()(
  persist(
    (set, get) => ({
      savedItems: [],
      simulatedDate: '2026-10-09', // Default simulated conference day
      simulatedTime: '09:30', // Default simulated conference time
      darkMode: false,

      toggleSaveTalk: (item) => {
        const { savedItems } = get();
        const exists = savedItems.some((s) => s.id === item.id);
        if (exists) {
          set({ savedItems: savedItems.filter((s) => s.id !== item.id) });
        } else {
          set({
            savedItems: [
              ...savedItems,
              {
                id: item.id,
                type: 'talk',
                talkId: item.id,
                sessionId: item.sessionId,
                title: item.title,
                date: item.date,
                dayName: item.dayName,
                startTime: item.startTime,
                endTime: item.endTime,
                venue: item.venue,
                speakers: item.speakers,
                sessionTitle: item.sessionTitle,
                savedAt: Date.now(),
              },
            ],
          });
        }
      },

      toggleSaveSession: (session) => {
        const { savedItems } = get();
        const exists = savedItems.some((s) => s.id === session.id);
        if (exists) {
          set({ savedItems: savedItems.filter((s) => s.id !== session.id) });
        } else {
          set({
            savedItems: [
              ...savedItems,
              {
                id: session.id,
                type: 'session',
                sessionId: session.id,
                title: session.title,
                date: session.date,
                dayName: session.dayName,
                startTime: session.startTime,
                endTime: session.endTime,
                venue: session.venue,
                savedAt: Date.now(),
              },
            ],
          });
        }
      },

      isTalkSaved: (id: string) => {
        return get().savedItems.some((s) => s.id === id);
      },

      isSessionSaved: (id: string) => {
        return get().savedItems.some((s) => s.id === id);
      },

      removeSavedItem: (id: string) => {
        set({ savedItems: get().savedItems.filter((s) => s.id !== id) });
      },

      clearSchedule: () => {
        set({ savedItems: [] });
      },

      setSimulatedDate: (date: string) => {
        set({ simulatedDate: date });
      },

      setSimulatedTime: (time: string) => {
        set({ simulatedTime: time });
      },

      setDarkMode: (enabled: boolean) => {
        set({ darkMode: enabled });
        if (enabled) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },

      toggleDarkMode: () => {
        const next = !get().darkMode;
        get().setDarkMode(next);
      },
    }),
    {
      name: 'isot2026-schedule-storage',
    }
  )
);
