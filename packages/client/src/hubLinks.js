export function httpUrlFromHubEndpoint(hubEndpoint) {
  const trimmed = String(hubEndpoint ?? '').trim();
  if (!trimmed) {
    return null;
  }
  try {
    const url = new URL(trimmed);
    if (url.protocol === 'ws:') {
      url.protocol = 'http:';
    } else if (url.protocol === 'wss:') {
      url.protocol = 'https:';
    }
    return url;
  } catch {
    return null;
  }
}

export function resolveHubAdminUrl(hubEndpoint) {
  const url = httpUrlFromHubEndpoint(hubEndpoint);
  if (!url) {
    return '';
  }
  const hubBase = url.href.endsWith('/') ? url.href : `${url.href}/`;
  return new URL('admin', hubBase).href;
}

export function resolveHubConferenceClientUrl(hubEndpoint, opts = {}) {
  const url = httpUrlFromHubEndpoint(hubEndpoint);
  if (!url) {
    return '';
  }
  const conferenceUrl = new URL('/api/hub/conference-client', url.origin);
  const subscriberName = opts.subscriberName?.trim();
  const topic = opts.topic?.trim();
  const theme = opts.theme?.trim() || 'volview';
  const mode = opts.mode?.trim().toLowerCase() === 'light' ? 'light' : 'dark';
  if (subscriberName) {
    conferenceUrl.searchParams.set('subscriberName', subscriberName);
  }
  if (topic) {
    conferenceUrl.searchParams.set('topic', topic);
  }
  conferenceUrl.searchParams.set('theme', theme);
  conferenceUrl.searchParams.set('mode', mode);
  return conferenceUrl.href;
}

export const HUB_CONFERENCE_POPUP_SIZE = { width: 336, height: 288 };

/** Named window reused by worklist and IRA DICOM SR buttons. */
export const HUB_REPORTING_WINDOW_NAME = 'hubViewer-reporting';

/** Named window for the Classroom SPA (worklist ST-444 button). */
export const HUB_CLASSROOM_WINDOW_NAME = 'hubViewer-classroom';

/** Named window for the Worklist SPA (focus/reclaim from IRA and reporting). */
export const HUB_WORKLIST_WINDOW_NAME = 'hubViewer-worklist';

/**
 * @typedef {{ left?: number, top?: number, width?: number, height?: number }} HubPopupOpenerBounds
 * @typedef {{ width: number, height: number, left: number, top: number }} HubPopupPlacement
 */

/**
 * DICOM SR popup size + position: to the right of the opener with 10% width overlap.
 * Shared by worklist and IRA — change size/placement here only.
 *
 * @param {HubPopupOpenerBounds | null} [openerBounds]
 *   Optional explicit opener bounds. Defaults to the current window's screen position.
 * @returns {HubPopupPlacement}
 */
export function castReportingPopupPlacement(openerBounds = null) {
  const screen =
    typeof globalThis !== 'undefined' ? globalThis.screen : null;
  const win =
    typeof globalThis !== 'undefined' && globalThis.window
      ? globalThis.window
      : null;
  const availLeft = Number(screen?.availLeft) || 0;
  const availTop = Number(screen?.availTop) || 0;
  const availW = screen?.availWidth || screen?.width || 1200;
  const availH = screen?.availHeight || screen?.height || 800;
  const openerLeft =
    openerBounds?.left ?? win?.screenX ?? win?.screenLeft ?? 0;
  const openerTop =
    openerBounds?.top ?? win?.screenY ?? win?.screenTop ?? 0;
  const openerW = Math.max(
    1,
    Number(
      openerBounds?.width ??
        win?.outerWidth ??
        Math.floor(availW * 0.5)
    ) || Math.floor(availW * 0.5)
  );

  const width = Math.min(756, Math.max(600, Math.floor(availW * 0.444)));
  const height = Math.min(784, Math.max(624, Math.floor(availH * 0.688)));
  // Sit to the right of opener; overlap 10% of opener width.
  const overlapX = Math.max(0, Math.floor(openerW * 0.1));
  let left = openerLeft + openerW - overlapX;
  let top = openerTop;
  if (left + width > availLeft + availW) {
    left = Math.max(availLeft, availLeft + availW - width);
  }
  if (top + height > availTop + availH) {
    top = Math.max(availTop, availTop + availH - height);
  }
  left = Math.max(availLeft, Math.min(left, availLeft + availW - width));
  top = Math.max(availTop, Math.min(top, availTop + availH - height));
  return {
    width,
    height,
    left: Math.floor(left),
    top: Math.floor(top),
  };
}

/**
 * @param {HubPopupPlacement} place
 * @returns {string}
 */
export function hubReportingPopupFeatures(place) {
  return [
    'popup',
    `width=${place.width}`,
    `height=${place.height}`,
    `left=${place.left}`,
    `top=${place.top}`,
  ].join(',');
}

/**
 * Best-effort resize/move after open (browser policy may block).
 * @param {Window | null | undefined} win
 * @param {HubPopupPlacement} place
 */
export function placeHubPopupWindow(win, place) {
  if (!win || !place) return;
  try {
    win.resizeTo(place.width, place.height);
    win.moveTo(place.left, place.top);
    win.focus();
  } catch {
    /* Cross-origin or browser policy may block move/resize. */
  }
}

export function openCastHubPopup(
  url,
  windowName,
  size = { width: 800, height: 600 }
) {
  if (!url || typeof window === 'undefined') {
    return;
  }
  const popupWidth = size.width;
  const popupHeight = size.height;
  const left = Math.max(0, Math.floor((window.screen.width - popupWidth) / 2));
  const top = Math.max(0, Math.floor((window.screen.height - popupHeight) / 2));
  const features = [
    'popup',
    `width=${popupWidth}`,
    `height=${popupHeight}`,
    `left=${left}`,
    `top=${top}`,
    'noopener',
    'noreferrer',
  ].join(',');
  window.open(url, windowName, features);
}
