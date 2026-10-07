import JSZip from 'jszip';
import type { CastMessage } from '@slicer-hub/client';
import { navigateToHubViewer } from './hub-navigate';
import { HUB_IDC_DATA_SOURCE, LOG_PREFIX } from './constants';
import {
  filePayloadToArrayBuffer,
  type ImagingStudyOpenPlan,
} from '@slicer-hub/client';
import { addHubDicomToMetadataStore } from './ingest-hub-dicom';
import { ingestNiftiFile, ingestNiftiFromUrl } from './ingest-hub-nifti';
import type { FilePayload } from './types';

export type ImagingStudyIdcOpen = Extract<ImagingStudyOpenPlan, { mode: 'idc' }>;

const IDC_DOWNLOAD_CONCURRENCY = 20;

type DicomIngestCallbacks = {
  scheduleHubDicomSendLayer: (meta: {
    SeriesInstanceUID?: string;
    SOPInstanceUID?: string;
  }) => void;
};

function basename(path: string): string {
  const normalized = path.replace(/\\/g, '/');
  const parts = normalized.split('/');
  return parts[parts.length - 1] || path;
}

function isLikelyDicomFileName(name: string): boolean {
  const lower = name.toLowerCase();
  return (
    lower.endsWith('.dcm') ||
    lower.endsWith('.dicom') ||
    !lower.includes('.') ||
    lower.endsWith('.ima')
  );
}

function isNiftiFileName(name: string): boolean {
  const lower = name.toLowerCase();
  return lower.endsWith('.nii') || lower.endsWith('.nii.gz');
}

function isZipFileName(name: string): boolean {
  return name.toLowerCase().endsWith('.zip');
}

async function isZipArchive(file: File): Promise<boolean> {
  if (isZipFileName(file.name)) {
    return true;
  }
  const header = new Uint8Array(await file.slice(0, 4).arrayBuffer());
  return header[0] === 0x50 && header[1] === 0x4b && header[2] === 0x03 && header[3] === 0x04;
}

async function expandArchiveToFiles(file: File): Promise<File[]> {
  if (!(await isZipArchive(file))) {
    return [file];
  }

  const zip = await JSZip.loadAsync(file);
  const entries: File[] = [];

  await Promise.all(
    Object.keys(zip.files).map(async relPath => {
      const entry = zip.files[relPath];
      if (!entry || entry.dir) {
        return;
      }
      const name = basename(relPath);
      if (name.toLowerCase() === 'license') {
        return;
      }
      const blob = await entry.async('blob');
      entries.push(new File([blob], name, { type: blob.type || 'application/octet-stream' }));
    })
  );

  return entries;
}

/** DICOM UIDs are dotted decimals; IDC CRDC series ids are UUID-shaped — not valid SeriesInstanceUIDs. */
function isLikelyDicomUid(value: string | undefined | null): boolean {
  const uid = String(value || '').trim();
  return /^\d+(?:\.\d+)+$/.test(uid);
}

async function ingestDicomFile(
  file: File,
  callbacks: DicomIngestCallbacks,
  sourceUrl?: string
): Promise<{ studyUID: string; seriesInstanceUID?: string } | null> {
  const arrayBuffer = await file.arrayBuffer();
  const ingested = addHubDicomToMetadataStore(arrayBuffer, {
    fileName: file.name,
    sourceUrl,
  });
  if (!ingested) {
    return null;
  }
  callbacks.scheduleHubDicomSendLayer({
    SeriesInstanceUID: ingested.seriesInstanceUID,
    SOPInstanceUID: ingested.sopInstanceUID,
  });
  return {
    studyUID: ingested.studyUID,
    seriesInstanceUID: ingested.seriesInstanceUID,
  };
}

export async function ingestHubFiles(
  files: File[],
  callbacks: DicomIngestCallbacks,
  remoteUrlByFile?: Map<File, string>
): Promise<string[]> {
  const studyUIDs = new Set<string>();

  for (const file of files) {
    if (isNiftiFileName(file.name)) {
      const studyUID = await ingestNiftiFile(
        file,
        remoteUrlByFile?.get(file),
        file.name
      );
      if (studyUID) {
        studyUIDs.add(studyUID);
      }
      continue;
    }
    if (!isLikelyDicomFileName(file.name)) {
      continue;
    }
    const ingested = await ingestDicomFile(
      file,
      callbacks,
      remoteUrlByFile?.get(file)
    );
    if (ingested?.studyUID) {
      studyUIDs.add(ingested.studyUID);
    }
  }

  return [...studyUIDs];
}

