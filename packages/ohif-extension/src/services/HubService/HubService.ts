import { PubSubService, Types as OhifTypes } from '@ohif/core';
import HubClient, {
  type HubClientConfig,
  type CastMessage,
  type HubConfig,
  type HubInferenceServerDef,
  type CastProductStatusProbe,
  applyCastPublishEnvelopeFields,
  buildInferenceRunContextExtras,
  DEFAULT_CAST_PUBLISH_ENVELOPE_FIELDS,
  generateSubscriberName,
  getHubEventLower,
  isRequestEvent,
  isStatusRequestDataType,
  normalizeConferenceParticipants,
  probeCastInferenceServers,
  requestEventFor,
  resolveHubConferenceState,
  resolveHubFileMessage,
  resolveHubPublishEnvelopeFields,
  resolveTargetActorForWire,
  resolveTargetProductNameForWire,
  totalSegmentatorAvailableFromStatusResponses,
  type CastPublishEnvelopeFields,
} from '@slicer-hub/client';
import {
  buildStatusResponsePayload,
  isLungScreeningProduct,
  isNeuroSegProduct,
  isTotalSegmentatorProduct,
  lungScreeningAvailableFromStatusResponses,
  neuroSegAvailableFromStatusResponses,
} from '../../hub/build-status-response';
import {
  HUB_OHIF_PRODUCT_NAME,
  HUB_TOPIC_SESSION_KEY,
  LOG_PREFIX,
  LUNG_SCREENING_PRODUCT_NAME,
  NEURO_SEG_PRODUCT_NAME,
  TOTAL_SEGMENTATOR_PRODUCT_NAME,
} from '../../hub/constants';
import {
  HubExtensionConfig,
  ensureCastSubscribeEvents,
  resolveHubFromConfig,
} from '../../hub/config';
import { setOhifHubRuntime, type OhifHubExtensionManagerLike } from '../../hub/ohif-hub-runtime';
import { buildGetRequestImagePayload, normalizeGetRequestDataType } from '../../hub/get-response-image';
import { tryApplyPendingUsAnnotations } from '../../hub/import-us-annotations';
import {
  handleAnnotationEvent,
  ImagingStudyHandler,
} from '../../hub/imaging-study-handler';
import { waitForHubRouter } from '../../hub/hub-navigate';
import {
  handleDicomSendMessage,
  handleNiftiSendMessage,
} from '../../hub/dicom-send-handler';
import {
  buildHubUrlSendManifestFromActiveSeries,
} from '../../hub/publish/build-dicom-send-url-manifest';
import {
  buildDicomSendFromActiveSeries,
  buildDicomSendFromActiveStudy,
  buildDicomSendFromSlice,
  buildDicomSendFromStudy,
  type DicomSendFileEntry,
} from '../../hub/publish/build-dicom-send-from-display-set';
import {
  normalizeTotalSegmentatorOptions,
  type TotalSegmentatorOptions,
} from '../../hub/total-segmentator-options';
import {
  buildHubHeaderStatus,
  hubHeaderStatusEqual,
  type HubHeaderStatusState,
} from '../../hub/hub-header-status';
import {
  showImagingStudyOpenLoadingNotification,
  shouldShowImagingStudyOpenLoadingNotification,
  type ImagingStudyOpenResult,
} from '../../hub/imaging-study-open-notification';
import type {
  HubClientLike,
  CommandsManagerLike,
  ServicesManagerLike,
} from '../../hub/types';
import {
  DEFAULT_TARGET_ACTOR_KEYWORD,
  ID_ACTOR_KEYWORD,
  WORKLIST_CLIENT_ACTOR_KEYWORD,
} from '../../hub/types';
type ExtensionManagerLike = {
  appConfig: {
    hub?: HubExtensionConfig;
    /** @deprecated Prefer appConfig.hub */
    fhircast?: HubExtensionConfig;
  };
  updateDataSourceConfiguration?: (name: string, config: unknown) => void;
  getDataSources?: (name: string) => unknown[] | undefined;
  setActiveDataSource?: (name: string) => void;
};

type HubRequestResponseItem = {
  id: string | null;
  subscriber: string | null;
  actor: string | null;
  productName?: string | null;
  data?: unknown;
};

type HubRequestEnvelope = {
  responses?: HubRequestResponseItem[];
};

function ensureIdActor(actors?: string[]): string[] {
  const list = Array.isArray(actors) ? actors.filter(Boolean) : [];
  return list.includes(ID_ACTOR_KEYWORD) ? list : [...list, ID_ACTOR_KEYWORD];
}

function getInboundTargetActorKeyword(message: {
  'target.actor'?: unknown;
}): string {
  const dotted = message['target.actor'];
  if (dotted === undefined || dotted === null) {
    return '';
  }
  return getActorKeyword(dotted);
}

function getActorKeyword(actor: unknown): string {
  if (typeof actor === 'string') {
    return actor.trim().toUpperCase();
  }
  if (!actor || typeof actor !== 'object') {
    return '';
  }
  const typedActor = actor as { keyword?: unknown; id?: unknown; key?: unknown };
  const value =
    (typeof typedActor.keyword === 'string' && typedActor.keyword) ||
    (typeof typedActor.id === 'string' && typedActor.id) ||
    (typeof typedActor.key === 'string' && typedActor.key) ||
    '';
  return value.trim().toUpperCase();
}

