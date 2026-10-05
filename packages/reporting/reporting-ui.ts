import {
  castRadioStatusVisual,
  applyCastConferenceHeaderActions,
  renderCastConferencePresence,
} from '@slicer-hub/client';
import {
  conferenceStringsFor,
  ensureSegmentLabelsTranslated,
  reportingChromeFor,
  resolveStoredLocale,
  segmentDisplayNameSync,
} from '@slicer-hub/i18n';
import type { AppState, StudyInfo } from './hub';
import { hubEndpoint } from './hub';
import { hubOriginFromEndpoint } from './config';
import type { ReportMeasurement, SegCatalog, SegCatalogSegment } from './seg-catalog';
import { enrichTerminologyFromSegdb } from './segdb-lookup';
import { openVrPresetMenu } from './vr-preset-menu';
import {
  paintVrPresetThumbnail,
  VR_PRESET_DEFAULT,
  VR_PRESET_OPTIONS,
  vrPresetLabel,
} from './vr-presets';

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Format a volume stored in mm³ as cubic centimeters (cc = cm³). */
function formatVolumeFromMm3(value: number | string): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return String(value);
  const cc = value / 1000;
  if (Math.abs(cc) >= 100) return cc.toFixed(1);
  if (Math.abs(cc) >= 1) return cc.toFixed(2);
  if (Math.abs(cc) >= 0.01) return cc.toFixed(3);
  return cc.toPrecision(3);
}

function formatVolumeAlreadyCc(value: number | string): string {
  if (typeof value !== 'number' || !Number.isFinite(value)) return String(value);
  if (Math.abs(value) >= 100) return value.toFixed(1);
  if (Math.abs(value) >= 1) return value.toFixed(2);
  if (Math.abs(value) >= 0.01) return value.toFixed(3);
  return value.toPrecision(3);
}

/** Display volume + units as cc; converts mm³ when needed. */
function volumeDisplay(
  value: number | string,
  units?: string
): { text: string; units: string } {
  const u = String(units || '').trim().toLowerCase();
  const isCc =
    u === 'cc' ||
    u === 'cm3' ||
    u === 'cm³' ||
    u.includes('cubic centimeter');
  if (isCc) {
    return { text: formatVolumeAlreadyCc(value), units: 'cc' };
  }
  // Catalog / STATUS volumes are mm³; treat blank or mm³-like as mm³.
  return { text: formatVolumeFromMm3(value), units: 'cc' };
}

function measurementVolumeDisplay(m: {
  quantity: string;
  value: number | string;
  units: string;
}): { text: string; units: string } {
  const u = String(m.units || '').trim().toLowerCase();
  const isVolumeQty = /^volume$/i.test(String(m.quantity || ''));
  const isMm3 =
    !u ||
    u === 'mm3' ||
    u === 'mm³' ||
    u.includes('cubic millimeter') ||
    u.includes('millimetre');
  const isCc =
    u === 'cc' ||
    u === 'cm3' ||
    u === 'cm³' ||
    u.includes('cubic centimeter');
  if (isVolumeQty || isMm3 || isCc) {
    return volumeDisplay(m.value, m.units);
  }
  return {
    text:
      typeof m.value === 'number' && Number.isFinite(m.value)
        ? String(m.value)
        : String(m.value ?? '—'),
    units: m.units || '—',
  };
}



function truncUid(uid: string, keep = 12): string {
  const s = String(uid || '').trim();
  if (!s) return '';
  if (s.length <= keep + 3) return s;
  return `${s.slice(0, keep)}…`;
}

/** Prefer study/scene resource.description from ImagingStudy-open (worklist parity). */
function imagingStudyContextDescription(ctx: unknown[]): string {
  if (!Array.isArray(ctx)) return '';
  for (const item of ctx) {
    if (!item || typeof item !== 'object') continue;
    const row = item as { key?: unknown; resource?: Record<string, unknown> };
    const key = String(row.key || '');
    if (key !== 'study' && key !== 'scene') continue;
    const description = String(row.resource?.description ?? '').trim();
    if (description) return description;
  }
  return '';
}

