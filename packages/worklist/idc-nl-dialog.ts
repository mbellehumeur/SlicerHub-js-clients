/**
 * IDC NL search dialog — Anthropic emits SearchQuery; client runs IDC REST.
 * Pattern mirrors segroulette-dialog.ts.
 */
import type { AppState } from './hub';
import {
  fetchIdcNlHubStatus,
  searchIdcViaAnthropic,
} from './idc-nl-hub';
import {
  idcNlMaxStudiesForPrompt,
  idcNlOrganizationId,
  nlSeriesToPendingStudy,
  type IdcNlPendingStudy,
} from './idc-nl-series';
import {
  ensureIdcCustomWorklistEntry,
  refreshOrgSelectWithCustomWorklists,
} from './idc-nl-worklists';
import { executeNlSearchQuery } from './idc-nl-execute';
import {
  canViewIdcSeries,
  idcSeriesDisplayName,
  resolveViaHubOrS3,
  toIdcSeriesActionRow,
  viewIdcSeries,
} from './idc-series-actions';
import { createWorklistStyleActions } from './worklist-ui';
import { upsertIdcSegmentationSample, type WorklistSample } from './samples';

export const IDC_NL_DEFAULT_PROMPT =
  'Find a CT of the kidneys with at least 50 slices but no more than 100';
export const IDC_NL_DEFAULT_ORG_LABEL = 'test worklist';

export type IdcNlDialogHandlers = {
  getState: () => AppState;
  onStudiesChanged: () => void;
  setOrgFilter: (organization: string) => void;
};

let wired = false;
let anthropicAvailable = false;
let searchBusy = false;
let pendingOrg = '';
let pendingLabel = '';
let pendingPrompt = '';
let pendingStudies: IdcNlPendingStudy[] = [];
let pendingSql = '';
let sqlVisible = false;
const addedIds = new Set<string>();
const addingIds = new Set<string>();

function el<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

function setStatus(text: string, busy = false): void {
  const status = el<HTMLElement>('idcNlStatus');
  const spinner = el<HTMLElement>('idcNlStatusSpinner');
  const row = el<HTMLElement>('idcNlStatusRow');
  if (status) {
    status.textContent = text || '';
    status.classList.toggle('is-busy', busy);
  }
  if (spinner) spinner.hidden = !busy;
  if (row) row.setAttribute('aria-busy', busy ? 'true' : 'false');
}

function appendLog(line: string): void {
  const log = el<HTMLPreElement>('idcNlJobLog');
  if (!log) return;
  log.hidden = false;
  const prev = log.textContent || '';
  log.textContent = prev ? `${prev}\n${line}` : line;
  log.scrollTop = log.scrollHeight;
}

function clearLog(): void {
  const log = el<HTMLPreElement>('idcNlJobLog');
  if (!log) return;
  log.textContent = '';
  log.hidden = true;
}

function syncAvailability(): void {
  const avail = el<HTMLElement>('idcNlAvailability');
  const searchBtn = el<HTMLButtonElement>('idcNlSearchBtn');
  if (avail) {
    avail.textContent = anthropicAvailable
      ? ''
      : 'Anthropic unavailable — connect hub with ANTHROPIC_API_KEY.';
  }
  if (searchBtn) searchBtn.disabled = !anthropicAvailable || searchBusy;
}

function syncSqlPanel(): void {
  const section = el<HTMLElement>('idcNlSqlSection');
  const toggle = el<HTMLButtonElement>('idcNlToggleSqlBtn');
  const panel = el<HTMLPreElement>('idcNlSqlPanel');
  if (!section || !toggle || !panel) return;
  const sql = pendingSql.trim();
  if (!sql) {
    section.hidden = true;
    toggle.hidden = true;
    panel.hidden = true;
    panel.textContent = '';
    sqlVisible = false;
    return;
  }
  section.hidden = false;
  toggle.hidden = false;
  panel.textContent = sql;
  panel.hidden = !sqlVisible;
  toggle.textContent = sqlVisible
    ? 'Hide IDC query'
    : 'Show IDC query';
  toggle.setAttribute('aria-expanded', sqlVisible ? 'true' : 'false');
}

function clearResults(): void {
  pendingStudies = [];
  pendingSql = '';
  sqlVisible = false;
  addedIds.clear();
  addingIds.clear();
  const results = el<HTMLElement>('idcNlResults');
  const section = el<HTMLElement>('idcNlResultsSection');
  if (results) results.replaceChildren();
  if (section) section.hidden = true;
  const citation = el<HTMLElement>('idcNlCitation');
  if (citation) citation.textContent = '';
  syncSqlPanel();
}

