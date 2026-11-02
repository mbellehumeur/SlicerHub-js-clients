#!/usr/bin/env node
/**
 * Smoke: two HubClient sessions — subscribe, publish, receive, STATUS, dicom-send.
 * Requires a local hub on :2018.
 */

import HubClient, {
  IMAGINGSTUDY_CLOSE,
  generateSubscriberName,
  normalizeDataType,
  requestEventFor,
} from '@slicer-hub/client';
import {
  SMOKE_PRODUCT,
  SMOKE_TOPIC,
  SMOKE_USER,
  buildLocalHubConfig,
} from '../common/localHub.js';

function getHubEventName(message) {
  const event = message?.event;
  const name = event?.['hub.event'];
  return typeof name === 'string' ? name.trim().toLowerCase() : '';
}

async function connectClient(label, events, { useAuthenticateOnly = false } = {}) {
  const hub = buildLocalHubConfig();
  const subscriberName = generateSubscriberName(`${SMOKE_PRODUCT}-${label}`);
  const client = HubClient.newInstance({
    hub,
    session: {
      topic: SMOKE_TOPIC,
      subscriberName,
      productName: SMOKE_PRODUCT,
      productVersion: '1.0',
      actors: ['ID'],
      events,
      userName: SMOKE_USER,
      lease: 999,
    },
    autoReconnect: false,
    autoStart: false,
  });

  const { code } = await client.authenticate();
  if (!code || !String(code).trim()) {
    throw new Error(`${label}: authenticate returned no code`);
  }
  const tokenOk = await client.getToken(code);
  if (!tokenOk) {
    throw new Error(`${label}: getToken failed`);
  }
  const status = await client.subscribe();
  if (Number(status) !== 202) {
    throw new Error(`${label}: subscribe HTTP ${status}`);
  }
  const conn = client.getConnectionState();
  if (!conn.subscribed || !conn.token) {
    throw new Error(`${label}: expected subscribed and token`);
  }
  const session = client.getSessionConfig();
  if (session.subscriberName !== subscriberName) {
    throw new Error(`${label}: subscriberName mismatch`);
  }
  if (session.topic !== SMOKE_TOPIC) {
    throw new Error(`${label}: topic mismatch`);
  }
  // useAuthenticateOnly reserved for parity with Python's use_connect path.
  void useAuthenticateOnly;
  console.log(`OK ${label} subscribed as ${session.subscriberName}`);
  return client;
}

function awaitEvent(client, wantEvent, timeoutMs = 8000) {
  const want = String(wantEvent).trim().toLowerCase();
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      cleanup();
      reject(new Error(`timed out waiting for ${wantEvent}`));
    }, timeoutMs);

    const onMessage = (message) => {
      if (getHubEventName(message) === want) {
        cleanup();
        resolve(message);
      }
    };

    function cleanup() {
      clearTimeout(timer);
      client.onMessage(null);
    }

    client.onMessage(onMessage);
  });
}

async function run() {
  if (typeof WebSocket === 'undefined') {
    throw new Error(
      'WebSocket is not available in this Node runtime (need Node with global WebSocket)'
    );
  }

  const sub = await connectClient('sub', ['*']);
  const pub = await connectClient('pub', ['*']);
  try {
    const waitClose = awaitEvent(sub, IMAGINGSTUDY_CLOSE);
    const closeMsg = {
      event: {
        'hub.topic': SMOKE_TOPIC,
        'hub.event': IMAGINGSTUDY_CLOSE,
        context: [],
      },
    };
    const pubResponse = await pub.publish(closeMsg);
    const pubStatus = pubResponse?.status;
    console.log(`OK publish imagingstudy-close http=${pubStatus}`);
    const received = await waitClose;
    console.log(`OK sub received imagingstudy-close id=${received?.id}`);

    const dataType = normalizeDataType('status');
    const result = await pub.request({
      'subscriber.name': pub.getSessionConfig().subscriberName,
      'target.actor': '*',
      event: {
        'hub.topic': SMOKE_TOPIC,
        'hub.event': requestEventFor(dataType),
        context: { dataType },
      },
    });
    if (!result?.ok) {
      throw new Error(`STATUS request failed: ${JSON.stringify(result)}`);
    }
    console.log(`OK STATUS request status=${result.status}`);

    const dicomBytes = new Uint8Array(68);
    dicomBytes.set([0x44, 0x49, 0x43, 0x4d]);

    const waitDicom = awaitEvent(sub, 'dicom-send');
    const dicomMsg = {
      event: {
        'hub.topic': SMOKE_TOPIC,
        'hub.event': 'dicom-send',
        context: {
          files: [
            {
              fileName: 'smoke.dcm',
              mimeType: 'application/dicom',
              data: dicomBytes,
            },
          ],
        },
      },
    };
    const dicomResponse = await pub.publish(dicomMsg);
    const dicomStatus = dicomResponse?.status;
    console.log(`OK publish dicom-send http=${dicomStatus}`);
    if (!dicomResponse || dicomStatus < 200 || dicomStatus >= 300) {
      const detail = dicomResponse
        ? await dicomResponse.text().catch(() => '')
        : 'no response';
      throw new Error(`dicom-send publish failed http=${dicomStatus}: ${detail}`);
    }
    const got = await waitDicom;
    console.log(`OK sub received dicom-send id=${got?.id}`);
  } finally {
    await pub.unsubscribe();
    await sub.unsubscribe();
  }
}

try {
  await run();
  console.log('PASS smoke_client_pubsub');
  process.exit(0);
} catch (err) {
  console.error(`FAIL smoke_client_pubsub: ${err?.message || err}`);
  process.exit(1);
}
