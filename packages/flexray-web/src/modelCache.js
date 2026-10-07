/** @typedef {{ index: number, name: string, color: string | null }} FlexrayLabel */

/**
 * @typedef {object} FlexrayManifestModel
 * @property {string} id
 * @property {string} url
 * @property {string} sha256
 * @property {number} size_bytes
 * @property {string} input_name
 * @property {string} output_name
 * @property {number[]} input_shape
 */

/**
 * @typedef {object} FlexrayManifest
 * @property {FlexrayManifestModel} model
 * @property {{ members?: FlexrayManifestModel[] }} [ensemble]
 * @property {{ image_size: number[], normalization?: { percentiles?: number[] } }} preprocessing
 * @property {number} [threshold]
 * @property {FlexrayLabel[]} labels
 */

/**
 * @typedef {FlexrayManifestModel & { isDefault: boolean, optionLabel: string }} FlexrayModelChoice
 */

/**
 * @param {number} bytes
 * @returns {string}
 */
export function formatFlexrayDownloadSize(bytes) {
  const n = Number(bytes) || 0;
  if (n >= 1e9) {
    const gb = n / 1e9;
    return `${gb >= 10 ? Math.round(gb) : gb.toFixed(1).replace(/\.0$/, '')} GB`;
  }
  if (n >= 1e6) return `${Math.round(n / 1e6)} MB`;
  if (n >= 1e3) return `${Math.round(n / 1e3)} KB`;
  return `${n} B`;
}

/**
 * Default `model` first, then `ensemble.members`, de-duplicated by id.
 * @param {FlexrayManifest | null | undefined} manifest
 * @returns {FlexrayModelChoice[]}
 */
export function listFlexrayModelChoices(manifest) {
  /** @type {FlexrayModelChoice[]} */
  const out = [];
  const seen = new Set();
  const defaultId = String(manifest?.model?.id || '').trim();
  const push = (raw, isDefault) => {
    if (!raw || typeof raw !== 'object') return;
    const id = String(raw.id || '').trim();
    const url = String(raw.url || '').trim();
    if (!id || !url || seen.has(id)) return;
    seen.add(id);
    const size_bytes = Number(raw.size_bytes) || 0;
    out.push({
      ...raw,
      id,
      url,
      size_bytes,
      isDefault: Boolean(isDefault) || id === defaultId,
      optionLabel: `${id} — ${formatFlexrayDownloadSize(size_bytes)}`,
    });
  };
  push(manifest?.model, true);
  const members = manifest?.ensemble?.members;
  if (Array.isArray(members)) {
    for (const member of members) push(member, false);
  }
  return out;
}

/**
 * Checkpoints needed for a quality mode.
 * Low = flagship only. High = flagship + ensemble members.
 * @param {FlexrayManifest | null | undefined} manifest
 * @param {string | undefined} quality
 * @returns {FlexrayModelChoice[]}
 */
export function flexrayModelsForQuality(manifest, quality) {
  const all = listFlexrayModelChoices(manifest);
  if (String(quality || '').toLowerCase() === 'high') return all;
  const flagship = all.find((m) => m.isDefault);
  return flagship ? [flagship] : all.slice(0, 1);
}

/**
 * @typedef {{ id: string, optionLabel: string, size_bytes: number, isDefault: boolean }} FlexrayQualityChoice
 */

/**
 * Low / High dropdown entries with total download size for that mode.
 * @param {FlexrayManifest | null | undefined} manifest
 * @returns {FlexrayQualityChoice[]}
 */
export function listFlexrayQualityChoices(manifest) {
  const sumBytes = (models) =>
    models.reduce((s, m) => s + (Number(m.size_bytes) || 0), 0);
  const lowModels = flexrayModelsForQuality(manifest, 'low');
  const highModels = flexrayModelsForQuality(manifest, 'high');
  const lowBytes = sumBytes(lowModels);
  const highBytes = sumBytes(highModels);
  return [
    {
      id: 'low',
      size_bytes: lowBytes,
      isDefault: true,
      optionLabel: `Low — ${formatFlexrayDownloadSize(lowBytes)}`,
    },
    {
      id: 'high',
      size_bytes: highBytes,
      isDefault: false,
      optionLabel: `High — ${formatFlexrayDownloadSize(highBytes)}`,
    },
  ];
}

