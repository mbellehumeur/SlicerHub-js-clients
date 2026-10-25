// Shared helpers for Slicer hub.event names.
//
// Per-dataType events: '<dataType.lower()>-request' / '-response'.
// isRequestEvent / isResponseEvent use the suffixes only.
// Fixed wire events are always lowercase.
//
// Keep this mapping in sync with:
// - SlicerHub HubInterface/python_client/src/hub_client/client.py

export const REQUEST_SUFFIX = '-request';
export const RESPONSE_SUFFIX = '-response';

/** Fixed hub.event names — always lowercase on the wire. */
export const IMAGINGSTUDY_OPEN = 'imagingstudy-open';
export const IMAGINGSTUDY_CLOSE = 'imagingstudy-close';
export const STATUS_UPDATE = 'status-update';
export const SCENE_UPDATE = 'scene-update';
export const ANNOTATION_UPDATE = 'annotation-update';
export const ANNOTATION_DELETE = 'annotation-delete';
export const DICOM_SEND = 'dicom-send';
export const NIFTI_SEND = 'nifti-send';
export const PNG_SEND = 'png-send';
export const IDC_CLAUDE_SEND = 'idc-claude-send';
export const CONFERENCE_CHAT = 'conference-chat';
export const DICOMSR_UPDATE = 'dicomsr-update';
export const SUBSCRIPTION_REMOVED = 'subscription-removed';
export const HEARTBEAT = 'heartbeat';

export function normalizeDataType(dataType) {
  if (typeof dataType !== 'string') {
    return '';
  }
  return dataType.trim().toLowerCase();
}

export function requestEventFor(dataType) {
  const base = normalizeDataType(dataType);
  if (!base) {
    return '';
  }
  return `${base}${REQUEST_SUFFIX}`;
}

export function responseEventFor(dataType) {
  const base = normalizeDataType(dataType);
  if (!base) {
    return '';
  }
  return `${base}${RESPONSE_SUFFIX}`;
}

export function isRequestEvent(name) {
  if (typeof name !== 'string') {
    return false;
  }
  return name.endsWith(REQUEST_SUFFIX);
}

export function isResponseEvent(name) {
  if (typeof name !== 'string') {
    return false;
  }
  return name.endsWith(RESPONSE_SUFFIX);
}

export function dataTypeFromEventName(name) {
  if (typeof name !== 'string') {
    return '';
  }
  if (name.endsWith(REQUEST_SUFFIX)) {
    return name.slice(0, -REQUEST_SUFFIX.length);
  }
  if (name.endsWith(RESPONSE_SUFFIX)) {
    return name.slice(0, -RESPONSE_SUFFIX.length);
  }
  return '';
}

/** Ensures image-display STATUS requests are received when events are listed explicitly. */
export function ensureHubSubscribeEvents(events) {
  if (!events?.length) {
    return ['*'];
  }
  if (events.some((entry) => String(entry).trim() === '*')) {
    return ['*'];
  }
  const statusRequest = requestEventFor('STATUS');
  const normalized = new Set(
    events.map((entry) => String(entry).trim().toLowerCase()).filter(Boolean)
  );
  const extras = [];
  if (statusRequest && !normalized.has(statusRequest.toLowerCase())) {
    extras.push(statusRequest);
    normalized.add(statusRequest.toLowerCase());
  }
  if (!normalized.has(STATUS_UPDATE)) {
    extras.push(STATUS_UPDATE);
  }
  return extras.length ? [...events, ...extras] : [...events];
}

/** @deprecated Use ensureHubSubscribeEvents. */
export const ensureCastSubscribeEvents = ensureHubSubscribeEvents;

export default {
  REQUEST_SUFFIX,
  RESPONSE_SUFFIX,
  IMAGINGSTUDY_OPEN,
  IMAGINGSTUDY_CLOSE,
  STATUS_UPDATE,
  SCENE_UPDATE,
  ANNOTATION_UPDATE,
  ANNOTATION_DELETE,
  DICOM_SEND,
  NIFTI_SEND,
  PNG_SEND,
  IDC_CLAUDE_SEND,
  CONFERENCE_CHAT,
  DICOMSR_UPDATE,
  SUBSCRIPTION_REMOVED,
  HEARTBEAT,
  normalizeDataType,
  requestEventFor,
  responseEventFor,
  isRequestEvent,
  isResponseEvent,
  dataTypeFromEventName,
  ensureHubSubscribeEvents,
  ensureCastSubscribeEvents,
};
