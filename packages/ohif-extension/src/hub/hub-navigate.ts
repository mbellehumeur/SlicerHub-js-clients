import { history } from '@ohif/app';
import { HUB_LOCAL_DATA_SOURCE } from './constants';
import { resolveHubModeRoute } from './resolve-hub-mode-route';

function getRouterBasename(): string {
  const configBasename = (
    window as { config?: { routerBasename?: string } }
  ).config?.routerBasename;
  const publicUrl = process.env.PUBLIC_URL;
  const basename = configBasename || publicUrl || '/';
  return basename.endsWith('/') ? basename.slice(0, -1) : basename;
}

export type HubNavigateOptions = {
  replace?: boolean;
};

/**
 * Navigate to an OHIF route. Uses React Router when available; falls back to
 * a full page load when Cast connects before RouteWithErrorBoundary wires history.
 */
export function hubNavigate(to: string, options?: HubNavigateOptions): void {
  const route = to.startsWith('/') ? to : `/${to}`;

  const navigate = history?.navigate;
  if (typeof navigate === 'function') {
    navigate(route, options);
    return;
  }

  const basename = getRouterBasename();
  const target = `${basename}${route}`.replace(/\/{2,}/g, '/');
  if (options?.replace) {
    window.location.replace(target);
  } else {
    window.location.assign(target);
  }
}

export function navigateToCastEmptyViewer(options?: HubNavigateOptions): void {
  hubNavigate('/viewer', options);
}

export function navigateToCastViewer(
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
  // OHIF ModeRoute selects the data source from the URL path (/viewer/cast-dicomweb),
  // not the legacy ?datasources= query param (worklist-only).
  const path = dataSource ? `/${modeRoute}/${dataSource}` : `/${modeRoute}`;
  const queryString = query.toString();
  hubNavigate(queryString ? `${path}?${queryString}` : path);
}
