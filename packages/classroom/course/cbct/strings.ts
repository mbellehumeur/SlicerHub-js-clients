/** Dental course stub chrome (EN/FR). */

import type { CourseContent } from '../types';

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

export function cbctContentFor(locale?: string): CourseContent {
  const code = String(locale || '').toLowerCase();
  return code.startsWith('fr') ? fr : en;
}
