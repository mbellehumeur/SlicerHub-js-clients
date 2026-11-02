/** Dental course stub chrome (EN/FR/DE). */

import type { CourseContent } from '../types';
import { resolveCourseLocale } from '../types';

const en: CourseContent = {
  headerTitle: 'Dental',
  course: 'Dental',
  glossary: 'Dental',
  intro: 'Dental — coming soon.',
  activityLabel: 'Activity:',
  activityText: 'Content for this course is not available yet.',
  instructionsLabel: 'Instructions:',
  instructionSteps: [],
  colTerm: 'Term',
  colDefinition: 'Definition',
  colExamples: 'Example(s)',
  relativeDemoNote: '',
  comingSoon: 'Coming soon',
};

const fr: CourseContent = {
  headerTitle: 'Dentaire',
  course: 'Dentaire',
  glossary: 'Dentaire',
  intro: 'Dentaire — bientôt disponible.',
  activityLabel: 'Activité :',
  activityText: 'Le contenu de ce cours n’est pas encore disponible.',
  instructionsLabel: 'Instructions :',
  instructionSteps: [],
  colTerm: 'Terme',
  colDefinition: 'Définition',
  colExamples: 'Exemple(s)',
  relativeDemoNote: '',
  comingSoon: 'Bientôt disponible',
};

const de: CourseContent = {
  headerTitle: 'Zahnmedizin',
  course: 'Zahnmedizin',
  glossary: 'Zahnmedizin',
  intro: 'Zahnmedizin — demnächst verfügbar.',
  activityLabel: 'Aktivität:',
  activityText: 'Der Inhalt dieses Kurses ist noch nicht verfügbar.',
  instructionsLabel: 'Anleitung:',
  instructionSteps: [],
  colTerm: 'Begriff',
  colDefinition: 'Definition',
  colExamples: 'Beispiel(e)',
  relativeDemoNote: '',
  comingSoon: 'Demnächst verfügbar',
};

export function cbctContentFor(locale?: string): CourseContent {
  const code = resolveCourseLocale(locale);
  if (code === 'fr') return fr;
  if (code === 'de') return de;
  return en;
}
