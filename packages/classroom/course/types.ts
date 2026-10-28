/** Shared course shapes for Classroom multi-course support. */

export type CourseId =
  | 'anatomical-planes'
  | 'cell-structures'
  | 'cbct'
  | 'cat-head-anatomy'
  | 'dog-thorax-abdomen'
  | 'open-anatomy-brain';

export type Localized = { en: string; fr: string };

/** External teaching viewer embed (e.g. FU Berlin MView TeachingPortal). */
export type CourseEmbed = {
  id: string;
  /** Card heading when multiple embeds; optional for single-embed courses. */
  title?: Localized;
  iframeSrc?: string;
  iframeTitle?: string;
  openHref: string;
  openLabel?: Localized;
  /** Parent toolbar for MView TeachingPortal postMessage controls. */
  toolbar?: 'mview';
};

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
  /** Optional link appended to the intro paragraph. */
  introLinkHref?: string;
  introLinkLabel?: string;
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
  /** Acknowledgments footer (e.g. MView credit). */
  ackTitle?: string;
  ackBody?: string;
  ackLinks?: ReadonlyArray<{ label: string; href: string }>;
  /** Open-in-new-tab control label for embeds. */
  openInNewTabLabel?: string;
  /** MView embed: toggle anatomical labels. */
  toggleLabelsLabel?: string;
  /** MView embed: start quiz mode. */
  startQuizLabel?: string;
  /** MView embed: leave quiz mode. */
  stopQuizLabel?: string;
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
  /** Optional external iframe embeds (MView Teaching, etc.). */
  embeds?: ReadonlyArray<CourseEmbed>;
  /**
   * Show snapshots / volume-seg scene panel (`#reportDisplay`).
   * Default true when omitted.
   */
  showScenePanel?: boolean;
  /**
   * Show classroom conference chat panel.
   * Default true when omitted.
   */
  showChatPanel?: boolean;
  contentFor: (locale?: string) => CourseContent;
};

/** Resolved panel visibility (omitted flags default to shown). */
export function coursePanelVisibility(course: CourseDefinition): {
  showScenePanel: boolean;
  showChatPanel: boolean;
} {
  return {
    showScenePanel: course.showScenePanel !== false,
    showChatPanel: course.showChatPanel !== false,
  };
}

export function pickLocale(loc: Localized, locale: string): string {
  return String(locale || '')
    .toLowerCase()
    .startsWith('fr')
    ? loc.fr
    : loc.en;
}
