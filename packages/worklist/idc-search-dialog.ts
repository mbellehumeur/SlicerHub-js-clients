/**
 * IDC REST API Search dialog — structured filters via public IDC v3 REST.
 * @see IDC_REST_API_SEARCH_GUIDE.md
 */
import type { AppState } from './hub';
import {
  ensureIdcCustomWorklistEntry,
  refreshOrgSelectWithCustomWorklists,
} from './idc-nl-worklists';
import {
  formatIdcSeriesSizeLabel,
  idcNlOrganizationId,
} from './idc-nl-series';
import {
  fetchIdcAnalysisResults,
  fetchIdcAttributeValues,
  fetchIdcAttributes,
  fetchIdcCollections,
  postIdcCohortCounts,
  postIdcCohortManifest,
  type IdcAnalysisResult,
  type IdcAttributeInfo,
  type IdcCollectionSummary,
  type IdcCohortCounts,
  type IdcSeriesManifestRow,
} from './idc-rest';
import {
  ADD_FILTER_GROUPS,
  cloneSearchQuery,
  createCoreSearchQuery,
  formatCount,
  hasActivePredicates,
  humanizeAttributeName,
  nextFilterId,
  searchQueryToIdcFilters,
  truncateUid,
  type SearchFilter,
  type SearchQuery,
} from './idc-search-query';
import {
  canViewIdcSeries,
  idcSeriesDisplayName,
  resolveViaHubOrS3,
  viewIdcSeries,
} from './idc-series-actions';
import { upsertIdcSegmentationSample } from './samples';
import { createWorklistStyleActions } from './worklist-ui';

export type IdcSearchDialogHandlers = {
  getState: () => AppState;
  onStudiesChanged: () => void;
  setOrgFilter: (organization: string) => void;
};

const PAGE_SIZE = 25;
const COUNTS_DEBOUNCE_MS = 350;
const DEFAULT_ORG_LABEL = 'IDC REST search';

let wired = false;
let metaLoaded = false;
let metaBusy = false;
let countsBusy = false;
let resultsBusy = false;
let countsTimer: ReturnType<typeof setTimeout> | null = null;
let countsGen = 0;

let query: SearchQuery = createCoreSearchQuery();
let attributes: IdcAttributeInfo[] = [];
let collections: IdcCollectionSummary[] = [];
let analysisResults: IdcAnalysisResult[] = [];
let valueCache = new Map<string, Array<{ value: string; label: string }>>();
let counts: IdcCohortCounts | null = null;
let seriesRows: IdcSeriesManifestRow[] = [];
let page = 0;
let totalSeries = 0;
let addFilterOpen = false;
let addingKeys = new Set<string>();
let addedKeys = new Set<string>();

function el<T extends HTMLElement>(id: string): T {
  return document.getElementById(id) as T;
}

function setStatus(text: string, busy = false): void {
  const status = el<HTMLElement>('idcSearchStatus');
  const spinner = el<HTMLElement>('idcSearchStatusSpinner');
  if (status) {
    status.textContent = text || '';
    status.classList.toggle('is-busy', busy);
  }
  if (spinner) spinner.hidden = !busy;
}

function rowKey(row: IdcSeriesManifestRow, index: number): string {
  return (
    String(row.SeriesInstanceUID || row.crdc_series_uuid || '').trim() ||
    `row-${index}`
  );
}

async function ensureMeta(): Promise<void> {
  if (metaLoaded || metaBusy) return;
  metaBusy = true;
  setStatus('Loading IDC attributes…', true);
  try {
    const [attrs, cols, analysis] = await Promise.all([
      fetchIdcAttributes(),
      fetchIdcCollections(),
      fetchIdcAnalysisResults(),
    ]);
    attributes = attrs;
    collections = cols.slice().sort((a, b) =>
      String(a.collection_id).localeCompare(String(b.collection_id))
    );
    analysisResults = analysis.slice().sort((a, b) =>
      String(a.analysis_result_title || a.analysis_result_id).localeCompare(
        String(b.analysis_result_title || b.analysis_result_id)
      )
    );
    metaLoaded = true;
    setStatus('');
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    setStatus(msg);
  } finally {
    metaBusy = false;
  }
}

