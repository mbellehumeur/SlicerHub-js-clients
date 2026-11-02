/** Open Anatomy brain course chrome (EN/FR/DE). */

import type { CourseContent } from '../types';
import { resolveCourseLocale } from '../types';
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
    'Utilisez l’arbre des structures et les coupes dans la visionneuse.',
    'Ouvrez dans un nouvel onglet pour un espace plus grand si besoin.',
  ],
  colTerm: 'Terme',
  colDefinition: 'Définition',
  colExamples: 'Exemple(s)',
  relativeDemoNote: '',
} as const;

const deBase = {
  headerTitle: 'Anatomie des menschlichen Gehirns',
  course: 'Anatomie des menschlichen Gehirns',
  glossary: 'Anatomie des menschlichen Gehirns',
  activityLabel: 'Aktivität:',
  activityText:
    'Erkunden Sie den SPL/NAC-Hirnatlas mit 3D- und multiplanaren Ansichten',
  instructionsLabel: 'Anleitung:',
  instructionSteps: [
    'Nutzen Sie den eingebetteten Open Anatomy Browser, um Strukturen zu prüfen.',
    'Verwenden Sie den Strukturbaum und die Schnittansichten im Viewer.',
    'Öffnen Sie bei Bedarf einen neuen Tab für mehr Arbeitsfläche.',
  ],
  colTerm: 'Begriff',
  colDefinition: 'Definition',
  colExamples: 'Beispiel(e)',
  relativeDemoNote: '',
} as const;

export function openAnatomyBrainContentFor(locale?: string): CourseContent {
  const ack = openAnatomyAckFor(locale);
  const code = resolveCourseLocale(locale);
  const base =
    code === 'fr' ? frBase : code === 'de' ? deBase : enBase;
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
