export interface HubConfig {
  name: string;
  friendlyName?: string;
  version?: string;
  hub_endpoint: string;
  authorization_endpoint?: string;
  token_endpoint: string;
  client_id?: string;
  client_secret?: string;
}

export interface SessionConfig {
  subscriberName?: string;
  actors?: string[];
  topic?: string;
  events?: string[];
  lease?: number;
  productName?: string;
  productVersion?: string;
  userName?: string;
  /** Default destination actor when publish/request omit ``target.actor``. */
  defaultTargetActor?: string;
}

export interface HubRuntimeState {
  token: string;
  lastIdToken: string;
  subscribed: boolean;
  resubscribeRequested: boolean;
  websocket: WebSocket | null;
  lastPublishedMessageID: string;
}

export interface AuthorizeResult {
  user_name: string;
  code: string;
  expires_in?: number;
}

export interface HubClientConfig {
  hub?: Partial<HubConfig>;
  session?: Partial<SessionConfig>;
  productName?: string;
  productVersion?: string;
  callbackUrl?: string;
  autoStart?: boolean;
  autoReconnect?: boolean;
  preserveSessionTopicFromToken?: boolean;
}

export interface CastEvent {
  'hub.event'?: string;
  'hub.topic'?: string;
  context?: unknown;
  [key: string]: unknown;
}
/**
 * Hub JSON envelope: publish (`POST /api/hub/`), request (`POST /api/hub/request`),
 * and WebSocket notifications.
 */
export interface CastMessage {
  id?: string;
  timestamp?: string;
  'subscriber.name'?: string;
  'subscriber.actor'?: string;
  'subscriber.product.name'?: string;
  'target.product.name'?: string;
  'target.actor'?: string;
  event?: CastEvent;
  [key: string]: unknown;
}

/**
 * One responder's contribution to a fan-out hub-request. ``id`` is the Hub
 * envelope id of the response message (so callers can correlate or
 * deduplicate). ``actor`` is the single actor the request asked for.
 */
export interface CastRequestResponseItem {
  id: string | null;
  subscriber: string | null;
  actor: string | null;
  productName?: string | null;
  data: unknown;
  [key: string]: unknown;
}

/**
 * Normalized shape returned by ``parseCollatedRequestResult`` (and used as
 * ``CastRequestResult.data`` when the hub replies with JSON).
 */
export interface ParsedCollatedRequestResult {
  responses: CastRequestResponseItem[];
  expected: string[];
  missing: string[];
  timedOut: boolean;
  ok: boolean;
  id: string | null;
  actor: string | null;
  productName: string | null;
}

/**
 * Arguments for ``HubClientInstance.request``.
 */
export interface CastRequestArgs {
  'subscriber.name': string;
  event: {
    'hub.topic'?: string;
    'hub.event': string;
    context?: Record<string, unknown>;
    [key: string]: unknown;
  };
  id?: string;
  timestamp?: string;
  'subscriber.actor'?: string;
  'target.actor'?: string;
  'target.product.name'?: string;
  /** Alias for ``target.product.name``. */
  targetProductName?: string;
  [key: string]: unknown;
}

export interface CastRequestResult {
  ok: boolean;
  status: number;
  /** Parsed collated envelope when JSON; otherwise raw text/empty. */
  data: ParsedCollatedRequestResult | unknown;
}

export type ConnectionState =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error';

export interface HubClientInstance {
  getClassName(): string;
  isA(className: string): boolean;
  onMessage(callback: (message: CastMessage) => void): void;
  onConnectionStateChange(
    callback: (state: ConnectionState, detail?: unknown) => void
  ): void;
  delete(): void;
  getHubConfig(): HubConfig;
  getSessionConfig(): SessionConfig;
  getConnectionState(): HubRuntimeState;
  setTopic(topic: string): void;
  setToken(token: string): void;
  setSubscriberName(subscriberName: string): void;
  setUserName(userName: string): void;
  /**
   * Start the OAuth authorize flow against the hub.
   * @throws When no authorize endpoint is configured or the hub rejects.
   */
  authenticate(): Promise<AuthorizeResult>;
  /**
   * Exchange an authorization code for an access token.
   * @returns ``true`` when a token was stored; ``false`` on failure (does not throw).
   */
  getToken(code: string): Promise<boolean>;
  /**
   * Subscribe and open the WebSocket channel.
   * @returns ``202`` on HTTP accept; ``401``/other HTTP status; error strings;
   *   or ``0`` on exception / missing channel endpoint.
   */
  subscribe(fromAuthRetry?: boolean): Promise<number | string>;
  unsubscribe(): Promise<void>;
  /**
   * Publish a Hub message (JSON or binary batch).
   * @returns Hub response, or ``null`` on JSON network failure. Binary batch
   *   preparation may throw.
   */
  publish(
    castMessage: CastMessage,
    hub?: HubConfig & HubRuntimeState
  ): Promise<Response | null>;
  /** @deprecated Use ``publishBinaryBatch`` or ``publish`` (binary batch). */
  publishMultipart(
    castMessage: CastMessage,
    fileBytes: ArrayBuffer,
    hub?: HubConfig & HubRuntimeState
  ): Promise<Response | null>;
  /**
   * Publish a binary batch (multipart/related).
   * @returns Hub response, or ``null`` on network failure. May throw on
   *   validation/preparation errors.
   */
  publishBinaryBatch(
    castMessage: CastMessage,
    fileBytesList: ArrayBuffer[],
    hub?: HubConfig & HubRuntimeState
  ): Promise<Response | null>;
  /** @deprecated Use ``publishBinaryBatch`` or ``publish``. */
  publishNiftiMultipart(
    castMessage: CastMessage,
    fileBytes: ArrayBuffer,
    hub?: HubConfig & HubRuntimeState
  ): Promise<Response | null>;
  fetchPayload(castMessage: CastMessage): Promise<CastMessage>;
  /** Clones the message, then attaches downloaded bytes to ``context.files[]``. */
  fetchAllPayloads(castMessage: CastMessage): Promise<CastMessage>;
  hasPendingPayload(castMessage: CastMessage): boolean;
  /**
   * Send a response to a previously-received ``<datatype>-request``.
   *
   * The response event name is derived from ``dataType`` (e.g.
   * ``PNGFULLSIZE`` -> ``pngfullsize-response``). ``dataType`` is required;
   * callers that omit or pass only whitespace trigger a ``console.error`` and
   * no websocket message is sent.
   */
  sendCastRequestResponse(
    id: string,
    dataType: string,
    data: unknown,
    topic?: string
  ): void;
  /**
   * Fan-out request via ``POST /api/hub/request``.
   * @throws When required fields or token are missing.
   */
  request(args: CastRequestArgs): Promise<CastRequestResult>;
  getConfig(): HubClientConfig;
}

export function extend(
  publicAPI: object,
  model: object,
  initialValues?: HubClientConfig
): void;

export function newInstance(initialValues?: HubClientConfig): HubClientInstance;

export function generateSubscriberName(productName?: string): string;

export const REQUEST_SUFFIX: string;
export const RESPONSE_SUFFIX: string;

