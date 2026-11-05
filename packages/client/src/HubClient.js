import { postBinaryBatchPublish } from './binaryBatchPublish.js';
import { buildHubCallbackUrl, buildHubModeFormData } from './hubForms.js';
import {
  DEFAULT_PRODUCT_NAME,
  generateMessageId,
  generateSubscriberName,
  productNameToMessageIdPrefix,
} from './identity.js';
import { createPayloadFetchApi } from './payloadFetch.js';
import { responseEventFor } from './eventNames.js';
import {
  binaryFileNameFromMessage,
  coerceBinaryPublishToFiles,
  extractBinaryBatchFileBytes,
  messageNeedsBinaryBatchPublish,
  toArrayBufferStrict,
} from './sendNormalize.js';
import {
  createHubConfig,
  createHubRuntimeState,
  createSessionConfig,
  resolveTargetActorForWire,
  resolveTargetProductNameForWire,
} from './wireEnvelope.js';

export const RECONNECT_INTERVAL_MS = 10000;
export const SUBSCRIBE_TIMEOUT_MS = 5000;

export const DEFAULT_VALUES = {
  hub: {},
  session: {},
  productName: undefined,
  productVersion: undefined,
  callbackUrl: undefined,
  autoStart: false,
  autoReconnect: false,
  preserveSessionTopicFromToken: false,
};

export class HubClient {
  constructor(hubConfig = {}, sessionConfig = {}, options = {}) {
    this._config = { ...DEFAULT_VALUES, ...options };
    this._session = {
      ...createSessionConfig(),
      ...(sessionConfig || {}),
    };
    if (
      !this._session.subscriberName ||
      !String(this._session.subscriberName).trim()
    ) {
      this._session.subscriberName = generateSubscriberName(
        this._session.productName || this._config.productName || 'UNKNOWN'
      );
    }
    this._hub = {
      ...createHubConfig(),
      ...(hubConfig || {}),
      ...createHubRuntimeState(),
    };
    this._reconnectInterval = null;
    this._onMessageCallback = null;
    this._onConnectionStateChangeCallback = null;
    this._payloadFetchApi = createPayloadFetchApi(() => ({
      hubEndpoint: this._hub.hub_endpoint,
      accessToken: this._hub.token,
    }));
    this._websocketClose = this._websocketClose.bind(this);
    this._checkWebsocket = this._checkWebsocket.bind(this);

    if (this._config.autoReconnect) {
      this._reconnectInterval = setInterval(
        this._checkWebsocket,
        RECONNECT_INTERVAL_MS
      );
    }
  }

  static newInstance(initialValues = {}) {
    const { hub = {}, session = {}, ...options } = initialValues || {};
    return new HubClient(hub, session, options);
  }

  onMessage(callback) {
    this._onMessageCallback = callback;
  }

  onConnectionStateChange(callback) {
    this._onConnectionStateChangeCallback = callback;
  }

  _emitConnectionState(state, detail) {
    if (this._onConnectionStateChangeCallback) {
      this._onConnectionStateChangeCallback(state, detail);
    }
  }

  _messageIdPrefix() {
    const product =
      this._session.productName ||
      this._config.productName ||
      DEFAULT_PRODUCT_NAME;
    return productNameToMessageIdPrefix(product);
  }

  _resolveAuthorizationEndpoint() {
    const explicit = this._hub.authorization_endpoint;
    if (typeof explicit === 'string' && explicit.trim()) {
      return explicit.trim();
    }
    try {
      const tokenUrl = new URL(this._hub.token_endpoint);
      return `${tokenUrl.origin}/oauth/authorize`;
    } catch (err) {
      return '';
    }
  }

  _resolveHubOrigin() {
    try {
      return new URL(this._hub.hub_endpoint).origin;
    } catch (err) {
      try {
        return new URL(this._hub.token_endpoint).origin;
      } catch (err2) {
        return '';
      }
    }
  }