/** Short study context line (session / debug). Capsule uses context description. */
export function studyContextLabel(study: StudyInfo | null): {
  text: string;
  title: string;
} {
  if (!study) {
    return { text: 'none', title: '' };
  }
  const parts: string[] = [];
  if (study.sampleId) parts.push(study.sampleId);
  if (study.openMode) parts.push(study.openMode);
  if (study.studyUid) parts.push(`Study ${truncUid(study.studyUid)}`);
  if (study.seriesUid) parts.push(`Series ${truncUid(study.seriesUid)}`);
  if (!parts.length && study.fileCount) {
    parts.push(`${study.fileCount} file${study.fileCount === 1 ? '' : 's'}`);
  }
  const text = parts.length ? parts.join(' · ') : 'Study open';
  const title = [
    study.sampleId && `Sample: ${study.sampleId}`,
    study.openMode && `Mode: ${study.openMode}`,
    study.studyUid && `Study UID: ${study.studyUid}`,
    study.seriesUid && `Series UID: ${study.seriesUid}`,
    study.dicomwebRoot && `DICOMweb: ${study.dicomwebRoot}`,
  ]
    .filter(Boolean)
    .join('\n');
  return { text, title };
}

/** Worklist-style Current context: label + value. */
export function renderReportContext(state: AppState): void {
  const el = document.getElementById('reportContext');
  if (!el) return;
  const capsule = el.closest('.rp-capsule');
  const open = state.lastImagingStudyOpenContext.length > 0;
  const description = open
    ? imagingStudyContextDescription(state.lastImagingStudyOpenContext)
    : '';
  const hasContext = Boolean(open && description);
  capsule?.classList.toggle('is-open', hasContext);

  const rp = reportingChromeFor();
  el.replaceChildren();
  const label = document.createElement('span');
  label.className = 'rp-context-label';
  label.textContent = rp.currentContext;
  const value = document.createElement('span');
  value.className = 'rp-context-value';
  value.textContent = hasContext ? description : rp.none;
  value.title = description;
  el.append(label, ' ', value);

  const closeBtn = document.getElementById(
    'closeContextBtn'
  ) as HTMLButtonElement | null;
  if (closeBtn) {
    closeBtn.hidden = !hasContext;
    closeBtn.disabled = !hasContext;
  }
}

/** @deprecated Prefer {@link renderReportContext} */
export function updateReportTitle(el: HTMLElement, state: AppState): void {
  void el;
  renderReportContext(state);
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
    'rp-status-idle',
    'rp-status-connecting',
    'rp-status-connected',
    'rp-status-disconnected',
    'rp-status-error',
    'rp-status-pulse'
  );
  wrap.classList.add(`rp-status-${visual.tone}`);
  wrap.classList.toggle('rp-status-pulse', visual.pulse);
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

/** Show conference Start/Leave when a session is active. */
export function renderConferenceRoster(state: AppState): void {
  const statusControl = sessionStatusControl;
  const statusLabelEl = sessionStatusLabel;
  const startBtn = document.getElementById(
    'startConferenceBtn'
  ) as HTMLButtonElement | null;
  const endBtn = document.getElementById(
    'endConferenceBtn'
  ) as HTMLButtonElement | null;

  const view = state.conference;
  const connected = state.connection === 'connected';
  const followHost = Boolean(state.conferenceFollowHost);

  if (statusControl instanceof HTMLElement) {
    renderCastConferencePresence({
      view,
      statusControl,
      statusLabelEl,
      classPrefix: 'rp-conference',
      selfStatusMode: 'short',
      followHost,
    });
  }

  applyCastConferenceHeaderActions({
    view,
    followHost,
    connected,
    strings: conferenceStringsFor(resolveStoredLocale()),
    startBtn,
    endBtn,
  });
}

const REFRESH_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="M21 12a9 9 0 1 1-3.16-6.74" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
  <path d="M21 3v6h-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const EYE_ON_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" stroke="currentColor" stroke-width="1.7"/>
  <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.7"/>
</svg>`;

const EYE_OFF_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="M3 3l18 18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
  <path d="M10.6 10.6A3 3 0 0 0 12 15a3 3 0 0 0 2.4-1.2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
  <path d="M6.7 6.8C4.1 8.3 2.5 11 2.5 11S6 18 12 18c1.5 0 2.9-.3 4.1-.8M17.2 14.5c1.7-1.2 2.9-2.8 3.3-3.5 0 0-3.5-7-10-7-1 0-1.9.1-2.8.4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
</svg>`;

/** Tag / name-card motif for 3D segment label cards (not mesh visibility). */
const LABEL_CARD_ON_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H14l7 7-7 7H5.5A2.5 2.5 0 0 1 3 16.5v-9Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
  <circle cx="8" cy="12" r="1.4" fill="currentColor"/>
</svg>`;

const LABEL_CARD_OFF_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H14l7 7-7 7H5.5A2.5 2.5 0 0 1 3 16.5v-9Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
  <circle cx="8" cy="12" r="1.4" fill="currentColor"/>
  <path d="M3 3l18 18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
</svg>`;