/**
 * @param {FlexrayManifest | null | undefined} manifest
 * @param {string | undefined} modelId
 * @returns {FlexrayModelChoice | FlexrayManifestModel | null}
 */
export function flexrayModelChoiceById(manifest, modelId) {
  const choices = listFlexrayModelChoices(manifest);
  const want = String(modelId || '').trim();
  if (want) {
    const hit = choices.find((c) => c.id === want);
    if (hit) return hit;
  }
  return choices[0] || manifest?.model || null;
}

export const DEFAULT_MANIFEST_URL =
  'https://flexray.csail.mit.edu/demo/demo_manifest.json';

const CACHE_NAME = 'slicer-hub-flexray-v1';

/**
 * @param {string} [manifestUrl]
 * @returns {Promise<FlexrayManifest>}
 */
export async function fetchFlexrayManifest(
  manifestUrl = DEFAULT_MANIFEST_URL
) {
  const res = await fetch(manifestUrl, { mode: 'cors' });
  if (!res.ok) {
    throw new Error(`FleXray manifest HTTP ${res.status}`);
  }
  const json = await res.json();
  if (!json?.model?.url || !Array.isArray(json.labels)) {
    throw new Error('FleXray manifest missing model.url or labels');
  }
  return /** @type {FlexrayManifest} */ (json);
}

/**
 * @param {ArrayBuffer} buffer
 * @returns {Promise<string>}
 */
async function sha256Hex(buffer) {
  const digest = await crypto.subtle.digest('SHA-256', buffer);
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * @param {FlexrayManifestModel} model
 * @param {{ onProgress?: (p: { phase: string, loaded?: number, total?: number }) => void }} [opts]
 * @returns {Promise<ArrayBuffer>}
 */
export async function fetchFlexrayModelBuffer(model, opts = {}) {
  const onProgress = opts.onProgress;
  const cache =
    typeof caches !== 'undefined' ? await caches.open(CACHE_NAME) : null;
  if (cache) {
    const hit = await cache.match(model.url);
    if (hit) {
      onProgress?.({ phase: 'cache-hit', loaded: model.size_bytes, total: model.size_bytes });
      const buf = await hit.arrayBuffer();
      const hex = await sha256Hex(buf);
      if (hex === String(model.sha256 || '').toLowerCase()) {
        return buf;
      }
      await cache.delete(model.url);
    }
  }

  onProgress?.({ phase: 'download', loaded: 0, total: model.size_bytes });
  const res = await fetch(model.url, { mode: 'cors' });
  if (!res.ok) {
    throw new Error(`FleXray model HTTP ${res.status}`);
  }
  const total = Number(res.headers.get('content-length')) || model.size_bytes || 0;
  if (!res.body || !res.body.getReader) {
    const buf = await res.arrayBuffer();
    onProgress?.({ phase: 'download', loaded: buf.byteLength, total: buf.byteLength });
    return finishModelBuffer(buf, model, cache, onProgress);
  }

  const reader = res.body.getReader();
  const chunks = [];
  let loaded = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
    loaded += value.byteLength;
    onProgress?.({ phase: 'download', loaded, total });
  }
  const buf = new Uint8Array(loaded);
  let offset = 0;
  for (const chunk of chunks) {
    buf.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return finishModelBuffer(buf.buffer, model, cache, onProgress);
}

/**
 * @param {ArrayBuffer} buffer
 * @param {FlexrayManifestModel} model
 * @param {Cache | null} cache
 * @param {((p: { phase: string, loaded?: number, total?: number }) => void) | undefined} onProgress
 */
async function finishModelBuffer(buffer, model, cache, onProgress) {
  const hex = await sha256Hex(buffer);
  const expected = String(model.sha256 || '').toLowerCase();
  if (expected && hex !== expected) {
    throw new Error(
      `FleXray model sha256 mismatch (got ${hex.slice(0, 12)}…, expected ${expected.slice(0, 12)}…)`
    );
  }
  if (cache) {
    await cache.put(
      model.url,
      new Response(buffer, {
        headers: { 'Content-Type': 'application/octet-stream' },
      })
    );
  }
  onProgress?.({
    phase: 'ready',
    loaded: buffer.byteLength,
    total: buffer.byteLength,
  });
  return buffer;
}
