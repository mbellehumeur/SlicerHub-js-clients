/**
 * Open builtin Slicer LiveScene samples in IRA (same ids as worklist slicer-scenes).
 */
import {
  buildFilesImagingStudyOpenContext,
  cloneContextArray,
} from '@slicer-hub/client';
import type { AppState } from '../hub';
import { LOG_PREFIX, REPORTING_ACTOR } from '../config';
import { openHubViewer } from '../viewers';

export type ClassroomSceneKey = 'mrhead' | 'totalsegmentator-ct';

type SceneMeta = {
  id: string;
  name: string;
  modality: string;
  sourceUrl: string;
  blobBase: string;
};

const PATIENT_REFERENCE =
  'Patient/503824b8-fe8c-4227-b061-7181ba6c3926';

export const CLASSROOM_SCENES: Record<ClassroomSceneKey, SceneMeta> = {
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
};

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

/** Publish ImagingStudy-open for a classroom sample and open/focus IRA. */
export async function openClassroomSceneInIra(
  state: AppState,
  key: ClassroomSceneKey
): Promise<boolean> {
  if (!state.client || state.connection !== 'connected') {
    console.warn(`${LOG_PREFIX} open scene: not connected`);
    return false;
  }
  const meta = CLASSROOM_SCENES[key];
  if (!meta) return false;

  try {
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
    const pub = await state.client.publish(payload);
    if (!pub || !pub.ok) {
      console.warn(
        `${LOG_PREFIX} ImagingStudy-open failed`,
        pub ? `HTTP ${pub.status}` : 'No response'
      );
      return false;
    }
    state.lastImagingStudyOpenContext = cloneContextArray(context);
    state.openStudy = {
      sampleId: meta.id,
      openMode: 'files',
      studyUid: '',
      seriesUid: '',
      dicomwebRoot: '',
      fileCount: 1,
      fileNames: [files[0]!.fileName],
    };
    openHubViewer(state, 'ira');
    console.info(`${LOG_PREFIX} opened ${meta.id} in IRA`);
    return true;
  } catch (err) {
    console.error(`${LOG_PREFIX} openClassroomSceneInIra`, err);
    return false;
  }
}
