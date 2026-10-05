/**
 * CT volume-rendering presets (Slicer/OHIF ids) + TF samples for thumbnail previews.
 * Names must match SlicerLive `CT_VR_PRESETS` so scene-update `#/preset` applies.
 */

export type TfPoint = number[]; // color [HU,r,g,b] or opacity [HU,a]

export type VrPresetOption = {
  name: string;
  label: string;
  /** Optional color TF for dialog thumbnail painting. */
  colorTF?: TfPoint[];
  opacityTF?: TfPoint[];
};

/** Empty name = default grayscale W/L transfer function. */
export const VR_PRESET_DEFAULT: VrPresetOption = {
  name: '',
  label: 'Default (W/L)',
  colorTF: [
    [-1000, 0, 0, 0],
    [0, 0.35, 0.35, 0.35],
    [400, 0.85, 0.85, 0.85],
    [1000, 1, 1, 1],
  ],
  opacityTF: [
    [-1000, 0],
    [0, 0.15],
    [400, 0.85],
    [1000, 1],
  ],
};

export const VR_PRESET_OPTIONS: VrPresetOption[] = [
  {
    name: 'CT-AAA',
    label: 'CT AAA (angio)',
    colorTF: [
      [-3024, 0, 0, 0],
      [143.556, 0.6157, 0.3569, 0.1843],
      [166.222, 0.8824, 0.6039, 0.2902],
      [214.389, 1, 1, 1],
      [419.736, 1, 0.937, 0.9545],
      [3071, 0.8275, 0.6588, 1],
    ],
    opacityTF: [
      [-3024, 0],
      [143.556, 0],
      [166.222, 0.6863],
      [214.389, 0.6961],
      [419.736, 0.8333],
      [3071, 0.8039],
    ],
  },
  {
    name: 'CT-Bone',
    label: 'CT Bone',
    colorTF: [
      [-3024, 0, 0, 0],
      [-16.446, 0.7294, 0.2549, 0.302],
      [641.385, 0.9059, 0.8157, 0.5529],
      [3071, 1, 1, 1],
    ],
    opacityTF: [
      [-3024, 0],
      [-16.446, 0],
      [641.385, 0.7157],
      [3071, 0.7059],
    ],
  },
  {
    name: 'CT-Bones',
    label: 'CT Bones',
    colorTF: [
      [-1000, 0.3, 0.3, 1],
      [-488, 0.3, 1, 0.3],
      [463.28, 1, 0, 0],
      [659.15, 1, 0.9125, 0.0375],
      [953, 1, 0.3, 0.3],
    ],
    opacityTF: [
      [-1000, 0],
      [152.19, 0],
      [278.93, 0.1905],
      [952, 0.2],
    ],
  },
  {
    name: 'CT-Cardiac',
    label: 'CT Cardiac',
    colorTF: [
      [-3024, 0, 0, 0],
      [-77.688, 0.549, 0.251, 0.149],
      [94.952, 0.8824, 0.6039, 0.2902],
      [179.052, 1, 0.937, 0.9545],
      [260.439, 0.6157, 0, 0],
      [3071, 0.8275, 0.6588, 1],
    ],
    opacityTF: [
      [-3024, 0],
      [-77.688, 0],
      [94.952, 0.2857],
      [179.052, 0.5536],
      [260.439, 0.8482],
      [3071, 0.875],
    ],
  },
  {
    name: 'CT-Chest-Contrast-Enhanced',
    label: 'CT Chest (contrast)',
    colorTF: [
      [-3024, 0, 0, 0],
      [67.011, 0.549, 0.251, 0.149],
      [251.105, 0.8824, 0.6039, 0.2902],
      [439.291, 1, 0.937, 0.9545],
      [3071, 0.8275, 0.6588, 1],
    ],
    opacityTF: [
      [-3024, 0],
      [67.011, 0],
      [251.105, 0.4464],
      [439.291, 0.625],
      [3071, 0.6161],
    ],
  },
  {
    name: 'CT-Coronary-Arteries',
    label: 'CT Coronary',
    colorTF: [
      [-2048, 0, 0, 0],
      [136.47, 0, 0, 0],
      [159.215, 0.1598, 0.1598, 0.1598],
      [318.43, 0.7647, 0.7647, 0.7647],
      [478.693, 1, 1, 1],
      [3661, 1, 1, 1],
    ],
    opacityTF: [
      [-2048, 0],
      [136.47, 0],
      [159.215, 0.2589],
      [318.43, 0.5714],
      [478.693, 0.7768],
      [3661, 1],
    ],
  },
  {
    name: 'CT-Fat',
    label: 'CT Fat',
    colorTF: [
      [-1000, 0.3, 0.3, 1],
      [-497.5, 0.3, 1, 0.3],
      [-99, 0, 0, 1],
      [-76.946, 0, 1, 0],
      [-65.481, 0.8354, 0.8889, 0.0165],
      [83.89, 1, 0, 0],
      [463.28, 1, 0, 0],
      [659.15, 1, 0.9125, 0.0375],
      [2952, 1, 0.3003, 0.2999],
    ],
    opacityTF: [
      [-1000, 0],
      [-100, 0],
      [-99, 0.15],
      [-60, 0.15],
      [-59, 0],
      [101.2, 0],
      [952, 0],
    ],
  },
  {
    name: 'CT-Lung',
    label: 'CT Lung',
    colorTF: [
      [-1000, 0.3, 0.3, 1],
      [-600, 0, 0, 1],
      [-530, 0.1347, 0.7817, 0.0725],
      [-460, 0.9292, 1, 0.1095],
      [-400, 0.8889, 0.2549, 0.024],
      [2952, 1, 0.3, 0.3],
    ],
    opacityTF: [
      [-1000, 0],
      [-600, 0],
      [-599, 0.15],
      [-400, 0.15],
      [-399, 0],
      [2952, 0],
    ],
  },
  {
    name: 'CT-MIP',
    label: 'CT MIP',
    colorTF: [
      [-3024, 0, 0, 0],
      [-637.62, 1, 1, 1],
      [700, 1, 1, 1],
      [3071, 1, 1, 1],
    ],
    opacityTF: [
      [-3024, 0],
      [-637.62, 0],
      [700, 1],
      [3071, 1],
    ],
  },
  {
    name: 'CT-Muscle',
    label: 'CT Muscle',
    colorTF: [
      [-3024, 0, 0, 0],
      [-155.407, 0.549, 0.251, 0.149],
      [217.641, 0.8824, 0.6039, 0.2902],
      [419.736, 1, 0.937, 0.9545],
      [3071, 0.8275, 0.6588, 1],
    ],
    opacityTF: [
      [-3024, 0],
      [-155.407, 0],
      [217.641, 0.6765],
      [419.736, 0.8333],
      [3071, 0.8039],
    ],
  },
  {
    name: 'CT-Pulmonary-Arteries',
    label: 'CT Pulmonary',
    colorTF: [
      [-2048, 0, 0, 0],
      [-568.625, 0, 0, 0],
      [-364.081, 0.3961, 0.302, 0.1804],
      [-244.813, 0.6118, 0.3529, 0.0706],
      [18.277, 0.8431, 0.0157, 0.1569],
      [447.798, 0.7529, 0.7529, 0.7529],
      [3592.73, 1, 1, 1],
    ],
    opacityTF: [
      [-2048, 0],
      [-568.625, 0],
      [-364.081, 0.0714],
      [-244.813, 0.4018],
      [18.277, 0.6071],
      [447.798, 0.8304],
      [3592.73, 0.8393],
    ],
  },
  {
    name: 'CT-Soft-Tissue',
    label: 'CT Soft Tissue',
    colorTF: [
      [-2048, 0, 0, 0],
      [-167.01, 0, 0, 0],
      [-160, 0.0556, 0.0556, 0.0556],
      [240, 1, 1, 1],
      [3661, 1, 1, 1],
    ],
    opacityTF: [
      [-2048, 0],
      [-167.01, 0],
      [-160, 1],
      [240, 1],
      [3661, 1],
    ],
  },
];

