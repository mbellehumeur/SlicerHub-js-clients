import { DicomMetadataStore } from '@ohif/core';

export const HUB_US_ANNOTATION_MODE_ROUTE = 'usAnnotation';

function seriesModalityIsUs(modality: unknown): boolean {
  return String(modality ?? '').trim().toUpperCase() === 'US';
}

/** True when any series (or its first instance) in the study is Modality US. */
export function studyHasUltrasoundModality(studyInstanceUID: string): boolean {
  const uid = studyInstanceUID.trim();
  if (!uid) {
    return false;
  }
  const study = DicomMetadataStore.getStudy(uid);
  if (!study?.series?.length) {
    return false;
  }
  return study.series.some(series => {
    if (seriesModalityIsUs(series.Modality)) {
      return true;
    }
    const instance = series.instances?.[0];
    return instance != null && seriesModalityIsUs(instance.Modality);
  });
}

/**
 * Pick OHIF mode route segment: explicit Hub `ohifMode` wins; else US studies
 * open in the ultrasound annotation mode (same intent as `/local` → microscopy for SM).
 */
export function resolveHubModeRoute(
  studyUIDs: string[],
  explicitModeRoute?: string
): string {
  const explicit = String(explicitModeRoute ?? '')
    .trim()
    .replace(/^\/+|\/+$/g, '');
  if (explicit) {
    return explicit;
  }
  if (studyUIDs.some(studyHasUltrasoundModality)) {
    return HUB_US_ANNOTATION_MODE_ROUTE;
  }
  return 'viewer';
}

export function isAlreadyOnHubStudyViewer(
  studyUID: string,
  modeRoute: string,
  dataSource?: string
): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  const normalizedMode =
    String(modeRoute ?? '')
      .trim()
      .replace(/^\/+|\/+$/g, '') || 'viewer';
  const { pathname, search } = window.location;
  if (!search.includes(studyUID)) {
    return false;
  }
  const onMode =
    pathname.includes(`/${normalizedMode}/`) || pathname.endsWith(`/${normalizedMode}`);
  if (!onMode) {
    return false;
  }
  if (dataSource && !pathname.includes(`/${dataSource}`)) {
    return false;
  }
  return true;
}
