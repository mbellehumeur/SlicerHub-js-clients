import { requestEventFor } from './eventNames.js';
import {
  HUB_INFERENCE_SERVERS,
  findInferenceServerByProduct,
} from './inferenceServers.js';
import { parseCollatedRequestResult } from './collatedRequest.js';
import {
  isDentalSegProduct,
  isFlexrayProduct,
  isLungScreeningProduct,
  isMhubProduct,
  isNeuroSegProduct,
  isStatusPayloadOnline,
  isTorchXrayVisionProduct,
  isTotalSegmentatorProduct,
  productNameFromStatusResponseItem,
  statusItemValue,
} from './statusProtocol.js';

/**
 * @typedef {object} CastProductStatusProbe
 * @property {boolean} online
 * @property {unknown[]} items
 * @property {string} [job]
 * @property {string} [error]
 * @property {unknown} [raw]
 * @property {string} [productName]
 */

/**
 * @param {unknown} data
 * @returns {CastProductStatusProbe}
 */
function probeFromStatusData(data, productName, raw) {
  if (!data || typeof data !== 'object') {
    return { online: false, items: [], raw, ...(productName ? { productName } : {}) };
  }
  const payload = /** @type {{ items?: unknown }} */ (data);
  const items = Array.isArray(payload.items) ? payload.items : [];
  const job = statusItemValue(items, 'job');
  const online = isStatusPayloadOnline(data);
  return {
    online,
    items,
    ...(job ? { job } : {}),
    raw,
    ...(productName ? { productName } : {}),
  };
}

/**
 * Parse a HubClient.request STATUS result into a probe summary for one product.
 * Uses the first response row that looks like a status payload.
 * @param {unknown} requestResult
 * @returns {CastProductStatusProbe}
 */
export function parseProductStatusProbe(requestResult) {
  if (!requestResult || typeof requestResult !== 'object') {
    return { online: false, items: [], error: 'Empty STATUS result' };
  }
  const result = /** @type {{ ok?: boolean, status?: number, data?: unknown }} */ (
    requestResult
  );
  if (result.ok === false) {
    return {
      online: false,
      items: [],
      error: `HTTP ${result.status ?? '?'}`,
      raw: result.data,
    };
  }
  const { responses } = parseCollatedRequestResult(result.data);
  for (const item of responses) {
    const data = item.data;
    if (!data || typeof data !== 'object') {
      continue;
    }
    const productName = productNameFromStatusResponseItem(item) || undefined;
    const probe = probeFromStatusData(data, productName, result.data);
    if (probe.online || Array.isArray(/** @type {{ items?: unknown }} */ (data).items)) {
      return probe;
    }
  }
  return { online: false, items: [], raw: result.data };
}

/**
 * @param {{ request: (args: Record<string, unknown>) => Promise<unknown> }} client
 * @param {{
 *   subscriberName: string,
 *   subscriberProductName?: string,
 *   subscriberActor?: string,
 *   topic?: string,
 *   targetActor?: string,
 *   targetProductName?: string,
 * }} opts
 * @returns {Promise<unknown>}
 */
export async function requestCastStatus(client, opts) {
  const subscriberName = String(opts?.subscriberName || '').trim();
  if (!client?.request) {
    return { ok: false, status: 0, data: { error: 'No Hub client' } };
  }
  if (!subscriberName) {
    return { ok: false, status: 0, data: { error: 'No subscriber name' } };
  }
  const topic = String(opts?.topic || '').trim();
  const subscriberProductName = String(opts?.subscriberProductName || '').trim();
  const subscriberActor = String(opts?.subscriberActor || '').trim();
  const targetActor = String(opts?.targetActor || '*').trim() || '*';
  const targetProductName = String(opts?.targetProductName || '').trim();
  return client.request({
    'subscriber.name': subscriberName,
    ...(subscriberProductName
      ? { 'subscriber.product.name': subscriberProductName }
      : {}),
    ...(subscriberActor ? { 'subscriber.actor': subscriberActor } : {}),
    'target.actor': targetActor,
    ...(targetProductName ? { 'target.product.name': targetProductName } : {}),
    event: {
      'hub.event': requestEventFor('STATUS'),
      ...(topic ? { 'hub.topic': topic } : {}),
      context: { dataType: 'STATUS' },
    },
  });
}

/**
 * Ask Image Display (ID) to export and publish the current LiveScene as ImagingStudy-open.
 * @param {{ request: (args: Record<string, unknown>) => Promise<unknown> }} client
 * @param {{
 *   subscriberName: string,
 *   subscriberProductName?: string,
 *   subscriberActor?: string,
 *   topic?: string,
 *   targetActor?: string,
 *   targetProductName?: string,
 * }} opts
 */
