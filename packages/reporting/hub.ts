import HubClient, {
  cloneContextArray,
  extractDicomSeriesUid,
  extractDicomStudyUid,
  extractDicomwebRoot,
  extractImagingStudyFiles,
  extractOpenMode,
  extractVolviewSampleId,
  generateSubscriberName,
  getHubEventLower,
  isRequestEvent,
  isRunningInCloud,
  messageActor,
  messageEventContext,
  messageProductName,
  messageSubscriberName,
  matchesHubProduct,
  normalizeImagingStudyContext,
  parseCollatedRequestResult,
  requestCastStatus,
  requestEventFor,
  resolveHubConferenceView,
  resolveHubFileMessage,
  resolveHubAdminUrl,
  selectFirstMatchingHubKey,
  batchContextFiles,
  showHubInfoToast,
  type CastConferenceView,
} from '@slicer-hub/client';
import {
  SKIP_STUDY_RELOAD_TOAST,
  sameOpenImagingStudyContext,
} from '@slicer-hub/context-identity';
import {
  clearStoredUserName,
  fetchHubStartedAt,
  getHubDefinitions,
  getStoredUserHubOrigin,
  getStoredUserHubStartedAt,
  getStoredUserName,
  HubKey,
  hubOriginFromEndpoint,
  LOG_PREFIX,
  PRODUCT_NAME,
  REPORTING_ACTOR,
  setStoredUserName,
  SUBSCRIBE_EVENTS,
} from './config';
import { reportingChromeFor } from '@slicer-hub/i18n';
import {
  EMPTY_SEG_CATALOG,
  findCatalogSegment,
  firstCatalogSegment,
  segCatalogFromContext,
  type ReportMeasurement,
  type SegCatalog,
} from './seg-catalog';
import {
  buildSegmentPatchOps,
  buildRoiVisiblePatchOps,
  buildVolumeCropPatchOps,
  buildVolumeOpacityPatchOps,
  buildVolumePresetPatchOps,
  buildVolumeShiftPatchOps,
  primarySegNodeId,
  primaryVolNodeId,
  sceneDocFromContext,
  visibilityFromSceneDoc,
  type SceneDoc,
  type SceneSegEntry,
} from './scene-update';
import { parseTid1500FromBuffer } from './tid1500';

export type ConnectionUiState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

export type StudyInfo = {
  sampleId: string;
  openMode: string;
  studyUid: string;
  seriesUid: string;
  dicomwebRoot: string;
  fileCount: number;
  fileNames: string[];
};

export type AppState = {
  client: ReturnType<typeof HubClient.newInstance> | null;
  hubKey: HubKey;
  topic: string;
  subscriberName: string;
  userName: string;
  hubStartedAt: string;
  lastAuthCode: string;
  connection: ConnectionUiState;
  connectionDetail: string;
  openStudy: StudyInfo | null;
  /** Last ImagingStudy-open context (for STATUS replies). */
  lastImagingStudyOpenContext: unknown[];
  /** SEG catalog last loaded from Image Display STATUS. */
  segCatalog: SegCatalog;
  /** Measurement rows (manual + / imported TID1500; in-memory only). */
  measurements: ReportMeasurement[];
  /** Last Load-from-ID status detail for the UI. */
  segLoadDetail: string;
  selectedMeasurementId: string | null;
  /** Selected catalog segment number (for header +). */
  selectedSegmentNumber: number | null;
  /** Selected SEG SOP for selectedSegmentNumber disambiguation. */
  selectedSegmentSopUid: string;
  /** LiveScene doc from Image Display STATUS (for scene-update targeting). */
  sceneDoc: SceneDoc | null;
  /** Optimistic per-segment visibility (labelValue / catalog number). */
  segmentVisible: Record<number, boolean>;
  /** Optimistic per-segment opacity 0..1. */
  segmentOpacity: Record<number, number>;
  /** Optimistic 3D segment label cards visibility. */
  labelsVisible: boolean;
  /** Global segmentation opacity 0..1 (SlicerLive-style chip). */
  segOpacity: number;
  /** Volume-render opacity 0..1 (SlicerLive-style chip). */
  volumeOpacity: number;
  /** VR transfer-function shift (HU). */
  volumeShift: number;
  /** Half-span of VR shift slider (HU); from LiveScene volume.shiftRange. */
  volumeShiftRange: number;
  /** Active VR preset id (Slicer CT-* name), or '' for default W/L. */
  volumePreset: string;
  /** Primary volume node name from LiveScene STATUS. */
  volumeName: string;
  /** Volume-render crop enabled (IRA setRoiEnabled). */
  volumeCropEnabled: boolean;
  /** Crop ROI box visibility (IRA setRoiVisible). */
  volumeRoiVisible: boolean;
  /** Viewport PNG snapshots captured via PNGFULLSIZE from ID/IRA. */
  snapshots: ReportSnapshot[];
  /** Active Hub conference roster (LiveScene-aligned places view). */
  conference: CastConferenceView | null;
  /** When true, apply inbound ImagingStudy-open from conference host. */
  conferenceFollowHost: boolean;
  /**
   * Explicit follow preference while attending (null = use role default).
   * Stop/Resume persist here so roster refresh does not reset the choice.
   */
  conferenceFollowChoice: boolean | null;
  /** True when a general STATUS probe found a WORKLIST_CLIENT responder. */
  worklistOnline: boolean;
  /** True when a general STATUS probe found SlicerLive/IRA (SLICERLIVE-IRA). */
  iraOnline: boolean;
  /** Peers from STATUS / cleared on subscription-removed; keyed by subscriber.name. */
  connectedApps: Map<string, ConnectedAppInfo>;
  /** Open a second reporting tab that authenticates as a new hub user. */
  freshUser: boolean;
};

export type ConnectedAppInfo = {
  productName: string;
  actor: string;
};

export type ReportSnapshotStatus = 'pending' | 'ready' | 'error';

export type ReportSnapshot = {
  id: string;
  filename: string;
  createdAt: string;
  status: ReportSnapshotStatus;
  detail?: string;
  contentType?: string;
  /** Full-resolution PNG from Image Display (base64). */
  dataBase64?: string;
  /** Client-scaled thumbnail for the table (base64). */
  thumbBase64?: string;
  width?: number;
  height?: number;
};

type StatusListener = (state: AppState) => void;
type StudyListener = (state: AppState) => void;

let onStatusChange: StatusListener | null = null;
let onStudyChange: StudyListener | null = null;

export function createInitialState(): AppState {
  const hubs = getHubDefinitions();
  const pageInCloud = isRunningInCloud();
  const hubKey =
    (selectFirstMatchingHubKey(
      hubs,
      ['local', 'cloud'],
      pageInCloud
    ) as HubKey) || (pageInCloud ? 'cloud' : 'local');

  const params = new URLSearchParams(window.location.search);
  const hubOverride = params.get('hub');
  let resolvedKey = hubKey;
  if (hubOverride === 'local' || hubOverride === 'cloud') {
    resolvedKey = hubOverride;
  }
  const freshUser = params.get('freshUser') === '1';

  return {
    client: null,
    hubKey: resolvedKey,
    topic: params.get('topic') || '',
    subscriberName: generateSubscriberName(PRODUCT_NAME),
    userName: freshUser ? '' : getStoredUserName(),
    hubStartedAt: '',
    lastAuthCode: '',
    connection: 'idle',
    connectionDetail: 'Not connected',
    openStudy: null,
    lastImagingStudyOpenContext: [],
    segCatalog: EMPTY_SEG_CATALOG,
    measurements: [],
    segLoadDetail: '',
    selectedMeasurementId: null,
    selectedSegmentNumber: null,
    selectedSegmentSopUid: '',
    sceneDoc: null,
    segmentVisible: {},
    segmentOpacity: {},
    labelsVisible: true,
    segOpacity: 1,
    volumeOpacity: 1,
    volumeShift: 0,
    volumeShiftRange: 500,
    volumePreset: '',
    volumeName: '',
    volumeCropEnabled: false,
    volumeRoiVisible: false,
    snapshots: [],
    conference: null,
    conferenceFollowHost: false,
    conferenceFollowChoice: null,
    worklistOnline: false,
    iraOnline: false,
    connectedApps: new Map(),
    freshUser,
  };
}

export function setStatusListener(fn: StatusListener): void {
  onStatusChange = fn;
}

export function setStudyListener(fn: StudyListener): void {
  onStudyChange = fn;
}

export function setConferenceView(
  state: AppState,
  view: CastConferenceView | null
): void {
  state.conference = view;
  if (!view) {
    state.conferenceFollowHost = false;
    state.conferenceFollowChoice = null;
  } else if (view.selfRole === 'leading') {
    // Host leads; do not treat leading session as following.
    state.conferenceFollowHost = false;
    state.conferenceFollowChoice = null;
  } else if (view.selfRole === 'following') {
    // Default follow when listed as attendee unless user opted out / in via invite.
    if (state.conferenceFollowChoice === null) {
      state.conferenceFollowChoice = true;
      state.conferenceFollowHost = true;
    } else {
      state.conferenceFollowHost = state.conferenceFollowChoice;
    }
  }
  notifyStatus(state);
}

export function setConferenceFollowHost(
  state: AppState,
  followHost: boolean
): void {
  state.conferenceFollowChoice = Boolean(followHost);
  if (state.conference?.selfRole === 'leading') {
    state.conferenceFollowHost = false;
    notifyStatus(state);
    return;
  }
  state.conferenceFollowHost = state.conferenceFollowChoice;
  notifyStatus(state);
}