export function requestEventFor(dataType: string): string;
export function responseEventFor(dataType: string): string;
export function isRequestEvent(name: string): boolean;
export function isResponseEvent(name: string): boolean;
export function dataTypeFromEventName(name: string): string;
export function normalizeDataType(dataType: string): string;

export function parseCollatedRequestResult(
  data: unknown
): ParsedCollatedRequestResult;

export function collatedResponsesFromRequestResult(
  data: unknown
): CastRequestResponseItem[];

/** True when the page is served from a public/cloud host (not local dev). */
export function isRunningInCloud(location?: Location): boolean;

/** True when a Slicer hub endpoint URL points at a cloud/public host. */
export function isHubEndpointInCloud(hubEndpoint: string): boolean;

/** First hub preset key whose deployment matches the page (local vs cloud). */
export function selectFirstMatchingHubKey(
  hubs: Record<string, { hubEndpoint?: string }>,
  order: string[],
  pageInCloud?: boolean
): string | undefined;

/** Lucide-style radio waves SVG class name. */
export const HUB_RADIO_ICON_CLASS: string;
/** Hub connection radio mark SVG (uses currentColor). */
export const HUB_RADIO_ICON_SVG: string;
export const HUB_RADIO_SLASH_CLASS: string;
export const HUB_RADIO_STATUS_ICON_CLASS: string;

/** Icon + diagonal slash overlay markup for connection status. */
export function castRadioStatusMarkup(options?: {
  slashId?: string;
}): string;

/** Visual hints for the Hub radio status control. */
export function castRadioStatusVisual(
  status: string,
  options?: { conferenceActive?: boolean }
): {
  tone: 'connected' | 'connecting' | 'error' | 'idle';
  showSlash: boolean;
  pulse: boolean;
  conferencePulse: boolean;
};

export const HUB_IMAGING_STUDY_OPEN_PROFILE: string;
export const HUB_IDENTIFIER_DICOM_UID: string;
export const HUB_IDENTIFIER_NIFTI_URL: string;
export const HUB_IDENTIFIER_NIFTI_FILENAME: string;
export const HUB_IDENTIFIER_VOLVIEW_SAMPLE_ID: string;
export const HUB_IDENTIFIER_WORKLIST_SAMPLE_ID: string;
export const HUB_IDENTIFIER_OHIF_MODE: string;
export const HUB_OPEN_MODE: string;
export const HUB_OPEN_MODE_DICOMWEB: string;
export const HUB_OPEN_MODE_DICOM_URL: string;
export const HUB_OPEN_MODE_FILES: string;
export const HUB_OPEN_MODE_IDC: string;
export const HUB_OPEN_MODE_LOCAL_DICOM: string;
export const HUB_IDENTIFIER_IDC: string;
export const HUB_IDENTIFIER_IDC_SOURCE_BUCKET: string;
export const HUB_DICOMWEB_ROOT: string;

export interface CastImagingStudyFileEntry {
  url: string;
  fileName?: string;
  mimeType?: string;
  role?: string;
  label?: string;
}

export function extractStudyContextItem(
  context: unknown,
  key: string
): Record<string, unknown> | null;

export function extractIdentifierValue(
  context: unknown,
  system: string
): string;

export function extractDicomStudyUid(context: unknown): string;

export function extractDicomSeriesUid(context: unknown): string;

export function extractDicomwebRoot(context: unknown): string;

export function extractIdcSeriesUid(context: unknown): string;

export function extractIdcSourceBucket(context: unknown): 'aws' | 'gcs';

export function extractOpenMode(context: unknown): string;

export function extractImagingStudyFiles(
  context: unknown
): CastImagingStudyFileEntry[];

export function extractNiftiDownloadUrl(context: unknown): string;

export function extractNiftiFilename(context: unknown): string;

export function extractOhifMode(context: unknown): string;

export function extractVolviewSampleId(context: unknown): string;

export function buildFilesImagingStudyOpenContext(params: {
  id: string;
  files: CastImagingStudyFileEntry[];
  patientReference?: string;
  includeLegacyNiftiIdentifiers?: boolean;
}): Array<{ key: string; resource: Record<string, unknown> }>;

export function buildDicomUrlImagingStudyOpenContext(params: {
  id: string;
  files: CastImagingStudyFileEntry[];
  patientReference?: string;
}): Array<{ key: string; resource: Record<string, unknown> }>;

export function buildDicomwebImagingStudyOpenContext(params: {
  id: string;
  studyInstanceUID: string;
  seriesInstanceUID?: string;
  dicomwebRoot?: string;
  patientReference?: string;
  ohifMode?: string;
  files?: CastImagingStudyFileEntry[];
  sourceBucket?: 'aws' | 'gcs';
}): Array<{ key: string; resource: Record<string, unknown> }>;

export function buildLocalDicomImagingStudyOpenContext(params: {
  id: string;
  studyInstanceUID: string;
  seriesInstanceUID?: string;
  patientReference?: string;
}): Array<{ key: string; resource: Record<string, unknown> }>;

export function buildIdcImagingStudyOpenContext(params: {
  id: string;
  studyInstanceUID: string;
  seriesInstanceUID?: string;
  sourceBucket?: 'aws' | 'gcs';
  files: CastImagingStudyFileEntry[];
  patientReference?: string;
  ohifMode?: string;
}): Array<{ key: string; resource: Record<string, unknown> }>;

export function buildNiftiUrlImagingStudyOpenContext(params: {
  id: string;
  url: string;
  filename?: string;
  patientReference?: string;
}): Array<{ key: string; resource: Record<string, unknown> }>;

export const HUB_ENVELOPE_ANY: string;
export const HUB_DEFAULT_SUBSCRIBER_ACTOR: string;
export const HUB_CONFERENCE_POLL_MS: number;
export const HUB_CONFERENCE_EXIT_ACK_MS: number;
export const HUB_CONFERENCE_POPUP_SIZE: { width: number; height: number };
export const HUB_REPORTING_WINDOW_NAME: string;
export const HUB_CLASSROOM_WINDOW_NAME: string;
export const HUB_WORKLIST_WINDOW_NAME: string;

/** Clear absolute positioning applied by {@link placeHubDialogNearAnchor}. */
export function clearHubDialogNearAnchor(
  overlay: HTMLElement | null | undefined,
  dialog: HTMLElement | null | undefined,
  anchoredClass?: string
): void;

/** Place a modal dialog near an anchor control inside a fixed overlay. */
export function placeHubDialogNearAnchor(options: {
  overlay: HTMLElement | null | undefined;
  dialog: HTMLElement | null | undefined;
  anchor?: HTMLElement | null;
  anchoredClass?: string;
  gap?: number;
  pad?: number;
  /** `start` (default): left-align to anchor; `end`: right-align (close near right-side triggers). */
  align?: 'start' | 'end';
}): void;

