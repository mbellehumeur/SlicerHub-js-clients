import { isRunningInCloud } from '@slicer-hub/client';

export const LOG_PREFIX = '[@slicer-hub/worklist]';

export const PRODUCT_NAME = 'WKLST';
export const WORKLIST_ACTOR = 'WORKLIST_CLIENT';
export const IMAGE_DISPLAY_ACTOR = 'ID';

export const SUBSCRIBE_EVENTS = [
  'imagingstudy-open',
  'imagingstudy-close',
  'status-request',
  'subscription-removed',
  'status-update',
  'structurereport-update',
];

export const EMPTY_CAST_CONTEXT = {
  'context.type': '',
  context: [] as unknown[],
};

export const PATIENT_REFERENCE =
  'Patient/503824b8-fe8c-4227-b061-7181ba6c3926';

export const WORKLIST_ORG_MINE = 'mine';
export const WORKLIST_ORG_IDC_SEG = 'idc-segmentations';
export const WORKLIST_ORG_IDC_WSI = 'idc-wsi';
export const WORKLIST_ORG_SLICER_SCENES = 'slicer-scenes';
export const WORKLIST_ORG_CBCT_DENTAL = 'cbct-dental';
export const WORKLIST_ORG_TXRV = 'torchxrayvision';
export const WORKLIST_ORG_3D_SLICER = '3d-slicer';

// Worklist filter values for IDC segmentation category worklists.
// Stored as `idc-category:<REGION>` in the UI <select>.
export const WORKLIST_IDC_CATEGORY_FILTER_PREFIX = 'idc-category:';
export const IDC_DEFAULT_CATEGORY = 'KIDNEY:KITS';

/** IDC documentation for AI assistants / agents. */
export const IDC_AGENT_URL =
  'https://learn.canceridc.dev/ai-assistants/agents';

// SegRoulette regions to exclude from IDC category worklists.
export const IDC_EXCLUDED_CATEGORIES = ['SPINE', 'MEDIASTINUM'];

/** CHEST body-region split: collection → worklist subcategory. */
export type IdcChestSubcategory = {
  /** Filter id stored on samples / in `idc-category:` select values. */
  id: string;
  /** Human label for the org <select>. */
  label: string;
  /** Short prefix used in worklist row names. */
  namePrefix: string;
  /** IDC collection ids, or `'other'` for remaining CHEST-primary collections. */
  collections: string[] | 'other';
};

export const IDC_CHEST_SUBCATEGORIES: IdcChestSubcategory[] = [
  {
    id: 'CHEST:NODULES_LIDC',
    label: 'IDC · CHEST · Nodules (LIDC)',
    namePrefix: 'CHEST · Nodules',
    collections: ['lidc_idri'],
  },
  {
    id: 'CHEST:MEDIASTINAL_LN',
    label: 'IDC · CHEST · Mediastinal LN',
    namePrefix: 'CHEST · Mediastinal LN',
    collections: ['mediastinal_lymph_node_seg'],
  },
  {
    id: 'CHEST:NLST_TOTALSEG',
    label: 'IDC · CHEST · NLST (TotalSeg)',
    namePrefix: 'CHEST · NLST',
    collections: ['nlst'],
  },
  {
    id: 'CHEST:AIMI_LUNG_FDG',
    label: 'IDC · CHEST · AIMI lung/FDG',
    namePrefix: 'CHEST · AIMI',
    collections: ['acrin_nsclc_fdg_pet', 'lung_pet_ct_dx', 'rider_lung_pet_ct'],
  },
  {
    id: 'CHEST:OTHER',
    label: 'IDC · CHEST · Other',
    namePrefix: 'CHEST · Other',
    collections: 'other',
  },
];

const CHEST_COLLECTION_TO_SUBCATEGORY = (() => {
  const map = new Map<string, IdcChestSubcategory>();
  for (const sub of IDC_CHEST_SUBCATEGORIES) {
    if (sub.collections === 'other') continue;
    for (const col of sub.collections) {
      map.set(col, sub);
    }
  }
  return map;
})();

const CHEST_OTHER_SUBCATEGORY =
  IDC_CHEST_SUBCATEGORIES.find((s) => s.collections === 'other')!;

/** Resolve a CHEST-primary SegRoulette collection to its worklist subcategory. */
export function idcChestSubcategoryForCollection(
  collectionId: string
): IdcChestSubcategory {
  return (
    CHEST_COLLECTION_TO_SUBCATEGORY.get(String(collectionId || '').trim()) ||
    CHEST_OTHER_SUBCATEGORY
  );
}

