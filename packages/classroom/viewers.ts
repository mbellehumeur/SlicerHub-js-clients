/**
 * Open Hub viewers from the reporting client (same deep-link pattern as worklist).
 *
 * Button enablement is local (not in @slicer-hub/client). Worklist owns the
 * full presence-aware rules; reporting only launches IRA/Slim when hub-connected.
 * SlicerDesktop / SlicerMirror / OHIF / VolView stay non-openable here (presence or N/A).
 */
import { HUB_WORKLIST_WINDOW_NAME } from '@slicer-hub/client';
import {
  conferenceStringsFor,
  resolveStoredLocale,
} from '@slicer-hub/i18n';
import type { AppState } from './hub';
import {
  LOG_PREFIX,
  resolveViewerUrls,
  resolveWorklistUrl,
  type ViewerKind,
} from './config';

const TITLE_DISABLED = 'Subscribe to the hub first';
const TITLE_SLICER = '3D Slicer Image Display (connect from Slicer)';
const TITLE_HUB_MIRROR =
  'SlicerMirror requires a connected 3D Slicer Image Display';
const TITLE_VOLVIEW = 'VolView (not available from reporting)';
const TITLE_IRA = 'Open SlicerLive';
const TITLE_IRA_ONLINE = 'SlicerLive is connected on this topic';
const TITLE_IRA_OFFLINE = 'Open SlicerLive (no IRA responded on this topic)';
const TITLE_WORKLIST = 'Open SlicerWorklist';
const TITLE_WORKLIST_ONLINE = 'SlicerWorklist is connected on this topic';
const TITLE_WORKLIST_OFFLINE =
  'Open SlicerWorklist (no worklist responded on this topic)';

const WORKLIST_WINDOW_NAME = HUB_WORKLIST_WINDOW_NAME;
let worklistWindow: Window | null = null;
let iraWindow: Window | null = null;

function sessionToken(state: AppState): string {
  try {
    return String(state.client?.getConnectionState?.()?.token || '').trim();
  } catch {
    return '';
  }
}

function withSessionParams(url: URL, state: AppState): void {
  if (state.topic) url.searchParams.set('topic', state.topic);
  const token = sessionToken(state);
  if (token) url.searchParams.set('id-token', token);
}

function popupFeatures(width: number, height: number): string {
  const left = Math.max(0, Math.floor((window.screen.width - width) / 2));
  const top = Math.max(0, Math.floor((window.screen.height - height) / 2));
  return [
    'popup',
    `width=${width}`,
    `height=${height}`,
    `left=${left}`,
    `top=${top}`,
  ].join(',');
}

/** Same name as worklist’s IRA opener so both apps share one tab. */
function iraWindowName(state: AppState): string {
  return `hubViewer-ira-${String(state.topic || 'anon').replace(/[^\w.-]+/g, '_')}`;
}

function openerHasName(expected: string): Window | null {
  const opener = window.opener;
  if (!opener || opener.closed) return null;
  let name = '';
  try {
    name = String(opener.name || '');
  } catch {
    return null;
  }
  return name === expected ? opener : null;
}

function focusHeldWindow(held: Window | null): boolean {
  if (!held || held.closed) return false;
  try {
    held.focus();
  } catch {
    /* ignore */
  }
  return true;
}

function focusExistingWorklistWindow(): boolean {
  if (focusHeldWindow(worklistWindow)) return true;
  worklistWindow = null;
  const opener = openerHasName(WORKLIST_WINDOW_NAME);
  if (!opener) return false;
  worklistWindow = opener;
  return focusHeldWindow(opener);
}

function focusExistingIraWindow(state: AppState): boolean {
  if (focusHeldWindow(iraWindow)) return true;
  iraWindow = null;
  const opener = openerHasName(iraWindowName(state));
  if (!opener) return false;
  iraWindow = opener;
  return focusHeldWindow(opener);
}

export function openHubViewer(state: AppState, kind: ViewerKind): void {
  if (state.connection !== 'connected') {
    console.warn(`${LOG_PREFIX} open viewer skipped: not connected`);
    return;
  }
  if (kind === 'ira') {
    if (focusExistingIraWindow(state)) return;
    const url = new URL(resolveViewerUrls().ira);
    withSessionParams(url, state);
    // Named tab open focuses existing IRA (opened by worklist) or creates one.
    const win = window.open(url.toString(), iraWindowName(state));
    if (win) iraWindow = win;
    return;
  }
  const url = new URL(resolveViewerUrls()[kind]);
  withSessionParams(url, state);
  const size = { width: 800, height: 600 };
  const name = `hubViewer-${kind}`;
  window.open(url.toString(), name, popupFeatures(size.width, size.height));
}

