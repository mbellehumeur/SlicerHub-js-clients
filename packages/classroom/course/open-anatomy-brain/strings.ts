/** Open Anatomy brain course chrome (EN/FR). */

import type { CourseContent } from '../types';
import { openAnatomyAckFor } from '../open-anatomy-ack';

const enBase = {
  headerTitle: 'Human brain anatomy',
  course: 'Human brain anatomy',
  glossary: 'Human brain anatomy',
  activityLabel: 'Activity:',
  activityText:
    'Explore the SPL/NAC brain atlas with 3D and multiplanar views',
  instructionsLabel: 'Instructions:',
  instructionSteps: [
    'Use the embedded Open Anatomy Browser to inspect structures.',
    'Use the structure tree and slice views inside the viewer.',
    'Open in a new tab for a larger workspace if needed.',
  ],
  colTerm: 'Term',
  colDefinition: 'Definition',
  colExamples: 'Example(s)',
  relativeDemoNote: '',
} as const;

const frBase = {
  headerTitle: 'Anatomie du cerveau humain',
  course: 'Anatomie du cerveau humain',
  glossary: 'Anatomie du cerveau humain',
  activityLabel: 'Activité :',
  activityText:
    'Explorez l’atlas cérébral SPL/NAC avec vues 3D et multiplanaires',
  instructionsLabel: 'Instructions :',
  instructionSteps: [
    'Utilisez l’Open Anatomy Browser intégré pour inspecter les structures.',
    'Utilisez l’arbre des structures et les coupes dans le visualiseur.',
    'Ouvrez dans un nouvel onglet pour un espace plus grand si besoin.',
  ],
  colTerm: 'Terme',
  colDefinition: 'Définition',
  colExamples: 'Exemple(s)',
  relativeDemoNote: '',
} as const;

export function openAnatomyBrainContentFor(locale?: string): CourseContent {
  const ack = openAnatomyAckFor(locale);
  const code = String(locale || '').toLowerCase();
  const base = code.startsWith('fr') ? frBase : enBase;
  return {
    ...base,
    intro: ack.intro,
    introLinkHref: ack.introLinkHref,
    introLinkLabel: ack.introLinkLabel,
    ackTitle: ack.ackTitle,
    ackBody: ack.ackBody,
    ackLinks: ack.ackLinks,
    openInNewTabLabel: ack.openInNewTabLabel,
  };
}
