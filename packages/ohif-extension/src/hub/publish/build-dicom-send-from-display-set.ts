import { DicomMetadataStore } from '@ohif/core';

export type DicomSendFileEntry = {
  fileName: string;
  mimeType: string;
  byteLength?: number;
  data?: ArrayBuffer;
  url?: string;
};

type OhifInstance = {
  SOPInstanceUID?: string;
  SeriesInstanceUID?: string;
  StudyInstanceUID?: string;
  url?: string;
  wadoRoot?: string;
  _hubSourceUrl?: string;
  _hubDicomArrayBuffer?: ArrayBuffer;
};

function isHttpUrl(value: string): boolean {
  return value.startsWith('http://') || value.startsWith('https://');
}

export function resolveInstancePublishUrl(instance: OhifInstance): string | null {
  const sourceUrl = instance._hubSourceUrl?.trim();
  if (sourceUrl && isHttpUrl(sourceUrl)) {
    return sourceUrl;
  }

  const wadoRoot = instance.wadoRoot?.trim();
  const studyUID = instance.StudyInstanceUID?.trim();
  const seriesUID = instance.SeriesInstanceUID?.trim();
  const sopUID = instance.SOPInstanceUID?.trim();
  if (wadoRoot && studyUID && seriesUID && sopUID && isHttpUrl(wadoRoot)) {
    return `${wadoRoot.replace(/\/$/, '')}/studies/${studyUID}/series/${seriesUID}/instances/${sopUID}`;
  }

  const directUrl = instance.url?.trim();
  if (directUrl && isHttpUrl(directUrl)) {
    return directUrl;
  }

  return null;
}

async function instanceToArrayBuffer(instance: OhifInstance): Promise<ArrayBuffer | null> {
  if (instance._hubDicomArrayBuffer instanceof ArrayBuffer) {
    return instance._hubDicomArrayBuffer.slice(0);
  }
  if (typeof instance.url === 'string' && instance.url.startsWith('blob:')) {
    try {
      const response = await fetch(instance.url);
      return response.arrayBuffer();
    } catch {
      return null;
    }
  }
  return null;
}

function instanceFileName(instance: OhifInstance, index: number): string {
  const sop = instance.SOPInstanceUID?.trim();
  if (sop) {
    return `${sop}.dcm`;
  }
  return `instance-${index + 1}.dcm`;
}

export async function buildDicomSendFromStudy(
  studyInstanceUID: string,
  scope: 'study' | 'series' = 'series',
  seriesInstanceUID?: string
): Promise<DicomSendFileEntry[]> {
  const study = DicomMetadataStore.getStudy(studyInstanceUID);
  if (!study?.series?.length) {
    throw new Error(`No series found for study ${studyInstanceUID}`);
  }

  const targetSeries =
    scope === 'series' && seriesInstanceUID
      ? study.series.filter(
          (series: { SeriesInstanceUID?: string }) =>
            series.SeriesInstanceUID === seriesInstanceUID
        )
      : study.series;

  const files: DicomSendFileEntry[] = [];
  let index = 0;

  for (const series of targetSeries) {
    const instances = (series as { instances?: OhifInstance[] }).instances ?? [];
    for (const instance of instances) {
      const fileName = instanceFileName(instance, index);
      const publishUrl = resolveInstancePublishUrl(instance);
      if (publishUrl) {
        const entry: DicomSendFileEntry = {
          fileName,
          mimeType: 'application/dicom',
          url: publishUrl,
        };
        if (instance._hubDicomArrayBuffer instanceof ArrayBuffer) {
          entry.byteLength = instance._hubDicomArrayBuffer.byteLength;
        }
        files.push(entry);
        index += 1;
        continue;
      }

      const data = await instanceToArrayBuffer(instance);
      if (!data) {
        continue;
      }
      index += 1;
      files.push({
        fileName,
        mimeType: 'application/dicom',
        data,
        byteLength: data.byteLength,
      });
    }
  }

  if (!files.length) {
    throw new Error('No DICOM instance bytes available to send');
  }

  return files;
}

export async function buildDicomSendFromActiveSeries(
  servicesManager: {
    services: {
      displaySetService: {
        activeDisplaySets?: Array<{
          StudyInstanceUID?: string;
          SeriesInstanceUID?: string;
        }>;
      };
      viewportGridService: {
        getActiveViewportId: () => string | undefined;
        getState: () => {
          viewports?: Map<string, { displaySetInstanceUIDs?: string[] }>;
        };
      };
    };
  }
): Promise<DicomSendFileEntry[]> {
  const activeDisplaySets =
    servicesManager.services.displaySetService.activeDisplaySets ?? [];
  const active = activeDisplaySets[0];
  if (!active?.StudyInstanceUID || !active?.SeriesInstanceUID) {
    throw new Error('No active display set with study/series UIDs');
  }
  return buildDicomSendFromStudy(
    active.StudyInstanceUID,
    'series',
    active.SeriesInstanceUID
  );
}

export async function buildDicomSendFromActiveStudy(
  servicesManager: Parameters<typeof buildDicomSendFromActiveSeries>[0]
): Promise<DicomSendFileEntry[]> {
  const activeDisplaySets =
    servicesManager.services.displaySetService.activeDisplaySets ?? [];
  const active = activeDisplaySets[0];
  if (!active?.StudyInstanceUID) {
    throw new Error('No active display set with study UID');
  }
  return buildDicomSendFromStudy(active.StudyInstanceUID, 'study');
}

export async function buildDicomSendFromSlice(
  studyInstanceUID: string,
  seriesInstanceUID: string,
  sopInstanceUID: string
): Promise<DicomSendFileEntry[]> {
  const series = DicomMetadataStore.getSeries(studyInstanceUID, seriesInstanceUID);
  const instances = (series as { instances?: OhifInstance[] } | undefined)?.instances ?? [];
  const instance = instances.find(item => item.SOPInstanceUID === sopInstanceUID);
  if (!instance) {
    throw new Error(`SOP instance ${sopInstanceUID} not found`);
  }
  const publishUrl = resolveInstancePublishUrl(instance);
  if (publishUrl) {
    const entry: DicomSendFileEntry = {
      fileName: `${sopInstanceUID}.dcm`,
      mimeType: 'application/dicom',
      url: publishUrl,
    };
    if (instance._hubDicomArrayBuffer instanceof ArrayBuffer) {
      entry.byteLength = instance._hubDicomArrayBuffer.byteLength;
    }
    return [entry];
  }
  const data = await instanceToArrayBuffer(instance);
  if (!data) {
    throw new Error(`No bytes available for SOP instance ${sopInstanceUID}`);
  }
  return [
    {
      fileName: `${sopInstanceUID}.dcm`,
      mimeType: 'application/dicom',
      data,
      byteLength: data.byteLength,
    },
  ];
}