export type HubPopupOpenerBounds = {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
};
export type HubPopupPlacement = {
  width: number;
  height: number;
  left: number;
  top: number;
};
export function castReportingPopupPlacement(
  openerBounds?: HubPopupOpenerBounds | null
): HubPopupPlacement;
export function hubReportingPopupFeatures(place: HubPopupPlacement): string;
export function placeHubPopupWindow(
  win: Window | null | undefined,
  place: HubPopupPlacement
): void;
export const HUB_CONFERENCE_TITLE_PRESETS: readonly string[];
export const TOTAL_SEGMENTATOR_PRODUCT_ALIASES: readonly string[];
export const LUNG_SCREENING_PRODUCT_ALIASES: readonly string[];
export const NEURO_SEG_PRODUCT_ALIASES: readonly string[];
export const DENTAL_SEG_PRODUCT_ALIASES: readonly string[];
export const TORCHXRAYVISION_PRODUCT_ALIASES: readonly string[];
export const FLEXRAY_PRODUCT_ALIASES: readonly string[];
export const MHUB_PRODUCT_ALIASES: readonly string[];
export const BINARY_PLACEHOLDER: string;

export interface HubInferenceServerDef {
  id: string;
  product: string;
  title: string;
  location: string;
  /** Short capability blurb (info card body). */
  summary: string;
  /** Alias of ``summary`` for older callers. */
  capabilities?: string;
  githubUrl?: string;
  websiteUrl?: string;
  buyMeACoffeeUrl?: string;
  /** Brand / product icon shown on the info card. */
  iconUrl?: string;
  /** Citation / reference text shown on the info card. */
  cite?: string;
  /** Optional DOI / publication URL for the citation. */
  citeUrl?: string;
  /** Short license name shown on the info card. */
  license?: string;
  /** Optional URL for the license text / deed. */
  licenseUrl?: string;
  /** Optional usage restriction (e.g. not for commercial use). */
  licenseRestriction?: string;
  hubEvent: 'dicom-send' | 'nifti-send';
  /** On-device / local runtime; Evidence Creators UIs treat as always Available. */
  localCapable?: boolean;
}

export const HUB_INFERENCE_SERVERS: readonly HubInferenceServerDef[];
/** Local-capable subset of ``HUB_INFERENCE_SERVERS`` (compat). */
export const LOCAL_AI_SERVERS: readonly HubInferenceServerDef[];

export function isLocalCapableInferenceServer(
  def: HubInferenceServerDef | null | undefined
): boolean;

export function inferenceServerInfoText(
  def: HubInferenceServerDef,
  status?: string
): string;
/** Info card HTML: title, summary, citation, license, links — no Status / Location. */
export function renderInferenceServerInfoCardHtml(
  def: HubInferenceServerDef
): string;
export function findInferenceServerByProduct(
  productName: string
): HubInferenceServerDef | null;
export function inferenceProbeAvailabilityLabel(
  probe: { online?: boolean; error?: string; job?: string } | null | undefined,
  probing?: boolean
): string;
export function orderInferenceServerProbeRows<
  T extends {
    server: HubInferenceServerDef;
    probe?: { online?: boolean } | null;
    probing?: boolean;
  },
>(rows: T[], catalog?: readonly HubInferenceServerDef[]): T[];
export function buildInferenceRunContextExtras(
  server: HubInferenceServerDef | null | undefined,
  options?: { totalSegmentator?: Record<string, unknown> } | null
): Record<string, unknown>;

export type CastProductMatcherKind =
  | 'ira'
  | 'ohif'
  | 'volview'
  | 'slicer'
  | 'hubMirror'
  | 'mhub'
  | 'lung'
  | 'totalseg'
  | 'neuro'
  | 'dental'
  | 'txrv'
  | 'reporting'
  | 'classroom'
  | string;

export const HUB_PRODUCT_MATCHERS: Readonly<
  Record<string, (product: string) => boolean>
>;
export function normalizeHubProductName(productName: string): string;
export function matchesHubProduct(
  productName: string,
  kind: CastProductMatcherKind
): boolean;

export interface CastProductStatusProbe {
  online: boolean;
  items: unknown[];
  job?: string;
  error?: string;
  raw?: unknown;
  productName?: string;
}

export function parseProductStatusProbe(
  requestResult: unknown
): CastProductStatusProbe;
export function requestCastStatus(
  client: { request: (args: Record<string, unknown>) => Promise<unknown> },
  opts: {
    subscriberName: string;
    subscriberProductName?: string;
    subscriberActor?: string;
    topic?: string;
    targetActor?: string;
    targetProductName?: string;
  }
): Promise<unknown>;
export function requestCastLiveScene(
  client: { request: (args: Record<string, unknown>) => Promise<unknown> },
  opts: {
    subscriberName: string;
    subscriberProductName?: string;
    subscriberActor?: string;
    topic?: string;
    targetActor?: string;
    targetProductName?: string;
  }
): Promise<unknown>;
export function requestCastProductStatus(
  client: { request: (args: Record<string, unknown>) => Promise<unknown> },
  opts: {
    targetProductName: string;
    subscriberName: string;
    subscriberProductName?: string;
    subscriberActor?: string;
    topic?: string;
  }
): Promise<CastProductStatusProbe>;
export function mapInferenceServersFromStatusResult(
  requestResult: unknown
): Array<{ server: HubInferenceServerDef; probe: CastProductStatusProbe }>;
export function probeCastInferenceServers(
  client: { request: (args: Record<string, unknown>) => Promise<unknown> },
  opts: {
    subscriberName: string;
    subscriberProductName?: string;
    subscriberActor?: string;
    topic?: string;
  }
): Promise<
  Array<{ server: HubInferenceServerDef; probe: CastProductStatusProbe }>
>;
export function publishCastUrlSend(
  client: { publish: (args: Record<string, unknown>) => Promise<unknown> },
  opts: {
    targetProductName: string;
    hubEvent: string;
    files: Array<{ url: string; fileName?: string }>;
    subscriberName: string;
    subscriberProductName?: string;
    subscriberActor?: string;
    topic: string;
    contextExtras?: Record<string, unknown>;
  }
): Promise<{ ok: boolean; detail: string; response?: unknown }>;

export interface CastPublishEnvelopeFields {
  subscriberName: string;
  subscriberActor: string;
  targetActor: string;
  targetProductName: string;
}

export interface CastConferenceRecord {
  hostTopic?: string;
  sceneLeaderTopic?: string;
  user?: string;
  title?: string;
  topics?: string[];
  participants?: string[];
}

export interface CastConferencePlace {
  placeId: string;
  label: string;
  isSelf: boolean;
  isLeading: boolean;
  isFollowing: boolean;
  /** Short relation chip text, e.g. "You · leading", "Following", "Following you". */
  statusLabel: string;
}

export interface CastConferenceView {
  title: string;
  places: CastConferencePlace[];
  selfPlaceId: string;
  leadingPlaceId: string;
  selfRole: 'leading' | 'following';
  /** True when this session owns the conference (can End it). */
  isConferenceOwner: boolean;
  hostTopic: string;
  sceneLeaderTopic: string;
  attendeeTopics: string[];
  participants: string[];
}

export interface CastConferenceDialogSession {
  hubEndpoint?: string;
  topic?: string;
  subscriberName?: string;
  userName?: string;
  connected?: boolean;
}