export async function requestCastLiveScene(client, opts) {
  const subscriberName = String(opts?.subscriberName || '').trim();
  if (!client?.request) {
    return { ok: false, status: 0, data: { error: 'No Hub client' } };
  }
  if (!subscriberName) {
    return { ok: false, status: 0, data: { error: 'No subscriber name' } };
  }
  const topic = String(opts?.topic || '').trim();
  const subscriberProductName = String(opts?.subscriberProductName || '').trim();
  const subscriberActor = String(opts?.subscriberActor || '').trim();
  const targetActor = String(opts?.targetActor || 'ID').trim() || 'ID';
  const targetProductName = String(opts?.targetProductName || '').trim();
  return client.request({
    'subscriber.name': subscriberName,
    ...(subscriberProductName
      ? { 'subscriber.product.name': subscriberProductName }
      : {}),
    ...(subscriberActor ? { 'subscriber.actor': subscriberActor } : {}),
    'target.actor': targetActor,
    ...(targetProductName ? { 'target.product.name': targetProductName } : {}),
    event: {
      'hub.event': requestEventFor('LIVESCENE'),
      ...(topic ? { 'hub.topic': topic } : {}),
      context: { dataType: 'LIVESCENE' },
    },
  });
}

/**
 * STATUS hub-request targeting one product.
 * @param {{ request: (args: Record<string, unknown>) => Promise<unknown> }} client
 * @param {{
 *   targetProductName: string,
 *   subscriberName: string,
 *   subscriberProductName?: string,
 *   subscriberActor?: string,
 *   topic?: string,
 * }} opts
 * @returns {Promise<CastProductStatusProbe>}
 */