  async _fetchHubAuthConfig() {
    const origin = this._resolveHubOrigin();
    if (!origin) {
      return { mode: 'mock' };
    }
    try {
      const response = await fetch(`${origin}/api/hub/auth/config`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) {
        return { mode: 'mock' };
      }
      const data = await response.json();
      return data && typeof data === 'object' ? data : { mode: 'mock' };
    } catch (err) {
      console.debug('HubClient: auth/config unavailable; assuming mock mode');
      return { mode: 'mock' };
    }
  }

  _parseOidcHashTokens() {
    if (typeof window === 'undefined' || !window.location) {
      return null;
    }
    const hash = String(window.location.hash || '').replace(/^#/, '');
    if (!hash) {
      return null;
    }
    const params = new URLSearchParams(hash);
    if (params.get('hub_auth') !== 'oidc') {
      return null;
    }
    const accessToken = params.get('access_token') || '';
    if (!accessToken) {
      return null;
    }
    return {
      access_token: accessToken,
      id_token: params.get('id_token') || '',
      topic: params.get('topic') || '',
      user_name: params.get('user_name') || '',
      expires_in: params.get('expires_in') || '',
    };
  }

  _clearOidcHashFromUrl() {
    if (typeof window === 'undefined' || !window.history || !window.location) {
      return;
    }
    const url = `${window.location.pathname}${window.location.search}`;
    window.history.replaceState(null, '', url);
  }

  _applyOidcSessionTokens(tokens) {
    this._hub.token = tokens.access_token;
    if (tokens.id_token) {
      this._hub.lastIdToken = tokens.id_token;
    }
    this._hub.oidcSession = true;
    if (tokens.user_name) {
      this._session.userName = tokens.user_name;
    }
    if (tokens.topic && !this._config.preserveSessionTopicFromToken) {
      this.setTopic(tokens.topic);
    }
  }

  _websocketClose() {
    console.debug('HubClient: websocket is closed.');
    this._hub.resubscribeRequested = true;
    this._emitConnectionState('disconnected');
  }

  _processTextMessage(eventData) {
    try {
      const message = JSON.parse(eventData);
      if (message['hub.mode']) {
        return;
      }
      const event = message.event;
      if (!event || event['hub.event'] === 'heartbeat') {
        return;
      }
      if (message.id === this._hub.lastPublishedMessageID) {
        return;
      }
      if (this._onMessageCallback) {
        this._onMessageCallback(message);
      }
    } catch (err) {
      console.warn('HubClient: websocket processing error:', err);
    }
  }

  async _checkWebsocket() {
    if (
      this._hub.resubscribeRequested &&
      this._hub.subscribed &&
      this._config.autoReconnect
    ) {
      console.debug('HubClient: Try to resubscribe');
      this._hub.resubscribeRequested = false;
      const response = await this.subscribe();
      if (response !== 202) {
        this._hub.resubscribeRequested = true;
      }
    } else if (!this._hub.subscribed && this._hub.resubscribeRequested) {
      this._hub.resubscribeRequested = false;
    }
  }

  getConfig() {
    return this._config;
  }

  getHubConfig() {
    const hub = this._hub;
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
  }

  getSessionConfig() {
    const session = this._session;
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
  }

  getConnectionState() {
    const hub = this._hub;
    return {
      token: hub.token,
      subscribed: hub.subscribed,
      resubscribeRequested: hub.resubscribeRequested,
      websocket: hub.websocket,
      lastPublishedMessageID: hub.lastPublishedMessageID,
    };
  }

  setTopic(topic) {
    console.debug('HubClient: setting topic to', topic);
    this._session.topic = topic;
  }

  setToken(token) {
    this._hub.token = token;
  }

  setSubscriberName(subscriberName) {
    this._session.subscriberName = subscriberName;
  }

  setUserName(userName) {
    this._session.userName = userName || '';
  }

  async authenticate() {
    const fromHash = this._parseOidcHashTokens();
    if (fromHash) {
      this._applyOidcSessionTokens(fromHash);
      this._clearOidcHashFromUrl();
      console.debug('HubClient: Applied OIDC session tokens from redirect');
      return {
        user_name: fromHash.user_name || this._session.userName || '',
        code: '',
        expires_in: fromHash.expires_in
          ? Number(fromHash.expires_in) || undefined
          : undefined,
        mode: 'oidc',
        tokensReady: true,
      };
    }
    if (this._hub.oidcSession && this._hub.token) {
      return {
        user_name: this._session.userName || '',
        code: '',
        mode: 'oidc',
        tokensReady: true,
      };
    }

    const authConfig = await this._fetchHubAuthConfig();
    this._hub.authMode = authConfig.mode || 'mock';
    if (authConfig.mode === 'oidc') {
      if (typeof window === 'undefined' || !window.location) {
        throw new Error(
          'HubClient.authenticate: OIDC mode requires a browser environment'
        );
      }
      const loginBase =
        (typeof authConfig.login_url === 'string' &&
          authConfig.login_url.trim()) ||
        `${this._resolveHubOrigin()}/oauth/login`;
      const returnTo = `${window.location.origin}${window.location.pathname}${window.location.search}`;
      const loginUrl = `${loginBase}?return_to=${encodeURIComponent(returnTo)}`;
      console.debug('HubClient: Redirecting to OIDC login', loginUrl);
      window.location.assign(loginUrl);
      return {
        user_name: '',
        code: '',
        mode: 'oidc',
        redirecting: true,
      };
    }

    const endpoint = this._resolveAuthorizationEndpoint();
    if (!endpoint) {
      throw new Error(
        'HubClient.authenticate: no authorization_endpoint or token_endpoint configured.'
      );
    }
    try {
      const url = new URL(endpoint);
      console.debug('HubClient: Authorizing at:', `${url.origin}${url.pathname}`);
    } catch (err) {
      console.debug('HubClient: Authorizing at hub');
    }
    const productName =
      this._session.productName || this._config.productName || 'UNKNOWN';
    const formData = new URLSearchParams();
    if (this._hub.lastIdToken) {
      formData.append('id_token', this._hub.lastIdToken);
    } else if (this._session.userName) {
      formData.append('user_name', this._session.userName);
    }
    formData.append('client_product_name', productName);
    if (this._session.topic) {
      formData.append('topic', this._session.topic);
    }

    let response;
    try {
      response = await fetch(endpoint, {
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
      console.error('HubClient: Authenticate failed. Status:', response.status, text);
      throw new Error(`HubClient.authenticate failed (HTTP ${response.status})`);
    }
    const data = await response.json();
    if (typeof data.user_name === 'string' && data.user_name) {
      this._session.userName = data.user_name;
    }
    return {
      user_name: data.user_name || '',
      code: data.code || '',
      expires_in:
        typeof data.expires_in === 'number' ? data.expires_in : undefined,
      mode: 'mock',
    };
  }

  async getToken(code) {
    if (this._hub.oidcSession && this._hub.token) {
      if (this._config.autoStart) {
        this.subscribe();
      }
      return true;
    }
    const fromHash = this._parseOidcHashTokens();
    if (fromHash) {
      this._applyOidcSessionTokens(fromHash);
      this._clearOidcHashFromUrl();
      if (this._config.autoStart) {
        this.subscribe();
      }
      return !!this._hub.token;
    }
    if (typeof code !== 'string' || !code) {
      console.error(
        'HubClient.getToken: code is required (call authenticate() first).'
      );
      return false;
    }
    try {
      const url = new URL(this._hub.token_endpoint);
      console.debug('HubClient: Exchanging code at:', `${url.origin}${url.pathname}`);
    } catch (err) {
      console.debug('HubClient: Exchanging code at hub');
    }
    const formData = new URLSearchParams();
    formData.append('grant_type', 'authorization_code');
    formData.append('code', code);
    formData.append('client_id', this._hub.client_id || '');
    formData.append('client_secret', this._hub.client_secret || '');
    formData.append(
      'client_product_name',
      this._session.productName || this._config.productName || 'UNKNOWN'
    );
    try {
      const response = await fetch(this._hub.token_endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: formData,
      });
      if (response.status === 200) {
        const config = await response.json();
        if (typeof config.access_token === 'string' && config.access_token) {
          this._hub.token = config.access_token;
        }
        if (typeof config.id_token === 'string' && config.id_token) {
          this._hub.lastIdToken = config.id_token;
        }
        if (config.topic && typeof config.topic === 'string') {
          if (!this._config.preserveSessionTopicFromToken) {
            this.setTopic(config.topic);
          }
          if (this._config.autoStart) {
            this.subscribe();
          }
        }
        return !!this._hub.token;
      }
      await response.text();
      console.error('HubClient: Error getting token. Status:', response.status);
      return false;
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.error('HubClient: Exception getting token:', message);
      return false;
    }
  }

  async connect() {
    const authResult = await this.authenticate();
    if (authResult?.redirecting) {
      return authResult;
    }
    if (!authResult?.tokensReady) {
      const previousAutoStart = this._config.autoStart;
      this._config.autoStart = false;
      let tokenReady = false;
      try {
        tokenReady = await this.getToken(authResult?.code || '');
      } finally {
        this._config.autoStart = previousAutoStart;
      }
      if (!tokenReady) {
        return false;
      }
    }
    return this.subscribe();
  }

  async subscribe(fromAuthRetry = false) {
    const topic = this._session.topic && this._session.topic.trim();
    if (!topic) {
      console.warn('HubClient: Error. subscription not sent. No topic defined.');
      return 'error: topic not defined';
    }
    if (
      !this._session.subscriberName ||
      !String(this._session.subscriberName).trim()
    ) {
      this._session.subscriberName = generateSubscriberName(
        this._session.productName || this._config.productName || 'UNKNOWN'
      );
    }
    if (!this._hub.token) {
      console.warn('HubClient: Error. subscription not sent. No token available.');
      return 'error: no token';
    }
    const callbackUrl = buildHubCallbackUrl(this._config.callbackUrl);
    const formData = buildHubModeFormData(
      'subscribe',
      { ...this._session, topic, subscriberName: this._session.subscriberName },
      callbackUrl,
      this._config.productVersion
    );
    try {
      this._emitConnectionState('connecting');
      const response = await fetch(this._hub.hub_endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${this._hub.token}`,
        },
        body: formData,
        signal:
          typeof AbortSignal !== 'undefined' && AbortSignal.timeout
            ? AbortSignal.timeout(SUBSCRIBE_TIMEOUT_MS)
            : undefined,
      });
      if (response.status === 202) {
        this._hub.resubscribeRequested = false;
        let subscriptionResponse;
        try {
          subscriptionResponse = await response.json();
        } catch (err) {
          this._hub.subscribed = false;
          console.error(
            'HubClient: Subscribe 202 body was not valid JSON:',
            err instanceof Error ? err.message : String(err)
          );
          this._emitConnectionState('error');
          return 0;
        }
        const websocketUrl = subscriptionResponse['hub.channel.endpoint'];
        if (!websocketUrl || typeof websocketUrl !== 'string') {
          this._hub.subscribed = false;
          console.error('HubClient: Subscribe 202 missing hub.channel.endpoint');
          this._emitConnectionState('error');
          return 0;
        }
        let normalizedUrl = websocketUrl;
        try {
          const hubUrl = new URL(this._hub.hub_endpoint);
          const wsUrl = new URL(websocketUrl);
          normalizedUrl = websocketUrl.replace(
            wsUrl.origin,
            `${hubUrl.protocol === 'https:' ? 'wss:' : 'ws:'}//${hubUrl.host}`
          );
        } catch (err) {
          // Use the original URL.
        }
        if (this._hub.websocket) {
          try {
            this._hub.websocket.removeEventListener('close', this._websocketClose);
            this._hub.websocket.close();
          } catch (err) {
            // Ignore stale socket cleanup errors.
          }
          this._hub.websocket = null;
        }
        let socket;
        try {
          socket = new WebSocket(normalizedUrl);
        } catch (err) {
          this._hub.subscribed = false;
          console.error(
            'HubClient: Failed to open WebSocket after subscribe:',
            err instanceof Error ? err.message : String(err)
          );
          this._emitConnectionState('error');
          return 0;
        }
        this._hub.subscribed = true;
        this._hub.websocket = socket;
        socket.onopen = () => {
          socket.send(JSON.stringify({ 'hub.channel.endpoint': normalizedUrl }));
          this._emitConnectionState('connected');
        };
        socket.addEventListener('message', (event) => {
          if (typeof event.data === 'string') {
            this._processTextMessage(event.data);
          }
        });
        socket.addEventListener('close', this._websocketClose);
        socket.onerror = () => {
          console.warn('HubClient: Error reported on websocket');
          this._emitConnectionState('error');
        };
        return response.status;
      }
      if (response.status === 401) {
        console.warn('HubClient: Subscription response 401 - Token refresh needed.');
        if (fromAuthRetry) {
          return response.status;
        }
        try {
          const { code } = await this.authenticate();
          if (code && (await this.getToken(code))) {
            return await this.subscribe(true);
          }
        } catch (err) {
          console.error(
            'HubClient: Token refresh after 401 failed:',
            err instanceof Error ? err.message : String(err)
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
      this._hub.subscribed = false;
      console.error(
        'HubClient: Exception subscribing to the hub:',
        err instanceof Error ? err.message : String(err)
      );
      return 0;
    }
  }

  async unsubscribe() {
    this._hub.subscribed = false;
    this._hub.resubscribeRequested = false;
    const formData = buildHubModeFormData(
      'unsubscribe',
      this._session,
      buildHubCallbackUrl(this._config.callbackUrl),
      this._config.productVersion
    );
    try {
      const response = await fetch(this._hub.hub_endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${this._hub.token}`,
        },
        body: formData,
        signal:
          typeof AbortSignal !== 'undefined' && AbortSignal.timeout
            ? AbortSignal.timeout(SUBSCRIBE_TIMEOUT_MS)
            : undefined,
      });
      if (response.status === 202) {
        console.debug('HubClient: Unsubscribe successfully from hub', this._hub.name);
      }
    } catch (err) {
      console.warn(
        'HubClient: Error unsubscribing from the hub.',
        err instanceof Error ? err.message : String(err)
      );
    }
    this._closeWebsocket();
    this._emitConnectionState('disconnected');
  }

  _closeWebsocket() {
    if (this._hub.websocket) {
      this._hub.websocket.close();
      this._hub.websocket = null;
    }
  }

  async close({ hubUnsubscribe = true } = {}) {
    if (this._reconnectInterval) {
      clearInterval(this._reconnectInterval);
      this._reconnectInterval = null;
    }
    if (hubUnsubscribe) {
      await this.unsubscribe();
    } else {
      this._hub.subscribed = false;
      this._hub.resubscribeRequested = false;
      this._closeWebsocket();
      this._emitConnectionState('disconnected');
    }
  }

  delete() {
    return this.close();
  }

  async rebindUserName(userName) {
    const next = String(userName || '').trim();
    if (!next) {
      throw new Error('HubClient.rebindUserName: user name is required');
    }
    const currentName = String(this._session.userName || '').trim();
    const currentTopic = String(this._session.topic || '').trim();
    if (
      next === currentName &&
      (currentTopic === next || currentTopic === currentName) &&
      this._hub.subscribed
    ) {
      return { user_name: currentName, topic: currentTopic, status: 202 };
    }
    await this.unsubscribe();
    this._hub.lastIdToken = '';
    this.setUserName(next);
    this.setTopic('');
    const result = await this.authenticate();
    const { code, user_name: authorizedName, tokensReady, redirecting } =
      result || {};
    if (redirecting) {
      throw new Error(
        'HubClient.rebindUserName: OIDC redirect in progress; complete login in the browser'
      );
    }
    if (!tokensReady && !code) {
      throw new Error('HubClient.rebindUserName: authenticate failed');
    }
    const previousAutoStart = this._config.autoStart;
    this._config.autoStart = false;
    let ok = false;
    try {
      ok = await this.getToken(code || '');
    } finally {
      this._config.autoStart = previousAutoStart;
    }
    if (!ok) {
      throw new Error('HubClient.rebindUserName: token exchange failed');
    }
    const status = await this.subscribe();
    return {
      user_name:
        String(authorizedName || this._session.userName || next).trim() || next,
      topic: String(this._session.topic || '').trim(),
      status,
    };
  }

  _preparePublishMessage(message, hub = this._hub) {
    const msg = { ...message, timestamp: new Date().toJSON() };
    msg.id = generateMessageId(this._messageIdPrefix());
    hub.lastPublishedMessageID = msg.id;
    const subscriberName =
      this._session.subscriberName && this._session.subscriberName.trim();
    const productName =
      this._session.productName && this._session.productName.trim();
    if (subscriberName && msg['subscriber.name'] === undefined) {
      msg['subscriber.name'] = subscriberName;
    }
    if (productName && msg['subscriber.product.name'] === undefined) {
      msg['subscriber.product.name'] = productName;
    }
    if (msg.event && !msg.event['hub.topic']) {
      msg.event['hub.topic'] = this._session.topic;
    }
    if (msg['target.actor'] === undefined && this._session.defaultTargetActor) {
      const targetSubscriber = String(msg['target.subscriber.name'] || '').trim();
      if (!targetSubscriber) {
        const wireTarget = resolveTargetActorForWire(
          this._session.defaultTargetActor
        );
        if (wireTarget) {
          msg['target.actor'] = wireTarget;
        }
      }
    }
    return msg;
  }

  fetchPayload(message) {
    return this._payloadFetchApi.fetchPayload(message);
  }

  fetchAllPayloads(message) {
    return this._payloadFetchApi.fetchAllPayloads(message);
  }

  hasPendingPayload(message) {
    return this._payloadFetchApi.hasPendingPayload(message);
  }

  async publishMultipart(message, fileBytes, hub = this._hub) {
    let msg = this._preparePublishMessage(message, hub);
    const raw = await toArrayBufferStrict(fileBytes);
    msg = coerceBinaryPublishToFiles(msg);
    let files = await extractBinaryBatchFileBytes(msg);
    if (!files.length) {
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
      files = [raw];
    }
    return this.publishBinaryBatch(msg, files, hub);
  }

  async publishBinaryBatch(message, fileBytesList, hub = this._hub) {
    const msg = coerceBinaryPublishToFiles(
      this._preparePublishMessage(message, hub)
    );
    return postBinaryBatchPublish({
      msg,
      fileBytesList,
      hub,
      messageIdPrefix: () => this._messageIdPrefix(),
    });
  }

  async publish(message, hub = this._hub) {
    let msg = this._preparePublishMessage(message, hub);
    msg = coerceBinaryPublishToFiles(msg);
    if (messageNeedsBinaryBatchPublish(msg)) {
      const files = await extractBinaryBatchFileBytes(msg);
      if (files.length) {
        return this.publishBinaryBatch(msg, files, hub);
      }
    }
    try {
      return await fetch(hub.hub_endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${hub.token}`,
        },
        body: JSON.stringify(msg),
      });
    } catch (err) {
      console.debug('HubClient:', err instanceof Error ? err.message : String(err));
      return null;
    }
  }

  publishNiftiMultipart(message, fileBytes, hub) {
    return this.publishBinaryBatch(message, [fileBytes], hub);
  }

  async request(args = {}) {
    const subscriber = String(args['subscriber.name'] || '').trim();
    if (!subscriber) {
      throw new Error('HubClient.request: "subscriber.name" is required.');
    }
    const token = this._hub.token && this._hub.token.trim();
    if (!token) {
      throw new Error(
        'HubClient.request: token is required (call authenticate() then getToken(code) first).'
      );
    }
    const body = {
      'subscriber.name': subscriber,
      id:
        (args.id && String(args.id).trim()) ||
        generateMessageId(this._messageIdPrefix()),
      timestamp:
        (args.timestamp && String(args.timestamp).trim()) || new Date().toJSON(),
    };
    if (args.event && typeof args.event === 'object') {
      body.event = { ...args.event };
      const topic = this._session.topic && String(this._session.topic).trim();
      if (topic && !body.event['hub.topic']) {
        body.event['hub.topic'] = topic;
      }
    } else {
      throw new Error('HubClient.request: "event" with hub.event is required.');
    }
    if (!body.event['hub.event'] || !String(body.event['hub.event']).trim()) {
      throw new Error(
        'HubClient.request: event["hub.event"] must be a *-request event name.'
      );
    }
    if (args['subscriber.actor'] && String(args['subscriber.actor']).trim()) {
      body['subscriber.actor'] = String(args['subscriber.actor']).trim();
    }
    const hasTarget = Object.prototype.hasOwnProperty.call(args, 'target.actor');
    let target = hasTarget
      ? resolveTargetActorForWire(args['target.actor'])
      : undefined;
    if (
      target === undefined &&
      !hasTarget &&
      this._session.defaultTargetActor
    ) {
      target = resolveTargetActorForWire(this._session.defaultTargetActor);
    }
    if (target !== undefined) {
      body['target.actor'] = target;
    }
    const targetProduct =
      args['target.product.name'] !== undefined
        ? args['target.product.name']
        : args.targetProductName;
    const wireProduct = resolveTargetProductNameForWire(targetProduct);
    if (wireProduct !== undefined) {
      body['target.product.name'] = wireProduct;
    }
    const response = await fetch(
      (this._hub.hub_endpoint || '').replace(/\/+$/, ''),
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      }
    );
    let data;
    if ((response.headers.get('content-type') || '').includes('application/json')) {
      try {
        data = await response.json();
      } catch (err) {
        data = '';
      }
    } else {
      data = await response.text();
    }
    return { ok: response.ok, status: response.status, data };
  }

