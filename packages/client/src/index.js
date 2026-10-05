import * as factory from './objectFactory.js';
import { postBinaryBatchPublish } from './binaryBatchPublish';
import {
  collatedResponsesFromRequestResult,
  parseCollatedRequestResult,
} from './collatedRequest';
import {
  isHubEndpointInCloud,
  isRunningInCloud,
  selectFirstMatchingHubKey,
} from './deployment';
import {
  dataTypeFromEventName,
  ensureCastSubscribeEvents,
  isRequestEvent,
  isResponseEvent,
  normalizeDataType,
  REQUEST_SUFFIX,
  requestEventFor,
  responseEventFor,
  RESPONSE_SUFFIX,
} from './eventNames';
import {
  HUB_RADIO_ICON_CLASS,
  HUB_RADIO_ICON_SVG,
  HUB_RADIO_SLASH_CLASS,
  HUB_RADIO_STATUS_ICON_CLASS,
  castRadioStatusMarkup,
  castRadioStatusVisual,
} from './icons';
import { buildHubCallbackUrl, buildHubModeFormData } from './hubForms';
import {
  DEFAULT_PRODUCT_NAME,
  generateMessageId,
  generateSubscriberName,
  productNameToMessageIdPrefix,
} from './identity';
import { createPayloadFetchApi } from './payloadFetch';
import {
  binaryFileNameFromMessage,
  coerceBinaryPublishToFiles,
  extractBinaryBatchFileBytes,
  messageNeedsBinaryBatchPublish,
  toArrayBufferStrict,
} from './sendNormalize';
import {
  HUB_CONFERENCE_EXIT_ACK_MS,
  HUB_CONFERENCE_POLL_MS,
  HUB_CONFERENCE_TITLE_PRESETS,
  buildCastConferenceView,
  conferenceHostTopic,
  conferenceSceneLeaderTopic,
  createHubConference,
  joinHubConference,
  deleteHubConference,
  fetchHubConferences,
  fetchHubConferenceTopics,
  findActiveHubConference,
  isHubConferenceHost,
  isHubConferenceParticipant,
  isHubConferenceSceneLeader,
  normalizeConferenceParticipants,
  resolveHubConferenceState,
  resolveHubConferenceView,
  transferHubConferenceLead,
} from './conference';
import {
  castConferenceSelfStatusLabel,
  castConferencePlaceStatusLabel,
  castConferenceLeaderPlace,
  castConferenceParticipantRowStatus,
  resolveHubConferenceHeaderActions,
  applyCastConferenceHeaderActions,
  renderCastConferencePresence,
  openHubConferenceParticipantsPopup,
  closeCastConferenceParticipantsPopup,
  isHubConferenceParticipantsPopupOpen,
} from './conferencePresence.js';
import { createHubConferenceDialog } from './conferenceDialog.js';
import {
  HUB_CONFERENCE_STRINGS_EN,
  interpolateCastConferenceString,
  mergeCastConferenceStrings,
} from './conferenceStrings.js';
import {
  HUB_IMAGE_DISPLAY_ACTOR,
  createHubConferenceInviteController,
  createHubConferenceInviteDialog,
  parseConferenceInviteFromMessage,
  shouldShowConferenceInvite,
} from './conferenceInviteDialog.js';
import { confirmHubConferenceTakeover } from './conferenceTakeoverDialog.js';
import { showHubInfoToast } from './conferenceToast.js';
import {
  normalizeImagingStudyContext,
  extractStudyUIDFromResource,
  normalizeStudyUID,
  resolveImagingStudyOpenPlan,
} from './imagingStudyOpenPlan';
import {
  HUB_CONFERENCE_POPUP_SIZE,
  HUB_REPORTING_WINDOW_NAME,
  HUB_CLASSROOM_WINDOW_NAME,
  HUB_WORKLIST_WINDOW_NAME,
  hubReportingPopupFeatures,
  castReportingPopupPlacement,
  httpUrlFromHubEndpoint,
  openCastHubPopup,
  placeHubPopupWindow,
  resolveHubConferenceClientUrl,
  resolveHubAdminUrl,
} from './hubLinks';
import {
  clearHubDialogNearAnchor,
  placeHubDialogNearAnchor,
} from './dialogAnchor.js';
import {
  BINARY_PLACEHOLDER,
  countEventContextObjects,
  sanitizeCastMessageForDisplay,
  stringifyForLog,
  summarizeInboundCastMessage,
  summarizeOutboundCastPublish,
} from './messageLog';
import {
  batchContextFiles,
  cloneContextArray,
  decodeBase64ToArrayBuffer,
  extractFilePayloadsForEvent,
  filePayloadToArrayBuffer,
  filePayloadToFile,
  getActorKeyword,
  getHubEventLower,
  getInboundTargetActorKeyword,
  messageActor,
  messageEventContext,
  messageProductName,
  messageSubscriberName,
  parseStatusUpdateMessage,
} from './messageContext';
import {
  applyCastPublishEnvelopeFields,
  HUB_DEFAULT_SUBSCRIBER_ACTOR,
  HUB_ENVELOPE_ANY,
  DEFAULT_CAST_PUBLISH_ENVELOPE_FIELDS,
  normalizeOptionalEnvelopeField,
  resolveHubPublishEnvelopeFields,
} from './publishEnvelope';
import {
  castMessageHasPendingFilePayloads,
  resolveHubFileMessage,
} from './resolveHubFileMessage';
import {
  dentalSegAvailableFromStatusResponses,
  isDentalSegProduct,
  isInferenceProduct,
  isLungScreeningProduct,
  isMhubProduct,
  isNeuroSegProduct,
  isStatusPayloadOnline,
  isStatusRequestDataType,
  isTorchXrayVisionProduct,
  isTotalSegmentatorProduct,
  lungScreeningAvailableFromStatusResponses,
  mhubAvailableFromStatusResponses,
  neuroSegAvailableFromStatusResponses,
  normalizeProductToken,
  productNameFromStatusResponseItem,
  statusItemValue,
  torchXrayVisionAvailableFromStatusResponses,
  DENTAL_SEG_PRODUCT_ALIASES,
  LUNG_SCREENING_PRODUCT_ALIASES,
  MHUB_PRODUCT_ALIASES,
  NEURO_SEG_PRODUCT_ALIASES,
  TORCHXRAYVISION_PRODUCT_ALIASES,
  TOTAL_SEGMENTATOR_PRODUCT_ALIASES,
  totalSegmentatorAvailableFromStatusResponses,
} from './statusProtocol';
import {
  HUB_INFERENCE_SERVERS,
  LOCAL_AI_SERVERS,
  findInferenceServerByProduct,
  inferenceServerInfoText,
  renderInferenceServerInfoCardHtml,
} from './inferenceServers';
import {
  HUB_PRODUCT_MATCHERS,
  matchesHubProduct,
  normalizeHubProductName,
} from './hubProducts';
import {
  mapInferenceServersFromStatusResult,
  parseProductStatusProbe,
  publishCastUrlSend,
  requestCastLiveScene,
  requestCastProductStatus,
  requestCastStatus,
  probeCastInferenceServers,
} from './statusProbe';
import {
  createHubConfig,
  createHubRuntimeState,
  createSessionConfig,
  resolveTargetActorForWire,
  resolveTargetProductNameForWire,
} from './wireEnvelope';
import {
  buildDicomwebImagingStudyOpenContext,
  buildDicomUrlImagingStudyOpenContext,
  buildFilesImagingStudyOpenContext,
  buildIdcImagingStudyOpenContext,
  buildLocalDicomImagingStudyOpenContext,
  buildNiftiUrlImagingStudyOpenContext,
  HUB_DICOMWEB_ROOT,
  HUB_IDENTIFIER_DICOM_UID,
  HUB_IDENTIFIER_IDC,
  HUB_IDENTIFIER_IDC_SOURCE_BUCKET,
  HUB_IDENTIFIER_NIFTI_FILENAME,
  HUB_IDENTIFIER_NIFTI_URL,
  HUB_IDENTIFIER_OHIF_MODE,
  HUB_IDENTIFIER_VOLVIEW_SAMPLE_ID,
  HUB_IDENTIFIER_WORKLIST_SAMPLE_ID,
  HUB_IMAGING_STUDY_OPEN_PROFILE,
  HUB_OPEN_MODE,
  HUB_OPEN_MODE_DICOMWEB,
  HUB_OPEN_MODE_DICOM_URL,
  HUB_OPEN_MODE_FILES,
  HUB_OPEN_MODE_IDC,
  HUB_OPEN_MODE_LOCAL_DICOM,
  extractDicomSeriesUid,
  extractDicomStudyUid,
  extractDicomwebRoot,
  extractIdcSeriesUid,
  extractIdcSourceBucket,
  extractIdentifierValue,
  extractImagingStudyFiles,
  extractNiftiDownloadUrl,
  extractNiftiFilename,
  extractOhifMode,
  extractOpenMode,
  extractStudyContextItem,
  extractVolviewSampleId,
} from './imagingStudyContext';

