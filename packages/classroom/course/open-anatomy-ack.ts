/** Shared Open Anatomy acknowledgment copy + links (EN/FR). */

export type OpenAnatomyAckContent = {
  intro: string;
  introLinkHref: string;
  introLinkLabel: string;
  ackTitle: string;
  ackBody: string;
  ackLinks: ReadonlyArray<{ label: string; href: string }>;
  openInNewTabLabel: string;
};

const ACK_LINKS = [
  {
    label: 'Open Anatomy Project',
    href: 'https://www.openanatomy.org/',
  },
  {
    label: 'SPL/NAC Brain Atlas',
    href: 'https://www.openanatomy.org/atlas-pages/atlas-spl-nac-brain.html',
  },
] as const;

const INTRO_LINK_HREF = 'https://www.openanatomy.org/';

const en: OpenAnatomyAckContent = {
  intro:
    'This teaching application embeds the Open Anatomy Browser from the Open Anatomy Project at Brigham and Women’s Hospital (Surgical Planning Laboratory). Free, open anatomy atlases for students, clinicians, and the public. More information:',
  introLinkHref: INTRO_LINK_HREF,
  introLinkLabel: 'Open Anatomy Project',
  ackTitle: 'Acknowledgments',
  ackBody:
    'The interactive atlas is the Open Anatomy Browser (OABrowser) showing the SPL/NAC Brain Atlas. Embedded courtesy of the Open Anatomy Project.',
  ackLinks: ACK_LINKS,
  openInNewTabLabel: 'Open in new tab',
};

const fr: OpenAnatomyAckContent = {
  intro:
    'Cette application pédagogique intègre l’Open Anatomy Browser du Open Anatomy Project (Brigham and Women’s Hospital, Surgical Planning Laboratory). Atlas anatomiques libres et ouverts pour étudiants, cliniciens et le public. Plus d’informations :',
  introLinkHref: INTRO_LINK_HREF,
  introLinkLabel: 'Open Anatomy Project',
  ackTitle: 'Remerciements',
  ackBody:
    'L’atlas interactif est l’Open Anatomy Browser (OABrowser) présentant l’atlas cérébral SPL/NAC. Intégré avec l’aimable autorisation du Open Anatomy Project.',
  ackLinks: ACK_LINKS,
  openInNewTabLabel: 'Ouvrir dans un nouvel onglet',
};

export function openAnatomyAckFor(locale?: string): OpenAnatomyAckContent {
  const code = String(locale || '').toLowerCase();
  return code.startsWith('fr') ? fr : en;
}