function decodeTopicFromJwt(token: string): string {
  try {
    const parts = token.split('.');
    if (parts.length < 2) {
      return '';
    }
    const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const paddingLength = (4 - (payloadBase64.length % 4)) % 4;
    const paddedPayload = payloadBase64 + '='.repeat(paddingLength);
    const payloadJson = atob(paddedPayload);
    const payload = JSON.parse(payloadJson) as { topic?: unknown };
    return typeof payload.topic === 'string' ? payload.topic.trim() : '';
  } catch {
    return '';
  }
}

export default class HubService extends PubSubService {
  public static EVENTS = {
    MESSAGE_RECEIVED: 'event::HubService:messageReceived',
    STATUS_CHANGED: 'event::HubService:statusChanged',
  };

  public static REGISTRATION = {
    name: 'hubService',
    altName: 'HubService',
    create: ({
      extensionManager,
      commandsManager,
      servicesManager,
    }: OhifTypes.Extensions.ExtensionParams) =>
      new HubService(
        extensionManager as ExtensionManagerLike,
        commandsManager as CommandsManagerLike,
        servicesManager as ServicesManagerLike
      ),
  };

  private _client: HubClientLike;
  private _commandsManager: CommandsManagerLike;
  private _servicesManager: ServicesManagerLike;
  private _imagingStudyHandler: ImagingStudyHandler;
  private _publishEnvelopeFields: CastPublishEnvelopeFields =
    DEFAULT_CAST_PUBLISH_ENVELOPE_FIELDS;
  private _subscriberName = '';
  private _productName = HUB_OHIF_PRODUCT_NAME;
  /** Hub access token from worklist deep-link (`id-token` query); skips OAuth when set. */
  private _urlHubAccessToken = '';
  private _wsState = '';
  private _totalSegmentatorAvailable = false;
  private _totalSegmentatorJobStatus = '';
  private _lungScreeningAvailable = false;
  private _lungScreeningJobStatus = '';
  private _neuroSegAvailable = false;
  private _neuroSegJobStatus = '';
  private _conferenceActive = false;
  private _conferenceTitle = '';
  private _conferenceParticipants: string[] = [];
  private _lastBroadcastHubHeaderStatus: HubHeaderStatusState | null = null;
  private _statusRequestedForSession = false;

  constructor(
    extensionManager: ExtensionManagerLike,
    commandsManager: CommandsManagerLike,
    servicesManager: ServicesManagerLike
  ) {
    super(HubService.EVENTS);
    this._commandsManager = commandsManager;
    this._servicesManager = servicesManager;

    const hubExtensionConfig = extensionManager.appConfig.hub || extensionManager.appConfig.fhircast;
    if (!hubExtensionConfig) {
      throw new Error('HubService: missing hub configuration (appConfig.hub)');
    }

    const selectedHub = resolveHubFromConfig(hubExtensionConfig);
    const callbackUrl =
      typeof window !== 'undefined' ? `${window.location.origin}/castCallback` : undefined;

    const { topic: initialTopic, preserveSessionTopicFromToken } =
      this._resolveInitialTopic(hubExtensionConfig.topic);

    const productName = hubExtensionConfig.productName ?? HUB_OHIF_PRODUCT_NAME;
    this._productName = productName;
    const productVersion = hubExtensionConfig.productVersion ?? '1.0';
    const subscriberName =
      hubExtensionConfig.subscriberName?.trim() || generateSubscriberName(productName);
    this._subscriberName = subscriberName;
    this._publishEnvelopeFields = resolveHubPublishEnvelopeFields(
      {},
      { subscriberName }
    );

    const clientConfig: HubClientConfig = {
      hub: selectedHub,
      session: {
        actors: ensureIdActor(hubExtensionConfig.actors),
        topic: initialTopic,
        events: ensureCastSubscribeEvents(selectedHub.events ?? ['*']),
        lease: selectedHub.lease ?? 999,
        productName,
        productVersion,
        subscriberName,
        defaultTargetActor: DEFAULT_TARGET_ACTOR_KEYWORD,
      },
      callbackUrl,
      autoReconnect: hubExtensionConfig.autoReconnect ?? true,
      preserveSessionTopicFromToken,
    };

    this._client = HubClient.newInstance(clientConfig) as HubClientLike;

    setOhifHubRuntime({
      extensionManager: extensionManager as OhifHubExtensionManagerLike,
    });

    this._imagingStudyHandler = new ImagingStudyHandler({
      scheduleHubDicomSendLayer: meta => this._scheduleHubDicomSendLayer(meta),
    });

    this._registerMessageHandlers();

    this._client.onConnectionStateChange((wsState: string) => {
      this._broadcastHubStatus(wsState);
      if (wsState === 'connected') {
        if (!this._statusRequestedForSession) {
          this._statusRequestedForSession = true;
          // Wait for React Router so study navigation stays SPA (no WS tear-down).
          void waitForHubRouter().then(() => {
            if (this._wsState !== 'connected') {
              return;
            }
            void this._requestStatus({
              loadWorklistStudy: true,
              clearTotalSegmentatorAvailability: true,
              clearLungScreeningAvailability: true,
              clearNeuroSegAvailability: true,
              targetActor: WORKLIST_CLIENT_ACTOR_KEYWORD,
            });
          });
        }
        void this._syncConferenceActive();
      } else if (wsState === 'disconnected' || wsState === 'error') {
        this._statusRequestedForSession = false;
        this._totalSegmentatorAvailable = false;
        this._totalSegmentatorJobStatus = '';
        this._lungScreeningAvailable = false;
        this._lungScreeningJobStatus = '';
        this._neuroSegAvailable = false;
        this._neuroSegJobStatus = '';
        this._setConferenceActive(false);
      }
    });

    void this._start();
  }