type ConferenceHubHandler = (message: Record<string, unknown>) => boolean;
let conferenceHubHandler: ConferenceHubHandler | null = null;

/** Prefer invite controller for conference-start/end when mounted. */
export function setConferenceHubHandler(
  fn: ConferenceHubHandler | null
): void {
  conferenceHubHandler = fn;
}

async function syncConferenceView(state: AppState): Promise<void> {
  if (state.connection !== 'connected') {
    setConferenceView(state, null);
    return;
  }
  try {
    const view = await resolveHubConferenceView(
      hubEndpoint(state),
      state.topic,
      state.subscriberName,
      state.userName
    );
    setConferenceView(state, view);
  } catch {
    /* keep prior view */
  }
}

function handleConferenceHubEvent(
  state: AppState,
  message: Record<string, unknown>
): boolean {
  if (conferenceHubHandler?.(message)) {
    return true;
  }
  const event = message?.event as
    | {
        'hub.event'?: string;
        context?: Record<string, unknown>;
      }
    | undefined;
  const hubEvent = getHubEventLower(event);
  if (hubEvent === 'conference-start') {
    void syncConferenceView(state);
    return true;
  }
  if (hubEvent === 'conference-end') {
    const context =
      event?.context && typeof event.context === 'object' ? event.context : {};
    const leaveTopic = String(context.leaveTopic ?? '').trim();
    if (!leaveTopic || leaveTopic === state.topic) {
      setConferenceView(state, null);
    } else {
      void syncConferenceView(state);
    }
    return true;
  }
  return false;
}

function notifyStatus(state: AppState): void {
  onStatusChange?.(state);
}

function notifyStudy(state: AppState): void {
  onStudyChange?.(state);
}

function fileBytes(entry: Record<string, unknown>): Uint8Array | null {
  const data = entry.data;
  if (data instanceof ArrayBuffer) return new Uint8Array(data);
  if (data instanceof Uint8Array) return data;
  return null;
}

/** Refresh manual Volume values from STATUS; keep SR; drop orphan manuals. */
function applyCatalogMeasurements(state: AppState): void {
  const next: ReportMeasurement[] = [];
  for (const m of state.measurements) {
    if (m.source === 'sr') {
      next.push(m);
      continue;
    }
    if (m.source !== 'manual') continue;
    if (m.segmentNumber == null) {
      next.push(m);
      continue;
    }
    const match = findCatalogSegment(
      state.segCatalog,
      m.segmentNumber,
      m.segmentationSOPInstanceUID || undefined
    );
    if (!match) continue;
    const label = String(match.segment.label || `Segment ${match.segment.number}`);
    if (/^volume$/i.test(m.quantity)) {
      next.push({
        ...m,
        segmentLabel: label,
        trackingIdentifier: label,
        value: Number.isFinite(match.segment.volumeMm3)
          ? match.segment.volumeMm3
          : m.value,
        units: 'mm3',
        segmentationSOPInstanceUID: String(
          match.instance.sopInstanceUID || m.segmentationSOPInstanceUID
        ),
      });
    } else {
      next.push({
        ...m,
        segmentLabel: label,
        trackingIdentifier: label,
        segmentationSOPInstanceUID: String(
          match.instance.sopInstanceUID || m.segmentationSOPInstanceUID
        ),
      });
    }
  }
  state.measurements = next;
  if (
    state.selectedMeasurementId &&
    !next.some((m) => m.id === state.selectedMeasurementId)
  ) {
    state.selectedMeasurementId = null;
  }
}

const WORKLIST_ACTOR = 'WORKLIST_CLIENT';
const IMAGE_DISPLAY_ACTOR = 'ID';

async function requestStatus(
  state: AppState,
  targetActor: string = '*'
): Promise<unknown[]> {
  const subscriber =
    state.subscriberName ||
    state.client?.getSessionConfig?.()?.subscriberName?.trim() ||
    '';
  if (!state.client || !subscriber) return [];
  const result = await requestCastStatus(state.client, {
    subscriberName: subscriber,
    subscriberProductName: PRODUCT_NAME,
    subscriberActor: REPORTING_ACTOR,
    topic: state.topic || undefined,
    targetActor,
  });
  const { responses } = parseCollatedRequestResult(
    (result as { data?: unknown })?.data ?? result
  );
  return responses;
}

type StatusParse = {
  foundIdResponder: boolean;
  foundWorklistResponder: boolean;
  foundIraResponder: boolean;
  catalog: SegCatalog | null;
  /** ImagingStudy from Image Display (ID), if any. */
  idImagingContext: unknown[] | null;
  /** ImagingStudy from worklist, if any. */
  worklistImagingContext: unknown[] | null;
  sceneDoc: SceneDoc | null;
  /** Peer subscriber.name from the ID STATUS response row. */
  idResponderSubscriber: string;
};

function statusRowActor(row: Record<string, unknown>): string {
  return String(row.actor ?? '').trim().toUpperCase();
}

function statusRowProduct(row: Record<string, unknown>): string {
  const fromEnvelope = String(row.productName ?? '').trim();
  if (fromEnvelope) return fromEnvelope;
  const data = row.data;
  if (data && typeof data === 'object') {
    return String(
      (data as { product?: unknown }).product ?? ''
    ).trim();
  }
  return '';
}

function isWorklistStatusRow(row: Record<string, unknown>): boolean {
  if (statusRowActor(row) === WORKLIST_ACTOR) return true;
  const product = statusRowProduct(row).toUpperCase();
  return (
    product === 'WKLST' ||
    product.startsWith('WKLST-') ||
    product === 'CAST-WKLST' ||
    product.startsWith('CAST-WKLST')
  );
}

function isReportingStatusRow(row: Record<string, unknown>): boolean {
  const actor = statusRowActor(row);
  if (actor === REPORTING_ACTOR || actor === 'REPORTING_CLIENT') return true;
  const product = statusRowProduct(row).toUpperCase();
  return (
    product === 'RPT' ||
    product.startsWith('RPT-') ||
    product === 'CAST-RPT' ||
    product.startsWith('CAST-RPT')
  );
}

function isIdStatusRow(row: Record<string, unknown>): boolean {
  if (statusRowActor(row) === IMAGE_DISPLAY_ACTOR) return true;
  // IRA publishes as actor ID with product SLICERLIVE-IRA.
  return matchesHubProduct(statusRowProduct(row), 'ira');
}

function isIraStatusRow(row: Record<string, unknown>): boolean {
  return matchesHubProduct(statusRowProduct(row), 'ira');
}

function isIraPeer(
  productName: string,
  actor: string,
  subscriber = ''
): boolean {
  if (matchesHubProduct(productName, 'ira')) return true;
  const sub = String(subscriber || '').trim().toUpperCase();
  // generateSubscriberName('IRA') → IRA-XXXXXX
  if (sub.startsWith('IRA-') || sub.startsWith('SLICERLIVE-IRA')) return true;
  const actorKey = String(actor || '').trim().toUpperCase();
  const product = String(productName || '').trim().toUpperCase();
  // Actor ID alone is ambiguous (desktop Slicer vs IRA); only if product hints IRA.
  if (actorKey === IMAGE_DISPLAY_ACTOR && product.includes('IRA')) return true;
  return false;
}

function isWorklistPeer(productName: string, actor: string): boolean {
  const actorKey = String(actor || '').trim().toUpperCase();
  if (actorKey === WORKLIST_ACTOR) return true;
  const product = String(productName || '').trim().toUpperCase();
  return (
    product === 'WKLST' ||
    product.startsWith('WKLST-') ||
    product === 'CAST-WKLST' ||
    product.startsWith('CAST-WKLST')
  );
}

function syncPresenceFlags(state: AppState): void {
  let iraOnline = false;
  let worklistOnline = false;
  for (const [subscriber, info] of state.connectedApps) {
    if (isIraPeer(info.productName, info.actor, subscriber)) iraOnline = true;
    if (isWorklistPeer(info.productName, info.actor)) worklistOnline = true;
  }
  state.iraOnline = iraOnline;
  state.worklistOnline = worklistOnline;
}

/** Record inbound STATUS requesters that should light viewer presence buttons. */
function markConnectedAppFromMessage(
  state: AppState,
  message: Record<string, unknown>
): void {
  const subscriber = messageSubscriberName(message);
  if (!subscriber) return;
  const productName = messageProductName(message);
  const actor = messageActor(message);
  if (
    !isIraPeer(productName, actor, subscriber) &&
    !isWorklistPeer(productName, actor)
  ) {
    return;
  }
  upsertConnectedApp(state, { subscriber, productName, actor });
}

function upsertConnectedApp(
  state: AppState,
  info: { subscriber: string; productName: string; actor: string }
): void {
  const subscriber = String(info.subscriber || '').trim();
  if (!subscriber) return;
  const productName = String(info.productName || '').trim();
  const actor = String(info.actor || '').trim();

  const productKey = productName.toUpperCase();
  if (productKey) {
    for (const [name, existing] of state.connectedApps) {
      if (
        name !== subscriber &&
        existing.productName.trim().toUpperCase() === productKey
      ) {
        state.connectedApps.delete(name);
      }
    }
  }

  state.connectedApps.set(subscriber, { productName, actor });
  syncPresenceFlags(state);
}