/** SegRoulette c4kc_kits rows (moved out of plain ABDOMEN). */
export const IDC_KITS_CATEGORY = {
  id: 'KIDNEY:KITS',
  label: 'IDC · KIDNEY · KiTS',
  namePrefix: 'KiTS',
  collectionId: 'c4kc_kits',
} as const;

/**
 * Category bases that are further split by primary series modality (`m`).
 * Keep in sync with tools/build_segroulette_worklist.py MODALITY_SPLIT_BASES.
 */
export const IDC_MODALITY_SPLIT_BASES = [
  'ABDOMEN',
  'BREAST',
  'LIVER',
  'LUNG',
  'CHEST:AIMI_LUNG_FDG',
  'CHEST:OTHER',
] as const;

const MODALITY_SPLIT_BASE_SET = new Set<string>(IDC_MODALITY_SPLIT_BASES);

export function idcNeedsModalitySplit(baseCategory: string): boolean {
  return MODALITY_SPLIT_BASE_SET.has(String(baseCategory || '').trim().toUpperCase());
}

/** Append `:{modality}` when the base worklist mixes multiple non-SEG modalities. */
export function idcApplyModalitySplit(
  baseCategory: string,
  namePrefix: string,
  modality: string
): { id: string; namePrefix: string } {
  const base = String(baseCategory || '').trim().toUpperCase();
  const prefix = String(namePrefix || '').trim() || base;
  const mod = String(modality || '').trim().toUpperCase();
  if (!idcNeedsModalitySplit(base) || !mod || mod === 'SEG') {
    return { id: base, namePrefix: prefix };
  }
  return {
    id: `${base}:${mod}`,
    namePrefix: `${prefix} · ${mod}`,
  };
}

/** Leaf IDC category filter ids (org select / catalog idcCategory). */
export const IDC_CATEGORIES = [
  'ABDOMEN:CT',
  'ABDOMEN:PT',
  'ABDOMEN:MR',
  'ADRENAL',
  'BRAIN',
  'BREAST:MR',
  'BREAST:PT',
  'CHEST:NODULES_LIDC',
  'CHEST:MEDIASTINAL_LN',
  'CHEST:NLST_TOTALSEG',
  'CHEST:AIMI_LUNG_FDG:CT',
  'CHEST:AIMI_LUNG_FDG:PT',
  'CHEST:OTHER:CT',
  'CHEST:OTHER:PT',
  'KIDNEY',
  IDC_KITS_CATEGORY.id,
  'LIVER:CT',
  'LIVER:MR',
  'LUNG:CT',
  'LUNG:PT',
  'PANCREAS',
  'PELVIS',
  'PROSTATE',
  'WHOLEBODY',
];

/** Body regions that feed IDC category worklists (CHEST covers all CHEST:* ids). */
export function idcBodyRegionsForCategories(
  categoryIds: Iterable<string>
): Set<string> {
  const regions = new Set<string>();
  for (const id of categoryIds) {
    const cat = String(id || '').trim().toUpperCase();
    if (!cat) continue;
    if (cat === 'CHEST' || cat.startsWith('CHEST:')) {
      regions.add('CHEST');
    } else if (cat === 'KIDNEY:KITS') {
      // KiTS rows live under ABDOMEN loc in SegRoulette; remap by collection at sample time.
      regions.add('ABDOMEN');
    } else if (cat.includes(':')) {
      // REGION:MODALITY (e.g. LIVER:CT) → primary body region.
      regions.add(cat.split(':')[0] || cat);
    } else {
      regions.add(cat);
    }
  }
  return regions;
}

export function isIdcCategoryFilterValue(value: string): boolean {
  return String(value || '').startsWith(WORKLIST_IDC_CATEGORY_FILTER_PREFIX);
}

export function idcCategoryFromFilterValue(value: string): string | null {
  const v = String(value || '').trim();
  if (!isIdcCategoryFilterValue(v)) return null;
  const cat = v.slice(WORKLIST_IDC_CATEGORY_FILTER_PREFIX.length).trim().toUpperCase();
  return cat || null;
}

export const VIEWER_OPEN_TITLE_DISABLED = 'Subscribe to the hub first';
export const VIEWER_OPEN_TITLE_REPORTING = 'Open IRA Report Creator';
export const VIEWER_OPEN_TITLE_CLASSROOM = 'Open Classroom (ST-444)';
export const VIEWER_OPEN_TITLE_IRA = 'Open SlicerLive';
export const VIEWER_OPEN_TITLE_SLICER =
  '3D Slicer Image Display is connected';
