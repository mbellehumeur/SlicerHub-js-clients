/**
 * App-level IDC search query model + adapter to IDC REST wire filters.
 * @see IDC_REST_API_SEARCH_GUIDE.md
 */
import type { IdcCohortFilters } from './idc-rest';

export type SearchFilter = {
  id: string;
  label: string;
  attribute: string;
  type: 'term' | 'range';
  values?: string[];
  min?: number;
  max?: number;
  /** Built-in row that cannot be removed. */
  core?: boolean;
};

export type SearchQuery = {
  filters: SearchFilter[];
};

export const CORE_FILTER_DEFS: Array<{
  attribute: string;
  label: string;
  type: 'term' | 'range';
}> = [
  { attribute: 'collection_id', label: 'Collection', type: 'term' },
  { attribute: 'Modality', label: 'Modality', type: 'term' },
  { attribute: 'BodyPartExamined', label: 'Body part', type: 'term' },
  { attribute: 'analysis_result_id', label: 'Analysis data', type: 'term' },
];

/** Suggested / Acquisition groupings for + Add filter (attribute names from API). */
export const ADD_FILTER_GROUPS: Array<{
  id: string;
  label: string;
  attributes: string[];
}> = [
  {
    id: 'suggested',
    label: 'Suggested',
    attributes: [
      'Manufacturer',
      'license_short_name',
      'StudyDate',
      'PatientSex',
    ],
  },
  {
    id: 'acquisition',
    label: 'Acquisition',
    attributes: [
      'ManufacturerModelName',
      'instanceCount',
      'series_size_MB',
      'sop_class_name',
    ],
  },
];

let filterSeq = 0;

export function nextFilterId(prefix = 'f'): string {
  filterSeq += 1;
  return `${prefix}-${filterSeq}`;
}

export function createCoreSearchQuery(): SearchQuery {
  return {
    filters: CORE_FILTER_DEFS.map((def) => ({
      id: nextFilterId('core'),
      label: def.label,
      attribute: def.attribute,
      type: def.type,
      values: [],
      core: true,
    })),
  };
}

export function cloneSearchQuery(query: SearchQuery): SearchQuery {
  return {
    filters: query.filters.map((f) => ({
      ...f,
      values: f.values ? [...f.values] : undefined,
    })),
  };
}

export function hasActivePredicates(query: SearchQuery): boolean {
  return query.filters.some((f) => {
    if (f.type === 'range') {
      return f.min != null || f.max != null;
    }
    return Array.isArray(f.values) && f.values.length > 0;
  });
}

/** Map app SearchQuery → IDC REST cohort filters body. */
export function searchQueryToIdcFilters(query: SearchQuery): IdcCohortFilters {
  const terms: Record<string, string[]> = {};
  const ranges: Record<string, { gte?: number; lte?: number }> = {};

  for (const filter of query.filters) {
    const attr = String(filter.attribute || '').trim();
    if (!attr) continue;
    if (filter.type === 'range') {
      const range: { gte?: number; lte?: number } = {};
      if (filter.min != null && Number.isFinite(filter.min)) {
        range.gte = filter.min;
      }
      if (filter.max != null && Number.isFinite(filter.max)) {
        range.lte = filter.max;
      }
      if (range.gte != null || range.lte != null) {
        ranges[attr] = range;
      }
      continue;
    }
    const values = (filter.values || [])
      .map((v) => String(v || '').trim())
      .filter(Boolean);
    if (values.length) {
      terms[attr] = values;
    }
  }

  const out: IdcCohortFilters = {};
  if (Object.keys(terms).length) out.terms = terms;
  if (Object.keys(ranges).length) out.ranges = ranges;
  return out;
}

export function humanizeAttributeName(attribute: string): string {
  const known: Record<string, string> = {
    collection_id: 'Collection',
    analysis_result_id: 'Analysis data',
    BodyPartExamined: 'Body part',
    Modality: 'Modality',
    Manufacturer: 'Manufacturer',
    ManufacturerModelName: 'Manufacturer model',
    PatientSex: 'Patient sex',
    license_short_name: 'License',
    sop_class_name: 'SOP class',
    instanceCount: 'Instance count',
    series_size_MB: 'Series size (MB)',
    StudyDate: 'Study date',
    SeriesDate: 'Series date',
    PatientID: 'Patient ID',
    StudyInstanceUID: 'Study UID',
    SeriesInstanceUID: 'Series UID',
    source_DOI: 'Source DOI',
  };
  if (known[attribute]) return known[attribute];
  return attribute.replace(/_/g, ' ');
}

export function formatCount(n: number | undefined | null): string {
  if (n == null || !Number.isFinite(n)) return '—';
  return Math.trunc(n).toLocaleString();
}

export function truncateUid(uid: string, head = 10, tail = 6): string {
  const s = String(uid || '').trim();
  if (s.length <= head + tail + 1) return s || '—';
  return `${s.slice(0, head)}…${s.slice(-tail)}`;
}