function applyConnectedAppsFromStatusResponses(
  state: AppState,
  responses: unknown[]
): void {
  for (const item of responses) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const subscriber = String(row.subscriber ?? '').trim();
    if (!subscriber) continue;
    const productName = statusRowProduct(row);
    const actor = statusRowActor(row);
    // Keep IRA / worklist peers from outbound probe (same products worklist lights).
    if (
      !isIraPeer(productName, actor, subscriber) &&
      !isWorklistPeer(productName, actor)
    ) {
      continue;
    }
    upsertConnectedApp(state, { subscriber, productName, actor });
  }
  syncPresenceFlags(state);
}

function clearConnectedApps(state: AppState): void {
  if (state.connectedApps.size === 0) {
    state.worklistOnline = false;
    state.iraOnline = false;
    return;
  }
  state.connectedApps.clear();
  state.worklistOnline = false;
  state.iraOnline = false;
}

function handleSubscriptionRemoved(
  state: AppState,
  message: Record<string, unknown>
): boolean {
  const event = message?.event as { 'hub.event'?: string } | undefined;
  if (!event || getHubEventLower(event) !== 'subscription-removed') {
    return false;
  }
  const subscriber = messageSubscriberName(message);
  if (!subscriber || !state.connectedApps.has(subscriber)) return false;
  state.connectedApps.delete(subscriber);
  syncPresenceFlags(state);
  notifyStatus(state);
  return true;
}

function parseStatusResponses(responses: unknown[]): StatusParse {
  let foundIdResponder = false;
  let foundWorklistResponder = false;
  let foundIraResponder = false;
  let catalog: SegCatalog | null = null;
  let idImagingContext: unknown[] | null = null;
  let worklistImagingContext: unknown[] | null = null;
  let sceneDoc: SceneDoc | null = null;
  let idResponderSubscriber = '';

  for (const item of responses) {
    if (!item || typeof item !== 'object') continue;
    const row = item as Record<string, unknown>;
    const data = row.data;
    if (!data || typeof data !== 'object') continue;

    const fromWorklist = isWorklistStatusRow(row);
    const fromIra = isIraStatusRow(row);
    const fromId = isIdStatusRow(row);
    const fromReporting = isReportingStatusRow(row);

    if (fromIra) foundIraResponder = true;

    if (fromWorklist) {
      foundWorklistResponder = true;
      const payload = data as {
        'context.type'?: string;
        context?: unknown;
      };
      const ctx = payload.context;
      if (
        payload['context.type'] === 'ImagingStudy' &&
        Array.isArray(ctx) &&
        ctx.length > 0 &&
        !worklistImagingContext
      ) {
        worklistImagingContext = cloneContextArray(ctx);
      }
      continue;
    }

    // Ignore peer reporting clients for ID catalog / study adoption.
    if (fromReporting) continue;

    if (fromId) {
      foundIdResponder = true;
      if (!idResponderSubscriber) {
        idResponderSubscriber = String(
          row.subscriber ?? row['subscriber.name'] ?? ''
        ).trim();
      }
    }

    const payload = data as {
      'context.type'?: string;
      context?: unknown;
    };
    const ctx = payload.context;
    const imaging =
      payload['context.type'] === 'ImagingStudy' &&
      Array.isArray(ctx) &&
      ctx.length > 0
        ? cloneContextArray(ctx)
        : null;

    const parsedCat = segCatalogFromContext(ctx);
    if (parsedCat && !catalog) {
      catalog = parsedCat;
      foundIdResponder = true;
    }
    const scene = sceneDocFromContext(ctx);
    if (scene && !sceneDoc) {
      sceneDoc = scene;
      foundIdResponder = true;
    }
    if (imaging && fromId && !idImagingContext) {
      idImagingContext = imaging;
    }
  }

  return {
    foundIdResponder,
    foundWorklistResponder,
    foundIraResponder,
    catalog,
    idImagingContext,
    worklistImagingContext,
    sceneDoc,
    idResponderSubscriber,
  };
}

function withResponderName(base: string, subscriber: string): string {
  const name = String(subscriber || '').trim();
  return name ? `${base} ${name}` : base;
}

function adoptSceneVisibility(state: AppState, sceneDoc: SceneDoc | null): void {
  state.sceneDoc = sceneDoc;
  if (!sceneDoc) {
    const next: Record<number, boolean> = {};
    for (const inst of state.segCatalog.segmentations) {
      for (const seg of inst.segments || []) {
        const n = Number(seg.number);
        if (Number.isFinite(n)) next[n] = true;
      }
    }
    state.segmentVisible = next;
    state.labelsVisible = true;
    state.segOpacity = 1;
    state.segmentOpacity = {};
    state.volumeOpacity = 1;
    state.volumeShift = 0;
    state.volumeShiftRange = 500;
    state.volumePreset = '';
    state.volumeName = '';
    state.volumeCropEnabled = false;
    state.volumeRoiVisible = false;
    return;
  }
  const vis = visibilityFromSceneDoc(sceneDoc);
  state.labelsVisible = vis.labelsVisible;
  state.segOpacity = vis.opacity;
  state.volumeOpacity = vis.volumeOpacity;
  state.volumeShift = vis.volumeShift;
  state.volumeShiftRange = vis.volumeShiftRange;
  state.volumePreset = vis.volumePreset;
  state.volumeName = vis.volumeName;
  state.volumeCropEnabled = vis.volumeCropEnabled;
  state.volumeRoiVisible = vis.volumeRoiVisible;
  const next: Record<number, boolean> = { ...vis.segmentVisible };
  const nextOp: Record<number, number> = { ...vis.segmentOpacity };
  for (const inst of state.segCatalog.segmentations) {
    for (const seg of inst.segments || []) {
      const n = Number(seg.number);
      if (!Number.isFinite(n)) continue;
      if (!(n in next)) next[n] = true;
      if (!(n in nextOp)) nextOp[n] = 1;
    }
  }
  state.segmentVisible = next;
  state.segmentOpacity = nextOp;
}

function catalogSegmentsAsSceneEntries(state: AppState): SceneSegEntry[] {
  const out: SceneSegEntry[] = [];
  for (const inst of state.segCatalog.segmentations) {
    for (const seg of inst.segments || []) {
      const n = Number(seg.number);
      if (!Number.isFinite(n)) continue;
      const op = Math.max(
        0,
        Math.min(1, Number(state.segmentOpacity[n] ?? 1))
      );
      out.push({
        id: `Segment_${n}`,
        name: String(seg.label || `Segment ${n}`),
        labelValue: n,
        color: [
          seg.color?.[0] ?? 1,
          seg.color?.[1] ?? 1,
          seg.color?.[2] ?? 1,
          op,
        ],
        opacity: op,
        visible: state.segmentVisible[n] !== false,
      });
    }
  }
  return out;
}

/** Publish Hub scene-update ops to Image Display (actor ID). */
export async function publishSceneUpdate(
  state: AppState,
  opts: {
    segmentVisible?: Record<number, boolean>;
    segmentOpacity?: Record<number, number>;
    labelsVisible?: boolean;
    opacity?: number;
    /** When true, only publish opacity (no segments / labelsVisible rewrite). */
    opacityOnly?: boolean;
  } = {}
): Promise<boolean> {
  if (!state.client || state.connection !== 'connected') {
    console.warn(`${LOG_PREFIX} scene-update: not connected`);
    return false;
  }
  if (opts.segmentVisible) {
    state.segmentVisible = { ...state.segmentVisible, ...opts.segmentVisible };
  }
  if (opts.segmentOpacity) {
    const next = { ...state.segmentOpacity };
    for (const [k, v] of Object.entries(opts.segmentOpacity)) {
      const n = Number(k);
      const o = Number(v);
      if (!Number.isFinite(n) || !Number.isFinite(o)) continue;
      next[n] = Math.max(0, Math.min(1, o));
    }
    state.segmentOpacity = next;
  }
  if (typeof opts.labelsVisible === 'boolean') {
    state.labelsVisible = opts.labelsVisible;
  }
  if (typeof opts.opacity === 'number' && Number.isFinite(opts.opacity)) {
    state.segOpacity = Math.max(0, Math.min(1, opts.opacity));
  }

  const segId = primarySegNodeId(state.sceneDoc);
  if (!opts.opacityOnly) {
    const segments = catalogSegmentsAsSceneEntries(state);
    if (!segments.length) {
      console.warn(`${LOG_PREFIX} scene-update: no segments`);
      return false;
    }
  }
  const ops = opts.opacityOnly
    ? buildSegmentPatchOps({
        segId,
        opacity: state.segOpacity,
      })
    : buildSegmentPatchOps({
        segId,
        segments: catalogSegmentsAsSceneEntries(state),
        labelsVisible: state.labelsVisible,
        opacity: state.segOpacity,
      });
  if (!ops.length) return false;

  try {
    const res = await state.client.publish({
      event: {
        'hub.topic': state.topic,
        'hub.event': 'scene-update',
        context: [{ key: 'scene', resource: { ops } }],
      },
      actor: REPORTING_ACTOR,
      'target.actor': 'ID',
      'target.product.name': '*',
    });
    const ok = Boolean(res && res.ok);
    if (!ok) {
      console.warn(
        `${LOG_PREFIX} scene-update failed`,
        res ? `HTTP ${res.status}` : 'No response'
      );
    }
    return ok;
  } catch (err) {
    console.error(`${LOG_PREFIX} scene-update exception`, err);
    return false;
  }
}

