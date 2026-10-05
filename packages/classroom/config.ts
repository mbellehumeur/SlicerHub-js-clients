import { isRunningInCloud } from '@slicer-hub/client';

export const LOG_PREFIX = '[@slicer-hub/classroom]';

export const PRODUCT_NAME = 'CLASSROOM';
export const REPORTING_ACTOR = 'CLASSROOM_CLIENT';

/** Subscribe to study open/close so the report panel can show study info. */
export const SUBSCRIBE_EVENTS = [
  'imagingstudy-open',
  'imagingstudy-close',
  'status-request',
  'subscription-removed',
  'status-update',
  'dicom-send',
  'structurereport-update',
  'scene-update',
];

export const THEME_STORAGE_KEY = 'pw46.classroom.theme';
export const THEME_SLICERLIVE = 'slicerlive';
export const THEME_OHIF = 'ohif';

export const USER_NAME_KEY = 'pw46.classroom.userName';
export const USER_HUB_STARTED_AT_KEY = 'pw46.classroom.userName.hubStartedAt';
export const USER_HUB_ORIGIN_KEY = 'pw46.classroom.userName.hubOrigin';

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

export type ViewerKind = 'ira' | 'ohif' | 'slim';

const VIEWER_URLS_LOCAL: Record<ViewerKind, string> = {
  ira: 'http://localhost:8130/ira/ira.html',
  ohif: 'http://localhost:3000/viewer/',
  slim: 'http://localhost:3001/',
};

export const HUB_MIRROR_URL_LOCAL =
  'http://localhost:8130/hub-mirror/hub-mirror.html';

export const WORKLIST_URL_LOCAL = 'http://localhost:8140/';

/** Viewer popup URLs for this page (hub mounts when hosted on hub / in cloud). */
export function resolveViewerUrls(
  location: Location = window.location
): Record<ViewerKind, string> {
  if (!shouldUseSameOriginHub(location)) {
    return { ...VIEWER_URLS_LOCAL };
  }
  const origin = location.origin;
  return {
    ira: `${origin}/slicerlive/`,
    ohif: `${origin}/ohif/viewer/`,
    slim: `${origin}/slim/`,
  };
}

/** Worklist client URL (local server or hub SPA mount). */
export function resolveWorklistUrl(
  location: Location = window.location
): string {
  if (!shouldUseSameOriginHub(location)) {
    return WORKLIST_URL_LOCAL;
  }
  return `${location.origin}/worklist-client/`;
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

export function getStoredTheme(): string {
  try {
    const value = localStorage.getItem(THEME_STORAGE_KEY)?.trim();
    if (value === THEME_OHIF || value === THEME_SLICERLIVE) return value;
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
