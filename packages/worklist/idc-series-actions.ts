/**
 * Shared View / Add helpers for IDC REST and NL search dialogs.
 */
import { HUB_OPEN_MODE_IDC } from '@slicer-hub/client';
import type { AppState } from './hub';
import { hubEndpoint, publishIdcRestSeriesOpen } from './hub';
import { hubOriginFromEndpoint } from './config';
import {
  nlSeriesToPendingStudy,
  resolveIdcNlWorklistSample,
  type IdcNlPendingStudy,
} from './idc-nl-series';
import { enrichSeriesViaIdcManifest } from './idc-manifest-enrich';
import type { IdcSeriesManifestRow } from './idc-rest';
import type { WorklistSample } from './samples';

export type IdcSeriesStatusFn = (
  message: string,
  busy?: boolean
) => void;

function isPendingStudy(
  value: IdcSeriesManifestRow | IdcNlPendingStudy | Record<string, unknown>
): value is IdcNlPendingStudy {
  return (
    Boolean(value) &&
    typeof value === 'object' &&
    'raw' in value &&
    'seriesAwsUrl' in value &&
    'organization' in value
  );
}

/** Normalize pending NL study or REST row into a manifest-shaped object. */
export function toIdcSeriesActionRow(
  series: IdcSeriesManifestRow | IdcNlPendingStudy | Record<string, unknown>
): IdcSeriesManifestRow {
  if (isPendingStudy(series)) {
    const raw = series.raw || {};
    return {
      collection_id:
        String(raw.collection_id || raw.collectionId || '').trim() || null,
      PatientID: String(raw.PatientID || raw.patientId || '').trim() || null,
      StudyInstanceUID: series.studyInstanceUID || null,
      SeriesInstanceUID: series.seriesInstanceUID || null,
      Modality: String(raw.Modality || raw.modality || '').trim() || null,
      SeriesDescription:
        String(raw.SeriesDescription || raw.description || '').trim() || null,
      instanceCount: series.instanceCount ?? null,
      aws_bucket: String(raw.aws_bucket || '').trim() || null,
      crdc_series_uuid: series.crdcSeriesUuid || null,
      series_aws_url: series.seriesAwsUrl || null,
    };
  }
  return series as IdcSeriesManifestRow;
}

export function idcSeriesDisplayName(
  row: IdcSeriesManifestRow,
  fallback = 'IDC series'
): string {
  return (
    [row.collection_id, row.PatientID, row.Modality]
      .filter(Boolean)
      .join(' · ') || fallback
  );
}

export function canViewIdcSeries(row: IdcSeriesManifestRow): boolean {
  return Boolean(
    String(row.crdc_series_uuid || '').trim() ||
      String(row.SeriesInstanceUID || '').trim()
  );
}

/** Hub ImagingStudy-open only (no public IDC viewer fallback). */
export async function viewIdcSeries(
  state: AppState,
  series: IdcSeriesManifestRow | IdcNlPendingStudy | Record<string, unknown>,
  setStatus?: IdcSeriesStatusFn
): Promise<void> {
  let row = toIdcSeriesActionRow(series);
  let crdc = String(row.crdc_series_uuid || '').trim();
  const seriesUid = String(row.SeriesInstanceUID || '').trim();
  if (!crdc && !seriesUid) {
    setStatus?.('Series is missing CRDC UUID and SeriesInstanceUID.');
    return;
  }
  if (state.connection !== 'connected') {
    setStatus?.('Connect to Hub to open this series.');
    return;
  }
  try {
    if (!crdc && seriesUid) {
      setStatus?.('Resolving CRDC UUID via IDC manifest…', true);
      const enriched = await enrichSeriesViaIdcManifest([
        {
          SeriesInstanceUID: seriesUid,
          StudyInstanceUID: row.StudyInstanceUID || undefined,
        },
      ]);
      const match =
        enriched.rows.find(
          (r) => String(r.SeriesInstanceUID || '').trim() === seriesUid
        ) || enriched.rows[0];
      if (match) {
        row = {
          ...row,
          ...match,
          crdc_series_uuid:
            String(match.crdc_series_uuid || '').trim() || row.crdc_series_uuid,
          aws_bucket:
            String(match.aws_bucket || '').trim() || row.aws_bucket,
        };
        crdc = String(row.crdc_series_uuid || '').trim();
      }
    }
    if (!crdc) {
      setStatus?.('Series is missing CRDC UUID; cannot open via Hub.');
      return;
    }
    setStatus?.(`Opening ${row.collection_id || 'series'}…`, true);
    await publishIdcRestSeriesOpen(state, {
      crdcSeriesUuid: crdc,
      studyInstanceUID: String(row.StudyInstanceUID || ''),
      seriesDescription: String(row.SeriesDescription || ''),
      modality: String(row.Modality || 'CT'),
      collectionId: String(row.collection_id || ''),
      bucket: String(row.aws_bucket || 'idc-open-data'),
    });
    setStatus?.('Opened on Hub Image Displays.');
  } catch (err) {
    setStatus?.(err instanceof Error ? err.message : String(err));
  }
}