export interface CastConferenceDialogController {
  open(anchor?: HTMLElement | null): void;
  close(): void;
  destroy(): void;
  refresh(): Promise<CastConferenceView | null>;
  setStrings(
    strings: Partial<CastConferenceStrings> | null | undefined
  ): void;
  /** No-op kept for API compatibility (session control removed). */
  syncSessionControl(): void;
  getSessionControl(): {
    button: HTMLElement | null;
    label: HTMLElement | null;
  };
  getView(): CastConferenceView | null;
  readonly element: HTMLElement;
}

/** English defaults for conference UI; apps override via i18next → strings map. */
export type CastConferenceStrings = {
  dialogTitle: string;
  close: string;
  closeAria: string;
  sessionSection: string;
  sessionInfo: string;
  participantsAria: string;
  createSection: string;
  conferenceTitle: string;
  selectConferenceTitle: string;
  otherTitle: string;
  customTitle: string;
  customTitlePlaceholder: string;
  users: string;
  loadingUsers: string;
  noUsers: string;
  createConference: string;
  creating: string;
  joinSection: string;
  activeConferences: string;
  noConferences: string;
  selectConference: string;
  untitled: string;
  joinConference: string;
  joining: string;
  manageSection: string;
  titleLabel: string;
  na: string;
  participants: string;
  noPlaces: string;
  leaveConference: string;
  endConference: string;
  ending: string;
  leaving: string;
  conferenceEnded: string;
  leftConference: string;
  connectHubFirst: string;
  topicRequiredHost: string;
  topicRequiredJoin: string;
  titleRequired: string;
  selectAttendee: string;
  selectConferenceToJoin: string;
  failedCreate: string;
  failedJoin: string;
  failedUpdate: string;
  inviteTitle: string;
  joinAndFollow: string;
  joinNoFollow: string;
  doNotJoin: string;
  hostFallback: string;
  inviteLeadWithTitle: string;
  inviteLeadNoTitle: string;
  joinAndFollowHost: string;
  takeoverTitle: string;
  takeoverBody: string;
  cancel: string;
  takeOver: string;
  conferencing: string;
  subscribeHubFirst: string;
  stopFollowing: string;
  resumeFollowing: string;
};

export const HUB_CONFERENCE_STRINGS_EN: Readonly<CastConferenceStrings>;

export function mergeCastConferenceStrings(
  overrides?: Partial<CastConferenceStrings> | null
): CastConferenceStrings;

export function interpolateCastConferenceString(
  template: string,
  vars?: Record<string, string>
): string;

export function createHubConferenceDialog(options: {
  root?: ParentNode;
  classPrefix?: string;
  /**
   * Anchor alignment for the open dialog.
   * `start` (default): left edge under the trigger; `end`: right edge under the
   * trigger (extends left — useful next to a top-right viz card).
   */
  anchorAlign?: 'start' | 'end';
  getSession: () => CastConferenceDialogSession;
  onConferenceChange?: (view: CastConferenceView | null) => void;
  onFollowChange?: (followHost: boolean) => void;
  strings?: Partial<CastConferenceStrings>;
}): CastConferenceDialogController;

export const HUB_IMAGE_DISPLAY_ACTOR = 'ID';

export function shouldShowConferenceInvite(opts?: {
  selfActors?: string[];
  connectedActors?: string[];
}): boolean;

export type CastConferenceInviteChoice = 'join-follow' | 'join' | 'decline';

export interface CastConferenceInviteInfo {
  hubEvent: string;
  title: string;
  hostTopic: string;
  hostUserName: string;
  hostLabel: string;
  sceneLeaderTopic?: string;
  leaderUserName?: string;
  leaderLabel?: string;
  /** Set when a peer voluntarily joined via the Conferencing dialog. */
  joinedTopic?: string;
}

export function parseConferenceInviteFromMessage(
  message: unknown
): CastConferenceInviteInfo | null;

export interface CastConferenceInviteDialogController {
  open(invite: Partial<CastConferenceInviteInfo> & { hostTopic?: string }): void;
  close(): void;
  destroy(): void;
  setStrings?(
    strings: Partial<CastConferenceStrings> | null | undefined
  ): void;
  isOpen(): boolean;
  getInvite(): CastConferenceInviteInfo | null;
  readonly element: HTMLElement;
}

export function createHubConferenceInviteDialog(options?: {
  root?: ParentNode;
  classPrefix?: string;
  strings?: Partial<CastConferenceStrings>;
  onDecision?: (
    choice: CastConferenceInviteChoice,
    invite: CastConferenceInviteInfo
  ) => void | Promise<void>;
}): CastConferenceInviteDialogController;

export interface CastConferenceInviteController {
  handleHubMessage(message: Record<string, unknown>): boolean;
  open(invite: Partial<CastConferenceInviteInfo> & { hostTopic?: string }): void;
  close(): void;
  destroy(): void;
  refresh(): Promise<CastConferenceView | null>;
  setStrings?(
    strings: Partial<CastConferenceStrings> | null | undefined
  ): void;
  dialog: CastConferenceInviteDialogController;
}

export function createHubConferenceInviteController(options: {
  getSession: () => CastConferenceDialogSession;
  shouldShow?: () => boolean;
  dialog?: CastConferenceInviteDialogController;
  root?: ParentNode;
  classPrefix?: string;
  strings?: Partial<CastConferenceStrings>;
  onConferenceChange?: (view: CastConferenceView | null) => void;
  onFollowChange?: (
    followHost: boolean,
    invite?: Pick<
      CastConferenceInviteInfo,
      'hostTopic' | 'hostUserName' | 'hostLabel' | 'title' | 'sceneLeaderTopic' | 'leaderLabel'
    >
  ) => void;
  onLeadChange?: (
    info: Pick<
      CastConferenceInviteInfo,
      | 'hostTopic'
      | 'title'
      | 'sceneLeaderTopic'
      | 'leaderUserName'
      | 'leaderLabel'
    >
  ) => void;
}): CastConferenceInviteController;

export function confirmHubConferenceTakeover(options?: {
  root?: ParentNode;
  classPrefix?: string;
  strings?: Partial<CastConferenceStrings>;
}): Promise<boolean>;

export function showHubInfoToast(
  message: string,
  options?: { ms?: number; root?: ParentNode; classPrefix?: string }
): void;

export function buildCastConferenceView(
  session: { topic?: string; subscriberName?: string; userName?: string },
  conference: CastConferenceRecord | null | undefined
): CastConferenceView | null;

export function castConferenceSelfStatusLabel(
  place: Pick<CastConferencePlace, 'isSelf' | 'isLeading' | 'statusLabel'> | null | undefined,
  selfRole: CastConferenceView['selfRole'] | string | null | undefined,
  mode?: 'short' | 'full',
  followHost?: boolean,
  leaderLabel?: string
): string;

export function castConferencePlaceStatusLabel(
  place: Pick<CastConferencePlace, 'isFollowing' | 'statusLabel'> | null | undefined,
  followHost?: boolean
): string;

export function castConferenceLeaderPlace(
  view: CastConferenceView | null | undefined
): CastConferencePlace | null;

export function castConferenceParticipantRowStatus(
  place: CastConferencePlace | null | undefined,
  view: CastConferenceView | null | undefined,
  followHost?: boolean
): string;