  sendHubRequestResponse(id, dataType, data, topic) {
    if (
      !this._hub.websocket ||
      typeof WebSocket === 'undefined' ||
      this._hub.websocket.readyState !== WebSocket.OPEN
    ) {
      return;
    }
    const dt =
      typeof dataType === 'string'
        ? dataType.trim()
        : dataType == null
          ? ''
          : String(dataType).trim();
    if (!dt) {
      console.error(
        'HubClient.sendHubRequestResponse requires a non-empty dataType.'
      );
      return;
    }
    const response = {
      timestamp: new Date().toJSON(),
      id: generateMessageId(this._messageIdPrefix()),
      'subscriber.name': this._session.subscriberName || undefined,
      'subscriber.product.name': this._session.productName || undefined,
      event: {
        'hub.topic': topic || this._session.topic,
        'hub.event': responseEventFor(dt),
        context: { id, dataType: dt, data },
      },
    };
    if (Array.isArray(this._session.actors) && this._session.actors.length) {
      response.actor = this._session.actors[0];
    }
    this._hub.websocket.send(JSON.stringify(response));
  }

  sendCastRequestResponse(id, dataType, data, topic) {
    return this.sendHubRequestResponse(id, dataType, data, topic);
  }
}

export const newInstance = (initialValues) =>
  HubClient.newInstance(initialValues);

export default HubClient;
