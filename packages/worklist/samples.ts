import {
  buildIdcImagingStudyOpenContext,
  HUB_OPEN_MODE_DICOMWEB,
  HUB_OPEN_MODE_DICOM_URL,
  HUB_OPEN_MODE_FILES,
  HUB_OPEN_MODE_IDC,
} from '@slicer-hub/client';
import {
  PATIENT_REFERENCE,
  WORKLIST_ORG_IDC_SEG,
  WORKLIST_ORG_IDC_WSI,
  WORKLIST_ORG_MINE,
  WORKLIST_ORG_SLICER_SCENES,
  WORKLIST_ORG_CBCT_DENTAL,
  WORKLIST_ORG_TXRV,
  WORKLIST_ORG_FLEXRAY,
  WORKLIST_ORG_3D_SLICER,
  IDC_CATEGORIES,
  IDC_KITS_CATEGORY,
  idcApplyModalitySplit,
  idcBodyRegionsForCategories,
  idcCategoryFromFilterValue,
  idcChestSubcategoryForCollection,
} from './config';
import {
  entriesForBodyRegions,
  humanizeCollection,
  loadIdcEnrichedCatalog,
  loadWorklistCatalogRows,
  type SegrouletteEntry,
} from './segroulette-catalog';

/** Embedded LiveScene document (blobBase + nodes), same shape as scene JSON. */
export type WorklistLiveSceneDoc = {
  blobBase?: string;
  nodes?: Record<string, unknown>;
  url?: string;
  mrson?: string;
  [key: string]: unknown;
};

export type WorklistSample = {
  id: string;
  name: string;
  description?: string;
  size?: string;
  format?: string;
  organization: string;
  /** IDC category (SegRoulette body-region primary token), for category filters. */
  idcCategory?: string;
  /** e.g. CT, SEG */
  modalities?: string[];
  filename?: string;
  url?: string;
  files?: Array<{
    url: string;
    fileName?: string;
    role?: string;
    label?: string;
    mimeType?: string;
  }>;
  studyInstanceUID?: string;
  seriesInstanceUID?: string;
  openMode?: string;
  dicomwebRoot?: string;
  openDisabled?: boolean;
  openDisabledReason?: string;
  /** Embedded LiveScene body for org: slicer-scenes (and similar). */
  scene?: WorklistLiveSceneDoc;
  /** Provenance URL the scene was imported from (optional). */
  sourceUrl?: string;
  /** IDC direct-S3 (SegRoulette) */
  ctCrdc?: string;
  segCrdc?: string;
  bucket?: string;
  segBucket?: string;
  /** Raw SegRoulette catalog row, for hover details. */
  segroulette?: SegrouletteEntry;
};

const FORMAT_DICOM = 'DICOM';
const FORMAT_NIFTI = 'NifTI';
const FORMAT_NRRD = 'Nrrd';
const FORMAT_SLICERLIVE = 'SlicerLive';
const FORMAT_LIVESCENE = 'LiveScene';
const LIVESCENE_MIME = 'application/vnd.slicerlive.scene+json';

function idcBucketPrefixUrl(bucket: string, crdc: string): string {
  const b = String(bucket || 'idc-open-data').trim() || 'idc-open-data';
  return `https://${b}.s3.amazonaws.com/${crdc}/`;
}

/** Put FHIR ImagingStudy.description on the study context item. */
export function attachImagingStudyDescription(
  context: unknown[],
  description: string | undefined
): unknown[] {
  const desc = String(description || '').trim();
  if (!desc || !Array.isArray(context)) return context;
  return context.map((item) => {
    if (!item || typeof item !== 'object') return item;
    const row = item as { key?: unknown; resource?: Record<string, unknown> };
    if (String(row.key || '') !== 'study' || !row.resource) return item;
    return {
      ...row,
      resource: { ...row.resource, description: desc },
    };
  });
}