  public destroy(): void {
    this._client.delete();
  }

  public getHub(): HubConfig {
    return this._client.getHubConfig();
  }

  public setTopic(topic: string): void {
    this._client.setTopic(topic);
    this._writeStoredTopic(topic);
    this._broadcastHubStatus();
  }

  public getHubHeaderStatus() {
    const topic = this._client.getSessionConfig().topic?.trim() ?? '';
    const hub = this._client.getHubConfig();
    const hubLabel = hub.friendlyName?.trim() || hub.name?.trim() || 'Hub';
    const subscriberName =
      this._subscriberName.trim() ||
      this._client.getSessionConfig().subscriberName?.trim() ||
      '';
    return buildHubHeaderStatus(
      topic,
      hubLabel,
      subscriberName,
      this._wsState,
      this._totalSegmentatorAvailable,
      this._totalSegmentatorJobStatus,
      this._lungScreeningAvailable,
      this._lungScreeningJobStatus,
      this._neuroSegAvailable,
      this._neuroSegJobStatus,
      this._conferenceActive,
      this._conferenceTitle,
      this._conferenceParticipants
    );
  }

  public setTotalSegmentatorAvailable(available: boolean): void {
    this._totalSegmentatorAvailable = available;
  }

  public clearTotalSegmentatorJobStatus(): void {
    this._totalSegmentatorJobStatus = '';
    this._broadcastHubStatus();
  }

  public appendTotalSegmentatorJobStatusLine(line: string): void {
    const text = String(line ?? '').trim();
    if (!text) {
      return;
    }
    const current = this._totalSegmentatorJobStatus;
    this._totalSegmentatorJobStatus = current ? `${current}\n${text}` : text;
  }

  public setLungScreeningAvailable(available: boolean): void {
    this._lungScreeningAvailable = available;
  }

  public clearLungScreeningJobStatus(): void {
    this._lungScreeningJobStatus = '';
    this._broadcastHubStatus();
  }

  public appendLungScreeningJobStatusLine(line: string): void {
    const text = String(line ?? '').trim();
    if (!text) {
      return;
    }
    const current = this._lungScreeningJobStatus;
    this._lungScreeningJobStatus = current ? `${current}\n${text}` : text;
  }

  public setNeuroSegAvailable(available: boolean): void {
    this._neuroSegAvailable = available;
  }

  public clearNeuroSegJobStatus(): void {
    this._neuroSegJobStatus = '';
    this._broadcastHubStatus();
  }

  public appendNeuroSegJobStatusLine(line: string): void {
    const text = String(line ?? '').trim();
    if (!text) {
      return;
    }
    const current = this._neuroSegJobStatus;
    this._neuroSegJobStatus = current ? `${current}\n${text}` : text;
  }

  public setConferenceActive(
    active: boolean,
    title = '',
    participants?: string[]
  ): void {
    this._setConferenceActive(active, title, participants);
  }

  public setSubscriberName(subscriberName: string): void {
    this._subscriberName = subscriberName;
    this._client.setSubscriberName(subscriberName);
    this._publishEnvelopeFields = resolveHubPublishEnvelopeFields(
      { subscriberName },
      { subscriberName }
    );
  }

  public setPublishEnvelopeFields(fields: Partial<CastPublishEnvelopeFields>): void {
    this._publishEnvelopeFields = resolveHubPublishEnvelopeFields(
      { ...this._publishEnvelopeFields, ...fields },
      { subscriberName: this._subscriberName }
    );
  }

  public async authenticate() {
    return this._client.authenticate();
  }

  public async getToken(): Promise<boolean> {
    const { code } = await this.authenticate();
    if (!code) {
      return false;
    }
    return this._client.getToken(code);
  }

  public async hubSubscribe(): Promise<number | string> {
    const subscribeResult = await this._client.subscribe();
    console.info(`${LOG_PREFIX} hubSubscribe result`, subscribeResult);
    return subscribeResult;
  }

  public async hubUnsubscribe(): Promise<void> {
    return this._client.unsubscribe();
  }

  public async hubPublish(
    hubMessage: Record<string, unknown>,
    envelopeOverride?: Partial<CastPublishEnvelopeFields>
  ): Promise<Response | null> {
    const message = { ...hubMessage } as CastMessage;
    const fields = resolveHubPublishEnvelopeFields(
      { ...this._publishEnvelopeFields, ...envelopeOverride },
      { subscriberName: this._subscriberName }
    );
    applyCastPublishEnvelopeFields(message, fields);
    return this._client.publish(message);
  }

  public getConnectionState() {
    return this._client.getConnectionState();
  }

  public getSessionConfig() {
    return this._client.getSessionConfig();
  }