export async function requestCastProductStatus(client, opts) {
  const targetProductName = String(opts?.targetProductName || '').trim();
  const subscriberName = String(opts?.subscriberName || '').trim();
  if (!client?.request) {
    return { online: false, items: [], error: 'No Hub client' };
  }
  if (!subscriberName) {
    return { online: false, items: [], error: 'No subscriber name' };
  }
  if (!targetProductName) {
    return { online: false, items: [], error: 'No target product' };
  }
  try {
    const result = await requestCastStatus(client, {
      subscriberName,
      subscriberProductName: opts?.subscriberProductName,
      subscriberActor: opts?.subscriberActor,
      topic: opts?.topic,
      targetProductName,
    });
    return parseProductStatusProbe(result);
  } catch (err) {
    return {
      online: false,
      items: [],
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * @param {string} productName
 * @param {(typeof HUB_INFERENCE_SERVERS)[number]} server
 */
function productMatchesInferenceServer(productName, server) {
  if (!productName) return false;
  const found = findInferenceServerByProduct(productName);
  if (found && found.id === server.id) return true;
  if (server.id === 'mhub') return isMhubProduct(productName);
  if (server.id === 'totalseg') return isTotalSegmentatorProduct(productName);
  if (server.id === 'lung') return isLungScreeningProduct(productName);
  if (server.id === 'neuro') return isNeuroSegProduct(productName);
  if (server.id === 'dental') return isDentalSegProduct(productName);
  if (server.id === 'txrv') return isTorchXrayVisionProduct(productName);
  if (server.id === 'flexray') return isFlexrayProduct(productName);
  return false;
}

/**
 * Map a collated STATUS request result onto HUB_INFERENCE_SERVERS.
 * @param {unknown} requestResult
 * @returns {Array<{ server: (typeof HUB_INFERENCE_SERVERS)[number], probe: CastProductStatusProbe }>}
 */
export function mapInferenceServersFromStatusResult(requestResult) {
  if (!requestResult || typeof requestResult !== 'object') {
    return HUB_INFERENCE_SERVERS.map((server) => ({
      server,
      probe: { online: false, items: [], error: 'Empty STATUS result' },
    }));
  }
  const result = /** @type {{ ok?: boolean, status?: number, data?: unknown }} */ (
    requestResult
  );
  if (result.ok === false) {
    const error = `HTTP ${result.status ?? '?'}`;
    return HUB_INFERENCE_SERVERS.map((server) => ({
      server,
      probe: { online: false, items: [], error, raw: result.data },
    }));
  }
  const { responses } = parseCollatedRequestResult(result.data);
  return HUB_INFERENCE_SERVERS.map((server) => {
    for (const item of responses) {
      const productName = productNameFromStatusResponseItem(item);
      if (!productMatchesInferenceServer(productName, server)) continue;
      const data = item.data;
      return {
        server,
        probe: probeFromStatusData(
          data,
          productName || server.product,
          result.data
        ),
      };
    }
    return {
      server,
      probe: { online: false, items: [], raw: result.data },
    };
  });
}

/**
 * Probe all known Hub inference servers with one general STATUS request.
 * Hub fans out and collates; this maps responses[] onto the catalog.
 * @param {{ request: (args: Record<string, unknown>) => Promise<unknown> }} client
 * @param {{
 *   subscriberName: string,
 *   subscriberProductName?: string,
 *   subscriberActor?: string,
 *   topic?: string,
 * }} opts
 * @returns {Promise<Array<{ server: (typeof HUB_INFERENCE_SERVERS)[number], probe: CastProductStatusProbe }>>}
 */
export async function probeCastInferenceServers(client, opts) {
  const subscriberName = String(opts?.subscriberName || '').trim();
  if (!client?.request || !subscriberName) {
    return HUB_INFERENCE_SERVERS.map((server) => ({
      server,
      probe: {
        online: false,
        items: [],
        error: !client?.request ? 'No Hub client' : 'No subscriber name',
      },
    }));
  }
  try {
    const result = await requestCastStatus(client, {
      subscriberName,
      subscriberProductName: opts?.subscriberProductName,
      subscriberActor: opts?.subscriberActor,
      topic: opts?.topic,
      targetActor: '*',
    });
    return mapInferenceServersFromStatusResult(result);
  } catch (err) {
    const error = err instanceof Error ? err.message : String(err);
    return HUB_INFERENCE_SERVERS.map((server) => ({
      server,
      probe: { online: false, items: [], error },
    }));
  }
}

/**
 * Publish a URL-file job (dicom-send / nifti-send) to a target product.
 * @param {{ publish: (args: Record<string, unknown>) => Promise<unknown> }} client
 * @param {{
 *   targetProductName: string,
 *   hubEvent: string,
 *   files: Array<{ url: string, fileName?: string }>,
 *   subscriberName: string,
 *   subscriberProductName?: string,
 *   subscriberActor?: string,
 *   topic: string,
 *   contextExtras?: Record<string, unknown>,
 * }} opts
 * @returns {Promise<{ ok: boolean, detail: string, response?: unknown }>}
 */
export async function publishCastUrlSend(client, opts) {
  const targetProductName = String(opts?.targetProductName || '').trim();
  const hubEvent = String(opts?.hubEvent || '').trim();
  const subscriberName = String(opts?.subscriberName || '').trim();
  const topic = String(opts?.topic || '').trim();
  const files = Array.isArray(opts?.files) ? opts.files : [];
  if (!client?.publish) {
    return { ok: false, detail: 'No Hub client' };
  }
  if (!subscriberName) {
    return { ok: false, detail: 'No subscriber name' };
  }
  if (!topic) {
    return { ok: false, detail: 'No Hub topic' };
  }
  if (!targetProductName) {
    return { ok: false, detail: 'No target product' };
  }
  if (!hubEvent) {
    return { ok: false, detail: 'No hub.event' };
  }
  if (!files.length) {
    return { ok: false, detail: 'No volume files' };
  }
  const subscriberProductName = String(opts?.subscriberProductName || '').trim();
  const subscriberActor = String(opts?.subscriberActor || '').trim();
  const contextExtras =
    opts?.contextExtras && typeof opts.contextExtras === 'object'
      ? opts.contextExtras
      : {};
  try {
    const response = await client.publish({
      'subscriber.name': subscriberName,
      ...(subscriberProductName
        ? { 'subscriber.product.name': subscriberProductName }
        : {}),
      ...(subscriberActor ? { 'subscriber.actor': subscriberActor } : {}),
      'target.product.name': targetProductName,
      event: {
        'hub.topic': topic,
        'hub.event': hubEvent,
        context: {
          files: files.map((f) => ({
            url: String(f.url || '').trim(),
            fileName:
              String(f.fileName || 'volume').trim() || 'volume',
          })),
          ...contextExtras,
        },
      },
    });
    const ok = Boolean(response && /** @type {{ ok?: boolean }} */ (response).ok !== false);
    return {
      ok,
      detail: ok
        ? 'published'
        : `publish status ${/** @type {{ status?: number }} */ (response)?.status ?? '?'}`,
      response,
    };
  } catch (err) {
    return {
      ok: false,
      detail: err instanceof Error ? err.message : String(err),
    };
  }
}
