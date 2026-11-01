import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  HUB_IDENTIFIER_DICOM_UID,
  HUB_IDENTIFIER_VOLVIEW_SAMPLE_ID,
} from './imagingStudyContext.js';
import { sameOpenImagingStudyContext } from './imagingStudyIdentity.js';

function studyContext({
  studyUid,
  seriesUid,
  sampleId,
} = {}) {
  const identifier = [];
  if (studyUid) {
    identifier.push({ system: HUB_IDENTIFIER_DICOM_UID, value: studyUid });
  }
  if (sampleId) {
    identifier.push({
      system: HUB_IDENTIFIER_VOLVIEW_SAMPLE_ID,
      value: sampleId,
    });
  }
  const context = [
    {
      key: 'study',
      resource: {
        ...(studyUid ? { uid: studyUid } : {}),
        ...(identifier.length ? { identifier } : {}),
      },
    },
  ];
  if (seriesUid) {
    context.push({ key: 'series', resource: { uid: seriesUid } });
  }
  return context;
}

describe('sameOpenImagingStudyContext', () => {
  it('returns false for empty contexts', () => {
    assert.equal(sameOpenImagingStudyContext([], studyContext({ studyUid: '1.2' })), false);
    assert.equal(sameOpenImagingStudyContext(null, studyContext({ studyUid: '1.2' })), false);
  });

  it('matches equal sample ids without needing study UID', () => {
    const a = studyContext({ sampleId: 'sample-a' });
    const b = studyContext({ sampleId: 'sample-a' });
    assert.equal(sameOpenImagingStudyContext(a, b), true);
  });

  it('falls through when sample ids differ but study UIDs match', () => {
    const a = studyContext({ studyUid: '1.2.3', sampleId: 'idc-row' });
    const b = studyContext({ studyUid: '1.2.3', sampleId: '1.2.3' });
    assert.equal(sameOpenImagingStudyContext(a, b), true);
  });

  it('treats empty vs present series as same when study UIDs match', () => {
    const a = studyContext({ studyUid: '1.2.3' });
    const b = studyContext({ studyUid: '1.2.3', seriesUid: '1.2.3.4' });
    assert.equal(sameOpenImagingStudyContext(a, b), true);
  });

  it('matches when both series are equal', () => {
    const a = studyContext({ studyUid: '1.2.3', seriesUid: '1.2.3.4' });
    const b = studyContext({ studyUid: '1.2.3', seriesUid: '1.2.3.4' });
    assert.equal(sameOpenImagingStudyContext(a, b), true);
  });

  it('rejects when both series are present and differ', () => {
    const a = studyContext({ studyUid: '1.2.3', seriesUid: '1.2.3.4' });
    const b = studyContext({ studyUid: '1.2.3', seriesUid: '1.2.3.5' });
    assert.equal(sameOpenImagingStudyContext(a, b), false);
  });

  it('rejects different study UIDs', () => {
    const a = studyContext({ studyUid: '1.2.3' });
    const b = studyContext({ studyUid: '9.9.9' });
    assert.equal(sameOpenImagingStudyContext(a, b), false);
  });
});
