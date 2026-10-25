/** Shared Classroom chrome: brand, volumes panel, conference chat (EN/FR). */

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
  brand: 'Salle de classe',
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

/** @deprecated Prefer sharedChromeFor + course.contentFor; kept for call sites. */
export type CourseChrome = SharedChrome & {
  headerTitle: string;
};

export function sharedChromeFor(locale?: string): SharedChrome {
  const code = String(locale || '').toLowerCase();
  return code.startsWith('fr') ? fr : en;
}

/**
 * Shared chrome only. For course-specific strings use getCourse(...).contentFor(locale).
 * `headerTitle` is empty here — callers that need the title should use the active course.
 */
export function courseChromeFor(locale?: string): CourseChrome {
  return { ...sharedChromeFor(locale), headerTitle: '' };
}
