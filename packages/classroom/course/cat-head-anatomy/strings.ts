/** Cat head anatomy course chrome (EN/FR). */

import type { CourseContent } from '../types';
import { mviewAckFor } from '../mview-ack';

const enBase = {
  headerTitle: 'Cat head anatomy',
  course: 'Cat head anatomy',
  glossary: 'Cat head anatomy',
  activityLabel: 'Activity:',
  activityText: 'Explore a CT volume of a cat head with anatomical labels',
  instructionsLabel: 'Instructions:',
  instructionSteps: [
    'Use the embedded viewer to inspect anatomy and annotations.',
    'Turn off the labels when ready and start the quiz above the viewer.',
    'Open in a new tab for a larger workspace if needed.',
  ],
  colTerm: 'Term',
  colDefinition: 'Definition',
  colExamples: 'Example(s)',
  relativeDemoNote: '',
} as const;

const frBase = {
  headerTitle: 'Anatomie tête de chat',
  course: 'Anatomie tête de chat',
  glossary: 'Anatomie tête de chat',
  activityLabel: 'Activité :',
  activityText:
    'Explorez un volume CT de tête de chat avec labels anatomiques',
  instructionsLabel: 'Instructions :',
  instructionSteps: [
    'Utilisez le visualiseur intégré pour inspecter l’anatomie et les annotations.',
    'Désactivez les labels quand vous êtes prêt, puis démarrez le quiz au-dessus du visualiseur.',
    'Ouvrez dans un nouvel onglet pour un espace plus grand si besoin.',
  ],
  colTerm: 'Terme',
  colDefinition: 'Définition',
  colExamples: 'Exemple(s)',
  relativeDemoNote: '',
} as const;

export function catHeadContentFor(locale?: string): CourseContent {
  const ack = mviewAckFor(locale);
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
    toggleLabelsLabel: ack.toggleLabelsLabel,
    startQuizLabel: ack.startQuizLabel,
    stopQuizLabel: ack.stopQuizLabel,
  };
}