const PLUS_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
</svg>`;

/** Cube + download arrow — same motif as IRA toolbar STL (3D print). */
const STL_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="M7 9l5-3 5 3v6l-5 3-5-3z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
  <path d="M7 9l5 3 5-3M12 12v6" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
  <path d="M18 3v4m0 0l-2-2m2 2l2-2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

const TRASH_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="M3 6h18" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
  <path d="M8 6V4h8v2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/>
</svg>`;

const CAMERA_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="M4 8h3l1.5-2h7L17 8h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z" stroke="currentColor" stroke-width="1.7" stroke-linejoin="round"/>
  <circle cx="12" cy="14" r="3.5" stroke="currentColor" stroke-width="1.7"/>
</svg>`;

const DOWNLOAD_ICON = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
  <path d="M12 3v11m0 0l-4-4m4 4l4-4" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;

function formatSnapshotTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso || '—';
  return d.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function snapshotsTableHtml(state: AppState): string {
  const rows = state.snapshots || [];
  const rp = reportingChromeFor();
  if (!rows.length) {
    return `<p class="rp-muted">${escapeHtml(rp.noSnapshots)}</p>`;
  }
  const body = rows
    .map((snap, i) => {
      const ready = snap.status === 'ready' && snap.dataBase64;
      const thumbSrc = snap.thumbBase64 || snap.dataBase64;
      const thumb = ready && thumbSrc
        ? `<button
            type="button"
            class="rp-snapshot-thumb-btn"
            data-view-snapshot="${escapeHtml(snap.id)}"
            title="View ${escapeHtml(snap.filename)}"
            aria-label="View ${escapeHtml(snap.filename)}"
          ><img
            class="rp-snapshot-thumb"
            src="data:image/png;base64,${thumbSrc}"
            alt=""
          /></button>`
        : `<span class="rp-snapshot-thumb-ph" aria-hidden="true">…</span>`;
      return `
        <tr class="rp-measure-row" data-snapshot-id="${escapeHtml(snap.id)}">
          <td class="rp-num">${i + 1}</td>
          <td class="rp-snapshot-thumb-cell">${thumb}</td>
          <td class="rp-mono">${escapeHtml(snap.filename)}</td>
          <td>${escapeHtml(formatSnapshotTime(snap.createdAt))}</td>
          <td class="rp-vis-cell">
            <button
              type="button"
              class="rp-eye-btn"
              data-download-snapshot="${escapeHtml(snap.id)}"
              title="Download ${escapeHtml(snap.filename)}"
              aria-label="Download ${escapeHtml(snap.filename)}"
              ${ready ? '' : 'disabled'}
            >${DOWNLOAD_ICON}</button>
            <button
              type="button"
              class="rp-eye-btn"
              data-delete-snapshot="${escapeHtml(snap.id)}"
              title="Delete ${escapeHtml(snap.filename)}"
              aria-label="Delete ${escapeHtml(snap.filename)}"
            >${TRASH_ICON}</button>
          </td>
        </tr>`;
    })
    .join('');
  return `
    <table class="rp-table">
      <thead>
        <tr>
          <th class="rp-num">${escapeHtml(rp.colNum)}</th>
          <th class="rp-snapshot-thumb-col">${escapeHtml(rp.colThumb)}</th>
          <th>${escapeHtml(rp.colFilename)}</th>
          <th>${escapeHtml(rp.colTime)}</th>
          <th class="rp-vis-col"></th>
        </tr>
      </thead>
      <tbody>${body}</tbody>
    </table>`;
}

function loadStatusHtml(state: AppState): string {
  const rp = reportingChromeFor();
  const detail =
    state.segLoadDetail?.trim() ||
    (state.connection === 'connected'
      ? rp.refreshFromImageDisplay
      : rp.notConnectedToHub);
  return `
    <div class="rp-load-status">
      <p class="rp-load-detail">${escapeHtml(detail)}</p>
      <button
        type="button"
        id="rpRefreshIdBtn"
        class="rp-refresh-btn"
        title="${escapeHtml(rp.refreshFromImageDisplay)}"
        aria-label="${escapeHtml(rp.refreshFromImageDisplay)}"
      >${REFRESH_ICON}</button>
    </div>
  `;
}

function volumesTableHtml(state: AppState): string {
  const shift = Math.round(Number(state.volumeShift) || 0);
  const shiftRange = Math.max(
    200,
    Math.round(Number(state.volumeShiftRange) || 500),
    Math.abs(shift)
  );
  const shiftLabel = (shift > 0 ? '+' : '') + String(shift);
  const volOff = state.volumeOpacity <= 0.02;
  const preset = String(state.volumePreset || '');
  const name = String(state.volumeName || '').trim() || 'Volume';
  const cropOn = Boolean(state.volumeCropEnabled);
  const boxOn = Boolean(state.volumeRoiVisible);
  const rp = reportingChromeFor();
  return `
    <table class="rp-table">
      <thead>
        <tr>
          <th>${escapeHtml(rp.colName)}</th>
          <th class="rp-switch-col">${escapeHtml(rp.colCrop)}</th>
          <th class="rp-switch-col">${escapeHtml(rp.colBox)}</th>
          <th>${escapeHtml(rp.colShift)}</th>
          <th>${escapeHtml(rp.colPreset)}</th>
          <th class="rp-opacity-col"></th>
          <th class="rp-vis-col"></th>
        </tr>
      </thead>
      <tbody>
        <tr class="rp-measure-row">
          <td>
            <span class="rp-volume-name" title="${escapeHtml(name)}">${escapeHtml(
              name
            )}</span>
          </td>
          <td class="rp-switch-cell">
            <button
              type="button"
              id="rpVolCropSwitch"
              class="rp-switch"
              role="switch"
              aria-checked="${cropOn ? 'true' : 'false'}"
              ${volOff ? 'disabled' : ''}
              title="Crop volume (3D)"
              aria-label="Crop volume"
            ><span class="rp-switch-thumb" aria-hidden="true"></span></button>
          </td>
          <td class="rp-switch-cell">
            <button
              type="button"
              id="rpVolRoiBoxSwitch"
              class="rp-switch"
              role="switch"
              aria-checked="${boxOn ? 'true' : 'false'}"
              ${volOff ? 'disabled' : ''}
              title="Show ROI box"
              aria-label="Show ROI box"
            ><span class="rp-switch-thumb" aria-hidden="true"></span></button>
          </td>
          <td class="rp-shift-cell">
            <input
              type="range"
              id="rpVolShiftSlider"
              class="rp-shift-slider"
              min="${-shiftRange}"
              max="${shiftRange}"
              step="${Math.max(1, Math.round(shiftRange / 200))}"
              value="${shift}"
              ${volOff ? 'disabled' : ''}
              aria-valuemin="${-shiftRange}"
              aria-valuemax="${shiftRange}"
              aria-valuenow="${shift}"
              aria-label="Volume shift"
              title="Volume-render shift (HU)"
            />
            <span id="rpVolShiftValue" class="rp-shift-value">${escapeHtml(
              shiftLabel
            )}</span>
          </td>
          <td>
            <button
              type="button"
              id="rpVolPresetBtn"
              class="rp-preset-btn"
              ${volOff ? 'disabled' : ''}
              aria-label="Volume-render preset"
              title="Volume-rendering transfer-function preset"
            >${escapeHtml(vrPresetLabel(preset))}</button>
          </td>
          <td class="rp-opacity-cell">
            <div
              id="rpVolOpacityChip"
              class="rp-opacity-chip"
              role="slider"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow="${Math.round(state.volumeOpacity * 100)}"
              aria-label="Volume opacity"
              title="Click: 100% → 50% → off · Drag sideways for a live opacity slider"
            ></div>
          </td>
          <td class="rp-vis-cell">
            <button
              type="button"
              id="rpVolVisBtn"
              class="rp-eye-btn"
              aria-pressed="${volOff ? 'false' : 'true'}"
              title="${volOff ? 'Show volume' : 'Hide volume'}"
              aria-label="${volOff ? 'Show volume' : 'Hide volume'}"
            >${volOff ? EYE_OFF_ICON : EYE_ON_ICON}</button>
          </td>
        </tr>
      </tbody>
    </table>
  `;
}

function formatSnomed(
  terminology: SegCatalogSegment['terminology'] | undefined,
  label?: string
): { text: string; title: string } {
  const filled = enrichTerminologyFromSegdb(label, terminology) || terminology;
  const coded = filled?.type || filled?.category || null;
  if (!coded?.value) {
    return { text: '—', title: '' };
  }
  const meaning = String(coded.meaning || '').trim();
  const scheme = String(coded.scheme || '').trim();
  const text = meaning ? `${coded.value} · ${meaning}` : String(coded.value);
  const title = [scheme && `Scheme: ${scheme}`, `Code: ${coded.value}`, meaning && `Meaning: ${meaning}`]
    .filter(Boolean)
    .join('\n');
  return { text, title };
}

/** Segmentations table: identity + visibility (QR Segment Editor analogue). */
function segmentationsTableHtml(
  catalog: SegCatalog,
  selectedSegNumber: number | null,
  selectedSegSop: string,
  segmentVisible: Record<number, boolean>,
  segmentOpacity: Record<number, number>,
  allVisible: boolean,
  labelsVisible: boolean,
  segOpacity: number
): string {
  const rows: string[] = [];

  for (const inst of catalog.segmentations) {
    for (const seg of inst.segments || []) {
      const num = Number(seg.number);
      const sop = String(inst.sopInstanceUID || '');
      const visible = segmentVisible[num] !== false;
      const rowOpacity = Math.max(
        0,
        Math.min(1, Number(segmentOpacity[num] ?? 1))
      );
      const swatch = `rgb(${Math.round((seg.color?.[0] ?? 1) * 255)}, ${Math.round(
        (seg.color?.[1] ?? 1) * 255
      )}, ${Math.round((seg.color?.[2] ?? 1) * 255)})`;
      const snomed = formatSnomed(seg.terminology, seg.label);
      const displayLabel = segmentDisplayNameSync(
        String(seg.label || ''),
        seg.terminology
      );
      const selected =
        selectedSegNumber != null &&
        Number(selectedSegNumber) === num &&
        (!selectedSegSop || !sop || selectedSegSop === sop)
          ? ' rp-row-selected'
          : '';
      rows.push(`
        <tr class="rp-measure-row${selected}" data-seg-number="${escapeHtml(
          num
        )}" data-seg-sop="${escapeHtml(sop)}" tabindex="0">
          <td><span class="rp-swatch" style="background:${swatch}"></span>${escapeHtml(
            seg.number
          )}</td>
          <td class="rp-label-cell">
            <span class="rp-seg-label" data-seg-label-en="${escapeHtml(
              seg.label || ''
            )}">${escapeHtml(displayLabel)}</span>
          </td>
          <td class="rp-mono" title="${escapeHtml(snomed.title)}">${escapeHtml(
            snomed.text
          )}</td>
          <td class="rp-num">${escapeHtml(seg.voxelCount)}</td>
          <td class="rp-vis-cell">
            <button
              type="button"
              class="rp-eye-btn"
              data-add-measurement
              data-seg-number="${escapeHtml(num)}"
              data-seg-sop="${escapeHtml(sop)}"
              title="Add measurement for segment"
              aria-label="Add measurement for segment ${escapeHtml(displayLabel || num)}"
            >${PLUS_ICON}</button>
            <button
              type="button"
              class="rp-eye-btn"
              data-seg-stl
              data-seg-number="${escapeHtml(num)}"
              data-seg-sop="${escapeHtml(sop)}"
              title="Save segment as STL for 3D printing"
              aria-label="Save segment ${escapeHtml(displayLabel || num)} as STL"
            >${STL_ICON}</button>
            <button
              type="button"
              class="rp-eye-btn"
              title="Delete segment"
              aria-label="Delete segment ${escapeHtml(displayLabel || num)}"
            >${TRASH_ICON}</button>
            <div
              class="rp-opacity-chip"
              data-seg-opacity="${escapeHtml(num)}"
              role="slider"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow="${Math.round(rowOpacity * 100)}"
              aria-label="Opacity for segment ${escapeHtml(displayLabel || num)}"
              title="Click: 100% → 50% → off · Drag sideways for a live opacity slider"
            ></div>
            <button
              type="button"
              class="rp-eye-btn"
              data-seg-vis="${escapeHtml(num)}"
              aria-pressed="${visible ? 'true' : 'false'}"
              title="${visible ? 'Hide segment' : 'Show segment'}"
              aria-label="${visible ? 'Hide' : 'Show'} segment ${escapeHtml(displayLabel || num)}"
            >${visible ? EYE_ON_ICON : EYE_OFF_ICON}</button>
          </td>
        </tr>
      `);
    }
  }

  const rp = reportingChromeFor();
  if (!rows.length) {
    return `<p class="rp-muted">${escapeHtml(rp.noSegmentations)}</p>`;
  }
  return `
    <table class="rp-table">
      <thead>
        <tr>
          <th>${escapeHtml(rp.colNum)}</th>
          <th class="rp-label-col">
            ${escapeHtml(rp.colLabel)}
            <button
              type="button"
              id="rpLabelsVisSwitch"
              class="rp-eye-btn"
              aria-pressed="${labelsVisible ? 'true' : 'false'}"
              title="${labelsVisible ? 'Hide 3D segment label cards' : 'Show 3D segment label cards'}"
              aria-label="${labelsVisible ? 'Hide 3D segment label cards' : 'Show 3D segment label cards'}"
            >${labelsVisible ? LABEL_CARD_ON_ICON : LABEL_CARD_OFF_ICON}</button>
          </th>
          <th>${escapeHtml(rp.colSnomed)}</th>
          <th class="rp-num">${escapeHtml(rp.colVoxels)}</th>
          <th class="rp-vis-col">
            <button
              type="button"
              class="rp-eye-btn"
              data-add-measurement
              title="Add measurement for selected segment"
              aria-label="Add measurement for selected segment"
            >${PLUS_ICON}</button>
            <button
              type="button"
              class="rp-eye-btn"
              data-seg-stl
              title="Save segment as STL for 3D printing"
              aria-label="Save segment as STL for 3D printing"
            >${STL_ICON}</button>
            <button
              type="button"
              class="rp-eye-btn"
              title="Delete segment"
              aria-label="Delete segment"
            >${TRASH_ICON}</button>
            <div
              id="rpSegOpacityChip"
              class="rp-opacity-chip"
              role="slider"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-valuenow="${Math.round(segOpacity * 100)}"
              aria-label="Segmentation opacity"
              title="Click: 100% → 50% → off · Drag sideways for a live opacity slider"
            ></div>
            <button
              type="button"
              id="rpSegAllVisBtn"
              class="rp-eye-btn"
              aria-pressed="${allVisible ? 'true' : 'false'}"
              title="${allVisible ? 'Hide all segmentations' : 'Show all segmentations'}"
              aria-label="${allVisible ? 'Hide all segmentations' : 'Show all segmentations'}"
            >${allVisible ? EYE_ON_ICON : EYE_OFF_ICON}</button>
          </th>
        </tr>
      </thead>
      <tbody>${rows.join('')}</tbody>
    </table>
  `;
}

/** TID1500-style Measurements table (in-memory). */
function measurementsTableHtml(
  measurements: ReportMeasurement[],
  selectedId: string | null
): string {
  const rp = reportingChromeFor();
  if (!measurements.length) {
    return `<p class="rp-muted">${escapeHtml(rp.noMeasurements)}</p>`;
  }
  const rows = measurements.map((m) => {
    const selected = m.id === selectedId ? ' rp-row-selected' : '';
    const segment =
      m.segmentNumber != null
        ? `${m.segmentLabel || m.trackingIdentifier || '—'} (#${m.segmentNumber})`
        : m.segmentLabel || m.trackingIdentifier || '—';
    const vol = measurementVolumeDisplay(m);
    return `
      <tr class="rp-measure-row${selected}" data-measurement-id="${escapeHtml(
        m.id
      )}" tabindex="0">
        <td>${escapeHtml(segment)}</td>
        <td>${escapeHtml(m.quantity || '—')}</td>
        <td class="rp-num">${escapeHtml(vol.text)}</td>
        <td>${escapeHtml(vol.units)}</td>
        <td class="rp-vis-cell">
          <button
            type="button"
            class="rp-eye-btn"
            data-remove-measurement="${escapeHtml(m.id)}"
            title="Remove measurement"
            aria-label="Remove measurement ${escapeHtml(m.quantity || m.id)}"
          >${TRASH_ICON}</button>
        </td>
      </tr>
    `;
  });
  return `
    <table class="rp-table">
      <thead>
        <tr>
          <th>${escapeHtml(rp.colSegment)}</th>
          <th>${escapeHtml(rp.colQuantity)}</th>
          <th class="rp-num">${escapeHtml(rp.colValue)}</th>
          <th>${escapeHtml(rp.colUnits)}</th>
          <th class="rp-vis-col"></th>
        </tr>
      </thead>
      <tbody>${rows.join('')}</tbody>
    </table>
  `;
}