// API and usage: Documentation/api/IO_Core_HubClient.md (npm run docs:generate-api);
// live example: /examples/HubClient.html

export {
  applyCastPublishEnvelopeFields,
  batchContextFiles,
  BINARY_PLACEHOLDER,
  buildDicomwebImagingStudyOpenContext,
  buildDicomUrlImagingStudyOpenContext,
  buildFilesImagingStudyOpenContext,
  buildIdcImagingStudyOpenContext,
  buildLocalDicomImagingStudyOpenContext,
  buildNiftiUrlImagingStudyOpenContext,
  castMessageHasPendingFilePayloads,
  buildCastConferenceView,
  castConferenceSelfStatusLabel,
  castConferencePlaceStatusLabel,
  castConferenceLeaderPlace,
  castConferenceParticipantRowStatus,
  resolveHubConferenceHeaderActions,
  applyCastConferenceHeaderActions,
  renderCastConferencePresence,
  openHubConferenceParticipantsPopup,
  closeCastConferenceParticipantsPopup,
  isHubConferenceParticipantsPopupOpen,
  HUB_CONFERENCE_EXIT_ACK_MS,
  HUB_CONFERENCE_POLL_MS,
  HUB_CONFERENCE_POPUP_SIZE,
  HUB_REPORTING_WINDOW_NAME,
  HUB_CLASSROOM_WINDOW_NAME,
  HUB_WORKLIST_WINDOW_NAME,
  clearHubDialogNearAnchor,
  placeHubDialogNearAnchor,
  HUB_CONFERENCE_TITLE_PRESETS,
  HUB_CONFERENCE_STRINGS_EN,
  HUB_DEFAULT_SUBSCRIBER_ACTOR,
  createHubConferenceDialog,
  confirmHubConferenceTakeover,
  HUB_IMAGE_DISPLAY_ACTOR,
  createHubConferenceInviteController,
  createHubConferenceInviteDialog,
  interpolateCastConferenceString,
  mergeCastConferenceStrings,
  parseConferenceInviteFromMessage,
  shouldShowConferenceInvite,
  showHubInfoToast,
  HUB_DICOMWEB_ROOT,
  HUB_ENVELOPE_ANY,
  HUB_IDENTIFIER_DICOM_UID,
  HUB_IDENTIFIER_IDC,
  HUB_IDENTIFIER_IDC_SOURCE_BUCKET,
  HUB_IDENTIFIER_NIFTI_FILENAME,
  HUB_IDENTIFIER_NIFTI_URL,
  HUB_IDENTIFIER_OHIF_MODE,
  HUB_IDENTIFIER_VOLVIEW_SAMPLE_ID,
  HUB_IDENTIFIER_WORKLIST_SAMPLE_ID,
  HUB_IMAGING_STUDY_OPEN_PROFILE,
  HUB_OPEN_MODE,
  HUB_OPEN_MODE_DICOMWEB,
  HUB_OPEN_MODE_DICOM_URL,
  HUB_OPEN_MODE_FILES,
  HUB_OPEN_MODE_IDC,
  HUB_OPEN_MODE_LOCAL_DICOM,
  HUB_RADIO_ICON_CLASS,
  HUB_RADIO_ICON_SVG,
  HUB_RADIO_SLASH_CLASS,
  HUB_RADIO_STATUS_ICON_CLASS,
  castRadioStatusMarkup,
  castRadioStatusVisual,
  collatedResponsesFromRequestResult,
  conferenceHostTopic,
  conferenceSceneLeaderTopic,
  countEventContextObjects,
  createHubConference,
  joinHubConference,
  dataTypeFromEventName,
  decodeBase64ToArrayBuffer,
  DEFAULT_CAST_PUBLISH_ENVELOPE_FIELDS,
  deleteHubConference,
  ensureCastSubscribeEvents,
  extractDicomSeriesUid,
  extractDicomStudyUid,
  extractDicomwebRoot,
  extractFilePayloadsForEvent,
  extractIdcSeriesUid,
  extractIdcSourceBucket,
  extractIdentifierValue,
  extractImagingStudyFiles,
  extractNiftiDownloadUrl,
  extractNiftiFilename,
  extractOhifMode,
  extractOpenMode,
  extractStudyContextItem,
  extractStudyUIDFromResource,
  extractVolviewSampleId,
  fetchHubConferences,
  fetchHubConferenceTopics,
  filePayloadToArrayBuffer,
  filePayloadToFile,
  findActiveHubConference,
  generateSubscriberName,
  getActorKeyword,
  getHubEventLower,
  getInboundTargetActorKeyword,
  httpUrlFromHubEndpoint,
  isHubConferenceHost,
  isHubConferenceParticipant,
  isHubConferenceSceneLeader,
  isHubEndpointInCloud,
  isRequestEvent,
  isResponseEvent,
  isRunningInCloud,
  isStatusPayloadOnline,
  isStatusRequestDataType,
  isTotalSegmentatorProduct,
  isLungScreeningProduct,
  isNeuroSegProduct,
  isDentalSegProduct,
  isTorchXrayVisionProduct,
  isMhubProduct,
  isInferenceProduct,
  lungScreeningAvailableFromStatusResponses,
  neuroSegAvailableFromStatusResponses,
  dentalSegAvailableFromStatusResponses,
  torchXrayVisionAvailableFromStatusResponses,
  mhubAvailableFromStatusResponses,
  normalizeProductToken,
  HUB_INFERENCE_SERVERS,
  LOCAL_AI_SERVERS,
  findInferenceServerByProduct,
  inferenceServerInfoText,
  renderInferenceServerInfoCardHtml,
  HUB_PRODUCT_MATCHERS,
  matchesHubProduct,
  normalizeHubProductName,
  parseProductStatusProbe,
  publishCastUrlSend,
  requestCastLiveScene,
  requestCastProductStatus,
  requestCastStatus,
  mapInferenceServersFromStatusResult,
  probeCastInferenceServers,
  cloneContextArray,
  messageEventContext,
  messageSubscriberName,
  messageProductName,
  messageActor,
  parseStatusUpdateMessage,
  normalizeConferenceParticipants,
  normalizeDataType,
  normalizeImagingStudyContext,
  normalizeOptionalEnvelopeField,
  normalizeStudyUID,
  openCastHubPopup,
  castReportingPopupPlacement,
  hubReportingPopupFeatures,
  placeHubPopupWindow,
  parseCollatedRequestResult,
  productNameFromStatusResponseItem,
  REQUEST_SUFFIX,
  requestEventFor,
  resolveHubConferenceClientUrl,
  resolveHubConferenceState,
  resolveHubConferenceView,
  resolveHubFileMessage,
  resolveHubAdminUrl,
  resolveHubPublishEnvelopeFields,
  resolveImagingStudyOpenPlan,
  resolveTargetActorForWire,
  resolveTargetProductNameForWire,
  responseEventFor,
  RESPONSE_SUFFIX,
  sanitizeCastMessageForDisplay,
  selectFirstMatchingHubKey,
  statusItemValue,
  stringifyForLog,
  summarizeInboundCastMessage,
  summarizeOutboundCastPublish,
  TOTAL_SEGMENTATOR_PRODUCT_ALIASES,
  LUNG_SCREENING_PRODUCT_ALIASES,
  NEURO_SEG_PRODUCT_ALIASES,
  DENTAL_SEG_PRODUCT_ALIASES,
  TORCHXRAYVISION_PRODUCT_ALIASES,
  MHUB_PRODUCT_ALIASES,
  totalSegmentatorAvailableFromStatusResponses,
  transferHubConferenceLead,
};

