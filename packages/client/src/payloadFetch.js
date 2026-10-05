import {
  contextFilesFromEvent,
  firstPendingPayloadSlot,
  hasPendingPayload,
  payloadChunkPlan,
} from './sendNormalize';

export const HTTP_PAYLOAD_MAX_CONCURRENT = 25;

export function normalizeLoopbackUrl(urlString) {
  try {
    const parsed = new URL(urlString);
    if (parsed.hostname.toLowerCase() === 'localhost') {
      parsed.hostname = '127.0.0.1';
    }
    return parsed.toString();
  } catch (err) {
    return urlString;
  }
}

function isRetryableFetchError(err) {
  if (!(err instanceof Error)) {
    return false;
  }
  const name = err.name || '';
  return name === 'TypeError' || name === 'NetworkError';
}

export function resolvePayloadUrl(payloadId, hubEndpoint) {
  if (!payloadId) {
    return '';
  }
  try {
    const path = `/api/hub/payloads/${encodeURIComponent(payloadId)}`;
    return normalizeLoopbackUrl(new URL(path, hubEndpoint).toString());
  } catch (err) {
    console.warn('HubClient: invalid payloadId url', payloadId, err);
    return '';
  }
}

export function clearPayloadRefs(entry) {
  delete entry.binaryTransfer;
  delete entry.url;
  delete entry.payloadId;
  delete entry.payloadIds;
  delete entry.chunkByteLengths;
  delete entry.expiresAt;
}

