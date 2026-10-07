/**
 * Remote AI info modal — shared card HTML from @slicer-hub/client.
 * MHub adds context-aware model listing (MHubSkill find / modality filters).
 */
import {
  clearHubDialogNearAnchor,
  placeHubDialogNearAnchor,
  renderInferenceServerInfoCardHtml,
} from '@slicer-hub/client';
import type { AppState } from './hub';
import { WORKLIST_ORG_TXRV, WORKLIST_ORG_FLEXRAY } from './config';
import {
  applyInferenceServerButtonVisibility,
  INFERENCE_SERVERS,
} from './inference-servers';
import {
  findMhubModelsForAnatomy,
  listMhubModelsForBodyPart,
  listMhubModelsForModality,
  mhubContextHintsFromImagingStudy,
  type MhubModelDef,
} from './mhub-models.ts';
import { findWorklistSample } from './samples';

const INFERENCE_MODAL_ANCHORED = 'wl-modal-backdrop-anchored';

function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function statusLabel(
  state: AppState | undefined,
  serverId: string
): string | null {
  if (!state) return null;
  const status = state.inferenceStatus.get(serverId) || 'unknown';
  if (status === 'online') return 'Online';
  if (status === 'offline') return 'Offline';
  return null;
}

function renderViewerHintHtml(serverTitle: string): string {
  const title = escapeHtml(serverTitle);
  return (
    `<p class="wl-inference-viewer-hint">` +
    `Open a study and use the <strong>Evidence Creators</strong> control in the viewer to use ${title}.` +
    `</p>`
  );
}

function findWorklistServer(serverId: string) {
  return INFERENCE_SERVERS.find((s) => s.id === serverId) || null;
}

function mhubModelRowHtml(model: MhubModelDef): string {
  const website = String(model.websiteUrl || '').trim();
  const label = escapeHtml(model.label);
  const desc = String(model.description || '').trim();
  const title = desc ? ` title="${escapeHtml(desc)}"` : '';
  const link = website
    ? ` <a class="wl-mhub-model-link" href="${escapeHtml(website)}" target="_blank" rel="noopener noreferrer">↗</a>`
    : '';
  return (
    `<li class="wl-mhub-model"${title}>` +
    `<span class="wl-mhub-model-label">${label}</span>${link}` +
    `</li>`
  );
}

function renderMhubModelsPanelHtml(
  state: AppState | undefined,
  findQuery: string
): string {
  const hints = mhubContextHintsFromImagingStudy(
    state?.lastImagingStudyOpenContext || []
  );
  // Fallback: open worklist sample modalities when context lacks study.modality
  // (older opens / non-IDC builders).
  if (!hints.modality && state?.openWorklistSampleId) {
    const sample = findWorklistSample(
      state.openWorklistSampleId,
      state.allStudies || []
    );
    const fromSample = String(
      sample?.modalities?.[0] || sample?.segroulette?.m || ''
    )
      .trim()
      .toUpperCase();
    if (fromSample === 'MRI' || fromSample === 'MR') hints.modality = 'MR';
    else if (fromSample === 'PET' || fromSample === 'PT' || fromSample === 'NM') {
      hints.modality = 'PT';
    } else if (fromSample === 'CT' || fromSample === 'CTAC') {
      hints.modality = 'CT';
    }
  }
  const modality = hints.modality || '';
  let models = listMhubModelsForModality(modality || null);
  if (hints.bodyPart) {
    models = listMhubModelsForBodyPart(models, hints.bodyPart);
  }
  const q = String(findQuery || '').trim();
  if (q) models = findMhubModelsForAnatomy(q, models);

  const filterBits: string[] = [];
  if (modality) filterBits.push(modality);
  if (hints.bodyPart) {
    filterBits.push(
      hints.bodyPart === 'WHOLEBODY' ? 'Whole body' : hints.bodyPart
    );
  }
  if (q) filterBits.push(`anatomy “${escapeHtml(q)}”`);

  const contextLine = !modality && !hints.description
    ? `<p class="wl-mhub-context-note">No open study — showing all models. Open a study to filter.</p>`
    : filterBits.length
      ? `<p class="wl-mhub-context-note">${models.length} model${models.length === 1 ? '' : 's'} · ${filterBits.join(' · ')}${hints.bodyPart && !q ? ' (from study)' : ''}</p>`
      : `<p class="wl-mhub-context-note">${models.length} model${models.length === 1 ? '' : 's'}${modality ? ` · ${escapeHtml(modality)}` : ''}</p>`;

  const list =
    models.length === 0
      ? `<p class="wl-mhub-empty">No models match.</p>`
      : `<ul class="wl-mhub-model-list" aria-label="Applicable MHub models">${models
          .map(mhubModelRowHtml)
          .join('')}</ul>`;

  return (
    `<div class="wl-mhub-models-panel" data-mhub-models-panel>` +
    `<div class="wl-mhub-find-row">` +
    `<label for="wlMhubFind">Find models by anatomy</label>` +
    `<input type="search" id="wlMhubFind" class="wl-mhub-find" ` +
    `placeholder="e.g. liver kidney" autocomplete="off" ` +
    `value="${escapeHtml(q)}" aria-label="Find MHub models by anatomy" />` +
    `</div>` +
    contextLine +
    list +
    `</div>`
  );
}

