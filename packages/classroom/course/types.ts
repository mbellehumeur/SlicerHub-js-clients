/** Shared course shapes for Classroom multi-course support. */

export type CourseId = 'anatomical-planes' | 'cell-structures' | 'cbct';

export type Localized = { en: string; fr: string };

export type DemoKind = 'axis' | 'relative';

export type ViewUpHint = 'S' | 'I' | 'A' | 'P' | 'L' | 'R' | null;

export type CourseTerm = {
  id: string;
  term: Localized;
  definition: Localized;
  examples: Localized[];
  antonymId?: string;
  demo?: {
    kind: DemoKind;
    viewUpHint: ViewUpHint;
  };
};

export type CourseScanButton = {
  sceneKey: string;
  label: Localized;
  title?: string;
};

export type CourseBonusControl = { key: string; action: string };

/** Locale-resolved course content (glossary panel + bonus). */
export type CourseContent = {
  headerTitle: string;
  course: string;
  glossary: string;
  intro: string;
  activityLabel: string;
  activityText: string;
  instructionsLabel: string;
  instructionSteps: readonly string[];
  colTerm: string;
  colDefinition: string;
  colExamples: string;
  relativeDemoNote: string;
  comingSoon?: string;
  /** Planes (and similar) figure beside the term table. */
  figureSrc?: string;
  figureAlt?: string;
  figureCredit?: string;
  figureCreditHref?: string;
  figureWidth?: number;
  figureHeight?: number;
  viewerFigureSrc?: string;
  viewerFigureAlt?: string;
  viewerFigureWidth?: number;
  viewerFigureHeight?: number;
  /** Enlarge leading a/b/c in term labels. */
  letterLabels?: boolean;
  bonus?: {
    title: string;
    pitch: string;
    link: string;
    linkHref: string;
    controls: ReadonlyArray<CourseBonusControl>;
    figureSrc: string;
    figureAlt: string;
    credits: ReadonlyArray<{ label: string; href: string }>;
  };
};

export type CourseDefinition = {
  id: CourseId;
  /** Dropdown label. */
  title: Localized;
  terms: CourseTerm[];
  scans: CourseScanButton[];
  contentFor: (locale?: string) => CourseContent;
};

export function pickLocale(loc: Localized, locale: string): string {
  return String(locale || '')
    .toLowerCase()
    .startsWith('fr')
    ? loc.fr
    : loc.en;
}
