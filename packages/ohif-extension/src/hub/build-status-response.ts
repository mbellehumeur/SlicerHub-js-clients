import {
  buildLocalDicomImagingStudyOpenContext,
  cloneContextArray,
  isStatusPayloadOnline,
  isStatusRequestDataType,
  isTotalSegmentatorProduct,
  productNameFromStatusResponseItem,
  statusItemValue,
  TOTAL_SEGMENTATOR_PRODUCT_ALIASES,
  totalSegmentatorAvailableFromStatusResponses,
} from '@slicer-hub/client';
import {
  buildSceneviewResponsePayload,
  type SceneviewResponsePayload,
} from './build-sceneview-response';
import type { ServicesManagerLike } from './types';

export type StatusItem = {
  key: string;
  value: string;
};

export type StatusResponsePayload = {
  source: 'status';
  product: string;
  items: StatusItem[];
  sceneview: SceneviewResponsePayload;
  /** IRA-compatible ImagingStudy open context for worklist STATUS adoption. */
  'context.type': string;
  context: unknown[];
};

export type HubRequestResponseItem = {
  id?: string | null;
  subscriber?: string | null;
  actor?: string | null;
  productName?: string | null;
  data?: unknown;
};

export {
  isStatusPayloadOnline,
  isStatusRequestDataType,
  isTotalSegmentatorProduct,
  productNameFromStatusResponseItem,
  statusItemValue,
  TOTAL_SEGMENTATOR_PRODUCT_ALIASES,
  totalSegmentatorAvailableFromStatusResponses,
};

export function isLungScreeningProduct(name: string): boolean {
  const normalized = String(name ?? '')
    .trim()
    .toUpperCase()
    .replace(/-/g, '');
  return normalized === 'LUNGSCREENING';
}

export function lungScreeningAvailableFromStatusResponses(
  responses: HubRequestResponseItem[]
): boolean {
  return responses.some(item => {
    const product = productNameFromStatusResponseItem(item);
    return isLungScreeningProduct(product) && isStatusPayloadOnline(item.data);
  });
}

export function isNeuroSegProduct(name: string): boolean {
  const normalized = String(name ?? '')
    .trim()
    .toUpperCase()
    .replace(/-/g, '')
    .replace(/_/g, '');
  return normalized === 'NEUROSEG';
}

export function neuroSegAvailableFromStatusResponses(
  responses: HubRequestResponseItem[]
): boolean {
  return responses.some(item => {
    const product = productNameFromStatusResponseItem(item);
    return isNeuroSegProduct(product) && isStatusPayloadOnline(item.data);
  });
}

export function collatedResponsesFromRequestResult(
  data: unknown
): HubRequestResponseItem[] {
  if (!data || typeof data !== 'object') {
    return [];
  }
  const responses = (data as { responses?: unknown }).responses;
  return Array.isArray(responses) ? (responses as HubRequestResponseItem[]) : [];
}

/** Minimal ImagingStudy context from the active viewer when stored open context is empty. */
export function imagingStudyContextFromViewer(
  servicesManager: ServicesManagerLike
): unknown[] {
  const sceneview = buildSceneviewResponsePayload('OHIF', servicesManager);
  const fromViewport = sceneview.viewports.find(
    vp => typeof vp.studyInstanceUID === 'string' && vp.studyInstanceUID.trim()
  );
  let studyInstanceUID = fromViewport?.studyInstanceUID?.trim() ?? '';
  let seriesInstanceUID = fromViewport?.seriesInstanceUID?.trim() || undefined;

  if (!studyInstanceUID && typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    studyInstanceUID =
      params.getAll('StudyInstanceUIDs').find(uid => uid.trim())?.trim() ?? '';
    seriesInstanceUID =
      params.getAll('SeriesInstanceUIDs').find(uid => uid.trim())?.trim() ||
      undefined;
  }

  if (!studyInstanceUID) {
    return [];
  }

  return buildLocalDicomImagingStudyOpenContext({
    id: studyInstanceUID,
    studyInstanceUID,
    seriesInstanceUID,
  });
}

export function buildStatusResponsePayload(
  productName: string,
  servicesManager: ServicesManagerLike,
  imagingStudyContext?: unknown[]
): StatusResponsePayload {
  const stored = cloneContextArray(imagingStudyContext);
  const context =
    stored.length > 0 ? stored : imagingStudyContextFromViewer(servicesManager);
  return {
    source: 'status',
    product: productName,
    items: [{ key: 'availability', value: 'online' }],
    sceneview: buildSceneviewResponsePayload(productName, servicesManager),
    'context.type': context.length ? 'ImagingStudy' : '',
    context,
  };
}