/** Put ImagingStudy.modality coding on the study context item (CT / MR / PT / CR / DX). */
export function attachImagingStudyModality(
  context: unknown[],
  modality: string | undefined
): unknown[] {
  let mod = String(modality || '').trim().toUpperCase();
  if (mod === 'MRI') mod = 'MR';
  if (mod === 'PET') mod = 'PT';
  if (!mod || !Array.isArray(context)) return context;
  if (
    mod !== 'CT' &&
    mod !== 'MR' &&
    mod !== 'PT' &&
    mod !== 'NM' &&
    mod !== 'CR' &&
    mod !== 'DX'
  ) {
    return context;
  }
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

/** Attach or replace ImagingStudy-open `{ key: "scene", resource }` from an embedded LiveScene. */
export function attachLiveSceneToContext(
  context: unknown[],
  scene: WorklistLiveSceneDoc | undefined
): unknown[] {
  if (!scene || typeof scene !== 'object' || !Array.isArray(context)) {
    return context;
  }
  const nodes = scene.nodes;
  const blobBase = String(scene.blobBase || '').trim();
  if (!nodes || typeof nodes !== 'object' || !blobBase) return context;
  const resource: WorklistLiveSceneDoc = { ...scene, blobBase, nodes };
  const withoutScene = context.filter((item) => {
    if (!item || typeof item !== 'object') return true;
    return (item as { key?: unknown }).key !== 'scene';
  });
  withoutScene.push({ key: 'scene', resource });
  return withoutScene;
}

/** Build a LiveScene resource from a worklist sample (embedded or URL fallback). */
export function liveSceneDocFromSample(
  sample: WorklistSample
): WorklistLiveSceneDoc | null {
  const scene = sample.scene;
  if (scene && typeof scene === 'object') {
    const nodes = scene.nodes;
    const blobBase = String(scene.blobBase || '').trim();
    if (nodes && typeof nodes === 'object' && blobBase) {
      const url =
        String(scene.url || sample.sourceUrl || sample.url || '').trim() ||
        undefined;
      return { ...scene, blobBase, nodes, ...(url ? { url } : {}) };
    }
  }
  return null;
}

/** ImagingStudy-open context: open-mode `idc` with CRDC prefix URLs (not per-.dcm lists). */
export function buildIdcDirectImagingStudyOpenContext(
  entry: SegrouletteEntry,
  sampleId: string
): unknown[] {
  const bucket = entry.cb || 'idc-open-data';
  const segBucket = entry.sb || bucket;
  const files: Array<{
    url: string;
    fileName: string;
    label: string;
    role: string;
  }> = [
    {
      url: idcBucketPrefixUrl(bucket, entry.c),
      fileName: `${entry.c}/`,
      label: String(entry.m || 'CT').toUpperCase(),
      role: 'volume',
    },
  ];
  if (entry.s) {
    files.push({
      url: idcBucketPrefixUrl(segBucket, entry.s),
      fileName: `${entry.s}/`,
      label: 'SEG',
      role: 'seg',
    });
  }
  return attachImagingStudyModality(
    attachImagingStudyDescription(
      buildIdcImagingStudyOpenContext({
        id: sampleId,
        studyInstanceUID: entry.st || `urn:segroulette:${entry.c}`,
        seriesInstanceUID: entry.c,
        sourceBucket: 'aws',
        patientReference: PATIENT_REFERENCE,
        files,
      }),
      entry.sd
    ),
    entry.m
  );
}

export function segrouletteSampleId(entry: SegrouletteEntry): string {
  return `segroulette-${entry.c}`;
}

export function worklistSampleFromSegrouletteEntry(
  entry: SegrouletteEntry,
  bodyRegion?: string,
  organization: string = WORKLIST_ORG_IDC_SEG,
  idcCategory?: string
): WorklistSample {
  const id = segrouletteSampleId(entry);
  const col = humanizeCollection(entry.col);
  const sd = String(entry.sd || 'SEG').trim();
  const region = String(bodyRegion || '').trim();
  const patient = String(entry.pid || '').trim();
  const seriesTag = patient || String(entry.c || '').slice(0, 8);
  const name = region
    ? `${region} · ${col} · ${seriesTag}`
    : `${col} · ${seriesTag}`;
  const size =
    entry.sizeMB != null && Number.isFinite(Number(entry.sizeMB))
      ? `${Math.ceil(Number(entry.sizeMB))} MB`
      : undefined;
  const modalities =
    Array.isArray(entry.modalities) && entry.modalities.length
      ? entry.modalities.map((x) => String(x).toUpperCase())
      : [String(entry.m || '?').toUpperCase()];
  const category =
    String(idcCategory || '').trim() || region || undefined;
  return {
    id,
    name,
    description: sd,
    size,
    format: FORMAT_DICOM,
    organization,
    idcCategory: category,
    modalities,
    studyInstanceUID: entry.st,
    seriesInstanceUID: entry.c,
    openMode: HUB_OPEN_MODE_IDC,
    ctCrdc: entry.c,
    segCrdc: entry.s,
    bucket: entry.cb || 'idc-open-data',
    segBucket: entry.sb || entry.cb || 'idc-open-data',
    segroulette: { ...entry },
    files: [
      {
        url: idcBucketPrefixUrl(entry.cb || 'idc-open-data', entry.c),
        fileName: `${entry.c}/`,
      },
      ...(entry.s
        ? [
            {
              url: idcBucketPrefixUrl(
                entry.sb || entry.cb || 'idc-open-data',
                entry.s
              ),
              fileName: `${entry.s}/`,
            },
          ]
        : []),
    ],
  };
}

export function isIdcSegmentationSample(
  sample: WorklistSample | undefined
): boolean {
  return sample?.organization === WORKLIST_ORG_IDC_SEG;
}

export function worklistSampleModalitiesLabel(sample: WorklistSample): string {
  const fromSample = Array.isArray(sample.modalities)
    ? sample.modalities.map((x) => String(x).trim()).filter(Boolean)
    : [];
  if (fromSample.length) return fromSample.join(', ');
  const fromEntry = sample.segroulette?.modalities;
  if (Array.isArray(fromEntry) && fromEntry.length) {
    return fromEntry.map((x) => String(x).trim()).filter(Boolean).join(', ');
  }
  const m = String(sample.segroulette?.m || '').trim();
  return m || '—';
}

export function isMyWorklistSample(
  sample: WorklistSample | undefined
): boolean {
  return sample?.organization === WORKLIST_ORG_MINE;
}

/** @deprecated alias */
export const isSegrouletteSample = isIdcSegmentationSample;

function sampleSizeSortKey(sample: WorklistSample): [number, number] {
  const n = Number(sample.segroulette?.sizeMB);
  if (!Number.isFinite(n)) return [1, 0];
  return [0, n];
}

function isKitsCollection(col: string | undefined): boolean {
  return String(col || '').trim() === IDC_KITS_CATEGORY.collectionId;
}

/** Build worklist samples from the enriched catalog (runtime CHEST/KiTS/modality map + size sort). */
async function loadIdcSegmentationStudiesFromEnriched(): Promise<WorklistSample[]> {
  const catalog = await loadIdcEnrichedCatalog();
  const bodyRegions = idcBodyRegionsForCategories(IDC_CATEGORIES);
  const picked = entriesForBodyRegions(catalog, bodyRegions);
  const samples = picked.map(({ entry, region }) => {
    let baseId: string;
    let namePrefix: string;
    if (isKitsCollection(entry.col)) {
      baseId = IDC_KITS_CATEGORY.id;
      namePrefix = IDC_KITS_CATEGORY.namePrefix;
    } else if (region === 'CHEST') {
      const sub = idcChestSubcategoryForCollection(entry.col);
      baseId = sub.id;
      namePrefix = sub.namePrefix;
    } else {
      baseId = region;
      namePrefix = region;
    }
    const split = idcApplyModalitySplit(baseId, namePrefix, String(entry.m || ''));
    return worklistSampleFromSegrouletteEntry(
      entry,
      split.namePrefix,
      WORKLIST_ORG_IDC_SEG,
      split.id
    );
  });
  samples.sort((a, b) => {
    const [af, av] = sampleSizeSortKey(a);
    const [bf, bv] = sampleSizeSortKey(b);
    return af - bf || av - bv;
  });
  return samples;
}

/** All series for each IDC category filter from the slim, pre-sorted worklist catalog. */
export async function loadIdcSegmentationStudies(): Promise<WorklistSample[]> {
  try {
    const rows = await loadWorklistCatalogRows();
    const allowed = new Set(IDC_CATEGORIES);
    const samples: WorklistSample[] = [];
    for (const entry of rows) {
      const category = String(entry.idcCategory || '').trim().toUpperCase();
      if (!category || !allowed.has(category)) continue;
      const namePrefix =
        String(entry.namePrefix || '').trim() ||
        (category.startsWith('CHEST:')
          ? idcChestSubcategoryForCollection(entry.col).namePrefix
          : category === IDC_KITS_CATEGORY.id
            ? IDC_KITS_CATEGORY.namePrefix
            : category);
      samples.push(
        worklistSampleFromSegrouletteEntry(
          entry,
          namePrefix,
          WORKLIST_ORG_IDC_SEG,
          category
        )
      );
    }
    return samples;
  } catch {
    return loadIdcSegmentationStudiesFromEnriched();
  }
}

export function isDicomwebWorklistSample(sample: WorklistSample): boolean {
  return (
    String(sample?.openMode || '').trim() === HUB_OPEN_MODE_DICOMWEB &&
    Boolean(sample?.studyInstanceUID?.trim())
  );
}

export function worklistSampleFiles(sample: WorklistSample) {
  if (Array.isArray(sample.files) && sample.files.length > 0) {
    return sample.files;
  }
  return [{ url: sample.url || '', fileName: sample.filename }];
}

function normalizeFormatLabel(value: unknown): string {
  const trimmed = String(value || '').trim();
  if (!trimmed) return '';
  const lower = trimmed.toLowerCase();
  if (lower === 'dicom') return FORMAT_DICOM;
  if (lower === 'nifti') return FORMAT_NIFTI;
  if (lower === 'nrrd') return FORMAT_NRRD;
  if (lower === 'slicerlive' || lower === 'slicer live') return FORMAT_SLICERLIVE;
  if (lower === 'livescene' || lower === 'live scene') return FORMAT_LIVESCENE;
  return trimmed;
}

function formatFromFileName(fileName: string): string {
  const lower = String(fileName || '')
    .trim()
    .toLowerCase();
  if (!lower) return '';
  if (lower.endsWith('.nii') || lower.endsWith('.nii.gz')) return FORMAT_NIFTI;
  if (
    lower.endsWith('.nrrd') ||
    lower.endsWith('.nhdr') ||
    lower.endsWith('.raw.gz')
  ) {
    return FORMAT_NRRD;
  }
  if (
    lower.endsWith('.dcm') ||
    lower.endsWith('.dicom') ||
    lower.endsWith('.ima') ||
    lower.endsWith('.zip')
  ) {
    return FORMAT_DICOM;
  }
  if (lower.endsWith('.json')) return FORMAT_LIVESCENE;
  return '';
}

export function worklistSampleFormatLabel(sample: WorklistSample): string {
  const explicit = normalizeFormatLabel(sample?.format);
  if (explicit) return explicit;
  if (
    sample?.openMode === HUB_OPEN_MODE_DICOM_URL ||
    sample?.openMode === HUB_OPEN_MODE_IDC ||
    sample?.studyInstanceUID
  ) {
    return FORMAT_DICOM;
  }
  const names: string[] = [];
  if (Array.isArray(sample?.files)) {
    for (const file of sample.files) {
      if (file?.fileName) names.push(file.fileName);
    }
  }
  if (sample?.filename) names.push(sample.filename);
  const formats = [
    ...new Set(names.map(formatFromFileName).filter(Boolean)),
  ];
  if (formats.length === 1) return formats[0];
  if (formats.length > 1) {
    if (formats.includes(FORMAT_NIFTI)) return FORMAT_NIFTI;
    return formats[0];
  }
  return '—';
}

export function isWorklistSampleActionDisabled(sample: WorklistSample): boolean {
  if (worklistSampleFormatLabel(sample) === FORMAT_NRRD) return true;
  return Boolean(sample?.openDisabled);
}

export function worklistSampleActionDisabledReason(
  sample: WorklistSample
): string {
  if (worklistSampleFormatLabel(sample) === FORMAT_NRRD) {
    return 'Nrrd format is not supported yet';
  }
  if (sample?.openDisabled) {
    return (
      String(sample.openDisabledReason || '').trim() ||
      'This study cannot be opened yet'
    );
  }
  return '';
}

export function withoutIdcSegmentationSamples(
  studies: WorklistSample[]
): WorklistSample[] {
  return studies.filter((s) => !isIdcSegmentationSample(s));
}

/** Insert or replace one IDC-segmentation sample (e.g. Add to worklist). */
export function upsertIdcSegmentationSample(
  studies: WorklistSample[],
  sample: WorklistSample
): WorklistSample[] {
  const idx = studies.findIndex((s) => s.id === sample.id);
  if (idx >= 0) {
    const next = studies.slice();
    next[idx] = sample;
    return next;
  }
  return [...studies, sample];
}

/** Replace all IDC-segmentation rows with a fresh catalog mapping. */
export function replaceIdcSegmentationStudies(
  studies: WorklistSample[],
  idcSamples: WorklistSample[]
): WorklistSample[] {
  return [...withoutIdcSegmentationSamples(studies), ...idcSamples];
}

export function isIdcWsiSample(sample: WorklistSample | undefined): boolean {
  return sample?.organization === WORKLIST_ORG_IDC_WSI;
}

export function withoutIdcWsiSamples(
  studies: WorklistSample[]
): WorklistSample[] {
  return studies.filter((s) => !isIdcWsiSample(s));
}

/** Replace all IDC WSI rows with a fresh manifest mapping. */
export function replaceIdcWsiStudies(
  studies: WorklistSample[],
  wsiSamples: WorklistSample[]
): WorklistSample[] {
  return [...withoutIdcWsiSamples(studies), ...wsiSamples];
}

export function isSlicerSceneSample(
  sample: WorklistSample | undefined
): boolean {
  return sample?.organization === WORKLIST_ORG_SLICER_SCENES;
}

export function isSlicerDicomSample(
  sample: WorklistSample | undefined
): boolean {
  return sample?.organization === WORKLIST_ORG_3D_SLICER;
}

export function withoutSlicerDicomSamples(
  studies: WorklistSample[]
): WorklistSample[] {
  return studies.filter((s) => !isSlicerDicomSample(s));
}

/** Replace all 3D Slicer DICOM DB rows with a fresh STATUS mapping. */
export function replaceSlicerDicomStudies(
  studies: WorklistSample[],
  slicerSamples: WorklistSample[]
): WorklistSample[] {
  return [...withoutSlicerDicomSamples(studies), ...slicerSamples];
}

type SlicerStatusStudyRow = {
  id?: string;
  name?: string;
  description?: string;
  size?: string;
  format?: string;
  organization?: string;
  studyInstanceUID?: string;
  seriesInstanceUID?: string;
  modalities?: unknown;
  openMode?: string;
};

/** Map STATUS ``studies`` rows from 3DSLICER-ID into WorklistSample. */
export function worklistSamplesFromSlicerStatusStudies(
  rows: unknown
): WorklistSample[] {
  if (!Array.isArray(rows)) return [];
  const out: WorklistSample[] = [];
  for (const entry of rows as SlicerStatusStudyRow[]) {
    const studyInstanceUID = String(entry?.studyInstanceUID || '').trim();
    const openMode = String(entry?.openMode || '').trim();
    const id =
      String(entry?.id || '').trim() ||
      (studyInstanceUID ? `slicer-dicom:${studyInstanceUID}` : '');
    if (!id) continue;
    // LiveScene row has no StudyInstanceUID; DICOM rows require one.
    if (openMode !== 'live-scene' && !studyInstanceUID) continue;
    const modalities = Array.isArray(entry?.modalities)
      ? entry.modalities
          .map((m) => String(m || '').trim())
          .filter(Boolean)
      : undefined;
    out.push({
      id,
      name: String(entry?.name || id).trim() || id,
      description: String(entry?.description || '').trim() || undefined,
      size: String(entry?.size || '').trim() || undefined,
      format:
        String(entry?.format || (openMode === 'live-scene' ? 'LiveScene' : 'DICOM')).trim() ||
        'DICOM',
      organization: WORKLIST_ORG_3D_SLICER,
      modalities,
      studyInstanceUID: studyInstanceUID || undefined,
      seriesInstanceUID:
        String(entry?.seriesInstanceUID || '').trim() || undefined,
      openMode: openMode || 'local-dicom',
    });
  }
  return out;
}

export function withoutSlicerSceneSamples(
  studies: WorklistSample[]
): WorklistSample[] {
  return studies.filter((s) => !isSlicerSceneSample(s));
}

/** Replace all Slicer scene rows with a fresh manifest mapping. */
export function replaceSlicerSceneStudies(
  studies: WorklistSample[],
  sceneSamples: WorklistSample[]
): WorklistSample[] {
  return [...withoutSlicerSceneSamples(studies), ...sceneSamples];
}

export function isCbctDentalSample(
  sample: WorklistSample | undefined
): boolean {
  return sample?.organization === WORKLIST_ORG_CBCT_DENTAL;
}

export function withoutCbctDentalSamples(
  studies: WorklistSample[]
): WorklistSample[] {
  return studies.filter((s) => !isCbctDentalSample(s));
}

/** Replace all CBCT Dental rows with a fresh manifest mapping. */
export function replaceCbctDentalStudies(
  studies: WorklistSample[],
  dentalSamples: WorklistSample[]
): WorklistSample[] {
  return [...withoutCbctDentalSamples(studies), ...dentalSamples];
}

type CbctDentalManifestFile = {
  url?: string;
  fileName?: string;
  role?: string;
  label?: string;
  mimeType?: string;
};

type CbctDentalManifestStudy = {
  id?: string;
  name?: string;
  description?: string;
  size?: string;
  format?: string;
  modalities?: unknown;
  openMode?: string;
  files?: CbctDentalManifestFile[];
  url?: string;
  filename?: string;
};

type CbctDentalManifest = {
  studies?: CbctDentalManifestStudy[];
};

/** Load builtin CBCT Dental volume studies (org: cbct-dental). */
export async function loadCbctDentalStudies(): Promise<WorklistSample[]> {
  const res = await fetch('./cbct-dental-manifest.json');
  if (!res.ok) {
    throw new Error(`Failed to load CBCT Dental manifest (${res.status})`);
  }
  const data = (await res.json()) as CbctDentalManifest;
  const rows = Array.isArray(data.studies) ? data.studies : [];
  const out: WorklistSample[] = [];
  for (const entry of rows) {
    const id = String(entry?.id || '').trim();
    if (!id) continue;
    const files = Array.isArray(entry.files)
      ? entry.files
          .map((f) => {
            const url = String(f?.url || '').trim();
            const fileName = String(f?.fileName || '').trim() || undefined;
            const role = String(f?.role || '').trim() || undefined;
            const label = String(f?.label || '').trim() || undefined;
            const mimeType = String(f?.mimeType || '').trim() || undefined;
            return { url, fileName, role, label, mimeType };
          })
          .filter((f) => f.url)
      : [];
    const fallbackUrl = String(entry.url || '').trim();
    if (!files.length && fallbackUrl) {
      files.push({
        url: fallbackUrl,
        fileName:
          String(entry.filename || '').trim() ||
          fallbackUrl.split('/').pop() ||
          'volume.nii.gz',
      });
    }
    if (!files.length) continue;
    const modalities = Array.isArray(entry.modalities)
      ? entry.modalities.map((m) => String(m).toUpperCase()).filter(Boolean)
      : ['CT'];
    out.push({
      id,
      name: String(entry.name || id).trim() || id,
      description:
        String(entry.description || '').trim() || 'CBCT Dental sample',
      size: String(entry.size || '').trim() || undefined,
      format: String(entry.format || FORMAT_NIFTI).trim() || FORMAT_NIFTI,
      organization: WORKLIST_ORG_CBCT_DENTAL,
      modalities,
      openMode:
        String(entry.openMode || HUB_OPEN_MODE_FILES).trim() ||
        HUB_OPEN_MODE_FILES,
      files,
      url: files[0]?.url,
      filename: files[0]?.fileName,
    });
  }
  return out;
}

export function isTxrvSample(sample: WorklistSample | undefined): boolean {
  return sample?.organization === WORKLIST_ORG_TXRV;
}

export function withoutTxrvSamples(
  studies: WorklistSample[]
): WorklistSample[] {
  return studies.filter((s) => !isTxrvSample(s));
}

/** Replace all TorchXRayVision rows with a fresh manifest mapping. */
export function replaceTxrvStudies(
  studies: WorklistSample[],
  txrvSamples: WorklistSample[]
): WorklistSample[] {
  return [...withoutTxrvSamples(studies), ...txrvSamples];
}

type TxrvManifestStudy = {
  id?: string;
  name?: string;
  description?: string;
  size?: string;
  format?: string;
  modalities?: unknown;
  openMode?: string;
  studyInstanceUID?: string;
  seriesInstanceUID?: string;
  ctCrdc?: string;
  bucket?: string;
  collection?: string;
};

type TxrvManifest = {
  studies?: TxrvManifestStudy[];
};

/** Load builtin TorchXRayVision CXR studies (org: torchxrayvision). */
export async function loadTxrvStudies(): Promise<WorklistSample[]> {
  const res = await fetch('./torchxrayvision-manifest.json');
  if (!res.ok) {
    throw new Error(
      `Failed to load TorchXRayVision manifest (${res.status})`
    );
  }
  const data = (await res.json()) as TxrvManifest;
  const rows = Array.isArray(data.studies) ? data.studies : [];
  const out: WorklistSample[] = [];
  for (const entry of rows) {
    const id = String(entry?.id || '').trim();
    const studyInstanceUID = String(entry?.studyInstanceUID || '').trim();
    const seriesInstanceUID = String(entry?.seriesInstanceUID || '').trim();
    const ctCrdc =
      String(entry?.ctCrdc || '').trim() || seriesInstanceUID;
    if (!id || !ctCrdc) continue;
    const modalities = Array.isArray(entry.modalities)
      ? entry.modalities.map((m) => String(m).toUpperCase()).filter(Boolean)
      : ['DX'];
    const bucket =
      String(entry.bucket || '').trim() || 'idc-open-data';
    out.push({
      id,
      name: String(entry.name || id).trim() || id,
      description:
        String(entry.description || '').trim() ||
        'TorchXRayVision CXR sample',
      size: String(entry.size || '').trim() || undefined,
      format: String(entry.format || FORMAT_DICOM).trim() || FORMAT_DICOM,
      organization: WORKLIST_ORG_TXRV,
      modalities,
      studyInstanceUID: studyInstanceUID || undefined,
      seriesInstanceUID: seriesInstanceUID || undefined,
      openMode:
        String(entry.openMode || HUB_OPEN_MODE_IDC).trim() ||
        HUB_OPEN_MODE_IDC,
      ctCrdc,
      bucket,
      files: [
        {
          url: idcBucketPrefixUrl(bucket, ctCrdc),
          fileName: `${ctCrdc}/`,
          role: 'volume',
        },
      ],
    });
  }
  return out;
}

export function isFlexraySample(sample: WorklistSample | undefined): boolean {
  return sample?.organization === WORKLIST_ORG_FLEXRAY;
}

export function withoutFlexraySamples(
  studies: WorklistSample[]
): WorklistSample[] {
  return studies.filter((s) => !isFlexraySample(s));
}

/** Replace all FleXray rows with a fresh manifest mapping. */
export function replaceFlexrayStudies(
  studies: WorklistSample[],
  flexraySamples: WorklistSample[]
): WorklistSample[] {
  return [...withoutFlexraySamples(studies), ...flexraySamples];
}

type FlexrayManifestStudy = TxrvManifestStudy;

type FlexrayManifest = {
  studies?: FlexrayManifestStudy[];
};

/** Load builtin FleXray CR/DX studies (org: flexray). */
export async function loadFlexrayStudies(): Promise<WorklistSample[]> {
  const res = await fetch('./flexray-manifest.json');
  if (!res.ok) {
    throw new Error(`Failed to load FleXray manifest (${res.status})`);
  }
  const data = (await res.json()) as FlexrayManifest;
  const rows = Array.isArray(data.studies) ? data.studies : [];
  const out: WorklistSample[] = [];
  for (const entry of rows) {
    const id = String(entry?.id || '').trim();
    const studyInstanceUID = String(entry?.studyInstanceUID || '').trim();
    const seriesInstanceUID = String(entry?.seriesInstanceUID || '').trim();
    const ctCrdc =
      String(entry?.ctCrdc || '').trim() || seriesInstanceUID;
    if (!id || !ctCrdc) continue;
    const modalities = Array.isArray(entry.modalities)
      ? entry.modalities.map((m) => String(m).toUpperCase()).filter(Boolean)
      : ['DX'];
    const bucket =
      String(entry.bucket || '').trim() || 'idc-open-data';
    out.push({
      id,
      name: String(entry.name || id).trim() || id,
      description:
        String(entry.description || '').trim() ||
        'FleXray CR/DX sample',
      size: String(entry.size || '').trim() || undefined,
      format: String(entry.format || FORMAT_DICOM).trim() || FORMAT_DICOM,
      organization: WORKLIST_ORG_FLEXRAY,
      modalities,
      studyInstanceUID: studyInstanceUID || undefined,
      seriesInstanceUID: seriesInstanceUID || undefined,
      openMode:
        String(entry.openMode || HUB_OPEN_MODE_IDC).trim() ||
        HUB_OPEN_MODE_IDC,
      ctCrdc,
      bucket,
      files: [
        {
          url: idcBucketPrefixUrl(bucket, ctCrdc),
          fileName: `${ctCrdc}/`,
          role: 'volume',
        },
      ],
    });
  }
  return out;
}

type IdcWsiManifestStudy = {
  id?: string;
  name?: string;
  description?: string;
  size?: string;
  format?: string;
  openMode?: string;
  dicomwebRoot?: string;
  studyInstanceUID?: string;
  seriesInstanceUID?: string;
};

type IdcWsiManifest = {
  dicomwebRoot?: string;
  studies?: IdcWsiManifestStudy[];
};

/** Load builtin IDC whole-slide imaging studies (DICOMweb / SM). */
export async function loadIdcWsiStudies(): Promise<WorklistSample[]> {
  const res = await fetch('./idc-wsi-manifest.json');
  if (!res.ok) {
    throw new Error(`Failed to load IDC WSI manifest (${res.status})`);
  }
  const data = (await res.json()) as IdcWsiManifest;
  const root = String(data.dicomwebRoot || '').trim();
  const rows = Array.isArray(data.studies) ? data.studies : [];
  const out: WorklistSample[] = [];
  for (const entry of rows) {
    const id = String(entry?.id || '').trim();
    const studyInstanceUID = String(entry?.studyInstanceUID || '').trim();
    if (!id || !studyInstanceUID) continue;
    out.push({
      id,
      name: String(entry.name || id).trim() || id,
      description:
        String(entry.description || '').trim() ||
        'IDC whole slide microscopy',
      size: String(entry.size || '').trim() || undefined,
      format: String(entry.format || 'DICOM').trim() || 'DICOM',
      organization: WORKLIST_ORG_IDC_WSI,
      modalities: ['SM'],
      studyInstanceUID,
      seriesInstanceUID:
        String(entry.seriesInstanceUID || '').trim() || undefined,
      openMode:
        String(entry.openMode || HUB_OPEN_MODE_DICOMWEB).trim() ||
        HUB_OPEN_MODE_DICOMWEB,
      dicomwebRoot:
        String(entry.dicomwebRoot || root).trim() || root || undefined,
    });
  }
  return out;
}

type SlicerSceneManifestStudy = {
  id?: string;
  name?: string;
  description?: string;
  size?: string;
  format?: string;
  openMode?: string;
  modalities?: string[];
  sourceUrl?: string;
  blobBase?: string;
  nodes?: Record<string, unknown>;
  mrson?: string;
  files?: Array<{
    url?: string;
    fileName?: string;
    role?: string;
    label?: string;
    mimeType?: string;
  }>;
};

type SlicerSceneManifest = {
  studies?: SlicerSceneManifestStudy[];
};

function embeddedSceneFromManifestStudy(
  entry: SlicerSceneManifestStudy
): WorklistLiveSceneDoc | null {
  const nodes = entry.nodes;
  const blobBase = String(entry.blobBase || '').trim();
  if (!nodes || typeof nodes !== 'object' || !blobBase) return null;
  const scene: WorklistLiveSceneDoc = { blobBase, nodes };
  const sourceUrl = String(entry.sourceUrl || '').trim();
  if (sourceUrl) scene.url = sourceUrl;
  if (typeof entry.mrson === 'string' && entry.mrson.trim()) {
    scene.mrson = entry.mrson.trim();
  }
  return scene;
}

/** Load builtin SlicerLive scene studies (org: slicer-scenes). */
export async function loadSlicerSceneStudies(): Promise<WorklistSample[]> {
  const res = await fetch('./slicer-scenes-manifest.json');
  if (!res.ok) {
    throw new Error(`Failed to load Slicer scenes manifest (${res.status})`);
  }
  const data = (await res.json()) as SlicerSceneManifest;
  const rows = Array.isArray(data.studies) ? data.studies : [];
  const out: WorklistSample[] = [];
  for (const entry of rows) {
    const id = String(entry?.id || '').trim();
    const scene = embeddedSceneFromManifestStudy(entry);
    const sourceUrl = String(entry.sourceUrl || '').trim();
    const files = Array.isArray(entry.files)
      ? entry.files
          .map((f) => {
            const url = String(f?.url || '').trim();
            const fileName = String(f?.fileName || '').trim() || undefined;
            const role = String(f?.role || '').trim() || 'scene';
            const label = String(f?.label || '').trim() || undefined;
            const mimeType =
              String(f?.mimeType || '').trim() || LIVESCENE_MIME;
            return { url, fileName, role, label, mimeType };
          })
          .filter((f) => f.url)
      : [];
    // Provenance URL as optional files[] fallback for legacy consumers.
    if (!files.length && sourceUrl) {
      let fileName = 'scene.json';
      try {
        const base = new URL(sourceUrl).pathname.split('/').pop();
        if (base) fileName = base;
      } catch {
        /* keep default */
      }
      files.push({
        url: sourceUrl,
        fileName,
        role: 'scene',
        label: 'LiveScene',
        mimeType: LIVESCENE_MIME,
      });
    }
    if (!id || (!scene && !files.length)) continue;
    const modalities = Array.isArray(entry.modalities)
      ? entry.modalities.map((m) => String(m).toUpperCase()).filter(Boolean)
      : ['CT'];
    out.push({
      id,
      name: String(entry.name || id).trim() || id,
      description:
        String(entry.description || '').trim() || 'LiveScene sample',
      size: String(entry.size || '').trim() || undefined,
      format:
        String(entry.format || FORMAT_LIVESCENE).trim() || FORMAT_LIVESCENE,
      organization: WORKLIST_ORG_SLICER_SCENES,
      modalities,
      openMode:
        String(entry.openMode || HUB_OPEN_MODE_FILES).trim() ||
        HUB_OPEN_MODE_FILES,
      files: files.length ? files : undefined,
      scene: scene || undefined,
      sourceUrl: sourceUrl || undefined,
    });
  }
  return out;
}

export const withoutSegrouletteSamples = withoutIdcSegmentationSamples;
export const upsertSegrouletteSample = upsertIdcSegmentationSample;

export function myWorklistStudies(studies: WorklistSample[]): WorklistSample[] {
  return studies.filter(isMyWorklistSample);
}

export const MY_WORKLIST_STORAGE_KEY = 'pw46.worklist.mine.v1';

const SAVE_DEBOUNCE_MS = 400;
let saveTimer: ReturnType<typeof setTimeout> | null = null;

export function loadMyWorklistFromStorage(): WorklistSample[] {
  try {
    const raw = localStorage.getItem(MY_WORKLIST_STORAGE_KEY);
    if (!raw) return [];
    return parseMyWorklistFile(JSON.parse(raw));
  } catch {
    return [];
  }
}

export function saveMyWorklistToStorage(studies: WorklistSample[]): void {
  try {
    const payload = {
      version: 1 as const,
      studies: myWorklistStudies(studies),
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(MY_WORKLIST_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    /* quota / private mode */
  }
}

/** Debounced persist of My Worklist rows so rapid adds do not thrash storage. */
export function scheduleSaveMyWorklist(studies: WorklistSample[]): void {
  const snapshot = studies.slice();
  if (saveTimer != null) clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    saveTimer = null;
    saveMyWorklistToStorage(snapshot);
  }, SAVE_DEBOUNCE_MS);
}

export function parseMyWorklistFile(data: unknown): WorklistSample[] {
  let rows: unknown[] = [];
  if (Array.isArray(data)) {
    rows = data;
  } else if (
    data &&
    typeof data === 'object' &&
    Array.isArray((data as { studies?: unknown }).studies)
  ) {
    rows = (data as { studies: unknown[] }).studies;
  }
  const out: WorklistSample[] = [];
  for (const row of rows) {
    if (!row || typeof row !== 'object') continue;
    const sample = row as WorklistSample;
    if (!sample.id) continue;
    out.push({ ...sample, organization: WORKLIST_ORG_MINE });
  }
  return out;
}

export function mergeMyWorklistStudies(
  studies: WorklistSample[],
  incoming: WorklistSample[]
): WorklistSample[] {
  let next = studies;
  for (const sample of incoming) {
    next = upsertIdcSegmentationSample(next, {
      ...sample,
      organization: WORKLIST_ORG_MINE,
    });
  }
  scheduleSaveMyWorklist(next);
  return next;
}

/** Stable id for a My Worklist copy of a catalog (or other org) row. */
export function myWorklistCopyId(sampleId: string): string {
  const id = String(sampleId || '').trim();
  if (!id) return id;
  return id.startsWith('mine:') ? id : `mine:${id}`;
}

/** True if this sample is already represented under My Worklist. */
export function isSampleInMyWorklist(
  studies: WorklistSample[],
  sample: WorklistSample
): boolean {
  if (sample.organization === WORKLIST_ORG_MINE) return true;
  const mineId = myWorklistCopyId(sample.id);
  return studies.some(
    (s) =>
      s.organization === WORKLIST_ORG_MINE &&
      (s.id === mineId || s.id === sample.id)
  );
}

/**
 * Copy a sample into My Worklist without removing the source catalog row.
 * No-op if already present under mine.
 */
export function addSampleToMyWorklist(
  studies: WorklistSample[],
  sample: WorklistSample
): WorklistSample[] {
  if (isSampleInMyWorklist(studies, sample)) return studies;
  const mineId =
    sample.organization === WORKLIST_ORG_MINE
      ? sample.id
      : myWorklistCopyId(sample.id);
  const next = upsertIdcSegmentationSample(studies, {
    ...sample,
    id: mineId,
    organization: WORKLIST_ORG_MINE,
  });
  scheduleSaveMyWorklist(next);
  return next;
}

export function filterWorklistStudies(
  studies: WorklistSample[],
  organization: string
): WorklistSample[] {
  if (!organization) return studies;

  if (organization === WORKLIST_ORG_MINE) {
    return myWorklistStudies(studies);
  }

  const idcCategory = idcCategoryFromFilterValue(organization);
  if (idcCategory) {
    return studies.filter(
      (s) => s.organization === WORKLIST_ORG_IDC_SEG && s.idcCategory === idcCategory
    );
  }

  return studies.filter((s) => s.organization === organization);
}

export function findWorklistSample(
  sampleId: string,
  studies: WorklistSample[]
): WorklistSample | undefined {
  return studies.find((s) => s.id === sampleId);
}