function segsAllVisible(state: AppState): boolean {
  return !Object.values(state.segmentVisible).some((v) => v === false);
}

export function renderReportDisplay(container: HTMLElement, state: AppState): void {
  const allOn = segsAllVisible(state);
  const rp = reportingChromeFor();
  container.innerHTML = `
    <div class="rp-section">
      <div class="rp-section-head">
        <h2 class="rp-section-title">${escapeHtml(rp.snapshots)}</h2>
        <button
          type="button"
          id="rpAddSnapshotBtn"
          class="rp-eye-btn rp-section-title-btn"
          data-add-snapshot
          title="Capture snapshot from Image Display"
          aria-label="Capture snapshot"
        >${CAMERA_ICON}</button>
      </div>
      ${snapshotsTableHtml(state)}
    </div>
    <div class="rp-section">
      <div class="rp-section-head">
        <h2 class="rp-section-title">${escapeHtml(rp.volumes)}</h2>
      </div>
      ${volumesTableHtml(state)}
    </div>
    <div class="rp-section">
      <div class="rp-section-head">
        <h2 class="rp-section-title">${escapeHtml(rp.segmentations)}</h2>
        ${loadStatusHtml(state)}
      </div>
      ${segmentationsTableHtml(
        state.segCatalog,
        state.selectedSegmentNumber,
        state.selectedSegmentSopUid,
        state.segmentVisible,
        state.segmentOpacity,
        allOn,
        state.labelsVisible !== false,
        state.segOpacity
      )}
    </div>
    <div class="rp-section">
      <div class="rp-section-head">
        <h2 class="rp-section-title">${escapeHtml(rp.measurements)}</h2>
      </div>
      ${measurementsTableHtml(state.measurements, state.selectedMeasurementId)}
    </div>
  `;
  void refreshSegmentLabelTranslations(container, state);
}