function renderResults(handlers: IdcNlDialogHandlers): void {
  const resultsEl = el<HTMLElement>('idcNlResults');
  const sectionEl = el<HTMLElement>('idcNlResultsSection');
  if (!resultsEl || !sectionEl) return;
  resultsEl.replaceChildren();
  if (!pendingStudies.length) {
    sectionEl.hidden = true;
    return;
  }
  sectionEl.hidden = false;
  for (const study of pendingStudies) {
    const row = document.createElement('div');
    row.className = 'wl-idc-nl-result-row';

    const text = document.createElement('div');
    text.className = 'wl-idc-nl-result-text';
    const title = document.createElement('div');
    title.className = 'wl-idc-nl-result-title';
    title.textContent = study.name || study.id;
    const desc = document.createElement('div');
    desc.className = 'wl-idc-nl-result-desc';
    desc.textContent = study.description || '';
    const meta = document.createElement('div');
    meta.className = 'wl-idc-nl-result-meta';
    meta.textContent = study.size || '';
    text.append(title, desc, meta);

    const actions = document.createElement('div');
    actions.className = 'wl-idc-nl-result-actions';

    const actionRow = toIdcSeriesActionRow(study);
    const studyId = study.id;
    const addState = addedIds.has(studyId)
      ? 'added'
      : addingIds.has(studyId)
        ? 'adding'
        : 'idle';
    const canAdd =
      Boolean(
        study.crdcSeriesUuid || study.seriesInstanceUID || study.seriesAwsUrl
      ) && addState === 'idle';

    actions.append(
      createWorklistStyleActions({
        canOpen: canViewIdcSeries(actionRow),
        openDisabledTitle: 'Missing CRDC UUID and SeriesInstanceUID',
        onOpen: () => {
          void viewStudy(handlers, study);
        },
        addState,
        canAdd,
        addDisabledTitle:
          'Series is missing CRDC UUID / SeriesInstanceUID / series_aws_url',
        onAdd: () => {
          void addStudy(handlers, studyId);
        },
      })
    );
    row.append(text, actions);
    resultsEl.append(row);
  }
}

async function viewStudy(
  handlers: IdcNlDialogHandlers,
  study: IdcNlPendingStudy
): Promise<void> {
  const state = handlers.getState();
  await viewIdcSeries(state, study, setStatus);
}

async function addStudy(
  handlers: IdcNlDialogHandlers,
  studyId: string
): Promise<void> {
  const study = pendingStudies.find((s) => s.id === studyId);
  if (!study || addedIds.has(studyId) || addingIds.has(studyId)) return;

  const entry = ensureIdcCustomWorklistEntry({
    organization: pendingOrg,
    label: pendingLabel,
    prompt: pendingPrompt,
  });
  if (!entry) {
    setStatus('Worklist organization is missing.');
    return;
  }

  if (
    !study.crdcSeriesUuid &&
    !study.seriesInstanceUID &&
    !study.seriesAwsUrl
  ) {
    setStatus(
      'Series is missing CRDC UUID / SeriesInstanceUID / series_aws_url; cannot add. Re-run search after hub update, or use REST search.'
    );
    return;
  }

  addingIds.add(studyId);
  renderResults(handlers);
  setStatus(`Adding ${study.name}…`, true);
  appendLog(
    study.crdcSeriesUuid
      ? `Adding IDC/CRDC row for ${study.id}…`
      : `Resolving files for ${study.id}…`
  );

  try {
    const state = handlers.getState();
    const sample: WorklistSample = await resolveViaHubOrS3(
      state,
      study,
      pendingOrg
    );
    const actionRow = toIdcSeriesActionRow(study);
    sample.id = study.crdcSeriesUuid
      ? `idc-nl-${study.crdcSeriesUuid.slice(-24)}`
      : study.seriesInstanceUID
        ? `idc-nl-${study.seriesInstanceUID.slice(-24)}`
        : study.id;
    sample.name = idcSeriesDisplayName(actionRow, sample.name);
    state.allStudies = upsertIdcSegmentationSample(state.allStudies, sample);
    addedIds.add(studyId);
    const orgSelect = document.getElementById(
      'worklistOrgSelect'
    ) as HTMLSelectElement | null;
    if (orgSelect) {
      refreshOrgSelectWithCustomWorklists(orgSelect);
      handlers.setOrgFilter(pendingOrg);
    }
    handlers.onStudiesChanged();
    const via =
      sample.openMode === 'idc' && sample.ctCrdc
        ? 'IDC/CRDC'
        : `${sample.files?.length || 0} files`;
    setStatus(`Added ${sample.name} (${via}).`);
    appendLog(`Added ${sample.id}`);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    setStatus(msg);
    appendLog(msg);
  } finally {
    addingIds.delete(studyId);
    renderResults(handlers);
  }
}