export type CastConferenceHeaderButtonState = {
  hidden: boolean;
  disabled?: boolean;
  label?: string;
  title?: string;
  ariaLabel?: string;
};

export type CastConferenceHeaderActions = {
  active: boolean;
  start: CastConferenceHeaderButtonState;
  leave: CastConferenceHeaderButtonState;
  stopFollowing: Pick<CastConferenceHeaderButtonState, 'hidden'>;
  resumeFollowing: Pick<CastConferenceHeaderButtonState, 'hidden'>;
  takeOver: Pick<CastConferenceHeaderButtonState, 'hidden' | 'disabled'>;
};

/** Pure Start / Leave / Stop / Resume / Take over visibility and labels. */
export function resolveHubConferenceHeaderActions(options?: {
  view?: CastConferenceView | null;
  followHost?: boolean;
  connected?: boolean;
  strings?: Partial<CastConferenceStrings>;
}): CastConferenceHeaderActions;

/** Apply shared conference header button state (null-safe per element). */
export function applyCastConferenceHeaderActions(options?: {
  view?: CastConferenceView | null;
  followHost?: boolean;
  connected?: boolean;
  strings?: Partial<CastConferenceStrings>;
  startBtn?: HTMLButtonElement | HTMLElement | null;
  endBtn?: HTMLButtonElement | HTMLElement | null;
  stopFollowBtn?: HTMLButtonElement | HTMLElement | null;
  resumeFollowBtn?: HTMLButtonElement | HTMLElement | null;
  takeOverBtn?: HTMLButtonElement | HTMLElement | null;
}): CastConferenceHeaderActions;

export function renderCastConferencePresence(options: {
  view: CastConferenceView | null | undefined;
  statusControl: HTMLElement;
  statusLabelEl?: HTMLElement | null;
  /** Optional; omit to skip always-visible header chips. */
  chipsHost?: HTMLElement | null;
  classPrefix: string;
  statusClassPrefix?: string;
  selfStatusMode?: 'short' | 'full';
  /** When false, leader chip / self show Skipping (default true). */
  followHost?: boolean;
}): void;

export function openHubConferenceParticipantsPopup(options: {
  anchor: HTMLElement;
  view: CastConferenceView | null | undefined;
  followHost?: boolean;
  classPrefix?: string;
  root?: ParentNode;
}): { close: () => void; open: boolean };

export function closeCastConferenceParticipantsPopup(): void;

export function isHubConferenceParticipantsPopupOpen(): boolean;

export function resolveHubConferenceView(
  hubEndpoint: string,
  topic: string,
  subscriberName: string,
  userName?: string
): Promise<CastConferenceView | null>;

export type ImagingStudyOpenPlan =
  | {
      mode: 'dicomweb';
      studyId: string;
      studyInstanceUID: string;
      seriesInstanceUID?: string;
      dicomwebRoot?: string;
      ohifMode?: string;
      idcFallback?: {
        studyInstanceUID: string;
        seriesInstanceUID?: string;
        sourceBucket: 'aws' | 'gcs';
        files: CastImagingStudyFileEntry[];
      };
    }
  | {
      mode: 'files';
      studyId: string;
      files: CastImagingStudyFileEntry[];
      ohifMode?: string;
    }
  | {
      mode: 'dicom-url';
      studyId: string;
      files: CastImagingStudyFileEntry[];
      ohifMode?: string;
    }
  | {
      mode: 'idc';
      studyId: string;
      studyInstanceUID: string;
      seriesInstanceUID?: string;
      sourceBucket: 'aws' | 'gcs';
      files: CastImagingStudyFileEntry[];
      ohifMode?: string;
    };

export const DEFAULT_CAST_PUBLISH_ENVELOPE_FIELDS: CastPublishEnvelopeFields;

export function httpUrlFromHubEndpoint(hubEndpoint: string): URL | null;
export function resolveHubAdminUrl(hubEndpoint: string): string;
export function resolveHubConferenceClientUrl(
  hubEndpoint: string,
  opts?: {
    topic?: string;
    subscriberName?: string;
    theme?: string;
    mode?: string;
  }
): string;
export function openCastHubPopup(
  url: string,
  windowName: string,
  size?: { width: number; height: number }
): void;
export function ensureCastSubscribeEvents(events?: string[]): string[];
export function normalizeImagingStudyContext(context: unknown): unknown;
export function resolveImagingStudyOpenPlan(
  context: unknown
): ImagingStudyOpenPlan | null;
export function normalizeStudyUID(value: unknown): string;
export function extractStudyUIDFromResource(resource: unknown): string;

export interface HubFilePayloadClient {
  hasPendingPayload?: (message: CastMessage) => boolean;
  fetchAllPayloads?: (message: CastMessage) => Promise<CastMessage>;
  fetchPayload?: (message: CastMessage) => Promise<CastMessage>;
}

export function resolveHubFileMessage(
  client: HubFilePayloadClient | null | undefined,
  message: CastMessage
): Promise<CastMessage>;
export function castMessageHasPendingFilePayloads(
  message: CastMessage
): boolean;
export function getHubEventLower(
  event: CastMessage['event'] | undefined
): string;
export function getActorKeyword(actor: unknown): string;
export function getInboundTargetActorKeyword(message: {
  'target.actor'?: unknown;
}): string;
export function cloneContextArray(context: unknown): unknown[];
export function messageEventContext(message: {
  event?: { context?: unknown };
}): unknown[];
export function messageSubscriberName(message: {
  'subscriber.name'?: unknown;
  subscriber?: unknown;
}): string | null;
export function messageProductName(message: {
  'subscriber.product.name'?: unknown;
}): string;
export function messageActor(message: {
  'subscriber.actor'?: unknown;
  'subscriber.actors'?: unknown;
}): string;
export function parseStatusUpdateMessage(message: {
  event?: CastMessage['event'];
}): { message: string; level: string } | null;

export interface CastBatchContextFile {
  fileName?: string;
  mimeType?: string;
  byteLength?: number;
  data?: ArrayBuffer | Uint8Array | string;
  payloadIds?: string[];
  chunkByteLengths?: number[];
  expiresAt?: string;
  [key: string]: unknown;
}

export function batchContextFiles(
  event: CastMessage['event'] | undefined
): CastBatchContextFile[];

export function decodeBase64ToArrayBuffer(
  base64: string
): ArrayBuffer | null;

export function extractFilePayloadsForEvent(
  message: CastMessage,
  hubEventName: string
): Array<
  | { arrayBuffer: ArrayBuffer; fileName?: string; mimeType?: string }
  | { fileName: string; data: string; mimeType?: string }