  public async publishDicomSendSeries(): Promise<Response | null> {
    const files = await buildDicomSendFromActiveSeries(this._servicesManager);
    return this._publishBinaryBatchFiles('dicom-send', files);
  }

  public async publishDicomSendStudy(): Promise<Response | null> {
    const files = await buildDicomSendFromActiveStudy(this._servicesManager);
    return this._publishBinaryBatchFiles('dicom-send', files);
  }

  public async publishDicomSendSlice(
    studyInstanceUID: string,
    seriesInstanceUID: string,
    sopInstanceUID: string
  ): Promise<Response | null> {
    const files = await buildDicomSendFromSlice(
      studyInstanceUID,
      seriesInstanceUID,
      sopInstanceUID
    );
    return this._publishBinaryBatchFiles('dicom-send', files);
  }

  public async publishDicomSendFromStudyUid(
    studyInstanceUID: string,
    scope: 'study' | 'series' = 'series',
    seriesInstanceUID?: string
  ): Promise<Response | null> {
    const files = await buildDicomSendFromStudy(
      studyInstanceUID,
      scope,
      seriesInstanceUID
    );
    return this._publishBinaryBatchFiles('dicom-send', files);
  }

  /**
   * Probe all enabled catalog Evidence Creators with one collated STATUS request.
   */
  public async probeInferenceServers(): Promise<
    Array<{ server: HubInferenceServerDef; probe: CastProductStatusProbe }>
  > {
    const session = this._client.getSessionConfig();
    const subscriberName =
      this._subscriberName.trim() || session.subscriberName?.trim() || '';
    return probeCastInferenceServers(this._client, {
      subscriberName,
      subscriberProductName: session.productName,
      subscriberActor: this._publishEnvelopeFields.subscriberActor,
      topic: session.topic,
    });
  }

  /**
   * Send the active series to a catalog Evidence Creator via URL-only publish.
   */
  public async publishInferenceServerSend(
    server: HubInferenceServerDef,
    options: {
      totalSegmentator?: Partial<TotalSegmentatorOptions>;
    } = {}
  ): Promise<Response | null> {
    const topic = this._client.getSessionConfig().topic?.trim() ?? '';
    if (!topic) {
      throw new Error('Hub topic is not configured');
    }
    const product = String(server?.product || '').trim();
    if (!product) {
      throw new Error('Inference server has no product name');
    }

    const manifest = buildHubUrlSendManifestFromActiveSeries(this._servicesManager);
    const runOptions =
      server.id === 'totalseg'
        ? {
            totalSegmentator: normalizeTotalSegmentatorOptions(
              options.totalSegmentator
            ),
          }
        : options;
    const contextExtras = buildInferenceRunContextExtras(server, runOptions);

    return this.hubPublish(
      {
        event: {
          'hub.topic': topic,
          'hub.event': manifest.hubEvent,
          context: {
            files: manifest.files,
            ...contextExtras,
          },
        },
      },
      {
        targetActor: DEFAULT_TARGET_ACTOR_KEYWORD,
        targetProductName: product,
      }
    );
  }

  /**
   * Send the active series to TotalSegmentator via URL-only publish (no binary batch).
   */
  public async publishTotalSegmentatorSend(
    options: Partial<TotalSegmentatorOptions> = {}
  ): Promise<Response | null> {
    const topic = this._client.getSessionConfig().topic?.trim() ?? '';
    if (!topic) {
      throw new Error('Hub topic is not configured');
    }

    const manifest = buildHubUrlSendManifestFromActiveSeries(this._servicesManager);
    const totalSegmentator = normalizeTotalSegmentatorOptions(options);

    return this.hubPublish(
      {
        event: {
          'hub.topic': topic,
          'hub.event': manifest.hubEvent,
          context: {
            files: manifest.files,
            totalSegmentator,
          },
        },
      },
      { targetActor: DEFAULT_TARGET_ACTOR_KEYWORD }
    );
  }

  /**
   * Probe TotalSegmentator availability via STATUS request to ``TOTALSEG``.
   */
  public async requestTotalSegmentatorStatus(): Promise<boolean> {
    const responses = await this._requestStatus({
      targetProductName: TOTAL_SEGMENTATOR_PRODUCT_NAME,
      loadWorklistStudy: false,
      clearTotalSegmentatorAvailability: true,
    });
    return totalSegmentatorAvailableFromStatusResponses(responses);
  }

  /**
   * Send the active series to lung screening via URL-only publish (DICOM or NIfTI).
   */
  public async publishLungScreeningSend(): Promise<Response | null> {
    const topic = this._client.getSessionConfig().topic?.trim() ?? '';
    if (!topic) {
      throw new Error('Hub topic is not configured');
    }

    const manifest = buildHubUrlSendManifestFromActiveSeries(this._servicesManager);

    return this.hubPublish(
      {
        event: {
          'hub.topic': topic,
          'hub.event': manifest.hubEvent,
          context: {
            files: manifest.files,
          },
        },
      },
      {
        targetActor: DEFAULT_TARGET_ACTOR_KEYWORD,
        targetProductName: LUNG_SCREENING_PRODUCT_NAME,
      }
    );
  }