async function loadValuesForAttribute(
  attribute: string
): Promise<Array<{ value: string; label: string }>> {
  const cached = valueCache.get(attribute);
  if (cached) return cached;

  if (attribute === 'collection_id') {
    const opts = collections.map((c) => ({
      value: c.collection_id,
      label: c.collection_name
        ? `${c.collection_id} — ${c.collection_name}`
        : c.collection_id,
    }));
    valueCache.set(attribute, opts);
    return opts;
  }
  if (attribute === 'analysis_result_id') {
    const opts = analysisResults.map((a) => ({
      value: a.analysis_result_id,
      label: a.analysis_result_title
        ? `${a.analysis_result_id} — ${a.analysis_result_title}`
        : a.analysis_result_id,
    }));
    valueCache.set(attribute, opts);
    return opts;
  }

  const attrInfo = attributes.find((a) => a.name === attribute);
  if (attrInfo && attrInfo.kind === 'range') {
    valueCache.set(attribute, []);
    return [];
  }

  const res = await fetchIdcAttributeValues(attribute, 1000);
  const opts = res.values.map((v) => ({
    value: String(v.value),
    label:
      v.count != null
        ? `${v.value} (${formatCount(v.count)})`
        : String(v.value),
  }));
  valueCache.set(attribute, opts);
  return opts;
}

function scheduleCounts(): void {
  if (countsTimer) clearTimeout(countsTimer);
  countsTimer = setTimeout(() => {
    void refreshCounts();
  }, COUNTS_DEBOUNCE_MS);
}

async function refreshCounts(): Promise<void> {
  const gen = ++countsGen;
  const matching = el<HTMLElement>('idcSearchMatching');
  if (!hasActivePredicates(query)) {
    counts = null;
    if (matching) {
      matching.textContent =
        'Matching: select at least one filter to see counts';
    }
    el<HTMLButtonElement>('idcSearchShowResultsBtn').disabled = true;
    return;
  }

  countsBusy = true;
  el<HTMLButtonElement>('idcSearchShowResultsBtn').disabled = true;
  if (matching) matching.textContent = 'Matching: …';
  try {
    const filters = searchQueryToIdcFilters(query);
    const next = await postIdcCohortCounts(filters);
    if (gen !== countsGen) return;
    counts = next;
    if (matching) {
      matching.textContent = `Matching: ${formatCount(next.patients)} patients · ${formatCount(next.studies)} studies · ${formatCount(next.series)} series`;
      if (next.warnings?.length) {
        matching.textContent += ` — ${next.warnings[0]}`;
      }
    }
    el<HTMLButtonElement>('idcSearchShowResultsBtn').disabled = false;
  } catch (err) {
    if (gen !== countsGen) return;
    const msg = err instanceof Error ? err.message : String(err);
    if (matching) matching.textContent = `Matching: ${msg}`;
    setStatus(msg);
  } finally {
    if (gen === countsGen) countsBusy = false;
  }
}

