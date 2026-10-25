/** Cell structures course stub chrome (EN/FR). */

import type { CourseContent } from '../types';

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

export function cellStructuresContentFor(locale?: string): CourseContent {
  const code = String(locale || '').toLowerCase();
  return code.startsWith('fr') ? fr : en;
}
