/** Cell structures course stub chrome (EN/FR/DE). */

import type { CourseContent } from '../types';
import { resolveCourseLocale } from '../types';

const en: CourseContent = {
  headerTitle: 'Cell Structures',
  course: 'Cell structures',
  glossary: 'Cell Structures',
  intro: 'Cell structures — coming soon.',
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
  headerTitle: 'Structures cellulaires',
  course: 'Structures cellulaires',
  glossary: 'Structures cellulaires',
  intro: 'Structures cellulaires — bientôt disponible.',
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
  headerTitle: 'Zellstrukturen',
  course: 'Zellstrukturen',
  glossary: 'Zellstrukturen',
  intro: 'Zellstrukturen — demnächst verfügbar.',
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

export function cellStructuresContentFor(locale?: string): CourseContent {
  const code = resolveCourseLocale(locale);
  if (code === 'fr') return fr;
  if (code === 'de') return de;
  return en;
}
