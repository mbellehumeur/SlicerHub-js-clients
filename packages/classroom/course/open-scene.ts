/**
 * Open classroom sample studies in IRA (LiveScene files or IDC CRDC prefixes).
 */
import {
  buildFilesImagingStudyOpenContext,
  buildIdcImagingStudyOpenContext,
  cloneContextArray,
  HUB_OPEN_MODE_IDC,
} from '@slicer-hub/client';
import type { AppState } from '../hub';
import { LOG_PREFIX, REPORTING_ACTOR } from '../config';
import { openHubViewer } from '../viewers';

export type ClassroomSceneKey =
  | 'mrhead'
  | 'kits-00038'
  | 'totalsegmentator-ct'
  | 'ctaabdomen-panoramix';

type SceneMeta = {
  id: string;
  name: string;
  modality: string;
  sourceUrl: string;
  blobBase: string;
};

type IdcStudyMeta = {
  id: string;
  label: string;
  modality: string;
  c: string;
  s: string;
  cb: string;
  sb: string;
  st: string;
  sd: string;
};

const PATIENT_REFERENCE =
  'Patient/503824b8-fe8c-4227-b061-7181ba6c3926';

export const CLASSROOM_SCENES: Record<
  'mrhead' | 'totalsegmentator-ct' | 'ctaabdomen-panoramix',
  SceneMeta
> = {
  mrhead: {
    id: 'scene-mrhead',
    name: 'MRHead',
    modality: 'MR',
    sourceUrl: 'https://pieper.github.io/live/legacy/scenes/MRHead.json',
    blobBase:
      'https://js2.jetstream-cloud.org:8001/swift/v1/slicerlive/MRHead/blobs/',
  },
  'totalsegmentator-ct': {
    id: 'scene-totalsegmentator-ct',
    name: 'TotalSegmentator-CT',
    modality: 'CT',
    sourceUrl:
      'https://pieper.github.io/live/legacy/scenes/TotalSegmentator-CT.json',
    blobBase:
      'https://js2.jetstream-cloud.org:8001/swift/v1/slicerlive/TotalSegmentator-CT/blobs/',
  },
  'ctaabdomen-panoramix': {
    id: 'scene-ctaabdomen-panoramix',
    name: 'CTAAbdomenPanoramix',
    modality: 'CT',
    sourceUrl: 'https://pieper.github.io/live/scenes/CTAAbdomenPanoramix.json',
    blobBase:
      'https://js2.jetstream-cloud.org:8001/swift/v1/slicerlive/CTAAbdomenPanoramix/blobs/',
  },
};

/** SegRoulette / IDC row: KiTS · c4kc kits · KiTS-00038 */
export const CLASSROOM_IDC_STUDIES: Record<'kits-00038', IdcStudyMeta> = {
  'kits-00038': {
    id: 'segroulette-6470ea4f-f91a-4f48-9b74-c0f57e3017d4',
    label: 'KiTS · c4kc kits · KiTS-00038',
    modality: 'CT',
    c: '6470ea4f-f91a-4f48-9b74-c0f57e3017d4',
    s: '852b3a5e-6dd1-49eb-8568-3608b113ba76',
    cb: 'idc-open-data',
    sb: 'idc-open-data',
    st: '1.3.6.1.4.1.14519.5.2.1.6919.4624.254837938772181795404344051216',
    sd: 'Segmentation',
  },
};

function idcBucketPrefixUrl(bucket: string, crdc: string): string {
  const b = String(bucket || 'idc-open-data').trim() || 'idc-open-data';
  return `https://${b}.s3.amazonaws.com/${crdc}/`;
}

function attachDescription(context: unknown[], description: string): unknown[] {
  const desc = String(description || '').trim();
  if (!desc) return context;
  return context.map((item) => {
    if (!item || typeof item !== 'object') return item;
    const row = item as { key?: unknown; resource?: Record<string, unknown> };
    if (String(row.key || '') !== 'study' || !row.resource) return item;
    return { ...row, resource: { ...row.resource, description: desc } };
  });
}

function attachModality(context: unknown[], modality: string): unknown[] {
  let mod = String(modality || '').trim().toUpperCase();
  if (mod === 'MRI') mod = 'MR';
  if (!mod) return context;
  return context.map((item) => {
    if (!item || typeof item !== 'object') return item;
    const row = item as { key?: unknown; resource?: Record<string, unknown> };
    if (String(row.key || '') !== 'study' || !row.resource) return item;
    if (row.resource.modality != null) return item;
    return {
      ...row,
      resource: {
        ...row.resource,
        modality: [
          {
            coding: [
              {
                system: 'http://dicom.nema.org/resources/ontology/DCM',
                code: mod,
              },
            ],
          },
        ],
      },
    };
  });
}

function attachScene(
  context: unknown[],
  scene: { blobBase: string; nodes: Record<string, unknown>; url?: string }
): unknown[] {
  const without = context.filter((item) => {
    if (!item || typeof item !== 'object') return true;
    return (item as { key?: unknown }).key !== 'scene';
  });
  without.push({ key: 'scene', resource: scene });
  return without;
}

