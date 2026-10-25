import type { CastMessage } from '@slicer-hub/client';
import {
  deleteUsPleuraBLineAnnotations,
  importUsPleuraBLineAnnotations,
} from './import-us-annotations';
import { navigateToHubEmptyViewer, navigateToHubViewer } from './hub-navigate';
import { HUB_DICOMWEB_DATA_SOURCE, HUB_LOCAL_DATA_SOURCE, LOG_PREFIX } from './constants';
import {
  isAlreadyOnHubStudyViewer,
  resolveHubModeRoute,
} from './resolve-hub-mode-route';
import {
  collectImagingStudyDownloadEntries,
  hasNiftiDownloadHint,
  toHubFileEntries,
} from './collect-imaging-study-downloads';
import { applyHubDicomwebRoot } from './apply-hub-dicomweb-root';
import {
  getHubEventLower,
  normalizeImagingStudyContext,
  resolveImagingStudyOpenPlan,
} from '@slicer-hub/client';
import {
  extractInlineOpenFilePayloads,
  loadHubIdcStudyFiles,
  loadHubStudyFilesFromPayloads,
  loadHubStudyFilesFromUrls,
} from './load-hub-study-files';
import { hangingProtocolIdFromSlicerPublisher } from './slicer-four-up';
import type { HubEvent } from './types';

type DicomIngestCallbacks = {
  scheduleHubDicomSendLayer: (meta: {
    SeriesInstanceUID?: string;
    SOPInstanceUID?: string;
  }) => void;
};

type RequestLocalDicomFn = (args: {
  studyInstanceUID: string;
  seriesInstanceUID?: string;
}) => Promise<unknown>;

type ImagingStudyHandlerOptions = DicomIngestCallbacks & {
  applyDicomwebRoot?: (root: string) => Promise<void>;
  /** Pull local-dicom studies from Slicer Image Display via dicom-request. */
  requestLocalDicom?: RequestLocalDicomFn;
};

function looksLikeDicomUid(value: string): boolean {
  return /^\d+(?:\.\d+)+$/.test(value.trim());
}

export function navigateToStudy(
  studyUID: string,
  seriesUID?: string,
  useLocalDataSource = false,
  ohifMode?: string,
  hangingProtocolId?: string
): void {
  const modeRoute = resolveHubModeRoute([studyUID], ohifMode);
  const dataSource = useLocalDataSource ? HUB_LOCAL_DATA_SOURCE : undefined;
  const hp = String(hangingProtocolId || '').trim();
  // Always re-navigate when applying a hanging protocol so Mode picks it up.
  if (!hp && isAlreadyOnHubStudyViewer(studyUID, modeRoute, dataSource)) {
    return;
  }
  navigateToHubViewer([studyUID], {
    seriesUID,
    useLocalDataSource,
    modeRoute: ohifMode,
    hangingProtocolId: hp || undefined,
  });
}

export class ImagingStudyHandler {
  private applyDicomwebRoot: (root: string) => Promise<void>;
  private requestLocalDicom?: RequestLocalDicomFn;

  constructor(private dicomCallbacks: DicomIngestCallbacks, options?: ImagingStudyHandlerOptions) {
    this.applyDicomwebRoot = options?.applyDicomwebRoot ?? applyHubDicomwebRoot;
    this.requestLocalDicom = options?.requestLocalDicom;
  }