>;
export function filePayloadToArrayBuffer(
  payload:
    | { arrayBuffer: ArrayBuffer }
    | { data: string }
): ArrayBuffer | null;
export function filePayloadToFile(
  payload: { arrayBuffer?: ArrayBuffer; data?: string; fileName?: string; mimeType?: string },
  defaultName: string,
  defaultMime: string
): File | null;
export function applyCastPublishEnvelopeFields(
  message: CastMessage,
  fields: CastPublishEnvelopeFields
): void;
export function normalizeOptionalEnvelopeField(
  value: string | undefined | null
): string;
export function resolveHubPublishEnvelopeFields(
  fields: Partial<CastPublishEnvelopeFields>,
  defaults: { subscriberName: string }
): CastPublishEnvelopeFields;
export function isTotalSegmentatorProduct(name: string): boolean;
export function isLungScreeningProduct(name: string): boolean;
export function isNeuroSegProduct(name: string): boolean;
export function isDentalSegProduct(name: string): boolean;
export function isTorchXrayVisionProduct(name: string): boolean;
export function isFlexrayProduct(name: string): boolean;
export function isMhubProduct(name: string): boolean;
export function isInferenceProduct(name: string): boolean;
export function normalizeProductToken(name: string): string;
export function statusItemValue(items: unknown, key: string): string | undefined;
export function isStatusPayloadOnline(data: unknown): boolean;
export function productNameFromStatusResponseItem(
  item: CastRequestResponseItem
): string;
export function totalSegmentatorAvailableFromStatusResponses(
  responses: CastRequestResponseItem[]
): boolean;
export function lungScreeningAvailableFromStatusResponses(
  responses: CastRequestResponseItem[]
): boolean;
export function neuroSegAvailableFromStatusResponses(
  responses: CastRequestResponseItem[]
): boolean;
export function dentalSegAvailableFromStatusResponses(
  responses: CastRequestResponseItem[]
): boolean;
export function torchXrayVisionAvailableFromStatusResponses(
  responses: CastRequestResponseItem[]
): boolean;
export function mhubAvailableFromStatusResponses(
  responses: CastRequestResponseItem[]
): boolean;
export function isStatusRequestDataType(value: unknown): boolean;
export function resolveTargetActorForWire(value: unknown): string | undefined;
export function resolveTargetProductNameForWire(
  value: unknown
): string | undefined;
export function stringifyForLog(value: unknown): string;
export function summarizeInboundCastMessage(message: unknown): {
  label: string;
  detail: string;
};
export function summarizeOutboundCastPublish(message: CastMessage): {
  label: string;
  detail: string;
};
export function sanitizeCastMessageForDisplay(message: unknown): unknown;
export function countEventContextObjects(event: CastEvent | undefined): number;
export function fetchHubConferences(
  hubEndpoint: string
): Promise<CastConferenceRecord[]>;
export function fetchHubConferenceTopics(
  hubEndpoint: string
): Promise<{ topic: string; timezone?: string }[]>;
export function createHubConference(
  hubEndpoint: string,
  hostTopic: string,
  title: string,
  topics: string[],
  hostUserName?: string
): Promise<void>;
export function joinHubConference(
  hubEndpoint: string,
  hostTopic: string,
  joinTopic: string,
  joinUserName?: string
): Promise<void>;
export function deleteHubConference(
  hubEndpoint: string,
  hostTopic: string,
  leaveTopic?: string
): Promise<void>;
export function transferHubConferenceLead(
  hubEndpoint: string,
  hostTopic: string,
  sceneLeaderTopic: string,
  leaderUserName?: string
): Promise<unknown>;
export function resolveHubConferenceState(
  hubEndpoint: string,
  topic: string,
  subscriberName: string
): Promise<{ active: boolean; title: string; participants: string[] }>;
export function conferenceHostTopic(
  conference: CastConferenceRecord
): string;
export function conferenceSceneLeaderTopic(
  conference: CastConferenceRecord | null | undefined
): string;
export function findActiveHubConference(
  topic: string,
  subscriberName: string,
  conferences: CastConferenceRecord[]
): CastConferenceRecord | null;
export function normalizeConferenceParticipants(raw: unknown): string[];
export function isHubConferenceHost(
  topic: string,
  conference: CastConferenceRecord | null | undefined
): boolean;
export function isHubConferenceSceneLeader(
  topic: string,
  conference: CastConferenceRecord | null | undefined
): boolean;
export function isHubConferenceParticipant(
  topic: string,
  subscriberName: string,
  conference: CastConferenceRecord | null | undefined
): boolean;

/**
 * Slicer hub client: OAuth, subscribe, WebSocket bind, publish, and typed
 * request/response (`POST /api/hub/request` fan-out).
 *
 * Typical flow: `onMessage` → `authenticate` → `getToken` → `subscribe` →
 * `publish` / `request` → `sendCastRequestResponse` on inbound `*-request` events.
 *
 * @example
 * import HubClient, { generateSubscriberName } from '@slicer-hub/client';
 * import { requestEventFor } from '@slicer-hub/client';
 *
 * const client = HubClient.newInstance({
 *   hub: {
 *     hub_endpoint: 'https://host/api/hub',
 *     authorization_endpoint: 'https://host/oauth/authorize',
 *     token_endpoint: 'https://host/oauth/token',
 *     client_id: 'client_id',
 *     client_secret: 'client_secret',
 *   },
 *   session: {
 *     subscriberName: generateSubscriberName('MYAPP'),
 *     topic: 'my-topic',
 *     events: ['*'],
 *   },
 *   autoReconnect: true,
 * });
 *
 * client.onMessage((message) => console.log(message));
 * const { code } = await client.authenticate();
 * if (await client.getToken(code)) {
 *   await client.subscribe();
 *   await client.request({
 *     'subscriber.name': client.getSessionConfig().subscriberName,
 *     event: {
 *       'hub.topic': 'my-topic',
 *       'hub.event': requestEventFor('STATUS'),
 *       context: { dataType: 'STATUS' },
 *     },
 *     'target.actor': 'WORKLIST_CLIENT',
 *   });
 * }
 *
 * @see hub-worklist-example
 */