export const VIEWER_OPEN_TITLE_SLICER_INACTIVE =
  '3D Slicer Image Display not connected';
export const VIEWER_OPEN_TITLE_HUB_MIRROR =
  'Open 3D Slicer web mirror (hub-mirror LiveScene stream)';
export const VIEWER_OPEN_TITLE_HUB_MIRROR_ACTIVE =
  '3D Slicer web mirror is active';
export const VIEWER_OPEN_TITLE_OHIF = 'Open an OHIF viewer instance';
export const VIEWER_OPEN_TITLE_SLIM = 'Open a Slim viewer instance';
export const VIEWER_OPEN_TITLE_SCENEVIEWS = 'Scene Views for connected image displays';
export const VIEWER_OPEN_TITLE_SEGROULETTE =
  'Spin SegRoulette and open an IDC SEG case on Image Displays';

export type ViewerKind = 'reporting' | 'classroom' | 'ira' | 'ohif' | 'slim';

const VIEWER_URLS_LOCAL: Record<ViewerKind, string> = {
  reporting: 'http://localhost:8150/',
  classroom: 'http://localhost:8160/',
  ira: 'http://localhost:8130/ira/ira.html',
  ohif: 'http://localhost:3000/viewer/',
  slim: 'http://localhost:3001/',
};

/** Local hub-mirror Four-Up LiveScene client (Hub scene-update + hub payloads). */
export const HUB_MIRROR_URL_LOCAL =
  'http://localhost:8130/hub-mirror/hub-mirror.html';

/** @deprecated Prefer resolveViewerUrls() — kept for callers that need the local defaults. */
export const VIEWER_URLS = VIEWER_URLS_LOCAL;

export const THEME_STORAGE_KEY = 'pw46.worklist.theme';
export const THEME_SLICERLIVE = 'slicerlive';
export const THEME_OHIF = 'ohif';
export const THEME_CALM = 'calm';
export const THEME_IDS = [THEME_SLICERLIVE, THEME_OHIF, THEME_CALM] as const;
export type ThemeId = (typeof THEME_IDS)[number];

export function normalizeTheme(theme: string | null | undefined): ThemeId {
  return THEME_IDS.includes(theme as ThemeId)
    ? (theme as ThemeId)
    : THEME_SLICERLIVE;
}

export const USER_NAME_KEY = 'pw46.worklist.userName';
export const USER_HUB_STARTED_AT_KEY = 'pw46.worklist.userName.hubStartedAt';
export const USER_HUB_ORIGIN_KEY = 'pw46.worklist.userName.hubOrigin';

export type HubKey = 'local' | 'cloud';

export type HubDefinition = {
  label: string;
  hubEndpoint: string;
  authorizeEndpoint: string;
  tokenEndpoint: string;
  client_id: string;
  client_secret: string;
};

const HUB_CREDENTIALS = {
  client_id: 'client_id_3d_Slicer',
  client_secret: 'client_secret_3d_Slicer',
} as const;

/** Standalone presets (local dual-server / legacy cloud hostname). */
export const HUB_DEFINITIONS: Record<HubKey, HubDefinition> = {
  local: {
    label: '3D Slicer local',
    hubEndpoint: 'http://127.0.0.1:2018/api/hub',
    authorizeEndpoint: 'http://127.0.0.1:2018/oauth/authorize',
    tokenEndpoint: 'http://127.0.0.1:2018/oauth/token',
    ...HUB_CREDENTIALS,
  },
  cloud: {
    label: '3D Slicer cloud',
    hubEndpoint:
      'https://slicerhub-azejffgnb7dve8es.canadaeast-01.azurewebsites.net/api/hub',
    authorizeEndpoint:
      'https://slicerhub-azejffgnb7dve8es.canadaeast-01.azurewebsites.net/oauth/authorize',
    tokenEndpoint:
      'https://slicerhub-azejffgnb7dve8es.canadaeast-01.azurewebsites.net/oauth/token',
    ...HUB_CREDENTIALS,
  },
};

/** True when this page is served from the Slicer hub SPA mounts. */
export function isHostedOnCastHub(
  location: Location = window.location
): boolean {
  const path = String(location.pathname || '');
  return (
    path.startsWith('/worklist-client') ||
    path.startsWith('/reporting-client') ||
    path.startsWith('/classroom-client')
  );
}

export function shouldUseSameOriginHub(
  location: Location = window.location
): boolean {
  return isHostedOnCastHub(location) || isRunningInCloud(location);
}