let mhubFindWired = false;
let mhubFindQuery = '';
let mhubDialogState: AppState | undefined;

function wireMhubFindOnce(): void {
  if (mhubFindWired) return;
  mhubFindWired = true;
  document.addEventListener('input', (ev) => {
    const t = ev.target;
    if (!(t instanceof HTMLInputElement) || t.id !== 'wlMhubFind') return;
    mhubFindQuery = String(t.value || '').trim();
    refreshMhubModelsPanel();
  });
}

function refreshMhubModelsPanel(): void {
  const bodyEl = document.getElementById('inferenceInfoBody');
  if (!bodyEl) return;
  const panel = bodyEl.querySelector('[data-mhub-models-panel]');
  if (!panel) return;
  panel.outerHTML = renderMhubModelsPanelHtml(mhubDialogState, mhubFindQuery);
  const input = document.getElementById('wlMhubFind') as HTMLInputElement | null;
  if (input) {
    input.focus();
    const len = input.value.length;
    input.setSelectionRange(len, len);
  }
}

export function openInferenceInfoDialog(
  serverId: string,
  state?: AppState,
  anchor?: HTMLElement | null
): void {
  const server = findWorklistServer(serverId);
  const modal = document.getElementById('inferenceInfoModal');
  const titleEl = document.getElementById('inferenceInfoTitle');
  const bodyEl = document.getElementById('inferenceInfoBody');
  if (!server || !modal || !titleEl || !bodyEl) return;

  const isLocalCapable = server.localCapable === true;
  const status = isLocalCapable ? 'Available' : statusLabel(state, server.id);
  titleEl.textContent = status
    ? `${server.title} · ${status}`
    : server.title;

  mhubDialogState = state;
  const dialog = modal.querySelector(
    '.wl-inference-info-modal'
  ) as HTMLElement | null;
  if (serverId === 'mhub') {
    wireMhubFindOnce();
    mhubFindQuery = '';
    dialog?.classList.add('wl-inference-info-modal-wide');
    bodyEl.innerHTML =
      renderInferenceServerInfoCardHtml(server) +
      renderMhubModelsPanelHtml(state, mhubFindQuery) +
      renderViewerHintHtml(server.title);
  } else {
    dialog?.classList.remove('wl-inference-info-modal-wide');
    bodyEl.innerHTML =
      renderInferenceServerInfoCardHtml(server) +
      renderViewerHintHtml(server.title);
  }
  modal.hidden = false;
  placeHubDialogNearAnchor({
    overlay: modal,
    dialog,
    anchor: anchor ?? null,
    anchoredClass: INFERENCE_MODAL_ANCHORED,
    // Right-align so the header close control sits under the clicked button.
    align: 'end',
  });
}

