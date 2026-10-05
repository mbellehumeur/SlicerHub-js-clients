import {
  castRadioStatusVisual,
  applyCastConferenceHeaderActions,
  renderCastConferencePresence,
} from '@slicer-hub/client';
import type { AppState } from './hub';
import {
  handleWorklistRowAction,
  hubEndpoint,
  shouldShowOpenStartHint,
} from './hub';
import { conferenceStrings, t } from './i18n';
import {
  filterWorklistStudies,
  isSampleInMyWorklist,
  isWorklistSampleActionDisabled,
  worklistSampleActionDisabledReason,
  worklistSampleFormatLabel,
  worklistSampleModalitiesLabel,
  type WorklistSample,
} from './samples';

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export type SizeSortDir = 'asc' | 'desc';

/** Worklist Size column sort; default smallest first. */
let sizeSortDir: SizeSortDir = 'asc';

export function getSizeSortDir(): SizeSortDir {
  return sizeSortDir;
}

export function toggleSizeSortDir(): SizeSortDir {
  sizeSortDir = sizeSortDir === 'asc' ? 'desc' : 'asc';
  return sizeSortDir;
}

/** Prefer numeric sizeMB; else parse labels like "~60 MB". Unknowns sort last. */
export function sampleSizeMbSortKey(sample: WorklistSample): [number, number] {
  const fromSeg = Number(sample.segroulette?.sizeMB);
  if (Number.isFinite(fromSeg)) return [0, fromSeg];
  const raw = String(sample.size || '').replace(/~/g, '').trim();
  const m = raw.match(/([\d.]+)/);
  if (m) {
    const n = Number(m[1]);
    if (Number.isFinite(n)) return [0, n];
  }
  return [1, 0];
}

function sortStudiesBySize(
  studies: WorklistSample[],
  dir: SizeSortDir
): WorklistSample[] {
  const sign = dir === 'asc' ? 1 : -1;
  return studies.slice().sort((a, b) => {
    const [af, av] = sampleSizeMbSortKey(a);
    const [bf, bv] = sampleSizeMbSortKey(b);
    if (af !== bf) return (af - bf) * sign;
    if (av !== bv) return (av - bv) * sign;
    return String(a.name || a.id).localeCompare(String(b.name || b.id));
  });
}

/** Sync Size header aria-sort + indicator with current dir. */
export function syncSizeSortHeader(): void {
  const th = document.getElementById('worklistSizeSortTh');
  const ind = th?.querySelector('.wl-th-sort-ind');
  if (!th) return;
  const asc = sizeSortDir === 'asc';
  th.setAttribute('aria-sort', asc ? 'ascending' : 'descending');
  if (ind) ind.textContent = asc ? '▲' : '▼';
}

const WL_DOWNLOAD_ICON_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M8 1.5a.75.75 0 0 1 .75.75v6.19l2.22-2.22a.75.75 0 1 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 0 1 1.06-1.06l2.22 2.22V2.25A.75.75 0 0 1 8 1.5ZM2.75 12a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5H2.75Z"/>
</svg>`;

const WL_ADD_ICON_SVG = `<svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
  <path fill="currentColor" d="M8 2.5a.75.75 0 0 1 .75.75v4h4a.75.75 0 0 1 0 1.5h-4v4a.75.75 0 0 1-1.5 0v-4h-4a.75.75 0 0 1 0-1.5h4v-4A.75.75 0 0 1 8 2.5Z"/>
