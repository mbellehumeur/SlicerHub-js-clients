/**
 * @typedef {object} FlexrayPreprocessResult
 * @property {Float32Array} tensor NCHW [1,1,S,S]
 * @property {number} size
 * @property {number} srcWidth
 * @property {number} srcHeight
 * @property {number} padLeft
 * @property {number} padTop
 * @property {number} contentW
 * @property {number} contentH
 */

/**
 * @param {Float32Array | number[]} gray length = width * height
 * @param {number} width
 * @param {number} height
 * @param {number} [size=256]
 * @param {number} [loPct=0.5]
 * @param {number} [hiPct=99.5]
 * @returns {FlexrayPreprocessResult}
 */
export function preprocessGrayToTensor(
  gray,
  width,
  height,
  size = 256,
  loPct = 0.5,
  hiPct = 99.5
) {
  const n = width * height;
  if (!gray || gray.length < n) {
    throw new Error('FleXray preprocess: gray buffer too small');
  }
  const sample = new Float32Array(n);
  for (let i = 0; i < n; i++) sample[i] = Number(gray[i]);

  const sorted = Float32Array.from(sample).sort();
  const lo = sorted[Math.max(0, Math.floor((loPct / 100) * (n - 1)))];
  const hi = sorted[Math.min(n - 1, Math.ceil((hiPct / 100) * (n - 1)))];
  const span = Math.max(hi - lo, 1e-8);
  for (let i = 0; i < n; i++) {
    sample[i] = Math.min(1, Math.max(0, (sample[i] - lo) / span));
  }

  const side = Math.max(width, height);
  const padLeft = Math.floor((side - width) / 2);
  const padTop = Math.floor((side - height) / 2);
  const square = new Float32Array(side * side); // zeros = pad

  for (let y = 0; y < height; y++) {
    const srcRow = y * width;
    const dstRow = (y + padTop) * side + padLeft;
    square.set(sample.subarray(srcRow, srcRow + width), dstRow);
  }

  const tensor = new Float32Array(1 * 1 * size * size);
  const scale = side / size;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const sx = Math.min(side - 1, Math.floor((x + 0.5) * scale));
      const sy = Math.min(side - 1, Math.floor((y + 0.5) * scale));
      tensor[y * size + x] = square[sy * side + sx];
    }
  }

  return {
    tensor,
    size,
    srcWidth: width,
    srcHeight: height,
    padLeft,
    padTop,
    contentW: width,
    contentH: height,
    squareSide: side,
  };
}

/**
 * Map 256² argmax/label indices back to source WxH (undo pad + resize).
 * @param {Uint8Array | Int32Array} labelSmall length size*size (or C*size*size argmax already done)
 * @param {FlexrayPreprocessResult & { squareSide: number }} meta
 * @returns {Uint8Array}
 */
export function upsampleLabelsToSource(labelSmall, meta) {
  const {
    size,
    srcWidth,
    srcHeight,
    padLeft,
    padTop,
    squareSide,
  } = meta;
  const out = new Uint8Array(srcWidth * srcHeight);
  const scaleDown = size / squareSide;
  for (let y = 0; y < srcHeight; y++) {
    for (let x = 0; x < srcWidth; x++) {
      const sqX = padLeft + x;
      const sqY = padTop + y;
      const sx = Math.min(size - 1, Math.floor((sqX + 0.5) * scaleDown));
      const sy = Math.min(size - 1, Math.floor((sqY + 0.5) * scaleDown));
      out[y * srcWidth + x] = labelSmall[sy * size + sx];
    }
  }
  return out;
}

/**
 * Probabilities [C,H,W] or [1,C,H,W] → per-pixel argmax label (0..C-1), background if max < threshold.
 * @param {Float32Array} probs
 * @param {number} channels
 * @param {number} size
 * @param {number} [threshold=0.5]
 * @returns {Uint8Array}
 */
export function probabilitiesToLabelMap(probs, channels, size, threshold = 0.5) {
  const plane = size * size;
  const out = new Uint8Array(plane);
  for (let i = 0; i < plane; i++) {
    let best = 0;
    let bestV = -Infinity;
    for (let c = 0; c < channels; c++) {
      const v = probs[c * plane + i];
      if (v > bestV) {
        bestV = v;
        best = c;
      }
    }
    out[i] = bestV >= threshold ? best : 0;
  }
  return out;
}
