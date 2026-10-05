export function getHubEventLower(event) {
  const hubEvent = event?.['hub.event'];
  return typeof hubEvent === 'string' ? hubEvent.trim().toLowerCase() : '';
}

export function getActorKeyword(actor) {
  if (typeof actor === 'string') {
    return actor.trim().toUpperCase();
  }
  if (!actor || typeof actor !== 'object') {
    return '';
  }
  const value =
    (typeof actor.keyword === 'string' && actor.keyword) ||
    (typeof actor.id === 'string' && actor.id) ||
    (typeof actor.key === 'string' && actor.key) ||
    '';
  return value.trim().toUpperCase();
}

export function getInboundTargetActorKeyword(message) {
  const dotted = message?.['target.actor'];
  if (dotted === undefined || dotted === null) {
    return '';
  }
  return getActorKeyword(dotted);
}

/** Deep-clone an ImagingStudy / STATUS context array (structuredClone with JSON fallback). */
export function cloneContextArray(context) {
  if (!Array.isArray(context)) {
    return [];
  }
  try {
    return structuredClone(context);
  } catch {
    try {
      return JSON.parse(JSON.stringify(context));
    } catch {
      return [...context];
    }
  }
}

/** ``event.context`` (array ImagingStudy-style, or dict HubBlobs / binary). */
export function messageEventContext(message) {
  const event = message?.event;
  if (event && typeof event === 'object' && event.context != null) {
    return event.context;
  }
  return [];
}

export function messageSubscriberName(message) {
  const name = String(
    message?.['subscriber.name'] || message?.subscriber || ''
  ).trim();
  return name || null;
}

export function messageProductName(message) {
  return String(message?.['subscriber.product.name'] || '').trim();
}

export function messageActor(message) {
  const single = String(message?.['subscriber.actor'] || '').trim();
  if (single) {
    return single;
  }
  const actors = message?.['subscriber.actors'];
  if (Array.isArray(actors)) {
    for (const entry of actors) {
      const a = String(entry || '').trim();
      if (a) {
        return a;
      }
    }
  }
  return '';
}

/**
 * Parse a ``status-update`` hub event.
 * @returns {{ message: string, level: string } | null}
 */
export function parseStatusUpdateMessage(message) {
  const event = message?.event;
  if (getHubEventLower(event) !== 'status-update') {
    return null;
  }
  const ctx =
    event?.context &&
    typeof event.context === 'object' &&
    !Array.isArray(event.context)
      ? event.context
      : {};
  const text = String(ctx.message ?? '').trim();
  return { message: text, level: String(ctx.level ?? 'info') };
}

function base64ToBytes(base64) {
  const decoded = atob(base64);
  const bytes = new Uint8Array(decoded.length);
  for (let i = 0; i < decoded.length; i += 1) {
    bytes[i] = decoded.charCodeAt(i);
  }
  return bytes;
}

export function decodeBase64ToArrayBuffer(base64) {
  try {
    const bytes = base64ToBytes(base64);
    const buf = new ArrayBuffer(bytes.byteLength);
    new Uint8Array(buf).set(bytes);
    return buf;
  } catch {
    return null;
  }
}

export function batchContextFiles(event) {
  const context = event?.context;
  if (!context || typeof context !== 'object' || Array.isArray(context)) {
    return [];
  }
  const files = context.files;
  return Array.isArray(files)
    ? files.filter((entry) => Boolean(entry && typeof entry === 'object'))
    : [];
}

function normalizeContextItems(event) {
  const context = event?.context;
  if (Array.isArray(context)) {
    return context;
  }
  return context != null ? [context] : [];
}

function fileEntryFromData(data, fileName, mimeType) {
  if (data instanceof ArrayBuffer) {
    return { arrayBuffer: data, fileName, mimeType };
  }
  if (typeof data === 'string' && data) {
    return { fileName, data, mimeType };
  }
  return null;
}

function defaultMimeForHubEvent(hubEventName) {
  if (hubEventName === 'nifti-send') {
    return 'application/vnd.unknown.nifti-1';
  }
  return 'application/dicom';
}

function defaultBatchFileName(hubEventName, idx) {
  if (hubEventName === 'nifti-send') {
    return `hub-nifti-send-${idx + 1}.nii.gz`;
  }
  return `hub-dicom-send-${idx + 1}.dcm`;
}

function defaultResourceFileName(hubEventName, idx) {
  if (hubEventName === 'nifti-send') {
    return `hub-nifti-send-${idx + 1}.nii.gz`;
  }
  return 'dicom-sr.dcm';
}

function mimeFromEntry(entry, hubEventName) {
  if (typeof entry.mimeType === 'string' && entry.mimeType.trim()) {
    return entry.mimeType.trim();
  }
  return defaultMimeForHubEvent(hubEventName);
}

function mimeFromResource(resource, hubEventName) {
  if (typeof resource.mimeType === 'string' && resource.mimeType.trim()) {
    return resource.mimeType.trim();
  }
  if (typeof resource.contentType === 'string' && resource.contentType.trim()) {
    return resource.contentType.trim();
  }
  return defaultMimeForHubEvent(hubEventName);
}

export function extractFilePayloadsForEvent(message, hubEventName) {
  const castEvent = message?.event;
  if (getHubEventLower(castEvent) !== hubEventName.toLowerCase()) {
    return [];
  }

  const batchFiles = batchContextFiles(castEvent);
  if (batchFiles.length) {
    const out = batchFiles
      .map((entry, idx) => {
        const mimeType = mimeFromEntry(entry, hubEventName);
        const fileName =
          typeof entry.fileName === 'string' && entry.fileName.trim()
            ? entry.fileName.trim()
            : defaultBatchFileName(hubEventName, idx);
        return fileEntryFromData(entry.data, fileName, mimeType);
      })
      .filter(Boolean);
    if (out.length) {
      return out;
    }
  }

  const contextItems = normalizeContextItems(castEvent);
  return contextItems
    .map((item, idx) => {
      if (!item || typeof item !== 'object') {
        return null;
      }
      const resource = item.resource;
      if (!resource || typeof resource !== 'object') {
        return null;
      }
      const mimeType = mimeFromResource(resource, hubEventName);
      const fileName =
        typeof resource.fileName === 'string' && resource.fileName.trim()
          ? resource.fileName.trim()
          : defaultResourceFileName(hubEventName, idx);
      return fileEntryFromData(resource.data, fileName, mimeType);
    })
    .filter(Boolean);
}

export function filePayloadToArrayBuffer(payload) {
  if (payload?.arrayBuffer instanceof ArrayBuffer) {
    return payload.arrayBuffer;
  }
  if (typeof payload?.data === 'string') {
    return decodeBase64ToArrayBuffer(payload.data);
  }
  return null;
}

export function filePayloadToFile(payload, defaultName, defaultMime) {
  const arrayBuffer = filePayloadToArrayBuffer(payload);
  if (!arrayBuffer) {
    return null;
  }
  const fileName = payload?.fileName || defaultName;
  const mimeType = payload?.mimeType || defaultMime;
  return new File([arrayBuffer], fileName, { type: mimeType });
}
