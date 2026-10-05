/**
 * Hydrate LLM / NL hits via the same IDC REST cohort/manifest API
 * the REST search dialog uses, so View/Add get crdc_series_uuid + series_aws_url.
 *
 * Prefer SeriesInstanceUID lookup. If the model only returned StudyInstanceUID(s),
 * expand each study into its series rows (still series-level launch, like REST).
 */
import {
  postIdcCohortManifest,
  type IdcSeriesManifestRow,
} from './idc-rest';

const MANIFEST_PAGE_SIZE = 25;
/** Cap expanded series so a multi-series study does not flood the dialog. */
const MAX_MANIFEST_ROWS = 40;
const SERIES_PER_STUDY_PAGE = 25;

export type IdcManifestEnrichResult = {
  rows: IdcSeriesManifestRow[];
  mode: 'series' | 'study' | 'none';
  requestedSeriesUids: string[];
  requestedStudyUids: string[];
  missingSeriesUids: string[];
};

function firstString(row: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const value = row[key];
    if (value == null) continue;
    const text = String(value).trim();
    if (text) return text;
  }
  return '';
}

function uniqueUids(
  series: Array<Record<string, unknown>>,
  ...keys: string[]
): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const row of series || []) {
    const uid = firstString(row, ...keys);
    if (!uid || seen.has(uid)) continue;
    seen.add(uid);
    out.push(uid);
  }
  return out;
}

/** Collect SeriesInstanceUIDs from Anthropic / NL series objects. */
export function extractSeriesInstanceUids(
  series: Array<Record<string, unknown>>
): string[] {
  return uniqueUids(
    series,
    'SeriesInstanceUID',
    'seriesInstanceUID',
    'series_uid'
  );
}

/** Collect StudyInstanceUIDs from Anthropic / NL objects. */
export function extractStudyInstanceUids(
  series: Array<Record<string, unknown>>
): string[] {
  return uniqueUids(
    series,
    'StudyInstanceUID',
    'studyInstanceUID',
    'study_uid',
    'StudyInstanceUIDs'
  );
}

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    out.push(items.slice(i, i + size));
  }
  return out;
}

async function manifestBySeriesUids(
  seriesUids: string[]
): Promise<{
  rows: IdcSeriesManifestRow[];
  missingUids: string[];
}> {
  const byUid = new Map<string, IdcSeriesManifestRow>();
  for (const uidBatch of chunk(seriesUids, MANIFEST_PAGE_SIZE)) {
    const manifest = await postIdcCohortManifest({
      filters: { terms: { SeriesInstanceUID: uidBatch } },
      page: 0,
      pageSize: Math.max(uidBatch.length, MANIFEST_PAGE_SIZE),
    });
    for (const row of manifest.series || []) {
      const uid = String(row.SeriesInstanceUID || '').trim();
      if (uid) byUid.set(uid, row);
    }
  }
  const rows: IdcSeriesManifestRow[] = [];
  const missingUids: string[] = [];
  for (const uid of seriesUids) {
    const row = byUid.get(uid);
    if (row) rows.push(row);
    else missingUids.push(uid);
  }
  return { rows, missingUids };
}

async function manifestByStudyUids(
  studyUids: string[]
): Promise<IdcSeriesManifestRow[]> {
  const rows: IdcSeriesManifestRow[] = [];
  const seenSeries = new Set<string>();
  for (const studyUid of studyUids) {
    if (rows.length >= MAX_MANIFEST_ROWS) break;
    const pageSize = Math.min(
      SERIES_PER_STUDY_PAGE,
      MAX_MANIFEST_ROWS - rows.length
    );
    const manifest = await postIdcCohortManifest({
      filters: { terms: { StudyInstanceUID: [studyUid] } },
      page: 0,
      pageSize,
    });
    for (const row of manifest.series || []) {
      const seriesUid = String(row.SeriesInstanceUID || '').trim();
      if (!seriesUid || seenSeries.has(seriesUid)) continue;
      seenSeries.add(seriesUid);
      rows.push(row);
      if (rows.length >= MAX_MANIFEST_ROWS) break;
    }
  }
  return rows;
}

/**
 * Resolve launch-ready manifest series rows from NL/LLM hits.
 * 1) SeriesInstanceUID → exact series rows
 * 2) else StudyInstanceUID → expand to series under each study
 */
export async function enrichSeriesViaIdcManifest(
  series: Array<Record<string, unknown>>
): Promise<IdcManifestEnrichResult> {
  const requestedSeriesUids = extractSeriesInstanceUids(series);
  const requestedStudyUids = extractStudyInstanceUids(series);

  if (requestedSeriesUids.length) {
    const { rows, missingUids } = await manifestBySeriesUids(
      requestedSeriesUids
    );
    if (rows.length) {
      return {
        rows,
        mode: 'series',
        requestedSeriesUids,
        requestedStudyUids,
        missingSeriesUids: missingUids,
      };
    }
  }

  if (requestedStudyUids.length) {
    const rows = await manifestByStudyUids(requestedStudyUids);
    return {
      rows,
      mode: rows.length ? 'study' : 'none',
      requestedSeriesUids,
      requestedStudyUids,
      missingSeriesUids: requestedSeriesUids,
    };
  }

  return {
    rows: [],
    mode: 'none',
    requestedSeriesUids,
    requestedStudyUids,
    missingSeriesUids: [],
  };
}