  /**
   * Probe lung screening availability via STATUS request to ``LUNGSCREENING``.
   */
  public async requestLungScreeningStatus(): Promise<boolean> {
    const responses = await this._requestStatus({
      targetProductName: LUNG_SCREENING_PRODUCT_NAME,
      loadWorklistStudy: false,
      clearLungScreeningAvailability: true,
    });
    return lungScreeningAvailableFromStatusResponses(responses);
  }

  /**
   * Send the active volume to neurosegmentation via URL-only publish (NIfTI when available).
   */
  public async publishNeuroSegSend(): Promise<Response | null> {
    const topic = this._client.getSessionConfig().topic?.trim() ?? '';
    if (!topic) {
      throw new Error('Hub topic is not configured');
    }

    const manifest = buildHubUrlSendManifestFromActiveSeries(this._servicesManager);

    return this.hubPublish(
      {
        event: {
          'hub.topic': topic,
          'hub.event': manifest.hubEvent,
          context: {
            files: manifest.files,
          },
        },
      },
      {
        targetActor: DEFAULT_TARGET_ACTOR_KEYWORD,
        targetProductName: NEURO_SEG_PRODUCT_NAME,
      }
    );
  }

  /**
   * Probe neurosegmentation availability via STATUS request to ``NEURO_SEG``.
   */
  public async requestNeuroSegStatus(): Promise<boolean> {
    const responses = await this._requestStatus({
      targetProductName: NEURO_SEG_PRODUCT_NAME,
      loadWorklistStudy: false,
      clearNeuroSegAvailability: true,
    });
    return neuroSegAvailableFromStatusResponses(responses);
  }

  private async _publishBinaryBatchFiles(
    hubEvent: 'dicom-send' | 'nifti-send',
    files: DicomSendFileEntry[]
  ): Promise<Response | null> {
    const topic = this._client.getSessionConfig().topic?.trim() ?? '';
    if (!topic) {
      throw new Error('Hub topic is not configured');
    }
    return this.hubPublish({
      event: {
        'hub.topic': topic,
        'hub.event': hubEvent,
        context: { files },
      },
    });
  }

  private _registerMessageHandlers(): void {
    this._client.onMessage((message: CastMessage) => {
      const event = message?.event;
      if (!event) {
        return;
      }
      const hubEvent = getHubEventLower(event);

      if (isRequestEvent(hubEvent)) {
        Promise.resolve(this._handleGetRequest(message, event)).catch(error => {
          console.error(`${LOG_PREFIX} request handler failed for "${hubEvent}"`, error);
        });
        return;
      }

      if (hubEvent === 'imagingstudy-open') {
        void this._handleImagingStudyOpen(message);
        return;
      }
      if (hubEvent === 'imagingstudy-close') {
        this._imagingStudyHandler.handleClose();
        return;
      }
      if (hubEvent === 'dicom-send') {
        void this._handleBinaryEvent(message, 'dicom-send');
        return;
      }
      if (hubEvent === 'nifti-send') {
        void this._handleBinaryEvent(message, 'nifti-send');
        return;
      }
      if (hubEvent === 'status-update') {
        const context = event.context;
        const raw =
          context && typeof context === 'object' && !Array.isArray(context)
            ? (context as { message?: unknown }).message
            : undefined;
        if (typeof raw === 'string') {
          const sourceProduct = String(
            message['subscriber.product.name'] ?? ''
          ).trim();
          if (isLungScreeningProduct(sourceProduct)) {
            this.appendLungScreeningJobStatusLine(raw);
          } else if (isNeuroSegProduct(sourceProduct)) {
            this.appendNeuroSegJobStatusLine(raw);
          } else if (isTotalSegmentatorProduct(sourceProduct)) {
            this.appendTotalSegmentatorJobStatusLine(raw);
          } else {
            this.appendTotalSegmentatorJobStatusLine(raw);
          }
          this._broadcastHubStatus();
        }
        return;
      }
      if (hubEvent === 'conference-start') {
        const context = event.context;
        const title =
          context && typeof context === 'object' && !Array.isArray(context)
            ? String((context as { title?: unknown }).title ?? '').trim()
            : '';
        const participants = normalizeConferenceParticipants(
          context && typeof context === 'object' && !Array.isArray(context)
            ? (context as { participants?: unknown }).participants
            : undefined
        );
        this._setConferenceActive(true, title, participants);
        return;
      }
      if (hubEvent === 'conference-end') {
        const context = event.context;
        const leaveTopic =
          context && typeof context === 'object' && !Array.isArray(context)
            ? String((context as { leaveTopic?: unknown }).leaveTopic ?? '').trim()
            : '';
        const sessionTopic =
          this._client.getSessionConfig().topic?.trim() ?? '';
        if (!leaveTopic || !sessionTopic || leaveTopic === sessionTopic) {
          this._setConferenceActive(false);
        }
        return;
      }
      if (hubEvent === 'annotation-update' || hubEvent === 'annotation-delete') {
        handleAnnotationEvent(message, this._servicesManager);
      }
    });
  }

  private _showImagingStudyOpenNotification(
    loadPromise: Promise<ImagingStudyOpenResult | null>,
    logLabel = 'imagingstudy-open'
  ): void {
    showImagingStudyOpenLoadingNotification(this._servicesManager, loadPromise);
    loadPromise.catch(err => {
      console.error(`${LOG_PREFIX} ${logLabel} failed`, err);
    });
  }

