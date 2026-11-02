/** Dog Thorax/Abdomen anatomy course chrome (EN/FR/DE). */

import type { CourseContent } from '../types';
import { resolveCourseLocale } from '../types';
import { mviewAckFor } from '../mview-ack';

const enBase = {
  headerTitle: 'Dog Thorax/Abdomen anatomy',
  course: 'Dog Thorax/Abdomen anatomy',
  glossary: 'Dog Thorax/Abdomen anatomy',
  activityLabel: 'Activity:',
  activityText:
    'Explore a DX (X-ray) study of dog thorax and abdomen with anatomical labels',
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
  headerTitle: 'Anatomie thorax/abdomen du chien',
  course: 'Anatomie thorax/abdomen du chien',
  glossary: 'Anatomie thorax/abdomen du chien',
  activityLabel: 'Activité :',
  activityText:
    'Explorez une étude DX (radiographie) thorax/abdomen du chien avec annotations anatomiques',
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
  headerTitle: 'Anatomie Thorax/Abdomen des Hundes',
  course: 'Anatomie Thorax/Abdomen des Hundes',
  glossary: 'Anatomie Thorax/Abdomen des Hundes',
  activityLabel: 'Aktivität:',
  activityText:
    'Erkunden Sie eine DX-(Röntgen-)Studie von Thorax und Abdomen des Hundes mit anatomischen Beschriftungen',
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

export function dogThoraxContentFor(locale?: string): CourseContent {
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
