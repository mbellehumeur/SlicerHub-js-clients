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

/** IRA LiveScene camera node id (matches ira-live-scene-bridge). */
export const IRA_CAM_NODE_ID = 'cam1';

export type CameraPose = {
  position: [number, number, number];
  focalPoint: [number, number, number];
  viewUp: [number, number, number];
  viewAngle: number;
};

function asVec3(v: unknown): [number, number, number] | null {
  if (!Array.isArray(v) || v.length < 3) return null;
  const a = Number(v[0]);
  const b = Number(v[1]);
  const c = Number(v[2]);
  if (![a, b, c].every(Number.isFinite)) return null;
  return [a, b, c];
}

/** Volume RAS center from ijkToRAS translation, else existing camera focalPoint. */
export function volumeCenterFromSceneDoc(
  doc: SceneDoc | null | undefined
): [number, number, number] {
  const volId = primaryVolNodeId(doc);
  const vol = doc?.nodes?.[volId] as { ijkToRAS?: unknown } | undefined;
  const m = vol?.ijkToRAS;
  if (Array.isArray(m) && m.length >= 16) {
    const x = Number(m[3]);
    const y = Number(m[7]);
    const z = Number(m[11]);
    if ([x, y, z].every(Number.isFinite)) return [x, y, z];
  }
  const cam = doc?.nodes?.[IRA_CAM_NODE_ID] as
    | { focalPoint?: unknown }
    | undefined;
  const fp = asVec3(cam?.focalPoint);
  if (fp) return fp;
  return [0, 0, 0];
}

/** Distance from existing camera to focal point, or a default orbit radius. */
export function cameraDistanceFromSceneDoc(
  doc: SceneDoc | null | undefined,
  center: [number, number, number]
): number {
  const cam = doc?.nodes?.[IRA_CAM_NODE_ID] as
    | { position?: unknown; focalPoint?: unknown }
    | undefined;
  const pos = asVec3(cam?.position);
  const fp = asVec3(cam?.focalPoint) || center;
  if (pos) {
    const dx = pos[0] - fp[0];
    const dy = pos[1] - fp[1];
    const dz = pos[2] - fp[2];
    const d = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (Number.isFinite(d) && d > 10) return d;
  }
  return 400;
}

/**
 * Camera put ops that illustrate an anatomical plane in IRA 3D.
 * termId: sagittal | frontal | transverse — look-along the plane normal (RAS).
 */
export function buildDirectionalTermCameraOps(opts: {
  doc: SceneDoc | null | undefined;
  termId: string;
}): Array<Record<string, unknown>> {
  const center = volumeCenterFromSceneDoc(opts.doc);
  const dist = cameraDistanceFromSceneDoc(opts.doc, center);
  const prev = opts.doc?.nodes?.[IRA_CAM_NODE_ID] as
    | { viewAngle?: unknown; name?: unknown }
    | undefined;
  const viewAngle = Number(prev?.viewAngle);
  const angle = Number.isFinite(viewAngle) && viewAngle > 0 ? viewAngle : 30;

  let position: [number, number, number];
  let viewUp: [number, number, number];
  switch (opts.termId) {
    case 'sagittal':
      // Look from patient left (+R); superior up — viewing the sagittal cut.
      position = [center[0] + dist, center[1], center[2]];
      viewUp = [0, 0, 1];
      break;
    case 'frontal':
      // Look from anterior (−A); superior up — viewing the coronal cut.
      position = [center[0], center[1] - dist, center[2]];
      viewUp = [0, 0, 1];
      break;
    case 'transverse':
      // Look from superior (+S); anterior up — axial / cross-section view.
      position = [center[0], center[1], center[2] + dist];
      viewUp = [0, 1, 0];
      break;
    default:
      position = [center[0], center[1] - dist, center[2]];
      viewUp = [0, 0, 1];
  }

  const node = {
    type: 'camera',
    id: IRA_CAM_NODE_ID,
    name: String(prev?.name || 'Camera'),
    position,
    focalPoint: center,
    viewUp,
    viewAngle: angle,
  };

  return [{ op: 'put', id: IRA_CAM_NODE_ID, node }];
}
