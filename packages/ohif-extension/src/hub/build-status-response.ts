import {
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

export function buildStatusResponsePayload(
  productName: string,
  servicesManager: ServicesManagerLike
): StatusResponsePayload {
  return {
    source: 'status',
    product: productName,
    items: [{ key: 'availability', value: 'online' }],
    sceneview: buildSceneviewResponsePayload(productName, servicesManager),
  };
}