export async function toggleSegmentVisibility(
  state: AppState,
  segmentNumber: number
): Promise<void> {
  const n = Number(segmentNumber);
  if (!Number.isFinite(n)) return;
  const next = state.segmentVisible[n] === false;
  await publishSceneUpdate(state, {
    segmentVisible: { [n]: next },
  });
  notifyStudy(state);
}

let segmentOpacityPublishRaf = 0;
let segmentOpacityPublishPending: Record<number, number> | null = null;

/** Set one segment's opacity and publish scene-update (segments rewrite). Does not re-render. */
export function setSegmentOpacity(
  state: AppState,
  segmentNumber: number,
  opacity: number
): void {
  const n = Number(segmentNumber);
  const o = Math.max(0, Math.min(1, Number(opacity)));
  if (!Number.isFinite(n) || !Number.isFinite(o)) return;
  state.segmentOpacity = { ...state.segmentOpacity, [n]: o };
  segmentOpacityPublishPending = {
    ...(segmentOpacityPublishPending || {}),
    [n]: o,
  };
  if (segmentOpacityPublishRaf) return;
  segmentOpacityPublishRaf = requestAnimationFrame(() => {
    segmentOpacityPublishRaf = 0;
    const pending = segmentOpacityPublishPending;
    segmentOpacityPublishPending = null;
    if (!pending) return;
    void publishSceneUpdate(state, { segmentOpacity: pending }).then(() => {
      /* UI already optimistic */
    });
  });
}

/** Toggle all catalog segments on/off (does not change label overlays). */
export async function toggleAllSegmentVisibility(state: AppState): Promise<void> {
  const anyOff = Object.values(state.segmentVisible).some((v) => v === false);
  const on = anyOff;
  const segmentVisible: Record<number, boolean> = {};
  for (const inst of state.segCatalog.segmentations) {
    for (const seg of inst.segments || []) {
      const n = Number(seg.number);
      if (Number.isFinite(n)) segmentVisible[n] = on;
    }
  }
  await publishSceneUpdate(state, { segmentVisible });
  notifyStudy(state);
}

/** Toggle segment label overlays only. */
export async function toggleLabelsVisibility(state: AppState): Promise<void> {
  await publishSceneUpdate(state, {
    labelsVisible: state.labelsVisible === false,
  });
  notifyStudy(state);
}

let opacityPublishRaf = 0;
let opacityPublishPending: number | null = null;

/** Set global SEG opacity and publish scene-update (#/opacity only). Does not re-render. */
export function setSegOpacity(state: AppState, opacity: number): void {
  const o = Math.max(0, Math.min(1, Number(opacity)));
  if (!Number.isFinite(o)) return;
  state.segOpacity = o;
  opacityPublishPending = o;
  if (opacityPublishRaf) return;
  opacityPublishRaf = requestAnimationFrame(() => {
    opacityPublishRaf = 0;
    const v = opacityPublishPending;
    opacityPublishPending = null;
    if (v == null) return;
    void publishSceneUpdate(state, { opacity: v, opacityOnly: true });
  });
}

let volumeOpacityPublishRaf = 0;
let volumeOpacityPublishPending: number | null = null;

/** Publish volume-render opacity only (vol1 #/opacity). Independent of SEG catalog. */
export async function publishVolumeOpacity(
  state: AppState,
  opacity: number
): Promise<boolean> {
  if (!state.client || state.connection !== 'connected') {
    console.warn(`${LOG_PREFIX} volume opacity: not connected`);
    return false;
  }
  const o = Math.max(0, Math.min(1, Number(opacity)));
  if (!Number.isFinite(o)) return false;
  state.volumeOpacity = o;
  const volId = primaryVolNodeId(state.sceneDoc);
  const ops = buildVolumeOpacityPatchOps({ volId, opacity: o });
  if (!ops.length) return false;
  try {
    const res = await state.client.publish({
      event: {
        'hub.topic': state.topic,
        'hub.event': 'scene-update',
        context: [{ key: 'scene', resource: { ops } }],
      },
      actor: REPORTING_ACTOR,
      'target.actor': 'ID',
      'target.product.name': '*',
    });
    const ok = Boolean(res && res.ok);
    if (!ok) {
      console.warn(
        `${LOG_PREFIX} volume opacity failed`,
        res ? `HTTP ${res.status}` : 'No response'
      );
    }
    return ok;
  } catch (err) {
    console.error(`${LOG_PREFIX} volume opacity exception`, err);
    return false;
  }
}

/** Set volume-render opacity and publish scene-update (vol1 #/opacity). Does not re-render. */
export function setVolumeOpacity(state: AppState, opacity: number): void {
  const o = Math.max(0, Math.min(1, Number(opacity)));
  if (!Number.isFinite(o)) return;
  if (o > 0.02) lastVolumeOpacityWhenVisible = o;
  state.volumeOpacity = o;
  volumeOpacityPublishPending = o;
  if (volumeOpacityPublishRaf) return;
  volumeOpacityPublishRaf = requestAnimationFrame(() => {
    volumeOpacityPublishRaf = 0;
    const v = volumeOpacityPublishPending;
    volumeOpacityPublishPending = null;
    if (v == null) return;
    void publishVolumeOpacity(state, v);
  });
}

/** Remember last non-off volume opacity for eye-toggle restore. */
let lastVolumeOpacityWhenVisible = 1;

/** Toggle volume visibility via opacity 0 ↔ last visible level. Remounts UI. */
export function toggleVolumeVisibility(state: AppState): void {
  if (state.volumeOpacity > 0.02) {
    lastVolumeOpacityWhenVisible = state.volumeOpacity;
    setVolumeOpacity(state, 0);
  } else {
    setVolumeOpacity(state, lastVolumeOpacityWhenVisible > 0.02 ? lastVolumeOpacityWhenVisible : 1);
  }
  notifyStudy(state);
}

let volumeShiftPublishRaf = 0;
let volumeShiftPublishPending: number | null = null;

/** Publish volume-render shift only (vol1 #/shift). */
export async function publishVolumeShift(
  state: AppState,
  shift: number
): Promise<boolean> {
  if (!state.client || state.connection !== 'connected') {
    console.warn(`${LOG_PREFIX} volume shift: not connected`);
    return false;
  }
  const s = Number(shift);
  if (!Number.isFinite(s)) return false;
  state.volumeShift = s;
  const volId = primaryVolNodeId(state.sceneDoc);
  const ops = buildVolumeShiftPatchOps({ volId, shift: s });
  if (!ops.length) return false;
  try {
    const res = await state.client.publish({
      event: {
        'hub.topic': state.topic,
        'hub.event': 'scene-update',
        context: [{ key: 'scene', resource: { ops } }],
      },
      actor: REPORTING_ACTOR,
      'target.actor': 'ID',
      'target.product.name': '*',
    });
    const ok = Boolean(res && res.ok);
    if (!ok) {
      console.warn(
        `${LOG_PREFIX} volume shift failed`,
        res ? `HTTP ${res.status}` : 'No response'
      );
    }
    return ok;
  } catch (err) {
    console.error(`${LOG_PREFIX} volume shift exception`, err);
    return false;
  }
}

/** Set VR shift (HU) and publish scene-update (vol1 #/shift). Does not re-render. */
export function setVolumeShift(state: AppState, shift: number): void {
  const s = Number(shift);
  if (!Number.isFinite(s)) return;
  state.volumeShift = s;
  volumeShiftPublishPending = s;
  if (volumeShiftPublishRaf) return;
  volumeShiftPublishRaf = requestAnimationFrame(() => {
    volumeShiftPublishRaf = 0;
    const v = volumeShiftPublishPending;
    volumeShiftPublishPending = null;
    if (v == null) return;
    void publishVolumeShift(state, v);
  });
}

/** Publish volume-render preset only (vol1 #/preset). */
async function publishVolumePreset(
  state: AppState,
  preset: string
): Promise<boolean> {
  if (!state.client || state.connection !== 'connected') {
    console.warn(`${LOG_PREFIX} volume preset: not connected`);
    return false;
  }
  const name = String(preset || '').trim();
  state.volumePreset = name;
  const volId = primaryVolNodeId(state.sceneDoc);
  const ops = buildVolumePresetPatchOps({ volId, preset: name });
  if (!ops.length) return false;
  try {
    const res = await state.client.publish({
      event: {
        'hub.topic': state.topic,
        'hub.event': 'scene-update',
        context: [{ key: 'scene', resource: { ops } }],
      },
      actor: REPORTING_ACTOR,
      'target.actor': 'ID',
      'target.product.name': '*',
    });
    const ok = Boolean(res && res.ok);
    if (!ok) {
      console.warn(
        `${LOG_PREFIX} volume preset failed`,
        res ? `HTTP ${res.status}` : 'No response'
      );
    }
    return ok;
  } catch (err) {
    console.error(`${LOG_PREFIX} volume preset exception`, err);
    return false;
  }
}

/** Set VR preset id ('' = default W/L) and publish scene-update. Does not re-render. */
export function setVolumePreset(state: AppState, preset: string): void {
  const name = String(preset || '').trim();
  state.volumePreset = name;
  void publishVolumePreset(state, name);
}

/** True until first crop-on reveals the ROI box (Slicer / IRA behaviour). */
let volumeCropFirstEnable = true;