const RECONNECT_INTERVAL_MS = 10000;
const SUBSCRIBE_TIMEOUT_MS = 5000;

// ----------------------------------------------------------------------------
// Object factory
// ----------------------------------------------------------------------------

const DEFAULT_VALUES = {
  config: {
    hub: {},
    session: {},
    productName: undefined,
    productVersion: undefined,
    callbackUrl: undefined,
    autoStart: false,
    autoReconnect: false,
    preserveSessionTopicFromToken: false,
  },
  hub: null,
  session: null,
  reconnectInterval: null,
  onMessageCallback: null,
  onConnectionStateChangeCallback: null,
};

function hubClient(publicAPI, model) {
  model.classHierarchy.push('HubClient');

  // --------------------------------------------------------------------------
  // Internal
  // --------------------------------------------------------------------------

  function emitConnectionState(state, detail) {
    if (model.onConnectionStateChangeCallback) {
      model.onConnectionStateChangeCallback(state, detail);
    }
  }

  function messageIdPrefix() {
    const product =
      model.session.productName ||
      model.config.productName ||
      DEFAULT_PRODUCT_NAME;
    return productNameToMessageIdPrefix(product);
  }

  function resolveAuthorizationEndpoint() {
    const explicit = model.hub.authorization_endpoint;
    if (typeof explicit === 'string' && explicit.trim()) {
      return explicit.trim();
    }
    // Fallback: derive from token_endpoint origin (back-compat with hub
    // configs that haven't been updated to expose authorization_endpoint).
    try {
      const tokenUrl = new URL(model.hub.token_endpoint);
      return `${tokenUrl.origin}/oauth/authorize`;
    } catch (err) {
      return '';
    }
  }

  function websocketClose() {
    console.debug('HubClient: websocket is closed.');
    model.hub.resubscribeRequested = true;
    emitConnectionState('disconnected');
  }

  const payloadFetchApi = createPayloadFetchApi(() => ({
    hubEndpoint: model.hub.hub_endpoint,
    accessToken: model.hub.token,
  }));

  function processTextMessage(eventData) {
    try {
      const castMessage = JSON.parse(eventData);
      if (castMessage['hub.mode']) {
        return;
      }

      const event = castMessage.event;
      if (!event) {
        return;
      }
      if (event['hub.event'] === 'heartbeat') {
        return;
      }

      if (castMessage.id === model.hub.lastPublishedMessageID) {
        return;
      }

      if (model.onMessageCallback) {
        model.onMessageCallback(castMessage);
      }
    } catch (err) {
      console.warn('HubClient: websocket processing error:', err);
    }
  }

  async function checkWebsocket() {
    if (
      model.hub.resubscribeRequested &&
      model.hub.subscribed &&
      model.config.autoReconnect
    ) {
      console.debug('HubClient: Try to resubscribe');
      model.hub.resubscribeRequested = false;
      const response = await publicAPI.subscribe();
      if (response !== 202) {
        model.hub.resubscribeRequested = true;
      }
    } else if (!model.hub.subscribed && model.hub.resubscribeRequested) {
      model.hub.resubscribeRequested = false;
    }
  }

  // --------------------------------------------------------------------------
  // PublicAPI
  // --------------------------------------------------------------------------

  publicAPI.onMessage = (callback) => {
    model.onMessageCallback = callback;
  };

  // --------------------------------------------------------------------------

  publicAPI.onConnectionStateChange = (callback) => {
    model.onConnectionStateChangeCallback = callback;
  };

  // --------------------------------------------------------------------------

  publicAPI.delete = factory.chain(() => {
    if (model.reconnectInterval) {
      clearInterval(model.reconnectInterval);
      model.reconnectInterval = null;
    }
    publicAPI.unsubscribe();
  }, publicAPI.delete);

  // --------------------------------------------------------------------------

  publicAPI.getHubConfig = () => {
    const hub = model.hub;
    return {
      name: hub.name,
      friendlyName: hub.friendlyName,
      version: hub.version,
      hub_endpoint: hub.hub_endpoint,
      authorization_endpoint: hub.authorization_endpoint,
      token_endpoint: hub.token_endpoint,
      client_id: hub.client_id,
      client_secret: hub.client_secret,
    };
  };

  // --------------------------------------------------------------------------

  publicAPI.getSessionConfig = () => {
    const session = model.session;
    return {
      subscriberName: session.subscriberName,
      productName: session.productName,
      productVersion: session.productVersion,
      actors: session.actors,
      topic: session.topic,
      events: session.events,
      lease: session.lease,
      userName: session.userName,
      defaultTargetActor: session.defaultTargetActor,
    };
  };

  // --------------------------------------------------------------------------

  publicAPI.getConnectionState = () => {
    const hub = model.hub;
    return {
      token: hub.token,
      subscribed: hub.subscribed,
      resubscribeRequested: hub.resubscribeRequested,
      websocket: hub.websocket,
      lastPublishedMessageID: hub.lastPublishedMessageID,
    };
  };

  // --------------------------------------------------------------------------

  publicAPI.setTopic = (topic) => {
    console.debug('HubClient: setting topic to', topic);
    model.session.topic = topic;
  };

  // --------------------------------------------------------------------------

  publicAPI.setToken = (token) => {
    model.hub.token = token;
  };

  // --------------------------------------------------------------------------

  publicAPI.setSubscriberName = (subscriberName) => {
    model.session.subscriberName = subscriberName;
  };

  // --------------------------------------------------------------------------

  publicAPI.setUserName = (userName) => {
    model.session.userName = userName || '';
  };

  // --------------------------------------------------------------------------

  /**
   * Start the OAuth authorize flow against the hub.
   *
   * @returns {Promise<AuthorizeResult>}
   * @throws {Error} When no authorize endpoint is configured, the request
   *   fails, or the hub returns a non-200 status.
   */
  publicAPI.authenticate = async () => {
    const authorizeEndpoint = resolveAuthorizationEndpoint();
    if (!authorizeEndpoint) {
      throw new Error(
        'HubClient.authenticate: no authorization_endpoint or token_endpoint configured.'
      );
    }
    try {
      const url = new URL(authorizeEndpoint);
      console.debug(
        'HubClient: Authorizing at:',
        `${url.origin}${url.pathname}`
      );
    } catch (err) {
      console.debug('HubClient: Authorizing at hub');
    }

    const productName =
      model.session.productName || model.config.productName || 'UNKNOWN';

    const formData = new URLSearchParams();
    if (model.hub.lastIdToken) {
      formData.append('id_token', model.hub.lastIdToken);
    } else if (model.session.userName) {
      formData.append('user_name', model.session.userName);
    }
    formData.append('client_product_name', productName);
    if (model.session.topic) {
      formData.append('topic', model.session.topic);
    }

    let response;
    try {
      response = await fetch(authorizeEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('HubClient: Exception during authenticate:', message);
      throw err;
    }
    if (response.status !== 200) {
      const text = await response.text().catch(() => '');
      console.error(
        'HubClient: Authenticate failed. Status:',
        response.status,
        text
      );
      throw new Error(
        `HubClient.authenticate failed (HTTP ${response.status})`
      );
    }
    const data = await response.json();
    if (typeof data.user_name === 'string' && data.user_name) {
      model.session.userName = data.user_name;
    }
    return {
      user_name: data.user_name || '',
      code: data.code || '',
      expires_in:
        typeof data.expires_in === 'number' ? data.expires_in : undefined,
    };
  };

  // --------------------------------------------------------------------------

  /**
   * Exchange an authorization code for an access token.
   *
   * @param {string} code Authorization code from ``authenticate()``.
   * @returns {Promise<boolean>} ``true`` when a token was stored; ``false`` on
   *   validation/HTTP failure (does not throw).
   */
  publicAPI.getToken = async (code) => {
    if (typeof code !== 'string' || !code) {
      console.error(
        'HubClient.getToken: code is required (call authenticate() first).'
      );
      return false;
    }
    try {
      const url = new URL(model.hub.token_endpoint);
      console.debug(
        'HubClient: Exchanging code at:',
        `${url.origin}${url.pathname}`
      );
    } catch (err) {
      console.debug('HubClient: Exchanging code at hub');
    }

    const productName =
      model.session.productName || model.config.productName || 'UNKNOWN';

    const tokenFormData = new URLSearchParams();
    tokenFormData.append('grant_type', 'authorization_code');
    tokenFormData.append('code', code);
    tokenFormData.append('client_id', model.hub.client_id || '');
    tokenFormData.append('client_secret', model.hub.client_secret || '');
    tokenFormData.append('client_product_name', productName);

    try {
      const response = await fetch(model.hub.token_endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: tokenFormData,
      });
      if (response.status === 200) {
        const config = await response.json();
        if (typeof config.access_token === 'string' && config.access_token) {
          model.hub.token = config.access_token;
        }
        if (typeof config.id_token === 'string' && config.id_token) {
          model.hub.lastIdToken = config.id_token;
        }
        if (config.topic && typeof config.topic === 'string') {
          if (!model.config.preserveSessionTopicFromToken) {
            publicAPI.setTopic(config.topic);
          }
          if (model.config.autoStart) {
            publicAPI.subscribe();
          }
        }
        return !!model.hub.token;
      }
      await response.text();
      console.error(
        'HubClient: Error getting token. Status:',
        response.status
      );
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('HubClient: Exception getting token:', message);
      return false;
    }
  };

  // --------------------------------------------------------------------------

  /**
   * Subscribe to the hub topic and open the WebSocket channel.
   *
   * @param {boolean} [fromAuthRetry=false] Internal: true when retrying after a
   *   401 token refresh (prevents retry loops).
   * @returns {Promise<number|string>} ``202`` on HTTP accept (WebSocket may
   *   still be connecting); ``401`` / other HTTP status on rejection;
   *   ``'error: topic not defined'`` / ``'error: no token'`` on client-side
   *   validation failure; ``0`` on exception or missing channel endpoint.
   */
  publicAPI.subscribe = async (fromAuthRetry = false) => {
    const topic = model.session.topic && model.session.topic.trim();
    if (!topic) {
      console.warn(
        'HubClient: Error. subscription not sent. No topic defined.'
      );
      return 'error: topic not defined';
    }
    if (
      !model.session.subscriberName ||
      !String(model.session.subscriberName).trim()
    ) {
      model.session.subscriberName = generateSubscriberName(
        model.session.productName || model.config.productName || 'UNKNOWN'
      );
    }
    if (!model.hub.token) {
      console.warn(
        'HubClient: Error. subscription not sent. No token available.'
      );
      return 'error: no token';
    }

    const callbackUrl = buildHubCallbackUrl(model.config.callbackUrl);
    const subscribeFormData = buildHubModeFormData(
      'subscribe',
      {
        ...model.session,
        topic,
        subscriberName: model.session.subscriberName,
      },
      callbackUrl,
      model.config.productVersion
    );

    const requestOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${model.hub.token}`,
      },
      body: subscribeFormData,
      signal:
        typeof AbortSignal !== 'undefined' && AbortSignal.timeout
          ? AbortSignal.timeout(SUBSCRIBE_TIMEOUT_MS)
          : undefined,
    };

    try {
      emitConnectionState('connecting');
      const response = await fetch(model.hub.hub_endpoint, requestOptions);
      if (response.status === 202) {
        model.hub.resubscribeRequested = false;
        let subscriptionResponse;
        try {
          subscriptionResponse = await response.json();
        } catch (parseErr) {
          model.hub.subscribed = false;
          const parseMsg =
            parseErr instanceof Error ? parseErr.message : String(parseErr);
          console.error(
            'HubClient: Subscribe 202 body was not valid JSON:',
            parseMsg
          );
          emitConnectionState('error');
          return 0;
        }
        const websocketUrl = subscriptionResponse['hub.channel.endpoint'];
        if (!websocketUrl || typeof websocketUrl !== 'string') {
          model.hub.subscribed = false;
          console.error(
            'HubClient: Subscribe 202 missing hub.channel.endpoint'
          );
          emitConnectionState('error');
          return 0;
        }

        let normalizedWebsocketUrl = websocketUrl;
        try {
          const hubEndpointUrl = new URL(model.hub.hub_endpoint);
          const wsUrl = new URL(websocketUrl);
          const wsProtocol =
            hubEndpointUrl.protocol === 'https:' ? 'wss:' : 'ws:';
          normalizedWebsocketUrl = websocketUrl.replace(
            wsUrl.origin,
            `${wsProtocol}//${hubEndpointUrl.host}`
          );
        } catch (err) {
          // use original URL
        }

        if (model.hub.websocket) {
          try {
            model.hub.websocket.removeEventListener('close', websocketClose);
            model.hub.websocket.close();
          } catch (closeErr) {
            // ignore stale socket cleanup errors
          }
          model.hub.websocket = null;
        }

        let socket;
        try {
          socket = new WebSocket(normalizedWebsocketUrl);
        } catch (wsErr) {
          model.hub.subscribed = false;
          const wsMsg = wsErr instanceof Error ? wsErr.message : String(wsErr);
          console.error(
            'HubClient: Failed to open WebSocket after subscribe:',
            wsMsg
          );
          emitConnectionState('error');
          return 0;
        }

        // Hub accepted the subscription; mark subscribed only after the
        // WebSocket object exists so a constructor throw leaves state clean.
        // ``connected`` is emitted from onopen once the channel is ready.
        model.hub.subscribed = true;
        model.hub.websocket = socket;
        model.hub.websocket.onopen = function onOpen() {
          this.send(
            JSON.stringify({
              'hub.channel.endpoint': normalizedWebsocketUrl,
            })
          );
          emitConnectionState('connected');
        };
        model.hub.websocket.addEventListener('message', (ev) => {
          if (typeof ev.data === 'string') {
            processTextMessage(ev.data);
          }
        });
        model.hub.websocket.addEventListener('close', websocketClose);
        model.hub.websocket.onerror = function onError() {
          console.warn('HubClient: Error reported on websocket');
          emitConnectionState('error');
        };
        return response.status;
      }

      if (response.status === 401) {
        console.warn(
          'HubClient: Subscription response 401 - Token refresh needed.'
        );
        if (fromAuthRetry) {
          return response.status;
        }
        try {
          const { code } = await publicAPI.authenticate();
          if (code) {
            const ok = await publicAPI.getToken(code);
            if (ok) {
              return await publicAPI.subscribe(true);
            }
          }
        } catch (refreshErr) {
          const refreshMsg =
            refreshErr instanceof Error
              ? refreshErr.message
              : String(refreshErr);
          console.error(
            'HubClient: Token refresh after 401 failed:',
            refreshMsg
          );
        }
      } else {
        console.error(
          'HubClient: Subscription rejected by hub. Status:',
          response.status
        );
      }
      return response.status;
    } catch (err) {
      model.hub.subscribed = false;
      const message = err instanceof Error ? err.message : String(err);
      console.error('HubClient: Exception subscribing to the hub:', message);
      return 0;
    }
  };

  // --------------------------------------------------------------------------

  publicAPI.unsubscribe = async () => {
    model.hub.subscribed = false;
    model.hub.resubscribeRequested = false;

    const callbackUrl = buildHubCallbackUrl(model.config.callbackUrl);
    const unsubscribeFormData = buildHubModeFormData(
      'unsubscribe',
      model.session,
      callbackUrl,
      model.config.productVersion
    );

    try {
      const response = await fetch(model.hub.hub_endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${model.hub.token}`,
        },
        body: unsubscribeFormData,
        signal:
          typeof AbortSignal !== 'undefined' && AbortSignal.timeout
            ? AbortSignal.timeout(SUBSCRIBE_TIMEOUT_MS)
            : undefined,
      });
      if (response.status === 202) {
        console.debug(
          'HubClient: Unsubscribe successfully from hub',
          model.hub.name
        );
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn('HubClient: Error unsubscribing from the hub.', message);
    }

    if (model.hub.websocket) {
      model.hub.websocket.close();
      model.hub.websocket = null;
    }
    emitConnectionState('disconnected');
  };

  // --------------------------------------------------------------------------

  function preparePublishMessage(castMessage, hub = model.hub) {
    const msg = { ...castMessage, timestamp: new Date().toJSON() };
    msg.id = generateMessageId(messageIdPrefix());
    hub.lastPublishedMessageID = msg.id;

    const subscriberName =
      model.session.subscriberName && model.session.subscriberName.trim();
    const subscriberProduct =
      model.session.productName && model.session.productName.trim();
    if (subscriberName && msg['subscriber.name'] === undefined) {
      msg['subscriber.name'] = subscriberName;
    }
    if (subscriberProduct && msg['subscriber.product.name'] === undefined) {
      msg['subscriber.product.name'] = subscriberProduct;
    }

    if (msg.event && !msg.event['hub.topic']) {
      msg.event['hub.topic'] = model.session.topic;
    }

    if (msg['target.actor'] === undefined && model.session.defaultTargetActor) {
      const targetSubscriber = String(
        msg['target.subscriber.name'] || ''
      ).trim();
      if (!targetSubscriber) {
        const wireTarget = resolveTargetActorForWire(
          model.session.defaultTargetActor
        );
        if (wireTarget) {
          msg['target.actor'] = wireTarget;
        }
      }
    }

    return msg;
  }

  // --------------------------------------------------------------------------

  publicAPI.fetchPayload = (castMessage) =>
    payloadFetchApi.fetchPayload(castMessage);

  publicAPI.fetchAllPayloads = (castMessage) =>
    payloadFetchApi.fetchAllPayloads(castMessage);

  publicAPI.hasPendingPayload = (castMessage) =>
    payloadFetchApi.hasPendingPayload(castMessage);

  // --------------------------------------------------------------------------

  /** @deprecated Use ``publishBinaryBatch`` or ``publish`` (binary batch). */
  publicAPI.publishMultipart = async (
    castMessage,
    fileBytes,
    hub = model.hub
  ) => {
    let msg = preparePublishMessage(castMessage, hub);
    const raw = await toArrayBufferStrict(fileBytes);
    msg = coerceBinaryPublishToFiles(msg);
    let fileBytesList = await extractBinaryBatchFileBytes(msg);
    if (!fileBytesList.length) {
      const hubEvent =
        msg.event && typeof msg.event['hub.event'] === 'string'
          ? msg.event['hub.event']
          : '';
      const defaultName =
        hubEvent === 'dicom-send' ? 'dicom-send.dcm' : 'nifti-send.nii.gz';
      msg.event.context = {
        files: [
          {
            data: raw,
            fileName: binaryFileNameFromMessage(msg, defaultName),
            mimeType: 'application/octet-stream',
            byteLength: raw.byteLength,
          },
        ],
      };
      fileBytesList = [raw];
    }
    return publicAPI.publishBinaryBatch(msg, fileBytesList, hub);
  };

  // --------------------------------------------------------------------------

  /**
   * Publish a binary batch (multipart/related) to the hub.
   *
   * @returns {Promise<Response|null>} Hub HTTP response, or ``null`` on
   *   network failure. Throws if the message/files cannot be prepared.
   */
  publicAPI.publishBinaryBatch = async (
    castMessage,
    fileBytesList,
    hub = model.hub
  ) => {
    const msg = coerceBinaryPublishToFiles(
      preparePublishMessage(castMessage, hub)
    );
    return postBinaryBatchPublish({
      msg,
      fileBytesList,
      hub,
      messageIdPrefix,
    });
  };

  // --------------------------------------------------------------------------

  /**
   * Publish a Hub message. Binary payloads are coerced to ``context.files[]``
   * and sent via multipart binary batch when needed.
   *
   * @returns {Promise<Response|null>} Hub HTTP response, or ``null`` on
   *   network failure for JSON publish. Binary batch validation errors may
   *   throw before the request is sent.
   */
  publicAPI.publish = async (castMessage, hub = model.hub) => {
    let msg = preparePublishMessage(castMessage, hub);
    msg = coerceBinaryPublishToFiles(msg);

    if (messageNeedsBinaryBatchPublish(msg)) {
      const fileBytesList = await extractBinaryBatchFileBytes(msg);
      if (fileBytesList.length) {
        return publicAPI.publishBinaryBatch(msg, fileBytesList, hub);
      }
    }

    try {
      const response = await fetch(hub.hub_endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${hub.token}`,
        },
        body: JSON.stringify(msg),
      });
      return response;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.debug('HubClient:', message);
      return null;
    }
  };

  // --------------------------------------------------------------------------

  /** @deprecated Use ``publishBinaryBatch`` or ``publish``. */
  publicAPI.publishNiftiMultipart = async (castMessage, fileBytes, hub) =>
    publicAPI.publishBinaryBatch(castMessage, [fileBytes], hub);

  // --------------------------------------------------------------------------

  /**
   * Fan-out request via ``POST /api/hub/request``.
   *
   * @param {object} args
   * @param {string} args['subscriber.name']
   * @param {{ 'hub.topic'?: string, 'hub.event': string, context?: object }} args.event
   * @param {string} [args['target.actor']]
   * @param {string} [args.targetProductName]
   * @param {string} [args['target.product.name']]
   * @returns {Promise<{ok: boolean, status: number, data: unknown}>}
   * @throws {Error} When required fields or token are missing.
   */
  publicAPI.request = async (args = {}) => {
    const subscriber = String(args['subscriber.name'] || '').trim();
    if (!subscriber) {
      throw new Error('HubClient.request: "subscriber.name" is required.');
    }
    const hub = model.hub;
    const token = hub.token && hub.token.trim();
    if (!token) {
      throw new Error(
        'HubClient.request: token is required (call authenticate() then getToken(code) first).'
      );
    }

    const requestUrl = `${(hub.hub_endpoint || '').replace(
      /\/+$/,
      ''
    )}/request`;

    const body = {
      'subscriber.name': subscriber,
      id:
        (args.id && String(args.id).trim()) ||
        generateMessageId(messageIdPrefix()),
      timestamp:
        (args.timestamp && String(args.timestamp).trim()) ||
        new Date().toJSON(),
    };
    if (args.event && typeof args.event === 'object') {
      body.event = { ...args.event };
      const sessionTopic =
        model.session.topic && String(model.session.topic).trim();
      if (sessionTopic && !body.event['hub.topic']) {
        body.event['hub.topic'] = sessionTopic;
      }
    } else {
      throw new Error(
        'HubClient.request: "event" with hub.event is required.'
      );
    }
    const hubEvent = body.event['hub.event'];
    if (!hubEvent || !String(hubEvent).trim()) {
      throw new Error(
        'HubClient.request: event["hub.event"] must be a *-request event name.'
      );
    }
    if (args['subscriber.actor'] && String(args['subscriber.actor']).trim()) {
      body['subscriber.actor'] = String(args['subscriber.actor']).trim();
    }
    const hasExplicitTargetActor = Object.prototype.hasOwnProperty.call(
      args,
      'target.actor'
    );
    let wireTarget = hasExplicitTargetActor
      ? resolveTargetActorForWire(args['target.actor'])
      : undefined;
    if (
      wireTarget === undefined &&
      !hasExplicitTargetActor &&
      model.session.defaultTargetActor
    ) {
      wireTarget = resolveTargetActorForWire(model.session.defaultTargetActor);
    }
    if (wireTarget !== undefined) {
      body['target.actor'] = wireTarget;
    }
    const targetProduct =
      args['target.product.name'] !== undefined
        ? args['target.product.name']
        : args.targetProductName;
    const wireTargetProduct = resolveTargetProductNameForWire(targetProduct);
    if (wireTargetProduct !== undefined) {
      body['target.product.name'] = wireTargetProduct;
    }

    const response = await fetch(requestUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });

    let data;
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        data = await response.json();
      } catch (e) {
        data = '';
      }
    } else {
      data = await response.text();
    }
    return { ok: response.ok, status: response.status, data };
  };

  // Send a response to a previously-received <datatype>-request.
  //
  // Signature: (id, dataType, data, topic?). Correlation ``id`` matches the
  // inbound *-request context.id. The hub.event is derived from ``dataType``.

  // --------------------------------------------------------------------------

  publicAPI.sendCastRequestResponse = (id, dataType, data, topic) => {
    if (
      !model.hub.websocket ||
      typeof WebSocket === 'undefined' ||
      model.hub.websocket.readyState !== WebSocket.OPEN
    ) {
      return;
    }

    let dt = '';
    if (typeof dataType === 'string') {
      dt = dataType.trim();
    } else if (dataType != null) {
      dt = String(dataType).trim();
    }
    if (!dt) {
      console.error(
        'HubClient.sendCastRequestResponse requires a non-empty dataType.'
      );
      return;
    }
    const eventName = responseEventFor(dt);

    const response = {
      timestamp: new Date().toJSON(),
      id: generateMessageId(messageIdPrefix()),
      'subscriber.name': model.session.subscriberName || undefined,
      'subscriber.product.name': model.session.productName || undefined,
      event: {
        'hub.topic': topic || model.session.topic,
        'hub.event': eventName,
        context: {
          id,
          dataType: dt,
          data,
        },
      },
    };
    if (
      Array.isArray(model.session.actors) &&
      model.session.actors.length > 0
    ) {
      response.actor = model.session.actors[0];
    }
    model.hub.websocket.send(JSON.stringify(response));
  };

  // --------------------------------------------------------------------------
  // Init
  // --------------------------------------------------------------------------

  if (model.config.autoReconnect) {
    model.reconnectInterval = setInterval(
      checkWebsocket,
      RECONNECT_INTERVAL_MS
    );
  }
}

