/** Body sections and anatomical planes — EN/FR/DE course content for Classroom. */

import type { CourseTerm } from '../types';

export type TermId = 'sagittal' | 'frontal' | 'transverse';

export const DIRECTIONAL_TERMS: CourseTerm[] = [
  {
    id: 'sagittal',
    term: {
      en: 'a - Sagittal Plane',
      fr: 'a - Plan sagittal',
      de: 'a - Sagittalebene',
    },
    definition: {
      en: 'Divides the body or an organ vertically into right and left sides. If this vertical plane runs directly down the middle of the body, it is called the midsagittal or median plane. If it divides the body into unequal right and left sides, it is called a parasagittal plane.',
      fr: 'Divise le corps ou un organe verticalement en côtés droit et gauche. Si ce plan vertical passe exactement au milieu du corps, on l’appelle plan médian ou midsagittal. S’il divise le corps en côtés droit et gauche inégaux, on l’appelle plan parasagittal.',
      de: 'Teilt den Körper oder ein Organ vertikal in rechte und linke Seiten. Verläuft diese Vertikalebene genau durch die Körpermitte, nennt man sie Median- oder Midsagittalebene. Teilt sie den Körper in ungleiche rechte und linke Anteile, heißt sie Parasagittalebene.',
    },
    examples: [
      {
        en: 'Midsagittal (median) plane — equal right and left halves.',
        fr: 'Plan médian (midsagittal) — moitiés droite et gauche égales.',
        de: 'Median- (Midsagittal-)Ebene — gleiche rechte und linke Hälften.',
      },
      {
        en: 'Parasagittal plane — unequal right and left portions.',
        fr: 'Plan parasagittal — portions droite et gauche inégales.',
        de: 'Parasagittalebene — ungleiche rechte und linke Anteile.',
      },
    ],
    demo: { kind: 'axis', viewUpHint: 'L' },
  },
  {
    id: 'frontal',
    term: {
      en: 'b - Frontal Plane',
      fr: 'b - Plan frontal',
      de: 'b - Frontalebene',
    },
    definition: {
      en: 'Divides the body or an organ into an anterior (front) portion and a posterior (rear) portion. The frontal plane is sometimes referred to as a coronal plane.',
      fr: 'Divise le corps ou un organe en une portion antérieure (avant) et une portion postérieure (arrière). Le plan frontal est aussi appelé plan coronal.',
      de: 'Teilt den Körper oder ein Organ in einen anterioren (vorderen) und einen posterioren (hinteren) Anteil. Die Frontalebene wird auch Koronalebene genannt.',
    },
    examples: [
      {
        en: 'Also called the coronal plane.',
        fr: 'Aussi appelé plan coronal.',
        de: 'Auch Koronalebene genannt.',
      },
      {
        en: 'Separates the chest wall (anterior) from the back (posterior).',
        fr: 'Sépare la paroi thoracique (antérieure) du dos (postérieur).',
        de: 'Trennt die Brustwand (anterior) vom Rücken (posterior).',
      },
    ],
    demo: { kind: 'axis', viewUpHint: 'A' },
  },
  {
    id: 'transverse',
    term: {
      en: 'c - Transverse Plane',
      fr: 'c - Plan transversal',
      de: 'c - Transversalebene',
    },
    definition: {
      en: 'Divides the body or organ horizontally into upper and lower portions. Transverse planes produce images referred to as cross sections.',
      fr: 'Divise le corps ou un organe horizontalement en portions supérieure et inférieure. Les plans transversaux produisent des images appelées coupes transversales.',
      de: 'Teilt den Körper oder ein Organ horizontal in obere und untere Anteile. Transversalebenen erzeugen Querschnittsbilder.',
    },
    examples: [
      {
        en: 'Also called a horizontal or axial plane.',
        fr: 'Aussi appelé plan horizontal ou axial.',
        de: 'Auch Horizontal- oder Axialebene genannt.',
      },
      {
        en: 'CT and MRI axial slices are transverse cross sections.',
        fr: 'Les coupes axiales en TDM et IRM sont des coupes transversales.',
        de: 'Axiale CT- und MRT-Schnitte sind transversale Querschnitte.',
      },
    ],
    demo: { kind: 'axis', viewUpHint: 'S' },
  },
];

export function termById(id: string): CourseTerm | undefined {
  return DIRECTIONAL_TERMS.find((t) => t.id === id);
}
