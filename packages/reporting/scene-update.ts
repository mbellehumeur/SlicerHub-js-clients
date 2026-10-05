/**
 * Helpers for Hub scene-update (mrson ops) from the reporting client.
 */

export const IRA_SEG_NODE_ID = 'seg1';
export const IRA_VOL_NODE_ID = 'vol1';

export type SceneSegEntry = {
  id?: string;
  name?: string;
  labelValue: number;
  color?: number[];
  visible?: boolean;
  /** Per-segment opacity 0..1 (also mirrored in color[3] when present). */
  opacity?: number;
};

export type SceneDoc = {
  blobBase?: string;
  nodes?: Record<string, unknown>;
};

export function sceneDocFromContext(context: unknown): SceneDoc | null {
  if (!Array.isArray(context)) return null;
  for (const item of context) {
    if (!item || typeof item !== 'object') continue;
    const row = item as { key?: unknown; resource?: unknown };
    if (String(row.key || '').toLowerCase() !== 'scene') continue;
    const resource = row.resource;
    if (!resource || typeof resource !== 'object') return null;
    return resource as SceneDoc;
  }
  return null;
}

export function primarySegNodeId(doc: SceneDoc | null | undefined): string {
  if (!doc?.nodes || typeof doc.nodes !== 'object') return IRA_SEG_NODE_ID;
  if (doc.nodes[IRA_SEG_NODE_ID]) return IRA_SEG_NODE_ID;
  for (const [id, n] of Object.entries(doc.nodes)) {
    if (
      n &&
      typeof n === 'object' &&
      (n as { type?: string }).type === 'segmentation'
    ) {
      return id;
    }
  }
  return IRA_SEG_NODE_ID;
}

export function primaryVolNodeId(doc: SceneDoc | null | undefined): string {
  if (!doc?.nodes || typeof doc.nodes !== 'object') return IRA_VOL_NODE_ID;
  if (doc.nodes[IRA_VOL_NODE_ID]) return IRA_VOL_NODE_ID;
  for (const [id, n] of Object.entries(doc.nodes)) {
    if (
      n &&
      typeof n === 'object' &&
      (n as { type?: string }).type === 'volume'
    ) {
      return id;
    }
  }
  return IRA_VOL_NODE_ID;
}

export function visibilityFromSceneDoc(
  doc: SceneDoc | null | undefined
): {
  segmentVisible: Record<number, boolean>;
  segmentOpacity: Record<number, number>;
  labelsVisible: boolean;
  opacity: number;
  volumeOpacity: number;
  volumeShift: number;
  /** Half-span of VR shift slider (HU); matches IRA Math.max(200, (vmax-vmin)/2). */
  volumeShiftRange: number;
  volumePreset: string;
  volumeName: string;
  volumeCropEnabled: boolean;
  volumeRoiVisible: boolean;
} {
  const segmentVisible: Record<number, boolean> = {};
  const segmentOpacity: Record<number, number> = {};
  let labelsVisible = true;
  let opacity = 1;
  let volumeOpacity = 1;
  let volumeShift = 0;
  let volumeShiftRange = 500;
  let volumePreset = '';
  let volumeName = '';
  let volumeCropEnabled = false;
  let volumeRoiVisible = false;
  const id = primarySegNodeId(doc);
  const node = doc?.nodes?.[id] as
    | {
        labelsVisible?: boolean;
        opacity?: number;
        segments?: SceneSegEntry[];
      }
    | undefined;
  if (node) {
    if (typeof node.labelsVisible === 'boolean') {
      labelsVisible = node.labelsVisible;
    }
    const o = Number(node.opacity);
    if (Number.isFinite(o)) opacity = Math.max(0, Math.min(1, o));
    for (const s of node.segments || []) {
      const lv = Number(s.labelValue);
      if (!Number.isFinite(lv)) continue;
      segmentVisible[lv] = s.visible !== false;
      const fromField = Number(s.opacity);
      const fromColor = Number(s.color?.[3]);
      const so = Number.isFinite(fromField)
        ? fromField
        : Number.isFinite(fromColor)
          ? fromColor
          : 1;
      segmentOpacity[lv] = Math.max(0, Math.min(1, so));
    }
  }
  const volId = primaryVolNodeId(doc);
  const volNode = doc?.nodes?.[volId] as
    | {
        opacity?: number;
        shift?: number;
        shiftRange?: number;
        preset?: unknown;
        name?: unknown;
        cropEnabled?: unknown;
        roiVisible?: unknown;
      }
    | undefined;
  const vo = Number(volNode?.opacity);
  if (Number.isFinite(vo)) volumeOpacity = Math.max(0, Math.min(1, vo));
  const vs = Number(volNode?.shift);
  if (Number.isFinite(vs)) volumeShift = vs;
  const vr = Number(volNode?.shiftRange);
  if (Number.isFinite(vr) && vr > 0) {
    volumeShiftRange = Math.max(vr, Math.abs(volumeShift), 200);
  } else {
    volumeShiftRange = Math.max(500, Math.abs(volumeShift), 200);
  }
  volumePreset = String(volNode?.preset ?? '').trim();
  volumeName = String(volNode?.name ?? '').trim();
  if (typeof volNode?.cropEnabled === 'boolean') {
    volumeCropEnabled = volNode.cropEnabled;
  }
  if (typeof volNode?.roiVisible === 'boolean') {
    volumeRoiVisible = volNode.roiVisible;
  }
  return {
    segmentVisible,
    segmentOpacity,
    labelsVisible,
    opacity,
    volumeOpacity,
    volumeShift,
    volumeShiftRange,
    volumePreset,
    volumeName,
    volumeCropEnabled,
    volumeRoiVisible,
  };
}

