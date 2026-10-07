import { history } from '@ohif/app';
import { HUB_LOCAL_DATA_SOURCE, LOG_PREFIX } from './constants';
import { resolveHubModeRoute } from './resolve-hub-mode-route';

const NAVIGATE_WAIT_MS = 5000;
const NAVIGATE_POLL_MS = 50;

export type HubNavigateOptions = {
  replace?: boolean;
};

type PendingNav = {
  route: string;
  options?: HubNavigateOptions;
};

type NavigateFn = (to: string, options?: HubNavigateOptions) => void;

let pendingNav: PendingNav | null = null;
let pendingTimer: ReturnType<typeof setTimeout> | null = null;
let pendingDeadline = 0;

function getWindowNavigate(): NavigateFn | null {
  if (typeof window === 'undefined') {
    return null;
  }
  const navigate = (
    window as Window & { __OHIF_NAVIGATE__?: NavigateFn }
  ).__OHIF_NAVIGATE__;
  return typeof navigate === 'function' ? navigate : null;
}

function getRouterNavigate(): NavigateFn | null {
  // Prefer window bridge (survives duplicate @ohif/app history modules), then
  // the @ohif/app history singleton.
  return getWindowNavigate() || (typeof history?.navigate === 'function' ? history.navigate : null);
}

/** True when OHIF React Router navigate is wired. */
export function isHubRouterReady(): boolean {
  return getRouterNavigate() !== null;
}

function clearPendingNavTimer(): void {
  if (pendingTimer != null) {
    clearTimeout(pendingTimer);
    pendingTimer = null;
  }
}

function flushPendingNav(): boolean {
  const navigate = getRouterNavigate();
  if (!navigate || !pendingNav) {
    return false;
  }
  const { route, options } = pendingNav;
  pendingNav = null;
  clearPendingNavTimer();
  navigate(route, { replace: true, ...options });
  return true;
}

function schedulePendingNavRetry(): void {
  clearPendingNavTimer();
  if (!pendingNav) {
    return;
  }
  if (Date.now() >= pendingDeadline) {
    console.warn(
      `${LOG_PREFIX} hubNavigate: React Router history not ready after ${NAVIGATE_WAIT_MS}ms — keeping route queued (no full page reload)`,
      pendingNav.route
    );
    // Keep polling so a late history wire still works; never location.assign.
    pendingDeadline = Date.now() + NAVIGATE_WAIT_MS;
  }
  pendingTimer = setTimeout(() => {
    pendingTimer = null;
    if (flushPendingNav()) {
      return;
    }
    schedulePendingNavRetry();
  }, NAVIGATE_POLL_MS);
}

/**
 * Navigate to an OHIF route via React Router only.
 * If history is not ready yet, queue and retry — never use location.assign/replace
 * (full page load tears down the Hub websocket).
 */
export function hubNavigate(to: string, options?: HubNavigateOptions): void {
  const route = to.startsWith('/') ? to : `/${to}`;
  const navOptions: HubNavigateOptions = { replace: true, ...options };

  const navigate = getRouterNavigate();
  if (navigate) {
    pendingNav = null;
    clearPendingNavTimer();
    navigate(route, navOptions);
    return;
  }

  pendingNav = { route, options: navOptions };
  pendingDeadline = Date.now() + NAVIGATE_WAIT_MS;
  console.info(
    `${LOG_PREFIX} hubNavigate: history not ready — queueing`,
    route
  );
  schedulePendingNavRetry();
}

/** Resolve when React Router navigate is available (or timeout). */
export function waitForHubRouter(timeoutMs = NAVIGATE_WAIT_MS): Promise<boolean> {
  if (isHubRouterReady()) {
    return Promise.resolve(true);
  }
  return new Promise(resolve => {
    const deadline = Date.now() + timeoutMs;
    const tick = () => {
      if (isHubRouterReady()) {
        resolve(true);
        return;
      }
      if (Date.now() >= deadline) {
        console.warn(
          `${LOG_PREFIX} waitForHubRouter: timed out after ${timeoutMs}ms`
        );
        resolve(false);
        return;
      }
      setTimeout(tick, NAVIGATE_POLL_MS);
    };
    tick();
  });
}

export function navigateToHubEmptyViewer(options?: HubNavigateOptions): void {
  hubNavigate('/viewer', { replace: true, ...options });
}

export function navigateToHubViewer(
  studyUIDs: string[],
  options?: {
    seriesUID?: string;
    dataSource?: string;
    useLocalDataSource?: boolean;
    /** OHIF mode route segment (default `viewer`). */
    modeRoute?: string;
  }
): void {
  if (!studyUIDs.length) {
    return;
  }

  const query = new URLSearchParams();
  studyUIDs.forEach(uid => query.append('StudyInstanceUIDs', uid));
  const dataSource =
    options?.dataSource ??
    (options?.useLocalDataSource !== false ? HUB_LOCAL_DATA_SOURCE : undefined);
  if (options?.seriesUID) {
    query.append('SeriesInstanceUIDs', options.seriesUID);
  }

  const modeRoute = resolveHubModeRoute(studyUIDs, options?.modeRoute);
  // OHIF ModeRoute selects the data source from the URL path (/viewer/hub-dicomweb),
  // not the legacy ?datasources= query param (worklist-only).
  const path = dataSource ? `/${modeRoute}/${dataSource}` : `/${modeRoute}`;
  const queryString = query.toString();
  hubNavigate(queryString ? `${path}?${queryString}` : path, { replace: true });
}