async function showResults(nextPage = 0): Promise<void> {
  if (resultsBusy || !hasActivePredicates(query)) return;
  resultsBusy = true;
  page = nextPage;
  setStatus('Loading series…', true);
  const section = el<HTMLElement>('idcSearchResultsSection');
  try {
    const filters = searchQueryToIdcFilters(query);
    const manifest = await postIdcCohortManifest({
      filters,
      page,
      pageSize: PAGE_SIZE,
    });
    counts = manifest.counts;
    seriesRows = manifest.series || [];
    totalSeries = manifest.total_series || 0;
    addedKeys.clear();
    const matching = el<HTMLElement>('idcSearchMatching');
    if (matching && counts) {
      matching.textContent = `Matching: ${formatCount(counts.patients)} patients · ${formatCount(counts.studies)} studies · ${formatCount(counts.series)} series`;
    }
    if (section) section.hidden = false;
    renderResults();
    setStatus(
      seriesRows.length
        ? `Showing ${seriesRows.length} of ${formatCount(totalSeries)} series`
        : 'No series matched these filters.'
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    setStatus(msg);
  } finally {
    resultsBusy = false;
  }
}

function renderFilterRows(handlers: IdcSearchDialogHandlers): void {
  const host = el<HTMLElement>('idcSearchFilterRows');
  if (!host) return;
  host.replaceChildren();

  for (const filter of query.filters) {
    const row = document.createElement('div');
    row.className = 'wl-idc-search-filter-row';
    row.dataset.filterId = filter.id;

    const label = document.createElement('label');
    label.className = 'wl-idc-search-filter-label';
    label.textContent = filter.label;

    const controls = document.createElement('div');
    controls.className = 'wl-idc-search-filter-controls';

    if (filter.type === 'range') {
      const minInput = document.createElement('input');
      minInput.type = 'number';
      minInput.className = 'wl-idc-search-range';
      minInput.placeholder = 'Min';
      minInput.value = filter.min != null ? String(filter.min) : '';
      minInput.addEventListener('change', () => {
        const v = minInput.value.trim();
        filter.min = v === '' ? undefined : Number(v);
        scheduleCounts();
      });
      const maxInput = document.createElement('input');
      maxInput.type = 'number';
      maxInput.className = 'wl-idc-search-range';
      maxInput.placeholder = 'Max';
      maxInput.value = filter.max != null ? String(filter.max) : '';
      maxInput.addEventListener('change', () => {
        const v = maxInput.value.trim();
        filter.max = v === '' ? undefined : Number(v);
        scheduleCounts();
      });
      controls.append(minInput, maxInput);
    } else {
      const select = document.createElement('select');
      select.className = 'wl-idc-search-select';

      const anyOpt = document.createElement('option');
      anyOpt.value = '';
      anyOpt.textContent = 'Any';
      select.append(anyOpt);

      void loadValuesForAttribute(filter.attribute)
        .then((opts) => {
          const current = filter.values?.[0] || '';
          for (const opt of opts) {
            const o = document.createElement('option');
            o.value = opt.value;
            o.textContent = opt.label;
            if (opt.value === current) o.selected = true;
            select.append(o);
          }
          if (!current) anyOpt.selected = true;
        })
        .catch((err) => {
          setStatus(err instanceof Error ? err.message : String(err));
        });

      select.addEventListener('change', () => {
        const v = select.value.trim();
        filter.values = v ? [v] : [];
        scheduleCounts();
      });
      controls.append(select);
    }

    row.append(label, controls);

    if (!filter.core) {
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'wl-idc-search-remove';
      remove.textContent = 'Remove';
      remove.addEventListener('click', () => {
        query.filters = query.filters.filter((f) => f.id !== filter.id);
        renderFilterRows(handlers);
        renderAddFilterPanel(handlers);
        scheduleCounts();
      });
      row.append(remove);
    }

    host.append(row);
  }
}

function usedAttributes(): Set<string> {
  return new Set(query.filters.map((f) => f.attribute));
}

function renderAddFilterPanel(handlers: IdcSearchDialogHandlers): void {
  const panel = el<HTMLElement>('idcSearchAddFilterPanel');
  if (!panel) return;
  panel.hidden = !addFilterOpen;
  if (!addFilterOpen) return;
  panel.replaceChildren();

  const search = document.createElement('input');
  search.type = 'search';
  search.className = 'wl-idc-search-add-search';
  search.placeholder = 'Search filters…';
  panel.append(search);

  const list = document.createElement('div');
  list.className = 'wl-idc-search-add-list';
  panel.append(list);

  const used = usedAttributes();
  const attrByName = new Map(attributes.map((a) => [a.name, a]));

  const renderList = (q: string) => {
    list.replaceChildren();
    const needle = q.trim().toLowerCase();

    const appendGroup = (title: string, names: string[]) => {
      const filtered = names.filter((name) => {
        if (used.has(name)) return false;
        if (!attrByName.has(name)) return false;
        if (!needle) return true;
        const label = humanizeAttributeName(name).toLowerCase();
        return label.includes(needle) || name.toLowerCase().includes(needle);
      });
      if (!filtered.length) return;
      const h = document.createElement('div');
      h.className = 'wl-idc-search-add-group';
      h.textContent = title;
      list.append(h);
      for (const name of filtered) {
        const info = attrByName.get(name)!;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'wl-idc-search-add-item';
        btn.textContent = humanizeAttributeName(name);
        btn.title = info.description || name;
        btn.addEventListener('click', () => addFilter(handlers, info));
        list.append(btn);
      }
    };

    for (const group of ADD_FILTER_GROUPS) {
      appendGroup(group.label, group.attributes);
    }

    const advancedNames = attributes
      .map((a) => a.name)
      .filter((name) => !CORE_FILTER_ATTRIBUTE_SET.has(name));
    appendGroup('Advanced', advancedNames);
  };

  search.addEventListener('input', () => renderList(search.value));
  renderList('');
}

const CORE_FILTER_ATTRIBUTE_SET = new Set([
  'collection_id',
  'Modality',
  'BodyPartExamined',
  'analysis_result_id',
]);

function addFilter(
  handlers: IdcSearchDialogHandlers,
  info: IdcAttributeInfo
): void {
  if (usedAttributes().has(info.name)) return;
  const filter: SearchFilter = {
    id: nextFilterId('extra'),
    label: humanizeAttributeName(info.name),
    attribute: info.name,
    type: info.kind === 'range' ? 'range' : 'term',
    values: [],
    core: false,
  };
  query.filters.push(filter);
  addFilterOpen = false;
  renderFilterRows(handlers);
  renderAddFilterPanel(handlers);
  scheduleCounts();
}

function renderResults(): void {
  const tbody = el<HTMLElement>('idcSearchResultsBody');
  const pager = el<HTMLElement>('idcSearchPager');
  if (!tbody) return;
  tbody.replaceChildren();

  seriesRows.forEach((row, index) => {
    const tr = document.createElement('tr');
    const key = rowKey(row, index);

    const cells = [
      String(row.collection_id || '—'),
      String(row.PatientID || '—'),
      truncateUid(String(row.StudyInstanceUID || '')),
      String(
        row.SeriesDescription ||
          truncateUid(String(row.SeriesInstanceUID || '')) ||
          '—'
      ),
      String(row.Modality || '—'),
      formatIdcSeriesSizeLabel(row),
    ];
    for (const text of cells) {
      const td = document.createElement('td');
      td.textContent = text;
      td.title = text;
      tr.append(td);
    }

    const actions = document.createElement('td');
    actions.className = 'wl-idc-search-actions';

    const addState = addedKeys.has(key)
      ? 'added'
      : addingKeys.has(key)
        ? 'adding'
        : 'idle';

    actions.append(
      createWorklistStyleActions({
        canOpen: canViewIdcSeries(row),
        openDisabledTitle: 'Missing CRDC UUID and SeriesInstanceUID',
        onOpen: () => {
          void viewSeries(row);
        },
        addState,
        canAdd: addState === 'idle',
        onAdd: () => {
          void addSeries(row, key);
        },
      })
    );
    tr.append(actions);
    tbody.append(tr);
  });

  if (pager) {
    const maxPage = Math.max(0, Math.ceil(totalSeries / PAGE_SIZE) - 1);
    pager.hidden = totalSeries <= PAGE_SIZE;
    const prev = el<HTMLButtonElement>('idcSearchPrevBtn');
    const next = el<HTMLButtonElement>('idcSearchNextBtn');
    const label = el<HTMLElement>('idcSearchPageLabel');
    if (prev) prev.disabled = page <= 0 || resultsBusy;
    if (next) next.disabled = page >= maxPage || resultsBusy;
    if (label) {
      label.textContent = `Page ${page + 1} of ${maxPage + 1}`;
    }
  }
}

async function viewSeries(row: IdcSeriesManifestRow): Promise<void> {
  const state = handlersRef?.getState();
  if (!state) return;
  await viewIdcSeries(state, row, setStatus);
}

async function addSeries(
  row: IdcSeriesManifestRow,
  key: string
): Promise<void> {
  if (!handlersRef || addedKeys.has(key) || addingKeys.has(key)) return;
  const state = handlersRef.getState();
  const orgLabel =
    el<HTMLInputElement>('idcSearchOrgLabel')?.value?.trim() ||
    DEFAULT_ORG_LABEL;
  const org = idcNlOrganizationId(`rest:${orgLabel}:${key}`);
  ensureIdcCustomWorklistEntry({
    organization: org,
    label: orgLabel,
    prompt: `IDC REST: ${JSON.stringify(searchQueryToIdcFilters(query))}`,
  });

  addingKeys.add(key);
  renderResults();
  setStatus(`Adding ${row.collection_id || key}…`, true);
  try {
    const sample = await resolveViaHubOrS3(state, row, org);
    // Stable id per series
    sample.id = `idc-rest-${String(row.SeriesInstanceUID || key).slice(-24)}`;
    sample.name = idcSeriesDisplayName(row, sample.name);
    state.allStudies = upsertIdcSegmentationSample(state.allStudies, sample);
    addedKeys.add(key);
    const orgSelect = document.getElementById(
      'worklistOrgSelect'
    ) as HTMLSelectElement | null;
    if (orgSelect) {
      refreshOrgSelectWithCustomWorklists(orgSelect);
      handlersRef.setOrgFilter(org);
    }
    handlersRef.onStudiesChanged();
    setStatus(`Added ${sample.name}.`);
  } catch (err) {
    setStatus(err instanceof Error ? err.message : String(err));
  } finally {
    addingKeys.delete(key);
    renderResults();
  }
}

let handlersRef: IdcSearchDialogHandlers | null = null;

function wireOnce(handlers: IdcSearchDialogHandlers): void {
  if (wired) return;
  wired = true;
  handlersRef = handlers;

  document.querySelectorAll('[data-close-idc-search]').forEach((node) => {
    node.addEventListener('click', () => closeIdcSearchDialog());
  });
  el<HTMLElement>('idcSearchModal')?.addEventListener('click', (ev) => {
    if (ev.target === ev.currentTarget) closeIdcSearchDialog();
  });

  el<HTMLButtonElement>('idcSearchAddFilterBtn')?.addEventListener(
    'click',
    () => {
      addFilterOpen = !addFilterOpen;
      renderAddFilterPanel(handlers);
    }
  );

  el<HTMLButtonElement>('idcSearchShowResultsBtn')?.addEventListener(
    'click',
    () => {
      void showResults(0);
    }
  );

  el<HTMLButtonElement>('idcSearchPrevBtn')?.addEventListener('click', () => {
    if (page > 0) void showResults(page - 1);
  });
  el<HTMLButtonElement>('idcSearchNextBtn')?.addEventListener('click', () => {
    void showResults(page + 1);
  });
}

export function openIdcSearchDialog(handlers: IdcSearchDialogHandlers): void {
  const overlay = el<HTMLElement>('idcSearchModal');
  if (!overlay) return;
  handlersRef = handlers;
  wireOnce(handlers);

  if (!query.filters.length) {
    query = createCoreSearchQuery();
  } else {
    query = cloneSearchQuery(query);
  }

  const orgLabel = el<HTMLInputElement>('idcSearchOrgLabel');
  if (orgLabel && !orgLabel.value.trim()) {
    orgLabel.value = DEFAULT_ORG_LABEL;
  }

  addFilterOpen = false;
  seriesRows = [];
  const section = el<HTMLElement>('idcSearchResultsSection');
  if (section) section.hidden = true;

  overlay.hidden = false;
  setStatus('');
  void ensureMeta().then(() => {
    renderFilterRows(handlers);
    renderAddFilterPanel(handlers);
    scheduleCounts();
  });
}

export function closeIdcSearchDialog(): void {
  const overlay = el<HTMLElement>('idcSearchModal');
  if (overlay) overlay.hidden = true;
  addFilterOpen = false;
}