async function runSearch(handlers: IdcNlDialogHandlers): Promise<void> {
  if (searchBusy) return;
  if (!anthropicAvailable) {
    setStatus('Anthropic unavailable on Slicer hub.');
    return;
  }
  const prompt = el<HTMLTextAreaElement>('idcNlPrompt')?.value?.trim() || '';
  if (!prompt) {
    setStatus('Enter a natural-language IDC query.');
    return;
  }
  const organizationLabel =
    el<HTMLInputElement>('idcNlOrgLabel')?.value?.trim() ||
    IDC_NL_DEFAULT_ORG_LABEL;

  searchBusy = true;
  clearResults();
  clearLog();
  syncAvailability();
  setStatus('Translating query via Anthropic…', true);
  appendLog('Anthropic → SearchQuery…');

  try {
    const searchStart = performance.now();
    const state = handlers.getState();
    const maxRows = idcNlMaxStudiesForPrompt(prompt);
    const anthropicStart = performance.now();
    const hubResult = await searchIdcViaAnthropic(state, prompt, {
      maxRows,
    });
    appendLog(
      `Anthropic: ${((performance.now() - anthropicStart) / 1000).toFixed(1)}s`
    );
    const org = idcNlOrganizationId(prompt);
    pendingOrg = org;
    pendingLabel = organizationLabel;
    pendingPrompt = prompt;

    const queryType = String(hubResult.query?.queryType || '?');
    appendLog(`queryType=${queryType}`);

    setStatus('Executing SearchQuery via IDC REST…', true);
    const restStart = performance.now();
    const executed = await executeNlSearchQuery(hubResult.query, maxRows);
    appendLog(
      `IDC REST: ${((performance.now() - restStart) / 1000).toFixed(1)}s`
    );
    appendLog(
      `Total: ${((performance.now() - searchStart) / 1000).toFixed(1)}s`
    );
    appendLog(
      `mode=${executed.mode} rows=${executed.rows.length}` +
        (executed.enriched ? ' (SQL rows enriched via manifest)' : '')
    );

    pendingSql = executed.displayQuery || '';
    pendingStudies = executed.rows.map((row, i) =>
      nlSeriesToPendingStudy(row, org, i + 1)
    );

    ensureIdcCustomWorklistEntry({
      organization: org,
      label: organizationLabel,
      prompt,
    });
    const citation = el<HTMLElement>('idcNlCitation');
    if (citation) citation.textContent = '';
    syncSqlPanel();
    renderResults(handlers);
    setStatus(
      pendingStudies.length
        ? `Found ${pendingStudies.length} series via IDC REST (${executed.mode}). Use Open or + when ready.`
        : hubResult.text.trim() || 'No series matched this SearchQuery.'
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    setStatus(msg);
    appendLog(msg);
  } finally {
    searchBusy = false;
    syncAvailability();
  }
}

async function refreshAnthropic(handlers: IdcNlDialogHandlers): Promise<void> {
  const status = await fetchIdcNlHubStatus(handlers.getState());
  anthropicAvailable = Boolean(status.anthropic);
  syncAvailability();
}

export function openIdcNlDialog(handlers: IdcNlDialogHandlers): void {
  const overlay = el<HTMLElement>('idcNlModal');
  if (!overlay) return;

  const prompt = el<HTMLTextAreaElement>('idcNlPrompt');
  const orgLabel = el<HTMLInputElement>('idcNlOrgLabel');
  if (prompt && !prompt.value.trim()) prompt.value = IDC_NL_DEFAULT_PROMPT;
  if (orgLabel && !orgLabel.value.trim()) {
    orgLabel.value = IDC_NL_DEFAULT_ORG_LABEL;
  }

  wireOnce(handlers);
  overlay.hidden = false;
  setStatus('');
  void refreshAnthropic(handlers).then(() => {
    prompt?.focus();
  });
}

export function closeIdcNlDialog(): void {
  const overlay = el<HTMLElement>('idcNlModal');
  if (overlay) overlay.hidden = true;
}

function wireOnce(handlers: IdcNlDialogHandlers): void {
  if (wired) return;
  wired = true;

  el<HTMLButtonElement>('idcNlSearchBtn')?.addEventListener('click', () => {
    void runSearch(handlers);
  });
  document.querySelectorAll('[data-close-idc-nl]').forEach((node) => {
    node.addEventListener('click', () => closeIdcNlDialog());
  });
  el<HTMLButtonElement>('idcNlToggleSqlBtn')?.addEventListener('click', () => {
    sqlVisible = !sqlVisible;
    syncSqlPanel();
  });
  el<HTMLElement>('idcNlModal')?.addEventListener('click', (ev) => {
    if (ev.target === ev.currentTarget) closeIdcNlDialog();
  });
}