/** Open or focus the worklist client with the current session topic/token. */
export function openWorklist(state: AppState): void {
  if (state.connection !== 'connected') {
    console.warn(`${LOG_PREFIX} open worklist skipped: not connected`);
    return;
  }
  if (focusExistingWorklistWindow()) return;

  const url = new URL(resolveWorklistUrl());
  withSessionParams(url, state);
  const win = window.open(url.toString(), WORKLIST_WINDOW_NAME);
  if (win) worklistWindow = win;
}

function setDisabled(
  btn: HTMLButtonElement,
  disabled: boolean,
  title: string
): void {
  btn.disabled = disabled;
  if (disabled) btn.setAttribute('disabled', '');
  else btn.removeAttribute('disabled');
  btn.title = title;
}

/**
 * Hub-connected → enable SlicerLive + Slim + Worklist.
 * SlicerMirror stays disabled (worklist enables it only when 3D Slicer ID is present;
 * reporting does not track connectedApps presence).
 * Presence highlights: IRA / worklist from STATUS probe.
 */
export function updateViewerPresenceButtons(state: AppState): void {
  const hubOn = state.connection === 'connected';

  const ira = document.getElementById(
    'openIraBtn'
  ) as HTMLButtonElement | null;
  if (ira) {
    const online = Boolean(state.iraOnline);
    ira.classList.toggle(
      'rp-viewer-btn-connected',
      hubOn && online && !ira.disabled
    );
    if (!ira.disabled) {
      ira.title = online ? TITLE_IRA_ONLINE : TITLE_IRA_OFFLINE;
    }
  }

  const worklist = document.getElementById(
    'openWorklistBtn'
  ) as HTMLButtonElement | null;
  if (worklist) {
    const online = Boolean(state.worklistOnline);
    worklist.classList.toggle(
      'rp-viewer-btn-connected',
      hubOn && online && !worklist.disabled
    );
    if (!worklist.disabled) {
      worklist.title = online ? TITLE_WORKLIST_ONLINE : TITLE_WORKLIST_OFFLINE;
    }
  }
}

/** @deprecated Prefer {@link updateViewerPresenceButtons} */
export function updateWorklistViewerButton(state: AppState): void {
  updateViewerPresenceButtons(state);
}

export function setViewerButtonsEnabled(
  enabled: boolean,
  state?: AppState
): void {
  const byId = (id: string) =>
    document.getElementById(id) as HTMLButtonElement | null;

  const slicer = byId('openSlicerBtn');
  if (slicer) setDisabled(slicer, true, enabled ? TITLE_SLICER : TITLE_DISABLED);

  const hubMirror = byId('openHubMirrorBtn');
  if (hubMirror) {
    setDisabled(hubMirror, true, enabled ? TITLE_HUB_MIRROR : TITLE_DISABLED);
  }

  const ira = byId('openIraBtn');
  if (ira) {
    setDisabled(ira, !enabled, enabled ? TITLE_IRA : TITLE_DISABLED);
  }

  const ohif = byId('openOhifBtn');
  if (ohif) {
    setDisabled(
      ohif,
      true,
      enabled ? 'OHIF viewer is temporarily unavailable' : TITLE_DISABLED
    );
    ohif.classList.toggle('rp-viewer-btn-inert', enabled);
  }

  const slim = byId('openSlimBtn');
  if (slim) {
    setDisabled(slim, !enabled, enabled ? 'Open Slim' : TITLE_DISABLED);
  }

  const volview = byId('openVolviewBtn');
  if (volview) {
    setDisabled(volview, true, enabled ? TITLE_VOLVIEW : TITLE_DISABLED);
  }

  const worklist = byId('openWorklistBtn');
  if (worklist) {
    setDisabled(worklist, !enabled, enabled ? TITLE_WORKLIST : TITLE_DISABLED);
  }

  if (state) updateViewerPresenceButtons(state);

  for (const id of ['startConferenceBtn', 'endConferenceBtn'] as const) {
    const btn = byId(id);
    if (!btn) continue;
    // Visibility follows conference state; only toggle enabled here.
    btn.disabled = !enabled || btn.hidden;
    if (enabled && !btn.hidden) {
      btn.removeAttribute('disabled');
      btn.title =
        id === 'startConferenceBtn'
          ? conferenceStringsFor(resolveStoredLocale()).conferencing
          : btn.title;
    } else if (!enabled) {
      btn.title = TITLE_DISABLED;
    }
  }
}

export function wireViewerButtons(state: AppState): void {
  const map: Array<{ id: string; open: () => void }> = [
    { id: 'openIraBtn', open: () => openHubViewer(state, 'ira') },
    { id: 'openSlimBtn', open: () => openHubViewer(state, 'slim') },
    { id: 'openWorklistBtn', open: () => openWorklist(state) },
  ];
  for (const { id, open } of map) {
    document.getElementById(id)?.addEventListener('click', () => open());
  }
  setViewerButtonsEnabled(state.connection === 'connected', state);
}
