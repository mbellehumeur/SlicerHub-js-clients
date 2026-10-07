import { DicomMetadataStore } from '@ohif/core';
import { addHubDicomToMetadataStore } from './ingest-hub-dicom';
import { navigateToHubViewer } from './hub-navigate';

const LOG_PREFIX = 'HubService(OHIF):';

/**
 * Ingest browser-local DICOM files into DicomMetadataStore, then open them
 * on the dicomlocal data source (same outcome as the /local route).
 */
export async function loadLocalDicomFromFiles(files: File[]): Promise<void> {
  if (!files.length) {
    return;
  }

  const studyUIDs = new Set<string>();
  for (let index = 0; index < files.length; index++) {
    const file = files[index];
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = addHubDicomToMetadataStore(arrayBuffer, {
        fileName: file.name,
        index,
      });
      if (result?.studyUID) {
        studyUIDs.add(result.studyUID);
      }
    } catch (error) {
      console.warn(`${LOG_PREFIX} Failed to load local file ${file.name}`, error);
    }
  }

  // Prefer studies just ingested; fall back to store snapshot.
  const resolved =
    studyUIDs.size > 0
      ? Array.from(studyUIDs)
      : DicomMetadataStore.getStudyInstanceUIDs();

  if (!resolved.length) {
    console.warn(
      `${LOG_PREFIX} No studies loaded from local file selection (empty or unrecognized files).`
    );
    return;
  }

  navigateToHubViewer(resolved, { useLocalDataSource: true });
}