export function reassembleFileChunks(chunks, expectedTotal) {
  const total = chunks.reduce((sum, buf) => sum + buf.byteLength, 0);
  if (
    typeof expectedTotal === 'number' &&
    expectedTotal >= 0 &&
    total !== expectedTotal
  ) {
    throw new Error(
      `HubClient: payload size mismatch expected=${expectedTotal} received=${total}`
    );
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (let i = 0; i < chunks.length; i++) {
    out.set(new Uint8Array(chunks[i]), offset);
    offset += chunks[i].byteLength;
  }
  return out.buffer;
}

export function attachPayloadToFile(castMessage, fileIndex, buf) {
  const event = castMessage && castMessage.event;
  const ctx = event && event.context;
  const files = ctx && ctx.files;
  const entry = files && files[fileIndex];
  if (!entry || typeof entry !== 'object') {
    return false;
  }
  clearPayloadRefs(entry);
  entry.data = buf;
  entry.byteLength = buf.byteLength;
  return true;
}

export async function downloadPayloadBytes(
  payloadId,
  expectedChunkBytes,
  { hubEndpoint, accessToken }
) {
  const resolved = resolvePayloadUrl(payloadId, hubEndpoint);
  if (!resolved) {
    throw new Error('HubClient.fetchPayload: missing or invalid payloadId');
  }
  const headers = {};
  if (accessToken) {
    headers.Authorization = `Bearer ${accessToken}`;
  }

  async function fetchOnce() {
    const response = await fetch(resolved, {
      method: 'GET',
      credentials: 'omit',
      headers,
    });
    if (!response.ok) {
      throw new Error(
        `HubClient.fetchPayload: GET ${response.status} ${response.statusText}`
      );
    }
    const buf = await response.arrayBuffer();
    if (
      typeof expectedChunkBytes === 'number' &&
      expectedChunkBytes >= 0 &&
      buf.byteLength !== expectedChunkBytes
    ) {
      throw new Error(
        `HubClient.fetchPayload: chunk size mismatch payloadId=${payloadId.slice(
          0,
          8
        )} expected=${expectedChunkBytes} received=${buf.byteLength}`
      );
    }
    return buf;
  }

  try {
    return await fetchOnce();
  } catch (err) {
    if (isRetryableFetchError(err)) {
      return fetchOnce();
    }
    throw err;
  }
}

export async function downloadFilePayloadChunks(entry, hubAccess) {
  const plan = payloadChunkPlan(entry);
  if (!plan.payloadIds.length) {
    throw new Error('HubClient.fetchPayload: no payloadIds on file entry');
  }
  const chunks = [];
  for (
    let start = 0;
    start < plan.payloadIds.length;
    start += HTTP_PAYLOAD_MAX_CONCURRENT
  ) {
    const batchIds = plan.payloadIds.slice(
      start,
      start + HTTP_PAYLOAD_MAX_CONCURRENT
    );
    const batchLens = plan.chunkByteLengths.slice(
      start,
      start + HTTP_PAYLOAD_MAX_CONCURRENT
    );
    // eslint-disable-next-line no-await-in-loop
    const batchBufs = await Promise.all(
      batchIds.map((id, idx) =>
        downloadPayloadBytes(id, batchLens[idx] ?? null, hubAccess)
      )
    );
    chunks.push(...batchBufs);
  }
  return reassembleFileChunks(
    chunks,
    typeof entry.byteLength === 'number' ? entry.byteLength : null
  );
}

/**
 * Download many payload GETs with a shared concurrency cap (Python client parity).
 * @param {Array<{ payloadId: string, expectedLength?: number|null }>} slots
 * @param {{ hubEndpoint: string, accessToken?: string }} hubAccess
 * @param {number} [maxConcurrent]
 * @returns {Promise<ArrayBuffer[]>} buffers in the same order as ``slots``
 */
export async function downloadPayloadSlotsParallel(
  slots,
  hubAccess,
  maxConcurrent = HTTP_PAYLOAD_MAX_CONCURRENT
) {
  if (!slots.length) {
    return [];
  }
  const limit = Math.max(1, maxConcurrent | 0);
  const results = new Array(slots.length);
  let next = 0;

  async function worker() {
    while (next < slots.length) {
      const i = next++;
      const slot = slots[i];
      results[i] = await downloadPayloadBytes(
        slot.payloadId,
        slot.expectedLength ?? null,
        hubAccess
      );
    }
  }

  const workers = Array.from(
    { length: Math.min(limit, slots.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

function cloneCastMessage(castMessage) {
  return JSON.parse(JSON.stringify(castMessage));
}

/**
 * @param {object} hubAccess { hubEndpoint, accessToken }
 */
export function createPayloadFetchApi(hubAccess) {
  const getHubAccess = () => hubAccess();

  return {
    hasPendingPayload(castMessage) {
      const event = castMessage && castMessage.event;
      return Boolean(event && hasPendingPayload(event));
    },

    async fetchPayload(castMessage) {
      const event = castMessage && castMessage.event;
      if (!event || !hasPendingPayload(event)) {
        return castMessage;
      }
      const slot = firstPendingPayloadSlot(event);
      if (!slot) {
        return castMessage;
      }
      const startedAt =
        typeof performance !== 'undefined' && performance.now
          ? performance.now()
          : Date.now();
      const entry = event.context.files[slot.index];
      const buf = await downloadFilePayloadChunks(entry, getHubAccess());
      const enriched = cloneCastMessage(castMessage);
      const attached = attachPayloadToFile(enriched, slot.index, buf);
      if (!attached) {
        throw new Error('HubClient.fetchPayload: no payload slot on message');
      }
      const elapsedMs =
        (typeof performance !== 'undefined' && performance.now
          ? performance.now()
          : Date.now()) - startedAt;
      console.debug(
        `HubClient: payload fetched fileIndex=${slot.index} ` +
          `bytes=${buf.byteLength} elapsed=${(elapsedMs / 1000).toFixed(2)}s`
      );
      return enriched;
    },

    async fetchAllPayloads(castMessage) {
      const event = castMessage && castMessage.event;
      const ctx = event && event.context;
      const files =
        ctx && typeof ctx === 'object' && !Array.isArray(ctx) && Array.isArray(ctx.files)
          ? ctx.files
          : [];
      /** @type {Array<{ fileIndex: number, chunkIndex: number, payloadId: string, expectedLength: number|null }>} */
      const slots = [];
      for (let i = 0; i < files.length; i++) {
        const entry = files[i];
        if (!entry || typeof entry !== 'object' || entry.data != null) {
          continue;
        }
        const plan = payloadChunkPlan(entry);
        if (!plan.payloadIds.length) {
          continue;
        }
        for (let c = 0; c < plan.payloadIds.length; c++) {
          slots.push({
            fileIndex: i,
            chunkIndex: c,
            payloadId: plan.payloadIds[c],
            expectedLength:
              typeof plan.chunkByteLengths[c] === 'number'
                ? plan.chunkByteLengths[c]
                : null,
          });
        }
      }
      if (!slots.length) {
        return castMessage;
      }

      const startedAt =
        typeof performance !== 'undefined' && performance.now
          ? performance.now()
          : Date.now();
      const hubAccess = getHubAccess();
      const buffers = await downloadPayloadSlotsParallel(
        slots,
        hubAccess,
        HTTP_PAYLOAD_MAX_CONCURRENT
      );

      /** @type {Map<number, ArrayBuffer[]>} */
      const byFile = new Map();
      for (let s = 0; s < slots.length; s++) {
        const { fileIndex, chunkIndex } = slots[s];
        let chunks = byFile.get(fileIndex);
        if (!chunks) {
          chunks = [];
          byFile.set(fileIndex, chunks);
        }
        chunks[chunkIndex] = buffers[s];
      }

      const enriched = cloneCastMessage(castMessage);
      for (const [fileIndex, chunks] of byFile) {
        const entry = enriched.event.context.files[fileIndex];
        const expectedTotal =
          typeof entry.byteLength === 'number' ? entry.byteLength : null;
        const buf = reassembleFileChunks(chunks, expectedTotal);
        if (!attachPayloadToFile(enriched, fileIndex, buf)) {
          throw new Error('HubClient.fetchAllPayloads: attach failed');
        }
      }

      const elapsedMs =
        (typeof performance !== 'undefined' && performance.now
          ? performance.now()
          : Date.now()) - startedAt;
      console.debug(
        `HubClient: fetchAllPayloads files=${byFile.size} chunks=${slots.length} ` +
          `concurrent=${HTTP_PAYLOAD_MAX_CONCURRENT} ` +
          `elapsed=${(elapsedMs / 1000).toFixed(2)}s`
      );
      return enriched;
    },
  };
}
