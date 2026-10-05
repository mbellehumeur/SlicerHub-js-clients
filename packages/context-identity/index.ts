/**
 * Compare ImagingStudy-open contexts for "same study already open" skips
 * (conference take-over STATUS sync, etc.).
 */
import {
  extractDicomSeriesUid,
  extractDicomStudyUid,
  extractVolviewSampleId,
} from '@slicer-hub/client';

export const SKIP_STUDY_RELOAD_TOAST =
  'Study already open - skipped reload';

export function sameOpenImagingStudyContext(
  a: unknown[] | null | undefined,
  b: unknown[] | null | undefined
): boolean {
  if (!a?.length || !b?.length) return false;
  const sa = extractVolviewSampleId(a);
  const sb = extractVolviewSampleId(b);
  if (sa && sb) return sa === sb;
  const studyA = extractDicomStudyUid(a);
  const studyB = extractDicomStudyUid(b);
  if (!studyA || !studyB || studyA !== studyB) return false;
  const seriesA = extractDicomSeriesUid(a) || '';
  const seriesB = extractDicomSeriesUid(b) || '';
  return seriesA === seriesB;
}
