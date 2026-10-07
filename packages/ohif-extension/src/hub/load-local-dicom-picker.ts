import { filesToStudies } from '@ohif/app';
import { navigateToCastViewer } from './hub-navigate';

const LOG_PREFIX = 'HubService(OHIF):';

/**
 * Ingest browser-local DICOM/PDF files via the same pipeline as /local, then
 * open them in the viewer on the dicomlocal data source.
 */
export async function loadLocalDicomFromFiles(files: File[]): Promise<void> {
  if (!files.length) {
    return;
  }

  const studyUIDs = await filesToStudies(files);
  if (!studyUIDs.length) {
    console.warn(
      `${LOG_PREFIX} No studies loaded from local file selection (empty or unrecognized files).`
    );
    return;
  }

  navigateToCastViewer(studyUIDs, { useLocalDataSource: true });
}