/** IRA / Hub open path: CRDC prefix URLs (same shape as View / SegRoulette). */
export function worklistSampleFromIdcCrdc(
  pending: IdcNlPendingStudy,
  organization: string,
  row?: IdcSeriesManifestRow
): WorklistSample {
  const actionRow = row || toIdcSeriesActionRow(pending);
  const crdc = String(pending.crdcSeriesUuid || '').trim();
  if (!crdc) {
    throw new Error('Missing CRDC series UUID for IDC worklist sample');
  }
  const bucket =
    String(actionRow.aws_bucket || 'idc-open-data').trim() || 'idc-open-data';
  const modality =
    String(actionRow.Modality || 'CT').trim().toUpperCase() || 'CT';
  return {
    id: pending.id,
    name: pending.name,
    description: pending.description,
    size: pending.size,
    format: 'DICOM',
    organization,
    modalities: [modality],
    studyInstanceUID: pending.studyInstanceUID || undefined,
    seriesInstanceUID: pending.seriesInstanceUID || crdc,
    openMode: HUB_OPEN_MODE_IDC,
    ctCrdc: crdc,
    bucket,
    files: [
      {
        url: `https://${bucket}.s3.amazonaws.com/${crdc}/`,
        fileName: `${crdc}/`,
      },
    ],
  };
}

/**
 * Prefer IDC/CRDC worklist rows (IRA-compatible). Fall back to hub/S3
 * per-file dicom-url listing only when CRDC is missing.
 */
export async function resolveViaHubOrS3(
  state: AppState,
  series: IdcSeriesManifestRow | IdcNlPendingStudy | Record<string, unknown>,
  organization: string,
  index = 1
): Promise<WorklistSample> {
  const pending = isPendingStudy(series)
    ? series
    : nlSeriesToPendingStudy(
        series as Record<string, unknown>,
        organization,
        index
      );
  const row = toIdcSeriesActionRow(pending);
  if (String(pending.crdcSeriesUuid || '').trim()) {
    return worklistSampleFromIdcCrdc(pending, organization, row);
  }
  const origin = hubOriginFromEndpoint(hubEndpoint(state));
  if (origin && pending.seriesInstanceUID) {
    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      const token = state.client?.getConnectionState?.()?.token?.trim();
      if (token) headers.Authorization = `Bearer ${token}`;
      const res = await fetch(`${origin}/api/hub/idc/series-files`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          organization,
          sourceBucket: pending.sourceBucket || 'aws',
          study: {
            seriesInstanceUID: pending.seriesInstanceUID,
            studyInstanceUID: pending.studyInstanceUID,
            instanceCount: pending.instanceCount,
            size: pending.size,
            openMode: 'dicom-url',
          },
        }),
      });
      if (res.ok) {
        const body = (await res.json()) as {
          study?: { files?: Array<{ url: string; fileName?: string }> };
        };
        const files = body.study?.files;
        if (files?.length) {
          return {
            id: pending.id,
            name: pending.name,
            description: pending.description,
            size: pending.size,
            format: 'DICOM' as const,
            organization,
            studyInstanceUID: pending.studyInstanceUID,
            seriesInstanceUID: pending.seriesInstanceUID,
            openMode: 'dicom-url' as const,
            files: files.map((f) => ({
              url: f.url,
              fileName: f.fileName || f.url.split('/').pop() || 'file.dcm',
            })),
          };
        }
      }
    } catch {
      // fall through to browser S3 listing
    }
  }
  return resolveIdcNlWorklistSample(pending, organization);
}