async function publishVolumeCropOps(
  state: AppState,
  ops: Array<Record<string, unknown>>
): Promise<boolean> {
  if (!state.client || state.connection !== 'connected') {
    console.warn(`${LOG_PREFIX} volume crop: not connected`);
    return false;
  }
  if (!ops.length) return false;
  try {
    const res = await state.client.publish({
      event: {
        'hub.topic': state.topic,
        'hub.event': 'scene-update',
        context: [{ key: 'scene', resource: { ops } }],
      },
      actor: REPORTING_ACTOR,
      'target.actor': 'ID',
      'target.product.name': '*',
    });
    const ok = Boolean(res && res.ok);
    if (!ok) {
      console.warn(
        `${LOG_PREFIX} volume crop failed`,
        res ? `HTTP ${res.status}` : 'No response'
      );
    }
    return ok;
  } catch (err) {
    console.error(`${LOG_PREFIX} volume crop exception`, err);
    return false;
  }
}

/** Enable/disable volume crop; first enable also shows the ROI box. Remounts UI. */
export function setVolumeCropEnabled(state: AppState, on: boolean): void {
  const enabled = Boolean(on);
  state.volumeCropEnabled = enabled;
  const volId = primaryVolNodeId(state.sceneDoc);
  const ops = buildVolumeCropPatchOps({ volId, cropEnabled: enabled });
  if (enabled && volumeCropFirstEnable) {
    volumeCropFirstEnable = false;
    state.volumeRoiVisible = true;
    ops.push(...buildRoiVisiblePatchOps({ volId, roiVisible: true }));
  }
  notifyStudy(state);
  void publishVolumeCropOps(state, ops);
}

/** Show/hide the crop ROI box. Remounts UI. */
export function setVolumeRoiVisible(state: AppState, on: boolean): void {
  const visible = Boolean(on);
  state.volumeRoiVisible = visible;
  const volId = primaryVolNodeId(state.sceneDoc);
  notifyStudy(state);
  void publishVolumeCropOps(
    state,
    buildRoiVisiblePatchOps({ volId, roiVisible: visible })
  );
}

function adoptImagingStudyContext(
  state: AppState,
  context: unknown[] | null
): boolean {
  if (!context?.length) return false;
  state.lastImagingStudyOpenContext = cloneContextArray(context);
  state.openStudy = studyInfoFromContext(context);
  return true;
}

/**
 * Refresh study context + SEG catalog from one general Hub STATUS (`target.actor=*`).
 * Prefers Image Display for catalog/scene; falls back to worklist ImagingStudy.
 * Marks worklistOnline / iraOnline from matching peers (presence highlights).
 */
export async function refreshReportContextFromStatus(
  state: AppState
): Promise<void> {
  if (!state.client || state.connection !== 'connected') {
    state.segLoadDetail = 'Not connected to Slicer hub';
    notifyStudy(state);
    return;
  }
  const subscriber =
    state.subscriberName ||
    state.client.getSessionConfig?.()?.subscriberName?.trim() ||
    '';
  if (!subscriber) {
    state.segLoadDetail = 'No subscriber name';
    notifyStudy(state);
    return;
  }

  state.segLoadDetail = 'Requesting status…';
  notifyStudy(state);

  try {
    const responses = await requestStatus(state, '*');
    const parsed = parseStatusResponses(responses);
    applyConnectedAppsFromStatusResponses(state, responses);
    // Refresh viewer button highlights (status listener → setViewerButtonsEnabled).
    notifyStatus(state);

    if (parsed.foundIdResponder) {
      if (parsed.idImagingContext) {
        adoptImagingStudyContext(state, parsed.idImagingContext);
      }
      state.segCatalog = parsed.catalog ?? EMPTY_SEG_CATALOG;
      applyCatalogMeasurements(state);
      adoptSceneVisibility(state, parsed.sceneDoc);
      const n = state.segCatalog.segmentations.reduce(
        (acc, s) => acc + (s.segments?.length || 0),
        0
      );

      const needWorklistStudy =
        !state.openStudy && !parsed.idImagingContext?.length;
      if (needWorklistStudy && parsed.worklistImagingContext) {
        adoptImagingStudyContext(state, parsed.worklistImagingContext);
        state.segLoadDetail = withResponderName(
          n > 0
            ? `Loaded ${n} segment${n === 1 ? '' : 's'} from Image Display; study from worklist`
            : 'Image Display online (no SEG); adopted study context from worklist',
          parsed.idResponderSubscriber
        );
        notifyStudy(state);
        return;
      }

      state.segLoadDetail = withResponderName(
        n > 0
          ? `Loaded ${n} segment${n === 1 ? '' : 's'} from Image Display`
          : 'Image Display has no segmentation loaded',
        parsed.idResponderSubscriber
      );
      notifyStudy(state);
      return;
    }

    // No Image Display — adopt ImagingStudy from worklist when present.
    state.segCatalog = EMPTY_SEG_CATALOG;
    applyCatalogMeasurements(state);
    adoptSceneVisibility(state, null);

    if (parsed.worklistImagingContext) {
      adoptImagingStudyContext(state, parsed.worklistImagingContext);
      state.segLoadDetail =
        'Adopted study context from worklist (no Image Display)';
    } else if (parsed.foundWorklistResponder) {
      state.openStudy = null;
      state.lastImagingStudyOpenContext = [];
      state.segLoadDetail = reportingChromeFor().worklistNoOpenStudy;
    } else {
      state.segLoadDetail =
        'No Image Display or worklist responded on this topic';
    }
    notifyStudy(state);
  } catch (err) {
    clearConnectedApps(state);
    notifyStatus(state);
    state.segLoadDetail = `STATUS failed: ${(err as Error)?.message ?? err}`;
    console.error(`${LOG_PREFIX} refreshReportContextFromStatus`, err);
    notifyStudy(state);
  }
}

/** @deprecated Prefer {@link refreshReportContextFromStatus} */
export async function loadSegCatalogFromImageDisplay(
  state: AppState
): Promise<void> {
  return refreshReportContextFromStatus(state);
}

export function selectMeasurement(
  state: AppState,
  measurementId: string | null
): void {
  state.selectedMeasurementId = measurementId;
  if (measurementId) {
    const m = state.measurements.find((row) => row.id === measurementId);
    if (m?.segmentNumber != null) {
      state.selectedSegmentNumber = m.segmentNumber;
      state.selectedSegmentSopUid = m.segmentationSOPInstanceUID || '';
    }
  }
  notifyStudy(state);
}

export function selectSegment(
  state: AppState,
  segmentNumber: number | null,
  sopUid = ''
): void {
  state.selectedSegmentNumber = segmentNumber;
  state.selectedSegmentSopUid = sopUid;
  notifyStudy(state);
}

/** Add (or select existing) Volume measurement for a catalog segment. */
export function addMeasurementForSegment(
  state: AppState,
  segmentNumber: number,
  sopUid?: string
): void {
  const match = findCatalogSegment(
    state.segCatalog,
    segmentNumber,
    sopUid || undefined
  );
  if (!match) {
    state.segLoadDetail = 'No segment to measure';
    notifyStudy(state);
    return;
  }
  const num = Number(match.segment.number);
  const sop = String(match.instance.sopInstanceUID || '');
  const existing = state.measurements.find(
    (m) =>
      /^volume$/i.test(m.quantity) &&
      Number(m.segmentNumber) === num &&
      (!m.segmentationSOPInstanceUID ||
        !sop ||
        m.segmentationSOPInstanceUID === sop)
  );
  if (existing) {
    state.selectedMeasurementId = existing.id;
    state.selectedSegmentNumber = num;
    state.selectedSegmentSopUid = sop;
    state.segLoadDetail = `Selected Volume for ${existing.segmentLabel}`;
    notifyStudy(state);
    return;
  }
  const label = String(match.segment.label || `Segment ${num}`);
  const id = `manual:${sop || 'seg'}:${num}:volume:${Date.now()}`;
  state.measurements.push({
    id,
    quantity: 'Volume',
    value: Number.isFinite(match.segment.volumeMm3)
      ? match.segment.volumeMm3
      : '—',
    units: 'mm3',
    segmentNumber: Number.isFinite(num) ? num : null,
    segmentLabel: label,
    segmentationSOPInstanceUID: sop,
    trackingIdentifier: label,
    source: 'manual',
  });
  state.selectedMeasurementId = id;
  state.selectedSegmentNumber = Number.isFinite(num) ? num : null;
  state.selectedSegmentSopUid = sop;
  state.segLoadDetail = `Added Volume for ${label}`;
  notifyStudy(state);
}

/** Header +: selected segment, else first catalog segment. */
export function addMeasurementForSelectedOrFirst(state: AppState): void {
  if (state.selectedSegmentNumber != null) {
    addMeasurementForSegment(
      state,
      state.selectedSegmentNumber,
      state.selectedSegmentSopUid || undefined
    );
    return;
  }
  const first = firstCatalogSegment(state.segCatalog);
  if (!first) {
    state.segLoadDetail = 'No segmentations yet — refresh from Image Display';
    notifyStudy(state);
    return;
  }
  addMeasurementForSegment(
    state,
    Number(first.segment.number),
    first.instance.sopInstanceUID || undefined
  );
}

export function removeMeasurement(state: AppState, measurementId: string): void {
  const before = state.measurements.length;
  state.measurements = state.measurements.filter((m) => m.id !== measurementId);
  if (state.selectedMeasurementId === measurementId) {
    state.selectedMeasurementId = null;
  }
  if (state.measurements.length < before) {
    state.segLoadDetail = 'Removed measurement';
  }
  notifyStudy(state);
}

