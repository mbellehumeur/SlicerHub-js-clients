import HubClient, {
  buildDicomUrlImagingStudyOpenContext,
  buildDicomwebImagingStudyOpenContext,
  buildFilesImagingStudyOpenContext,
  buildLocalDicomImagingStudyOpenContext,
  HUB_OPEN_MODE_DICOM_URL,
  HUB_OPEN_MODE_DICOMWEB,
  HUB_OPEN_MODE_IDC,
  HUB_OPEN_MODE_LOCAL_DICOM,
  HUB_REPORTING_WINDOW_NAME,
  HUB_CLASSROOM_WINDOW_NAME,
  hubReportingPopupFeatures,
  castReportingPopupPlacement,
  cloneContextArray,
  extractVolviewSampleId,
  generateSubscriberName,
  getHubEventLower,
  inferenceServerInfoText,
  isRequestEvent,
  isRunningInCloud,
  mapInferenceServersFromStatusResult,
  matchesHubProduct,
  messageActor,
  messageEventContext,
  messageProductName,
  messageSubscriberName,
  parseCollatedRequestResult,
  placeHubPopupWindow,
  requestCastLiveScene,
  requestCastStatus,
  requestEventFor,
  resolveHubConferenceView,
  resolveHubAdminUrl,
  selectFirstMatchingHubKey,
  showHubInfoToast,
  type CastConferenceView,
} from '@slicer-hub/client';
import {
  SKIP_STUDY_RELOAD_TOAST,
  sameOpenImagingStudyContext,
} from '@slicer-hub/context-identity';
import {
  clearStoredUserName,
  EMPTY_CAST_CONTEXT,
  fetchHubStartedAt,
  getHubDefinitions,
  getStoredUserHubOrigin,
  getStoredUserHubStartedAt,
  getStoredUserName,
  HubKey,
  hubOriginFromEndpoint,
  IMAGE_DISPLAY_ACTOR,
  LOG_PREFIX,
  PATIENT_REFERENCE,
  PRODUCT_NAME,
  resolveHubMirrorUrl,
  resolveViewerUrls,
  setStoredUserName,
  SUBSCRIBE_EVENTS,
  VIEWER_OPEN_TITLE_IRA,
  VIEWER_OPEN_TITLE_DISABLED,
  VIEWER_OPEN_TITLE_REPORTING,
  VIEWER_OPEN_TITLE_CLASSROOM,
  VIEWER_OPEN_TITLE_SCENEVIEWS,
  VIEWER_OPEN_TITLE_SEGROULETTE,
  VIEWER_OPEN_TITLE_HUB_MIRROR,
  VIEWER_OPEN_TITLE_HUB_MIRROR_ACTIVE,
  VIEWER_OPEN_TITLE_SLICER,
  VIEWER_OPEN_TITLE_SLICER_INACTIVE,
  ViewerKind,
  WORKLIST_ACTOR,
  WORKLIST_ORG_IDC_SEG,
  WORKLIST_ORG_IDC_WSI,
  WORKLIST_ORG_MINE,
  WORKLIST_ORG_SLICER_SCENES,
  WORKLIST_ORG_CBCT_DENTAL,
  WORKLIST_ORG_TXRV,
  WORKLIST_ORG_3D_SLICER,
} from './config';
import { conferenceStrings } from './i18n';
import {
  INFERENCE_SERVERS,
  LOCAL_AI_WORKLIST_SERVERS,
} from './inference-servers';
import {
  buildIdcDirectImagingStudyOpenContext,
  attachImagingStudyDescription,
  attachImagingStudyModality,
  attachLiveSceneToContext,
  findWorklistSample,
  isDicomwebWorklistSample,
  isWorklistSampleActionDisabled,
  addSampleToMyWorklist,
  isSampleInMyWorklist,
  liveSceneDocFromSample,
  loadCbctDentalStudies,
  loadTxrvStudies,
  loadIdcSegmentationStudies,
  loadIdcWsiStudies,
  loadSlicerSceneStudies,
  replaceCbctDentalStudies,
  replaceTxrvStudies,
  replaceIdcSegmentationStudies,
  replaceIdcWsiStudies,
  replaceSlicerSceneStudies,
  replaceSlicerDicomStudies,
  worklistSamplesFromSlicerStatusStudies,
  segrouletteSampleId,
  upsertSegrouletteSample,
  worklistSampleFiles,
  worklistSampleFromSegrouletteEntry,
  type WorklistSample,
} from './samples';
import { loadSegrouletteCatalog, type SegrouletteEntry } from './segroulette-catalog';

export type ConnectionUiState =
  | 'idle'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

export type ConnectedAppInfo = {
  productName: string;
  /** IHE / Hub actor from STATUS (e.g. ID). */
  actor: string;
};

export type AppState = {
  client: ReturnType<typeof HubClient.newInstance> | null;
  hubKey: HubKey;
  topic: string;
  subscriberName: string;
  userName: string;
  /** When true, skip localStorage identity so this tab gets a new hub user/topic. */
  freshUser: boolean;
  hubStartedAt: string;
  lastAuthCode: string;
  lastImagingStudyOpenContext: unknown[];
  openWorklistSampleId: string | null;
  allStudies: WorklistSample[];
  connection: ConnectionUiState;
  connectionDetail: string;
  /** Active Hub conference roster (LiveScene-aligned places view). */
  conference: CastConferenceView | null;
  /** When true, apply inbound ImagingStudy-open from conference host. */
  conferenceFollowHost: boolean;
  /**
   * Explicit invite decision: null = unset (default follow when roster says following).
   */
  conferenceFollowChoice: boolean | null;
  /** Peers that sent STATUS requests; keyed by subscriber.name. */
  connectedApps: Map<string, ConnectedAppInfo>;
  /** Inference product online state from outbound STATUS probe; keyed by server id. */
  inferenceStatus: Map<string, 'online' | 'offline' | 'unknown'>;
  /**
   * True after STATUS responses included a Slicer ``studies`` array (even empty).
   * Prevents a second status-request when startup probe already delivered the list.
   */
  slicerStudiesFromStatus: boolean;
};

export type DomRefs = {
  statusBtn: HTMLButtonElement;
  statusWrap: HTMLElement;
  statusMenu: HTMLElement;
  sessionModal: HTMLElement;
  sessionDl: HTMLElement;
  helpModal: HTMLElement;
  orgSelect: HTMLSelectElement;
  tableBody: HTMLElement;
  emptyRow: HTMLElement;
};

type StatusListener = (state: AppState) => void;
type WorklistListener = (state: AppState) => void;

let onStatusChange: StatusListener | null = null;
let onWorklistChange: WorklistListener | null = null;

/** First-Open glow: on until the user changes worklist or uses Open. */
let openStartHintDismissed = false;

export function dismissOpenStartHint(): void {
  openStartHintDismissed = true;
}

export function shouldShowOpenStartHint(state: AppState): boolean {
  return (
    !openStartHintDismissed && !state.lastImagingStudyOpenContext.length
  );
}

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
  const freshUser =
    params.get('freshUser') === '1' || params.get('freshUser') === 'true';

  return {
    client: null,
    hubKey: resolvedKey,
    topic: freshUser ? '' : params.get('topic') || '',
    subscriberName: generateSubscriberName(PRODUCT_NAME),
    userName: freshUser ? '' : getStoredUserName(),
    freshUser,
    hubStartedAt: '',
    lastAuthCode: '',
    lastImagingStudyOpenContext: [],
    openWorklistSampleId: null,
    allStudies: [],
    connection: 'idle',
    connectionDetail: 'Not connected',
    conference: null,
    conferenceFollowHost: false,
    conferenceFollowChoice: null,
    connectedApps: new Map(),
    inferenceStatus: new Map(),
    slicerStudiesFromStatus: false,
  };
}

export function setStatusListener(fn: StatusListener): void {
  onStatusChange = fn;
}

export function setWorklistListener(fn: WorklistListener): void {
  onWorklistChange = fn;
}

function notifyStatus(state: AppState): void {
  onStatusChange?.(state);
}

function notifyWorklist(state: AppState): void {
  onWorklistChange?.(state);
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
    clearConnectedApps(state);
    clearInferenceStatus(state);
    setConferenceView(state, null);
  }
  notifyStatus(state);
  if (connection === 'connected') {
    void syncConferenceView(state);
    void probeTopicStatus(state);
  }
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

