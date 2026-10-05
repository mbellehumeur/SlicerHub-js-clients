/**
 * Execute Claude SearchQuery JSON against IDC REST (filters → manifest, sql → /v3/sql).
 */
import { enrichSeriesViaIdcManifest } from './idc-manifest-enrich';
import {
  postIdcCohortManifest,
  postIdcSql,
  type IdcSeriesManifestRow,
} from './idc-rest';
import {
  humanizeAttributeName,
  nextFilterId,
  searchQueryToIdcFilters,
  type SearchFilter,
  type SearchQuery,
} from './idc-search-query';

export type NlQueryFilter = {
  attribute?: string;
  type?: string;
  values?: string[];
  value?: string;
  min?: number;
  max?: number;
  op?: string;
  gte?: number;
  lte?: number;
};

export type NlSearchQuery = {
  queryType: 'filters' | 'sql';
  filters?: NlQueryFilter[];
  sql?: string;
  limit?: number;
};

export type NlExecuteResult = {
  rows: Array<Record<string, unknown>>;
  mode: 'filters' | 'sql';
  displayQuery: string;
  enriched: boolean;
  limit: number;
};

function clampLimit(raw: unknown, fallback = 20): number {
  const n = typeof raw === 'number' ? raw : Number(raw);
  if (!Number.isFinite(n) || n < 1) return fallback;
  return Math.min(Math.trunc(n), 100);
}

function normalizeFilter(raw: NlQueryFilter): SearchFilter | null {
  const attribute = String(raw.attribute || '').trim();
  if (!attribute) return null;
  const op = String(raw.op || '').trim().toLowerCase();
  const ftype = String(raw.type || '').trim().toLowerCase();

  if (ftype === 'range' || op === 'between' || op === 'gte' || op === 'lte' || op === 'range') {
    const min =
      raw.min != null && Number.isFinite(Number(raw.min))
        ? Number(raw.min)
        : raw.gte != null && Number.isFinite(Number(raw.gte))
          ? Number(raw.gte)
          : undefined;
    const max =
      raw.max != null && Number.isFinite(Number(raw.max))
        ? Number(raw.max)
        : raw.lte != null && Number.isFinite(Number(raw.lte))
          ? Number(raw.lte)
          : undefined;
    if (min == null && max == null) return null;
    return {
      id: nextFilterId('nl'),
      label: humanizeAttributeName(attribute),
      attribute,
      type: 'range',
      min,
      max,
    };
  }

  if (op === 'contains') {
    throw new Error(
      `Filter op "contains" is not supported on IDC REST terms (${attribute}). Use SQL.`
    );
  }

  let values: string[] = [];
  if (Array.isArray(raw.values)) {
    values = raw.values.map((v) => String(v || '').trim()).filter(Boolean);
  } else if (raw.value != null && String(raw.value).trim()) {
    values = [String(raw.value).trim()];
  }
  if (!values.length) return null;
  return {
    id: nextFilterId('nl'),
    label: humanizeAttributeName(attribute),
    attribute,
    type: 'term',
    values,
  };
}

export function normalizeNlSearchQuery(
  raw: unknown,
  defaultLimit = 20
): NlSearchQuery {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Missing SearchQuery from Anthropic');
  }
  const body = raw as Record<string, unknown>;
  const limit = clampLimit(body.limit, defaultLimit);
  const queryType = String(body.queryType || body.query_type || '')
    .trim()
    .toLowerCase();
  const sql = String(body.sql || '').trim();

  if (queryType === 'sql' || (!queryType && sql && !body.filters)) {
    if (!sql) throw new Error('queryType sql requires a non-empty sql string');
    return { queryType: 'sql', sql, limit };
  }

  const filtersRaw = Array.isArray(body.filters) ? body.filters : [];
  const filters: NlQueryFilter[] = [];
  for (const item of filtersRaw) {
    if (!item || typeof item !== 'object') continue;
    const normalized = normalizeFilter(item as NlQueryFilter);
    if (normalized) {
      filters.push({
        attribute: normalized.attribute,
        type: normalized.type,
        values: normalized.values,
        min: normalized.min,
        max: normalized.max,
      });
    }
  }

  if (!filters.length && sql) {
    return { queryType: 'sql', sql, limit };
  }
  if (!filters.length) {
    throw new Error('SearchQuery has neither usable filters nor SQL');
  }
  return { queryType: 'filters', filters, limit };
}

function toSearchQuery(nl: NlSearchQuery): SearchQuery {
  const filters: SearchFilter[] = [];
  for (const raw of nl.filters || []) {
    const normalized = normalizeFilter(raw);
    if (normalized) filters.push(normalized);
  }
  return { filters };
}

function formatFiltersDisplay(nl: NlSearchQuery): string {
  return JSON.stringify(
    {
      queryType: 'filters',
      filters: nl.filters || [],
      limit: nl.limit,
    },
    null,
    2
  );
}

function rowNeedsEnrich(row: Record<string, unknown>): boolean {
  const crdc = String(
    row.crdc_series_uuid || row.crdcSeriesUuid || ''
  ).trim();
  const aws = String(row.series_aws_url || row.seriesAwsUrl || '').trim();
  return !crdc && !aws;
}

/**
 * Run normalized NL query against IDC REST. Optionally enrich SQL rows
 * missing launch fields via cohort manifest by UID.
 */
export async function executeNlSearchQuery(
  rawQuery: unknown,
  defaultLimit = 20
): Promise<NlExecuteResult> {
  const nl = normalizeNlSearchQuery(rawQuery, defaultLimit);
  const limit = nl.limit ?? defaultLimit;

  if (nl.queryType === 'sql') {
    const sql = String(nl.sql || '').trim();
    const result = await postIdcSql({ sql, maxRows: limit });
    let rows: Array<Record<string, unknown>> = Array.isArray(result.rows)
      ? result.rows.map((r) => ({ ...(r as Record<string, unknown>) }))
      : [];
    let enriched = false;
    if (rows.length && rows.some(rowNeedsEnrich)) {
      const hydrated = await enrichSeriesViaIdcManifest(rows);
      if (hydrated.rows.length) {
        rows = hydrated.rows as Array<Record<string, unknown>>;
        enriched = true;
      }
    }
    return {
      rows,
      mode: 'sql',
      displayQuery: sql,
      enriched,
      limit,
    };
  }

  const searchQuery = toSearchQuery(nl);
  const filters = searchQueryToIdcFilters(searchQuery);
  if (!filters.terms && !filters.ranges) {
    throw new Error('No active filter predicates to send to IDC REST');
  }
  const manifest = await postIdcCohortManifest({
    filters,
    page: 0,
    pageSize: limit,
  });
  const rows = (manifest.series || []) as IdcSeriesManifestRow[];
  return {
    rows: rows as Array<Record<string, unknown>>,
    mode: 'filters',
    displayQuery: formatFiltersDisplay(nl),
    enriched: false,
    limit,
  };
}