export async function fetchRemoteFile(url: string, fileName?: string): Promise<File | null> {
  try {
    console.info(`${LOG_PREFIX} downloading`, { url, fileName });
    const response = await fetch(url);
    if (!response.ok) {
      console.error(`${LOG_PREFIX} fetch failed ${response.status}`, url);
      return null;
    }
    const blob = await response.blob();
    const name =
      fileName?.trim() ||
      basename(new URL(url).pathname) ||
      'hub-download';
    return new File([blob], name, { type: blob.type || 'application/octet-stream' });
  } catch (err) {
    console.error(`${LOG_PREFIX} fetch failed`, url, err);
    return null;
  }
}

export function extractInlineOpenFilePayloads(
  event: CastMessage['event'] | undefined
): FilePayload[] {
  const context = event?.context;
  if (!context) {
    return [];
  }

  const objectFiles =
    !Array.isArray(context) &&
    typeof context === 'object' &&
    Array.isArray((context as { files?: unknown }).files)
      ? ((context as { files: unknown[] }).files as unknown[])
      : null;

  const arrayFiles: unknown[] = [];
  if (Array.isArray(context)) {
    for (const item of context) {
      if (!item || typeof item !== 'object') {
        continue;
      }
      const resource = (item as { resource?: { files?: unknown[] } }).resource;
      if (Array.isArray(resource?.files)) {
        arrayFiles.push(...resource.files);
      }
    }
  }

  const rawFiles = objectFiles || arrayFiles;
  if (!rawFiles.length) {
    return [];
  }

  const out: FilePayload[] = [];
  for (const [idx, entry] of rawFiles.entries()) {
    if (!entry || typeof entry !== 'object') {
      continue;
    }
    const typed = entry as {
      data?: unknown;
      fileName?: string;
      mimeType?: string;
    };
    const fileName =
      typeof typed.fileName === 'string' && typed.fileName.trim()
        ? typed.fileName.trim()
        : `hub-open-${idx + 1}.zip`;
    const mimeType =
      typeof typed.mimeType === 'string' && typed.mimeType.trim()
        ? typed.mimeType.trim()
        : 'application/octet-stream';

    if (typed.data instanceof ArrayBuffer) {
      out.push({ arrayBuffer: typed.data, fileName, mimeType });
    } else if (typeof typed.data === 'string' && typed.data) {
      out.push({ fileName, data: typed.data, mimeType });
    }
  }
  return out;
}