  async handleOpen(
    event: HubEvent | undefined,
    message?: CastMessage
  ): Promise<void> {
    if (!event?.context) {
      console.info(`${LOG_PREFIX} imagingstudy-open ignored: empty context`);
      return;
    }

    const hangingProtocolId = hangingProtocolIdFromSlicerPublisher(message);
    const normalizedContext = normalizeImagingStudyContext(event.context);
    const downloadEntries = collectImagingStudyDownloadEntries(normalizedContext);
    const plan = resolveImagingStudyOpenPlan(normalizedContext);

    console.info(`${LOG_PREFIX} imagingstudy-open`, {
      context: normalizedContext,
      plan,
      downloadEntries,
      niftiHint: hasNiftiDownloadHint(downloadEntries),
      hangingProtocolId: hangingProtocolId || undefined,
    });

    const inlinePayloads = extractInlineOpenFilePayloads(event);
    if (inlinePayloads.length) {
      await loadHubStudyFilesFromPayloads(inlinePayloads, this.dicomCallbacks, {
        hangingProtocolId,
      });
      return;
    }

    if (plan?.mode === 'idc' && plan.files.length > 0) {
      await loadHubIdcStudyFiles(plan, this.dicomCallbacks, {
        hangingProtocolId,
      });
      return;
    }

    if (plan?.mode === 'dicom-url' && plan.files.length > 0) {
      await loadHubStudyFilesFromUrls(plan.files, this.dicomCallbacks, {
        ohifMode: plan.ohifMode,
        hangingProtocolId,
      });
      return;
    }

    // DICOMweb before generic downloadEntries: IDC lung contexts include
    // context.files[] as idcFallback only, not as the primary open path.
    if (plan?.mode === 'dicomweb') {
      await this.openDicomwebPlan(plan, hangingProtocolId);
      return;
    }

    if (downloadEntries.length > 0) {
      console.info(
        `${LOG_PREFIX} imagingstudy-open downloading ${downloadEntries.length} remote file(s)`,
        downloadEntries.map(entry => ({
          url: entry.url,
          fileName: entry.fileName,
          source: entry.source,
        }))
      );
      await loadHubStudyFilesFromUrls(
        toHubFileEntries(downloadEntries),
        this.dicomCallbacks,
        { ohifMode: plan?.ohifMode, hangingProtocolId }
      );
      return;
    }

    if (!plan) {
      const contextItems = Array.isArray(normalizedContext)
        ? (normalizedContext as Array<{ key?: string; resource?: unknown }>)
        : [];
      const studyResource = contextItems.find(item => item.key === 'study')?.resource;
      const studyUID =
        studyResource && typeof studyResource === 'object'
          ? (studyResource as { uid?: string }).uid
          : undefined;
      if (typeof studyUID === 'string' && studyUID.trim() && looksLikeDicomUid(studyUID)) {
        navigateToStudy(
          studyUID.trim(),
          undefined,
          false,
          undefined,
          hangingProtocolId
        );
      } else {
        console.warn(
          `${LOG_PREFIX} imagingstudy-open: no downloadable files or DICOMweb plan in context`
        );
      }
      return;
    }

    if (plan.mode === 'files' && plan.files.length > 0) {
      await loadHubStudyFilesFromUrls(plan.files, this.dicomCallbacks, {
        ohifMode: plan.ohifMode,
        hangingProtocolId,
      });
      return;
    }

    if (plan.mode === 'local-dicom') {
      if (!this.requestLocalDicom) {
        console.warn(
          `${LOG_PREFIX} imagingstudy-open: local-dicom requires dicom-request (no requester wired)`
        );
        return;
      }
      const studyInstanceUID = String(plan.studyInstanceUID || '').trim();
      if (!studyInstanceUID) {
        console.warn(
          `${LOG_PREFIX} imagingstudy-open: local-dicom missing studyInstanceUID`
        );
        return;
      }
      console.info(`${LOG_PREFIX} imagingstudy-open local-dicom → dicom-request`, {
        studyInstanceUID,
        seriesInstanceUID: plan.seriesInstanceUID,
      });
      await this.requestLocalDicom({
        studyInstanceUID,
        seriesInstanceUID: plan.seriesInstanceUID,
      });
      return;
    }

    console.warn(
      `${LOG_PREFIX} imagingstudy-open: files mode resolved but no URLs were found`
    );
  }

  private async openDicomwebPlan(
    plan: Extract<
      NonNullable<ReturnType<typeof resolveImagingStudyOpenPlan>>,
      { mode: 'dicomweb' }
    >,
    hangingProtocolId?: string
  ): Promise<void> {
    const idcFallbackPlan = plan.idcFallback?.files?.length
      ? {
          mode: 'idc' as const,
          studyId: plan.studyId,
          studyInstanceUID: plan.idcFallback.studyInstanceUID,
          seriesInstanceUID: plan.idcFallback.seriesInstanceUID,
          sourceBucket: plan.idcFallback.sourceBucket,
          files: plan.idcFallback.files,
          ohifMode: plan.ohifMode,
        }
      : null;

    // Prefer IDC direct HTTPS file URLs when present (e.g. lung-screening worklist).
    // Ingest sets instance._hubSourceUrl so URL-only dicom-send uses raw S3 objects
    // instead of WADO-RS multipart responses that break Python service providers.
    if (idcFallbackPlan) {
      console.info(
        `${LOG_PREFIX} imagingstudy-open dicomweb: using IDC direct files (${idcFallbackPlan.files.length} URL(s))`,
        { studyInstanceUID: plan.studyInstanceUID }
      );
      await loadHubIdcStudyFiles(idcFallbackPlan, this.dicomCallbacks, {
        hangingProtocolId,
      });
      return;
    }

    try {
      if (plan.dicomwebRoot?.trim()) {
        await this.applyDicomwebRoot(plan.dicomwebRoot);
      } else {
        console.warn(
          `${LOG_PREFIX} imagingstudy-open dicomweb: no dicomweb root in context; using configured server`
        );
      }
      navigateToHubViewer([plan.studyInstanceUID], {
        seriesUID: plan.seriesInstanceUID,
        dataSource: HUB_DICOMWEB_DATA_SOURCE,
        modeRoute: plan.ohifMode,
        hangingProtocolId,
      });
    } catch (error) {
      throw error;
    }
  }

  handleClose(): void {
    navigateToHubEmptyViewer({ replace: true });
  }
}

export function handleAnnotationEvent(
  message: CastMessage,
  servicesManager: import('./types').ServicesManagerLike
): void {
  const hubEvent = getHubEventLower(message.event);
  if (hubEvent !== 'annotation-update' && hubEvent !== 'annotation-delete') {
    return;
  }
  const context = message.event?.context;
  if (hubEvent === 'annotation-delete') {
    deleteUsPleuraBLineAnnotations(servicesManager);
    return;
  }
  importUsPleuraBLineAnnotations(servicesManager, context);
}