/** Fill `.rp-seg-label` from static locale table + hub Claude when locale ≠ en. */
async function refreshSegmentLabelTranslations(
  container: HTMLElement,
  state: AppState
): Promise<void> {
  const locale = resolveStoredLocale();
  if (locale === 'en') return;
  const origin = hubOriginFromEndpoint(hubEndpoint(state));
  if (!origin) return;

  const items: Array<{
    label: string;
    terminology: SegCatalogSegment['terminology'];
  }> = [];
  for (const inst of state.segCatalog?.segmentations || []) {
    for (const seg of inst.segments || []) {
      const label = String(seg.label || '').trim();
      if (!label) continue;
      items.push({ label, terminology: seg.terminology });
    }
  }
  if (!items.length) return;

  try {
    const map = await ensureSegmentLabelsTranslated(items, {
      hubOrigin: origin,
      locale,
    });
    container.querySelectorAll<HTMLElement>('.rp-seg-label').forEach((el) => {
      const en = el.getAttribute('data-seg-label-en') || el.textContent || '';
      const next = map.get(en);
      if (next && next !== el.textContent) el.textContent = next;
    });
  } catch {
    /* keep English */
  }
}

const SEG_OPACITY_COLOR: [number, number, number] = [0.62, 0.9, 1.0];
const VOL_OPACITY_COLOR: [number, number, number] = [0.75, 0.78, 0.85];