async function payloadsToFiles(payloads: FilePayload[]): Promise<File[]> {
  const files: File[] = [];
  for (const [idx, payload] of payloads.entries()) {
    const arrayBuffer = filePayloadToArrayBuffer(payload);
    if (!arrayBuffer) {
      continue;
    }
    const fileName =
      'fileName' in payload && payload.fileName
        ? payload.fileName
        : `hub-open-${idx + 1}.zip`;
    files.push(
      new File([arrayBuffer], fileName, {
        type:
          'mimeType' in payload && payload.mimeType
            ? payload.mimeType
            : 'application/octet-stream',
      })
    );
  }
  return files;
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  if (!items.length) {
    return [];
  }
  const results: R[] = new Array(items.length);
  let nextIndex = 0;

  async function worker(): Promise<void> {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await fn(items[index], index);
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, items.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

type IdcPlanFile = {
  url: string;
  fileName?: string;
  label?: string;
  role?: string;
};

/** Parse https://{bucket}.s3[.region].amazonaws.com/{crdc-prefix}/ as an IDC series prefix. */
function parseIdcS3PrefixUrl(
  url: string,
  fileName?: string
): { bucket: string; prefix: string; origin: string } | null {
  try {
    const u = new URL(url);
    const hostMatch = u.hostname.match(
      /^([^.]+)\.s3(?:[.-][a-z0-9-]+)?\.amazonaws\.com$/i
    );
    if (!hostMatch) {
      return null;
    }
    const bucket = hostMatch[1];
    let prefix = decodeURIComponent(u.pathname.replace(/^\/+/, '')).replace(
      /\/+$/,
      ''
    );
    if (!prefix) {
      return null;
    }
    const leaf = basename(prefix);
    const fileNameLooksPrefix = String(fileName || '').endsWith('/');
    const pathLooksPrefix =
      u.pathname.endsWith('/') || (!leaf.includes('.') && prefix.length > 0);
    if (!fileNameLooksPrefix && !pathLooksPrefix) {
      return null;
    }
    return { bucket, prefix, origin: u.origin };
  } catch {
    return null;
  }
}

/** List DICOM object keys under a public IDC S3 series prefix (ListObjectsV2). */
async function listIdcS3PrefixObjects(
  bucket: string,
  prefix: string,
  origin: string
): Promise<Array<{ url: string; fileName: string }>> {
  const normalizedPrefix = prefix.endsWith('/') ? prefix : `${prefix}/`;
  const out: Array<{ url: string; fileName: string }> = [];
  let token: string | null = null;
  let more = true;

  while (more) {
    const listUrl = new URL(`${origin.replace(/\/+$/, '')}/`);
    listUrl.searchParams.set('list-type', '2');
    listUrl.searchParams.set('prefix', normalizedPrefix);
    if (token) {
      listUrl.searchParams.set('continuation-token', token);
    }
    const response = await fetch(listUrl.toString());
    if (!response.ok) {
      console.error(
        `${LOG_PREFIX} S3 list failed ${response.status}`,
        listUrl.toString()
      );
      break;
    }
    const xml = new DOMParser().parseFromString(
      await response.text(),
      'application/xml'
    );
    for (const el of Array.from(xml.getElementsByTagName('Key'))) {
      const key = el.textContent || '';
      if (!key || key.endsWith('/')) {
        continue;
      }
      const name = basename(key);
      // Prefer .dcm; skip non-DICOM extensions (keep extensionless keys).
      if (name.includes('.') && !/\.dcm$/i.test(name)) {
        continue;
      }
      const encodedKey = key
        .split('/')
        .map(part => encodeURIComponent(part))
        .join('/');
      out.push({
        url: `${origin.replace(/\/+$/, '')}/${encodedKey}`,
        fileName: name,
      });
    }
    more =
      (xml.getElementsByTagName('IsTruncated')[0]?.textContent || '').trim() ===
      'true';
    token = more
      ? xml.getElementsByTagName('NextContinuationToken')[0]?.textContent ||
        null
      : null;
  }

  console.info(`${LOG_PREFIX} listed IDC S3 prefix`, {
    bucket,
    prefix: normalizedPrefix,
    objectCount: out.length,
  });
  return out;
}

/**
 * Worklist open-mode `idc` now sends CRDC prefix URLs (not per-.dcm lists).
 * Expand those prefixes to object URLs before download/ingest.
 */
async function expandIdcPlanFiles(files: IdcPlanFile[]): Promise<IdcPlanFile[]> {
  const expanded: IdcPlanFile[] = [];
  for (const entry of files) {
    const parsed = parseIdcS3PrefixUrl(entry.url, entry.fileName);
    if (!parsed) {
      expanded.push(entry);
      continue;
    }
    const objects = await listIdcS3PrefixObjects(
      parsed.bucket,
      parsed.prefix,
      parsed.origin
    );
    if (!objects.length) {
      console.warn(`${LOG_PREFIX} IDC prefix listed 0 objects`, entry.url);
      continue;
    }
    for (const obj of objects) {
      expanded.push({
        url: obj.url,
        fileName: obj.fileName,
        label: entry.label,
        role: entry.role,
      });
    }
  }
  return expanded;
}

export async function loadHubIdcStudyFiles(
  plan: ImagingStudyIdcOpen,
  callbacks: DicomIngestCallbacks
): Promise<void> {
  const studyUIDs = new Set<string>();
  const seriesUIDs = new Set<string>();
  const files = await expandIdcPlanFiles(plan.files || []);

  console.info(
    `${LOG_PREFIX} imagingstudy-open IDC parallel download (${files.length} file(s) after prefix expand, concurrency ${IDC_DOWNLOAD_CONCURRENCY})`,
    {
      studyInstanceUID: plan.studyInstanceUID,
      seriesInstanceUID: plan.seriesInstanceUID,
      sourceBucket: plan.sourceBucket,
      prefixEntries: plan.files.length,
    }
  );

  if (!files.length) {
    console.warn(
      `${LOG_PREFIX} imagingstudy-open: no IDC objects after prefix expand`
    );
    return;
  }

  await mapWithConcurrency(files, IDC_DOWNLOAD_CONCURRENCY, async entry => {
    const downloaded = await fetchRemoteFile(entry.url, entry.fileName);
    if (!downloaded || !isLikelyDicomFileName(downloaded.name)) {
      return;
    }
    const ingested = await ingestDicomFile(downloaded, callbacks, entry.url);
    if (ingested?.studyUID) {
      studyUIDs.add(ingested.studyUID);
    }
    if (ingested?.seriesInstanceUID && isLikelyDicomUid(ingested.seriesInstanceUID)) {
      seriesUIDs.add(ingested.seriesInstanceUID);
    }
  });

  const studyList = [...studyUIDs];
  if (!studyList.length) {
    console.warn(`${LOG_PREFIX} imagingstudy-open: no studies ingested from IDC files`);
    return;
  }

  // plan.seriesInstanceUID is often an IDC CRDC uuid, not a DICOM SeriesInstanceUID.
  // Prefer series UIDs from ingested instances so OHIF series filter matches the study.
  const seriesFromPlan = isLikelyDicomUid(plan.seriesInstanceUID)
    ? plan.seriesInstanceUID
    : undefined;
  const seriesUID =
    seriesUIDs.size === 1
      ? [...seriesUIDs][0]
      : seriesFromPlan && seriesUIDs.has(seriesFromPlan)
        ? seriesFromPlan
        : undefined;

  navigateToHubViewer(studyList, {
    seriesUID,
    dataSource: HUB_IDC_DATA_SOURCE,
    modeRoute: plan.ohifMode,
  });

  console.info(`${LOG_PREFIX} imagingstudy-open loaded IDC study`, {
    studyUIDs: studyList,
    seriesUID: seriesUID || '(all series)',
    fileCount: files.length,
  });
}

function isDirectNiftiUrl(url: string, fileName?: string): boolean {
  const name = (fileName || basename(new URL(url).pathname)).toLowerCase();
  return isNiftiFileName(name);
}

export async function loadHubStudyFilesFromUrls(
  fileEntries: Array<{ url: string; fileName?: string; label?: string }>,
  callbacks: DicomIngestCallbacks,
  options?: { ohifMode?: string }
): Promise<void> {
  const studyUIDs = new Set<string>();

  for (const entry of fileEntries) {
    if (isDirectNiftiUrl(entry.url, entry.fileName)) {
      const studyUID = await ingestNiftiFromUrl(entry.url, entry.label || entry.fileName);
      if (studyUID) {
        studyUIDs.add(studyUID);
      }
      continue;
    }

    const downloaded = await fetchRemoteFile(entry.url, entry.fileName);
    if (!downloaded) {
      continue;
    }

    if (isNiftiFileName(downloaded.name) && !(await isZipArchive(downloaded))) {
      const studyUID = await ingestNiftiFile(
        downloaded,
        entry.url,
        entry.label || downloaded.name
      );
      if (studyUID) {
        studyUIDs.add(studyUID);
      }
      continue;
    }

    const expanded = await expandArchiveToFiles(downloaded);
    const remoteUrlByFile = new Map<File, string>();
    expanded.forEach(file => remoteUrlByFile.set(file, entry.url));
    const studyUIDsFromArchive = await ingestHubFiles(
      expanded,
      callbacks,
      remoteUrlByFile
    );
    studyUIDsFromArchive.forEach(uid => studyUIDs.add(uid));
  }

  const studyList = [...studyUIDs];
  if (!studyList.length) {
    console.warn(`${LOG_PREFIX} imagingstudy-open: no studies ingested from file URLs`);
    return;
  }

  navigateToHubViewer(studyList, {
    useLocalDataSource: true,
    modeRoute: options?.ohifMode,
  });

  console.info(`${LOG_PREFIX} imagingstudy-open loaded ${studyList.length} study(s)`, {
    studyUIDs: studyList,
    fileCount: fileEntries.length,
  });
}

export async function loadHubStudyFilesFromPayloads(
  payloads: FilePayload[],
  callbacks: DicomIngestCallbacks
): Promise<void> {
  const downloaded = await payloadsToFiles(payloads);
  const expanded: File[] = [];
  for (const file of downloaded) {
    const inner = await expandArchiveToFiles(file);
    expanded.push(...inner);
  }
  const studyUIDs = await ingestHubFiles(expanded, callbacks);
  if (!studyUIDs.length) {
    return;
  }
  navigateToHubViewer(studyUIDs, { useLocalDataSource: true });
}