function nextSnapshotFilename(state: AppState): string {
  const n = state.snapshots.length + 1;
  return `snapshot-${String(n).padStart(3, '0')}.png`;
}

function parsePngFullSizeResponse(responses: unknown[]): {
  contentType: string;
  dataBase64: string;
  width?: number;
  height?: number;
} | null {
  for (const item of responses) {
    if (!item || typeof item !== 'object') continue;
    const row = item as { data?: unknown };
    const data = row.data;
    if (!data || typeof data !== 'object') continue;
    const payload = data as {
      contentType?: unknown;
      data?: unknown;
      width?: unknown;
      height?: unknown;
    };
    const dataBase64 = String(payload.data || '').trim();
    if (!dataBase64) continue;
    const contentType = String(payload.contentType || 'image/png').trim();
    const width =
      typeof payload.width === 'number' && Number.isFinite(payload.width)
        ? payload.width
        : undefined;
    const height =
      typeof payload.height === 'number' && Number.isFinite(payload.height)
        ? payload.height
        : undefined;
    return { contentType, dataBase64, width, height };
  }
  return null;
}

/** Build a small PNG thumbnail in the reporting client from a full base64 PNG. */
function makeSnapshotThumbnail(
  dataBase64: string,
  contentType = 'image/png',
  maxWidth = 96
): Promise<{ thumbBase64: string; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxWidth / Math.max(1, img.naturalWidth));
      const width = Math.max(1, Math.round(img.naturalWidth * scale));
      const height = Math.max(1, Math.round(img.naturalHeight * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('No 2d context'));
        return;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/png');
      const comma = dataUrl.indexOf(',');
      resolve({
        thumbBase64: comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl,
        width,
        height,
      });
    };
    img.onerror = () => reject(new Error('Failed to decode PNG'));
    img.src = `data:${contentType};base64,${dataBase64}`;
  });
}

/** Slicer hub PNGFULLSIZE request targeting Image Display (IRA). */
export async function requestPngFullSize(state: AppState): Promise<{
  ok: boolean;
  contentType?: string;
  dataBase64?: string;
  width?: number;
  height?: number;
  detail?: string;
}> {
  const subscriber =
    state.subscriberName ||
    state.client?.getSessionConfig?.()?.subscriberName?.trim() ||
    '';
  if (!state.client || !subscriber) {
    return { ok: false, detail: 'Not connected to Slicer hub' };
  }
  try {
    const result = await state.client.request({
      'subscriber.name': subscriber,
      'subscriber.product.name': PRODUCT_NAME,
      'subscriber.actor': REPORTING_ACTOR,
      'target.actor': 'ID',
      'target.product.name': '*',
      event: {
        'hub.event': requestEventFor('PNGFULLSIZE'),
        ...(state.topic ? { 'hub.topic': state.topic } : {}),
        context: { dataType: 'PNGFULLSIZE' },
      },
    });
    const body = (result as { data?: unknown })?.data ?? result;
    const { responses, timedOut, missing } = parseCollatedRequestResult(body);
    const parsed = parsePngFullSizeResponse(responses);
    if (parsed) {
      return { ok: true, ...parsed };
    }
    if (timedOut || (missing && missing.length)) {
      return { ok: false, detail: 'Image Display did not respond in time' };
    }
    return { ok: false, detail: 'No PNG in response' };
  } catch (err) {
    return {
      ok: false,
      detail: `PNGFULLSIZE failed: ${(err as Error)?.message ?? err}`,
    };
  }
}