function paintOpacityChip(
  box: HTMLElement,
  level: number,
  color: [number, number, number]
): void {
  const pct = Math.round(Math.max(0, Math.min(1, level)) * 100);
  const c = `rgb(${Math.round(color[0] * 255)},${Math.round(color[1] * 255)},${Math.round(
    color[2] * 255
  )})`;
  box.style.opacity = level < 0.02 ? '0.75' : '1';
  box.setAttribute('aria-valuenow', String(pct));
  box.innerHTML =
    `<span class="rp-opacity-fill" style="width:${pct}%;background:${c}"></span>` +
    `<span class="rp-opacity-label">${pct}%</span>`;
}

/** Attach SlicerLive-style opacity chip (click tri-state + drag). Call after render. */
export function mountOpacityChip(
  container: HTMLElement,
  selector: string,
  get: () => number,
  set: (o: number) => void,
  color: [number, number, number]
): void {
  const box = container.querySelector(selector) as HTMLElement | null;
  if (!box) return;
  attachOpacityChip(box, get, set, color);
}

function attachOpacityChip(
  box: HTMLElement,
  get: () => number,
  set: (o: number) => void,
  color: [number, number, number]
): void {
  const triNext = (v: number) => (v > 0.66 ? 0.5 : v > 0.04 ? 0 : 1);
  const paint = () => paintOpacityChip(box, get(), color);
  paint();

  let startX = 0;
  let startV = 0;
  let dragged = false;
  let pid = -1;

  box.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    startX = e.clientX;
    startV = get();
    dragged = false;
    pid = e.pointerId;
    try {
      box.setPointerCapture(pid);
    } catch {
      /* ignore */
    }
  });
  box.addEventListener('pointermove', (e) => {
    if (pid < 0) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 3) dragged = true;
    if (dragged) {
      set(Math.max(0, Math.min(1, startV + dx / 130)));
      paint();
    }
  });
  const end = () => {
    if (pid < 0) return;
    if (!dragged) {
      set(triNext(get()));
      paint();
    }
    try {
      box.releasePointerCapture(pid);
    } catch {
      /* ignore */
    }
    pid = -1;
  };
  box.addEventListener('pointerup', end);
  box.addEventListener('pointercancel', end);
}

