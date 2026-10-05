export type ProgrammeItemType =
  | "talk"
  | "panel"
  | "break"
  | "ceremony"
  | "registration"
  | "lunch"
  | "dinner"
  | "oration"
  | "workshop"
  | "gbm"
  | "other";

export interface ProgrammeItem {
  id: string;
  sessionId: string;
  sessionTitle: string;
  date: string; // YYYY-MM-DD
  dayName: string; // Friday, Saturday, Sunday
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  title: string;
  type: ProgrammeItemType;
  venue: string; // Hall A, Hall B - Screen 1, etc.
  speakers?: string[];
  chairpersons?: string[];
  panelists?: string[];
  moderator?: string;
  moderators?: string[];
  casePresenters?: string[];
  proSpeakers?: string[];
  conSpeakers?: string[];
  description?: string[];
  page?: number;
  tags?: string[];
}

export interface Session {
  id: string;
  index: number;
  date: string; // YYYY-MM-DD
  dayName: string; // Friday, Saturday, Sunday
  dayDisplay: string; // 09 October, 10 October, 11 October
  title: string;
  startTime: string;
  endTime: string;
  venue: string;
  sessionInCharge?: string[];
  coInCharge?: string[];
  programmeCoordinators?: string[];
  page?: number;
  track?: string;
  items: ProgrammeItem[];
}

export interface SpeakerRoleInfo {
  role: 'speaker' | 'chairperson' | 'panelist' | 'moderator' | 'incharge' | 'coordinator' | 'casePresenter' | 'pro' | 'con';
  talkId?: string;
  sessionId?: string;
  sessionTitle: string;
  talkTitle?: string;
  time: string;
  date: string;
  venue: string;
}

export interface Speaker {
  id: string;
  name: string;
  roles: SpeakerRoleInfo[];
  talkIds: string[];
  sessionIds: string[];
  institutions?: string;
}

export interface Hall {
  id: string;
  name: string;
  shortName: string;
  capacity?: string;
  floor?: string;
  description?: string;
  color: string;
}

export interface CouncilMember {
  name: string;
  designation: string;
  term?: string;
  institution?: string;
  location?: string;
}