/** Add a pending snapshot row and request a full PNG from IRA. */
export async function addSnapshotAndRequestPng(state: AppState): Promise<void> {
  const id = `snap-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
  const row: ReportSnapshot = {
    id,
    filename: nextSnapshotFilename(state),
    createdAt: new Date().toISOString(),
    status: 'pending',
    detail: 'Requesting PNG from Image Display…',
  };
  state.snapshots = [...state.snapshots, row];
  notifyStudy(state);

  const result = await requestPngFullSize(state);
  const idx = state.snapshots.findIndex((s) => s.id === id);
  if (idx < 0) return;
  const next = [...state.snapshots];
  if (result.ok && result.dataBase64) {
    let thumbBase64 = '';
    try {
      const thumb = await makeSnapshotThumbnail(
        result.dataBase64,
        result.contentType || 'image/png'
      );
      thumbBase64 = thumb.thumbBase64;
    } catch (err) {
      console.warn(`${LOG_PREFIX} snapshot thumb failed`, err);
    }
    next[idx] = {
      ...next[idx],
      status: 'ready',
      detail: undefined,
      contentType: result.contentType || 'image/png',
      dataBase64: result.dataBase64,
      thumbBase64: thumbBase64 || undefined,
      width: result.width,
      height: result.height,
    };
  } else {
    next[idx] = {
      ...next[idx],
      status: 'error',
      detail: result.detail || 'Capture failed',
    };
  }
  state.snapshots = next;
  notifyStudy(state);
}

/** Remove a snapshot row from the report list. */
export function removeSnapshot(state: AppState, snapshotId: string): void {
  const next = state.snapshots.filter((s) => s.id !== snapshotId);
  if (next.length === state.snapshots.length) return;
  state.snapshots = next;
  notifyStudy(state);
}

export function downloadSnapshotLocally(
  state: AppState,
  snapshotId: string
): void {
  const snap = state.snapshots.find((s) => s.id === snapshotId);
  if (!snap?.dataBase64 || snap.status !== 'ready') return;
  const contentType = snap.contentType || 'image/png';
  const binary = atob(snap.dataBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  const blob = new Blob([bytes], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = snap.filename || 'snapshot.png';
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Open the full-resolution snapshot in a modal lightbox. */
export function openSnapshotFullView(
  state: AppState,
  snapshotId: string
): void {
  const snap = state.snapshots.find((s) => s.id === snapshotId);
  if (!snap?.dataBase64 || snap.status !== 'ready') return;
  const contentType = snap.contentType || 'image/png';
  let backdrop = document.getElementById('snapshotViewModal');
  if (!backdrop) {
    backdrop = document.createElement('div');
    backdrop.id = 'snapshotViewModal';
    backdrop.className = 'rp-modal-backdrop';
    backdrop.innerHTML = `
      <div class="rp-modal rp-snapshot-view-modal" role="dialog" aria-labelledby="snapshotViewTitle">
        <div class="rp-modal-header">
          <h2 id="snapshotViewTitle">Snapshot</h2>
          <button type="button" class="rp-modal-close" data-close-snapshot-view aria-label="Close">×</button>
        </div>
        <div class="rp-modal-body rp-snapshot-view-body">
          <img id="snapshotViewImg" alt="" />
        </div>
      </div>`;
    document.body.appendChild(backdrop);
    backdrop.addEventListener('click', (ev) => {
      const t = ev.target as HTMLElement | null;
      if (t === backdrop || t?.closest('[data-close-snapshot-view]')) {
        backdrop!.hidden = true;
        const img = document.getElementById(
          'snapshotViewImg'
        ) as HTMLImageElement | null;
        if (img) img.removeAttribute('src');
      }
    });
  }
  const title = document.getElementById('snapshotViewTitle');
  if (title) title.textContent = snap.filename || 'Snapshot';
  const img = document.getElementById(
    'snapshotViewImg'
  ) as HTMLImageElement | null;
  if (img) {
    img.src = `data:${contentType};base64,${snap.dataBase64}`;
    img.alt = snap.filename || 'Snapshot';
  }
  backdrop.hidden = false;
}

async function handleDicomSendMessage(
  state: AppState,
  message: Record<string, unknown>
): Promise<boolean> {
  const event = message?.event as { 'hub.event'?: string } | undefined;
  if (getHubEventLower(event) !== 'dicom-send') return false;
  if (!state.client) return true;

  try {
    const resolved = (await resolveHubFileMessage(
      state.client,
      message
    )) as Record<string, unknown>;
    const resolvedEvent = (resolved?.event ?? message.event) as Record<
      string,
      unknown
    >;
    const files = batchContextFiles(resolvedEvent) as Record<string, unknown>[];
    let added = 0;
    for (const entry of files) {
      const bytes = fileBytes(entry);
      if (!bytes?.length) continue;
      const parsed = await parseTid1500FromBuffer(bytes);
      if (!parsed.ok) continue;
      for (const m of parsed.measurements) {
        const id = `sr:${parsed.sopInstanceUID}:${m.quantity}:${m.segmentNumber}:${added}`;
        state.measurements.push({
          id,
          quantity: m.quantity,
          value: m.value,
          units: m.units,
          segmentNumber: m.segmentNumber,
          segmentLabel: m.segmentLabel,
          segmentationSOPInstanceUID: m.segmentationSOPInstanceUID,
          trackingIdentifier: m.trackingIdentifier,
          source: 'sr',
        });
        added++;
      }
    }
    if (added) {
      state.segLoadDetail = `Added ${added} measurement${added === 1 ? '' : 's'} from DICOM SR`;
      notifyStudy(state);
    }
  } catch (err) {
    console.warn(`${LOG_PREFIX} dicom-send SR handler`, err);
  }
  return true;
}

function setConnection(
  state: AppState,
  connection: ConnectionUiState,
  detail: string
): void {
  const wasConnected = state.connection === 'connected';
  state.connection = connection;
  state.connectionDetail = detail;
  if (wasConnected && connection !== 'connected') {
    setConferenceView(state, null);
    clearConnectedApps(state);
  }
  notifyStatus(state);
  if (connection === 'connected') {
    void syncConferenceView(state);
  }
}

function hubDef(state: AppState) {
  return getHubDefinitions()[state.hubKey];
}

export function hubEndpoint(state: AppState): string {
  return hubDef(state).hubEndpoint;
}

export function hubAdminUrl(state: AppState): string {
  const endpoint = hubEndpoint(state);
  return resolveHubAdminUrl(endpoint) || endpoint;
}

export function studyInfoFromContext(context: unknown): StudyInfo {
  const normalized = normalizeImagingStudyContext(context);
  const files = extractImagingStudyFiles(normalized);
  return {
    sampleId: extractVolviewSampleId(normalized) || '',
    openMode: extractOpenMode(normalized) || '',
    studyUid: extractDicomStudyUid(normalized) || '',
    seriesUid: extractDicomSeriesUid(normalized) || '',
    dicomwebRoot: extractDicomwebRoot(normalized) || '',
    fileCount: files.length,
    fileNames: files
      .map((f) => f.fileName || f.label || '')
      .filter(Boolean)
      .slice(0, 8),
  };
}

function extractActorKeywords(actor: unknown): string[] {
  if (actor == null) return [];
  if (typeof actor === 'string') {
    const keyword = actor.trim();
    return keyword ? [keyword] : [];
  }
  if (Array.isArray(actor)) {
    return actor.flatMap((entry) => extractActorKeywords(entry));
  }
  if (typeof actor === 'object') {
    const obj = actor as { id?: unknown; key?: unknown; name?: unknown };
    const candidate = obj.id || obj.key || obj.name;
    if (candidate == null) return [];
    const keyword = String(candidate).trim();
    return keyword ? [keyword] : [];
  }
  return [];
}

function handleIncomingStatusRequest(
  state: AppState,
  message: Record<string, unknown>
): boolean {
  const event = message?.event as
    | {
        'hub.event'?: string;
        'hub.topic'?: string;
        context?: { id?: unknown; dataType?: unknown };
      }
    | undefined;
  if (!event || !isRequestEvent(getHubEventLower(event))) return false;

  const context =
    event.context && typeof event.context === 'object' ? event.context : {};
  const correlationId = context.id;
  if (typeof correlationId !== 'string' || !correlationId) return false;

  const requestedTargets = extractActorKeywords(message['target.actor']);
  if (
    requestedTargets.length > 0 &&
    !requestedTargets.includes('*') &&
    !requestedTargets.includes(REPORTING_ACTOR)
  ) {
    return false;
  }

  if (String(context.dataType || '').toUpperCase() !== 'STATUS') return false;

  // Worklist-parity: inbound status-request from IRA / worklist lights viewer buttons.
  markConnectedAppFromMessage(state, message);
  notifyStatus(state);

  const responseData = state.lastImagingStudyOpenContext.length
    ? {
        'context.type': 'ImagingStudy',
        context: cloneContextArray(state.lastImagingStudyOpenContext),
      }
    : {
        source: 'status',
        product: PRODUCT_NAME,
        items: [{ key: 'availability', value: 'online' }],
      };

  state.client?.sendCastRequestResponse(
    correlationId,
    'STATUS',
    responseData,
    event['hub.topic']
  );
  return true;
}

function clearOpenStudyLocal(state: AppState): void {
  state.openStudy = null;
  state.lastImagingStudyOpenContext = [];
  state.segCatalog = EMPTY_SEG_CATALOG;
  state.measurements = [];
  state.selectedMeasurementId = null;
  state.selectedSegmentNumber = null;
  state.selectedSegmentSopUid = '';
  state.segLoadDetail = '';
  state.sceneDoc = null;
  state.segmentVisible = {};
  state.segmentOpacity = {};
  state.labelsVisible = true;
  state.segOpacity = 1;
  state.volumeOpacity = 1;
  state.volumeShift = 0;
  state.volumeShiftRange = 500;
  state.volumePreset = '';
  state.volumeName = '';
  state.volumeCropEnabled = false;
  state.volumeRoiVisible = false;
  state.snapshots = [];
  volumeCropFirstEnable = true;
}

function handleImagingStudyMessage(
  state: AppState,
  message: Record<string, unknown>
): boolean {
  const event = message?.event as { 'hub.event'?: string } | undefined;
  const name = getHubEventLower(event);
  if (name === 'imagingstudy-close') {
    clearOpenStudyLocal(state);
    console.info(`${LOG_PREFIX} ImagingStudy-close`);
    notifyStudy(state);
    return true;
  }
  if (name !== 'imagingstudy-open') return false;

  // Non-leading attendees who opted out of follow ignore host opens.
  if (
    state.conference &&
    !state.conferenceFollowHost &&
    state.conference.selfRole !== 'leading'
  ) {
    return true;
  }

  const context = cloneContextArray(messageEventContext(message));
  state.lastImagingStudyOpenContext = context;
  state.openStudy = studyInfoFromContext(context);
  console.info(
    `${LOG_PREFIX} ImagingStudy-open`,
    state.openStudy.sampleId || '(no sample id)',
    'mode=',
    state.openStudy.openMode || '(none)'
  );
  notifyStudy(state);
  void refreshReportContextFromStatus(state);
  return true;
}

function countCatalogSegments(catalog: {
  segmentations: Array<{ segments?: unknown[] }>;
}): number {
  return catalog.segmentations.reduce(
    (acc, s) => acc + (s.segments?.length || 0),
    0
  );
}

function handleStructureReportUpdate(
  state: AppState,
  message: Record<string, unknown>
): boolean {
  const event = message?.event as { 'hub.event'?: string } | undefined;
  if (getHubEventLower(event) !== 'structurereport-update') return false;

  const prevCount = countCatalogSegments(state.segCatalog);
  const context = cloneContextArray(messageEventContext(message));
  const catalog = segCatalogFromContext(context) ?? EMPTY_SEG_CATALOG;
  state.segCatalog = catalog;
  applyCatalogMeasurements(state);
  // Keep visibility keys for new segments; don't wipe sceneDoc.
  adoptSceneVisibility(state, state.sceneDoc);
  const n = countCatalogSegments(catalog);
  state.segLoadDetail = withResponderName(
    n > 0
      ? `Updated ${n} segment${n === 1 ? '' : 's'} from Image Display`
      : 'Image Display has no segmentation loaded',
    messageSubscriberName(message)
  );
  console.info(`${LOG_PREFIX} StructureReport-update segments=`, n);
  notifyStudy(state);
  // Browsers block window.focus() from websocket handlers; IRA/worklist
  // focus the popup via their Window handle when segment count grows.
  if (n > prevCount) {
    try {
      document.title = `● DICOM SR — ${n} segments`;
      window.setTimeout(() => {
        document.title = 'DICOM SR — Measurements';
      }, 2500);
    } catch {
      /* ignore */
    }
  }
  return true;
}

function stripCastParamsFromUrl(): void {
  const url = new URL(window.location.href);
  let changed = false;
  for (const key of ['topic', 'id-token', 'hub']) {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      changed = true;
    }
  }
  if (changed) {
    window.history.replaceState({}, '', url.pathname + url.search + url.hash);
  }
}

async function syncStoredUserNameWithHub(state: AppState): Promise<void> {
  if (state.freshUser) return;
  const endpoint = hubEndpoint(state);
  const currentOrigin = hubOriginFromEndpoint(endpoint) || '';
  const currentStartedAt = await fetchHubStartedAt(endpoint);
  if (currentStartedAt) state.hubStartedAt = currentStartedAt;

  const storedUser = getStoredUserName();
  if (!storedUser) return;

  const storedStartedAt = getStoredUserHubStartedAt();
  const storedOrigin = getStoredUserHubOrigin();
  const hubRestarted =
    Boolean(currentStartedAt && storedStartedAt) &&
    storedStartedAt !== currentStartedAt;
  const hubChanged =
    Boolean(storedOrigin && currentOrigin) && storedOrigin !== currentOrigin;
  const missingHubBinding =
    Boolean(currentStartedAt) && (!storedStartedAt || !storedOrigin);

  if (hubRestarted || hubChanged || missingHubBinding) {
    console.info(
      `${LOG_PREFIX} discarding stored user name (hub restarted or changed)`
    );
    clearStoredUserName();
    state.userName = '';
    state.client?.setUserName('');
  }
}

function ensureClient(
  state: AppState,
  recreate = false,
  opts?: { preserveSessionTopicFromToken?: boolean }
) {
  if (!state.client || recreate) {
    state.client?.delete();
    const hub = hubDef(state);
    state.client = HubClient.newInstance({
      hub: {
        name: 'demo',
        version: '1.0',
        hub_endpoint: hub.hubEndpoint,
        authorization_endpoint: hub.authorizeEndpoint,
        token_endpoint: hub.tokenEndpoint,
        client_id: hub.client_id,
        client_secret: hub.client_secret,
      },
      session: {
        subscriberName: state.subscriberName,
        productName: PRODUCT_NAME,
        productVersion: '1.0',
        actors: [REPORTING_ACTOR],
        topic: state.topic,
        events: SUBSCRIBE_EVENTS,
        lease: 7200,
        defaultTargetActor: '*',
        userName: getStoredUserName() || undefined,
      },
      callbackUrl: `${window.location.origin}/castCallback`,
      preserveSessionTopicFromToken: Boolean(opts?.preserveSessionTopicFromToken),
      autoReconnect: true,
    });

    state.client.onMessage((message: Record<string, unknown>) => {
      if (handleConferenceHubEvent(state, message)) return;
      if (handleSubscriptionRemoved(state, message)) return;
      if (handleIncomingStatusRequest(state, message)) return;
      if (handleImagingStudyMessage(state, message)) return;
      if (handleStructureReportUpdate(state, message)) return;
      void handleDicomSendMessage(state, message);
    });

    state.client.onConnectionStateChange((wsState: string) => {
      if (wsState === 'connecting') {
        setConnection(state, 'connecting', 'Websocket connecting');
      } else if (wsState === 'connected') {
        setConnection(state, 'connected', 'Websocket connected');
      } else if (wsState === 'error') {
        setConnection(state, 'error', 'Websocket error');
      } else {
        setConnection(state, 'disconnected', 'Websocket disconnected');
      }
    });
  }

  state.client.setTopic(state.topic);
  const storedUserName = getStoredUserName();
  if (storedUserName) state.client.setUserName(storedUserName);
  return state.client;
}

function buildPublishPayload(
  state: AppState,
  hubEvent: string,
  context: unknown[]
) {
  return {
    event: {
      'hub.topic': state.topic,
      'hub.event': hubEvent,
      context,
    },
    actor: REPORTING_ACTOR,
    'target.actor': '*',
    'target.product.name': '*',
  };
}

async function publishImagingStudyClose(state: AppState): Promise<boolean> {
  if (!state.client) {
    console.warn(`${LOG_PREFIX} close study: subscribe first`);
    return false;
  }
  if (!state.lastImagingStudyOpenContext.length) {
    console.warn(`${LOG_PREFIX} close study: no open context`);
    return false;
  }
  const context = cloneContextArray(state.lastImagingStudyOpenContext);
  const payload = buildPublishPayload(state, 'ImagingStudy-close', context);
  try {
    const res = await state.client.publish(payload);
    if (res && res.ok) {
      clearOpenStudyLocal(state);
      notifyStudy(state);
      return true;
    }
    console.warn(
      `${LOG_PREFIX} close study failed`,
      res ? `HTTP ${res.status}` : 'No response'
    );
    return false;
  } catch (err) {
    console.error(`${LOG_PREFIX} close study exception`, err);
    return false;
  }
}

export async function handleReportingClose(state: AppState): Promise<void> {
  await publishImagingStudyClose(state);
}

type HostStatusResponseItem = {
  actor?: unknown;
  data?: {
    'context.type'?: unknown;
    context?: unknown;
  };
};

/**
 * After Join and follow: ask the host worklist (on hostTopic) for open ImagingStudy
 * and adopt it as the local open context.
 */
export async function requestStatusFromHostWorklist(
  state: AppState,
  hostTopic: string
): Promise<void> {
  const topic = String(hostTopic || '').trim();
  if (!topic) {
    console.warn(`${LOG_PREFIX} host STATUS skip: no host topic`);
    return;
  }
  if (!state.client || state.connection !== 'connected') {
    console.warn(`${LOG_PREFIX} host STATUS skip: not connected`);
    return;
  }
  const subscriber =
    state.subscriberName ||
    state.client.getSessionConfig()?.subscriberName?.trim() ||
    '';
  if (!subscriber) {
    console.warn(`${LOG_PREFIX} host STATUS skip: no subscriber name`);
    return;
  }

  try {
    console.info(`${LOG_PREFIX} STATUS request → ${WORKLIST_ACTOR} topic=`, topic);
    const result = await state.client.request({
      'subscriber.name': subscriber,
      'subscriber.product.name': PRODUCT_NAME,
      'subscriber.actor': REPORTING_ACTOR,
      'target.actor': WORKLIST_ACTOR,
      event: {
        'hub.event': requestEventFor('STATUS'),
        'hub.topic': topic,
        context: { dataType: 'STATUS' },
      },
    });
    if (!result.ok) {
      console.warn(
        `${LOG_PREFIX} host STATUS failed`,
        `HTTP ${result.status ?? '?'}`
      );
      return;
    }
    const envelope =
      result.data && typeof result.data === 'object'
        ? (result.data as { responses?: HostStatusResponseItem[] })
        : {};
    const responses = Array.isArray(envelope.responses) ? envelope.responses : [];
    let chosen: HostStatusResponseItem['data'] | undefined;
    for (const item of responses) {
      const itemData = item?.data;
      if (
        !itemData ||
        typeof itemData !== 'object' ||
        itemData['context.type'] !== 'ImagingStudy'
      ) {
        continue;
      }
      const actor = String(item?.actor ?? '')
        .trim()
        .toUpperCase();
      if (actor === WORKLIST_ACTOR || chosen === undefined) {
        chosen = itemData;
        if (actor === WORKLIST_ACTOR) break;
      }
    }
    if (!chosen) {
      console.info(
        `${LOG_PREFIX} host STATUS: no ImagingStudy in ${responses.length} response(s)`
      );
      return;
    }
    const context = cloneContextArray(chosen.context);
    if (!context.length) {
      console.info(`${LOG_PREFIX} host STATUS: ImagingStudy context empty`);
      return;
    }
    if (
      sameOpenImagingStudyContext(context, state.lastImagingStudyOpenContext)
    ) {
      console.info(
        `${LOG_PREFIX} host STATUS: same study already open — skip refresh`
      );
      showHubInfoToast(SKIP_STUDY_RELOAD_TOAST);
      return;
    }
    state.lastImagingStudyOpenContext = context;
    state.openStudy = studyInfoFromContext(context);
    notifyStudy(state);
    void refreshReportContextFromStatus(state);
    console.info(
      `${LOG_PREFIX} host STATUS applied ImagingStudy items=`,
      context.length
    );
  } catch (err) {
    console.error(`${LOG_PREFIX} host STATUS exception`, err);
  }
}

export async function autoConnect(state: AppState): Promise<void> {
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get('id-token')?.trim() || '';
  if (params.get('topic')?.trim()) {
    state.topic = params.get('topic')!.trim();
  }

  await syncStoredUserNameWithHub(state);
  setConnection(state, 'connecting', 'Authenticating');

  try {
    const client = ensureClient(state, true, {
      preserveSessionTopicFromToken: Boolean(state.topic && urlToken),
    });
    const storedUserName = state.freshUser ? '' : getStoredUserName();
    // Deep-link: prefer URL topic over a stale reporting-local user name.
    if (urlToken && state.topic) {
      client.setUserName(state.topic);
    } else if (storedUserName) {
      client.setUserName(storedUserName);
    } else {
      client.setUserName('');
    }

    if (urlToken) {
      console.info(`${LOG_PREFIX} auto-connect: id-token deep-link`);
      client.setToken(urlToken);
      stripCastParamsFromUrl();
    } else {
      console.info(`${LOG_PREFIX} auto-connect: authenticate`);
      const result = await client.authenticate();
      const userName = result?.user_name || storedUserName || '';
      const code = result?.code || '';
      if (userName) {
        const startedAt =
          state.hubStartedAt || (await fetchHubStartedAt(hubEndpoint(state)));
        if (startedAt) state.hubStartedAt = startedAt;
        if (!state.freshUser) {
          setStoredUserName(
            userName,
            startedAt,
            hubOriginFromEndpoint(hubEndpoint(state))
          );
        }
        state.userName = userName;
      }
      state.lastAuthCode = code;
      if (!code) {
        setConnection(state, 'disconnected', 'Authenticate failed');
        return;
      }

      console.info(`${LOG_PREFIX} auto-connect: authorize`);
      setConnection(state, 'connecting', 'Getting token');
      const authCode = state.lastAuthCode;
      state.lastAuthCode = '';
      const ok = await client.getToken(authCode);
      if (!ok) {
        setConnection(state, 'disconnected', 'Token failed');
        return;
      }
    }

    if (state.topic) client.setTopic(state.topic);

    const session = client.getSessionConfig();
    if (session.subscriberName) state.subscriberName = session.subscriberName;
    if (session.topic) state.topic = session.topic;
    const alignedUser =
      String(session.userName || '').trim() ||
      String(state.topic || '').trim() ||
      storedUserName;
    if (alignedUser && !state.freshUser) {
      state.userName = alignedUser;
      client.setUserName(alignedUser);
      const startedAt =
        state.hubStartedAt || (await fetchHubStartedAt(hubEndpoint(state)));
      if (startedAt) state.hubStartedAt = startedAt;
      setStoredUserName(
        alignedUser,
        startedAt,
        hubOriginFromEndpoint(hubEndpoint(state))
      );
    } else if (alignedUser && state.freshUser) {
      state.userName = alignedUser;
      client.setUserName(alignedUser);
    }
    notifyStatus(state);

    console.info(`${LOG_PREFIX} auto-connect: subscribe`);
    const status = await client.subscribe();
    if (status === 202) {
      setConnection(state, 'connected', 'Websocket connected');
      console.info(
        `${LOG_PREFIX} auto-connect done topic=`,
        state.topic,
        'user=',
        state.userName
      );
      void refreshReportContextFromStatus(state);
    } else {
      setConnection(
        state,
        'disconnected',
        `Subscribe failed (${String(status)})`
      );
    }
  } catch (err) {
    console.error(`${LOG_PREFIX} auto-connect failed`, err);
    setConnection(
      state,
      'error',
      err instanceof Error ? err.message : String(err)
    );
  }
}
