/** Shared MView Teaching acknowledgment copy + links (EN/FR). */

export type MviewAckContent = {
  /** Short provider blurb shown above Activity (from IT Vetmed FU-Berlin). */
  intro: string;
  introLinkHref: string;
  introLinkLabel: string;
  ackTitle: string;
  ackBody: string;
  ackLinks: ReadonlyArray<{ label: string; href: string }>;
  openInNewTabLabel: string;
  toggleLabelsLabel: string;
  startQuizLabel: string;
  stopQuizLabel: string;
};

const ACK_LINKS = [
  {
    label: 'IT Vetmed FU-Berlin',
    href: 'https://it.vetmed.fu-berlin.de/',
  },
  {
    label: 'Fachsoftware · MView',
    href: 'https://www.vetmed.fu-berlin.de/service/fachbereichsverwaltung/it/Fachsoftware/index.html',
  },
] as const;

const INTRO_LINK_HREF = 'https://it.vetmed.fu-berlin.de/#allgemein';

const en: MviewAckContent = {
  intro:
    'This teaching application is provided by the IT unit of Freie Universität Berlin’s Department of Veterinary Medicine (Fachbereich Veterinärmedizin). Their public services include imaging access and embeddable MView Teaching demos—3D volumes, anatomical labels, and quiz mode on CT and radiograph examples. More information:',
  introLinkHref: INTRO_LINK_HREF,
  introLinkLabel: 'IT Vetmed FU-Berlin',
  ackTitle: 'Acknowledgments',
  ackBody:
    'The interactive viewer is MView Teaching from Freie Universität Berlin, Fachbereich Veterinärmedizin · IT. Embedded courtesy of FU VetMed IT.',
  ackLinks: ACK_LINKS,
  openInNewTabLabel: 'Open in new tab',
  toggleLabelsLabel: 'Labels on/off',
  startQuizLabel: 'Start quiz',
  stopQuizLabel: 'Stop quiz',
};

const fr: MviewAckContent = {
  intro:
    'Cette application pédagogique est fournie par l’unité IT du Fachbereich Veterinärmedizin de la Freie Universität Berlin. Leurs services publics incluent l’accès à l’imagerie et des démos MView Teaching intégrables—volumes 3D, labels anatomiques et mode quiz sur des exemples CT et radiographiques. Plus d’informations :',
  introLinkHref: INTRO_LINK_HREF,
  introLinkLabel: 'IT Vetmed FU-Berlin',
  ackTitle: 'Remerciements',
  ackBody:
    'Le visualiseur interactif est MView Teaching de la Freie Universität Berlin, Fachbereich Veterinärmedizin · IT. Intégré avec l’aimable autorisation de l’IT VetMed FU.',
  ackLinks: ACK_LINKS,
  openInNewTabLabel: 'Ouvrir dans un nouvel onglet',
  toggleLabelsLabel: 'Afficher/masquer les labels',
  startQuizLabel: 'Démarrer le quiz',
  stopQuizLabel: 'Arrêter le quiz',
};

export function mviewAckFor(locale?: string): MviewAckContent {
  const code = String(locale || '').toLowerCase();
  return code.startsWith('fr') ? fr : en;
}
