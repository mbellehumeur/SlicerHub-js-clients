/**
 * Expand IDC NL / hub search series rows into worklist-ready file lists.
 */
import { HUB_OPEN_MODE_DICOM_URL } from '@slicer-hub/client';
import type { WorklistSample } from './samples';

export const IDC_NL_MAX_SERIES_FILES = 300;
export const IDC_NL_MAX_STUDIES = 20;

export type IdcNlPendingStudy = {
  id: string;
  name: string;
  description: string;
  size: string;
  studyInstanceUID: string;
  seriesInstanceUID: string;
  sourceBucket: 'aws' | 'gcs';
  instanceCount?: number;
  organization: string;
  seriesAwsUrl: string;
  crdcSeriesUuid: string;
  raw: Record<string, unknown>;
};

function parseS3SeriesUrl(
  seriesAwsUrl: string
): { bucket: string; prefix: string } | null {
  const match = String(seriesAwsUrl || '')
    .trim()
    .match(/^s3:\/\/([^/]+)\/(.+)$/i);
  if (!match) return null;
  const bucket = match[1];
  const prefix = match[2].replace(/\*?$/, '').replace(/\/$/, '');
  return { bucket, prefix };
}

function s3ObjectHttpUrl(bucket: string, key: string): string {
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');
  return `https://${bucket}.s3.amazonaws.com/${encodedKey}`;
}

function appendS3ListingContents(
  doc: Document,
  bucket: string,
  files: Array<{ url: string; fileName: string; size: number }>
): void {
  const contents = doc.getElementsByTagName('Contents');
  for (let i = 0; i < contents.length; i += 1) {
    const node = contents[i];
    const key = node.getElementsByTagName('Key')[0]?.textContent || '';
    if (key && !key.endsWith('/')) {
      const size = Number(
        node.getElementsByTagName('Size')[0]?.textContent || 0
      );
      files.push({
        url: s3ObjectHttpUrl(bucket, key),
        fileName: key.slice(key.lastIndexOf('/') + 1),
        size,
      });
    }
  }
}

async function fetchS3ListingPage(
  bucket: string,
  prefix: string,
  continuationToken: string | null
): Promise<{ doc: Document; nextToken: string | null }> {
  const url = new URL(`https://${bucket}.s3.amazonaws.com/`);
  url.searchParams.set('list-type', '2');
  url.searchParams.set('prefix', `${prefix}/`);
  if (continuationToken) {
    url.searchParams.set('continuation-token', continuationToken);
  }
  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`S3 list failed (HTTP ${response.status}) for ${prefix}`);
  }
  const doc = new DOMParser().parseFromString(
    await response.text(),
    'application/xml'
  );
  if (doc.getElementsByTagName('parsererror').length) {
    throw new Error('Failed to parse S3 listing response');
  }
  const truncated =
    (doc.getElementsByTagName('IsTruncated')[0]?.textContent || '').trim() ===
    'true';
  const nextToken = truncated
    ? doc.getElementsByTagName('NextContinuationToken')[0]?.textContent ||
      null
    : null;
  return { doc, nextToken };
}

/** List objects under a public s3://bucket/prefix series URL. */
export async function listIdcSeriesFiles(
  seriesAwsUrl: string
): Promise<Array<{ url: string; fileName: string; size: number }>> {
  const parsed = parseS3SeriesUrl(seriesAwsUrl);
  if (!parsed) return [];
  const files: Array<{ url: string; fileName: string; size: number }> = [];

  async function listNextPage(continuationToken: string | null): Promise<void> {
    const { doc, nextToken } = await fetchS3ListingPage(
      parsed!.bucket,
      parsed!.prefix,
      continuationToken
    );
    appendS3ListingContents(doc, parsed!.bucket, files);
    if (nextToken) await listNextPage(nextToken);
  }

  await listNextPage(null);
  return files;
}

/** Size label matching Claude NL result meta (MB preferred, else instance count). */
export function formatIdcSeriesSizeLabel(row: {
  series_size_MB?: number | null;
  series_size_mb?: unknown;
  seriesSizeMB?: unknown;
  instanceCount?: number | null;
  instance_count?: unknown;
}): string {
  const sizeMb = Number(
    row.series_size_MB ?? row.series_size_mb ?? row.seriesSizeMB ?? 0
  );
  const sliceCount = Number(row.instanceCount ?? row.instance_count ?? 0);
  if (Number.isFinite(sizeMb) && sizeMb > 0) {
    return `${sizeMb.toFixed(1)} MB`;
  }
  return `${sliceCount || '?'} DICOM`;
}