function clampDialogPos(
  left: number,
  top: number,
  dialog: HTMLElement
): { left: number; top: number } {
  const margin = 8;
  const w = dialog.offsetWidth || 340;
  const h = dialog.offsetHeight || 200;
  const maxL = Math.max(margin, window.innerWidth - w - margin);
  const maxT = Math.max(margin, window.innerHeight - h - margin);
  return {
    left: Math.min(maxL, Math.max(margin, left)),
    top: Math.min(maxT, Math.max(margin, top)),
  };
}

function installInferenceInfoDrag(): void {
  const modal = document.getElementById('inferenceInfoModal');
  const handle = modal?.querySelector(
    '[data-wl-inference-drag]'
  ) as HTMLElement | null;
  const dialog = modal?.querySelector(
    '.wl-inference-info-modal'
  ) as HTMLElement | null;
  if (!modal || !handle || !dialog || handle.dataset.wlDragBound === '1') {
    return;
  }
  handle.dataset.wlDragBound = '1';

  let dragging = false;
  let startX = 0;
  let startY = 0;
  let originLeft = 0;
  let originTop = 0;

  const onMove = (ev: PointerEvent) => {
    if (!dragging) return;
    const next = clampDialogPos(
      originLeft + (ev.clientX - startX),
      originTop + (ev.clientY - startY),
      dialog
    );
    dialog.style.position = 'absolute';
    dialog.style.margin = '0';
    dialog.style.left = `${next.left}px`;
    dialog.style.top = `${next.top}px`;
    dialog.style.right = 'auto';
  };

  const onUp = (ev: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    handle.classList.remove('wl-dragging');
    try {
      handle.releasePointerCapture(ev.pointerId);
    } catch {
      /* ignore */
    }
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('pointerup', onUp);
    window.removeEventListener('pointercancel', onUp);
  };

  handle.addEventListener('pointerdown', (ev) => {
    if (ev.button !== 0) return;
    const t = ev.target as HTMLElement | null;
    if (t?.closest('button, a, input, select, textarea, label')) return;
    dragging = true;
    handle.classList.add('wl-dragging');
    startX = ev.clientX;
    startY = ev.clientY;
    const rect = dialog.getBoundingClientRect();
    originLeft = rect.left;
    originTop = rect.top;
    dialog.style.position = 'absolute';
    dialog.style.margin = '0';
    dialog.style.left = `${originLeft}px`;
    dialog.style.top = `${originTop}px`;
    dialog.style.right = 'auto';
    modal.classList.add(INFERENCE_MODAL_ANCHORED);
    try {
      handle.setPointerCapture(ev.pointerId);
    } catch {
      /* ignore */
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    ev.preventDefault();
  });
}

export function closeInferenceInfoDialog(): void {
  const modal = document.getElementById('inferenceInfoModal');
  if (!modal) return;
  const dialog = modal.querySelector(
    '.wl-inference-info-modal'
  ) as HTMLElement | null;
  modal.hidden = true;
  dialog?.classList.remove('wl-inference-info-modal-wide');
  clearHubDialogNearAnchor(modal, dialog, INFERENCE_MODAL_ANCHORED);
}

export function wireInferenceInfoButtons(state: AppState): void {
  installInferenceInfoDrag();
  applyInferenceServerButtonVisibility();
  for (const server of INFERENCE_SERVERS) {
    const btn = document.getElementById(server.worklistButtonId);
    if (!btn) continue;
    btn.addEventListener('click', () => {
      if (server.id === 'txrv' || server.id === 'flexray') {
        const orgSelect = document.getElementById(
          'worklistOrgSelect'
        ) as HTMLSelectElement | null;
        if (orgSelect) {
          orgSelect.value =
            server.id === 'flexray'
              ? WORKLIST_ORG_FLEXRAY
              : WORKLIST_ORG_TXRV;
          orgSelect.dispatchEvent(new Event('change'));
        }
      }
      openInferenceInfoDialog(
        server.id,
        state,
        btn instanceof HTMLElement ? btn : null
      );
    });
  }
}
