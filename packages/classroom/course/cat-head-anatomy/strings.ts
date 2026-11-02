/** Cat head anatomy course chrome (EN/FR/DE). */

import type { CourseContent } from '../types';
import { resolveCourseLocale } from '../types';
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
  headerTitle: 'Anatomie de la tête du chat',
  course: 'Anatomie de la tête du chat',
  glossary: 'Anatomie de la tête du chat',
  activityLabel: 'Activité :',
  activityText:
    'Explorez un volume CT de tête de chat avec annotations anatomiques',
  instructionsLabel: 'Instructions :',
  instructionSteps: [
    'Utilisez la visionneuse intégrée pour inspecter l’anatomie et les annotations.',
    'Désactivez les annotations quand vous êtes prêt, puis démarrez le quiz au-dessus de la visionneuse.',
    'Ouvrez dans un nouvel onglet pour un espace plus grand si besoin.',
  ],
  colTerm: 'Terme',
  colDefinition: 'Définition',
  colExamples: 'Exemple(s)',
  relativeDemoNote: '',
} as const;

const deBase = {
  headerTitle: 'Anatomie des Katzenkopfs',
  course: 'Anatomie des Katzenkopfs',
  glossary: 'Anatomie des Katzenkopfs',
  activityLabel: 'Aktivität:',
  activityText:
    'Erkunden Sie ein CT-Volumen eines Katzenkopfs mit anatomischen Beschriftungen',
  instructionsLabel: 'Anleitung:',
  instructionSteps: [
    'Nutzen Sie den eingebetteten Viewer, um Anatomie und Annotationen zu prüfen.',
    'Schalten Sie die Beschriftungen aus, wenn Sie bereit sind, und starten Sie das Quiz oberhalb des Viewers.',
    'Öffnen Sie bei Bedarf einen neuen Tab für mehr Arbeitsfläche.',
  ],
  colTerm: 'Begriff',
  colDefinition: 'Definition',
  colExamples: 'Beispiel(e)',
  relativeDemoNote: '',
} as const;

export function catHeadContentFor(locale?: string): CourseContent {
  const ack = mviewAckFor(locale);
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
    embedLoadingLabel: ack.embedLoadingLabel,
    toggleLabelsLabel: ack.toggleLabelsLabel,
    startQuizLabel: ack.startQuizLabel,
    stopQuizLabel: ack.stopQuizLabel,
  };
}
