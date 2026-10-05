/**
 * Segmentation catalog shape returned by IRA STATUS (context key ``segmentation``).
 * Duplicated lightly from IRA so reporting stays independent of SlicerLive sources.
 */
import { enrichTerminologyFromSegdb } from './segdb-lookup';

export type SegCatalogCoded = {
  scheme: string;
  value: string;
  meaning: string;
};

export type SegCatalogSegment = {
  number: number;
  label: string;
  color: [number, number, number];
  terminology?: {
    category: SegCatalogCoded | null;
    type: SegCatalogCoded | null;
    typeModifier: SegCatalogCoded | null;
    region: SegCatalogCoded | null;
  };
  voxelCount: number;
  volumeMm3: number;
};

export type SegCatalogInstance = {
  sopInstanceUID: string;
  seriesInstanceUID: string;
  sourceSeriesInstanceUID: string;
  fileName: string;
  modality: string;
  segments: SegCatalogSegment[];
};

export type SegCatalog = {
  segmentations: SegCatalogInstance[];
};

export const EMPTY_SEG_CATALOG: SegCatalog = { segmentations: [] };

export type ReportMeasurement = {
  id: string;
  quantity: string;
  value: number | string;
  units: string;
  segmentNumber: number | null;
  segmentLabel: string;
  segmentationSOPInstanceUID: string;
  trackingIdentifier: string;
  /** status = legacy auto; manual = user +; sr = imported TID1500 */
  source: 'status' | 'sr' | 'manual';
};

/** Fill missing SCT codes from MHubSkill SegDB (label match); keep existing codes. */
export function enrichSegCatalogFromSegdb(catalog: SegCatalog): SegCatalog {
  if (!catalog?.segmentations?.length) return catalog;
  return {
    segmentations: catalog.segmentations.map((inst) => ({
      ...inst,
      segments: (inst.segments || []).map((seg) => ({
        ...seg,
        terminology: enrichTerminologyFromSegdb(seg.label, seg.terminology),
      })),
    })),
  };
}

/** Locate a segment in the STATUS catalog by number (and optional SEG SOP). */
export function findCatalogSegment(
  catalog: SegCatalog,
  segmentNumber: number,
  sopUid?: string
): { instance: SegCatalogInstance; segment: SegCatalogSegment } | null {
  const num = Number(segmentNumber);
  if (!Number.isFinite(num)) return null;
  for (const instance of catalog.segmentations) {
    if (
      sopUid &&
      instance.sopInstanceUID &&
      instance.sopInstanceUID !== sopUid
    ) {
      continue;
    }
    for (const segment of instance.segments || []) {
      if (Number(segment.number) === num) {
        return { instance, segment };
      }
    }
  }
  return null;
}

/** First segment in catalog order (for header + fallback). */
export function firstCatalogSegment(
  catalog: SegCatalog
): { instance: SegCatalogInstance; segment: SegCatalogSegment } | null {
  for (const instance of catalog.segmentations) {
    for (const segment of instance.segments || []) {
      return { instance, segment };
    }
  }
  return null;
}

export function segCatalogFromContext(context: unknown): SegCatalog | null {
  if (!Array.isArray(context)) return null;
  for (const item of context) {
    if (!item || typeof item !== 'object') continue;
    const row = item as { key?: unknown; resource?: unknown };
    if (String(row.key || '').toLowerCase() !== 'segmentation') continue;
    const resource = row.resource;
    if (!resource || typeof resource !== 'object') {
      return { segmentations: [] };
    }
    const segs = (resource as { segmentations?: unknown }).segmentations;
    if (!Array.isArray(segs)) return { segmentations: [] };
    return enrichSegCatalogFromSegdb({
      segmentations: segs as SegCatalogInstance[],
    });
  }
  return null;
}

/** Volume rows from STATUS catalog (QR-style default measurements). */
export function measurementsFromCatalog(catalog: SegCatalog): ReportMeasurement[] {
  const out: ReportMeasurement[] = [];
  for (const inst of catalog.segmentations) {
    for (const seg of inst.segments || []) {
      const num = Number(seg.number);
      out.push({
        id: `status:${inst.sopInstanceUID || 'seg'}:${num}:volume`,
        quantity: 'Volume',
        value: Number.isFinite(seg.volumeMm3) ? seg.volumeMm3 : '—',
        units: 'mm3',
        segmentNumber: Number.isFinite(num) ? num : null,
        segmentLabel: String(seg.label || `Segment ${num}`),
        segmentationSOPInstanceUID: String(inst.sopInstanceUID || ''),
        trackingIdentifier: String(seg.label || `Segment ${num}`),
        source: 'status',
      });
    }
  }
  return out;
}