export function buildSegmentPatchOps(opts: {
  segId: string;
  segments?: SceneSegEntry[];
  labelsVisible?: boolean;
  opacity?: number;
}): Array<Record<string, unknown>> {
  const ops: Array<Record<string, unknown>> = [];
  if (opts.segments) {
    ops.push({
      op: 'patch',
      id: opts.segId,
      path: '#/segments',
      value: opts.segments,
    });
  }
  if (typeof opts.labelsVisible === 'boolean') {
    ops.push({
      op: 'patch',
      id: opts.segId,
      path: '#/labelsVisible',
      value: opts.labelsVisible,
    });
  }
  if (typeof opts.opacity === 'number' && Number.isFinite(opts.opacity)) {
    ops.push({
      op: 'patch',
      id: opts.segId,
      path: '#/opacity',
      value: Math.max(0, Math.min(1, opts.opacity)),
    });
  }
  return ops;
}

export function buildVolumeOpacityPatchOps(opts: {
  volId: string;
  opacity: number;
}): Array<Record<string, unknown>> {
  if (!Number.isFinite(opts.opacity)) return [];
  return [
    {
      op: 'patch',
      id: opts.volId,
      path: '#/opacity',
      value: Math.max(0, Math.min(1, opts.opacity)),
    },
  ];
}

export function buildVolumeShiftPatchOps(opts: {
  volId: string;
  shift: number;
}): Array<Record<string, unknown>> {
  if (!Number.isFinite(opts.shift)) return [];
  return [
    {
      op: 'patch',
      id: opts.volId,
      path: '#/shift',
      value: opts.shift,
    },
  ];
}

export function buildVolumePresetPatchOps(opts: {
  volId: string;
  preset: string;
}): Array<Record<string, unknown>> {
  return [
    {
      op: 'patch',
      id: opts.volId,
      path: '#/preset',
      value: String(opts.preset || ''),
    },
  ];
}

export function buildVolumeCropPatchOps(opts: {
  volId: string;
  cropEnabled: boolean;
}): Array<Record<string, unknown>> {
  return [
    {
      op: 'patch',
      id: opts.volId,
      path: '#/cropEnabled',
      value: Boolean(opts.cropEnabled),
    },
  ];
}

export function buildRoiVisiblePatchOps(opts: {
  volId: string;
  roiVisible: boolean;
}): Array<Record<string, unknown>> {
  return [
    {
      op: 'patch',
      id: opts.volId,
      path: '#/roiVisible',
      value: Boolean(opts.roiVisible),
    },
  ];
}
