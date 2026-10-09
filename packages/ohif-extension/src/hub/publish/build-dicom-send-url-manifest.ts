import { DicomMetadataStore } from '@ohif/core';
import { resolveInstancePublishUrl } from './build-dicom-send-from-display-set';

export type UrlSendFileEntry = {
  fileName: string;
  url: string;
  mimeType: string;
  byteLength?: number;
};

export type HubUrlSendManifest = {
  hubEvent: 'dicom-send' | 'nifti-send';
  files: UrlSendFileEntry[];
};

/** @deprecated Use ``HubUrlSendManifest`` */
export type TotalSegmentatorSendManifest = HubUrlSendManifest;

type OhifInstance = {
  StudyInstanceUID?: string;
  SeriesInstanceUID?: string;
  SOPInstanceUID?: string;
  url?: string;
  wadoRoot?: string;
  _hubSourceUrl?: string;
  _hubDicomArrayBuffer?: ArrayBuffer;
};

function isHttpUrl(value: string): boolean {
  return value.startsWith('http://') || value.startsWith('https://');
}

function isNiftiSourceUrl(url: string): boolean {
  const lower = url.toLowerCase().split('?')[0];
  return lower.endsWith('.nii') || lower.endsWith('.nii.gz');
}

function instanceFileName(instance: OhifInstance, index: number): string {
  const sop = instance.SOPInstanceUID?.trim();
  if (sop) {
    return `${sop}.dcm`;
  }
  return `instance-${index + 1}.dcm`;
}

function resolveInstanceUrl(instance: OhifInstance): string | null {
  return resolveInstancePublishUrl(instance);
}

function niftiFileNameFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const base = pathname.split('/').pop();
    if (base?.trim()) {
      return base.trim();
    }
  } catch {
    // fall through
  }
  return 'nifti-send.nii.gz';
}

function buildNiftiSendManifest(instances: OhifInstance[]): HubUrlSendManifest {
  for (const instance of instances) {
    const sourceUrl = instance._hubSourceUrl?.trim();
    if (sourceUrl && isHttpUrl(sourceUrl) && isNiftiSourceUrl(sourceUrl)) {
      return {
        hubEvent: 'nifti-send',
        files: [
          {
            fileName: niftiFileNameFromUrl(sourceUrl),
            url: sourceUrl,
            mimeType: 'application/octet-stream',
          },
        ],
      };
    }
  }

  throw new Error(
    'Active series is a NIfTI volume without a downloadable HTTP(S) source URL'
  );
}

export function buildHubUrlSendManifest(
  studyInstanceUID: string,
  seriesInstanceUID: string
): HubUrlSendManifest {
  const series = DicomMetadataStore.getSeries(studyInstanceUID, seriesInstanceUID);
  const instances = ((series as { instances?: OhifInstance[] } | undefined)?.instances ??
    []) as OhifInstance[];

  if (!instances.length) {
    throw new Error(`No instances found for series ${seriesInstanceUID}`);
  }

  const niftiCandidate = instances.some(instance => {
    const sourceUrl = instance._hubSourceUrl?.trim();
    return sourceUrl && isHttpUrl(sourceUrl) && isNiftiSourceUrl(sourceUrl);
  });
  if (niftiCandidate) {
    return buildNiftiSendManifest(instances);
  }

  const files: UrlSendFileEntry[] = [];
  const missing: string[] = [];

  instances.forEach((instance, index) => {
    const url = resolveInstanceUrl(instance);
    if (!url) {
      const sop = instance.SOPInstanceUID?.trim() || `index ${index}`;
      missing.push(sop);
      return;
    }
    const entry: UrlSendFileEntry = {
      fileName: instanceFileName(instance, index),
      url,
      mimeType: 'application/dicom',
    };
    if (instance._hubDicomArrayBuffer instanceof ArrayBuffer) {
      entry.byteLength = instance._hubDicomArrayBuffer.byteLength;
    }
    files.push(entry);
  });

  if (!files.length) {
    throw new Error(
      'No HTTP URLs for the active series — the service provider needs shared remote URLs (DICOMweb or IDC). Local blob or Hub-ingested data without _hubSourceUrl cannot be sent URL-only.'
    );
  }

  if (missing.length) {
    throw new Error(
      `Missing HTTP URLs for ${missing.length} instance(s). The service provider needs shared remote URLs (DICOMweb or IDC) for every slice in the series.`
    );
  }

  return {
    hubEvent: 'dicom-send',
    files,
  };
}

export function buildHubUrlSendManifestFromActiveSeries(servicesManager: {
  services: {
    displaySetService: {
      activeDisplaySets?: Array<{
        StudyInstanceUID?: string;
        SeriesInstanceUID?: string;
      }>;
    };
  };
}): HubUrlSendManifest {
  const active = servicesManager.services.displaySetService.activeDisplaySets?.[0];
  const studyInstanceUID = active?.StudyInstanceUID?.trim();
  const seriesInstanceUID = active?.SeriesInstanceUID?.trim();
  if (!studyInstanceUID || !seriesInstanceUID) {
    throw new Error('No active display set with study and series UIDs');
  }
  return buildHubUrlSendManifest(studyInstanceUID, seriesInstanceUID);
}

/** @deprecated Use ``buildHubUrlSendManifest`` */
export const buildTotalSegmentatorSendManifest = buildHubUrlSendManifest;

/** @deprecated Use ``buildHubUrlSendManifestFromActiveSeries`` */
export const buildTotalSegmentatorSendManifestFromActiveSeries =
  buildHubUrlSendManifestFromActiveSeries;