export function mountSegOpacityChip(
  container: HTMLElement,
  get: () => number,
  set: (o: number) => void
): void {
  mountOpacityChip(container, '#rpSegOpacityChip', get, set, SEG_OPACITY_COLOR);
}

/** Attach per-segment opacity chips; call after render. */
export function mountSegmentOpacityChips(
  container: HTMLElement,
  get: (segmentNumber: number) => number,
  set: (segmentNumber: number, opacity: number) => void
): void {
  container.querySelectorAll<HTMLElement>('[data-seg-opacity]').forEach((box) => {
    const num = Number(box.dataset.segOpacity);
    if (!Number.isFinite(num)) return;
    attachOpacityChip(
      box,
      () => get(num),
      (o) => set(num, o),
      SEG_OPACITY_COLOR
    );
  });
}

export function mountVolOpacityChip(
  container: HTMLElement,
  get: () => number,
  set: (o: number) => void
): void {
  mountOpacityChip(container, '#rpVolOpacityChip', get, set, VOL_OPACITY_COLOR);
}

/** Attach VR shift range input; call after render. */
export function mountVolShiftSlider(
  container: HTMLElement,
  get: () => number,
  set: (hu: number) => void,
  getVolumeOpacity: () => number
): void {
  const slider = container.querySelector(
    '#rpVolShiftSlider'
  ) as HTMLInputElement | null;
  const valueEl = container.querySelector('#rpVolShiftValue') as HTMLElement | null;
  if (!slider) return;

  const paint = () => {
    const hu = Math.round(Number(get()) || 0);
    const min = Number(slider.min);
    const max = Number(slider.max);
    const clamped =
      Number.isFinite(min) && Number.isFinite(max)
        ? Math.max(min, Math.min(max, hu))
        : hu;
    slider.value = String(clamped);
    slider.setAttribute('aria-valuenow', String(clamped));
    slider.disabled = getVolumeOpacity() <= 0.02;
    if (valueEl) {
      valueEl.textContent = (clamped > 0 ? '+' : '') + String(clamped);
    }
  };
  paint();

  slider.addEventListener('input', () => {
    const hu = Number(slider.value);
    if (!Number.isFinite(hu)) return;
    set(hu);
    if (valueEl) {
      const r = Math.round(hu);
      valueEl.textContent = (r > 0 ? '+' : '') + String(r);
    }
  });
}