function sameOriginHubDefinition(
  origin: string,
  label: string
): HubDefinition {
  return {
    label,
    hubEndpoint: `${origin}/api/hub`,
    authorizeEndpoint: `${origin}/oauth/authorize`,
    tokenEndpoint: `${origin}/oauth/token`,
    ...HUB_CREDENTIALS,
  };
}

/** Hub presets for this page (same-origin when hosted on hub / in cloud). */
export function getHubDefinitions(
  location: Location = window.location
): Record<HubKey, HubDefinition> {
  if (!shouldUseSameOriginHub(location)) {
    return HUB_DEFINITIONS;
  }
  const origin = location.origin;
  const hosted = sameOriginHubDefinition(origin, 'This Slicer hub');
  return {
    local: { ...hosted, label: 'This Slicer hub' },
    cloud: { ...hosted, label: 'This Slicer hub' },
  };
}

/** Viewer popup URLs for this page (hub mounts when hosted on hub / in cloud). */
export function resolveViewerUrls(
  location: Location = window.location
): Record<ViewerKind, string> {
  if (!shouldUseSameOriginHub(location)) {
    return { ...VIEWER_URLS_LOCAL };
  }
  const origin = location.origin;
  return {
    reporting: `${origin}/reporting-client/`,
    classroom: `${origin}/classroom-client/`,
    ira: `${origin}/slicerlive/`,
    ohif: `${origin}/ohif/viewer/`,
    slim: `${origin}/slim/`,
  };
}

/** hub-mirror LiveScene stream client URL. */
export function resolveHubMirrorUrl(
  location: Location = window.location
): string {
  if (!shouldUseSameOriginHub(location)) {
    return HUB_MIRROR_URL_LOCAL;
  }
  return `${location.origin}/hub-mirror/`;
}

export function hubOriginFromEndpoint(hubEndpoint: string): string | null {
  const trimmed = String(hubEndpoint || '').trim();
  if (!trimmed) return null;
  try {
    return new URL(trimmed).origin;
  } catch {
    return null;
  }
}

export function resolveHubMetricsUrl(hubEndpoint: string): string | null {
  const trimmed = String(hubEndpoint || '').trim();
  if (!trimmed) return null;
  try {
    const base = trimmed.endsWith('/') ? trimmed : `${trimmed}/`;
    return new URL('admin/metrics', base).href;
  } catch {
    return null;
  }
}

export function getStoredUserName(): string {
  try {
    return localStorage.getItem(USER_NAME_KEY)?.trim() || '';
  } catch {
    return '';
  }
}

export function getStoredUserHubStartedAt(): string {
  try {
    return localStorage.getItem(USER_HUB_STARTED_AT_KEY)?.trim() || '';
  } catch {
    return '';
  }
}

export function getStoredUserHubOrigin(): string {
  try {
    return localStorage.getItem(USER_HUB_ORIGIN_KEY)?.trim() || '';
  } catch {
    return '';
  }
}

export function clearStoredUserName(): void {
  try {
    localStorage.removeItem(USER_NAME_KEY);
    localStorage.removeItem(USER_HUB_STARTED_AT_KEY);
    localStorage.removeItem(USER_HUB_ORIGIN_KEY);
  } catch {
    /* ignore */
  }
}

export function setStoredUserName(
  userName: string,
  hubStartedAt?: string | null,
  hubOrigin?: string | null
): void {
  const trimmed = String(userName || '').trim();
  try {
    if (!trimmed) {
      clearStoredUserName();
      return;
    }
    localStorage.setItem(USER_NAME_KEY, trimmed);
    if (hubStartedAt) {
      localStorage.setItem(USER_HUB_STARTED_AT_KEY, hubStartedAt);
    }
    if (hubOrigin) {
      localStorage.setItem(USER_HUB_ORIGIN_KEY, hubOrigin);
    }
  } catch {
    /* ignore */
  }
}

export async function fetchHubStartedAt(
  hubEndpoint: string
): Promise<string | null> {
  const metricsUrl = resolveHubMetricsUrl(hubEndpoint);
  if (!metricsUrl) return null;
  try {
    const response = await fetch(metricsUrl, { method: 'GET' });
    if (!response.ok) return null;
    const data = await response.json();
    const started = data?.started_at;
    return typeof started === 'string' && started.trim()
      ? started.trim()
      : null;
  } catch {
    return null;
  }
}

export function getStoredTheme(): ThemeId {
  try {
    return normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY)?.trim());
  } catch {
    /* ignore */
  }
  return THEME_SLICERLIVE;
}

export function setStoredTheme(theme: string): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    /* ignore */
  }
}
