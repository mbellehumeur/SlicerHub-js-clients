import type { CastConferencePlace, CastConferenceView } from '@slicer-hub/client';
export type { CastConferencePlace, CastConferenceView } from '@slicer-hub/client';

/** Lucide-style radio waves SVG class name. */
export const HUB_RADIO_ICON_CLASS: string;
/** Hub connection radio mark SVG (uses currentColor). */
export const HUB_RADIO_ICON_SVG: string;
export const HUB_RADIO_SLASH_CLASS: string;
export const HUB_RADIO_STATUS_ICON_CLASS: string;

/** Lucide-style two-people Conferencing SVG class name. */
export const HUB_CONFERENCE_ICON_CLASS: string;
/** Conferencing mark SVG (uses currentColor). */
export const HUB_CONFERENCE_ICON_SVG: string;

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

export interface CastConferenceDialogSession {
  hubEndpoint?: string;
  topic?: string;
  subscriberName?: string;
  userName?: string;
  connected?: boolean;
  /** Hub session JWT (OIDC / mock); sent as Authorization Bearer on conference APIs. */
  accessToken?: string;
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
  onUserNameChange?: (userName: string) => void | Promise<void>;
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
