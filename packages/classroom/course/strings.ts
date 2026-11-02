/** Shared Classroom chrome: brand, volumes panel, conference chat (EN/FR/DE). */

import { resolveCourseLocale } from './types';

export type SharedChrome = {
  brand: string;
  volumesAndSegs: string;
  conferenceLog: string;
  chatPlaceholder: string;
  chatSend: string;
  chatNeedConference: string;
  joined: string;
  left: string;
  conferenceStarted: string;
  conferenceEnded: string;
  tookOver: string;
  courseSelectAria: string;
};

const en: SharedChrome = {
  brand: 'Classroom',
  volumesAndSegs: 'Volumes & Segmentations',
  conferenceLog: 'Classroom Chat',
  chatPlaceholder: 'Message the conference…',
  chatSend: 'Send',
  chatNeedConference: 'Join a conference to chat',
  joined: 'joined',
  left: 'left',
  conferenceStarted: 'Conference started',
  conferenceEnded: 'Conference ended',
  tookOver: 'took over the scene',
  courseSelectAria: 'Select course',
};

const fr: SharedChrome = {
  brand: 'Classroom',
  volumesAndSegs: 'Volumes et Segmentations',
  conferenceLog: 'Clavardage',
  chatPlaceholder: 'Message à la conférence…',
  chatSend: 'Envoyer',
  chatNeedConference: 'Rejoignez une conférence pour discuter',
  joined: 'a rejoint',
  left: 'a quitté',
  conferenceStarted: 'Conférence démarrée',
  conferenceEnded: 'Conférence terminée',
  tookOver: 'a pris la direction de la scène',
  courseSelectAria: 'Choisir un cours',
};

const de: SharedChrome = {
  brand: 'Classroom',
  volumesAndSegs: 'Volumina & Segmentierungen',
  conferenceLog: 'Classroom-Chat',
  chatPlaceholder: 'Nachricht an die Konferenz…',
  chatSend: 'Senden',
  chatNeedConference: 'Treten Sie einer Konferenz bei, um zu chatten',
  joined: 'ist beigetreten',
  left: 'hat verlassen',
  conferenceStarted: 'Konferenz gestartet',
  conferenceEnded: 'Konferenz beendet',
  tookOver: 'hat die Szene übernommen',
  courseSelectAria: 'Kurs auswählen',
};

/** @deprecated Prefer sharedChromeFor + course.contentFor; kept for call sites. */
export type CourseChrome = SharedChrome & {
  headerTitle: string;
};

export function sharedChromeFor(locale?: string): SharedChrome {
  const code = resolveCourseLocale(locale);
  if (code === 'fr') return fr;
  if (code === 'de') return de;
  return en;
}

/**
 * Shared chrome only. For course-specific strings use getCourse(...).contentFor(locale).
 * `headerTitle` is empty here — callers that need the title should use the active course.
 */
export function courseChromeFor(locale?: string): CourseChrome {
  return { ...sharedChromeFor(locale), headerTitle: '' };
}