  private async _handleImagingStudyOpen(message: CastMessage): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    const loadPromise = this._loadImagingStudyOpen(message);
    if (shouldShowImagingStudyOpenLoadingNotification(message.event)) {
      this._showImagingStudyOpenNotification(loadPromise);
      return;
    }
    loadPromise.catch(err => {
      console.error(`${LOG_PREFIX} imagingstudy-open failed`, err);
    });
  }

  private async _loadImagingStudyOpen(
    message: CastMessage
  ): Promise<ImagingStudyOpenResult | null> {
    const resolved = await resolveHubFileMessage(this._client, message);
    const event = resolved?.event;
    if (!event) {
      return null;
    }
    await this._imagingStudyHandler.handleOpen(event, resolved);
    tryApplyPendingUsAnnotations(this._servicesManager);
    return { event, message: resolved };
  }

  private async _handleBinaryEvent(
    message: CastMessage,
    kind: 'dicom-send' | 'nifti-send'
  ): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const resolved = await resolveHubFileMessage(this._client, message);
      if (kind === 'dicom-send') {
        await handleDicomSendMessage(resolved, {
          scheduleHubDicomSendLayer: meta => this._scheduleHubDicomSendLayer(meta),
        });
      } else {
        await handleNiftiSendMessage(resolved);
      }
    } catch (err) {
      console.error(`${LOG_PREFIX} ${kind} payload fetch failed`, err);
    }
  }

  private _handleGetRequest(message: CastMessage, event: CastMessage['event']): void {
    if (!this._client.sendCastRequestResponse || !event) {
      return;
    }

    const context =
      event.context && typeof event.context === 'object'
        ? (event.context as Record<string, unknown>)
        : {};
    const correlationId = context.id;
    if (typeof correlationId !== 'string' || !correlationId) {
      return;
    }

    if (isStatusRequestDataType(context.dataType)) {
      const statusPayload = buildStatusResponsePayload(
        this._productName,
        this._servicesManager
      );
      this._client.sendCastRequestResponse(
        correlationId,
        'STATUS',
        statusPayload,
        typeof event['hub.topic'] === 'string' ? event['hub.topic'] : undefined
      );
      console.info(`${LOG_PREFIX} status-response`, {
        id: correlationId,
        viewportCount: statusPayload.sceneview.viewports.length,
      });
      return;
    }

    const targetKeyword = getInboundTargetActorKeyword(message);
    if (
      targetKeyword &&
      targetKeyword !== '*' &&
      targetKeyword !== ID_ACTOR_KEYWORD
    ) {
      return;
    }

    const dataType = normalizeGetRequestDataType(context.dataType);
    if (!dataType) {
      return;
    }

    const image = buildGetRequestImagePayload(dataType);
    if (!image?.data) {
      return;
    }

    this._client.sendCastRequestResponse(
      correlationId,
      typeof context.dataType === 'string' ? context.dataType : dataType,
      {
        'context.type': 'Image',
        context: [
          {
            key: 'image',
            resource: {
              resourceType: 'Binary',
              contentType: image.contentType,
              data: image.data,
            },
          },
        ],
      },
      typeof event['hub.topic'] === 'string' ? event['hub.topic'] : undefined
    );
  }

  private _applyStatusAvailabilityFromResponses(
    responses: HubRequestResponseItem[],
    targetProductName?: string
  ): void {
    const target = String(targetProductName ?? '').trim();
    if (!target) {
      this.setTotalSegmentatorAvailable(
        totalSegmentatorAvailableFromStatusResponses(responses)
      );
      this.setLungScreeningAvailable(
        lungScreeningAvailableFromStatusResponses(responses)
      );
      this.setNeuroSegAvailable(neuroSegAvailableFromStatusResponses(responses));
      return;
    }
    if (isLungScreeningProduct(target)) {
      this.setLungScreeningAvailable(
        lungScreeningAvailableFromStatusResponses(responses)
      );
      return;
    }
    if (isNeuroSegProduct(target)) {
      this.setNeuroSegAvailable(neuroSegAvailableFromStatusResponses(responses));
      return;
    }
    if (isTotalSegmentatorProduct(target)) {
      this.setTotalSegmentatorAvailable(
        totalSegmentatorAvailableFromStatusResponses(responses)
      );
    }
  }

  private async _requestStatus(options?: {
    targetActor?: string;
    targetProductName?: string;
    loadWorklistStudy?: boolean;
    clearTotalSegmentatorAvailability?: boolean;
    clearLungScreeningAvailability?: boolean;
    clearNeuroSegAvailability?: boolean;
  }): Promise<HubRequestResponseItem[]> {
    const subscriber = this._client.getSessionConfig().subscriberName?.trim() ?? '';
    if (!subscriber) {
      return [];
    }

    const loadWorklistStudy = options?.loadWorklistStudy ?? true;
    if (options?.clearTotalSegmentatorAvailability) {
      this.setTotalSegmentatorAvailable(false);
      this.clearTotalSegmentatorJobStatus();
    }
    if (options?.clearLungScreeningAvailability) {
      this.setLungScreeningAvailable(false);
      this.clearLungScreeningJobStatus();
    }
    if (options?.clearNeuroSegAvailability) {
      this.setNeuroSegAvailable(false);
      this.clearNeuroSegJobStatus();
    }

    try {
      const topic = this._client.getSessionConfig().topic?.trim() ?? '';
      const statusDataType = 'STATUS';
      const message: CastMessage = {
        'subscriber.name': subscriber,
        'subscriber.product.name': this._productName,
        event: {
          'hub.event': requestEventFor(statusDataType),
          ...(topic ? { 'hub.topic': topic } : {}),
          context: { dataType: statusDataType },
        },
        'subscriber.actor': ID_ACTOR_KEYWORD,
      };
      const wireTargetActor = resolveTargetActorForWire(
        options?.targetActor ??
          (loadWorklistStudy ? WORKLIST_CLIENT_ACTOR_KEYWORD : undefined)
      );
      if (wireTargetActor !== undefined) {
        message['target.actor'] = wireTargetActor;
      }
      const wireTargetProduct = resolveTargetProductNameForWire(
        options?.targetProductName
      );
      if (wireTargetProduct !== undefined) {
        message['target.product.name'] = wireTargetProduct;
      }

      const result = await this._client.request(message);

      if (!result.ok) {
        console.warn(`${LOG_PREFIX} STATUS request failed`, result.status);
        return [];
      }

      const envelope =
        (result.data && typeof result.data === 'object'
          ? (result.data as HubRequestEnvelope)
          : undefined) ?? {};
      const responses = Array.isArray(envelope.responses)
        ? (envelope.responses as HubRequestResponseItem[])
        : [];
      this._applyStatusAvailabilityFromResponses(
        responses,
        options?.targetProductName
      );
      this._broadcastHubStatus();

      if (!loadWorklistStudy) {
        return responses;
      }

      let chosenData: unknown;
      for (const item of responses) {
        const actor = String(item?.actor ?? '').trim().toUpperCase();
        const itemData = item?.data;
        if (
          itemData &&
          typeof itemData === 'object' &&
          (itemData as { 'context.type'?: unknown })['context.type'] ===
            'ImagingStudy' &&
          (actor === 'WORKLIST_CLIENT' || chosenData === undefined)
        ) {
          chosenData = itemData;
          if (actor === 'WORKLIST_CLIENT') {
            break;
          }
        }
      }
      if (chosenData !== undefined) {
        const loadPromise = this._openStudyFromContextData(chosenData);
        this._showImagingStudyOpenNotification(
          loadPromise,
          'imagingstudy-open from STATUS'
        );
        await loadPromise;
      }
      return responses;
    } catch (err) {
      console.error(`${LOG_PREFIX} failed to request STATUS`, err);
      return [];
    }
  }

  private async _openStudyFromContextData(
    data: unknown
  ): Promise<ImagingStudyOpenResult | null> {
    if (!data || typeof data !== 'object') {
      return null;
    }
    const typedData = data as {
      'context.type'?: unknown;
      context?: Array<{ key?: string; resource?: unknown }> | unknown;
    };
    if (typedData['context.type'] !== 'ImagingStudy') {
      return null;
    }
    const event: NonNullable<CastMessage['event']> = {
      context: typedData.context,
    };
    const message: CastMessage = {
      'subscriber.product.name': WORKLIST_CLIENT_ACTOR_KEYWORD,
    };
    await this._imagingStudyHandler.handleOpen(event, message);
    tryApplyPendingUsAnnotations(this._servicesManager);
    return { event, message };
  }

  private _readStoredTopic(): string {
    if (typeof window === 'undefined') {
      return '';
    }
    try {
      return window.sessionStorage.getItem(HUB_TOPIC_SESSION_KEY)?.trim() ?? '';
    } catch {
      return '';
    }
  }

  private _writeStoredTopic(topic: string): void {
    if (typeof window === 'undefined') {
      return;
    }
    try {
      const trimmed = topic.trim();
      if (trimmed) {
        window.sessionStorage.setItem(HUB_TOPIC_SESSION_KEY, trimmed);
      } else {
        window.sessionStorage.removeItem(HUB_TOPIC_SESSION_KEY);
      }
    } catch {
      // ignore
    }
  }

  private _resolveInitialTopic(configTopic?: string): {
    topic: string;
    preserveSessionTopicFromToken: boolean;
  } {
    const stripHubParamsFromUrl = () => {
      if (typeof window === 'undefined' || !window.history?.replaceState) {
        return;
      }
      const url = new URL(window.location.href);
      if (!url.searchParams.has('topic') && !url.searchParams.has('id-token')) {
        return;
      }
      url.searchParams.delete('topic');
      url.searchParams.delete('id-token');
      window.history.replaceState(null, '', url.toString());
    };

    const searchParams =
      typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
    const fromUrl = searchParams?.get('topic')?.trim() ?? '';
    const idTokenParam = searchParams?.get('id-token')?.trim() ?? '';
    if (idTokenParam && idTokenParam.split('.').length >= 3) {
      this._urlHubAccessToken = idTokenParam;
    }
    if (fromUrl) {
      stripHubParamsFromUrl();
      return { topic: fromUrl, preserveSessionTopicFromToken: true };
    }

    const fromIdToken = idTokenParam ? decodeTopicFromJwt(idTokenParam) : '';
    if (fromIdToken || this._urlHubAccessToken) {
      stripHubParamsFromUrl();
      return {
        topic: fromIdToken || this._readStoredTopic() || configTopic?.trim() || '',
        preserveSessionTopicFromToken: true,
      };
    }

    const fromStorage = this._readStoredTopic();
    if (fromStorage) {
      return { topic: fromStorage, preserveSessionTopicFromToken: true };
    }
    return {
      topic: configTopic?.trim() ?? '',
      preserveSessionTopicFromToken: false,
    };
  }

  private async _start(): Promise<void> {
    const urlToken = this._urlHubAccessToken.trim();
    if (urlToken && typeof this._client.setToken === 'function') {
      this._client.setToken(urlToken);
    } else {
      const tokenOk = await this.getToken();
      if (!tokenOk) {
        return;
      }
    }
    await this.hubSubscribe();
    const topicAfterStart = this._client.getSessionConfig().topic?.trim() ?? '';
    if (topicAfterStart) {
      this._writeStoredTopic(topicAfterStart);
    }
  }

  private _broadcastHubStatus(wsState?: string): void {
    if (wsState !== undefined) {
      this._wsState = wsState;
    }
    const next = this.getHubHeaderStatus();
    if (
      this._lastBroadcastHubHeaderStatus &&
      hubHeaderStatusEqual(this._lastBroadcastHubHeaderStatus, next)
    ) {
      return;
    }
    this._lastBroadcastHubHeaderStatus = next;
    this._broadcastEvent(HubService.EVENTS.STATUS_CHANGED, next);
  }

  private _setConferenceActive(
    active: boolean,
    title = '',
    participants?: string[]
  ): void {
    this._conferenceActive = active;
    if (!active) {
      this._conferenceTitle = '';
      this._conferenceParticipants = [];
      this._broadcastHubStatus();
      return;
    }
    this._conferenceTitle = title.trim();
    if (participants !== undefined) {
      this._conferenceParticipants = participants;
    }
    this._broadcastHubStatus();
  }

  private async _syncConferenceActive(): Promise<void> {
    const hubEndpoint = this._client.getHubConfig().hub_endpoint ?? '';
    const session = this._client.getSessionConfig();
    if (!hubEndpoint || this._wsState !== 'connected') {
      this._setConferenceActive(false);
      return;
    }
    const { active, title, participants } = await resolveHubConferenceState(
      hubEndpoint,
      session.topic?.trim() ?? '',
      this._subscriberName.trim() || session.subscriberName?.trim() || ''
    );
    this._setConferenceActive(active, title, participants);
  }

  private _scheduleHubDicomSendLayer(meta: {
    SeriesInstanceUID?: string;
    SOPInstanceUID?: string;
  }): void {
    if (typeof window === 'undefined') {
      return;
    }
    let done = false;
    let attempt = 0;
    const maxAttempts = 24;
    const tryAdd = () => {
      if (done || attempt++ > maxAttempts) {
        return;
      }
      done = this._addHubDicomSendAsLayer(meta);
      if (!done) {
        window.setTimeout(tryAdd, 300);
      }
    };
    queueMicrotask(tryAdd);
  }

  private _resolveHubLayerViewportId(): string | undefined {
    const { viewportGridService } = this._servicesManager.services;
    const active = viewportGridService.getActiveViewportId();
    if (active) {
      return active;
    }
    const viewports = viewportGridService.getState()?.viewports;
    if (!viewports?.size) {
      return undefined;
    }
    for (const [mapKey, vp] of viewports) {
      if (vp?.displaySetInstanceUIDs?.length) {
        return vp.viewportId ?? mapKey;
      }
    }
    const firstKey = viewports.keys().next();
    return firstKey.done ? undefined : firstKey.value;
  }

  private _addHubDicomSendAsLayer(meta: {
    SeriesInstanceUID?: string;
    SOPInstanceUID?: string;
  }): boolean {
    const { SeriesInstanceUID, SOPInstanceUID } = meta;
    if (!SeriesInstanceUID) {
      return false;
    }

    const { displaySetService, viewportGridService, cornerstoneViewportService } =
      this._servicesManager.services;
    const viewportId = this._resolveHubLayerViewportId();
    if (!viewportId) {
      return false;
    }

    if (!cornerstoneViewportService?.getViewportInfo(viewportId)) {
      return false;
    }

    const candidates = displaySetService.getDisplaySetsForSeries(SeriesInstanceUID);
    if (!candidates?.length) {
      return false;
    }

    const displaySet =
      (SOPInstanceUID &&
        candidates.find(ds => ds.SOPInstanceUID === SOPInstanceUID)) ??
      candidates[candidates.length - 1];

    if (!displaySet?.displaySetInstanceUID) {
      return false;
    }

    const uid = displaySet.displaySetInstanceUID;
    const currentUids = viewportGridService.getDisplaySetsUIDsForViewport(viewportId) ?? [];
    if (currentUids.includes(uid)) {
      return true;
    }

    try {
      this._commandsManager.runCommand('addDisplaySetAsLayer', {
        viewportId,
        displaySetInstanceUID: uid,
      });
    } catch (err) {
      console.warn(`${LOG_PREFIX} addDisplaySetAsLayer failed`, err);
      return false;
    }
    return true;
  }
}