export declare const HubClient: {
  newInstance: typeof newInstance;
  extend: typeof extend;
  applyCastPublishEnvelopeFields: typeof applyCastPublishEnvelopeFields;
  batchContextFiles: typeof batchContextFiles;
  BINARY_PLACEHOLDER: typeof BINARY_PLACEHOLDER;
  buildDicomwebImagingStudyOpenContext: typeof buildDicomwebImagingStudyOpenContext;
  buildDicomUrlImagingStudyOpenContext: typeof buildDicomUrlImagingStudyOpenContext;
  buildFilesImagingStudyOpenContext: typeof buildFilesImagingStudyOpenContext;
  buildIdcImagingStudyOpenContext: typeof buildIdcImagingStudyOpenContext;
  buildLocalDicomImagingStudyOpenContext: typeof buildLocalDicomImagingStudyOpenContext;
  buildNiftiUrlImagingStudyOpenContext: typeof buildNiftiUrlImagingStudyOpenContext;
  castMessageHasPendingFilePayloads: typeof castMessageHasPendingFilePayloads;
  HUB_CONFERENCE_EXIT_ACK_MS: typeof HUB_CONFERENCE_EXIT_ACK_MS;
  HUB_CONFERENCE_POLL_MS: typeof HUB_CONFERENCE_POLL_MS;
  HUB_CONFERENCE_POPUP_SIZE: typeof HUB_CONFERENCE_POPUP_SIZE;
  HUB_REPORTING_WINDOW_NAME: typeof HUB_REPORTING_WINDOW_NAME;
  HUB_CLASSROOM_WINDOW_NAME: typeof HUB_CLASSROOM_WINDOW_NAME;
  HUB_WORKLIST_WINDOW_NAME: typeof HUB_WORKLIST_WINDOW_NAME;
  castReportingPopupPlacement: typeof castReportingPopupPlacement;
  hubReportingPopupFeatures: typeof hubReportingPopupFeatures;
  placeHubPopupWindow: typeof placeHubPopupWindow;
  HUB_CONFERENCE_TITLE_PRESETS: typeof HUB_CONFERENCE_TITLE_PRESETS;
  HUB_DEFAULT_SUBSCRIBER_ACTOR: typeof HUB_DEFAULT_SUBSCRIBER_ACTOR;
  HUB_DICOMWEB_ROOT: typeof HUB_DICOMWEB_ROOT;
  HUB_ENVELOPE_ANY: typeof HUB_ENVELOPE_ANY;
  HUB_IDENTIFIER_DICOM_UID: typeof HUB_IDENTIFIER_DICOM_UID;
  HUB_IDENTIFIER_IDC: typeof HUB_IDENTIFIER_IDC;
  HUB_IDENTIFIER_IDC_SOURCE_BUCKET: typeof HUB_IDENTIFIER_IDC_SOURCE_BUCKET;
  HUB_IDENTIFIER_NIFTI_FILENAME: typeof HUB_IDENTIFIER_NIFTI_FILENAME;
  HUB_IDENTIFIER_NIFTI_URL: typeof HUB_IDENTIFIER_NIFTI_URL;
  HUB_IDENTIFIER_OHIF_MODE: typeof HUB_IDENTIFIER_OHIF_MODE;
  HUB_IDENTIFIER_VOLVIEW_SAMPLE_ID: typeof HUB_IDENTIFIER_VOLVIEW_SAMPLE_ID;
  HUB_IDENTIFIER_WORKLIST_SAMPLE_ID: typeof HUB_IDENTIFIER_WORKLIST_SAMPLE_ID;
  HUB_IMAGING_STUDY_OPEN_PROFILE: typeof HUB_IMAGING_STUDY_OPEN_PROFILE;
  HUB_OPEN_MODE: typeof HUB_OPEN_MODE;
  HUB_OPEN_MODE_DICOMWEB: typeof HUB_OPEN_MODE_DICOMWEB;
  HUB_OPEN_MODE_DICOM_URL: typeof HUB_OPEN_MODE_DICOM_URL;
  HUB_OPEN_MODE_FILES: typeof HUB_OPEN_MODE_FILES;
  HUB_OPEN_MODE_IDC: typeof HUB_OPEN_MODE_IDC;
  HUB_OPEN_MODE_LOCAL_DICOM: typeof HUB_OPEN_MODE_LOCAL_DICOM;
  HUB_RADIO_ICON_CLASS: typeof HUB_RADIO_ICON_CLASS;
  HUB_RADIO_ICON_SVG: typeof HUB_RADIO_ICON_SVG;
  HUB_RADIO_SLASH_CLASS: typeof HUB_RADIO_SLASH_CLASS;
  HUB_RADIO_STATUS_ICON_CLASS: typeof HUB_RADIO_STATUS_ICON_CLASS;
  castRadioStatusMarkup: typeof castRadioStatusMarkup;
  castRadioStatusVisual: typeof castRadioStatusVisual;
  collatedResponsesFromRequestResult: typeof collatedResponsesFromRequestResult;
  buildCastConferenceView: typeof buildCastConferenceView;
  castConferenceSelfStatusLabel: typeof castConferenceSelfStatusLabel;
  castConferencePlaceStatusLabel: typeof castConferencePlaceStatusLabel;
  castConferenceLeaderPlace: typeof castConferenceLeaderPlace;
  castConferenceParticipantRowStatus: typeof castConferenceParticipantRowStatus;
  renderCastConferencePresence: typeof renderCastConferencePresence;
  openHubConferenceParticipantsPopup: typeof openHubConferenceParticipantsPopup;
  closeCastConferenceParticipantsPopup: typeof closeCastConferenceParticipantsPopup;
  isHubConferenceParticipantsPopupOpen: typeof isHubConferenceParticipantsPopupOpen;
  HUB_CONFERENCE_EXIT_ACK_MS: typeof HUB_CONFERENCE_EXIT_ACK_MS;
  HUB_CONFERENCE_POLL_MS: typeof HUB_CONFERENCE_POLL_MS;
  HUB_CONFERENCE_POPUP_SIZE: typeof HUB_CONFERENCE_POPUP_SIZE;
  HUB_REPORTING_WINDOW_NAME: typeof HUB_REPORTING_WINDOW_NAME;
  HUB_CLASSROOM_WINDOW_NAME: typeof HUB_CLASSROOM_WINDOW_NAME;
  HUB_WORKLIST_WINDOW_NAME: typeof HUB_WORKLIST_WINDOW_NAME;
  castReportingPopupPlacement: typeof castReportingPopupPlacement;
  hubReportingPopupFeatures: typeof hubReportingPopupFeatures;
  placeHubPopupWindow: typeof placeHubPopupWindow;
  HUB_CONFERENCE_TITLE_PRESETS: typeof HUB_CONFERENCE_TITLE_PRESETS;
  createHubConferenceDialog: typeof createHubConferenceDialog;
  confirmHubConferenceTakeover: typeof confirmHubConferenceTakeover;
  HUB_IMAGE_DISPLAY_ACTOR: typeof HUB_IMAGE_DISPLAY_ACTOR;
  createHubConferenceInviteController: typeof createHubConferenceInviteController;
  createHubConferenceInviteDialog: typeof createHubConferenceInviteDialog;
  parseConferenceInviteFromMessage: typeof parseConferenceInviteFromMessage;
  shouldShowConferenceInvite: typeof shouldShowConferenceInvite;
  showHubInfoToast: typeof showHubInfoToast;
  conferenceHostTopic: typeof conferenceHostTopic;
  conferenceSceneLeaderTopic: typeof conferenceSceneLeaderTopic;
  countEventContextObjects: typeof countEventContextObjects;
  createHubConference: typeof createHubConference;
  joinHubConference: typeof joinHubConference;
  dataTypeFromEventName: typeof dataTypeFromEventName;
  decodeBase64ToArrayBuffer: typeof decodeBase64ToArrayBuffer;
  DEFAULT_CAST_PUBLISH_ENVELOPE_FIELDS: typeof DEFAULT_CAST_PUBLISH_ENVELOPE_FIELDS;
  deleteHubConference: typeof deleteHubConference;
  transferHubConferenceLead: typeof transferHubConferenceLead;
  ensureCastSubscribeEvents: typeof ensureCastSubscribeEvents;
  extractDicomSeriesUid: typeof extractDicomSeriesUid;
  extractDicomStudyUid: typeof extractDicomStudyUid;
  extractDicomwebRoot: typeof extractDicomwebRoot;
  extractFilePayloadsForEvent: typeof extractFilePayloadsForEvent;
  extractIdcSeriesUid: typeof extractIdcSeriesUid;
  extractIdcSourceBucket: typeof extractIdcSourceBucket;
  extractIdentifierValue: typeof extractIdentifierValue;
  extractImagingStudyFiles: typeof extractImagingStudyFiles;
  extractNiftiDownloadUrl: typeof extractNiftiDownloadUrl;
  extractNiftiFilename: typeof extractNiftiFilename;
  extractOhifMode: typeof extractOhifMode;
  extractOpenMode: typeof extractOpenMode;
  extractStudyContextItem: typeof extractStudyContextItem;
  extractStudyUIDFromResource: typeof extractStudyUIDFromResource;
  extractVolviewSampleId: typeof extractVolviewSampleId;
  fetchHubConferences: typeof fetchHubConferences;
  fetchHubConferenceTopics: typeof fetchHubConferenceTopics;
  filePayloadToArrayBuffer: typeof filePayloadToArrayBuffer;
  filePayloadToFile: typeof filePayloadToFile;
  findActiveHubConference: typeof findActiveHubConference;
  generateSubscriberName: typeof generateSubscriberName;
  getActorKeyword: typeof getActorKeyword;
  getHubEventLower: typeof getHubEventLower;
  getInboundTargetActorKeyword: typeof getInboundTargetActorKeyword;
  httpUrlFromHubEndpoint: typeof httpUrlFromHubEndpoint;
  isHubConferenceHost: typeof isHubConferenceHost;
  isHubConferenceParticipant: typeof isHubConferenceParticipant;
  isHubConferenceSceneLeader: typeof isHubConferenceSceneLeader;
  isHubEndpointInCloud: typeof isHubEndpointInCloud;
  isRequestEvent: typeof isRequestEvent;
  isResponseEvent: typeof isResponseEvent;
  isRunningInCloud: typeof isRunningInCloud;
  isStatusPayloadOnline: typeof isStatusPayloadOnline;
  isStatusRequestDataType: typeof isStatusRequestDataType;
  isTotalSegmentatorProduct: typeof isTotalSegmentatorProduct;
  isLungScreeningProduct: typeof isLungScreeningProduct;
  isNeuroSegProduct: typeof isNeuroSegProduct;
  isDentalSegProduct: typeof isDentalSegProduct;
  isTorchXrayVisionProduct: typeof isTorchXrayVisionProduct;
  isMhubProduct: typeof isMhubProduct;
  isInferenceProduct: typeof isInferenceProduct;
  lungScreeningAvailableFromStatusResponses: typeof lungScreeningAvailableFromStatusResponses;
  neuroSegAvailableFromStatusResponses: typeof neuroSegAvailableFromStatusResponses;
  dentalSegAvailableFromStatusResponses: typeof dentalSegAvailableFromStatusResponses;
  torchXrayVisionAvailableFromStatusResponses: typeof torchXrayVisionAvailableFromStatusResponses;
  mhubAvailableFromStatusResponses: typeof mhubAvailableFromStatusResponses;
  normalizeProductToken: typeof normalizeProductToken;
  HUB_INFERENCE_SERVERS: typeof HUB_INFERENCE_SERVERS;
  LOCAL_AI_SERVERS: typeof LOCAL_AI_SERVERS;
  findInferenceServerByProduct: typeof findInferenceServerByProduct;
  inferenceServerInfoText: typeof inferenceServerInfoText;
  renderInferenceServerInfoCardHtml: typeof renderInferenceServerInfoCardHtml;
  HUB_PRODUCT_MATCHERS: typeof HUB_PRODUCT_MATCHERS;
  matchesHubProduct: typeof matchesHubProduct;
  normalizeHubProductName: typeof normalizeHubProductName;
  parseProductStatusProbe: typeof parseProductStatusProbe;
  publishCastUrlSend: typeof publishCastUrlSend;
  requestCastLiveScene: typeof requestCastLiveScene;
  requestCastProductStatus: typeof requestCastProductStatus;
  requestCastStatus: typeof requestCastStatus;
  mapInferenceServersFromStatusResult: typeof mapInferenceServersFromStatusResult;
  probeCastInferenceServers: typeof probeCastInferenceServers;
  cloneContextArray: typeof cloneContextArray;
  messageEventContext: typeof messageEventContext;
  messageSubscriberName: typeof messageSubscriberName;
  messageProductName: typeof messageProductName;
  messageActor: typeof messageActor;
  parseStatusUpdateMessage: typeof parseStatusUpdateMessage;
  normalizeConferenceParticipants: typeof normalizeConferenceParticipants;
  normalizeDataType: typeof normalizeDataType;
  normalizeImagingStudyContext: typeof normalizeImagingStudyContext;
  normalizeOptionalEnvelopeField: typeof normalizeOptionalEnvelopeField;
  normalizeStudyUID: typeof normalizeStudyUID;
  openCastHubPopup: typeof openCastHubPopup;
  parseCollatedRequestResult: typeof parseCollatedRequestResult;
  productNameFromStatusResponseItem: typeof productNameFromStatusResponseItem;
  REQUEST_SUFFIX: typeof REQUEST_SUFFIX;
  requestEventFor: typeof requestEventFor;
  resolveHubConferenceClientUrl: typeof resolveHubConferenceClientUrl;
  resolveHubConferenceState: typeof resolveHubConferenceState;
  resolveHubConferenceView: typeof resolveHubConferenceView;
  resolveHubFileMessage: typeof resolveHubFileMessage;
  resolveHubAdminUrl: typeof resolveHubAdminUrl;
  resolveHubPublishEnvelopeFields: typeof resolveHubPublishEnvelopeFields;
  resolveImagingStudyOpenPlan: typeof resolveImagingStudyOpenPlan;
  resolveTargetActorForWire: typeof resolveTargetActorForWire;
  resolveTargetProductNameForWire: typeof resolveTargetProductNameForWire;
  responseEventFor: typeof responseEventFor;
  RESPONSE_SUFFIX: typeof RESPONSE_SUFFIX;
  sanitizeCastMessageForDisplay: typeof sanitizeCastMessageForDisplay;
  selectFirstMatchingHubKey: typeof selectFirstMatchingHubKey;
  statusItemValue: typeof statusItemValue;
  stringifyForLog: typeof stringifyForLog;
  summarizeInboundCastMessage: typeof summarizeInboundCastMessage;
  summarizeOutboundCastPublish: typeof summarizeOutboundCastPublish;
  TOTAL_SEGMENTATOR_PRODUCT_ALIASES: typeof TOTAL_SEGMENTATOR_PRODUCT_ALIASES;
  LUNG_SCREENING_PRODUCT_ALIASES: typeof LUNG_SCREENING_PRODUCT_ALIASES;
  NEURO_SEG_PRODUCT_ALIASES: typeof NEURO_SEG_PRODUCT_ALIASES;
  DENTAL_SEG_PRODUCT_ALIASES: typeof DENTAL_SEG_PRODUCT_ALIASES;
  TORCHXRAYVISION_PRODUCT_ALIASES: typeof TORCHXRAYVISION_PRODUCT_ALIASES;
  MHUB_PRODUCT_ALIASES: typeof MHUB_PRODUCT_ALIASES;
  totalSegmentatorAvailableFromStatusResponses: typeof totalSegmentatorAvailableFromStatusResponses;
};

export default HubClient;
