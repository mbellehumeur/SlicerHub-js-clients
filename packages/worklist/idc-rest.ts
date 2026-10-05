/**
 * Thin client for the public IDC REST API v3.
 * @see https://api.imaging.datacommons.cancer.gov/v3/openapi.json
 * @see IDC_REST_API_SEARCH_GUIDE.md
 */

export const IDC_REST_BASE_URL =
  'https://api.imaging.datacommons.cancer.gov';

export type IdcAttributeInfo = {
  name: string;
  table: string;
  data_type: string;
  kind: 'term' | 'range' | string;
  categorical: boolean;
  description: string;
};

export type IdcAttributeValue = {
  value: string;
  count?: number;
};

export type IdcAttributeValues = {
  attribute: string;
  values: IdcAttributeValue[];
  truncated?: boolean;
};

export type IdcCollectionSummary = {
  collection_id: string;
  collection_name?: string;
  cancer_types?: string;
  tumor_locations?: string;
  species?: string;
  subjects?: number;
  description?: string;
};

export type IdcAnalysisResult = {
  analysis_result_id: string;
  analysis_result_title?: string;
  description?: string;
  subjects?: number;
  collections?: string;
  modalities?: string;
  license_short_name?: string;
};

export type IdcCohortFilters = {
  terms?: Record<string, string[]>;
  ranges?: Record<string, { gte?: number; lte?: number }>;
};

export type IdcCohortCounts = {
  patients: number;
  studies: number;
  series: number;
  instances: number;
  size_TB: number;
  filters_applied?: IdcCohortFilters;
  warnings?: string[];
};

export type IdcSeriesManifestRow = {
  collection_id?: string | null;
  PatientID?: string | null;
  StudyInstanceUID?: string | null;
  SeriesInstanceUID?: string | null;
  Modality?: string | null;
  SeriesDescription?: string | null;
  instanceCount?: number | null;
  series_size_MB?: number | null;
  aws_bucket?: string | null;
  crdc_series_uuid?: string | null;
  series_aws_url?: string | null;
};

export type IdcManifestResponse = {
  counts: IdcCohortCounts;
  page: number;
  page_size: number;
  returned: number;
  total_series: number;
  series: IdcSeriesManifestRow[];
};

export type IdcViewerUrl = {
  viewer?: string;
  url?: string;
};

async function idcFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const url = `${IDC_REST_BASE_URL}${path}`;
  const res = await fetch(url, init);
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok) {
    const errObj =
      body && typeof body === 'object'
        ? (body as Record<string, unknown>)
        : {};
    const nested =
      errObj.error && typeof errObj.error === 'object'
        ? (errObj.error as Record<string, unknown>)
        : null;
    const detail =
      (nested && (nested.message || nested.code)) ||
      errObj.detail ||
      errObj.message ||
      res.statusText;
    throw new Error(
      typeof detail === 'string' ? detail : JSON.stringify(detail)
    );
  }
  return body as T;
}

export async function fetchIdcAttributes(): Promise<IdcAttributeInfo[]> {
  const rows = await idcFetch<IdcAttributeInfo[]>('/v3/attributes');
  return Array.isArray(rows) ? rows : [];
}

export async function fetchIdcAttributeValues(
  attribute: string,
  limit = 500
): Promise<IdcAttributeValues> {
  const name = encodeURIComponent(attribute);
  const data = await idcFetch<IdcAttributeValues>(
    `/v3/attributes/${name}/values?limit=${limit}`
  );
  const values = Array.isArray(data?.values) ? data.values : [];
  return {
    attribute: String(data?.attribute || attribute),
    values,
    truncated: Boolean(data?.truncated),
  };
}

export async function fetchIdcCollections(): Promise<IdcCollectionSummary[]> {
  const rows = await idcFetch<IdcCollectionSummary[]>('/v3/collections');
  return Array.isArray(rows) ? rows : [];
}

export async function fetchIdcAnalysisResults(): Promise<IdcAnalysisResult[]> {
  const rows = await idcFetch<IdcAnalysisResult[]>('/v3/analysis_results');
  return Array.isArray(rows) ? rows : [];
}

export async function postIdcCohortCounts(
  filters: IdcCohortFilters
): Promise<IdcCohortCounts> {
  return idcFetch<IdcCohortCounts>('/v3/cohort/counts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ filters }),
  });
}

export async function postIdcCohortManifest(options: {
  filters: IdcCohortFilters;
  page?: number;
  pageSize?: number;
}): Promise<IdcManifestResponse> {
  const page = options.page ?? 0;
  const page_size = options.pageSize ?? 25;
  return idcFetch<IdcManifestResponse>('/v3/cohort/manifest', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      filters: options.filters,
      page,
      page_size,
      include_rows: true,
    }),
  });
}

export type IdcSqlResult = {
  columns: string[];
  rows: Array<Record<string, unknown>>;
  row_count: number;
  truncated: boolean;
  max_rows: number;
};

export async function postIdcSql(options: {
  sql: string;
  maxRows?: number;
}): Promise<IdcSqlResult> {
  const body: Record<string, unknown> = { sql: options.sql };
  if (options.maxRows != null) body.max_rows = options.maxRows;
  return idcFetch<IdcSqlResult>('/v3/sql', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function fetchIdcViewerUrl(options: {
  seriesInstanceUid?: string;
  studyInstanceUid?: string;
  viewer?: string;
}): Promise<IdcViewerUrl> {
  const params = new URLSearchParams();
  if (options.seriesInstanceUid) {
    params.set('series_instance_uid', options.seriesInstanceUid);
  }
  if (options.studyInstanceUid) {
    params.set('study_instance_uid', options.studyInstanceUid);
  }
  if (options.viewer) params.set('viewer', options.viewer);
  return idcFetch<IdcViewerUrl>(`/v3/viewer-url?${params.toString()}`);
}
