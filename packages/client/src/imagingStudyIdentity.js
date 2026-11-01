/**
 * Compare ImagingStudy-open contexts for "same study already open" skips
 * (conference take-over STATUS sync, etc.).
 */
import {
  extractDicomSeriesUid,
  extractDicomStudyUid,
  extractVolviewSampleId,
} from './imagingStudyContext.js';

export const SKIP_STUDY_RELOAD_TOAST =
  'Study already open - skipped reload';

export function sameOpenImagingStudyContext(
  a,
  b
) {
  if (!a?.length || !b?.length) return false;
  const sa = extractVolviewSampleId(a);
  const sb = extractVolviewSampleId(b);
  // Matching sample ids are enough; unequal ids fall through to DICOM UIDs
  // (worklist IDC sample vs OHIF study-id sample for the same DICOM study).
  if (sa && sb && sa === sb) return true;
  const studyA = extractDicomStudyUid(a);
  const studyB = extractDicomStudyUid(b);
  if (!studyA || !studyB || studyA !== studyB) return false;
  const seriesA = extractDicomSeriesUid(a) || '';
  const seriesB = extractDicomSeriesUid(b) || '';
  // Empty series on either side is compatible (host STATUS often omits series).
  if (!seriesA || !seriesB) return true;
  return seriesA === seriesB;
}