/** Attach VR preset button (opens IRA-style picture dialog); call after render. */
export function mountVolPresetButton(
  container: HTMLElement,
  get: () => string,
  set: (preset: string) => void,
  getVolumeOpacity: () => number
): void {
  const btn = container.querySelector(
    '#rpVolPresetBtn'
  ) as HTMLButtonElement | null;
  if (!btn) return;

  const paint = () => {
    btn.textContent = vrPresetLabel(get());
    btn.disabled = getVolumeOpacity() <= 0.02;
  };
  paint();

  btn.addEventListener('click', (ev) => {
    ev.stopPropagation();
    if (getVolumeOpacity() <= 0.02) return;
    const current = String(get() || '') || null;
    const entries = [VR_PRESET_DEFAULT, ...VR_PRESET_OPTIONS];
    const items = entries.map((p) => {
      const canvas = document.createElement('canvas');
      paintVrPresetThumbnail(canvas, p);
      return {
        name: p.name ? p.name : null,
        label: p.label,
        canvas,
      };
    });
    openVrPresetMenu({
      items,
      current,
      onPick: (name) => {
        set(name || '');
        paint();
      },
    });
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
    ['User', state.userName || '—'],
    ['Status', state.connectionDetail],
    ['Open study', state.openStudy?.sampleId || '(none)'],
    [
      'SEG segments',
      String(
        state.segCatalog.segmentations.reduce(
          (n, s) => n + (s.segments?.length || 0),
          0
        )
      ),
    ],
  ];
  dl.replaceChildren();
  for (const [k, v] of rows) {
    const dt = document.createElement('dt');
    dt.textContent = k;
    const dd = document.createElement('dd');
    dd.textContent = v;
    dl.append(dt, dd);
  }
}

export function closeMenus(...menus: HTMLElement[]): void {
  for (const m of menus) m.hidden = true;
}