// ----------------------------------------------------------------------------

export function extend(publicAPI, model, initialValues = {}) {
  Object.assign(model, DEFAULT_VALUES, initialValues);

  model.config = { ...DEFAULT_VALUES.config, ...initialValues };
  model.session = {
    ...createSessionConfig(),
    ...(model.config.session || {}),
  };
  if (
    !model.session.subscriberName ||
    !String(model.session.subscriberName).trim()
  ) {
    model.session.subscriberName = generateSubscriberName(
      model.session.productName || model.config.productName || 'UNKNOWN'
    );
  }
  model.hub = {
    ...createHubConfig(),
    ...(model.config.hub || {}),
    ...createHubRuntimeState(),
  };

  factory.obj(publicAPI, model);
  factory.get(publicAPI, model, ['config']);

  hubClient(publicAPI, model);
}

// ----------------------------------------------------------------------------

export const newInstance = factory.newInstance(extend, 'HubClient');

// ----------------------------------------------------------------------------

export default {
  newInstance,
  extend,
  applyCastPublishEnvelopeFields,
  batchContextFiles,
  BINARY_PLACEHOLDER,
  buildDicomwebImagingStudyOpenContext,
  buildDicomUrlImagingStudyOpenContext,
  buildFilesImagingStudyOpenContext,
  buildIdcImagingStudyOpenContext,
  buildLocalDicomImagingStudyOpenContext,
  buildNiftiUrlImagingStudyOpenContext,
  castMessageHasPendingFilePayloads,
  buildCastConferenceView,
  castConferenceSelfStatusLabel,
  castConferencePlaceStatusLabel,
  castConferenceLeaderPlace,
  castConferenceParticipantRowStatus,
  resolveHubConferenceHeaderActions,
  applyCastConferenceHeaderActions,
  renderCastConferencePresence,
  openHubConferenceParticipantsPopup,
  closeCastConferenceParticipantsPopup,
  isHubConferenceParticipantsPopupOpen,
  HUB_CONFERENCE_EXIT_ACK_MS,
  HUB_CONFERENCE_POLL_MS,
  HUB_CONFERENCE_POPUP_SIZE,
  HUB_REPORTING_WINDOW_NAME,
  HUB_CLASSROOM_WINDOW_NAME,
  HUB_WORKLIST_WINDOW_NAME,
  clearHubDialogNearAnchor,
  placeHubDialogNearAnchor,
  HUB_CONFERENCE_TITLE_PRESETS,
  HUB_CONFERENCE_STRINGS_EN,
  HUB_DEFAULT_SUBSCRIBER_ACTOR,
  createHubConferenceDialog,
  confirmHubConferenceTakeover,
  HUB_IMAGE_DISPLAY_ACTOR,
  createHubConferenceInviteController,
  createHubConferenceInviteDialog,
  interpolateCastConferenceString,
  mergeCastConferenceStrings,
  parseConferenceInviteFromMessage,
  shouldShowConferenceInvite,
  showHubInfoToast,
  HUB_DICOMWEB_ROOT,
  HUB_ENVELOPE_ANY,
  HUB_IDENTIFIER_DICOM_UID,
  HUB_IDENTIFIER_IDC,
  HUB_IDENTIFIER_IDC_SOURCE_BUCKET,
  HUB_IDENTIFIER_NIFTI_FILENAME,
  HUB_IDENTIFIER_NIFTI_URL,
  HUB_IDENTIFIER_OHIF_MODE,
  HUB_IDENTIFIER_VOLVIEW_SAMPLE_ID,
  HUB_IDENTIFIER_WORKLIST_SAMPLE_ID,
  HUB_IMAGING_STUDY_OPEN_PROFILE,
  HUB_OPEN_MODE,
  HUB_OPEN_MODE_DICOMWEB,
  HUB_OPEN_MODE_DICOM_URL,
  HUB_OPEN_MODE_FILES,
  HUB_OPEN_MODE_IDC,
  HUB_OPEN_MODE_LOCAL_DICOM,
  HUB_RADIO_ICON_CLASS,
  HUB_RADIO_ICON_SVG,
  HUB_RADIO_SLASH_CLASS,
  HUB_RADIO_STATUS_ICON_CLASS,
  castRadioStatusMarkup,
  castRadioStatusVisual,
  collatedResponsesFromRequestResult,
  conferenceHostTopic,
  conferenceSceneLeaderTopic,
  countEventContextObjects,
  createHubConference,
  joinHubConference,
  dataTypeFromEventName,
  decodeBase64ToArrayBuffer,
  DEFAULT_CAST_PUBLISH_ENVELOPE_FIELDS,
  deleteHubConference,
  ensureCastSubscribeEvents,
  extractDicomSeriesUid,
  extractDicomStudyUid,
  extractDicomwebRoot,
  extractFilePayloadsForEvent,
  extractIdcSeriesUid,
  extractIdcSourceBucket,
  extractIdentifierValue,
  extractImagingStudyFiles,
  extractNiftiDownloadUrl,
  extractNiftiFilename,
  extractOhifMode,
  extractOpenMode,
  extractStudyContextItem,
  extractStudyUIDFromResource,
  extractVolviewSampleId,
  fetchHubConferences,
  fetchHubConferenceTopics,
  filePayloadToArrayBuffer,
  filePayloadToFile,
  findActiveHubConference,
  generateSubscriberName,
  getActorKeyword,
  getHubEventLower,
  getInboundTargetActorKeyword,
  httpUrlFromHubEndpoint,
  isHubConferenceHost,
  isHubConferenceParticipant,
  isHubConferenceSceneLeader,
  isHubEndpointInCloud,
  isRequestEvent,
  isResponseEvent,
  isRunningInCloud,
  isStatusPayloadOnline,
  isStatusRequestDataType,
  isTotalSegmentatorProduct,
  isLungScreeningProduct,
  isNeuroSegProduct,
  isDentalSegProduct,
  isTorchXrayVisionProduct,
  isMhubProduct,
  isInferenceProduct,
  lungScreeningAvailableFromStatusResponses,
  neuroSegAvailableFromStatusResponses,
  dentalSegAvailableFromStatusResponses,
  torchXrayVisionAvailableFromStatusResponses,
  mhubAvailableFromStatusResponses,
  normalizeProductToken,
  HUB_INFERENCE_SERVERS,
  LOCAL_AI_SERVERS,
  findInferenceServerByProduct,
  inferenceServerInfoText,
  renderInferenceServerInfoCardHtml,
  HUB_PRODUCT_MATCHERS,
  matchesHubProduct,
  normalizeHubProductName,
  parseProductStatusProbe,
  publishCastUrlSend,
  requestCastLiveScene,
  requestCastProductStatus,
  requestCastStatus,
  mapInferenceServersFromStatusResult,
  probeCastInferenceServers,
  cloneContextArray,
  messageEventContext,
  messageSubscriberName,
  messageProductName,
  messageActor,
  parseStatusUpdateMessage,
  normalizeConferenceParticipants,
  normalizeDataType,
  normalizeImagingStudyContext,
  normalizeOptionalEnvelopeField,
  normalizeStudyUID,
  openCastHubPopup,
  castReportingPopupPlacement,
  hubReportingPopupFeatures,
  placeHubPopupWindow,
  parseCollatedRequestResult,
  productNameFromStatusResponseItem,
  REQUEST_SUFFIX,
  requestEventFor,
  resolveHubConferenceClientUrl,
  resolveHubConferenceState,
  resolveHubConferenceView,
  resolveHubFileMessage,
  resolveHubAdminUrl,
  resolveHubPublishEnvelopeFields,
  resolveImagingStudyOpenPlan,
  resolveTargetActorForWire,
  resolveTargetProductNameForWire,
  responseEventFor,
  RESPONSE_SUFFIX,
  sanitizeCastMessageForDisplay,
  selectFirstMatchingHubKey,
  statusItemValue,
  stringifyForLog,
  summarizeInboundCastMessage,
  summarizeOutboundCastPublish,
  TOTAL_SEGMENTATOR_PRODUCT_ALIASES,
  LUNG_SCREENING_PRODUCT_ALIASES,
  NEURO_SEG_PRODUCT_ALIASES,
  DENTAL_SEG_PRODUCT_ALIASES,
  TORCHXRAYVISION_PRODUCT_ALIASES,
  MHUB_PRODUCT_ALIASES,
  totalSegmentatorAvailableFromStatusResponses,
  transferHubConferenceLead,
};