export function vrPresetLabel(name: string | null | undefined): string {
  const key = String(name || '').trim();
  if (!key) return VR_PRESET_DEFAULT.label;
  return VR_PRESET_OPTIONS.find((p) => p.name === key)?.label || key;
}

function sampleTf(
  tf: TfPoint[],
  t: number,
  comps: number
): number[] {
  if (!tf.length) return Array(comps).fill(0);
  if (t <= tf[0][0]) return tf[0].slice(1, 1 + comps);
  const last = tf[tf.length - 1];
  if (t >= last[0]) return last.slice(1, 1 + comps);
  for (let i = 0; i < tf.length - 1; i++) {
    const a = tf[i];
    const b = tf[i + 1];
    if (t < a[0] || t > b[0]) continue;
    const u = (t - a[0]) / (b[0] - a[0] || 1);
    const out: number[] = [];
    for (let c = 0; c < comps; c++) {
      out.push(a[1 + c] + (b[1 + c] - a[1 + c]) * u);
    }
    return out;
  }
  return last.slice(1, 1 + comps);
}

/** Paint an IRA-style 110×110 thumbnail from the preset transfer functions. */
export function paintVrPresetThumbnail(
  canvas: HTMLCanvasElement,
  preset: VrPresetOption
): void {
  const size = 110;
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  const colorTF = preset.colorTF || VR_PRESET_DEFAULT.colorTF!;
  const opacityTF = preset.opacityTF || VR_PRESET_DEFAULT.opacityTF!;
  const lo = colorTF[0][0];
  const hi = colorTF[colorTF.length - 1][0];
  const img = ctx.createImageData(size, size);
  const cx = (size - 1) / 2;
  const cy = (size - 1) / 2;
  const rMax = size * 0.42;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - cx;
      const dy = y - cy;
      const r = Math.sqrt(dx * dx + dy * dy);
      const i = (y * size + x) * 4;
      if (r > rMax) {
        img.data[i] = 5;
        img.data[i + 1] = 6;
        img.data[i + 2] = 10;
        img.data[i + 3] = 255;
        continue;
      }
      const depth = 1 - r / rMax;
      const hu = lo + (hi - lo) * (0.15 + 0.75 * depth);
      const [cr, cg, cb] = sampleTf(colorTF, hu, 3);
      const [a] = sampleTf(opacityTF, hu, 1);
      const shade = 0.55 + 0.45 * Math.max(0, (dx * 0.35 - dy * 0.55) / rMax + 0.35);
      const alpha = Math.max(0.08, Math.min(1, a)) * (0.35 + 0.65 * depth);
      const bg = 0.02;
      img.data[i] = Math.round((bg * (1 - alpha) + cr * shade * alpha) * 255);
      img.data[i + 1] = Math.round((bg * (1 - alpha) + cg * shade * alpha) * 255);
      img.data[i + 2] = Math.round((bg * (1 - alpha) + cb * shade * alpha) * 255);
      img.data[i + 3] = 255;
    }
  }
  ctx.putImageData(img, 0, 0);
}