</svg>`;

export type WorklistStyleActionHandlers = {
  onOpen: () => void;
  onAdd: () => void;
  canOpen?: boolean;
  openDisabledTitle?: string;
  /** Plus button: idle | adding | added */
  addState?: 'idle' | 'adding' | 'added';
  canAdd?: boolean;
  addDisabledTitle?: string;
};

/** Same download / plus / Open chrome as the main worklist table rows. */
export function createWorklistStyleActions(
  handlers: WorklistStyleActionHandlers
): HTMLElement {
  const inner = document.createElement('div');
  inner.className = 'wl-row-actions-inner';

  const downloadBtn = document.createElement('button');
  downloadBtn.type = 'button';
  downloadBtn.className = 'wl-icon-btn wl-row-icon-btn';
  downloadBtn.title = 'Download';
  downloadBtn.setAttribute('aria-label', 'Download');
  downloadBtn.innerHTML = WL_DOWNLOAD_ICON_SVG;

  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'wl-icon-btn wl-row-icon-btn';
  addBtn.innerHTML = WL_ADD_ICON_SVG;
  const addState = handlers.addState || 'idle';
  const canAdd = handlers.canAdd !== false;
  if (addState === 'added') {
    addBtn.disabled = true;
    addBtn.title = 'Added to worklist';
    addBtn.setAttribute('aria-label', 'Added to worklist');
  } else if (addState === 'adding') {
    addBtn.disabled = true;
    addBtn.title = 'Adding…';
    addBtn.setAttribute('aria-label', 'Adding…');
  } else if (!canAdd) {
    addBtn.disabled = true;
    addBtn.title = handlers.addDisabledTitle || 'Cannot add';
    addBtn.setAttribute('aria-label', handlers.addDisabledTitle || 'Cannot add');
  } else {
    addBtn.title = 'Add to My Worklist';
    addBtn.setAttribute('aria-label', 'Add to My Worklist');
    addBtn.addEventListener('click', () => handlers.onAdd());
  }

  const openBtn = document.createElement('button');
  openBtn.type = 'button';
  openBtn.className = 'wl-open-btn';
  openBtn.textContent = t('chrome:open');
  if (handlers.canOpen === false) {
    openBtn.disabled = true;
    openBtn.title = handlers.openDisabledTitle || t('chrome:cannotOpen');
  } else {
    openBtn.title = t('chrome:openStudy');
    openBtn.addEventListener('click', () => handlers.onOpen());
  }

  inner.append(downloadBtn, addBtn, openBtn);
  return inner;
}

export function renderWorklistTable(
  tableBody: HTMLElement,
  emptyRow: HTMLElement,
  state: AppState,
  organization: string
): void {
  const studies = sortStudiesBySize(
    filterWorklistStudies(state.allStudies, organization),
    sizeSortDir
  );
  tableBody.replaceChildren();
  renderWorklistContext(state);
  syncSizeSortHeader();

  if (!studies.length) {
    emptyRow.hidden = false;
    return;
  }
  emptyRow.hidden = true;

  // Soft glow on the first Openable row until Open or worklist change.
  const showStartHint = shouldShowOpenStartHint(state);
  let startHintAssigned = false;
  for (const sample of studies) {
    const row = buildWorklistRow(sample, state);
    if (showStartHint && !startHintAssigned) {
      const btn = row.querySelector('.wl-open-btn') as HTMLButtonElement | null;
      if (btn && !btn.disabled && !btn.classList.contains('is-close')) {
        btn.classList.add('wl-open-btn-start-hint');
        startHintAssigned = true;
      }
    }
    tableBody.append(row);
  }
}

/** Label for the open study: worklist row title (e.g. "KiTS · c4kc kits · KiTS-00061"), else FHIR description. */
function imagingStudyOpenDescription(state: AppState): string {
  if (state.openWorklistSampleId) {
    const sample = state.allStudies.find(
      (s) => s.id === state.openWorklistSampleId
    );
    const name = String(sample?.name || '').trim();
    if (name) return name;
    const description = String(sample?.description || '').trim();
    if (description) return description;
  }
  const ctx = state.lastImagingStudyOpenContext;
  if (Array.isArray(ctx)) {
    for (const item of ctx) {
      if (!item || typeof item !== 'object') continue;
      const row = item as { key?: unknown; resource?: Record<string, unknown> };
      const key = String(row.key || '');
      if (key !== 'study' && key !== 'scene') continue;
      const description = String(row.resource?.description ?? '').trim();
      if (description) return description;
    }
  }
  return '';
}

/** Open ImagingStudy context capsule beside Conferencing. */
export function renderWorklistContext(state: AppState): void {
  const el = document.getElementById('worklistContext');
  if (!el) return;
  const capsule = el.closest('.wl-capsule');
  const open = state.lastImagingStudyOpenContext.length > 0;
  const description = open ? imagingStudyOpenDescription(state) : '';
  const hasContext = Boolean(open && description);
  capsule?.classList.toggle('is-open', hasContext);
  el.replaceChildren();
  const label = document.createElement('span');
  label.className = 'wl-context-label';
  label.textContent = t('chrome:currentContext');
  const value = document.createElement('span');
  value.className = 'wl-context-value';
  value.textContent = hasContext ? description : t('chrome:none');
  el.append(label, ' ', value);

  const closeBtn = document.getElementById(
    'closeContextBtn'
  ) as HTMLButtonElement | null;
  if (closeBtn) {
    closeBtn.hidden = !hasContext;
    closeBtn.disabled = !hasContext;
  }
}

function buildWorklistRow(
  sample: WorklistSample,
  state: AppState
): HTMLTableRowElement {
  const tr = document.createElement('tr');
  tr.dataset.worklistSampleId = sample.id;
  const isOpen =
    Boolean(state.lastImagingStudyOpenContext.length) &&
    state.openWorklistSampleId === sample.id;
  tr.classList.toggle('is-open', isOpen);

  const disabled = isWorklistSampleActionDisabled(sample);
  const disabledReason = worklistSampleActionDisabledReason(sample);
  const format = worklistSampleFormatLabel(sample);
  const size = sample.size || '—';
  const modalities = worklistSampleModalitiesLabel(sample);
  const alreadyInMine = isSampleInMyWorklist(state.allStudies, sample);

  tr.innerHTML = `
    <td>
      <div class="wl-study-name">${escapeHtml(sample.name || sample.id)}</div>
      <div class="wl-study-desc">${escapeHtml(sample.description || '')}</div>
    </td>
    <td class="wl-muted">${escapeHtml(modalities)}</td>
    <td class="wl-muted">${escapeHtml(format)}</td>
    <td class="wl-muted">${escapeHtml(size)}</td>
    <td class="wl-row-actions">
      <div class="wl-row-actions-inner">
      <button
        type="button"
        class="wl-icon-btn wl-row-icon-btn"
        data-worklist-action="download"
        data-sample-id="${escapeHtml(sample.id)}"
        title="Download"
        aria-label="Download"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path
            fill="currentColor"
            d="M8 1.5a.75.75 0 0 1 .75.75v6.19l2.22-2.22a.75.75 0 1 1 1.06 1.06l-3.5 3.5a.75.75 0 0 1-1.06 0l-3.5-3.5a.75.75 0 0 1 1.06-1.06l2.22 2.22V2.25A.75.75 0 0 1 8 1.5ZM2.75 12a.75.75 0 0 0 0 1.5h10.5a.75.75 0 0 0 0-1.5H2.75Z"
          />
        </svg>
      </button>
      <button
        type="button"
        class="wl-icon-btn wl-row-icon-btn"
        data-worklist-action="add-to-mine"
        data-sample-id="${escapeHtml(sample.id)}"
        title="${alreadyInMine ? 'Already in My Worklist' : 'Add to My Worklist'}"
        aria-label="${alreadyInMine ? 'Already in My Worklist' : 'Add to My Worklist'}"
        ${alreadyInMine ? 'disabled' : ''}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true" focusable="false">
          <path
            fill="currentColor"
            d="M8 2.5a.75.75 0 0 1 .75.75v4h4a.75.75 0 0 1 0 1.5h-4v4a.75.75 0 0 1-1.5 0v-4h-4a.75.75 0 0 1 0-1.5h4v-4A.75.75 0 0 1 8 2.5Z"
          />
        </svg>
      </button>
      <button type="button" class="wl-open-btn" data-sample-id="${escapeHtml(
        sample.id
      )}"></button>
      </div>
    </td>
  `;

  const addBtn = tr.querySelector(
    '[data-worklist-action="add-to-mine"]'
  ) as HTMLButtonElement | null;
  if (addBtn && !alreadyInMine) {
    addBtn.addEventListener('click', () => {
      handleWorklistRowAction(state, sample.id, 'add-to-mine');
    });
  }

  const btn = tr.querySelector('.wl-open-btn') as HTMLButtonElement;
  if (disabled) {
    btn.disabled = true;
    btn.textContent = t('chrome:open');
    btn.title = disabledReason || t('chrome:cannotOpen');
  } else if (isOpen) {
    btn.disabled = false;
    btn.textContent = t('chrome:close');
    btn.classList.add('is-close');
    btn.dataset.worklistAction = 'close';
    btn.title = t('chrome:closeStudy');
  } else {
    btn.disabled = false;
    btn.textContent = t('chrome:open');
    btn.classList.remove('is-close');
    btn.dataset.worklistAction = 'open';
    btn.title = t('chrome:openStudy');
  }

  btn.addEventListener('click', () => {
    handleWorklistRowAction(
      state,
      sample.id,
      btn.dataset.worklistAction || 'open'
    );
  });

  return tr;
}

/** Topic / session control lives in the Conferencing dialog (not the header). */
let sessionStatusControl: HTMLElement | null = null;
let sessionStatusLabel: HTMLElement | null = null;

export function setSessionStatusControl(control: {
  button: HTMLElement | null;
  label: HTMLElement | null;
}): void {
  sessionStatusControl = control.button;
  sessionStatusLabel = control.label;
}

export function updateConnectionStatusUi(
  statusWrap: HTMLElement | null,
  state: AppState
): void {
  const wrap = sessionStatusLabel || statusWrap;
  if (!wrap) {
    renderConferenceRoster(state);
    return;
  }
  const visual = castRadioStatusVisual(state.connection, {
    conferenceActive: Boolean(state.conference),
  });
  wrap.classList.remove(
    'wl-status-idle',
    'wl-status-connecting',
    'wl-status-connected',
    'wl-status-disconnected',
    'wl-status-error',
    'wl-status-pulse'
  );
  wrap.classList.add(`wl-status-${visual.tone}`);
  wrap.classList.toggle('wl-status-pulse', visual.pulse);
  const label = String(state.topic || '').trim() || '—';
  wrap.textContent = label;
  const tip = state.conference?.title
    ? `${state.connectionDetail} · ${state.conference.title}`
    : state.connectionDetail;
  wrap.title = tip;
  const btn = sessionStatusControl || wrap.closest('button');
  if (btn) {
    if (state.conference?.places?.length) {
      btn.title = tip ? `Participants — ${tip}` : 'Participants';
      btn.setAttribute('aria-label', `Participants (${label})`);
    } else {
      btn.title = tip ? `Session info — ${tip}` : 'Session info';
      btn.setAttribute('aria-label', `Session info (${label})`);
    }
  }

  renderConferenceRoster(state);
}

/** Show conference Start/Leave and follow actions when a session is active. */
export function renderConferenceRoster(state: AppState): void {
  const statusControl = sessionStatusControl;
  const statusLabelEl = sessionStatusLabel;
  const startBtn = document.getElementById(
    'startConferenceBtn'
  ) as HTMLButtonElement | null;
  const endBtn = document.getElementById(
    'endConferenceBtn'
  ) as HTMLButtonElement | null;
  const stopFollowBtn = document.getElementById(
    'stopFollowingBtn'
  ) as HTMLButtonElement | null;
  const resumeFollowBtn = document.getElementById(
    'resumeFollowingBtn'
  ) as HTMLButtonElement | null;
  const takeOverBtn = document.getElementById(
    'takeOverConferenceBtn'
  ) as HTMLButtonElement | null;
  if (!startBtn && !endBtn && !statusControl) return;

  const view = state.conference;
  const connected = state.connection === 'connected';
  const followHost = Boolean(state.conferenceFollowHost);

  if (statusControl instanceof HTMLElement) {
    renderCastConferencePresence({
      view,
      statusControl,
      statusLabelEl,
      classPrefix: 'wl-conference',
      selfStatusMode: 'short',
      followHost,
    });
  }

  applyCastConferenceHeaderActions({
    view,
    followHost,
    connected,
    strings: conferenceStrings(),
    startBtn,
    endBtn,
    stopFollowBtn,
    resumeFollowBtn,
    takeOverBtn,
  });
}

export function fillSessionInfo(dl: HTMLElement, state: AppState): void {
  const hub = state.hubKey;
  const endpoint =
    state.client?.getHubConfig?.()?.hub_endpoint || hubEndpoint(state);
  const rows: Array<[string, string]> = [
    ['Hub', hub],
    ['Endpoint', endpoint || '—'],
    ['Subscriber', state.subscriberName || '—'],
    ['Status', state.connectionDetail],
  ];
  const openUserBtn = document.getElementById(
    'openConferenceTestWorklistBtn'
  ) as HTMLButtonElement | null;
  // Keep the button after the dl (not inside it) so replaceChildren is safe.
  if (openUserBtn) {
    if (openUserBtn.parentElement === dl) {
      dl.after(openUserBtn);
    } else if (openUserBtn.previousElementSibling !== dl) {
      dl.after(openUserBtn);
    }
    openUserBtn.hidden = false;
  }
  dl.replaceChildren();
  for (const [key, value] of rows) {
    const dt = document.createElement('dt');
    dt.textContent = key;
    const dd = document.createElement('dd');
    dd.textContent = value;
    dl.append(dt, dd);
  }
}

export function closeMenus(...menus: HTMLElement[]): void {
  for (const menu of menus) {
    menu.hidden = true;
  }
}
