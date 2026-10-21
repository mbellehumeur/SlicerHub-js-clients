/** Body sections and anatomical planes — EN/FR course content for Classroom. */

export type TermId = 'sagittal' | 'frontal' | 'transverse';

export type Localized = { en: string; fr: string };

export type DemoKind = 'axis' | 'relative';

export type ViewUpHint = 'S' | 'I' | 'A' | 'P' | 'L' | 'R' | null;

export type DirectionalTerm = {
  id: TermId;
  term: Localized;
  definition: Localized;
  examples: Localized[];
  antonymId?: TermId;
  demo: {
    kind: DemoKind;
    viewUpHint: ViewUpHint;
  };
};

export const DIRECTIONAL_TERMS: DirectionalTerm[] = [
  {
    id: 'sagittal',
    term: {
      en: 'a - Sagittal Plane',
      fr: 'a - Plan sagittal',
    },
    definition: {
      en: 'Divides the body or an organ vertically into right and left sides. If this vertical plane runs directly down the middle of the body, it is called the midsagittal or median plane. If it divides the body into unequal right and left sides, it is called a parasagittal plane.',
      fr: 'Divise le corps ou un organe verticalement en côtés droit et gauche. Si ce plan vertical passe exactement au milieu du corps, on l’appelle plan médian ou midsagittal. S’il divise le corps en côtés droit et gauche inégaux, on l’appelle plan parasagittal.',
    },
    examples: [
      {
        en: 'Midsagittal (median) plane — equal right and left halves.',
        fr: 'Plan médian (midsagittal) — moitiés droite et gauche égales.',
      },
      {
        en: 'Parasagittal plane — unequal right and left portions.',
        fr: 'Plan parasagittal — portions droite et gauche inégales.',
      },
    ],
    demo: { kind: 'axis', viewUpHint: 'L' },
  },
  {
    id: 'frontal',
    term: {
      en: 'b - Frontal Plane',
      fr: 'b - Plan frontal',
    },
    definition: {
      en: 'Divides the body or an organ into an anterior (front) portion and a posterior (rear) portion. The frontal plane is sometimes referred to as a coronal plane.',
      fr: 'Divise le corps ou un organe en une portion antérieure (avant) et une portion postérieure (arrière). Le plan frontal est aussi appelé plan coronal.',
    },
    examples: [
      {
        en: 'Also called the coronal plane.',
        fr: 'Aussi appelé plan coronal.',
      },
      {
        en: 'Separates the chest wall (anterior) from the back (posterior).',
        fr: 'Sépare la paroi thoracique (antérieure) du dos (postérieur).',
      },
    ],
    demo: { kind: 'axis', viewUpHint: 'A' },
  },
  {
    id: 'transverse',
    term: {
      en: 'c - Transverse Plane',
      fr: 'c - Plan transversal',
    },
    definition: {
      en: 'Divides the body or organ horizontally into upper and lower portions. Transverse planes produce images referred to as cross sections.',
      fr: 'Divise le corps ou un organe horizontalement en portions supérieure et inférieure. Les plans transversaux produisent des images appelées coupes transversales (cross sections).',
    },
    examples: [
      {
        en: 'Also called a horizontal or axial plane.',
        fr: 'Aussi appelé plan horizontal ou axial.',
      },
      {
        en: 'CT and MRI axial slices are transverse cross sections.',
        fr: 'Les coupes axiales en TDM et IRM sont des coupes transversales.',
      },
    ],
    demo: { kind: 'axis', viewUpHint: 'S' },
  },
];

export function termById(id: string): DirectionalTerm | undefined {
  return DIRECTIONAL_TERMS.find((t) => t.id === id);
}

export function pickLocale(loc: Localized, locale: string): string {
  return locale.startsWith('fr') ? loc.fr : loc.en;
}