export function idcNlOrganizationId(prompt: string): string {
  const seed = `${prompt || ''}:${Date.now()}`;
  let hash = 5381;
  for (let i = 0; i < seed.length; i += 1) {
    hash = Math.imul(33, hash) + seed.charCodeAt(i);
    hash %= 0x100000000;
  }
  const digest = Math.abs(hash).toString(16).padStart(8, '0');
  const stamp = Date.now().toString(36).slice(-4);
  return `idc-custom-${digest.slice(0, 6)}${stamp}`;
}

export function idcNlMaxStudiesForPrompt(prompt: string): number {
  const match = String(prompt || '').match(
    /\b(?:top|first|limit)\s+(\d{1,3})\b/i
  );
  if (match) {
    const parsed = Number(match[1]);
    if (Number.isFinite(parsed) && parsed > 0) {
      return Math.min(parsed, IDC_NL_MAX_STUDIES);
    }
  }
  return IDC_NL_MAX_STUDIES;
}

export function nlSeriesToPendingStudy(
  series: Record<string, unknown>,
  orgId: string,
  index: number
): IdcNlPendingStudy {
  const row = series || {};
  const firstString = (...keys: string[]): string => {
    for (const key of keys) {
      const value = row[key];
      if (value == null) continue;
      const text = String(value).trim();
      if (text) return text;
    }
    return '';
  };
  const studyUid = firstString('StudyInstanceUID', 'studyInstanceUID', 'study_uid');
  const seriesUid = firstString(
    'SeriesInstanceUID',
    'seriesInstanceUID',
    'series_uid'
  );
  const patientId = firstString('PatientID', 'patientId', 'patient_id');
  const descriptionRaw = firstString(
    'SeriesDescription',
    'seriesDescription',
    'description'
  );
  const collection = firstString(
    'collection_id',
    'collectionId',
    'collection'
  );
  const modality = firstString('Modality', 'modality');
  const sliceCount = Number(row.instanceCount || row.instance_count || 0);
  const labelParts = [collection, patientId, descriptionRaw || modality].filter(
    Boolean
  );
  const description =
    labelParts.join(' — ') || descriptionRaw || `IDC study ${index}`;
  const nameParts = [collection, patientId, modality].filter(Boolean);
  const name = nameParts.join(' · ') || `IDC ${index}`;
  const studyId = seriesUid
    ? `idc-nl-${seriesUid.slice(-24)}`
    : `${orgId}-${String(index).padStart(2, '0')}`;
  const sizeLabel = formatIdcSeriesSizeLabel(row);
  const bucketRaw = firstString('aws_bucket', 'awsBucket', 'bucket') || 'aws';
  const seriesAwsUrl = firstString(
    'series_aws_url',
    'seriesAwsUrl',
    'aws_url',
    'awsUrl',
    'seriesUrl',
    'series_url'
  );
  const crdcSeriesUuid = firstString(
    'crdc_series_uuid',
    'crdcSeriesUuid',
    'crdc_uuid',
    'crdcUuid',
    'series_uuid'
  );

  return {
    id: studyId,
    name,
    description,
    size: sizeLabel,
    studyInstanceUID: studyUid,
    seriesInstanceUID: seriesUid,
    sourceBucket: bucketRaw.includes('gcs') ? 'gcs' : 'aws',
    instanceCount: sliceCount || undefined,
    organization: orgId,
    seriesAwsUrl,
    crdcSeriesUuid,
    raw: row,
  };
}

/** Resolve S3 prefix → per-instance files and build a WorklistSample. */
export async function resolveIdcNlWorklistSample(
  study: IdcNlPendingStudy,
  organization: string
): Promise<WorklistSample> {
  const org = String(organization || study.organization || '').trim();
  const seriesAwsUrl = String(study.seriesAwsUrl || '').trim();
  if (!seriesAwsUrl) {
    throw new Error('No AWS series URL to resolve DICOM files.');
  }
  if (!/^s3:\/\//i.test(seriesAwsUrl)) {
    throw new Error(
      'Per-file worklist entries require an s3:// series prefix (GCS not supported in browser).'
    );
  }
  const listed = await listIdcSeriesFiles(seriesAwsUrl);
  if (!listed.length) {
    throw new Error('No DICOM files found for this series.');
  }
  if (listed.length > IDC_NL_MAX_SERIES_FILES) {
    throw new Error(
      `Series has ${listed.length} files (max ${IDC_NL_MAX_SERIES_FILES}).`
    );
  }
  const files = listed.map(({ url, fileName }) => ({ url, fileName }));
  return {
    id: study.id,
    name: study.name,
    description: study.description,
    size: study.size,
    format: 'DICOM',
    organization: org,
    modalities: undefined,
    studyInstanceUID: study.studyInstanceUID,
    seriesInstanceUID: study.seriesInstanceUID,
    openMode: HUB_OPEN_MODE_DICOM_URL,
    files,
    ctCrdc: study.crdcSeriesUuid || undefined,
  };
}