async function fetchLiveSceneDoc(
  meta: SceneMeta
): Promise<{ blobBase: string; nodes: Record<string, unknown>; url: string }> {
  const res = await fetch(meta.sourceUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch scene ${meta.id}: HTTP ${res.status}`);
  }
  const doc = (await res.json()) as Record<string, unknown>;
  const nodes =
    doc.nodes && typeof doc.nodes === 'object'
      ? (doc.nodes as Record<string, unknown>)
      : doc;
  const blobBase =
    String(doc.blobBase || meta.blobBase || '').trim() || meta.blobBase;
  return { blobBase, nodes, url: meta.sourceUrl };
}

async function publishOpenAndShowIra(
  state: AppState,
  context: unknown[],
  openStudy: AppState['openStudy']
): Promise<boolean> {
  const payload = {
    event: {
      'hub.topic': state.topic,
      'hub.event': 'ImagingStudy-open',
      context,
    },
    actor: REPORTING_ACTOR,
    'target.actor': '*',
    'target.product.name': '*',
  };
  const pub = await state.client!.publish(payload);
  if (!pub || !pub.ok) {
    console.warn(
      `${LOG_PREFIX} ImagingStudy-open failed`,
      pub ? `HTTP ${pub.status}` : 'No response'
    );
    return false;
  }
  state.lastImagingStudyOpenContext = cloneContextArray(context);
  state.openStudy = openStudy;
  openHubViewer(state, 'ira');
  return true;
}

async function openLiveSceneInIra(
  state: AppState,
  meta: SceneMeta
): Promise<boolean> {
  const liveScene = await fetchLiveSceneDoc(meta);
  const files = [
    {
      url: meta.sourceUrl,
      fileName: `${meta.name}.json`,
      mimeType: 'application/vnd.slicerlive.scene+json',
      role: 'scene',
      label: meta.name,
    },
  ];
  let context = buildFilesImagingStudyOpenContext({
    id: meta.id,
    files,
    patientReference: PATIENT_REFERENCE,
  }) as unknown[];
  context = attachDescription(context, meta.name);
  context = attachModality(context, meta.modality);
  context = attachScene(context, liveScene);
  return publishOpenAndShowIra(state, context, {
    sampleId: meta.id,
    openMode: 'files',
    studyUid: '',
    seriesUid: '',
    dicomwebRoot: '',
    fileCount: 1,
    fileNames: [files[0]!.fileName],
  });
}

async function openIdcStudyInIra(
  state: AppState,
  meta: IdcStudyMeta
): Promise<boolean> {
  const bucket = meta.cb || 'idc-open-data';
  const segBucket = meta.sb || bucket;
  const files: Array<{
    url: string;
    fileName: string;
    label: string;
    role: string;
  }> = [
    {
      url: idcBucketPrefixUrl(bucket, meta.c),
      fileName: `${meta.c}/`,
      label: String(meta.modality || 'CT').toUpperCase(),
      role: 'volume',
    },
  ];
  if (meta.s) {
    files.push({
      url: idcBucketPrefixUrl(segBucket, meta.s),
      fileName: `${meta.s}/`,
      label: 'SEG',
      role: 'seg',
    });
  }
  let context = buildIdcImagingStudyOpenContext({
    id: meta.id,
    studyInstanceUID: meta.st || `urn:segroulette:${meta.c}`,
    seriesInstanceUID: meta.c,
    sourceBucket: 'aws',
    patientReference: PATIENT_REFERENCE,
    files,
  }) as unknown[];
  context = attachDescription(context, meta.label);
  context = attachModality(context, meta.modality);
  return publishOpenAndShowIra(state, context, {
    sampleId: meta.id,
    openMode: HUB_OPEN_MODE_IDC,
    studyUid: meta.st || '',
    seriesUid: meta.c,
    dicomwebRoot: '',
    fileCount: files.length,
    fileNames: files.map((f) => f.fileName),
  });
}

/** Publish ImagingStudy-open for a classroom sample and open/focus IRA. */
export async function openClassroomSceneInIra(
  state: AppState,
  key: ClassroomSceneKey
): Promise<boolean> {
  if (!state.client || state.connection !== 'connected') {
    console.warn(`${LOG_PREFIX} open scene: not connected`);
    return false;
  }
  try {
    if (
      key === 'mrhead' ||
      key === 'totalsegmentator-ct' ||
      key === 'ctaabdomen-panoramix'
    ) {
      const meta = CLASSROOM_SCENES[key];
      const ok = await openLiveSceneInIra(state, meta);
      if (ok) console.info(`${LOG_PREFIX} opened ${meta.id} in IRA`);
      return ok;
    }
    if (key === 'kits-00038') {
      const meta = CLASSROOM_IDC_STUDIES['kits-00038'];
      const ok = await openIdcStudyInIra(state, meta);
      if (ok) console.info(`${LOG_PREFIX} opened ${meta.id} in IRA`);
      return ok;
    }
    return false;
  } catch (err) {
    console.error(`${LOG_PREFIX} openClassroomSceneInIra`, err);
    return false;
  }
}