export function connectedActorsFromState(state: AppState): string[] {
  const actors: string[] = [];
  const seen = new Set<string>();
  for (const info of state.connectedApps.values()) {
    const actor = String(info.actor || '').trim();
    if (!actor || seen.has(actor)) continue;
    seen.add(actor);
    actors.push(actor);
  }
  return actors;
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

const CONNECTED_PRODUCT_BUTTONS: Array<{
  id: string;
  match: (product: string) => boolean;
}> = [
  {
    id: 'openIraBtn',
    match: (p) => matchesHubProduct(p, 'ira'),
  },
  {
    id: 'openOhifBtn',
    match: (p) => matchesHubProduct(p, 'ohif'),
  },
  {
    id: 'openVolviewBtn',
    match: (p) => matchesHubProduct(p, 'volview'),
  },
  {
    id: 'openSlicerBtn',
    match: (p) => matchesHubProduct(p, 'slicer'),
  },
  {
    id: 'openHubMirrorBtn',
    match: (p) => matchesHubProduct(p, 'hubMirror'),
  },
  {
    // UI label is "DICOM SR"
    id: 'openReportingBtn',
    match: (p) => matchesHubProduct(p, 'reporting'),
  },
  {
    // UI label is "ST-444"
    id: 'openSt444Btn',
    match: (p) => matchesHubProduct(p, 'classroom'),
  },
];

/** No delay: drop peers as soon as subscription-removed arrives. */
const CONNECTED_APP_REMOVAL_GRACE_MS = 0;
const connectedAppRemovalTimers = new Map<string, number>();

function cancelConnectedAppRemoval(subscriber: string): void {
  const timer = connectedAppRemovalTimers.get(subscriber);
  if (timer !== undefined) {
    globalThis.clearTimeout(timer);
    connectedAppRemovalTimers.delete(subscriber);
  }
}

function clearConnectedAppRemovalTimers(): void {
  for (const timer of connectedAppRemovalTimers.values()) {
    globalThis.clearTimeout(timer);
  }
  connectedAppRemovalTimers.clear();
}

function clearConnectedApps(state: AppState): void {
  clearConnectedAppRemovalTimers();
  const hadSlicer = hasConnectedThreeDSlicer(state);
  state.slicerStudiesFromStatus = false;
  if (state.connectedApps.size === 0) {
    updateConnectedAppButtons(state);
    if (hadSlicer) onThreeDSlicerDisconnected(state);
    return;
  }
  state.connectedApps.clear();
  updateConnectedAppButtons(state);
  if (hadSlicer) onThreeDSlicerDisconnected(state);
}

function markConnectedApp(
  state: AppState,
  message: Record<string, unknown>
): void {
  const subscriber = messageSubscriberName(message);
  if (!subscriber) return;
  const productName = messageProductName(message);
  upsertConnectedApp(state, {
    subscriber,
    productName,
    actor: messageActor(message),
  });
  if (matchesHubProduct(productName, 'slicer')) {
    selectThreeDSlicerOrg();
  }
}

function upsertConnectedApp(
  state: AppState,
  info: { subscriber: string; productName: string; actor: string }
): void {
  const subscriber = String(info.subscriber || '').trim();
  if (!subscriber) return;
  const productName = String(info.productName || '').trim();
  const productKey = productName.toUpperCase();
  const actor = String(info.actor || '').trim();

  // Reload/reconnect uses a new subscriber name — drop prior peers for same product.
  if (productKey) {
    for (const [name, existing] of state.connectedApps) {
      if (
        name !== subscriber &&
        existing.productName.trim().toUpperCase() === productKey
      ) {
        cancelConnectedAppRemoval(name);
        state.connectedApps.delete(name);
      }
    }
  }

  cancelConnectedAppRemoval(subscriber);
  state.connectedApps.set(subscriber, {
    productName,
    actor,
  });
  updateConnectedAppButtons(state);
}

function isPresenceStatusResponder(actor: string, productName: string): boolean {
  const actorKey = actor.trim().toUpperCase();
  if (
    actorKey === IMAGE_DISPLAY_ACTOR ||
    actorKey === 'REPORTING_CLIENT'
  ) {
    return true;
  }
  return CONNECTED_PRODUCT_BUTTONS.some((entry) => entry.match(productName));
}

function applyConnectedAppsFromStatusResponses(
  state: AppState,
  responses: Array<Record<string, unknown>>
): void {
  for (const item of responses) {
    const subscriber = String(item.subscriber ?? '').trim();
    const productName = String(item.productName ?? '').trim();
    const actor = String(item.actor ?? '').trim();
    const data = item.data;
    const dataProduct =
      data && typeof data === 'object'
        ? String((data as { product?: unknown }).product ?? '').trim()
        : '';
    const resolvedProduct = productName || dataProduct;
    if (!subscriber) continue;
    if (!isPresenceStatusResponder(actor, resolvedProduct)) continue;
    upsertConnectedApp(state, {
      subscriber,
      productName: resolvedProduct,
      actor,
    });
    if (matchesHubProduct(resolvedProduct, 'slicer')) {
      selectThreeDSlicerOrg();
    }
  }
}

function selectThreeDSlicerOrg(): void {
  const orgSelect = document.getElementById(
    'worklistOrgSelect'
  ) as HTMLSelectElement | null;
  if (!orgSelect) return;
  orgSelect.value = WORKLIST_ORG_3D_SLICER;
}

function defaultWorklistOrgFilter(): string {
  return 'idc-category:LIVER:CT';
}

function selectDefaultWorklistOrg(): void {
  const orgSelect = document.getElementById(
    'worklistOrgSelect'
  ) as HTMLSelectElement | null;
  if (!orgSelect) return;
  orgSelect.value = defaultWorklistOrgFilter();
}

/** Drop Slicer DICOM rows and restore the default worklist filter. */
function onThreeDSlicerDisconnected(state: AppState): void {
  state.slicerStudiesFromStatus = false;
  state.allStudies = replaceSlicerDicomStudies(state.allStudies, []);
  selectDefaultWorklistOrg();
  notifyWorklist(state);
}

/**
 * Adopt Slicer DICOM worklist rows from STATUS ``data.studies``.
 * Returns true when a Slicer response included the ``studies`` field
 * (including an empty array), so callers can skip a redundant probe.
 */
function adoptSlicerStudiesFromStatusResponses(
  state: AppState,
  responses: Array<Record<string, unknown>>
): boolean {
  for (const item of responses) {
    const productName = String(item.productName ?? '').trim();
    const data = item.data;
    if (!data || typeof data !== 'object') continue;
    const dataObj = data as { product?: unknown; studies?: unknown };
    const resolvedProduct =
      productName || String(dataObj.product ?? '').trim();
    if (!matchesHubProduct(resolvedProduct, 'slicer')) continue;
    if (!('studies' in dataObj)) continue;

    const samples = worklistSamplesFromSlicerStatusStudies(dataObj.studies);
    state.allStudies = replaceSlicerDicomStudies(state.allStudies, samples);
    state.slicerStudiesFromStatus = true;
    selectThreeDSlicerOrg();
    notifyWorklist(state);
    console.info(
      `${LOG_PREFIX} STATUS adopted 3D Slicer studies`,
      `count=${samples.length}`
    );
    return true;
  }
  return false;
}

function hasConnectedThreeDSlicer(state: AppState): boolean {
  return [...state.connectedApps.values()].some((info) =>
    matchesHubProduct(info.productName, 'slicer')
  );
}

function hasConnectedIra(state: AppState): boolean {
  return [...state.connectedApps.values()].some((info) =>
    matchesHubProduct(info.productName, 'ira')
  );
}

function hasConnectedHubMirror(state: AppState): boolean {
  return [...state.connectedApps.values()].some((info) =>
    matchesHubProduct(info.productName, 'hubMirror')
  );
}

function hasConnectedReporting(state: AppState): boolean {
  return [...state.connectedApps.values()].some((info) =>
    matchesHubProduct(info.productName, 'reporting')
  );
}

function hasConnectedClassroom(state: AppState): boolean {
  return [...state.connectedApps.values()].some((info) =>
    matchesHubProduct(info.productName, 'classroom')
  );
}

function openSlicerButtonTitle(hubOn: boolean, slicerOn: boolean): string {
  if (!hubOn) return VIEWER_OPEN_TITLE_DISABLED;
  if (!slicerOn) return VIEWER_OPEN_TITLE_SLICER_INACTIVE;
  return VIEWER_OPEN_TITLE_SLICER;
}

function openHubMirrorButtonTitle(
  hubOn: boolean,
  slicerOn: boolean,
  hubMirrorOn: boolean
): string {
  if (!hubOn) return VIEWER_OPEN_TITLE_DISABLED;
  if (!slicerOn) return VIEWER_OPEN_TITLE_SLICER_INACTIVE;
  if (hubMirrorOn) return VIEWER_OPEN_TITLE_HUB_MIRROR_ACTIVE;
  return VIEWER_OPEN_TITLE_HUB_MIRROR;
}

function setSlicerDependentViewerButton(
  id: string,
  canOpen: boolean,
  title: string
): void {
  const btn = document.getElementById(id) as HTMLButtonElement | null;
  if (!btn) return;
  btn.disabled = !canOpen;
  if (canOpen) btn.removeAttribute('disabled');
  else btn.setAttribute('disabled', '');
  btn.title = title;
}

function maybeProbeForSlicerStudies(state: AppState): void {
  if (state.slicerStudiesFromStatus) return;
  if (state.connection !== 'connected') return;
  if (!hasConnectedThreeDSlicer(state)) return;
  void probeTopicStatus(state);
}

function applyLocalImagingStudyContext(
  state: AppState,
  context: unknown[]
): void {
  state.lastImagingStudyOpenContext = cloneContextArray(context);
  syncOpenSampleId(state);
  notifyWorklist(state);
}

function clearLocalImagingStudyContext(state: AppState): void {
  if (
    !state.lastImagingStudyOpenContext.length &&
    !state.openWorklistSampleId
  ) {
    return;
  }
  state.lastImagingStudyOpenContext = [];
  state.openWorklistSampleId = null;
  notifyWorklist(state);
}

function isStatusContextDonorActor(actor: string): boolean {
  const key = actor.trim().toUpperCase();
  return key === IMAGE_DISPLAY_ACTOR || key === 'REPORTING_CLIENT';
}

/** Apply ImagingStudy from ID / reporting STATUS locally — no ImagingStudy-open publish. */
function adoptImagingStudyFromStatusResponses(
  state: AppState,
  responses: Array<Record<string, unknown>>
): void {
  if (state.lastImagingStudyOpenContext.length) return;

  for (const item of responses) {
    const actor = String(item.actor ?? '').trim();
    if (!isStatusContextDonorActor(actor)) continue;
    const itemData = item.data as
      | { 'context.type'?: unknown; context?: unknown }
      | undefined;
    if (!itemData || typeof itemData !== 'object') continue;

    if (itemData['context.type'] === 'ImagingStudy') {
      const context = cloneContextArray(itemData.context);
      if (!context.length) {
        // Peer reports ImagingStudy type but empty — treat as locally closed.
        clearLocalImagingStudyContext(state);
        console.info(
          `${LOG_PREFIX} STATUS: empty ImagingStudy from ${actor} — cleared local open`
        );
        return;
      }
      applyLocalImagingStudyContext(state, context);
      console.info(
        `${LOG_PREFIX} STATUS adopted ImagingStudy from ${actor}`,
        `items=${context.length}`,
        '(local only, not published)'
      );
      return;
    }
  }
}

function removeConnectedApp(
  state: AppState,
  message: Record<string, unknown>
): boolean {
  const subscriber = messageSubscriberName(message);
  if (!subscriber || !state.connectedApps.has(subscriber)) return false;

  cancelConnectedAppRemoval(subscriber);
  const timer = globalThis.setTimeout(() => {
    connectedAppRemovalTimers.delete(subscriber);
    if (!state.connectedApps.has(subscriber)) return;
    state.connectedApps.delete(subscriber);
    updateConnectedAppButtons(state);
    if (!hasConnectedThreeDSlicer(state)) {
      onThreeDSlicerDisconnected(state);
    }
    if (
      state.connectedApps.size === 0 &&
      state.lastImagingStudyOpenContext.length > 0
    ) {
      // No peers left to receive ImagingStudy-close — clear local open state only.
      state.lastImagingStudyOpenContext = [];
      state.openWorklistSampleId = null;
      notifyWorklist(state);
    }
  }, CONNECTED_APP_REMOVAL_GRACE_MS);
  connectedAppRemovalTimers.set(subscriber, timer);
  return true;
}

export function updateConnectedAppButtons(state: AppState): void {
  const products = new Set(
    [...state.connectedApps.values()]
      .map((info) => info.productName.trim().toUpperCase())
      .filter(Boolean)
  );
  for (const { id, match } of CONNECTED_PRODUCT_BUTTONS) {
    const btn = document.getElementById(id);
    if (!btn) continue;
    const connected = [...products].some((p) => match(p));
    btn.classList.toggle('wl-viewer-btn-connected', connected);
  }
  // Enable when Image Display is connected (same gate for web mirror launch).
  const hubOn = state.connection === 'connected';
  const slicerOn = hasConnectedThreeDSlicer(state);
  const hubMirrorOn = hasConnectedHubMirror(state);
  const canOpen = hubOn && slicerOn;
  setSlicerDependentViewerButton(
    'openSlicerBtn',
    canOpen,
    openSlicerButtonTitle(hubOn, slicerOn)
  );
  setSlicerDependentViewerButton(
    'openHubMirrorBtn',
    canOpen,
    openHubMirrorButtonTitle(hubOn, slicerOn, hubMirrorOn)
  );
  updateInferenceServerButtons(state);
}

function updateInferenceServerButtons(state: AppState): void {
  for (const server of INFERENCE_SERVERS) {
    const btn = document.getElementById(
      server.worklistButtonId
    ) as HTMLButtonElement | null;
    if (!btn) continue;
    const status = state.inferenceStatus.get(server.id) || 'unknown';
    const online = status === 'online';
    btn.classList.toggle('wl-viewer-btn-connected', online && !btn.disabled);
    const label =
      status === 'online'
        ? 'Online'
        : status === 'offline'
          ? 'Offline'
          : undefined;
    btn.title = inferenceServerInfoText(server, label);
  }
}

function clearInferenceStatus(state: AppState): void {
  state.inferenceStatus.clear();
  updateInferenceServerButtons(state);
}

async function probeTopicStatus(state: AppState): Promise<void> {
  if (!state.client || state.connection !== 'connected') return;
  const subscriber =
    state.subscriberName ||
    state.client.getSessionConfig()?.subscriberName?.trim() ||
    '';
  if (!subscriber) return;
  try {
    const result = await requestCastStatus(state.client, {
      subscriberName: subscriber,
      subscriberProductName: PRODUCT_NAME,
      subscriberActor: WORKLIST_ACTOR,
      topic: state.topic || undefined,
      targetActor: '*',
    });
    if (state.connection !== 'connected') return;

    const mapped = mapInferenceServersFromStatusResult(result);
    for (const { server, probe } of mapped) {
      state.inferenceStatus.set(server.id, probe.online ? 'online' : 'offline');
    }

    const requestResult =
      result && typeof result === 'object'
        ? (result as { ok?: boolean; data?: unknown })
        : {};
    const envelope =
      requestResult.ok !== false
        ? parseCollatedRequestResult(requestResult.data)
        : parseCollatedRequestResult(null);
    applyConnectedAppsFromStatusResponses(state, envelope.responses);
    updateInferenceServerButtons(state);
    adoptImagingStudyFromStatusResponses(state, envelope.responses);
    adoptSlicerStudiesFromStatusResponses(state, envelope.responses);

    const online = mapped
      .filter((r) => r.probe.online)
      .map((r) => r.server.title);
    const presence = [...state.connectedApps.values()]
      .map((info) => info.productName || info.actor)
      .filter(Boolean);
    console.info(
      `${LOG_PREFIX} STATUS probe:`,
      online.length ? `AI ${online.join(', ')}` : 'no AI online',
      presence.length ? `peers ${presence.join(', ')}` : 'no peers'
    );
  } catch (err) {
    console.warn(`${LOG_PREFIX} STATUS probe failed`, err);
  }
}

function handleImagingStudyMessage(
  state: AppState,
  message: Record<string, unknown>
): boolean {
  const event = message?.event as { 'hub.event'?: string } | undefined;
  const name = getHubEventLower(event);
  if (name === 'imagingstudy-close') {
    state.lastImagingStudyOpenContext = [];
    state.openWorklistSampleId = null;
    notifyWorklist(state);
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
  syncOpenSampleId(state);
  notifyWorklist(state);
  if (state.conference && state.conferenceFollowHost) {
    console.info(
      `${LOG_PREFIX} conference follow: ImagingStudy-open → ensure IRA (no button)`
    );
    ensureSlicerLiveViewer(state, { reason: 'conference-follow' });
  }
  return true;
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
  const keyword = String(actor).trim();
  return keyword ? [keyword] : [];
}

function syncOpenSampleId(state: AppState): void {
  if (!state.lastImagingStudyOpenContext.length) {
    state.openWorklistSampleId = null;
    return;
  }
  state.openWorklistSampleId =
    extractVolviewSampleId(state.lastImagingStudyOpenContext) || null;
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

function iraPopupPlacement(): {
  width: number;
  height: number;
  left: number;
  top: number;
} {
  // SlicerLive (IRA): ~1.6× wider and ~35% taller than the default viewer popup.
  const width = 1280;
  const height = 810;
  const gap = 16;
  const availLeft = Number(window.screen.availLeft) || 0;
  const availTop = Number(window.screen.availTop) || 0;
  const availW = window.screen.availWidth || window.screen.width;
  const availH = window.screen.availHeight || window.screen.height;
  const openerLeft = window.screenX ?? window.screenLeft ?? 0;
  const openerTop = window.screenY ?? window.screenTop ?? 0;
  const openerW = window.outerWidth || 800;
  const openerH = window.outerHeight || 600;

  // Prefer left of the worklist; then right; then below — never centered on top of it.
  let left = openerLeft - width - gap;
  let top = openerTop;
  if (left < availLeft) {
    left = openerLeft + openerW + gap;
  }
  if (left + width > availLeft + availW) {
    left = Math.min(
      Math.max(availLeft, openerLeft),
      availLeft + availW - width
    );
    top = openerTop + openerH + gap;
  }
  if (top + height > availTop + availH) {
    top = Math.max(availTop, availTop + availH - height);
  }
  left = Math.max(availLeft, Math.min(left, availLeft + availW - width));
  top = Math.max(availTop, Math.min(top, availTop + availH - height));
  return {
    width,
    height,
    left: Math.floor(left),
    top: Math.floor(top),
  };
}

/**
 * DICOM SR popup placement — to the right of IRA (10% overlap) when IRA is open,
 * otherwise relative to this worklist window. Shared helper in @slicer-hub/client.
 */
function reportingPopupPlacement(): {
  width: number;
  height: number;
  left: number;
  top: number;
} {
  if (slicerLiveWindow && !slicerLiveWindow.closed) {
    try {
      const w = slicerLiveWindow.outerWidth || 0;
      const h = slicerLiveWindow.outerHeight || 0;
      if (w > 0 && h > 0) {
        return castReportingPopupPlacement({
          left: slicerLiveWindow.screenX ?? slicerLiveWindow.screenLeft ?? 0,
          top: slicerLiveWindow.screenY ?? slicerLiveWindow.screenTop ?? 0,
          width: w,
          height: h,
        });
      }
    } catch {
      /* cross-origin */
    }
  }
  return castReportingPopupPlacement();
}

function placePopupWindow(
  win: Window,
  place: { width: number; height: number; left: number; top: number }
): void {
  placeHubPopupWindow(win, place);
}

function placeSlicerLiveWindow(win: Window): void {
  placePopupWindow(win, iraPopupPlacement());
}

const REPORTING_WINDOW_NAME = HUB_REPORTING_WINDOW_NAME;
const CLASSROOM_WINDOW_NAME = HUB_CLASSROOM_WINDOW_NAME;

let slicerLiveWindow: Window | null = null;
let reportingWindow: Window | null = null;
let classroomWindow: Window | null = null;

function iraWindowName(state: AppState): string {
  return `hubViewer-ira-${String(state.topic || 'anon').replace(/[^\w.-]+/g, '_')}`;
}

function hasOpenSlicerLive(): boolean {
  return Boolean(slicerLiveWindow && !slicerLiveWindow.closed);
}

/**
 * Focus an already-open IRA tab. Prefer our Window handle; otherwise reclaim by
 * the named hubViewer-ira-* window (no navigation).
 */
function focusExistingSlicerLiveWindow(state: AppState): boolean {
  if (slicerLiveWindow && !slicerLiveWindow.closed) {
    try {
      slicerLiveWindow.focus();
    } catch {
      /* ignore */
    }
    return true;
  }
  slicerLiveWindow = null;
  let existing: Window | null = null;
  try {
    existing = window.open('', iraWindowName(state));
  } catch {
    return false;
  }
  if (!existing || existing.closed) return false;
  try {
    const href = String(existing.location?.href || '');
    if (!href || href === 'about:blank') return false;
  } catch {
    // Cross-origin IRA tab — still focus if we got a handle.
  }
  try {
    existing.focus();
  } catch {
    /* ignore */
  }
  slicerLiveWindow = existing;
  return true;
}

function viewerPopupFeatures(kind: ViewerKind): string {
  const place =
    kind === 'reporting' || kind === 'classroom'
      ? reportingPopupPlacement()
      : kind === 'ira'
        ? iraPopupPlacement() // hub-mirror still uses IRA-sized popup placement
        : {
            width: 800,
            height: 600,
            left: Math.max(0, Math.floor((window.screen.width - 800) / 2)),
            top: Math.max(0, Math.floor((window.screen.height - 600) / 2)),
          };
  if (kind === 'ohif') {
    const gap = 16;
    const pairWidth = place.width * 2 + gap;
    const pairStart = Math.max(
      0,
      Math.floor((window.screen.width - pairWidth) / 2)
    );
    place.left = pairStart + place.width + gap;
  }
  const parts = [
    'popup',
    `width=${place.width}`,
    `height=${place.height}`,
    `left=${place.left}`,
    `top=${place.top}`,
  ];
  // Keep a Window handle for reporting / classroom (and hub-mirror via 'ira' placement).
  if (kind !== 'reporting' && kind !== 'classroom' && kind !== 'ira') {
    parts.push('noopener', 'noreferrer');
  }
  return parts.join(',');
}

/**
 * Focus DICOM SR only if this page already holds a live Window handle.
 * Used after segment growth (no user gesture for a fresh open).
 */
function focusExistingReportingWindow(): boolean {
  if (!reportingWindow || reportingWindow.closed) {
    reportingWindow = null;
    return false;
  }
  try {
    reportingWindow.focus();
  } catch {
    /* ignore */
  }
  return true;
}

/** Reclaim hubViewer-reporting by name (no navigation / no popup features). */
function reclaimReportingWindowByName(): boolean {
  let existing: Window | null = null;
  try {
    existing = window.open('', REPORTING_WINDOW_NAME);
  } catch {
    return false;
  }
  if (!existing || existing.closed) return false;
  let blank = false;
  try {
    const href = String(existing.location?.href || '');
    blank = !href || href === 'about:blank';
  } catch {
    // Cross-origin reporting — still focus if we got a handle.
  }
  if (blank) {
    try {
      existing.close();
    } catch {
      /* ignore */
    }
    return false;
  }
  try {
    existing.focus();
  } catch {
    /* ignore */
  }
  reportingWindow = existing;
  return true;
}

function openReportingViewer(state: AppState): void {
  if (focusExistingReportingWindow()) return;

  // Already on this topic (e.g. opened from IRA) — focus only, never another popup.
  if (hasConnectedReporting(state)) {
    reclaimReportingWindowByName();
    return;
  }

  const url = new URL(resolveViewerUrls().reporting);
  if (state.topic) {
    url.searchParams.set('topic', state.topic);
  }
  const token = state.client?.getConnectionState?.()?.token?.trim();
  if (token) {
    url.searchParams.set('id-token', token);
  }
  const place = reportingPopupPlacement();
  // One open() only — named window reuses an existing hubViewer-reporting if any.
  const win = window.open(
    url.toString(),
    REPORTING_WINDOW_NAME,
    viewerPopupFeatures('reporting')
  );
  if (!win) return;
  reportingWindow = win;
  placePopupWindow(win, place);
}

function focusExistingClassroomWindow(): boolean {
  if (!classroomWindow || classroomWindow.closed) {
    classroomWindow = null;
    return false;
  }
  try {
    classroomWindow.focus();
  } catch {
    /* ignore */
  }
  return true;
}

function reclaimClassroomWindowByName(): boolean {
  let existing: Window | null = null;
  try {
    existing = window.open('', CLASSROOM_WINDOW_NAME);
  } catch {
    return false;
  }
  if (!existing || existing.closed) return false;
  let blank = false;
  try {
    const href = String(existing.location?.href || '');
    blank = !href || href === 'about:blank';
  } catch {
    /* cross-origin */
  }
  if (blank) {
    try {
      existing.close();
    } catch {
      /* ignore */
    }
    return false;
  }
  try {
    existing.focus();
  } catch {
    /* ignore */
  }
  classroomWindow = existing;
  return true;
}

function openClassroomViewer(state: AppState): void {
  if (focusExistingClassroomWindow()) return;

  if (hasConnectedClassroom(state)) {
    reclaimClassroomWindowByName();
    return;
  }

  const url = new URL(resolveViewerUrls().classroom);
  if (state.topic) {
    url.searchParams.set('topic', state.topic);
  }
  const token = state.client?.getConnectionState?.()?.token?.trim();
  if (token) {
    url.searchParams.set('id-token', token);
  }
  const place = reportingPopupPlacement();
  const win = window.open(
    url.toString(),
    CLASSROOM_WINDOW_NAME,
    viewerPopupFeatures('classroom')
  );
  if (!win) return;
  classroomWindow = win;
  placePopupWindow(win, place);
}

export function openHubViewer(state: AppState, kind: ViewerKind): boolean {
  if (kind === 'reporting') {
    openReportingViewer(state);
    return true;
  }
  if (kind === 'classroom') {
    openClassroomViewer(state);
    return true;
  }
  const url = new URL(resolveViewerUrls()[kind]);
  if (state.topic) {
    url.searchParams.set('topic', state.topic);
  }
  const token = state.client?.getConnectionState?.()?.token?.trim();
  if (token) {
    url.searchParams.set('id-token', token);
  }
  if (kind === 'ira' && state.conference) {
    if (state.conferenceFollowChoice === false) {
      url.searchParams.set('followHost', '0');
    } else if (state.conferenceFollowHost) {
      url.searchParams.set('followHost', '1');
    }
  }
  // IRA: normal browser tab (no popup features). Named per Hub topic so two
  // worklist users in the same browser each keep their own IRA tab.
  if (kind === 'ira') {
    if (focusExistingSlicerLiveWindow(state)) return true;
    const iraName = iraWindowName(state);
    const win = window.open(url.toString(), iraName);
    if (win) {
      slicerLiveWindow = win;
      try {
        win.focus();
      } catch {
        /* ignore */
      }
      return true;
    }
    console.warn(
      `${LOG_PREFIX} IRA window.open blocked (popup blocker or no user gesture)`
    );
    showHubInfoToast(
      'Browser blocked opening SlicerLive — click SlicerLive or allow popups'
    );
    return false;
  }
  window.open(
    url.toString(),
    `hubViewer-${kind}`,
    viewerPopupFeatures(kind)
  );
  return true;
}

/**
 * Open hub-mirror LiveScene stream when 3D Slicer Image Display is connected.
 * LiveSync rides Hub scene-update; bulk via hub ImagingStudy-open payloads.
 */
export function openHubMirrorViewer(state: AppState): void {
  if (state.connection !== 'connected' || !state.client) {
    console.warn(`${LOG_PREFIX} hub-mirror skipped: not connected`);
    return;
  }
  if (!hasConnectedThreeDSlicer(state)) {
    console.warn(`${LOG_PREFIX} hub-mirror skipped: 3D Slicer not connected`);
    return;
  }
  const url = new URL(resolveHubMirrorUrl());
  if (state.topic) {
    url.searchParams.set('topic', state.topic);
  }
  const token = state.client.getConnectionState?.()?.token?.trim();
  if (token) {
    url.searchParams.set('id-token', token);
  }
  const win = window.open(
    url.toString(),
    'hubViewer-hub-mirror',
    viewerPopupFeatures('ira')
  );
  if (win) {
    slicerLiveWindow = win;
    placeSlicerLiveWindow(win);
  }
}

/**
 * Auto-open IRA (Viewers → SlicerLive) after ImagingStudy-open when no image
 * display is already active. Skips when desktop 3D Slicer ID is connected.
 * If IRA is already connected or its tab is open, focus that tab.
 * @returns true if IRA is already available or a tab was opened/focused
 */
export function ensureSlicerLiveViewer(
  state: AppState,
  opts?: { reason?: string }
): boolean {
  const reason = opts?.reason || 'open';
  if (!state.client) {
    console.info(`${LOG_PREFIX} ensure IRA skip (${reason}): not connected`);
    return false;
  }
  if (hasConnectedThreeDSlicer(state)) {
    console.info(
      `${LOG_PREFIX} ensure IRA skip (${reason}): 3D Slicer ID connected`
    );
    return true;
  }
  if (hasConnectedIra(state) || hasOpenSlicerLive()) {
    if (focusExistingSlicerLiveWindow(state)) {
      console.info(
        `${LOG_PREFIX} ensure IRA (${reason}): focus existing SlicerLive tab`
      );
      return true;
    }
    // Presence says IRA is on-topic but we have no Window handle — open/focus by name.
    console.info(
      `${LOG_PREFIX} ensure IRA (${reason}): reclaim/open SlicerLive tab`
    );
    return openHubViewer(state, 'ira');
  }
  console.info(
    `${LOG_PREFIX} ensure IRA launch (${reason}): opening SlicerLive tab`
  );
  return openHubViewer(state, 'ira');
}

export function setViewerButtonsEnabled(
  enabled: boolean,
  state?: AppState
): void {
  const infoServers = [...INFERENCE_SERVERS, ...LOCAL_AI_WORKLIST_SERVERS];
  const inferenceTitles = new Map(
    infoServers.map((server) => [
      server.worklistButtonId,
      inferenceServerInfoText(server),
    ])
  );
  const inferenceButtonIds = new Set(
    infoServers.map((server) => server.worklistButtonId)
  );
  const buttons: Array<{ id: string; title: string }> = [
    { id: 'openReportingBtn', title: VIEWER_OPEN_TITLE_REPORTING },
    { id: 'openSt444Btn', title: VIEWER_OPEN_TITLE_CLASSROOM },
    { id: 'openSlicerBtn', title: VIEWER_OPEN_TITLE_SLICER },
    { id: 'openHubMirrorBtn', title: VIEWER_OPEN_TITLE_HUB_MIRROR },
    { id: 'openIraBtn', title: VIEWER_OPEN_TITLE_IRA },
    { id: 'openOhifBtn', title: 'OHIF' },
    { id: 'openSlimBtn', title: 'Slim' },
    { id: 'openVolviewBtn', title: 'VolView' },
    { id: 'openSceneviewsBtn', title: VIEWER_OPEN_TITLE_SCENEVIEWS },
    ...infoServers.map((server) => ({
      id: server.worklistButtonId,
      title: inferenceTitles.get(server.worklistButtonId) || server.title,
    })),
    { id: 'openSegrouletteBtn', title: VIEWER_OPEN_TITLE_SEGROULETTE },
    { id: 'endConferenceBtn', title: conferenceStrings().endConference },
    { id: 'startConferenceBtn', title: conferenceStrings().conferencing },
  ];
  const unavailable: Array<{ id: string; title: string }> = [
    { id: 'openFhirDrBtn', title: 'Not available yet' },
    { id: 'openHl7OruBtn', title: 'Not available yet' },
  ];
  for (const { id, title } of unavailable) {
    const btn = document.getElementById(id) as HTMLButtonElement | null;
    if (!btn) continue;
    btn.disabled = true;
    btn.setAttribute('disabled', '');
    btn.title = title;
  }
  const slicerOn = Boolean(state && hasConnectedThreeDSlicer(state));
  const hubMirrorOn = Boolean(state && hasConnectedHubMirror(state));
  const slicerCanOpen = enabled && slicerOn;
  for (const { id, title } of buttons) {
    const btn = document.getElementById(id) as HTMLButtonElement | null;
    if (!btn) continue;
    if (inferenceButtonIds.has(id)) {
      // Info dialog only — always clickable (status lives in tooltip / modal chrome).
      btn.disabled = false;
      btn.removeAttribute('disabled');
      btn.title = title;
      continue;
    }
    if (id === 'openOhifBtn') {
      // Keep OHIF non-interactive but visually like an enabled viewer button
      // when the hub is connected (no greyed-out :disabled look).
      btn.disabled = true;
      btn.setAttribute('disabled', '');
      btn.classList.toggle('wl-viewer-btn-inert', enabled);
      btn.title = enabled
        ? 'OHIF viewer is temporarily unavailable'
        : VIEWER_OPEN_TITLE_DISABLED;
      continue;
    }
    if (id === 'openSlicerBtn') {
      setSlicerDependentViewerButton(
        id,
        slicerCanOpen,
        openSlicerButtonTitle(enabled, slicerOn)
      );
      continue;
    }
    if (id === 'openHubMirrorBtn') {
      setSlicerDependentViewerButton(
        id,
        slicerCanOpen,
        openHubMirrorButtonTitle(enabled, slicerOn, hubMirrorOn)
      );
      continue;
    }
    if (id === 'endConferenceBtn' || id === 'startConferenceBtn') {
      // Visibility follows conference state; only toggle enabled here.
      btn.disabled = !enabled || btn.hidden;
      if (enabled && !btn.hidden) {
        btn.removeAttribute('disabled');
        btn.title = title;
      }
      continue;
    }
    btn.disabled = !enabled;
    if (enabled) {
      btn.removeAttribute('disabled');
    }
    btn.title = enabled ? title : VIEWER_OPEN_TITLE_DISABLED;
  }
  if (state) updateConnectedAppButtons(state);
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

function buildWorklistStatusResponseData(
  state: AppState
): Record<string, unknown> {
  const clientWindow = {
    left: Math.floor(window.screenX ?? window.screenLeft ?? 0),
    top: Math.floor(window.screenY ?? window.screenTop ?? 0),
    width: Math.floor(window.outerWidth || 800),
    height: Math.floor(window.outerHeight || 600),
  };
  if (state.lastImagingStudyOpenContext.length) {
    return {
      'context.type': 'ImagingStudy',
      context: cloneContextArray(state.lastImagingStudyOpenContext),
      clientWindow,
    };
  }
  return {
    ...EMPTY_CAST_CONTEXT,
    clientWindow,
  };
}

function handleIncomingStatusRequest(
  state: AppState,
  message: Record<string, unknown>
): boolean {
  const event = message?.event as
    | { 'hub.event'?: string; context?: Record<string, unknown>; 'hub.topic'?: string }
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
    !requestedTargets.includes(WORKLIST_ACTOR)
  ) {
    return false;
  }

  if (context.dataType !== 'STATUS') return false;

  markConnectedApp(state, message);
  // Startup probe already delivered studies → do not send another status-request.
  // Slicer appearing later (this inbound request) with no studies yet → probe once.
  maybeProbeForSlicerStudies(state);

  state.client?.sendCastRequestResponse(
    correlationId,
    'STATUS',
    buildWorklistStatusResponseData(state),
    event['hub.topic']
  );
  return true;
}

function handleSubscriptionRemoved(
  state: AppState,
  message: Record<string, unknown>
): boolean {
  const event = message?.event as { 'hub.event'?: string } | undefined;
  if (!event || getHubEventLower(event) !== 'subscription-removed') {
    return false;
  }
  return removeConnectedApp(state, message);
}

/** Focus DICOM SR when Image Display publishes more segments (opener can focus popup). */
function handleStructureReportUpdate(
  _state: AppState,
  message: Record<string, unknown>
): boolean {
  const event = message?.event as { 'hub.event'?: string } | undefined;
  if (getHubEventLower(event) !== 'structurereport-update') return false;
  focusExistingReportingWindow();
  return true;
}

function ensureClient(state: AppState, recreate = false) {
  if (!state.client || recreate) {
    state.client?.delete();
    if (recreate) clearConnectedApps(state);
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
        actors: [WORKLIST_ACTOR],
        topic: state.topic,
        events: SUBSCRIBE_EVENTS,
        lease: 7200,
        defaultTargetActor: '*',
        userName: state.freshUser
          ? undefined
          : getStoredUserName() || undefined,
      },
      callbackUrl: `${window.location.origin}/castCallback`,
      autoReconnect: true,
    });

    state.client.onMessage((message: Record<string, unknown>) => {
      if (handleSubscriptionRemoved(state, message)) return;
      if (handleStructureReportUpdate(state, message)) return;
      if (handleConferenceHubEvent(state, message)) return;
      if (handleImagingStudyMessage(state, message)) return;
      handleIncomingStatusRequest(state, message);
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
  if (!state.freshUser) {
    const storedUserName = getStoredUserName();
    if (storedUserName) state.client.setUserName(storedUserName);
  } else {
    state.client.setUserName('');
  }
  return state.client;
}

let idcSegLoadPromise: Promise<void> | null = null;
let idcSegCatalogLoaded = false;

/** Load SegRoulette catalog into the worklist once (org: IDC segmentations). */
export async function ensureIdcSegmentationsLoaded(
  state: AppState,
  onStatus?: (msg: string) => void
): Promise<void> {
  if (idcSegCatalogLoaded) return;
  if (idcSegLoadPromise) return idcSegLoadPromise;
  idcSegLoadPromise = (async () => {
    onStatus?.('Loading IDC segmentations…');
    try {
      const samples = await loadIdcSegmentationStudies();
      state.allStudies = replaceIdcSegmentationStudies(state.allStudies, samples);
      idcSegCatalogLoaded = true;
      notifyWorklist(state);
      onStatus?.(
        `IDC segmentations · ${samples.length.toLocaleString()} studies`
      );
      console.info(
        `${LOG_PREFIX} loaded IDC segmentations`,
        samples.length,
        WORKLIST_ORG_IDC_SEG
      );
    } catch (err) {
      idcSegLoadPromise = null;
      onStatus?.(
        err instanceof Error
          ? err.message
          : 'Failed to load IDC segmentations'
      );
      throw err;
    }
  })();
  return idcSegLoadPromise;
}

let idcWsiLoadPromise: Promise<void> | null = null;
let idcWsiLoaded = false;

/** Load builtin IDC whole-slide imaging studies once (org: idc-wsi). */
export async function ensureIdcWsiLoaded(
  state: AppState,
  onStatus?: (msg: string) => void
): Promise<void> {
  if (idcWsiLoaded) return;
  if (idcWsiLoadPromise) return idcWsiLoadPromise;
  idcWsiLoadPromise = (async () => {
    onStatus?.('Loading IDC Whole Slide Imaging…');
    try {
      const samples = await loadIdcWsiStudies();
      state.allStudies = replaceIdcWsiStudies(state.allStudies, samples);
      idcWsiLoaded = true;
      notifyWorklist(state);
      onStatus?.(
        `IDC Whole Slide Imaging · ${samples.length.toLocaleString()} studies`
      );
      console.info(
        `${LOG_PREFIX} loaded IDC WSI`,
        samples.length,
        WORKLIST_ORG_IDC_WSI
      );
    } catch (err) {
      idcWsiLoadPromise = null;
      onStatus?.(
        err instanceof Error
          ? err.message
          : 'Failed to load IDC Whole Slide Imaging'
      );
      throw err;
    }
  })();
  return idcWsiLoadPromise;
}

let slicerScenesLoadPromise: Promise<void> | null = null;
let slicerScenesLoaded = false;

/** Load builtin SlicerLive scene studies once (org: slicer-scenes). */
export async function ensureSlicerScenesLoaded(
  state: AppState,
  onStatus?: (msg: string) => void
): Promise<void> {
  if (slicerScenesLoaded) return;
  if (slicerScenesLoadPromise) return slicerScenesLoadPromise;
  slicerScenesLoadPromise = (async () => {
    onStatus?.('Loading Slicer scenes…');
    try {
      const samples = await loadSlicerSceneStudies();
      state.allStudies = replaceSlicerSceneStudies(state.allStudies, samples);
      slicerScenesLoaded = true;
      notifyWorklist(state);
      onStatus?.(
        `Slicer scenes · ${samples.length.toLocaleString()} studies`
      );
      console.info(
        `${LOG_PREFIX} loaded Slicer scenes`,
        samples.length,
        WORKLIST_ORG_SLICER_SCENES
      );
    } catch (err) {
      slicerScenesLoadPromise = null;
      onStatus?.(
        err instanceof Error ? err.message : 'Failed to load Slicer scenes'
      );
      throw err;
    }
  })();
  return slicerScenesLoadPromise;
}

let cbctDentalLoadPromise: Promise<void> | null = null;
let cbctDentalLoaded = false;

/** Load builtin CBCT Dental studies once (org: cbct-dental). */
export async function ensureCbctDentalLoaded(
  state: AppState,
  onStatus?: (msg: string) => void
): Promise<void> {
  if (cbctDentalLoaded) return;
  if (cbctDentalLoadPromise) return cbctDentalLoadPromise;
  cbctDentalLoadPromise = (async () => {
    onStatus?.('Loading CBCT Dental…');
    try {
      const samples = await loadCbctDentalStudies();
      state.allStudies = replaceCbctDentalStudies(state.allStudies, samples);
      cbctDentalLoaded = true;
      notifyWorklist(state);
      onStatus?.(
        `CBCT Dental · ${samples.length.toLocaleString()} studies`
      );
      console.info(
        `${LOG_PREFIX} loaded CBCT Dental`,
        samples.length,
        WORKLIST_ORG_CBCT_DENTAL
      );
    } catch (err) {
      cbctDentalLoadPromise = null;
      onStatus?.(
        err instanceof Error ? err.message : 'Failed to load CBCT Dental'
      );
      throw err;
    }
  })();
  return cbctDentalLoadPromise;
}

let txrvLoadPromise: Promise<void> | null = null;
let txrvLoaded = false;

/** Load builtin TorchXRayVision CXR studies once (org: torchxrayvision). */
export async function ensureTxrvLoaded(
  state: AppState,
  onStatus?: (msg: string) => void
): Promise<void> {
  if (txrvLoaded) return;
  if (txrvLoadPromise) return txrvLoadPromise;
  txrvLoadPromise = (async () => {
    onStatus?.('Loading TorchXRayVision…');
    try {
      const samples = await loadTxrvStudies();
      state.allStudies = replaceTxrvStudies(state.allStudies, samples);
      txrvLoaded = true;
      notifyWorklist(state);
      onStatus?.(
        `TorchXRayVision · ${samples.length.toLocaleString()} studies`
      );
      console.info(
        `${LOG_PREFIX} loaded TorchXRayVision`,
        samples.length,
        WORKLIST_ORG_TXRV
      );
    } catch (err) {
      txrvLoadPromise = null;
      onStatus?.(
        err instanceof Error
          ? err.message
          : 'Failed to load TorchXRayVision'
      );
      throw err;
    }
  })();
  return txrvLoadPromise;
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
    actor: WORKLIST_ACTOR,
    // Fan out to all topic subscribers (Image Displays and Reporting client).
    'target.actor': '*',
    'target.product.name': '*',
  };
}

async function publishImagingStudyOpen(
  state: AppState,
  context: unknown[]
): Promise<boolean> {
  if (!state.client) {
    console.warn(`${LOG_PREFIX} open study: subscribe first`);
    return false;
  }
  const payload = buildPublishPayload(state, 'ImagingStudy-open', context);
  try {
    const res = await state.client.publish(payload);
    if (res && res.ok) {
      state.lastImagingStudyOpenContext = cloneContextArray(context);
      syncOpenSampleId(state);
      notifyWorklist(state);
      return true;
    }
    console.warn(
      `${LOG_PREFIX} open study failed`,
      res ? `HTTP ${res.status}` : 'No response'
    );
    return false;
  } catch (err) {
    console.error(`${LOG_PREFIX} open study exception`, err);
    return false;
  }
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
 * and adopt it as the local open context (republish ImagingStudy-open on our topic).
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
      'subscriber.actor': WORKLIST_ACTOR,
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
      sameOpenImagingStudyContext(context, state.lastImagingStudyOpenContext) ||
      (state.openWorklistSampleId &&
        extractVolviewSampleId(context) === state.openWorklistSampleId)
    ) {
      console.info(
        `${LOG_PREFIX} host STATUS: same study already open — skip republish`
      );
      ensureSlicerLiveViewer(state, { reason: 'reopen-focus' });
      showHubInfoToast(SKIP_STUDY_RELOAD_TOAST);
      return;
    }
    const ok = await publishImagingStudyOpen(state, context);
    console.info(
      `${LOG_PREFIX} host STATUS applied ImagingStudy items=`,
      context.length,
      ok ? 'published' : 'publish failed'
    );
  } catch (err) {
    console.error(`${LOG_PREFIX} host STATUS exception`, err);
  }
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
      state.lastImagingStudyOpenContext = [];
      state.openWorklistSampleId = null;
      // Keep catalog-backed IDC rows in place; close only clears open state.
      notifyWorklist(state);
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

async function requestLiveSceneFromSlicer(state: AppState): Promise<void> {
  if (!state.client || state.connection !== 'connected') {
    console.warn(`${LOG_PREFIX} LiveScene request skipped: not connected`);
    return;
  }
  const subscriber =
    state.subscriberName ||
    state.client.getSessionConfig()?.subscriberName?.trim() ||
    '';
  if (!subscriber) {
    console.warn(`${LOG_PREFIX} LiveScene request skipped: no subscriber`);
    return;
  }
  try {
    console.info(`${LOG_PREFIX} requesting LiveScene publish from 3D Slicer…`);
    const result = await requestCastLiveScene(state.client, {
      subscriberName: subscriber,
      subscriberProductName: PRODUCT_NAME,
      subscriberActor: WORKLIST_ACTOR,
      topic: state.topic || undefined,
      targetActor: IMAGE_DISPLAY_ACTOR,
    });
    const requestResult =
      result && typeof result === 'object'
        ? (result as { ok?: boolean; data?: unknown })
        : {};
    const envelope =
      requestResult.ok !== false
        ? parseCollatedRequestResult(requestResult.data)
        : parseCollatedRequestResult(null);
    const first = envelope.responses[0]?.data as
      | { ok?: boolean; error?: string }
      | undefined;
    if (first && first.ok === false) {
      console.warn(`${LOG_PREFIX} LiveScene request failed`, first.error);
      return;
    }
    console.info(`${LOG_PREFIX} LiveScene request acknowledged`, first || envelope);
    ensureSlicerLiveViewer(state);
  } catch (err) {
    console.warn(`${LOG_PREFIX} LiveScene request error`, err);
  }
}

export async function handleWorklistSampleOpen(
  state: AppState,
  sampleId: string
): Promise<void> {
  dismissOpenStartHint();
  if (
    state.lastImagingStudyOpenContext.length &&
    state.openWorklistSampleId === sampleId
  ) {
    // Same study already open — still switch to the IRA tab.
    ensureSlicerLiveViewer(state, { reason: 'reopen-focus' });
    return;
  }
  if (state.lastImagingStudyOpenContext.length) {
    const closed = await publishImagingStudyClose(state);
    if (!closed) return;
  }
  const sample = findWorklistSample(sampleId, state.allStudies);
  if (!sample) {
    console.warn(`${LOG_PREFIX} unknown sample`, sampleId);
    return;
  }
  if (isWorklistSampleActionDisabled(sample)) return;

  const openMode = String(sample.openMode || '').trim();
  if (openMode === 'live-scene' || sample.id === 'slicer-live-scene') {
    await requestLiveSceneFromSlicer(state);
    return;
  }

  const files = worklistSampleFiles(sample);
  let context: unknown[];
  if (openMode === HUB_OPEN_MODE_LOCAL_DICOM) {
    context = buildLocalDicomImagingStudyOpenContext({
      id: sample.id,
      studyInstanceUID: sample.studyInstanceUID || '',
      seriesInstanceUID: sample.seriesInstanceUID,
      patientReference: PATIENT_REFERENCE,
    });
  } else if (
    openMode === HUB_OPEN_MODE_DICOMWEB ||
    isDicomwebWorklistSample(sample)
  ) {
    context = buildDicomwebImagingStudyOpenContext({
      id: sample.id,
      studyInstanceUID: sample.studyInstanceUID,
      seriesInstanceUID: sample.seriesInstanceUID,
      dicomwebRoot: sample.dicomwebRoot,
      patientReference: PATIENT_REFERENCE,
      files: sample.files,
    });
  } else if (
    openMode === HUB_OPEN_MODE_IDC ||
    Boolean(String(sample.ctCrdc || '').trim())
  ) {
    // Prefer CRDC/IDC for IRA (rejects per-.dcm dicom-url contexts).
    context = buildIdcDirectImagingStudyOpenContext(
      {
        c: sample.ctCrdc || sample.seriesInstanceUID || '',
        s: sample.segCrdc,
        m: String(sample.modalities?.[0] || 'CT'),
        col: sample.organization,
        cb: sample.bucket,
        sb: sample.segBucket,
        st: sample.studyInstanceUID,
        sd: sample.description,
      },
      sample.id
    );
  } else if (openMode === HUB_OPEN_MODE_DICOM_URL) {
    context = buildDicomUrlImagingStudyOpenContext({
      id: sample.id,
      files,
      patientReference: PATIENT_REFERENCE,
    });
  } else {
    context = buildFilesImagingStudyOpenContext({
      id: sample.id,
      files,
      patientReference: PATIENT_REFERENCE,
    });
  }
  context = attachImagingStudyDescription(
    context,
    sample.name || sample.description
  );
  context = attachImagingStudyModality(
    context,
    sample.modalities?.[0] || sample.segroulette?.m
  );
  const liveScene = liveSceneDocFromSample(sample);
  if (liveScene) {
    context = attachLiveSceneToContext(context, liveScene);
  }

  // Store + publish before opening IRA so STATUS / ImagingStudy-open are ready.
  state.lastImagingStudyOpenContext = cloneContextArray(context);
  syncOpenSampleId(state);
  notifyWorklist(state);
  await publishImagingStudyOpen(state, context);
  ensureSlicerLiveViewer(state);
}

export async function handleWorklistClose(state: AppState): Promise<void> {
  await publishImagingStudyClose(state);
}

/** Publish SegRoulette case as ImagingStudy-open (does not add a worklist row). */
export async function publishSegrouletteOpen(
  state: AppState,
  entry: SegrouletteEntry
): Promise<void> {
  dismissOpenStartHint();
  const sampleId = segrouletteSampleId(entry);
  if (
    state.lastImagingStudyOpenContext.length &&
    state.openWorklistSampleId === sampleId
  ) {
    return;
  }
  if (state.lastImagingStudyOpenContext.length) {
    const closed = await publishImagingStudyClose(state);
    if (!closed) return;
  }

  const context = buildIdcDirectImagingStudyOpenContext(entry, sampleId);
  const onList = findWorklistSample(sampleId, state.allStudies);
  const displayName = String(
    onList?.name ||
      worklistSampleFromSegrouletteEntry(entry).name ||
      entry.sd ||
      ''
  ).trim();
  const labeled = attachImagingStudyDescription(context, displayName);
  // Store + publish before opening IRA so STATUS / ImagingStudy-open are ready.
  state.lastImagingStudyOpenContext = cloneContextArray(labeled);
  state.openWorklistSampleId = onList ? sampleId : null;
  notifyWorklist(state);
  const ok = await publishImagingStudyOpen(state, labeled);
  ensureSlicerLiveViewer(state);
  if (ok) {
    console.info(
      `${LOG_PREFIX} SegRoulette ImagingStudy-open`,
      sampleId,
      entry.col,
      entry.c
    );
  }
}

/** Publish one IDC series (CRDC prefix) as ImagingStudy-open without adding a row. */
export async function publishIdcRestSeriesOpen(
  state: AppState,
  opts: {
    crdcSeriesUuid: string;
    studyInstanceUID?: string;
    seriesDescription?: string;
    modality?: string;
    collectionId?: string;
    bucket?: string;
  }
): Promise<void> {
  dismissOpenStartHint();
  const crdc = String(opts.crdcSeriesUuid || '').trim();
  if (!crdc) {
    throw new Error('Missing CRDC series UUID for IDC open');
  }
  const sampleId = `idc-rest-${crdc}`;
  if (
    state.lastImagingStudyOpenContext.length &&
    state.openWorklistSampleId === sampleId
  ) {
    return;
  }
  if (state.lastImagingStudyOpenContext.length) {
    const closed = await publishImagingStudyClose(state);
    if (!closed) return;
  }
  const entry: SegrouletteEntry = {
    c: crdc,
    m: String(opts.modality || 'CT').toUpperCase(),
    col: String(opts.collectionId || 'idc'),
    cb: String(opts.bucket || 'idc-open-data').trim() || 'idc-open-data',
    st: String(opts.studyInstanceUID || '').trim() || undefined,
    sd: String(opts.seriesDescription || '').trim() || undefined,
  };
  const context = buildIdcDirectImagingStudyOpenContext(entry, sampleId);
  const onList = findWorklistSample(sampleId, state.allStudies);
  const displayName = String(
    onList?.name || opts.seriesDescription || entry.sd || ''
  ).trim();
  const labeled = attachImagingStudyDescription(context, displayName);
  state.lastImagingStudyOpenContext = cloneContextArray(labeled);
  state.openWorklistSampleId = onList ? sampleId : null;
  notifyWorklist(state);
  const ok = await publishImagingStudyOpen(state, labeled);
  ensureSlicerLiveViewer(state);
  if (ok) {
    console.info(`${LOG_PREFIX} IDC REST ImagingStudy-open`, sampleId, crdc);
  }
}

/** Add the spun case to the worklist table without publishing ImagingStudy-open. */
export async function addSegrouletteToWorklist(
  state: AppState,
  entry: SegrouletteEntry
): Promise<void> {
  // SegRoulette dialog only passes the chosen entry; we compute its body-region
  // from the catalog so the category filters can show the row immediately.
  const catalog = await loadSegrouletteCatalog();
  let region = '';
  for (const [reg, byCol] of catalog.byRegion) {
    if (byCol.has(entry.col) && byCol.get(entry.col)?.some((e) => e.c === entry.c)) {
      region = reg;
      break;
    }
  }

  const sample = worklistSampleFromSegrouletteEntry(
    entry,
    region,
    WORKLIST_ORG_MINE
  );
  state.allStudies = upsertSegrouletteSample(state.allStudies, sample);
  notifyWorklist(state);
  console.info(`${LOG_PREFIX} SegRoulette added to worklist`, sample.id);
}

/** Open a second worklist tab that authenticates as a new hub user (for conference testing). */
export function openConferenceTestWorklist(): void {
  const url = new URL(window.location.href);
  url.searchParams.set('freshUser', '1');
  url.searchParams.delete('topic');
  window.open(url.href, '_blank', 'noopener,noreferrer');
}

/** Copy a catalog (or other org) row into My Worklist and switch the org filter. */
export function addWorklistSampleToMine(
  state: AppState,
  sampleId: string
): void {
  const sample = findWorklistSample(sampleId, state.allStudies);
  if (!sample) return;
  if (isSampleInMyWorklist(state.allStudies, sample)) return;
  state.allStudies = addSampleToMyWorklist(state.allStudies, sample);
  const orgSelect = document.getElementById(
    'worklistOrgSelect'
  ) as HTMLSelectElement | null;
  if (orgSelect) {
    orgSelect.value = WORKLIST_ORG_MINE;
    dismissOpenStartHint();
  }
  notifyWorklist(state);
  console.info(`${LOG_PREFIX} added to My Worklist`, sample.id);
}

export function handleWorklistRowAction(
  state: AppState,
  sampleId: string,
  action: string
): void {
  if (action === 'close') {
    handleWorklistClose(state).catch((err) => {
      console.error(`${LOG_PREFIX} close study failed`, err);
    });
    return;
  }
  if (action === 'add-to-mine') {
    addWorklistSampleToMine(state, sampleId);
    return;
  }
  handleWorklistSampleOpen(state, sampleId).catch((err) => {
    console.error(`${LOG_PREFIX} open study failed`, err);
  });
}

export async function autoConnect(state: AppState): Promise<void> {
  await syncStoredUserNameWithHub(state);
  setConnection(state, 'connecting', 'Authenticating');

  try {
    const client = ensureClient(state, true);
    const storedUserName = state.freshUser ? '' : getStoredUserName();
    if (storedUserName) client.setUserName(storedUserName);
    else client.setUserName('');

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

    const session = client.getSessionConfig();
    if (session.subscriberName) state.subscriberName = session.subscriberName;
    if (session.topic) state.topic = session.topic;
    notifyStatus(state);

    console.info(`${LOG_PREFIX} auto-connect: subscribe`);
    const status = await client.subscribe();
    if (status === 202) {
      setConnection(state, 'connected', 'Websocket connected');
      // Conference + inference probes are kicked off inside setConnection.
      console.info(`${LOG_PREFIX} auto-connect done`);
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
