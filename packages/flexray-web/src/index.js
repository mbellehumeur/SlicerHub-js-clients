import {
  fetchFlexrayManifest,
  fetchFlexrayModelBuffer,
  flexrayModelsForQuality,
} from './modelCache.js';

export {
  DEFAULT_MANIFEST_URL,
  fetchFlexrayManifest,
  flexrayModelChoiceById,
  flexrayModelsForQuality,
  formatFlexrayDownloadSize,
  listFlexrayModelChoices,
  listFlexrayQualityChoices,
} from './modelCache.js';
import {
  preprocessGrayToTensor,
  probabilitiesToLabelMap,
  upsampleLabelsToSource,
} from './preprocess.js';

/** @type {typeof import('onnxruntime-web') | null} */
let ort = null;
/** @type {import('onnxruntime-web').InferenceSession[]} */
let sessions = [];
/** @type {import('./modelCache.js').FlexrayManifest | null} */
let manifest = null;
/** @type {import('./modelCache.js').FlexrayManifestModel[]} */
let activeModels = [];
/** @type {string} */
let activeQuality = '';
/** @type {string} */
let activeEp = '';

/**
 * @param {string | undefined} ortWasmPaths
 * @returns {string}
 */
function resolveOrtBase(ortWasmPaths) {
  let base = ortWasmPaths;
  if (!base && typeof window !== 'undefined') {
    const publicUrl = String(window.PUBLIC_URL || '/').replace(/\/?$/, '/');
    const origin = window.location?.origin || '';
    base = `${origin}${publicUrl}ort/`;
  }
  base = base || '/ort/';
  return base.endsWith('/') ? base : `${base}/`;
}

/**
 * Load ORT from the OHIF-copied /ort/ assets (not the rspack bundle).
 * Bundling ort.webgpu.min.js breaks WASM locateFile; script tag keeps paths intact.
 * @param {string} src
 * @returns {Promise<typeof import('onnxruntime-web')>}
 */
function loadOrtScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-flexray-ort="${src}"]`);
    if (existing) {
      if (globalThis.ort?.InferenceSession) {
        resolve(/** @type {typeof import('onnxruntime-web')} */ (globalThis.ort));
        return;
      }
      existing.addEventListener('load', () => {
        if (!globalThis.ort?.InferenceSession) {
          reject(new Error(`ORT global missing after ${src}`));
          return;
        }
        resolve(/** @type {typeof import('onnxruntime-web')} */ (globalThis.ort));
      });
      existing.addEventListener('error', () =>
        reject(new Error(`Failed to load ${src}`))
      );
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = true;
    script.dataset.flexrayOrt = src;
    script.onload = () => {
      if (!globalThis.ort?.InferenceSession) {
        reject(new Error(`ORT global missing after ${src}`));
        return;
      }
      resolve(/** @type {typeof import('onnxruntime-web')} */ (globalThis.ort));
    };
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(script);
  });
}

/**
 * @param {{ ortWasmPaths?: string }} [opts]
 * @returns {Promise<typeof import('onnxruntime-web')>}
 */
async function loadOrt(opts = {}) {
  if (ort) return ort;
  const base = resolveOrtBase(opts.ortWasmPaths);
  try {
    ort = await loadOrtScript(`${base}ort.webgpu.min.js`);
  } catch (err) {
    console.warn(
      '[flexray-web] ort.webgpu.min.js unavailable, trying ort.wasm.min.js',
      err
    );
    ort = await loadOrtScript(`${base}ort.wasm.min.js`);
  }
  return ort;
}

/**
 * @param {unknown} err
 * @returns {string}
 */
function errDetail(err) {
  if (err instanceof Error) return err.message || String(err);
  if (err != null) return String(err);
  return 'unknown';
}

/**
 * @returns {Promise<void>}
 */
async function releaseSessions() {
  for (const sess of sessions) {
    try {
      await sess.release?.();
    } catch {
      // ignore
    }
  }
  sessions = [];
  activeModels = [];
  activeQuality = '';
  manifest = null;
}

/**
 * @param {unknown} opts
 * @returns {'low' | 'high'}
 */
function normalizeQuality(opts) {
  const raw = String(opts?.quality || opts?.modelId || 'low').toLowerCase();
  return raw === 'high' ? 'high' : 'low';
}

/**
 * @param {{
 *   ortWasmPaths?: string,
 *   manifestUrl?: string,
 *   quality?: string,
 *   modelId?: string,
 *   onProgress?: (p: { phase: string, loaded?: number, total?: number, detail?: string }) => void,
 * }} [opts]
 */
export async function ensureFlexraySession(opts = {}) {
  const quality = normalizeQuality(opts);
  if (sessions.length && manifest && activeQuality === quality) {
    return {
      session: sessions[0],
      manifest,
      executionProvider: activeEp,
      model: activeModels[0],
      quality,
    };
  }
  await releaseSessions();
  const onProgress = opts.onProgress;
  const ortMod = await loadOrt(opts);

  onProgress?.({ phase: 'manifest' });
  manifest = await fetchFlexrayManifest(opts.manifestUrl);
  const models = flexrayModelsForQuality(manifest, quality);
  if (!models.length || !models[0]?.url) {
    throw new Error('FleXray manifest missing a usable model');
  }

  const wasmPaths = resolveOrtBase(opts.ortWasmPaths);
  try {
    ortMod.env.wasm.wasmPaths = wasmPaths;
    const isolated =
      typeof crossOriginIsolated !== 'undefined' && crossOriginIsolated;
    ortMod.env.wasm.numThreads = isolated
      ? ortMod.env.wasm.numThreads || 1
      : 1;
  } catch {
    // ignore
  }

  const providers = [];
  if (typeof navigator !== 'undefined' && navigator.gpu) {
    providers.push('webgpu');
  }
  providers.push('wasm');

  const totalBytes = models.reduce(
    (sum, model) => sum + (Number(model.size_bytes) || 0),
    0
  );
  let completedBytes = 0;
  let lastErr;
  /** @type {string[]} */
  let epOrder = [...providers];

  for (let i = 0; i < models.length; i++) {
    const model = models[i];
    const buffer = await fetchFlexrayModelBuffer(model, {
      onProgress: (p) => {
        if (p.phase !== 'download') return;
        onProgress?.({
          phase: 'download',
          loaded: completedBytes + (p.loaded || 0),
          total: totalBytes || p.total,
          detail: `Downloading ${model.id} (${i + 1}/${models.length})…`,
        });
      },
    });
    completedBytes +=
      Number(model.size_bytes) ||
      (buffer instanceof ArrayBuffer ? buffer.byteLength : buffer.length);
    const modelBytes =
      buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;

    let created = null;
    for (const ep of epOrder) {
      try {
        onProgress?.({
          phase: 'session',
          detail: `ORT ${ep} ${model.id} (${i + 1}/${models.length})…`,
        });
        created = await ortMod.InferenceSession.create(modelBytes, {
          executionProviders: [ep],
        });
        activeEp = ep;
        epOrder = [ep];
        break;
      } catch (err) {
        lastErr = err;
        onProgress?.({
          phase: 'session-fallback',
          detail: `${model.id} ${ep} failed: ${errDetail(err)}`,
        });
      }
    }
    if (!created) {
      await releaseSessions();
      throw new Error(`FleXray ORT session failed (${errDetail(lastErr)})`);
    }
    sessions.push(created);
    activeModels.push(model);
  }

  activeQuality = quality;
  onProgress?.({ phase: 'session-ready', detail: `${activeEp} × ${sessions.length}` });
  return {
    session: sessions[0],
    manifest,
    executionProvider: activeEp,
    model: activeModels[0],
    quality,
  };
}

export function isFlexrayLocalReady() {
  return Boolean(sessions.length && manifest);
}

export function getFlexrayManifest() {
  return manifest;
}

/**
 * @param {Float32Array | number[]} gray
 * @param {number} width
 * @param {number} height
 * @returns {Promise<{
 *   labelMapFull: Uint8Array,
 *   labels: import('./modelCache.js').FlexrayLabel[],
 *   width: number,
 *   height: number,
 *   executionProvider: string,
 *   usedLabels: Array<{ index: number, name: string, color: string | null, voxelCount: number }>,
 * }>}
 */
export async function runFlexrayOnGrayFloat(gray, width, height) {
  if (!sessions.length || !manifest || !activeModels.length) {
    throw new Error('FleXray session not ready — call ensureFlexraySession() first');
  }
  const ortMod = await loadOrt();
  const size = Number(manifest.preprocessing?.image_size?.[0]) || 256;
  const percentiles = manifest.preprocessing?.normalization?.percentiles || [
    0.5, 99.5,
  ];
  const meta = preprocessGrayToTensor(
    gray,
    width,
    height,
    size,
    percentiles[0] ?? 0.5,
    percentiles[1] ?? 99.5
  );

  /** @type {Float32Array | null} */
  let acc = null;
  let channels = 0;
  for (let i = 0; i < sessions.length; i++) {
    const model = activeModels[i] || activeModels[0];
    const inputName = model.input_name || 'input';
    const outputName = model.output_name || 'probabilities';
    const tensor = new ortMod.Tensor('float32', meta.tensor, [1, 1, size, size]);
    const results = await sessions[i].run({ [inputName]: tensor });
    const out = results[outputName];
    if (!out?.data) {
      throw new Error(`FleXray missing output tensor "${outputName}"`);
    }
    const data = /** @type {Float32Array} */ (
      out.data instanceof Float32Array
        ? out.data
        : new Float32Array(out.data)
    );
    const dims = out.dims || [];
    if (dims.length === 4) {
      channels = Number(dims[1]);
    } else if (dims.length === 3) {
      channels = Number(dims[0]);
    } else {
      channels = Math.floor(data.length / (size * size));
    }
    if (!acc) {
      acc = new Float32Array(data);
    } else {
      if (acc.length !== data.length) {
        throw new Error('FleXray ensemble output size mismatch');
      }
      for (let j = 0; j < acc.length; j++) acc[j] += data[j];
    }
  }
    if (!acc) {
      throw new Error('FleXray produced no probabilities');
    }
    const n = sessions.length;
  for (let j = 0; j < acc.length; j++) acc[j] /= n;

  const threshold = Number(manifest.threshold) || 0.5;
  const labelSmall = probabilitiesToLabelMap(acc, channels, size, threshold);
  const labelMapFull = upsampleLabelsToSource(labelSmall, meta);

  const counts = new Map();
  for (let i = 0; i < labelMapFull.length; i++) {
    const v = labelMapFull[i];
    if (v === 0) continue;
    counts.set(v, (counts.get(v) || 0) + 1);
  }
  const labels = manifest.labels || [];
  const usedLabels = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([index, voxelCount]) => {
      const def = labels.find((l) => l.index === index);
      return {
        index,
        name: def?.name || `label_${index}`,
        color: def?.color ?? null,
        voxelCount,
      };
    });

  return {
    labelMapFull,
    labels,
    width,
    height,
    executionProvider: activeEp,
    usedLabels,
  };
}
